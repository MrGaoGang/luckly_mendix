package excelimporter.reader.readers;

import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.BuiltinFormats;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.SAXNotRecognizedException;
import org.xml.sax.SAXNotSupportedException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

import com.mendix.core.Core;

import replication.ValueParser;
import replication.ValueParser.ParseException;
import excelimporter.reader.readers.ExcelRowProcessor.ExcelCellData;

public abstract class ExcelXLSXReader {

	protected static abstract class ExcelSheetHandler extends DefaultHandler {

		private StylesTable stylesTable;
		private ReadOnlySharedStringsTable stringsTable;

		private int startRowNr = 1;
		private boolean handleRow = false;
		private short excelStyle = -1;
		private ExcelType excelType;
		private int colNr = 0;
		private String colString = "";
		private int currentRow = 0;
		private int currentSheet = 0;

		private String formatString;
		private short formatIndex;
		private final DataFormatter formatter;

		private StringBuilder cellValue;
		private StringBuilder formula;
		private boolean isProcessingCellValue = false;
		private boolean isProcessingFormula = false;

		private ExcelCellData[] values;


		protected ExcelSheetHandler( ReadOnlySharedStringsTable stringsTable, StylesTable stylesTable, int sheetNr, int startRowNr ) {
			this.formatter = new DataFormatter();
			this.stylesTable = stylesTable;
			this.stringsTable = stringsTable;

			this.currentSheet = sheetNr;
			this.startRowNr = startRowNr;

			this.cellValue = new StringBuilder();
			this.formula = new StringBuilder();

			this.values = null; // will be assigned when we encounter the dimension node. (Parser will fail without this
								// node, but it seems always present.)
		}

		@Override
		public void characters( char[] ch, int start, int length ) throws SAXException {
			if ( this.handleRow && this.isProcessingCellValue )
				this.cellValue.append(ch, start, length);

			else if ( this.handleRow && this.isProcessingFormula )
				this.formula.append(ch, start, length);
		}

		protected boolean evaluateRow( String localName, Attributes attributes ) {
			if ( localName.equals("row") ) {
				String rowNr = attributes.getValue("r");
				this.currentRow = Integer.parseInt(rowNr);
				if ( !this.handleRow ) {
					this.handleRow = null != rowNr && this.currentRow >= this.startRowNr;
				}

				if ( ExcelReader.logNode.isDebugEnabled() && (this.currentRow % 100) == 0 )
					ExcelReader.logNode.debug("Start evaluating row: " + this.currentRow);

				return true;
			}
			return false;
		}

		protected boolean evaluateFormula( String name ) throws SAXException {
			if ( "f".equals(name) ) {
				// Clear contents cache
				this.formula.setLength(0);
				// Mark us as being a formula if not already
				if ( this.excelType == ExcelType.NUMBER ) {
					this.excelType = ExcelType.FORMULA;
				}

				this.isProcessingFormula = true;
				return true;
			}
			return false;
		}

		protected boolean evaluateColumn( String localName, Attributes attributes ) throws SAXException {
			if ( localName.equals("c") && this.handleRow ) {
				this.colString = attributes.getValue("r");
				this.colNr = parseCol(this.colString);

				return true;
			}

			return false;
		}

		protected boolean evaluateTextTag( String localName, boolean useColumn ) {
			if ( isTextTag(localName, useColumn) ) {
				this.isProcessingCellValue = true;
				this.cellValue.setLength(0);

				return true;
			}

			return false;
		}

		protected void evaluateCellStyle( Attributes attributes ) {
			/*
			 * Track the excel cell style so we can print a warning later on when we have a fall through in the processing of function: evaluateCellData
			 * When we have a style but can't identify the type there is something wrong with the excel sheet
			 */
			this.excelStyle = -1;
			String cellStyle = attributes.getValue("s");
			if ( cellStyle != null ) {
				XSSFCellStyle style = this.stylesTable.getStyleAt(Integer.parseInt(cellStyle));
				this.excelStyle = style.getDataFormat();

				if ( ExcelReader.logNode.isTraceEnabled() )
					ExcelReader.logNode.trace("Found excel style: " + style.getDataFormatString());
			}
			else {
				this.excelStyle = -1;
			}

			
			this.formatString = null;
			String cellType = attributes.getValue("t");
			// Source: http://www.schemacentral.com/sc/ooxml/a-t-8.html
			this.excelType = ExcelType.NUMBER;
			if ( "b".equals(cellType) )
				this.excelType = ExcelType.BOOLEAN;
			else if ( "e".equals(cellType) )
				this.excelType = ExcelType.ERROR;
			else if ( "inlineStr".equals(cellType) )
				this.excelType = ExcelType.STRING;
			else if ( "s".equals(cellType) )
				this.excelType = ExcelType.SHARED_STRING;
			else if ( "str".equals(cellType) )
				this.excelType = ExcelType.FORMULA;
			else {
				String cellStyleStr = attributes.getValue("s");
				if ( cellStyleStr != null ) {
					// Number, but almost certainly with a special style or format
					int styleIndex = Integer.parseInt(cellStyleStr);
					XSSFCellStyle style = this.stylesTable.getStyleAt(styleIndex);
					this.formatIndex = style.getDataFormat();
					this.formatString = style.getDataFormatString();
					if ( this.formatString == null )
						this.formatString = BuiltinFormats.getBuiltinFormat(this.formatIndex);
				}
			}
		}

		protected ExcelCellData evaluateCellData() throws SAXException {
			String cellValueString = this.cellValue.toString();
			ExcelCellData cellData = null;

			try {
				if ( this.excelType != null ) {

					if ( ExcelReader.logNode.isTraceEnabled() )
						ExcelReader.logNode.trace("Reading " + this.colString + " / '" + cellValueString + "' / " + this.excelType);

					switch (this.excelType) {
					case BOOLEAN:
						cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, Integer.parseInt(cellValueString) == 1);
						break;
					case ERROR:
						// imported as null, because this can be handled in Mendix
						cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, "ERROR:" + cellValueString);
						break;
					case FORMULA:
						cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, cellValueString);

						// We have the formula available, but it makes sense not to use it - this.formula.toString());
						break;

					case STRING: // We haven't seen this yet.
						XSSFRichTextString rtsi = new XSSFRichTextString(cellValueString);
						cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, rtsi.toString());
						break;
					case SHARED_STRING:
						String rtsValue = null;
						try {
							int idx = Integer.parseInt(cellValueString);
							XSSFRichTextString rtss = new XSSFRichTextString(this.stringsTable.getEntryAt(idx));
							rtsValue = rtss.toString();
						}
						catch( NumberFormatException ex ) {
							ExcelReader.logNode.warn("Failed to parse SST index '" + cellValueString + "': " + ex.toString());
						}
						cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, rtsValue);

						break;
					case NUMBER:
						if ( this.formatString != null ) {
							Double dblCellValue = Double.parseDouble(cellValueString);
							cellData = new ExcelCellData(this.getCurrentColumnNr(), dblCellValue, this.formatter.formatRawCellContents(
									dblCellValue, this.formatIndex, this.formatString), this.formatString);

							if ( ExcelReader.logNode.isTraceEnabled() )
								ExcelReader.logNode
										.trace("Formatting " + this.colString + " / '" + cellValueString + "' using format: '" + this.formatString + "' as " + this.formatter
												.formatRawCellContents(dblCellValue, this.formatIndex, this.formatString));
						}
						else
							cellData = new ExcelCellData(this.getCurrentColumnNr(), cellValueString, null);

						break;
					}
				}

				// Only print debugging if the cell was intended to be rendered different than a String
				else if ( ExcelReader.logNode.isTraceEnabled() && this.excelStyle != 0 && this.excelStyle != -1 )
					ExcelReader.logNode
							.trace("Skipping style analysis for row: " + this.currentRow + " column: " + this.colNr + " style: " + this.excelStyle + " value: | " + cellValueString);

				if ( cellData == null && this.excelType != ExcelType.ERROR ) {
					try {
						// Parsing as a double is necessary, since a custom date/time format/style will have to
						// be parsed as a double.
						// Parsing a generally styled cell that contains an integer as a double here, is also
						// safe,
						// since it will be cast to its destination (Mendix) type inside the replication engine.
						//
						// All strings created in xlsx-format are usually stored in the shared strings table,
						// so an actual string here, will never occur, since inline strings are handled in the
						// "t" if statement below.
						cellData = new ExcelCellData(this.colNr, cellValueString, ValueParser.getDoubleValue(cellValueString));
					}
					catch( NumberFormatException nfe ) {
						cellData = new ExcelCellData(this.colNr, cellValueString, null);
					}
				}
			}
			catch( ParseException e ) {
				throw new SAXException("Unable to parse the value for column: " + this.colNr + " with original value: " + cellValueString, e);
			}
			return cellData;
		}

		protected int evaluateDimension( Attributes attributes ) throws SAXException {
			String dim = null;
			try {
				dim = attributes.getValue("ref");
				String[] fromTo = dim.split(":");

				int colTo = parseCol(fromTo[1]);
				this.values = new ExcelCellData[colTo + 1];

				return colTo;
			}
			catch( Exception e ) {
				throw new SAXException("Problem parsing Excel sheet dimension: " + (dim != null ? dim : "no ref attribute?"));
			}
		}


		protected void closeTextProcessing( String localName, boolean useColumn ) throws SAXException {
			if ( isTextTag(localName, useColumn) ) {
				this.isProcessingCellValue = false;
				ExcelCellData cellData = evaluateCellData();

				this.values[this.getCurrentColumnNr()] = cellData;
				this.isProcessingCellValue = false;
			}

		}


		protected boolean isTextTag( String localName, boolean useColumn ) {
			if ( this.handleRow && useColumn ) {
				if ( localName.equals("v") )
					return true;
				if ( "inlineStr".equals(localName) )
					return true;
				if ( localName.equals("t") && this.isProcessingCellValue )
					return true;
			}
			return false;
		}

		protected static int parseCol( String col ) throws SAXException {
			if ( col == null ) {
				throw new SAXException("Column designation not specified. Excel file is broken.");
			}

			List<Character> colList = new ArrayList<Character>(3); // cannot be more than 3 chars in col designation
																	// according to Excel 2007 / OOXML spec
			for( int i = 0; i < col.length(); i++ ) {
				char c = col.charAt(i);
				// should check if it is actually a latin letter (not just isLetter; how does isLetter work exactly
				// internally?); not a problem for correctly created excel docs.
				if ( Character.isLetter(c) ) {
					colList.add(c);
				}
			}
			if ( !colList.isEmpty() ) {
				int colNumber = 0;
				int colListSize = colList.size();
				for( int i = 0; i < colListSize; ++i ) {
					int colPartNumber = Character.getNumericValue(colList.get(i)) - 9;
					int colPartWeight = (int) Math.pow(26, colListSize - i - 1);
					colNumber += colPartNumber * colPartWeight;
				}
				return colNumber - 1;
			}
			else {
				throw new SAXException("Column designation could not be parsed: '" + col + "'.");
			}
		}

		protected final ExcelCellData[] getValues() {
			return this.values;
		}

		protected boolean shouldHandleRow() {
			return this.handleRow;
		}

		protected int getCurrentSheet() {
			return this.currentSheet;
		}

		protected int getCurrentRow() {
			return this.currentRow;
		}

		protected int getCurrentColumnNr() {
			return this.colNr;
		}

		protected String getCurrentColumnStr() {
			return this.colString;
		}
	}
	
	/**
	 * Sets sensible defaults for the XML parser used to read excel XLSX files.
	 */
	static void setXMLReaderProperties(XMLReader parser) throws SAXNotRecognizedException, SAXNotSupportedException {
		boolean isExternalEntitiesEnabled = Boolean.valueOf("true").equals(Core.getConfiguration().getConstantValue("ExcelImporter.EnableExternalEntities"));
		
		parser.setFeature("http://xml.org/sax/features/external-general-entities", isExternalEntitiesEnabled);
		parser.setFeature("http://xml.org/sax/features/external-parameter-entities", isExternalEntitiesEnabled);
		parser.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", isExternalEntitiesEnabled);
	}

	protected enum ExcelType {
		STRING, SHARED_STRING, NUMBER, BOOLEAN, ERROR, FORMULA
	}
}
