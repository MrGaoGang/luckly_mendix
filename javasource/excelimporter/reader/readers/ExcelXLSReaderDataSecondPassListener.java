package excelimporter.reader.readers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.eventusermodel.HSSFListener;
import org.apache.poi.hssf.record.BOFRecord;
import org.apache.poi.hssf.record.BoolErrRecord;
import org.apache.poi.hssf.record.CellValueRecordInterface;
import org.apache.poi.hssf.record.EOFRecord;
import org.apache.poi.hssf.record.ExtendedFormatRecord;
import org.apache.poi.hssf.record.FormatRecord;
import org.apache.poi.hssf.record.FormulaRecord;
import org.apache.poi.hssf.record.LabelSSTRecord;
import org.apache.poi.hssf.record.NumberRecord;
import org.apache.poi.hssf.record.Record;
import org.apache.poi.hssf.record.SSTRecord;
import org.apache.poi.hssf.record.StringRecord;
import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.hssf.usermodel.HSSFDataFormatter;

import com.mendix.core.CoreException;

import excelimporter.reader.readers.ExcelRowProcessor.ExcelCellData;

/**
 * 
 * 
 * @author J. van der Hoek - Mendix
 * @version $Id: ExcelXLSReaderDataSecondPassListener.java 9272 2009-05-11 09:19:47Z Jasper van der Hoek $
 */
public class ExcelXLSReaderDataSecondPassListener implements HSSFListener {

	private final int iCanHasSheet;
	private final int startRow;
	private final HashMap<Integer, String> sstmap;

	private int workbookNow = -1;
	private int sheetNow = -1;
	private int rowNow = -1;

	private boolean nextRecordIsFormulaCachedStringResult = false;
	private int lastRow = -1;
	private short lastCol = -1;

	private ExcelCellData[] values;
	private ExcelReader xlsReader;
	private ExcelRowProcessor excelRowProcessor;

	private HSSFDataFormatter _formatter = new HSSFDataFormatter();
	private final Map<Integer, FormatRecord> _customFormatRecords = new Hashtable<Integer, FormatRecord>();
	private final List<ExtendedFormatRecord> _xfRecords = new ArrayList<ExtendedFormatRecord>();

	public ExcelXLSReaderDataSecondPassListener( int iCanHasSheet, int startRow, HashMap<Integer, String> sstmap, ExcelReader xlsReader,
			int nrOfColumns ) throws CoreException {
		this.iCanHasSheet = iCanHasSheet;
		this.startRow = startRow;
		this.sstmap = sstmap;

		this.xlsReader = xlsReader;
		this.values = new ExcelCellData[++nrOfColumns];
		this.excelRowProcessor = new ExcelRowProcessor(xlsReader);
	}

	/**
	 * This method listens for incoming records and handles them as required.
	 * 
	 * @param record The record that was found while reading.
	 */
	@Override
	public void processRecord( Record record ) throws ExcelRuntimeException {
		try {
			switch (record.getSid()) {
			case LabelSSTRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					LabelSSTRecord lrec = (LabelSSTRecord) record;
					int row = lrec.getRow();
					short col = lrec.getColumn();

					this.processRecord(row, col, this.sstmap.get(lrec.getSSTIndex()), null, null);
				}
				break;
			case FormatRecord.sid: {
				FormatRecord fr = (FormatRecord) record;
				this._customFormatRecords.put(Integer.valueOf(fr.getIndexCode()), fr);
				break;
			}
			case ExtendedFormatRecord.sid: {
				ExtendedFormatRecord xr = (ExtendedFormatRecord) record;
				this._xfRecords.add(xr);
				break;
			}
			case NumberRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					NumberRecord nrec = (NumberRecord) record;
					int row = nrec.getRow();
					short col = nrec.getColumn();

					// Get the built in format, if there is one
					String formatString = getFormatString(nrec);

					this.processRecord(row, col, nrec.getValue(), formatNumberDateCell(nrec), formatString);
				}
				break;
			case BoolErrRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					BoolErrRecord brec = (BoolErrRecord) record;
					int row = brec.getRow();
					short col = brec.getColumn();

					this.processRecord(row, col, brec.getBooleanValue(), brec.getBooleanValue(), null);
				}
				break;
			case FormulaRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					FormulaRecord frec = (FormulaRecord) record;
					this.lastRow = frec.getRow();
					this.lastCol = frec.getColumn();

					// TODO: Use frec.getCachedResultType (?) to get other result types (e.g. boolean); is resulting int
					// a sid?
					if ( frec.hasCachedResultString() ) {
						this.nextRecordIsFormulaCachedStringResult = true;
					}
					else {
						this.processRecord(this.lastRow, this.lastCol, frec.getValue(), frec.getValue(), null);
					}
				}
				break;
			case StringRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					StringRecord srec = (StringRecord) record;
					if ( this.nextRecordIsFormulaCachedStringResult ) {
						this.nextRecordIsFormulaCachedStringResult = false;

						this.processRecord(this.lastRow, this.lastCol, srec.getString(), srec.getString(), null);
					}
				}
				break;
			case BOFRecord.sid:
				// the BOFRecord can represent either the beginning of a sheet or the workbook
				BOFRecord bof = (BOFRecord) record;
				if ( bof.getType() == BOFRecord.TYPE_WORKBOOK ) {
					++this.workbookNow;
					if ( ExcelReader.logNode.isDebugEnabled() )
						ExcelReader.logNode.debug("XLS_DATA-2ndPass: Now at workbook " + (this.workbookNow + 1));
				}
				else if ( bof.getType() == BOFRecord.TYPE_WORKSHEET ) {
					++this.sheetNow;
					if ( ExcelReader.logNode.isDebugEnabled() )
						ExcelReader.logNode.debug("XLS_DATA-2ndPass: Now at worksheet " + (this.sheetNow + 1));
				}
				break;
			case SSTRecord.sid:
				// Static String Table
				SSTRecord sstrec = (SSTRecord) record;
				if ( ExcelReader.logNode.isDebugEnabled() )
					ExcelReader.logNode
							.debug("XLS_DATA-2ndPass: Static String Table found .. filling sstlist with " + this.sstmap.size() + " Strings");

				for( int i = 0; i < sstrec.getNumUniqueStrings(); i++ ) {
					if ( this.sstmap.get(i) != null )
						this.sstmap.put(i, sstrec.getString(i).toString().trim());
				}
				break;
			case EOFRecord.sid:
				if ( this.sheetNow == this.iCanHasSheet ) {
					if ( this.values.length > 0 )
						this.excelRowProcessor.processValues(this.values, this.rowNow, this.sheetNow);
					this.excelRowProcessor.finish();
				}
				break;
			}

		}
		catch( ExcelRuntimeException e ) {
			throw e;
		}
		catch( Exception e ) {
			throw new ExcelRuntimeException(e);
		}
	}

	/**
	 * Formats the given numeric of date Cell's contents as a String, in as
	 * close as we can to the way that Excel would do so. Uses the various
	 * format records to manage this.
	 * 
	 * TODO - move this to a central class in such a way that hssf.usermodel can
	 * make use of it too
	 */
	public String formatNumberDateCell( CellValueRecordInterface cell ) {
		double value;
		if ( cell instanceof NumberRecord ) {
			value = ((NumberRecord) cell).getValue();
		}
		else if ( cell instanceof FormulaRecord ) {
			value = ((FormulaRecord) cell).getValue();
		}
		else {
			throw new IllegalArgumentException("Unsupported CellValue Record passed in " + cell);
		}

		// Get the built in format, if there is one
		int formatIndex = getFormatIndex(cell);
		String formatString = getFormatString(cell);


		if ( formatString != null ) {
			// Format, using the nice new
			// HSSFDataFormatter to do the work for us
			String returnValue = this._formatter.formatRawCellContents(value, formatIndex, formatString);

			if ( ExcelReader.logNode.isTraceEnabled() )
				ExcelReader.logNode
						.trace("Formatting " + (cell.getRow() + 1) + ExcelReader.colNumberToText(cell.getColumn()) + " / '" + value + "' using format: '" + formatString + "' as " + returnValue);

			return returnValue;
		}
		else {
			return Double.toString(value);
		}
	}

	/**
	 * Returns the format string, eg $##.##, for the given number format index.
	 */
	public String getFormatString( int formatIndex ) {
		String format = null;
		if ( formatIndex >= HSSFDataFormat.getNumberOfBuiltinBuiltinFormats() ) {
			FormatRecord tfr = this._customFormatRecords.get(Integer.valueOf(formatIndex));
			if ( tfr == null ) {
				ExcelReader.logNode.error("Requested format at index " + formatIndex + ", but it wasn't found");
			}
			else {
				format = tfr.getFormatString();
			}
		}
		else {
			format = HSSFDataFormat.getBuiltinFormat((short) formatIndex);
		}
		return format;
	}

	/**
	 * Returns the format string, eg $##.##, used by your cell
	 */
	public String getFormatString( CellValueRecordInterface cell ) {
		int formatIndex = getFormatIndex(cell);
		if ( formatIndex == -1 ) {
			// Not found
			return null;
		}
		return getFormatString(formatIndex);
	}

	/**
	 * Returns the index of the format string, used by your cell, or -1 if none
	 * found
	 */
	public int getFormatIndex( CellValueRecordInterface cell ) {
		ExtendedFormatRecord xfr = this._xfRecords.get(cell.getXFIndex());
		if ( xfr == null ) {
			ExcelReader.logNode.error("Cell " + cell.getRow() + "," + cell.getColumn()
					+ " uses XF with index " + cell.getXFIndex() + ", but we don't have that");
			return -1;
		}
		return xfr.getFormatIndex();
	}

	private void processRecord( int row, short col, Object rawValue, Object formattedValue, String displayMask ) {
		if ( this.mayUseValue(row, col) ) {
			if ( this.rowNow != row ) {
				if ( row > this.startRow ) {
					try {
						if ( this.values.length > 0 )
							this.excelRowProcessor.processValues(this.values, this.rowNow, this.sheetNow);
					}
					catch( Exception e ) {
						throw new ExcelRuntimeException("XLS_DATA-2ndPass: an exception occured near row: " + row + ", the exception is: " + e.getMessage(), e);
					}
				}
				this.rowNow = row;
			}

			try {
				if ( ExcelReader.logNode.isTraceEnabled() )
					ExcelReader.logNode.trace("Reading " + (row + 1) + ExcelReader.colNumberToText(col) + " / '" + rawValue + "'");


				this.values[col] = new ExcelCellData(col, rawValue, formattedValue, displayMask);
			}
			catch( Exception e ) {
				throw new ExcelRuntimeException("XLS_DATA-2ndPass: FormulaRecord row: " + (row) +
						" col: " + col + ", Value: " + rawValue + "|" + formattedValue + " triggers Exception: " + e.getMessage(), e);
			}
		}
	}

	private boolean mayUseValue( int row, int col ) {
		return row >= this.startRow && this.xlsReader.getSettings().aliasIsMapped(String.valueOf(col));
	}

	public class ExcelRuntimeException extends RuntimeException {

		private static final long serialVersionUID = 123456L;

		public ExcelRuntimeException() {
			super();
		}

		public ExcelRuntimeException( String message ) {
			super(message);
		}

		public ExcelRuntimeException( Exception e ) {
			super(e);
		}

		public ExcelRuntimeException( String message, Exception e ) {
			super(message, e);
		}
	}
}
