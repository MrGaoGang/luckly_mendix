package excelimporter.reader.readers;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import replication.MetaInfo;
import replication.MetaInfo.MetaInfoObject;
import replication.ReplicationSettings.MendixReplicationException;
import replication.ValueParser.ParseException;

import com.mendix.systemwideinterfaces.core.meta.IMetaPrimitive.PrimitiveType;

import excelimporter.reader.readers.replication.ExcelReplicationSettings;
import excelimporter.reader.readers.replication.ExcelValueParser;

public class ExcelRowProcessor {

	private ExcelValueParser valueParser;
	private MetaInfo info;
	private ExcelReader xlsReader;

	private long rowCounter;
	private boolean hasDocProps;
	private Map<String, Set<DocProperties>> docProps;


	public ExcelRowProcessor( ExcelReader xlsReader ) throws MendixReplicationException {
		this.xlsReader = xlsReader;
		this.valueParser = new ExcelValueParser(this.xlsReader.getSettings().getValueParsers(), this.xlsReader.getSettings());
		this.info = new MetaInfo(this.xlsReader.getSettings(), this.valueParser, "XLSReader");
		this.docProps = xlsReader.getDocPropertiesMapping();
		this.hasDocProps = this.docProps.size() > 0;

		this.rowCounter = 0;
	}

	public void processValues( ExcelCellData[] values, int rowNow, int sheetNow ) throws MendixReplicationException {
		ExcelReplicationSettings settings = this.xlsReader.getSettings();
		try {
			String objectKey = this.valueParser.buildObjectKey(values, settings.getMainObjectConfig());
			if ( ExcelReader.logNode.isTraceEnabled() )
				ExcelReader.logNode
						.trace("Start procssing excel row: " + this.rowCounter + " found: " + values.length + " columns to process. Using ObjectKey: " + objectKey);


			Map<String, Long> prevObject = null;
			if ( this.hasDocProps )
				prevObject = new HashMap<String, Long>();
			rowNow++;
			sheetNow++;

			for( int i = 0; i < values.length; i++ ) {
				String alias = String.valueOf(i);
				if ( settings.aliasIsMapped(alias) ) {

					String id;
					PrimitiveType type = this.xlsReader.getSettings().getMemberType(alias);
					MetaInfoObject miObject;

					Object processedValue = this.valueParser.getValueFromDataSet(alias, type, values);

					if ( settings.treatFieldAsReference(alias) ) {
						miObject = this.info.setAssociationValue(objectKey, alias, processedValue);
						id = this.xlsReader.getSettings().getAssociationNameByAlias(alias);
					}
					else if ( settings.treatFieldAsReferenceSet(alias) ) {
						miObject = this.info.addAssociationValue(objectKey, alias, processedValue);
						id = this.xlsReader.getSettings().getAssociationNameByAlias(alias);
					}
					else {
						miObject = this.info.addValue(objectKey, alias, processedValue);
						id = this.xlsReader.getSettings().getMainObjectConfig().getObjectType();
					}
					Long columnObjectID = (miObject == null ? null : miObject.getId());

					if ( this.hasDocProps && this.docProps.containsKey(id) ) {
						if ( !prevObject.containsKey(id) || columnObjectID != prevObject.get(id) ) {
							prevObject.put(id, columnObjectID);

							for( DocProperties props : this.docProps.get(id) ) {
								Object value = null;
								switch (props.getDataSource()) {
								case DocumentPropertyRowNr:
									value = rowNow;
									break;
								case DocumentPropertySheetNr:
									value = sheetNow;
									break;
								case StaticValue:
									value = props.getStaticStringValue();
									break;
								case CellValue:
									break;
								}

								switch (props.getMappingType()) {
								case Attribute:
									this.info.addValue(objectKey, props.getColumnAlias(), value);
									break;
								case Reference:
									this.info.addAssociationValue(objectKey, props.getColumnAlias(), value);
									break;
								default:
									break;
								}
							}
						}
					}
				}
			}


		}
		catch( ParseException e ) {
			if ( !settings.getErrorHandler().valueException(e, e.getMessage()) )
				throw e;
		}

		this.rowCounter++;
		resetValuesArray(values);
	}

	public static class ExcelCellData {

		private Object formattedData;
		private Object rawData;
		private int colNr;
		private String displayMask;

		public ExcelCellData( int colNr, Object rawData, Object formattedData ) {
			this.colNr = colNr;
			this.rawData = rawData;
			this.formattedData = formattedData;
		}


		public ExcelCellData( int colNr, Object rawData, Object formattedData, String displayMask ) {
			this.colNr = colNr;
			this.rawData = rawData;
			this.formattedData = formattedData;
			this.displayMask = displayMask;
		}

		public String getDisplayMask() {
			return this.displayMask;
		}

		public int getColNr() {
			return this.colNr;
		}

		public Object getFormattedData() {
			return this.formattedData;
		}

		public Object getRawData() {
			return this.rawData;
		}
	}

	private static void resetValuesArray( Object[] values ) {
		for( int i = 0; i < values.length; i++ ) {
			values[i] = null;
		}
	}

	public void finish() throws MendixReplicationException {
		this.info.finished();
	}


}
