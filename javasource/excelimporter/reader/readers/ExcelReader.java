package excelimporter.reader.readers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import mxmodelreflection.proxies.MxObjectMember;
import mxmodelreflection.proxies.MxObjectReference;
import mxmodelreflection.proxies.MxObjectType;
import mxmodelreflection.proxies.PrimitiveTypes;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.poi.hssf.eventusermodel.HSSFEventFactory;
import org.apache.poi.hssf.eventusermodel.HSSFListener;
import org.apache.poi.hssf.eventusermodel.HSSFRequest;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

import replication.AssociationConfig;
import replication.ObjectConfig;
import replication.ReplicationSettings.AssociationDataHandling;
import replication.ReplicationSettings.ChangeTracking;
import replication.ReplicationSettings.KeyType;
import replication.ReplicationSettings.ObjectSearchAction;
import replication.helpers.TimeMeasurement;
import replication.implementation.MFValueParser;
import replication.interfaces.IInfoHandler.StatisticsLevel;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixIdentifier;
import com.mendix.systemwideinterfaces.core.IMendixObject;

import excelimporter.proxies.AdditionalProperties;
import excelimporter.proxies.Column;
import excelimporter.proxies.DataSource;
import excelimporter.proxies.ImportActions;
import excelimporter.proxies.MappingType;
import excelimporter.proxies.ReferenceDataHandling;
import excelimporter.proxies.ReferenceHandling;
import excelimporter.proxies.ReferenceHandlingEnum;
import excelimporter.proxies.ReferenceKeyType;
import excelimporter.proxies.RemoveIndicator;
import excelimporter.proxies.Template;
import excelimporter.reader.readers.replication.ExcelReplicationSettings;

/**
 * Read an excel file can retrieve header information from by
 * 
 * @author J. van der Hoek - Mendix
 * @version $Id: ExcelXLSReader.java 9272 2009-05-11 09:19:47Z Jasper van der Hoek $
 */
public class ExcelReader {

	private final IMendixObject template;

	private ExcelReplicationSettings settings;
	private String descr;
	private Map<String, Set<DocProperties>> docProperties = new HashMap<String, Set<DocProperties>>();

	private TimeMeasurement timeMeasurement;
	public static ILogNode logNode = Core.getLogger("ExcelXLSReader");

	public ExcelReader(IContext context, IMendixObject template) throws CoreException {
		if( template == null )
			throw new CoreException( "No template was provided. Therefore the import could not be started." );
		this.template = template;

		this.descr = this.template.getValue(context, Template.MemberNames.Title.toString());
		if( this.descr != null)
			this.descr = this.template.getValue(context, Template.MemberNames.Nr.toString()) + " - " + this.descr;
		this.timeMeasurement = new TimeMeasurement("ExcelReader-"+this.descr);
	}
	
	private static ExcelExtension getExcelExtension(IContext context, IMendixObject document) {
		String s = document.getValue(context, "Name");
		if (s.toLowerCase().endsWith(".xls")) {
			return ExcelExtension.XLS;
		} else if (s.toLowerCase().endsWith(".xlsx")) {
			return ExcelExtension.XLSX;
		} else {
			return ExcelExtension.UNKNOWN;
		}
	}

	public List<ExcelColumn> getHeaders(IContext context, IMendixObject templateDocument) throws CoreException {
		if(this.template != null && context != null) {
			StringBuilder sb = new StringBuilder("Starting XLS Headers import Template: ").append(this.descr);
			String s = templateDocument.getValue(context, "Name");
			sb.append(" FileName: ").append(s != null ? s : "[unknown]");
			ExcelExtension extension = getExcelExtension(context, templateDocument);
			logNode.info(sb.toString());
			long importStartTime = System.nanoTime();

			File excelFile = null;
			
			try {
				// we maintain a 0-based rownumber here.
				int iCanHasSheet = (Integer) this.template.getValue(context, Template.MemberNames.SheetIndex.toString());
				iCanHasSheet --;
				if( iCanHasSheet < 0 )
					throw new CoreException("The sheetnumber must be larger than 1");

				int iCanHasRow = (Integer) this.template.getValue(context, Template.MemberNames.HeaderRowNumber.toString());
				iCanHasRow --;
				if( iCanHasRow < 0 )
					throw new CoreException("The header rownumber must be larger than 1");

				// Headers - 1st pass
				HashMap<Integer, String> sstmap = headersFirstPass(context, templateDocument, extension, iCanHasSheet, iCanHasRow);
				
				ExcelHeadable header = null;
				// Headers - 2nd pass
				{
					switch (extension) {
					case XLS: {
						try (InputStream content = Core.getFileDocumentContent(context, templateDocument);
								POIFSFileSystem poifs = new POIFSFileSystem(content);
								InputStream workbook = poifs.createDocumentInputStream("Workbook");) {

							if (sstmap == null) {
								throw new CoreException("No headers could be found on sheet: " + iCanHasSheet
										+ " on row nr: " + iCanHasRow);
							}
							// second pass
							header = new ExcelXLSReaderHeaderSecondPassListener(iCanHasSheet, iCanHasRow, sstmap);
							HSSFRequest req = new HSSFRequest();
							req.addListenerForAllRecords((HSSFListener) header);
							HSSFEventFactory factory = new HSSFEventFactory();
							factory.processEvents(req, workbook);
						}
						break;
					}
					case XLSX: {
						excelFile = getExcelFile(context, templateDocument);
						header = new ExcelXLSXHeaderReader(excelFile.getAbsolutePath(), iCanHasSheet, iCanHasRow + 1); // we need a 1-based rownumber in this API
						break;
					}
					case UNKNOWN:
						throw new CoreException("File extension is not an Excel extension ('.xls' or '.xlsx').");
					}
				}

				return header.getColumns();

			}
			catch(Exception e) {
				throw new CoreException("Document could not be read, because: " + e.getMessage(), e);
			}
			finally {
				if (excelFile != null) {
					boolean success = FileUtils.deleteQuietly(excelFile);//.delete();
					if (!success) logNode.info("Could not delete temp file.");
				}
				
				sb = new StringBuilder("Ready importing Headers ");
				sb.append((System.nanoTime() - importStartTime)/1000000).append(" ms");
				logNode.info(sb.toString());
			}
		}

		//If this statement is reached no template was set
		throw new CoreException("Template or context not set!");
	}

	private HashMap<Integer, String> headersFirstPass(IContext context, IMendixObject templateDocument,
			ExcelExtension extension, int iCanHasSheet, int iCanHasRow) throws CoreException, IOException {
		HashMap<Integer, String> sstmap = null;

		try (InputStream content = Core.getFileDocumentContent(context, templateDocument);) {
			if (content == null)
				throw new CoreException("No content found in templatedocument");
			switch (extension) {
			case XLS: {
				try (POIFSFileSystem poifs = new POIFSFileSystem(content);
				InputStream workbook = poifs.createDocumentInputStream("Workbook");) {
					ExcelXLSReaderHeaderFirstPassListener firstPass = new ExcelXLSReaderHeaderFirstPassListener(iCanHasSheet, iCanHasRow);
	
					HSSFRequest req = new HSSFRequest();
					req.addListenerForAllRecords(firstPass);
					HSSFEventFactory factory = new HSSFEventFactory();
					factory.processEvents(req, workbook);
	
					sstmap = firstPass.getSSTMap();
				}
				break;
			}
			case XLSX: {
				// nothing
				break;
			}
			case UNKNOWN:
				throw new CoreException("File extension is not an Excel extension ('.xls' or '.xlsx').");
			}
		}
		return sstmap;
	}

	public void importData(IContext context, IMendixObject fileDocument, IMendixObject template, IMendixObject parentObject) throws CoreException {
		this.timeMeasurement.startPerformanceTest("Importing data");
	
		this.timeMeasurement.startPerformanceTest("Preparing all import settings");
		
		IMendixIdentifier mxObjectType = (IMendixIdentifier) template.getValue(context,  Template.MemberNames.Template_MxObjectType.toString() );
		if( mxObjectType == null )
			throw new CoreException( "There is no object type selected for the template" );
		String objectTypeName = Core.retrieveId(context, mxObjectType).getValue(context, MxObjectType.MemberNames.CompleteName.toString());

		this.settings = new ExcelReplicationSettings(context, objectTypeName);
		ObjectConfig mainConfig = this.settings.getMainObjectConfig();
		
		switch (ImportActions.valueOf((String)this.template.getValue(this.settings.getContext(), Template.MemberNames.ImportAction.toString()))) {
		case CreateObjects:
			mainConfig.setObjectSearchAction( ObjectSearchAction.CreateEverything );
			break;
		case SynchronizeObjects:
			mainConfig.setObjectSearchAction( ObjectSearchAction.FindCreate );
			break;
		case SynchronizeOnlyExisting:
			mainConfig.setObjectSearchAction( ObjectSearchAction.FindIgnore );
			break;
		case OnlyCreateNewObjects:
			mainConfig.setObjectSearchAction( ObjectSearchAction.OnlyCreateNewObjects );
			break;
		}
		setAdditionalProperties( this.settings.getContext(), this.settings, template );

		HashMap<String, String> sortMap = new HashMap<String, String>();
		sortMap.put(Column.MemberNames.ColNumber.toString(), "ASC");
		List<IMendixObject> columns = Core.retrieveXPathQuery(this.settings.getContext(), "//" + Column.getType() + "[" + Column.MemberNames.Column_Template + "=" + template.getId().toLong() + "]", Integer.MAX_VALUE, 0, sortMap);
		for( IMendixObject column : columns ) {
			DataSource ds = DataSource.valueOf( (String)column.getValue(this.settings.getContext(), Column.MemberNames.DataSource.toString()) );
			MappingType type = MappingType.valueOf((String)column.getValue(this.settings.getContext(), Column.MemberNames.MappingType.toString()));
			String fieldIdentifier = "";
			
			DocProperties docProps = null;
			if( ds == DataSource.CellValue ) {
				Integer colNr = (Integer) column.getValue(this.settings.getContext(), Column.MemberNames.ColNumber.toString());
				fieldIdentifier = colNr.toString();
			}
			else {
				fieldIdentifier = String.valueOf( column.getId().toLong() );
				
				docProps = new DocProperties(ds, type, fieldIdentifier);
				if( ds == DataSource.StaticValue )
					docProps.setStaticStringValue( (String) column.getValue(context, Column.MemberNames.Text.toString()));
			}
			
			if( type == MappingType.Attribute ) {
				MFValueParser parser = null;
				boolean isKey = false;
				if( "Yes".equals(column.getValue(this.settings.getContext(), Column.MemberNames.IsKey.toString())) )
					isKey = true;

				boolean isCaseSensitive = false;
				if( "Yes".equals(column.getValue(this.settings.getContext(), Column.MemberNames.CaseSensitive.toString())) )
					isCaseSensitive = true;

				IMendixIdentifier mf = (IMendixIdentifier) column.getValue(this.settings.getContext(), Column.MemberNames.Column_Microflows.toString());
				if( mf != null ) {
					parser = new MFValueParser( this.settings.getContext(), Core.retrieveId(this.settings.getContext(), mf));
				}

				IMendixObject member = Core.retrieveId(this.settings.getContext(), (IMendixIdentifier)column.getValue(this.settings.getContext(), Column.MemberNames.Column_MxObjectMember.toString()));
				this.settings.addColumnMapping(fieldIdentifier, (String)member.getValue(this.settings.getContext(), MxObjectMember.MemberNames.AttributeName.toString()), isKey, isCaseSensitive, parser);
				
				if( docProps != null ) {
					if( !this.docProperties.containsKey(objectTypeName) )
						this.docProperties.put(objectTypeName, new HashSet<DocProperties>());
					
					this.docProperties.get(objectTypeName).add(docProps);
				}
			}

			else if( type == MappingType.Reference ) {
				MFValueParser parser = null;
				KeyType isKey = KeyType.NoKey;
				if( column.getValue(this.settings.getContext(), Column.MemberNames.IsReferenceKey.toString()) != null && !"".equals(column.getValue(this.settings.getContext(), Column.MemberNames.IsReferenceKey.toString())) ) {
					switch( ReferenceKeyType.valueOf((String) column.getValue(this.settings.getContext(), Column.MemberNames.IsReferenceKey.toString())) )  {
					case NoKey:
						isKey = KeyType.NoKey;
						break;
					case YesMainAndAssociatedObject:
						isKey = KeyType.AssociationAndObjectKey;
						break;
					case YesOnlyAssociatedObject:
						isKey = KeyType.AssociationKey;
						break;
					case YesOnlyMainObject:
						isKey = KeyType.ObjectKey;
						break;
					}
				}

				boolean isCaseSensitive = false;
				if( "Yes".equals(column.getValue(this.settings.getContext(), Column.MemberNames.CaseSensitive.toString())) )
					isCaseSensitive = true;

				IMendixIdentifier mf = (IMendixIdentifier) column.getValue(this.settings.getContext(), Column.MemberNames.Column_Microflows.toString());
				if( mf != null ) {
					parser = new MFValueParser(this.settings.getContext(), Core.retrieveId(this.settings.getContext(), mf));
				}

				IMendixObject member = Core.retrieveId(this.settings.getContext(), (IMendixIdentifier)column.getValue(this.settings.getContext(), Column.MemberNames.Column_MxObjectMember_Reference.toString()));
				IMendixObject association = Core.retrieveId(this.settings.getContext(), (IMendixIdentifier)column.getValue(this.settings.getContext(), Column.MemberNames.Column_MxObjectReference.toString()));
				IMendixObject objectType = Core.retrieveId(this.settings.getContext(), (IMendixIdentifier)column.getValue(this.settings.getContext(), Column.MemberNames.Column_MxObjectType_Reference.toString()));
				
				String associationName = (String)association.getValue(this.settings.getContext(), MxObjectReference.MemberNames.CompleteName.toString());
				this.settings.addAssociationMapping(fieldIdentifier, associationName, (String)objectType.getValue(this.settings.getContext(), MxObjectType.MemberNames.CompleteName.toString()), (String)member.getValue(this.settings.getContext(), MxObjectMember.MemberNames.AttributeName.toString()), parser, isKey, isCaseSensitive);

				if( docProps != null ) {
					if( !this.docProperties.containsKey(associationName) )
						this.docProperties.put(associationName, new HashSet<DocProperties>());
					
					this.docProperties.get(associationName).add(docProps);
				}
			}
			
			if( PrimitiveTypes.DateTime.toString().equals( column.getValue(context, Column.MemberNames.AttributeTypeEnum.toString()) )  ) {
				this.settings.addDefaultInputMask(fieldIdentifier, (String) column.getValue(context, Column.MemberNames.InputMask.toString()));
			}
		}

		List<IMendixObject> refHandlingList = Core.retrieveXPathQuery(this.settings.getContext(), "//" + ReferenceHandling.getType() + "[" + ReferenceHandling.MemberNames.ReferenceHandling_Template + "=" + template.getId().toLong() + "]");
		for(IMendixObject object : refHandlingList ) {
			IMendixObject refObj = Core.retrieveId(this.settings.getContext(), (IMendixIdentifier) object.getValue(this.settings.getContext(), ReferenceHandling.MemberNames.ReferenceHandling_MxObjectReference.toString()));
			String associationName = (String)refObj.getValue(this.settings.getContext(), MxObjectReference.MemberNames.CompleteName.toString());
			ReferenceHandlingEnum selecteReferenceHandling =ReferenceHandlingEnum.valueOf((String)object.getValue(this.settings.getContext(), ReferenceHandling.MemberNames.Handling.toString()));
			
			AssociationConfig config = this.settings.getAssociationConfig(associationName);
			
			switch( selecteReferenceHandling ) {
			case FindCreate:
				config.setObjectSearchAction(ObjectSearchAction.FindCreate);
				break;
			case FindIgnore:
				config.setObjectSearchAction(ObjectSearchAction.FindIgnore);
				break;
			case CreateEverything:
				config.setObjectSearchAction(ObjectSearchAction.CreateEverything);
				break;
			case OnlyCreateNewObjects:
				config.setObjectSearchAction(ObjectSearchAction.OnlyCreateNewObjects);
				break;
			}
			
			ReferenceDataHandling refDataHandling = ReferenceDataHandling.valueOf((String)object.getValue(context, ReferenceHandling.MemberNames.DataHandling.toString()));
			switch( refDataHandling ) {
			case Append:
				config.setAssociationDataHandling(AssociationDataHandling.Append);
				break;
			case Overwrite:
				config.setAssociationDataHandling(AssociationDataHandling.Overwrite);
				break;
			}
			
			config.setPrintNotFoundMessages( (Boolean) object.getValue(this.settings.getContext(), ReferenceHandling.MemberNames.PrintNotFoundMessages.toString()) );
			config.setCommitUnchangedObjects( (Boolean) object.getValue(this.settings.getContext(), ReferenceHandling.MemberNames.CommitUnchangedObjects.toString()) );
			config.setIgnoreEmptyKeys( (Boolean) object.getValue(context, ReferenceHandling.MemberNames.IgnoreEmptyKeys.toString()) );
		}

		IMendixIdentifier pAssociationId = template.getValue(this.settings.getContext(), Template.MemberNames.Template_MxObjectReference_ParentAssociation.toString() );
		if( pAssociationId != null ) {
			String associationName = Core.retrieveId(this.settings.getContext(), pAssociationId).getValue(this.settings.getContext(), MxObjectReference.MemberNames.CompleteName.toString());

			this.settings.setParentAssociation(associationName);
			this.settings.setParentObjectId( parentObject );
		}
		this.timeMeasurement.endPerformanceTest("Preparing all import settings");
		logNode.info("Starting XLS import Template: " + this.descr);

		long importStartTime = System.nanoTime();

		File excelFile = null; 
				
		try {
			// we store sheetnr and startrow as a zero-based number 
			// Start importing at this sheet / row
			int iCanHasSheet = (Integer) template.getValue(this.settings.getContext(), Template.MemberNames.SheetIndex.toString());
			iCanHasSheet --;
			if( iCanHasSheet < 0 )
				throw new CoreException("The sheetnumber must be larger than 1");

			int startRow = (Integer) template.getValue(this.settings.getContext(), Template.MemberNames.FirstDataRowNumber.toString());
			startRow --;
			if( startRow < 0 )
				throw new CoreException("The rownumber must be larger than 1");

			
			// Data - 1st pass ... make a sstmap describing which strings we want to load from the excel SST
			switch(getExcelExtension(this.settings.getContext(), fileDocument)) {
				case XLS: {
					ExcelXLSReaderDataFirstPassListener firstPass = new ExcelXLSReaderDataFirstPassListener(iCanHasSheet, startRow, this);
					{
						try (InputStream content = Core.getFileDocumentContent(this.settings.getContext(), fileDocument);
								POIFSFileSystem poifs = new POIFSFileSystem(content);
								InputStream workbook = poifs.createDocumentInputStream("Workbook");) {
							HSSFRequest req = new HSSFRequest();
							req.addListenerForAllRecords(firstPass);
							HSSFEventFactory factory = new HSSFEventFactory();
							factory.processEvents(req, workbook);
						}
					}
					HashMap<Integer, String> sstmap = firstPass.getSSTMap();
					
					// Data - 2nd pass
					ExcelXLSReaderDataSecondPassListener secondPass = new ExcelXLSReaderDataSecondPassListener(iCanHasSheet, startRow, sstmap, this, firstPass.getNrOfColumns());
					{
						try (InputStream content = Core.getFileDocumentContent(this.settings.getContext(), fileDocument);
								POIFSFileSystem poifs = new POIFSFileSystem(content);
								InputStream workbook = poifs.createDocumentInputStream("Workbook");) {
							HSSFRequest req = new HSSFRequest();
							req.addListenerForAllRecords(secondPass);
							HSSFEventFactory factory = new HSSFEventFactory();
							factory.processEvents(req, workbook);
						}
					}

					break;
				}
				case XLSX: {
					String xpath = String.format("count(//%s[%s = %d])", 
							Column.entityName, 
							Column.MemberNames.Column_Template, 
							template.getId().toLong());
					
					logNode.debug(xpath);
					Long nrOfCols = Core.retrieveXPathQueryAggregate(this.settings.getContext(), xpath);
					
					logNode.debug("nrOfCols: " + nrOfCols);

					// xlsx rows are 1-based
					excelFile = getExcelFile(this.settings.getContext(), fileDocument);
					ExcelXLSXDataReader.readData(excelFile.getAbsolutePath(), iCanHasSheet, startRow + 1, this);
					break;
				}
				case UNKNOWN:
					throw new CoreException("File extension is not an Excel extension ('.xls' or '.xlsx').");
			}

			logNode.info( "Successfully finished importing " + this.descr + ((System.nanoTime() - importStartTime)/1000000) + " ms");
		}
		catch(Exception e) {
			logNode.info( "Error while importing " + this.descr + ((System.nanoTime() - importStartTime)/1000000) + " ms");
			throw new CoreException("Document could not be imported, because: " + e.getMessage(), e);
		}
		finally {
			this.docProperties.clear();
			this.settings.clear();
			if (excelFile != null) {
				boolean success = FileUtils.deleteQuietly(excelFile);//.delete();
				if (!success) logNode.info("Could not delete temp file.");
			}
			
			this.timeMeasurement.endPerformanceTest("Importing data");
		}
	}
	
	private static File getExcelFile(IContext context, IMendixObject file) throws IOException {
		File f = new File(Core.getConfiguration().getTempPath().getAbsolutePath() + "/Mendix_ExcelImporter_" + file.getId().toLong(), "");
		try (InputStream inputstream = Core.getFileDocumentContent(context, file);
				OutputStream outputstream = new FileOutputStream(f);) {
			IOUtils.copy(inputstream, outputstream);
		}
		return f;
	}
	
	/**
	 * Set the additional properties in the settings object
	 * This is done by retrieving the associated AdditionalProperties object from the Template.
	 * 
	 * @param context
	 * @param settings
	 * @param template
	 * @throws CoreException
	 */
	private static void setAdditionalProperties(IContext context, ExcelReplicationSettings settings, IMendixObject template) throws CoreException {
		IMendixIdentifier addPropertyId = template.getValue(context, Template.MemberNames.Template_AdditionalProperties.toString());
		if( addPropertyId != null ) {
			IMendixObject addProperties = Core.retrieveId(context, addPropertyId);
			if( addProperties != null ) {
				if( addProperties.getValue(context, AdditionalProperties.MemberNames.PrintStatisticsMessages.toString()) == null ) 
					settings.printImportStatistics( StatisticsLevel.AllStatistics );
				else {					
					switch ( excelimporter.proxies.StatisticsLevel.valueOf( (String) addProperties.getValue(context, AdditionalProperties.MemberNames.PrintStatisticsMessages.toString()) ) ) {
					case AllStatistics : 
						settings.printImportStatistics( StatisticsLevel.AllStatistics );
						break;
					case OnlyFinalStatistics : 
						settings.printImportStatistics( StatisticsLevel.OnlyFinalStatistics );
						break;
					case NoStatistics :
						settings.printImportStatistics( StatisticsLevel.NoStatistics );
						break;
					default: 
						settings.printImportStatistics( StatisticsLevel.AllStatistics );
						break;
					}
				}
				settings.getMainObjectConfig().setPrintNotFoundMessages( (Boolean)addProperties.getValue(context, AdditionalProperties.MemberNames.PrintNotFoundMessages_MainObject.toString()) );
				settings.ignoreEmptyKeys( (Boolean)addProperties.getValue(context, AdditionalProperties.MemberNames.IgnoreEmptyKeys.toString()) );
				
				settings.getMainObjectConfig().setCommitUnchangedObjects( (Boolean)addProperties.getValue(context, AdditionalProperties.MemberNames.CommitUnchangedObjects_MainObject.toString()) );
				settings.resetEmptyAssociations( (Boolean)addProperties.getValue(context, AdditionalProperties.MemberNames.ResetEmptyAssociations.toString())  );

				
				settings.useTransactions(false);
				settings.importInNewContext(false);

				RemoveIndicator indicator = RemoveIndicator.valueOf( (String) addProperties.getValue(context, AdditionalProperties.MemberNames.RemoveUnsyncedObjects.toString()) );
				ObjectConfig mainConfig = settings.getMainObjectConfig();
				IMendixIdentifier identifier;
				switch ( indicator ) {
				case RemoveUnchangedObjects :
					identifier = addProperties.getValue(context, AdditionalProperties.MemberNames.AdditionalProperties_MxObjectMember_RemoveIndicator.toString());
					if (identifier != null)
						mainConfig.removeUnusedObjects( ChangeTracking.RemoveUnchangedObjects,  (String) Core.retrieveId(context, identifier).getValue(context, MxObjectMember.MemberNames.AttributeName.toString()) );
						
					break;
				case TrackChanges :
					identifier = addProperties.getValue(context, AdditionalProperties.MemberNames.AdditionalProperties_MxObjectMember_RemoveIndicator.toString());
					if (identifier != null)
						mainConfig.removeUnusedObjects( ChangeTracking.TrackChanges,  (String) Core.retrieveId(context, identifier).getValue(context, MxObjectMember.MemberNames.AttributeName.toString()) );
					break;
				case Nothing :
				default :
					mainConfig.removeUnusedObjects( ChangeTracking.Nothing, null );
					break;
				}
				
				if( addProperties.hasMember("RetrieveOQL_Limit") ) {
					Integer limit = (Integer) addProperties.getValue(context, "RetrieveOQL_Limit");
					if( limit != null ) {
						logNode.debug("Changing retrieve limit to: " + limit);
						settings.Configuration.RetrieveOQL_Limit = limit;
					}
				}
			}
		}
	}

	/**
	 * Convert column number to Excel column text (0=A, 25=Z, 26=AA, 77=BZ, 78=CA etc)
	 * @param col
	 * @return string representation of this column number
	 */
	public static String colNumberToText(short col) {
		char firstChar = (char)((col/26)+64);
		char secondChar = (char)((col%26)+65);
		if (firstChar == '@') return String.valueOf(secondChar);
		return "" + firstChar + secondChar;
	}

	public ExcelReplicationSettings getSettings() {
		return this.settings;
	}

	public Map<String, Set<DocProperties>> getDocPropertiesMapping() {
		return this.docProperties ;
	}
}
