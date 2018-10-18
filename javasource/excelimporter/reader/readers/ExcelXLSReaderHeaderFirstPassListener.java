package excelimporter.reader.readers;

import java.util.HashMap;

import org.apache.poi.hssf.eventusermodel.HSSFListener;
import org.apache.poi.hssf.record.BOFRecord;
import org.apache.poi.hssf.record.LabelSSTRecord;
import org.apache.poi.hssf.record.Record;
import org.apache.poi.hssf.record.RowRecord;

/**
 * 
 * 
 * @author H. van Kranenburg, J. van der Hoek, J. Veldhuizen
 * @version $Id: ExcelXLSReaderHeaderFirstPassListener.java 8202 2008-10-03 10:05:54Z Jonathan Veldhuizen $
 */
public class ExcelXLSReaderHeaderFirstPassListener implements HSSFListener {

	private final int sheet;
	private final int row;

	int workbookNow = -1;
	int sheetNow = -1;
	int firstcol;
	int lastcol;

	// sstmap: list of unique strings occuring
	// at first pass these will be marked with an empty dummy string when processing
	// the LabelSSTRecord fields that are relevant to us
	// at second pass this dummy string will be replaced by the actual string from the sst map
	private HashMap<Integer, String> sstmap;

	public ExcelXLSReaderHeaderFirstPassListener( int sheet, int row ) {
		// this worksheet contains the row with template header fields
		this.sheet = sheet;
		// the row that contains template header fields
		this.row = row;
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
			// LabelSSTRecord is a record that holds a pointer to a unicode string in the Static String Table
			if ( this.sheetNow == this.sheet ) {
				LabelSSTRecord lrec = (LabelSSTRecord) record;
				// is this cell of interest to us?
				if ( lrec.getRow() == this.row ) {
					int sstindex = lrec.getSSTIndex();

					// mark this spot in the sstlist, so it will be filled with the string at second pass
					this.sstmap.put(sstindex, "");
				}
			}
			break;
		case RowRecord.sid:
			if ( this.sheetNow == this.sheet ) {
				RowRecord rowrec = (RowRecord) record;
				if ( rowrec.getRowNumber() == this.row ) {
					this.firstcol = Integer.valueOf(rowrec.getFirstCol());
					this.lastcol = Integer.valueOf(rowrec.getLastCol());

					// http://java.sun.com/j2se/1.5.0/docs/api/java/util/HashMap.html
					// "As a general rule, the default load factor (.75) offers a good tradeoff between time and space costs."
					int sstmapsize = (int) ((this.lastcol - this.firstcol) / 0.75);
					this.sstmap = new HashMap<Integer, String>(sstmapsize);
				}
			}
			break;
		case BOFRecord.sid:
			// BOFRecord can represent either the beginning of a sheet or the workbook
			BOFRecord bof = (BOFRecord) record;
			if ( bof.getType() == BOFRecord.TYPE_WORKBOOK ) {
				++this.workbookNow;
			}
			else if ( bof.getType() == BOFRecord.TYPE_WORKSHEET ) {
				++this.sheetNow;
			}
			break;
		}
	}

	public HashMap<Integer, String> getSSTMap() {
		return this.sstmap;
	}

	public int getRowWidth() {
		return this.lastcol - this.firstcol;
	}
}
