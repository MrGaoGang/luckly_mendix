package xlsreport.report.data;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.poi.ss.usermodel.CellStyle;

import com.mendix.core.Core;
import com.mendix.logging.ILogNode;

import xlsreport.proxies.AggregateFunction;
import xlsreport.proxies.MxXPath;

public class ColumnPreset
{	
	private static ILogNode log = Core.getLogger("XLSreport");
	private String name;
	private boolean nameAsHeader;
	private boolean dateTimeFormat = false;
	private int columnNr;
	private MxXPath firstPath;
	private CellStyle style;
	private long styleGuid;
	private boolean dataAggregate;
	private AggregateFunction dataAggrFunction;
	private boolean resultAggregate;
	private AggregateFunction resultAggrFunction;
	private DescriptiveStatistics statistics;
	private int valuesCounter;
	
	/**
	 * Constructor for XLS columns to contains styling
	 * @param name Name of the column
	 * @param nameAsHeader Place the name of the column as header above the excel
	 * @param columnNr The position of the column, start from 0
	 * @param firstPath The first object where the XPath will start to an attribute 
	 * @param styleGuid The GUID of the MxCellStyle object
	 */
	public ColumnPreset(String name, boolean nameAsHeader, int columnNr, MxXPath firstPath, long styleGuid)
	{
		this.name = name;
		this.nameAsHeader = nameAsHeader;
		this.columnNr = columnNr;
		this.firstPath = firstPath;
		this.styleGuid = styleGuid;
	}	

	/**
	 * Constructor for CSV columns.
	 * @param name The name of the column to be placed as header in the CSV
	 * @param columnNr The position of the column, start from 0
	 * @param firstPath The first object where the XPath will start to an attribute 
	 */
	public ColumnPreset(String name, int columnNr, MxXPath firstPath)
	{
		this.name = name;
		this.columnNr = columnNr;
		this.firstPath = firstPath;
		this.nameAsHeader = true;
	}
	
	public void addDataAggregation(AggregateFunction aggrFunction)
	{
		this.dataAggregate = true;
		this.dataAggrFunction = aggrFunction;
	}
	
	public boolean isDataAggregation()
	{
		return this.dataAggregate;
	}
	
	public AggregateFunction getDataAggrFunction()
	{
		return this.dataAggrFunction;
	}
	
	/**
	 * Add an aggregate function at the bottom of the XLS column
	 * @param aggrFunction What type of aggregate function (avg, min, max, sum, count)
	 */
	public void addResultAggregation(AggregateFunction aggrFunction)
	{
		this.resultAggregate = true;
		this.resultAggrFunction = aggrFunction;
		this.statistics = new DescriptiveStatistics();
	}
	
	/**
	 * Check if this column uses aggregation at the bottom
	 * @return Use of aggregation
	 */
	public boolean isResultAggregation()
	{
		return resultAggregate;
	}
	
	public void addResultAggrValue(double value)
	{
		this.statistics.addValue(value);
		this.valuesCounter++;
	}
	
	/**
	 * Get the calculated aggregation from this column 
	 * @return The calculated aggregation
	 */
	public double getResultAggregate()
	{
		double returnValue = 0.0;
		switch(this.resultAggrFunction)
		{
			case Average:
				returnValue = this.statistics.getMean();
				break;
			case Sum:
				returnValue = this.statistics.getSum();
				break;
			case Max:
				returnValue = this.statistics.getMax();
				break;
			case Min:
				returnValue = this.statistics.getMin();
				break;
			case Count:
				returnValue = this.valuesCounter;
				break;
		}		
		return returnValue;
	}
	
	// Normal parameters
	public CellStyle getStyle()
	{
		return style;
	}

	public void setStyle(CellStyle style)
	{
		this.style = style;
		log.trace("Styles set for " +this.columnNr+"-" + this.name + " with format: " + style.getDataFormatString());
	}		

	public String getName()
	{
		return name;
	}

	public boolean isNameAsHeader()
	{
		return nameAsHeader;
	}

	public int getColumnNr()
	{
		return columnNr;
	}

	public MxXPath getFirstPath()
	{
		return firstPath;
	}

	public long getStyleGuid()
	{
		return styleGuid;
	}

	public boolean isDateTimeFormat()
	{
		return dateTimeFormat;
	}

	public void setDateTimeFormat(boolean dateTimeFormat)
	{
		this.dateTimeFormat = dateTimeFormat;
	}	
}
