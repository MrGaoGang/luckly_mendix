CKEDITOR.plugins.add( 'mendixlink', {
    icons: 'mendixlink',
    init: function( editor ) {
        
        var pluginDirectory = this.path;
        editor.addContentsCss( pluginDirectory + 'styles/mendixlink.css' );
    
        editor.addCommand( 'insertMendixLink', new CKEDITOR.dialogCommand( 'mendixlinkDialog' ) );
        
        editor.ui.addButton( 'mendixlink', {
            label: 'Insert a Mendix microflow.',
            command: 'insertMendixLink',
            toolbar: 'links'
        });
        
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'mendixlinkGroup' );
            editor.addMenuItem( 'mendixlinkItem', {
                label: 'Edit Mendix Link',
                icon: this.path + 'icons/mendixlink.png',
                command: 'insertMendixLink',
                group: 'mendixlinkGroup'
            });

            editor.contextMenu.addListener( function( element ) {
                if ( element.getAscendant( 'div', true ) && element.getAttribute('class') && element.getAttribute('class').indexOf('mx-microflow-link') !== -1 ) {
                    return { mendixlinkItem: CKEDITOR.TRISTATE_OFF };
                }
            });
        }
        
        
        CKEDITOR.dialog.add( 'mendixlinkDialog', this.path + 'dialogs/mendixlink.js' );
    }
});