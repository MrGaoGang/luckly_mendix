package xlsreport.report.data;

import xlsreport.proxies.AggregateFunction;

public class AttributeData
{
	private String attributeName;
	private String alias;
	private ObjectData objectData;	
	private boolean aggregate;
	private AggregateFunction function;
	
	public AttributeData(String attributeName, String alias, ObjectData objectData)
	{
		this.attributeName = attributeName;
		this.alias = alias;
		this.objectData = objectData;
	}

	public String getAttributeName()
	{
		return attributeName;
	}

	public String getAlias()
	{
		return alias;
	}

	public ObjectData getObjectData()
	{
		return objectData;
	}
	
	public void clear()
	{
		this.objectData = null;
	}

	public boolean isAggregate()
	{
		return aggregate;
	}

	public void setAggregate(boolean aggregate)
	{
		this.aggregate = aggregate;
	}

	public AggregateFunction getFunction()
	{
		return function;
	}

	public void setFunction(AggregateFunction function)
	{
		this.function = function;
	}	
}
