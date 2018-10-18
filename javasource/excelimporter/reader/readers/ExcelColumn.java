package excelimporter.reader.readers;

public class ExcelColumn {

	private String caption;
	private int colNr;
	
	protected ExcelColumn( int colNr, String caption) {
		this.caption = caption;
		this.colNr = colNr;
	}
	
	public String getCaption() {
		return this.caption;
	}
	
	public int getColNr() {
		return this.colNr;
	}
}
