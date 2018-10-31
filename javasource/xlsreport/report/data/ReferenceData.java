package xlsreport.report.data;


public class ReferenceData
{
	private String reference;
	private ObjectData fromObject;
	private ObjectData toObject;
	
	public ReferenceData(String reference, ObjectData fromObject, ObjectData toObject)
	{		
		this.reference = reference;
		this.fromObject = fromObject;
		this.toObject = toObject;
	}

	public String getReference()
	{
		return reference;
	}

	public ObjectData getFromObject()
	{
		return fromObject;
	}

	public ObjectData getToObject()
	{
		return toObject;
	}	
	
	public void clear()
	{
		this.fromObject = null;
		this.toObject = null;
	}
}
