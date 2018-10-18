package excelimporter.reader.readers;

import java.util.HashMap;

import org.apache.poi.hssf.eventusermodel.HSSFListener;
import org.apache.poi.hssf.record.BOFRecord;
import org.apache.poi.hssf.record.BoolErrRecord;
import org.apache.poi.hssf.record.FormulaRecord;
import org.apache.poi.hssf.record.LabelSSTRecord;
import org.apache.poi.hssf.record.NumberRecord;
import org.apache.poi.hssf.record.Record;
import org.apache.poi.hssf.record.SSTRecord;

/**
 * 
 * 
 * @author J. van der Hoek - Mendix
 * @version $Id: ExcelXLSReaderDataFirstPassListener.java 8202 2008-10-03 10:05:54Z Jonathan Veldhuizen $
 */
public class ExcelXLSReaderDataFirstPassListener implements HSSFListener {
	private final int iCanHasSheet;
	private final int startRow;
	private int nrOfColumns = 1;

	private ExcelReader xlsReader;

	int workbookNow = -1;
	int sheetNow = -1;

	private HashMap<Integer,String> sstmap;

	public ExcelXLSReaderDataFirstPassListener(int iCanHasSheet, int startRow, ExcelReader xlsReader )  {
		this.iCanHasSheet = iCanHasSheet;
		this.startRow = startRow;
		this.xlsReader = xlsReader;
	}

	/**
	 * This method listens for incoming records and handles them as required.
	 * @param record The record that was found while reading.
	 */
	@Override
	public void processRecord(Record record) {
		// Most frequent encountered first...
		switch (record.getSid()) {
//		case FormatRecord.sid: {
//			FormatRecord frec = (FormatRecord) record;
//			frec.getIndexCode();
//			frec.getFormatString();
//			break;
//		}
		case LabelSSTRecord.sid:
			if (this.sheetNow == this.iCanHasSheet) {
				LabelSSTRecord lrec = (LabelSSTRecord) record;
				int row = lrec.getRow();
				short col = lrec.getColumn();
				if( this.nrOfColumns < col )
					this.nrOfColumns = col;
				if( this.mayUseValue(row, col)) {
					int sstindex = lrec.getSSTIndex();

					if( ExcelReader.logNode.isDebugEnabled() )
						ExcelReader.logNode.debug("XLS_DATA-1stPass: LabelSSTRecord found for row: " + (row+1) + " col: " + ExcelReader.colNumberToText(col) + " sstindex: " + sstindex);
					// mark this spot in the sstlist, so it will be filled with the string at second pass
					this.sstmap.put(sstindex, "");
				}
			}
			break;
		case NumberRecord.sid:
			if (this.sheetNow == this.iCanHasSheet) {
				NumberRecord nrec = (NumberRecord) record;
				short col = nrec.getColumn();
				if( this.nrOfColumns < col )
					this.nrOfColumns = col;
			}
			break;
		case BoolErrRecord.sid:
			if (this.sheetNow == this.iCanHasSheet) {
				BoolErrRecord brec = (BoolErrRecord) record;
				short col = brec.getColumn();
				if( this.nrOfColumns < col )
					this.nrOfColumns = col;
			}
			break;
			// the BOFRecord can represent either the beginning of a sheet or the workbook
		case BOFRecord.sid:
			BOFRecord bof = (BOFRecord) record;
			if (bof.getType() == BOFRecord.TYPE_WORKBOOK) {
				++this.workbookNow;

				if( ExcelReader.logNode.isDebugEnabled() )
					ExcelReader.logNode.debug("XLS_DATA-1stPass: Now at workbook " + (this.workbookNow+1));
			} else if (bof.getType() == BOFRecord.TYPE_WORKSHEET) {
				++this.sheetNow;

				if( ExcelReader.logNode.isDebugEnabled() )
					ExcelReader.logNode.debug("XLS_DATA-1stPass: Now at worksheet " + (this.sheetNow+1));
			}
			break;
		case org.apache.poi.hssf.record.FormulaRecord.sid:
			if (this.sheetNow == this.iCanHasSheet) {
				FormulaRecord lrec = (FormulaRecord) record;
				short col = lrec.getColumn();
				if( this.nrOfColumns < col )
					this.nrOfColumns = col;
			}
			break;
		case SSTRecord.sid:
			SSTRecord sstrec = (SSTRecord) record;
			this.sstmap = new HashMap<Integer,String>(); // don't know the preferred size here...

			if( ExcelReader.logNode.isDebugEnabled() )
				ExcelReader.logNode.debug("XLS_DATA-1stPass: Static String Table found with NumUniqueStrings: " + sstrec.getNumUniqueStrings());
			break;
		}
	}

	public HashMap<Integer,String> getSSTMap() {
		return this.sstmap;
	}

	private boolean mayUseValue( int row, int col ) {
		return row >= this.startRow && this.xlsReader.getSettings().aliasIsMapped( String.valueOf(col) );
	}

	public int getNrOfColumns() {
		return this.nrOfColumns;
	}
}
