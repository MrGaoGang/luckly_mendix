/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package xlsreport.report;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.connectionbus.data.IDataRow;
import com.mendix.systemwideinterfaces.connectionbus.data.IDataTable;
import com.mendix.systemwideinterfaces.connectionbus.requests.types.IOQLTextGetRequest;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import mxmodelreflection.proxies.MxObjectMember;
import mxmodelreflection.proxies.MxObjectType;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import xlsreport.proxies.*;
import xlsreport.report.data.*;

/**
 * 
 * @author jvg
 */
public class DataOQL
{
	private static ILogNode log = Core.getLogger("XLSreport");
	static final Pattern PATTERN_RESERVED_OQL = Pattern.compile("\\b(select|distinct|as|avg|count|max|min|sum|from|inner|left|right|full|outer|join|on|where|and|or|group|by|limit|offset|order|asc|desc|having|cast|coalesce|like|in|exists|not|case|when|then|else|end|boolean|datetime|float|integer|long|string|null|year|month|day|hour|minute)\\b", Pattern.CASE_INSENSITIVE);
	private IContext context;
	private MxObjectType inputObjectType;
	
	// String Builders to create the OQL query
	private StringBuilder SELECT = new StringBuilder().append("SELECT ");
	private String FROM = " FROM ";
	private StringBuilder JOIN = new StringBuilder();
	private StringBuilder WHERE = new StringBuilder();
	private StringBuilder ORDER = new StringBuilder();
	private StringBuilder GROUP = new StringBuilder();
	// Hashmap with the aliases is made from: unique complete member name and
	// alias name
	private HashSet<String> attributeAliasSet = new HashSet<String>();
	private LinkedList<AttributeData> attributeList = new LinkedList<AttributeData>();
	private HashSet<String> usedAttributeList = null;

	/**
	 * Constructor to create a Data OQL retrieve
	 * 
	 * @param context The Mendix IContext to retrieve from DB.
	 * @throws CoreException 
	 */
	public DataOQL(IContext context, MxTemplate template) throws CoreException
	{
		this.context = context;
		log.trace("-- Initialise the data OQL");
		this.inputObjectType = template.getMxTemplate_InputObject();
		
	}

	/**
	 * General function from the Data OQL class to: - Create OQL query - Execute
	 * OQL query - Parse result to 2D array
	 * 
	 * @param mxSheet Mendix MxSheet object
	 * @param inputObject A general input object to specify an association
	 * @param mxColumnList List of a representation of the MxColumn objects
	 * @return 2D Object array that represents a DataTable
	 * @throws CoreException
	 */
	public Object[][] getRowData(MxSheet mxSheet, IMendixObject inputObject, List<ColumnPreset> mxColumnList) throws CoreException
	{
		log.debug("-- Run the OQL data for the sheet: " + mxSheet.getName());

		// Create the query that is needed.
		String Query = createOQLQuery(mxSheet, inputObject, mxColumnList);
		Query = Query.replace(" / ", "/");
		log.debug(">> The query for the OQL retrieve is created: " + Query);

		// Execute the query.
		IOQLTextGetRequest request = Core.createOQLTextGetRequest();
		request.setQuery(Query);				
		IDataTable data = Core.retrieveOQLDataTable(this.context, request);				
		return procesDatatable(data, mxColumnList.size());
	}

	/**
	 * Create OQL based on the XPath selection in the data. SELECT, FROM, JOINS,
	 * WHERE, GROUP, ORDER
	 * 
	 * @param mxSheet Mendix MxSheet object
	 * @param inputObject A general input object to specify an association
	 * @param mxColumnLists List of a representation of the MxColumn objects
	 * @return Complete OQL query
	 * @throws CoreException
	 */
	private String createOQLQuery(MxSheet mxSheet, IMendixObject inputObject, List<ColumnPreset> mxColumnLists) throws CoreException
	{
		// Define the columns that are needed.
		MxObjectType mainObjectType = mxSheet.getMxSheet_RowObject();
		ObjectData mainObject = new ObjectData(mainObjectType.getCompleteName(), mainObjectType.getModule(), mainObjectType.getName());

		// Define the table what is needed.
		 FROM += composeTableName(mainObject.getModule(), mainObject.getObjectName())
                + " AS " + mainObject.getAlias();

		for (ColumnPreset column : mxColumnLists)
		{
			MxXPath first = column.getFirstPath();
			switch (first.getRetrieveType())
			{
				case Attribute:
					addAttribute(first, mainObject, column);
					break;
				case Reference:
					addObject(first, mainObject, column);
					break;
			}
		}

		// Create all the select statements.
		if (mxSheet.getDistinctData())
		{
			this.SELECT.append(" DISTINCT ");
		}
		boolean groupBy = mxSheet.getFormLayout_GroupBy();
		boolean groupSet = false;
		if (groupBy)
		{
			this.GROUP.append(" GROUP BY ");
			this.usedAttributeList = new HashSet<String>();
		}

		for (int i = 0; i < this.attributeList.size(); i++)
		{
			AttributeData data = this.attributeList.get(i);
			String attribute = escape(data.getObjectData().getAlias()+"."+data.getAttributeName().replace(" / ", "/"));
			if (data.isAggregate())
			{
				switch (data.getFunction())
				{
					case Average:
						this.SELECT.append("Avg(").append(attribute).append(")");
						break;
					case Count:
						this.SELECT.append("Count(").append(attribute).append(")");
						break;
					case Max:
						this.SELECT.append("Max(").append(attribute).append(")");
						break;
					case Min:
						this.SELECT.append("Min(").append(attribute).append(")");
						break;
					case Sum:
						this.SELECT.append("Sum(").append(attribute).append(")");
						break;
				}
				this.SELECT.append(" AS " + data.getAlias());
			} else if (groupBy)
			{
				this.SELECT.append(attribute).append(" AS " + data.getAlias());
				if (groupSet)
				{
					this.GROUP.append(", ");
				} else
				{
					groupSet = true;
				}
				this.GROUP.append(attribute);
				this.usedAttributeList.add(attribute);
			} else
			{
				this.SELECT.append(attribute).append(" AS " + data.getAlias());
			}

			if (i < this.attributeList.size() - 1)
			{
				this.SELECT.append(", ");
			}
		}
		log.trace("Created SELECT statement: " + SELECT);

		// Create WHERE statement
		HashMap<String, String> sortMap = new HashMap<String, String>();
		sortMap.put(MxConstraint.MemberNames.Sequence.toString(), "ASC");
		List<IMendixObject> constrainList = Core.retrieveXPathQuery(context, "//"
				+ MxConstraint.getType()
				+ "["
				+ MxConstraint.MemberNames.MxConstraint_MxSheet.toString()
				+ "='" + mxSheet.getMendixObject().getId().toLong() + "']", Integer.MAX_VALUE, 0, sortMap);
		if (constrainList.size() > 0)
		{
			addWhereClause(constrainList, mainObject);
		}
		// Create the order by
		createOrder(mxSheet, mainObject);

		// Create inner joins;
		HashMap<String, String> refMap = getReferenceHandling(mxSheet);
		if (mxSheet.getMxSheet_MxObjectReference() != null && inputObject != null)
		{
			String referenceName = mxSheet.getMxSheet_MxObjectReference().getCompleteName();
			if (!createInnerJoin(refMap, mainObject, referenceName, inputObject))
			{
				String alias = "refobject";
				String tableName = composeTableName(this.inputObjectType.getModule(), this.inputObjectType.getName());
                String refName = composeTableName(referenceName);
				
                this.JOIN.append(" " + refMap.getOrDefault(referenceName,"") + " JOIN ")
                      	 .append(composeTableName(mainObject.getAlias()))
                      	 .append("/" + refName + "/")
                      	 .append(tableName)
                      	 .append(" AS ")
                      	 .append(alias);

				this.JOIN.append(" ON ").append(alias).append("/ID = "
						+ inputObject.getId().toLong() + " ");
			}
		} else
		{
			createInnerJoin(refMap, mainObject, null, null);
		}

		// Clear cached data.
		mainObject.clear();

		return SELECT.toString() + " " + this.FROM + " " + this.JOIN.toString()
				+ " " + this.WHERE.toString() + " " + this.GROUP.toString()
				+ " " + this.ORDER.toString() + ";";

	}

	/**
	 * Create the WHERE clause to constraint the data.
	 * 
	 * @param constrainList
	 *            A list of constraints
	 * @param mainObject
	 *            The data of the row object.
	 * @throws CoreException
	 */
	private void addWhereClause(List<IMendixObject> constrainList, ObjectData mainObject) throws CoreException
	{
		this.WHERE.append(" WHERE ");
		for (int i = 0; i < constrainList.size(); i++)
		{
			MxConstraint constraint = MxConstraint.initialize(context, constrainList.get(i));

			if (i > 0)
			{
				this.WHERE.append(" " + constraint.getAndOr().toString() + " ");
			}

			// Add reference to the join paths
			MxXPath first = constraint.getMxConstraint_MxXPath();
			ObjectData obj;
			if (first.getRetrieveType() == RetrieveAction.Reference)
			{
				obj = getObject(first, mainObject);
			} else
			{
				obj = mainObject;
			}
			// Build constraint statement
			if (constraint.getAttributeType() == AttributeType.Date)
			{
				// DATEDIFF (DAY, Planned_Submission_Date,
				// '[%CurrentDateTime%]') <= 14
				// min is toekomst, plus is vroeger.
				this.WHERE.append("DATEDIFF(").append("DAY,").append(obj.getAlias()).append("."
						+ constraint.getAttribute());
				this.WHERE.append(", '[%CurrentDateTime%]')");
				long compare = constraint.getConstraintNumber();
				if (constraint.getConstraintDateTime() == DateTimeConstraint.After)
				{
					compare = compare * -1;
				}

				switch (constraint.getConstraint())
				{
					case Equal:
						this.WHERE.append(" = ").append(compare);
						break;
					case Greater:
						this.WHERE.append(" > ").append(compare);
						break;
					case GreaterEqual:
						this.WHERE.append(" >= ").append(compare);
						break;
					case Smaller:
						this.WHERE.append(" < ").append(compare);
						break;
					case SmallerEqual:
						this.WHERE.append(" <= ").append(compare);
						break;
					default:
						break;
				}
			} else
			{
				this.WHERE.append(" " + obj.getAlias()).append("."
						+ constraint.getAttribute());
				switch (constraint.getConstraint())
				{
					case Contains:
						this.WHERE.append(" like '%").append(constraint.getConstraintText()
								+ "%'");
						break;
					case StartWith:
						this.WHERE.append(" like '").append(constraint.getConstraintText()
								+ "%'");
						break;
					case Equal:
						this.WHERE.append(" = ").append(addWhereValue(constraint));
						break;
					case NotEqual:
						this.WHERE.append(" != ").append(addWhereValue(constraint));
						break;
					case Greater:
						this.WHERE.append(" > ").append(addWhereValue(constraint));
						break;
					case GreaterEqual:
						this.WHERE.append(" >= ").append(addWhereValue(constraint));
						break;
					case Smaller:
						this.WHERE.append(" < ").append(addWhereValue(constraint));
						break;
					case SmallerEqual:
						this.WHERE.append(" <= ").append(addWhereValue(constraint));
						break;
					case NotEmpty:
						this.WHERE.append(" != NULL");
						break;
					case _empty:
						this.WHERE.append(" = NULL");
						break;
				}
			}
		}
		log.trace("Created WHERE statement: " + WHERE);
	}

	/**
	 * Parse a selection of the where statement and add the compare.
	 * 
	 * @param constraint
	 *            Mendix constraint object that holds the data.
	 * @return
	 * @throws CoreException
	 */
	private String addWhereValue(MxConstraint constraint) throws CoreException
	{
		switch (constraint.getAttributeType())
		{
			case Text:
				return "'" + constraint.getConstraintText() + "'";
			case Decimal:
				return " " + constraint.getConstraintFloat() + "";
			case Number:
				return " " + constraint.getConstraintNumber() + "";
			case YesNo:
				if (constraint.getConstraintBoolean())
				{
					return " 'true'";
				} else
				{
					return " 'false'";
				}
			default:
				break;
		}
		return "";
	}

	/**
	 * Add an attribute to the list to build later the SELECT of the OQL.
	 * 
	 * @param attributePath
	 *            The Xpath item that holds the attribute
	 * @param objectData
	 *            The object structure that is the owner of the attribute
	 * @throws CoreException
	 */
	private void addAttribute(MxXPath attributePath, ObjectData objectData, ColumnPreset column) throws CoreException
	{
		MxObjectMember member = attributePath.getMxXPath_MxObjectMember();
		column.setDateTimeFormat(member.getAttributeType().equalsIgnoreCase("DateTime"));
		String attribute = member.getAttributeName();
		// Create alias name for the attribute
		String alias = createAlias(attribute, 0);
		// Create new attribute data object
		AttributeData attributeData = new AttributeData(attribute, alias, objectData);
		if (column.isDataAggregation())
		{
			attributeData.setAggregate(true);
			attributeData.setFunction(column.getDataAggrFunction());
		}
		
		// Add attribute to the list and the object.
		attributeList.add(attributeData);
		log.trace("Add attribute to the list: " + objectData.getObjectName()
				+ "." + attribute);
	}

	/**
	 * Create an unique alias for the attribute for the SELECT of the OQL. The
	 * function is recursive based on the counter
	 * 
	 * @param attribute
	 *            The name of the attribute
	 * @param counter
	 *            The number to place behind the attribute for the alias
	 * @return
	 */
	private String createAlias(String attribute, int counter)
	{
		String key = attribute + counter;
		if (this.attributeAliasSet.contains(key))
		{
			counter++;
			return createAlias(attribute, counter);
		} else
		{
			this.attributeAliasSet.add(key);
			return key;
		}
	}

	/**
	 * A recursive function to build an path of reference objects to has a clear
	 * path from the row object When the next path is a reference the function
	 * will be called again. When it is an attribute, the addAttribute()
	 * function is called.
	 * 
	 * @param path
	 *            The Xpath item to check what is holds
	 * @param fromObjectData
	 *            The object structure that is the parent of the Xpath item
	 * @return
	 * @throws CoreException
	 */
	private ObjectData getObject(MxXPath path, ObjectData fromObjectData) throws CoreException
	{
		if (path.getRetrieveType() != null)
		{
			switch (path.getRetrieveType())
			{
				case Reference:
					String referenceName = path.getMxXPath_MxObjectReference().getCompleteName();
					MxObjectType toObjectName = path.getMxXPath_MxObjectType();
					// Create variables for searching further;
					MxXPath childPath = path.getMxXPath_ParentMxXPath();
					ObjectData toObjectData;
					if (fromObjectData.containReference(referenceName))
					{
						ReferenceData referenceData = fromObjectData.getReference(referenceName);
						toObjectData = referenceData.getToObject();
						log.trace("Searching further on excisting reference: "
								+ referenceName + " with object: "
								+ toObjectName.getCompleteName());
						if (!Core.isSubClassOf(toObjectName.getCompleteName(), toObjectData.getCompleteName()))
						{
							log.warn("The TO object: "
									+ toObjectName.getCompleteName()
									+ " has an reference: "
									+ referenceName
									+ " but doesn't match in subclassof object name: "
									+ toObjectData.getCompleteName());
						}
					} else
					{
						log.trace("Creating for reference: " + referenceName
								+ " with object: " + toObjectName);
						toObjectData = new ObjectData(toObjectName.getCompleteName(), toObjectName.getModule(), toObjectName.getName());
						fromObjectData.addReference(referenceName, toObjectData);
					}
					ObjectData response = getObject(childPath, toObjectData);
					if (response == null)
					{
						return toObjectData;
					} else
					{
						return response;
					}
				case Attribute:
					return null;
			}
		} else
		{
			log.warn("For a child of: " + fromObjectData.getCompleteName()
					+ " could not determine what the retrieve type was.");
		}
		return null;
	}

	/**
	 * Add an reference object as child to the parent: fromObjectData
	 * 
	 * @param path
	 *            The Xpath item that must be added as child
	 * @param fromObjectData
	 *            The parent ObjectData object
	 * @throws CoreException
	 */
	private void addObject(MxXPath path, ObjectData fromObjectData, ColumnPreset column) throws CoreException
	{
		if (path.getRetrieveType() != null)
		{
			switch (path.getRetrieveType())
			{
				case Reference:
					String referenceName = path.getMxXPath_MxObjectReference().getCompleteName();
					MxObjectType toObjectName = path.getMxXPath_MxObjectType();
					// Create variables for searching further;
					MxXPath childPath = path.getMxXPath_ParentMxXPath();
					ObjectData toObjectData;
					if (fromObjectData.containReference(referenceName))
					{
						ReferenceData referenceData = fromObjectData.getReference(referenceName);
						toObjectData = referenceData.getToObject();
						log.trace("Searching further on excisting reference: "
								+ referenceName + " with object: "
								+ toObjectName.getCompleteName());
						if (!Core.isSubClassOf(toObjectName.getCompleteName(), toObjectData.getCompleteName()))
						{
							log.warn("The TO object: "
									+ toObjectName
									+ " has an reference: "
									+ referenceName
									+ " but doesn't match in subclassof object name: "
									+ toObjectData.getCompleteName());
						}
					} else
					{
						log.trace("Creating for reference: " + referenceName
								+ " with object: " + toObjectName);
						toObjectData = new ObjectData(toObjectName.getCompleteName(), toObjectName.getModule(), toObjectName.getName());						
						fromObjectData.addReference(referenceName, toObjectData);
					}
					addObject(childPath, toObjectData, column);
					break;
				case Attribute:
					addAttribute(path, fromObjectData, column);
					break;
			}
		} else
		{
			log.warn("For a child of: " + fromObjectData.getCompleteName()
					+ " could not determine what the retrieve type was.");
		}
	}

	/**
	 * A recursive function that will build the INNER JOIN structure
	 * 
	 * @param refMap
	 *            An HashMap that will contain all the references and the JOIN
	 *            structure
	 * @param objectData
	 *            The objectdata that will print his references to the INNER
	 *            JOIN
	 * @param extraRef
	 *            An possible association that will start from the main object
	 *            to the inputObject
	 * @param inputObject
	 *            The object that must be added as extra constraint
	 * @return Is the extraRef association added to the INNER JOIN structure
	 */
	private boolean createInnerJoin(HashMap<String, String> refMap, ObjectData objectData, String extraRef, IMendixObject inputObject)
	{
		boolean result = false;
		for (ReferenceData reference : objectData.getReferences())
		{
			String fromAlias = reference.getFromObject().getAlias();
			ObjectData toObject = reference.getToObject();
			String referenceName = reference.getReference();

			String tableName = composeTableName(toObject.getModule(), toObject.getObjectName());
            String referenceNameQuoted = composeTableName(referenceName);
			// Set the join for the Input object?
			if (extraRef != null && inputObject != null && referenceName.equals(extraRef))
			{
				this.JOIN.append(" " + refMap.getOrDefault(referenceName, "") + " JOIN ").append(fromAlias).append("/"
                        + referenceNameQuoted + "/").append(tableName);
				this.JOIN.append(" AS ").append(toObject.getAlias()).append(" ON "
						+ toObject.getAlias()
						+ "/ID = "
						+ inputObject.getId().toLong() + " ");
				result = true;
			} else
			{
				this.JOIN.append(" " + refMap.getOrDefault(referenceName, "") + " JOIN ").append(fromAlias).append("/"
                        + referenceNameQuoted + "/").append(tableName);
				this.JOIN.append(" AS ").append(toObject.getAlias());
			}
			// Create further
			result = createInnerJoin(refMap, toObject, null, null) ? true : result;
		}
		return result;
	}

	/**
	 * Build the ORDER OQL part for retrieving the data in needed order.
	 * 
	 * @param mxSheet
	 *            Sheet object that contains the order
	 * @param mainObject
	 *            The row object structure
	 * @throws CoreException
	 */
	private void createOrder(MxSheet mxSheet, ObjectData mainObject) throws CoreException
	{
		HashMap<String, String> sortMap = new HashMap<String, String>();
		sortMap.put(MxConstraint.MemberNames.Sequence.toString(), "ASC");
		List<IMendixObject> orders = Core.retrieveXPathQuery(context, "//"
				+ MxSorting.getType() + "["
				+ MxSorting.MemberNames.MxSorting_MxSheet.toString() + "='"
				+ mxSheet.getMendixObject().getId().toLong() + "']", Integer.MAX_VALUE, 0, sortMap);

		if (orders.size() > 0)
		{
			this.ORDER.append(" ORDER BY ");
			for (int i = 0; i < orders.size(); i++)
			{
				MxSorting sorting = MxSorting.initialize(context, orders.get(i));

				MxXPath first = sorting.getMxSorting_MxXPath();
				ObjectData obj;
				if (first.getRetrieveType() == RetrieveAction.Reference)
				{
					obj = getObject(first, mainObject);
				} else
				{
					obj = mainObject;
				}
				String attribute = obj.getAlias() + "."
						+ sorting.getAttribute();
				switch (sorting.getSortingDirection())
				{
					case Asc:
						this.ORDER.append(attribute).append(" ASC");
						break;
					case Desc:
						this.ORDER.append(attribute).append(" DESC");
				}
				// Add attribute for the group by, because it isn't in SELECT?
				if (this.usedAttributeList != null
						&& !this.usedAttributeList.contains(attribute))
				{
					this.GROUP.append(", ").append(attribute);
				}

				if (i < orders.size() - 1)
				{
					this.ORDER.append(", ");
				}
			}
		}
	}

	/**
	 * Build from the configuration a reference handling HashMap: Reference,
	 * JOINtype - INNER JOIN - OUTER JOIN - LEFT JOIN - RIGHT JOIN - FULL JOIN
	 * 
	 * @param sheet
	 *            The Mendix MxSheet
	 * @return A HashMap with Reference, JoinType
	 * @throws CoreException
	 */
	private HashMap<String, String> getReferenceHandling(MxSheet sheet) throws CoreException
	{
		List<IMendixObject> referenceList = Core.retrieveXPathQuery(context, "//"
				+ MxReferenceHandling.getType()
				+ "["
				+ MxReferenceHandling.MemberNames.MxReferenceHandling_MxSheet.toString()
				+ "=" + sheet.getMendixObject().getId().toLong() + "]");
		HashMap<String, String> returnMap = new HashMap<String, String>();
		for (IMendixObject obj : referenceList)
		{
			MxReferenceHandling ref = MxReferenceHandling.initialize(context, obj);
			String join = ref.getJoinType().toString();
			returnMap.put(ref.getReference(), join != null ? join : "INNER");
		}
		return returnMap;
	}

	/**
	 * Build from the IDataTable a 2D array.
	 * 
	 * @param data
	 *            Mendix IDataTable: result from the OQL query
	 * @param mxColumnList
	 *            The amount of the columns
	 * @return A 2D array with different values
	 * @throws CoreException
	 */
	private Object[][] procesDatatable(IDataTable data, int columnAmount) throws CoreException
	{
		log.trace(">> Process the retrieved the datatable: "+ data.getRowCount() + " rows.");
		// Render first the GUIDS that are needed
		Object[][] outputTable = new Object[data.getRowCount()][columnAmount];
		// Set the results in the output;
		if (data.getRowCount() > 0)
		{
			int rowCounter = 0;
			Iterator<IDataRow> rowItr = data.iterator();
			while (rowItr.hasNext())
			{
				IDataRow row = rowItr.next();
				for (int i = 0; i < columnAmount; i++)
				{
					outputTable[rowCounter][i] = parseValue(row.getValue(context, i));
				}
				rowCounter++;
			}

			return outputTable;
		} else
		{
			return null;
		}
	}

	private Object parseValue(Object value)
	{
		if (value instanceof Date)
			return parseDate((Date)value);

		return value;
	}

	private Date parseDate(Date value)
	{
		if(value == null)
			return null;

		// convert to UTC
		DateTime dateTime = new DateTime(value);
		return dateTime.withZone(DateTimeZone.UTC).toLocalDateTime().toDate();
	}

	/**
	 * Check if the string uses reserved words, and if place brackets around it.
	 * @param unescaped
	 * @return
	 */
	private String escape(String unescaped)
	{
		String escaped = unescaped;
		Matcher matcher = PATTERN_RESERVED_OQL.matcher(unescaped);
		if (matcher.find())
		{
			escaped = matcher.replaceAll("\"$1\"");
		}
		return escaped;
	}

	private String composeTableName(String root, String table) {
        return "\"" + root + "\".\"" + table + "\"";
    }

    private String composeTableName(String alias){
        return "\"" + alias.replace(".", "\".\"") + "\"";
    }
}
