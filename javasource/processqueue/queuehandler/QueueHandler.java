
package processqueue.queuehandler;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

import processqueue.proxies.LogExecutionStatus;
import processqueue.proxies.Process;
import processqueue.proxies.QueuedAction;
import processqueue.proxies.SharedQueueConfiguration;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixIdentifier;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * This class manages all the different Queue's.
 * There should only exist one single instance of this class, that class keeps track of all Queues and appends new actions to it. 
 * @authors JvdH and KJP
 *
 */
public class QueueHandler {

	/**
	 * The map containing all running Queues, the key of the map is the unique Queue number. Which is the ReferenceNumber attribute of the QueueConfig
	 * These ThreadPoolExecutors keep track of all Queued actions and start executing them.
	 */
	private static HashMap<Long, ThreadPoolExecutor> queueMap = new HashMap<Long, ThreadPoolExecutor>();
	/**  To prevent unnecessary retrieves to acquire the correct Queue number for the process this map keeps track of the different processes and Queues they belong to.
	 *   The key of the map is the Guid for the process and its value is the Queue reference number  
	 */
	private static HashMap<Long, Long> processQueueConfig = new HashMap<Long, Long>();
	
	private static List<QueueAction> queueActionList = Collections.synchronizedList(new ArrayList<QueueAction>());
	private static Map<Long, QueueAction> queueActionMap = new TreeMap<Long, QueueAction>();
		
//	private boolean running = false;
	private static ILogNode _node = Core.getLogger("QueueHandler");
		
	private static QueueHandler _handler;
	private static QueueAppender _queueAppender;
	
	/**
	 * @return The instance of the QueueHandler
	 */
	public static QueueHandler getQueueHandler()
	{		
		if (_queueAppender == null || _queueAppender.isAlive()==false) {
         	_queueAppender = new QueueAppender();
         	_queueAppender.setDaemon(true);
         	_queueAppender.start();
		}		
		
		if ( _handler == null)
		{
         	_handler = new QueueHandler();
         	_node.debug("Create new Queue Handler");
		} 
		return _handler;
    }
	
//	public boolean isRunning(){
//		return this.running;
//	}
	
	/**
	 * Stop all running and scheduled Queued actions. 
	 * Depending on the boolean parameter it throws an exception in the executing microflow or waits for it to finish without starting new actions.
	 * When shutting down gracefully is true the Queue waits for the Actions to finish.
	 * 
	 * @param gracefully
	 */
	public void stopProcess( boolean gracefully ) {
		_node.info("Stopping running process");
//		this.running = false;
		for( Entry<Long, ThreadPoolExecutor> entry : queueMap.entrySet() ) {
			if( gracefully )
				entry.getValue().shutdown();
			else 
				entry.getValue().shutdownNow();
		}
		_node.debug("All pools are stopped");
	}

	public void stopProcess(IContext context, IMendixObject queueConfiguration, Boolean gracefully) {
		Long queueNr = queueConfiguration.getValue(context, SharedQueueConfiguration.MemberNames.QueueRefNr.toString());
		
		_node.trace("Shutting down queue: " + queueNr);
		ThreadPoolExecutor queue = queueMap.remove(queueNr);
		if( queue == null )
			_node.error("Unable to locate queue: " + queueNr + ". Is this queue running?");
		else {
			if( gracefully )
				queue.shutdown();
			else
				queue.shutdownNow();
		}
		_node.debug("Queue: " + queueNr + " is stopped " + (gracefully ? "gracefully": ""));
	}
	
	/**
	 * Initialize the Queue using all configuration options specified in the entity. 
	 * This prepares the Queue so actions can be added.
	 * @param context
	 * @param queueConfiguration
	 * @throws CoreException 
	 */
	public void initializeQueue( IContext context, IMendixObject queueConfiguration ) throws CoreException {
		_node.debug("Start initializing queue");
		Long queueNr = queueConfiguration.getValue(context, SharedQueueConfiguration.MemberNames.QueueRefNr.toString());
		Integer nrOfThreads = queueConfiguration.getValue(context, SharedQueueConfiguration.MemberNames.NumberOfThreads.toString());
		String queueName = queueConfiguration.getValue(context, SharedQueueConfiguration.MemberNames.QueueName.toString());
		Integer threadAffinity = queueConfiguration.getValue(context, SharedQueueConfiguration.MemberNames.ThreadAffinity.toString());
		
		_node.trace("Starting with values queuenr: " + queueNr + " nr of threads "+ nrOfThreads);

	       ThreadFactory customThreadFactory = new ThreadFactoryBuilder()
           .setNamePrefix(queueName).setDaemon(false)
           .setPriority(threadAffinity)
           .build();
				
	       _node.info("(Re)setting pool with number: "+ queueNr);
	       /* 
			 * Create a FixedThreadPool, this ThreadPool limits the number of threads. 
			 * Unless specified there should be no limit on the Queue and neither will keep it processes waiting until a spot in the Queue opens op.
			 * 
			 * Most other configuration options will keep the appending processes waiting in case the Queue becomes fuller
			 */
			ThreadPoolExecutor tPool = new ThreadPoolExecutor(nrOfThreads, nrOfThreads,
                    Long.MAX_VALUE, TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<Runnable>(),
                    customThreadFactory);

			queueMap.put(queueNr, tPool);
	}
	
	/**
	 * Append the new action to the Queue, based on the configured process the action will be appended to the correct Queue.
	 * When an action is a follow-up action the Queue will make sure it only starts scheduling the actions without dependencies, once finished all dependent actions will be added to the Queue as well.
	 * 
	 * @param actionObject
	 * @param process
	 * @param overrideFollowUp  :  if this parameter is true the action will be added directly to the regardless of its dependencies
	 * @throws CoreException
	 */
	public synchronized void appendActionForProcessing( IContext context, IMendixObject actionObject, IMendixObject process, boolean overrideFollowUp ) throws CoreException {
		QueueAction action = new QueueAction(	context, 
												actionObject.getValue(context, QueuedAction.MemberNames.ActionNumber.toString()), 
												actionObject, 
												process, 
												overrideFollowUp
											);
		synchronized(queueActionList) {
			queueActionList.add(action);
		}
	}
	
	/**
	 * Append the new action to the Queue, based on the configured process the action will be appended to the correct Queue.
	 * When an action is a follow-up action the Queue will make sure it only starts scheduling the actions without dependencies, once finished all dependent actions will be added to the Queue as well.
	 * 
	 * @param actionObject
	 * @param process
	 * @param overrideFollowUp  :  if this parameter is true the action will be added directly to the regardless of its dependencies
	 * @throws CoreException
	 */
	public synchronized static void addActionToQueue( IContext context, IMendixObject actionObject, IMendixObject process, boolean overrideFollowUp ) throws CoreException {

		Long queueNr = processQueueConfig.get( process.getId().toLong());
		//In case the queue number isn't cached yet, just retrieve the associated QueueConfiguration to acquire the correct queue number 
		if( queueNr == null ) {                    
			IMendixIdentifier queueId = process.getValue(context, Process.MemberNames.Process_QueueConfiguration.toString());
			IMendixObject queue = Core.retrieveId(context, queueId);
			
			//Validate that the microflow actually exists so we can throw an exception on initialization instead of while running
			String microflowName = (String) process.getValue(context, Process.MemberNames.MicroflowFullname.toString());
			if( !Core.getMicroflowNames().contains(microflowName) )
				throw new CoreException("Unable to schedule queued action: " + actionObject.getValue(context, QueuedAction.MemberNames.ActionNumber.toString()) + " / " + actionObject.getValue(context, QueuedAction.MemberNames.ReferenceText.toString()) + " the configured microflow: " + microflowName + " does not exist.");
			
			queueNr = queue.getValue(context, SharedQueueConfiguration.MemberNames.QueueRefNr.toString());
			processQueueConfig.put(process.getId().toLong(), queueNr);
            _node.debug("Adding queue to the pool: " + queueNr );
		}
		
		actionObject.setValue(context, QueuedAction.MemberNames.QueueNumber.toString(), queueNr);
		
		/* 
		 * We don't want to process follow up actions immediately, just skip them and wait until the're passed again
		 * once the override boolean is set to true we know that we are processing a follow up action for the second time 
		 * and need to put them in the queue anyway 
		 */
		
		// Ticket #44229: https://mendixsupport.zendesk.com/agent/tickets/44229 -- JPU (Nov 24, 2016)
		// added check to see if prevAction was already successfully completed to avoid followup action waiting indefinitely without ever executing.
		IMendixIdentifier prevActionId = actionObject.getValue(context, QueuedAction.MemberNames.FollowupAction_PreviousAction.toString());
		boolean addToQueue = false;
		if (overrideFollowUp == true) {
			addToQueue = true;
		}
		else if (prevActionId == null )
			addToQueue = true;
		else { //(prevActionId != null)
			QueuedAction prevAction = QueuedAction.load(context, prevActionId);
			addToQueue = 
				prevAction.getStatus(context) == LogExecutionStatus.SuccesExecuted || 
				prevAction.getStatus(context) == LogExecutionStatus.SuccesWithErrorsExecuted;
		}
			
		if( addToQueue == true ) {

			_node.debug("Adding action to queue: " + queueNr );
			
			ThreadPoolExecutor tPool = queueMap.get(queueNr);
			if(tPool != null)
			{
				ObjectQueueExecutor thread = new ObjectQueueExecutor(context, actionObject, process);
				tPool.execute(thread);
			} else
			{
				throw new CoreException("The given Queue with number: "+ queueNr+" was not found in the ThreadPoolManager.");
			}
		}
		else {
			_node.debug("Skipping the ActionQueue, the action is a follow up action (" + actionObject.getValue(context, QueuedAction.MemberNames.ActionNumber.toString()) + ") ");
		}
	}
	
	private static class QueueAppender extends Thread {
		public void run() {
			while (true) {
				Boolean append = true;
	
				synchronized(queueActionList) {
					int size = queueActionList.size();
					if (size > 0) {
						int index = 0;
						while (index < size) {
							QueueAction action = queueActionList.get(index);
							queueActionMap.put(action.actionNr, action);
							index++;
						}
						queueActionList.subList(0, queueActionList.size()).clear();
					}
				}
				
				Iterator<Long> it = queueActionMap.keySet().iterator();
				
				while (it.hasNext()) {
					Long actionNr = it.next();
					QueueAction action = queueActionMap.get(actionNr);
					
					if (action.existsInDB) {
						try {
							addActionToQueue(action.context, action.actionObject, action.process, action.overrideFollowUp);
							it.remove();
						} catch (CoreException e) {
							_node.error("Error occurred while trying to add action to the queue in the QueueAppender.", e);
						}
						
					}
					else {
						Long qaGUID = action.actionObject.getId().toLong();
						try {
							List<IMendixObject> qaResult = Core.retrieveXPathQuery(action.context, "//" + QueuedAction.getType() + "[ID=" + qaGUID + "]");
							if (qaResult.size() > 0) {
								action.setExistsInDB(true);
								if (append) { 
									addActionToQueue(action.context, action.actionObject, action.process, action.overrideFollowUp);
									it.remove();
								}
							}
							else {
								append = false;
							}
						} catch (CoreException e) {
							_node.error("Error occurred while trying to add action to the queue in the QueueAppender.", e);
						}
					}
				}
				
				try {
					Thread.sleep(5000);
				} catch (InterruptedException e) {
					_node.error("Queue Appender thread got interrupted while trying to pause.", e);
				}
			}
		}
	}
}
