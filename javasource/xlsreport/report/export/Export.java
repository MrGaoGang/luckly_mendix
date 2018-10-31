package xlsreport.report.export;

import java.util.List;

import system.proxies.FileDocument;
import xlsreport.proxies.MxSheet;
import xlsreport.proxies.MxTemplate;
import xlsreport.report.data.ColumnPreset;

import com.mendix.core.Core;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

public abstract class Export implements AutoCloseable
{
	protected static ILogNode log = Core.getLogger("XLSreport");
	protected IContext context;   
	protected IMendixObject inputObject;
    
    public Export(IContext context, IMendixObject inputObject)
	{
		this.context = context;
		this.inputObject = inputObject;
	}

	abstract public void buildExportFile(MxSheet mxSheet, List<ColumnPreset> mxColumnList, Object[][] Table) throws Exception;	
	
	abstract public void writeData(FileDocument outputDocument) throws Exception;
	
	public static String getDatePresentation(MxTemplate template)
	{
		String datePresentation = "M/d/yy h:mm";
		
		if(template.getDateTimePresentation() != null)
    	{
	    	switch(template.getDateTimePresentation())
	    	{
	    		case dmmmyy:
	    			datePresentation = "d-MMM-yy";
	    			break;
	    		case mdyy:
	    			datePresentation = "M/d/yy";
	    			break;
	    		case mdyyhmm:
	    			datePresentation = "M/d/yy h:mm";
	    			break;
	    		case ddmmyyyy:
	    			datePresentation = "dd-MM-yyyy";
	    			break;
	    		case ddmmyyyyhhmm:	    			
    				datePresentation = "dd-MM-yyyy hh:mm";
    				break;
	    		case mmddyyyy:
	    			datePresentation = "MM/dd/yyyy";
    				break;
	    		case mmddyyyyhhmm:
	    			datePresentation = "MM/dd/yyyy hh:mm";
    				break;
	    		case custom:
	    			datePresentation = template.getCustomeDateFormat();
	    	}
    	} 
		return datePresentation;    	
	}
}
