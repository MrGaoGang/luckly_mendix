package excelimporter.reader.readers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

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
 * @author H. van Kranenburg, J. van der Hoek, J. Veldhuizen
 * @version $Id: ExcelXLSReaderHeaderSecondPassListener.java 8202 2008-10-03 10:05:54Z Jonathan Veldhuizen $
 */
public class ExcelXLSReaderHeaderSecondPassListener implements HSSFListener, ExcelHeadable {

	private final int sheet;
	private final int row;
	private final HashMap<Integer, String> sstmap;

	private List<ExcelColumn> excelColumns = new ArrayList<ExcelColumn>();

	int workbookNow = -1;
	int sheetNow = -1;

	public ExcelXLSReaderHeaderSecondPassListener( int sheet, int row, HashMap<Integer, String> sstmap ) {
		this.sheet = sheet;
		this.row = row;
		this.sstmap = sstmap;
	}

	/**
	 * This method listens for incoming records and handles them as required.
	 * 
	 * @param record The record that was found while reading.
	 */
	@Override
	public void processRecord( Record record ) {
		// Most frequent encountered first...
		switch (record.getSid()) {
		case LabelSSTRecord.sid:
			if ( this.sheetNow == this.sheet ) {
				LabelSSTRecord lrec = (LabelSSTRecord) record;
				if ( lrec.getRow() == this.row ) {
					short col = lrec.getColumn();
					String text = this.sstmap.get(lrec.getSSTIndex());
					this.processRecord(col, text);
				}
			}
			break;
		case NumberRecord.sid:
			if ( this.sheetNow == this.sheet ) {
				NumberRecord nrec = (NumberRecord) record;
				if ( nrec.getRow() == this.row ) {
					short col = nrec.getColumn();
					this.processRecord(col, nrec.getValue());
				}
			}
			break;
		case BoolErrRecord.sid:
			if ( this.sheetNow == this.sheet ) {
				BoolErrRecord brec = (BoolErrRecord) record;
				if ( brec.getRow() == this.row ) {
					short col = brec.getColumn();
					this.processRecord(col, brec.getBooleanValue());
				}
			}
			break;
		case FormulaRecord.sid:
			if ( this.sheetNow == this.sheet ) {
				FormulaRecord frec = (FormulaRecord) record;
				if ( frec.getRow() == this.row ) {
					short col = frec.getColumn();
					this.processRecord(col, frec.getValue());
				}
			}
			break;
		// the BOFRecord can represent either the beginning of a sheet or the workbook
		case BOFRecord.sid:
			BOFRecord bof = (BOFRecord) record;
			if ( bof.getType() == BOFRecord.TYPE_WORKBOOK ) {
				++this.workbookNow;
			}
			else if ( bof.getType() == BOFRecord.TYPE_WORKSHEET ) {
				++this.sheetNow;
			}
			break;
		case SSTRecord.sid:
			// Here's the SST again... now read in strings that we need
			SSTRecord sstrec = (SSTRecord) record;
			for( int i = 0; i < sstrec.getNumUniqueStrings(); i++ ) {
				if ( this.sstmap.get(i) != null )
					this.sstmap.put(i, sstrec.getString(i).toString().trim());
			}
			break;
		}
	}

	private void processRecord( short col, Object value ) {
		ExcelColumn column = new ExcelColumn(new Integer(col), String.valueOf(value));
		this.excelColumns.add(column);
	}

	@Override
	public List<ExcelColumn> getColumns() {
		return this.excelColumns;
	}
}
