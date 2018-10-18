package excelimporter.reader.readers.replication;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.regex.Pattern;

import org.apache.poi.hssf.usermodel.HSSFDateUtil;

import replication.ReplicationSettings;
import replication.ValueParser;
import replication.interfaces.IValueParser;

import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.meta.IMetaPrimitive.PrimitiveType;

import excelimporter.reader.readers.ExcelRowProcessor.ExcelCellData;

public class ExcelValueParser extends ValueParser {

	private static HashMap<String, String> displayMaskMap = new HashMap<String, String>();
	static {
		displayMaskMap.put("m/d/yy", "MM/dd/yy");
		displayMaskMap.put("m/d/yy\\ h:mm;@", "MM/dd/yy HH:mm");
		displayMaskMap.put("m/d/yyyy", "MM/dd/yyyy");
		displayMaskMap.put("m/d/yyyy\\ h:mm;@", "MM/dd/yyyy HH:mm");

		displayMaskMap.put("dd\\-mmm\\-yy;@\\", "dd-MMMM-yy");
		displayMaskMap.put("[$-409]dd\\-mmm\\-yy;@\\", "dd-MMMM-yy");
		displayMaskMap.put("dd\\-mmm\\-yyyy;@\\", "dd-MMMM-yyyy");
		displayMaskMap.put("[$-409]dd\\-mmm\\-yyyy;@\\", "dd-MMMM-yyyy");
		displayMaskMap.put("h:mm:ss\\ AM/PM", "hh:mm:ss aa");
		displayMaskMap.put("[$-409]h:mm:ss\\ AM/PM", "hh:mm:ss aa");
		displayMaskMap.put("dddd\\,\\ mmmm\\ dd\\,\\ yyyy", "EEEE, MMMM dd, yyyy");
		displayMaskMap.put("[$-409]dddd\\,\\ mmmm\\ dd\\,\\ yyyy", "EEEE, MMMM dd, yyyy");

		displayMaskMap.put("\"$\"#,##0_);\\(\"$\"#,##0\\)", "#,##0");
		displayMaskMap.put("\"$\"#,##0_);[Red]\\(\"$\"#,##0\\)", "#,##0");

		displayMaskMap.put("\"$\"#,##0.00_);\\(\"$\"#,##0.00\\)", "#,##0.00");
		displayMaskMap.put("\"$\"#,##0.00_);[Red]\\(\"$\"#,##0.00\\)", "#,##0.00");

		displayMaskMap.put("0.0%", "#0.0%");
		displayMaskMap.put("0.00%", "#0.0%");
		displayMaskMap.put("0.000%", "#0.0%");
		displayMaskMap.put("0.0000%", "#0.0%");
	}

	public ExcelValueParser( Map<String, IValueParser> customValueParsers, ReplicationSettings settings ) {
		super(settings, customValueParsers);
	}

	@Override
	// public Object getValueFromDataSet( String keyAlias, PrimitiveType type, Object dataSet ) throws ParseException {
	// return ((ExcelCellData[]) dataSet)[Integer.valueOf(keyAlias)].getRawData();
	// }
	// public Object getDataFromExcelDataSet( ExcelCellData data ) {
	// if( data.getFormattedData() != null )
	// return data.getFormattedData();
	// else
	// return data.getRawData();
	// }
	public Object getValueFromDataSet( String column, PrimitiveType type, Object dataSet ) throws ParseException {
		ExcelCellData[] objects = (ExcelCellData[]) dataSet;
		if ( objects.length > Integer.valueOf(column) )
			return getValue(type, column, objects[Integer.valueOf(column)]);
		else {
			Core.getLogger("ValueParser").warn("There is no column nr: " + column + " found on the current row");
			return null;
		}
	}

	@SuppressWarnings("static-access")
	private Object getValue( PrimitiveType type, String column, ExcelCellData cellData ) throws ParseException {
		if ( cellData == null )
			return null;


		Object value;
		if ( type == PrimitiveType.DateTime ) {
			value = cellData.getFormattedData();
			if ( value == null )
				value = cellData.getRawData();

			if ( cellData.getRawData() instanceof Double )
				value = cellData.getRawData();
			else if ( cellData.getRawData() instanceof String && this.nrPattern.matcher((String) cellData.getRawData()).matches() )
				value = Double.valueOf((String) cellData.getRawData());

			else if ( value instanceof String ) {
				if ( this.nrPattern.matcher((String) value).matches() )
					value = Double.valueOf((String) value);
				else if ( cellData.getDisplayMask() != null ) {
					String displayMask = cellData.getDisplayMask();
					if ( this.displayMaskMap.containsKey(displayMask) )
						this.settings.addDisplayMask(column, this.displayMaskMap.get(displayMask));
				}
				else if ( this.settings.hasDefaultInputMask(column) != null ) {
					this.settings.addDisplayMask(column, this.settings.getDefaultInputMask(column));
				}
				else if ( !this.settings.hasValueParser(column) )
					this.logNode.warn("Unable to parse the Date(" + value + ") in field: " + cellData.getColNr());
			}


			if ( value instanceof Double ) {
				if ( HSSFDateUtil.isValidExcelDate((Double) value) ) {

					/*
					 * Workaround for a library conflict within the platform. The platfrom implements version 1.5 of
					 * poi. This classes with the current implementation
					 */
					Object dateResult = null;
					try {
						Method m = Class.forName("org.apache.poi.ss.usermodel.DateUtil").getDeclaredMethod("getJavaDate", double.class,
								TimeZone.class);

						dateResult = m.invoke(Class.forName("org.apache.poi.hssf.usermodel.HSSFDateUtil").newInstance(), (Double) value,
								this.settings.getTimeZoneForMember(column));
					}
					catch( IllegalAccessException | IllegalArgumentException | InvocationTargetException | InstantiationException | ClassNotFoundException | NoSuchMethodException | SecurityException e ) {
						this.logNode.info("Unable to use HSSF date parser, falling back to default implementation", e);
					}

					if ( dateResult != null )
						value = dateResult;
					else {
						// ----------------- WORK AROUND ----------
						int wholeDays = (int) Math.floor((Double) value);
						int millisecondsInDay = (int) (((Double) value - wholeDays) * ((24 * 60 * 60) * 1000L) + 0.5);
						Calendar calendar = new GregorianCalendar(this.settings.getTimeZoneForMember(column));
						setCalendar(calendar, wholeDays, millisecondsInDay, false);
						value = calendar.getTime();
						// returnValue = getDateValue(HSSFDateUtil.getJavaDate((Double)value));
					}
				}
				else
					throw new ParseException("The value was not stored in excel as a valid date.");
			}

			return getValue(type, column, value);
		}
		else if ( cellData.getFormattedData() != null ) {
			try {
				return getValue(type, column, cellData.getFormattedData());
			}
			catch( Exception e ) {
			}
		}

		return getValue(type, column, cellData.getRawData());
	}

	private final Pattern nrPattern = Pattern.compile("^\\d{0,6}(\\.\\d{1,})$");

	// @Override
	// public Object getValue( PrimitiveType type, String alias, Object value ) throws ParseException {
	// Object returnValue = null;
	// returnValue = super.getValue(type, alias, value);
	// switch (type) {
	// case DateTime:
	// if ( value instanceof String ) {
	// if ( this.nrPattern.matcher((String) value).matches() )
	// value = Double.valueOf((String) value);
	// }
	// if ( value instanceof Double ) {
	// if ( HSSFDateUtil.isValidExcelDate((Double) value) ) {
	//
	// // ----------------- WORK AROUND ----------
	// int wholeDays = (int) Math.floor((Double) value);
	// int millisecondsInDay = (int) (((Double) value - wholeDays) * ((24 * 60 * 60) * 1000L) + 0.5);
	// Calendar calendar = new GregorianCalendar((this.settings.shouldLocalizeDate(alias) ?
	// this.settings.getContext().getSession().getTimeZone() : TimeZone.getTimeZone("UTC")));
	// setCalendar(calendar, wholeDays, millisecondsInDay, false);
	// returnValue = calendar.getTime();
	// // returnValue = getDateValue(HSSFDateUtil.getJavaDate((Double)value));
	// }
	// else
	// throw new ParseException("The value was not stored in excel as a valid date.");
	// }
	// else if ( value instanceof String || value instanceof Long ) {
	// returnValue = getDateValue(value);
	// }
	// else if ( value != null )
	// throw new ParseException("The value(" + value +
	// ") is of the wrong type, it was not stored in excel as a valid date.");
	//
	// break;
	// default:
	// returnValue = super.getValue(type, alias, value);
	// }
	// return returnValue;
	// }

	/**
	 * Given an Excel date with either 1900 or 1904 date windowing, converts it to a java.util.Date.
	 * 
	 * NOTE: If the default <code>TimeZone</code> in Java uses Daylight Saving Time then the conversion back to an Excel
	 * date may not give the same value, that is the comparison
	 * <CODE>excelDate == getExcelDate(getJavaDate(excelDate,false))</CODE> is not always true. For example if default
	 * timezone is <code>Europe/Copenhagen</code>, on 2004-03-28 the minute after 01:59 CET is 03:00 CEST, if the excel
	 * date represents a time between 02:00 and 03:00 then it is converted to past 03:00 summer time
	 * 
	 * @param date The Excel date.
	 * @param use1904windowing true if date uses 1904 windowing, or false if using 1900 date windowing.
	 * @return Java representation of the date, or null if date is not a valid Excel date
	 * @see java.util.TimeZone
	 */
	@SuppressWarnings("static-access")
	public static Date getJavaDate( double date, boolean use1904windowing ) {
		if ( !HSSFDateUtil.isValidExcelDate(date) ) {
			return null;
		}
		int wholeDays = (int) Math.floor(date);
		int millisecondsInDay = (int) ((date - wholeDays) * ((24 * 60 * 60) * 1000L) + 0.5);
		Calendar calendar = new GregorianCalendar(); // using default time-zone
		setCalendar(calendar, wholeDays, millisecondsInDay, use1904windowing);
		return calendar.getTime();
	}

	public static void setCalendar( Calendar calendar, int wholeDays, int millisecondsInDay, boolean use1904windowing ) {
		int startYear = 1900;
		int dayAdjust = -1; // Excel thinks 2/29/1900 is a valid date, which it isn't
		if ( use1904windowing ) {
			startYear = 1904;
			dayAdjust = 1; // 1904 date windowing uses 1/2/1904 as the first day
		}
		else if ( wholeDays < 61 ) {
			// Date is prior to 3/1/1900, so adjust because Excel thinks 2/29/1900 exists
			// If Excel date == 2/29/1900, will become 3/1/1900 in Java representation
			dayAdjust = 0;
		}
		calendar.set(startYear, 0, wholeDays + dayAdjust, 0, 0, 0);
		calendar.set(Calendar.MILLISECOND, millisecondsInDay);
	}
}
