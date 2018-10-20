package processqueue.queuehandler;

import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * This class is responsible for ...
 * @author KJP
 *
 */

public class QueueAction {
	IContext context;
	IMendixObject actionObject; 
	IMendixObject process;
	Long actionNr;
	boolean overrideFollowUp;
	boolean existsInDB = false;
	
	public QueueAction(IContext context, Long actionNr, IMendixObject actionObject, IMendixObject process, boolean overrideFollowUp) {
		this.context = context;
		this.actionNr = actionNr;
		this.actionObject = actionObject;
		this.process = process;
		this.overrideFollowUp = overrideFollowUp;
	}
	
	public IContext getContext() {
		return context;
	}

	public IMendixObject getActionObject() {
		return actionObject;
	}

	public IMendixObject getProcess() {
		return process;
	}

	public Long getActionNr() {
		return actionNr;
	}

	public boolean isOverrideFollowUp() {
		return overrideFollowUp;
	}

	public boolean isExistsInDB() {
		return existsInDB;
	}

	public void setExistsInDB(boolean existsInDB) {
		this.existsInDB = existsInDB;
	}
}
