package xlsreport.report.export;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import system.proxies.FileDocument;
import au.com.bytecode.opencsv.CSVWriter;

import com.mendix.core.Core;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

import xlsreport.proxies.MxSheet;
import xlsreport.proxies.MxTemplate;
import xlsreport.report.data.ColumnPreset;

public class ExportCSV  extends Export
{
	private ByteArrayOutputStream baos;
	private CSVWriter writer;
	private SimpleDateFormat dateFormat;
	
	public ExportCSV(IContext context, MxTemplate template, IMendixObject inputObject)
	{
		super(context,inputObject);
		char separator = ',';
		if(template.getCSVSeparator() != null)
		{
			switch(template.getCSVSeparator())
			{
				case Comma:
					separator = ',';
					break;
				case Semicolon:
					separator = ';';
					break;
				case Tab:
					separator = '\t';
					break;
			}
		}
		String format = Export.getDatePresentation(template);
		this.dateFormat = new SimpleDateFormat(format);
		this.dateFormat.setTimeZone(context.getSession().getTimeZone());
		// Create the OpenCSV writer
		this.baos = new ByteArrayOutputStream();
		
		this.writer = new CSVWriter(new OutputStreamWriter(baos), separator, CSVWriter.DEFAULT_QUOTE_CHARACTER, "\r\n");
	}

	@Override
	public void buildExportFile(MxSheet mxSheet, List<ColumnPreset> mxColumnList, Object[][] table) throws Exception
	{
		String[] values = new String[mxColumnList.size()];
		for(int i = 0; i < mxColumnList.size(); i++)
		{
			values[i] = mxColumnList.get(i).getName();
		}
		writer.writeNext(values);
		
		//SimpleDateFormat format = new SimpleDateFormat(this.dateFormat);		
		for(int i = 0; i < table.length; i++)
		{
			for(int e = 0; e < table[i].length; e++)
			{
				Object value = table[i][e];
				if(value instanceof Date)
				{
					value = this.dateFormat.format((Date) value);
				}
				
				values[e] = String.valueOf(value);				
			}			
			writer.writeNext(values);			
		}
		writer.close();
	}	
	
	@Override
	public void writeData(FileDocument outputDocument) throws Exception
	{
		try (InputStream inputStream = new ByteArrayInputStream(baos.toByteArray()))
		{
			Core.storeFileDocumentContent(context, outputDocument.getMendixObject(), inputStream);
		}
	}

	public void close() throws Exception
	{
		if (this.baos != null)
			this.baos.close();
		if (this.writer != null)
			this.writer.close();
	}
}
