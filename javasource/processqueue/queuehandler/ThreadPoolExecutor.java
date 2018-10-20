package processqueue.queuehandler;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

public class ThreadPoolExecutor extends java.util.concurrent.ThreadPoolExecutor {

	private List<Runnable> activeThreads;
	
	public ThreadPoolExecutor(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit, LinkedBlockingQueue<Runnable> workQueue, ThreadFactory threadFactory) {
		super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory);
		
		this.activeThreads = Collections.synchronizedList( new ArrayList<Runnable>(maximumPoolSize) );
	}

	@Override
	protected void beforeExecute(Thread t, Runnable r) {
		this.activeThreads.add(r);
	}

	@Override
	protected void afterExecute(Runnable r, Throwable t) {
		this.activeThreads.remove(r);
	}

	public List<Runnable> getActiveThreads() {
		return this.activeThreads;
	}
}
