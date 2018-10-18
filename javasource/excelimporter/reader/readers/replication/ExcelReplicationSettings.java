package excelimporter.reader.readers.replication;

import replication.ReplicationSettings;
import replication.implementation.ErrorHandler;
import replication.implementation.InfoHandler;
import replication.interfaces.IValueParser;

import com.mendix.core.CoreException;
import com.mendix.systemwideinterfaces.core.IContext;

public class ExcelReplicationSettings extends ReplicationSettings {

	public ExcelReplicationSettings(IContext context, String objectType) throws MendixReplicationException {
		super(context, objectType, new ErrorHandler());
		this.setInfoHandler( new InfoHandler("ExcelImporter") );
	}

	public void addColumnMapping(String columnAlias, String memberName, boolean isKey, Boolean isCaseSensitive, IValueParser parser) throws CoreException {
		this.addMappingForAttribute(columnAlias, memberName, (isKey ? KeyType.ObjectKey : KeyType.NoKey), isCaseSensitive, parser);
	}

	public void addAssociationMapping(String columnAlias, String associationName, String associatedObjectType, String memberName, IValueParser parser, KeyType isKey, Boolean isCaseSensitive) throws CoreException {
		this.addMappingForAssociation(columnAlias, associationName, associatedObjectType, memberName, parser, isKey, isCaseSensitive);
	}

}
