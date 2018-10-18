package excelimporter.reader.readers;

import java.io.IOException;
import java.io.InputStream;

import org.apache.poi.openxml4j.exceptions.OpenXML4JException;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.model.StylesTable;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.XMLReaderFactory;

import replication.ReplicationSettings.MendixReplicationException;
import excelimporter.reader.readers.replication.ExcelReplicationSettings;

public class ExcelXLSXDataReader extends ExcelXLSXReader {

	public static void readData( String fullPathExcelFile, int sheetNr, int startRowNr, ExcelReader xlsReader ) throws IOException, OpenXML4JException, SAXException, MendixReplicationException {
		OPCPackage opcPackage = null;
		InputStream sheet = null;
		ExcelRowProcessor excelRowProcessor = null;
		try {
			opcPackage = OPCPackage.open(fullPathExcelFile, PackageAccess.READ);
			XSSFReader reader = new XSSFReader(opcPackage);
			ReadOnlySharedStringsTable stringsTable = new ReadOnlySharedStringsTable(opcPackage);
			StylesTable stylesTable = reader.getStylesTable();

			excelRowProcessor = new ExcelRowProcessor(xlsReader);

			XMLReader parser = XMLReaderFactory.createXMLReader();
			ExcelXLSXReader.setXMLReaderProperties(parser);
			ExcelReader.logNode.trace("Loaded SAX Parser: " + parser);
			SheetHandler handler = new SheetHandler(xlsReader, stringsTable, stylesTable, startRowNr, excelRowProcessor, sheetNr);
			parser.setContentHandler(handler);

			sheet = reader.getSheet("rId" + (sheetNr + 1)); // API is 1-based; parameter is zero-based.
			InputSource sheetSource = new InputSource(sheet);
			parser.parse(sheetSource);
		}
		finally {
			try {
				if (excelRowProcessor != null)
					excelRowProcessor.finish();
			} catch (MendixReplicationException e) {} // Quitely finishing
			try {
				if (sheet != null)
					sheet.close();
			} catch (IOException ioe) {} // Quitely closing
			if (opcPackage != null)
				opcPackage.revert();
		}
	}

	private static class SheetHandler extends ExcelSheetHandler {

		private boolean[] columnsUsed;
		private boolean handleCol = false;

		private ExcelRowProcessor excelRowProcessor;
		private ExcelReplicationSettings settings;


		private SheetHandler( ExcelReader xlsReader, ReadOnlySharedStringsTable stringsTable, StylesTable stylesTable, int startRowNr,
				ExcelRowProcessor excelRowProcessor, int sheetNr ) throws MendixReplicationException {
			super(stringsTable, stylesTable, sheetNr, startRowNr);
			this.excelRowProcessor = excelRowProcessor;

			this.settings = xlsReader.getSettings();
		}

		@Override
		public void startElement( String uri, String localName, String name, Attributes attributes ) throws SAXException {
			if ( evaluateTextTag(localName, this.handleCol) ) {
			}
			else if ( evaluateColumn(localName, attributes) ) {
				if ( this.getCurrentColumnNr() < this.columnsUsed.length )
					this.handleCol = this.columnsUsed[this.getCurrentColumnNr()];
				else
					this.handleCol = false;

				if ( this.handleCol ) {
					evaluateCellStyle(attributes);
				}
			}
			else if ( evaluateFormula(name) ) {
			}
			else if ( evaluateRow(localName, attributes) ) {
			}
			else if ( localName.equals("dimension") ) { // only encountered once
				int colTo = evaluateDimension(attributes);

				this.columnsUsed = new boolean[colTo + 1];
				for( int i = 0; i < this.columnsUsed.length; i++ ) {
					this.columnsUsed[i] = this.settings.aliasIsMapped(String.valueOf(i));
				}
			}
		}

		@Override
		public void endElement( String uri, String localName, String name ) throws SAXException {
			// If there is something wrong with the Excel XML then we don't try to fix it here.
			if ( this.shouldHandleRow() ) {
				closeTextProcessing(localName, this.handleCol);

				if ( localName.equals("row") ) {
					boolean processRow = false;
					// Check that at least one value is present, we want to skip blank lines
					for( Object value : this.getValues() ) {
						if ( null != value && value.toString().trim().length() != 0 ) {
							processRow = true;
							break;
						}
					}

					if ( processRow ) {
						try {
							this.excelRowProcessor.processValues(this.getValues(), this.getCurrentRow() - 1, this.getCurrentSheet());
						}
						catch( MendixReplicationException e ) {
							throw new SAXException("Unable to store Excel row. Error found in row of cell nr: " + this.getCurrentColumnStr(), e);
						}
					}
				}
			}
		}


	}
}
