package excelimporter.reader.readers;

import excelimporter.proxies.DataSource;
import excelimporter.proxies.MappingType;

public class DocProperties {
	private String columnAlias;
	private DataSource ds;
	private MappingType mappingType;
	private String staticStringValue = null;

	public DocProperties(DataSource ds, MappingType mappingType, String columnAlias) {
		this.ds = ds;
		this.columnAlias = columnAlias;
		this.mappingType = mappingType;
	}
	
	public void setStaticStringValue(String staticStringValue) {
		this.staticStringValue = staticStringValue;
	}
	public String getStaticStringValue() {
		return this.staticStringValue;
	}
	
	public String getColumnAlias() {
		return this.columnAlias;
	}
	
	public DataSource getDataSource() {
		return this.ds;
	}
	
	public MappingType getMappingType() {
		return this.mappingType;
	}
}
