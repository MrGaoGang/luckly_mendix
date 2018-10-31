package xlsreport.report.data;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.UUID;


public class ObjectData
{	
	private String completeName;	
	private String module;
	private String objectName;
	private String alias;
	// Reference text, ReferenceData
	private LinkedHashMap<String, ReferenceData> referenceAliasMap;
		
	public ObjectData(String completeName, String module, String objectName)
	{
		this.completeName = completeName;
		this.module = module;
		this.objectName = objectName;
		this.alias = createAlias();
		this.referenceAliasMap = new LinkedHashMap<String, ReferenceData>();
	}

	private static String createAlias()
    {
        return "a" + UUID.randomUUID().toString().substring(0, 8);
    }
	
	public boolean containReference(String reference)
	{
		return this.referenceAliasMap.containsKey(reference);
	}
	
	public ReferenceData getReference(String reference)
	{
		return this.referenceAliasMap.get(reference);
	}
	
	public Collection<ReferenceData> getReferences()
	{
		return this.referenceAliasMap.values();
	}
	
	public void addReference(String reference, ObjectData toObject)
	{
		this.referenceAliasMap.put(reference, new ReferenceData(reference, this, toObject));
	}			

	public String getModule()
	{
		return module;
	}

	public String getObjectName()
	{
		return objectName;
	}

	public String getCompleteName()
	{
		return completeName;
	}

	public String getAlias()
	{
		return alias;
	}	
	
	public void clear()
	{
		for(ReferenceData ref : this.referenceAliasMap.values())
		{
			ref.getToObject().clear();
			ref.clear();
		}
		this.referenceAliasMap.clear();
	}
}
