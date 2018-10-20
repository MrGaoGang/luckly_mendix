package processqueue.queuehandler;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import processqueue.proxies.ActionStatus;
import processqueue.proxies.LogExecutionStatus;
import processqueue.proxies.LogReason;
import processqueue.proxies.Process;
import processqueue.proxies.QueuedAction;
import processqueue.proxies.microflows.Microflows;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixIdentifier;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * This class is responsible for executing the configured Microflow and updating the QueuedAction object afterwards with the correct status.
 * @authors JvdH and KJP
 *
 */
public class ObjectQueueExecutor implements Runnable {

	private static final ILogNode _logNode = Core.getLogger("QueueExecutor");
	private final IContext context;
	private String microflowName;
	private IMendixObject action;
	private long QAGuid;
	private long actionNr;
	private State _state = State.initiated;
	
	public enum State {
		initiated,
		preparingData,
		reAddedToQueue, 
		executingMicroflow, 
		executionComplete, 
		executionFailed,
		executionStatusUpdated,
		initiatingFollowup,
		finishedFollowup,
		failed,
		threadFinished;
	}

	public ObjectQueueExecutor( IContext context, IMendixObject action, IMendixObject process ) throws CoreException 
	{
		this.context = context;
		this.QAGuid = action.getId().toLong();
		this.actionNr = action.getValue(this.context, QueuedAction.MemberNames.ActionNumber.toString());
		this.microflowName = (String) process.getValue(this.context, Process.MemberNames.MicroflowFullname.toString());
		
		this.action = action;
		this.action.setValue(this.context, QueuedAction.MemberNames.Phase.toString(), ActionStatus.Queued.toString());
		
		// Based on ticket #56473: so status changes always get updated in the client as soon as possible.
		// E.g. actions being set to "Queued".
		Core.commit(this.context, this.action);
	}
	
	public void initializeAction(ActionStatus phase, LogExecutionStatus status ) {
		this.action.setValue(this.context, QueuedAction.MemberNames.Phase.toString(), phase.toString());
		this.action.setValue(this.context, QueuedAction.MemberNames.Status.toString(), status.toString());
		this.action.setValue(this.context, QueuedAction.MemberNames.StartTime.toString(), new Date());
		
		try {
			Core.commit( this.context, this.action );
		} catch (CoreException e) {
			_logNode.error("Error while trying to commit QueuedAction " + this.action.getValue(this.context, QueuedAction.MemberNames.ActionNumber.toString()) + " from queue", e);		
		}
	}

	public void setQueueNumber(int queueNr) {
		this.action.setValue(this.context, QueuedAction.MemberNames.QueueNumber.toString(), queueNr);
	}
	
	
	@Override
	public synchronized void run() 
	{ // run the service		
		try {
			
			this._state = State.preparingData;
			
			List<IMendixObject> qaResult = Core.retrieveXPathQuery(this.context, "//" + QueuedAction.getType() + "[ID=" + this.QAGuid + "]");
			
			if( qaResult.size() == 0 ) {
				/* 	this means that either the action is not available in the database yet due to a high application load or it means the
				* 	microflow creating this action has not successfully completed causing a rollback and the queued action is not committed
				* 	(and never will be) because of that. Personally I dislike the rescheduling option as this screws up the FIFO order. 
				*   It also turns out to be very difficult to distinct between a rollback and a delay.
				*   As such I feel like skipping the action is the superior approach. 
				*   As this will also avoid actions waiting indefinitely
				* 	in the queue in case the microflow creating them failed to execute successfully.
				* 	And it will also avoid false positives for rollbacked actions causing those actions to be remain in unqueued status
				* 	forever.
				* 
				* 	For more background info refer to ticket 44229: https://mendixsupport.zendesk.com/agent/tickets/44229
				* 
				* 	Core.retrieveIdList is used to avoid a warning in the log (this happens when Core.retrieveId returns nothing).
				*
				*  	- JPU (Dec 05, 2016)
				*/			
				String errorMessage = "QueuedAction: [" + this.QAGuid + "] is not available in the database "
						+ "(caused by high application load or rollback) so the QueuedAction is being skipped.";
	
				this._state = State.failed;
				
				this.action = Core.retrieveId(this.context, Core.createMendixIdentifier(this.QAGuid));
				
				if (this.action != null) // else allow the user to handle this event
					setErrormessageAndCommit(this.context, this.action, errorMessage, null, LogExecutionStatus.Skipped, ActionStatus.Cancelled );
				else {
					_logNode.info(errorMessage);
					Microflows.sUB_ProcessQueue_NoActionFoundErrorHandler(context, errorMessage);
				}
			}
			else {
				this.action = qaResult.get(0);
				
				_logNode.debug("Running QueuedAction: [" + this.QAGuid + "]");
				// Set the action as busy.

				initializeAction(ActionStatus.Running, LogExecutionStatus.While_Executing);
				this._state = State.executingMicroflow;
				Boolean microflowResult = null;  //Initialize the variable with false, in case the microflow throws an exception we want it to be value: false
				try 
				{
					// Start the microflow of the action.
					this.context.startTransaction();
					try {
						Object booleanResult = Core.execute(this.context, this.microflowName, this.action);

						this._state = State.executionComplete;
						
						// Analyse the result of the microflow.
						if (booleanResult instanceof Boolean) {
							microflowResult = (Boolean) booleanResult;
						}
						else 
							microflowResult = true;

					} catch (Exception e) {
						this._state = State.executionFailed;
						this.context.rollbackTransAction();
						_logNode.error("Error while executing: " + this.microflowName + " from the queue", e);
						setErrormessageAndCommit(this.context, this.action, "Error occured while executing the process, error:" + e.getMessage(), e, LogExecutionStatus.FailedExecuted, ( microflowResult != null && microflowResult ? ActionStatus.Finished : ActionStatus.Cancelled) );
					} finally {
						this.context.endTransaction();
						
						// should not be possible, but there are some concerns this happens on occasion.
						if (this.context.isInTransaction())
							_logNode.error("Error while closing transaction for action id: " + this.actionNr);
					}
					
					if( microflowResult != null ) {
						if ( microflowResult == true ) {
							setExecutionLog(LogExecutionStatus.SuccesExecuted, ActionStatus.Finished);
						} else {
							setExecutionLog(LogExecutionStatus.FailedExecuted, ActionStatus.Cancelled);
						}
					}
					this._state = State.executionStatusUpdated;
					
					
					// Analyze whether a new follow up action should be started.
					List<IMendixObject> followUpResult = Core.retrieveXPathQuery(this.context, "//" + QueuedAction.getType() + "[" + QueuedAction.MemberNames.FollowupAction_PreviousAction + "=" + this.QAGuid + "]" );
					for( IMendixObject followUpAction : followUpResult )
					{
						_logNode.debug("Triggering next action: " + followUpAction.getValue(this.context, QueuedAction.MemberNames.ActionNumber.toString()) +  " in queue");

						this._state = State.initiatingFollowup;
						IMendixIdentifier processId = followUpAction.getValue(this.context, QueuedAction.MemberNames.QueuedAction_Process.toString());
						if( processId != null ) { 
							IMendixObject processObj = Core.retrieveId(this.context, processId);
							QueueHandler.getQueueHandler().appendActionForProcessing(this.context, followUpAction, processObj, true);
						}
						else {
							setErrormessageAndCommit(this.context, followUpAction, "No process found for the action", null, LogExecutionStatus.FailedExecuted, ActionStatus.Cancelled);
						}
						this._state = State.finishedFollowup;
					}
				} catch (CoreException e) {
					_logNode.info("Error during commit from queue", e);
					setErrormessageAndCommit(this.context, this.action, "An unknown error occured. Please contact your system administrator.", e, LogExecutionStatus.FailedExecuted, ActionStatus.Cancelled);
				}
			}
		} catch (Exception e) {
			this._state = State.failed;
			// Microflow is being rollbacked
			_logNode.error("Error during committing errormessage from queue", e);
			setErrormessageAndCommit(this.context, this.action, "An unknown error occured. Please contact your system administrator.", e, LogExecutionStatus.FailedExecuted, ActionStatus.Cancelled);
		}
		finally {
			this._state = State.threadFinished;
		}
	}
	

	private static void setErrormessageAndCommit(IContext context, IMendixObject queuedAction, String error, Exception stacktrace, LogExecutionStatus status, ActionStatus phase) 
	{
		try 
		{
			_logNode.debug("Exception: ", stacktrace);

			HashMap<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("QueuedAction", queuedAction);
			paramMap.put("LogExecutionStatus", status.toString());
			paramMap.put("LogReason", LogReason.Exception.toString());
			paramMap.put("ErrorMessage", error);
			paramMap.put("StackTrace", stackTraceToString(stacktrace));
			paramMap.put("Phase", phase.toString());
			Core.execute(context, "ProcessQueue.SF_WriteExecutionLog", paramMap);
		} catch (CoreException e) {
			_logNode.error("Error while setting log message with stacktrace and error message", e);
		}
	}
	
	private void setExecutionLog(LogExecutionStatus status, ActionStatus phase)
	{
		try 
		{
			HashMap<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("QueuedAction", this.action);
			paramMap.put("LogExecutionStatus", status.toString());
			paramMap.put("LogReason", LogReason.Notification.toString());
			paramMap.put("ErrorMessage", null);
			paramMap.put("StackTrace", null);
			paramMap.put("Phase", phase.toString());
			
			Core.execute(this.context, "ProcessQueue.SF_WriteExecutionLog", paramMap);
		} catch (CoreException e) {
			_logNode.error("Error while setting execution log status: " + status , e);
		}
	}
	
	/**
	 * Converts a stracktrace to a readable string 
	 * @param stacktrace
	 * @return
	 */
	public static String stackTraceToString(Exception stacktrace) {
		if( stacktrace == null )
			return "";
		try {
			StringWriter sw = new StringWriter();
	        PrintWriter pw = new PrintWriter(sw, true);
	        stacktrace.printStackTrace(pw);
	        pw.flush();
	        sw.flush();
			
			return sw.toString();
		} catch (Exception e) {
			_logNode.info("Error while analysing a stacktrace", e);
			return "";
		}
		
	}

	public State getState() {
		return this._state;
	}
	
	public long getActionNr() {
		return this.actionNr;
	}
	public String getMicroflowName() {
		return this.microflowName;
	}
}