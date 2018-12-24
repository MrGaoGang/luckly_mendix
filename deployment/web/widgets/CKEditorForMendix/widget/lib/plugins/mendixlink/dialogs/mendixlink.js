/*jslint white:true, nomen: true, plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module, logger, document, window, CKEDITOR */
/*mendix */
CKEDITOR.dialog.add( 'mendixlinkDialog', function( editor ) {
    'use strict';

    return {
        title: 'Mendix Link Properties',
        minWidth: 400,
        minHeight: 200,

        contents: [
            {
                id: 'tab-basic',
                label: 'Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'mxlinklabel',
                        label: 'Label of link',
                        className: 'mx-ckeditor-mxlink-labelText',

                        setup: function (element) {
                            this.setValue(element.getText());
                        },

                        commit: function (element) {
                            element.setText(this.getValue());
                        }
                    },{
                        type: 'select',
                        id: 'mxlink',
                        label: 'Microflow with name to execute',
                        className: 'mx-ckeditor-mxlink-microflowSelect',
                        items: (function () {
                            var data = [],
                                i = null;

                            // Create an array that contains all the values a person can pick.
                            if ( typeof editor.mendixWidgetConfig !== 'undefined' && typeof editor.mendixWidgetConfig.microflowLinks !== 'undefined' ){
                                //console.log(editor);

                                for (i = 0; i < editor.mendixWidgetConfig.microflowLinks.length; i++){
                                    data.push( [ editor.mendixWidgetConfig.microflowLinks[i].functionNames ] );
                                }

                            }

                            return data;

                        }()),
                        'default': '',

                        setup: function(element) {
                            // Get the value set on the link.

                            if (typeof element.$ !== 'undefined'){
                                var onclickValue = element.$.attributes['data-cke-pa-onclick'].value;
                                this.setValue(onclickValue.split('CKEditorViewer.mf.exec(\'').join('').split('\', \'__ID__\', \'__GUID__\');').join(''));
                            } else {
                                this.setValue(element.getAttribute('onclick').split('CKEditorViewer.mf.exec(\'').join('').split('\', \'__ID__\', \'__GUID__\');').join(''));
                            }
                        },

                        commit: function(element) {
                            // Set the value on the link
                            element.setAttribute('href', '__LINK__');
                            element.setAttribute('onclick', 'CKEditorViewer.mf.exec(\'' + this.getValue() + '\', \'__ID__\', \'__GUID__\');');
                        }
                    },
                    {
                        type: 'text',
                        id: 'mxclass',
                        label: 'CSS Classes on link',
                        className: 'mx-ckeditor-mxlink-cssText',
                        'default': 'btn btn-default mx-button',

                        setup: function (element) {
                            // Get the value of the class attribute of the link.
                            this.setValue(element.getAttribute('class').split('mx-microflow-link').join(''));
                        },

                        commit: function (element) {
                            // Set the value of the class attribute of the link.
                            element.setAttribute('class' , this.getValue() + ' mx-microflow-link');
                        }
                    },
                    {
                        type: 'text',
                        id: 'mxtitle',
                        label: 'Title text on link',
                        className: 'mx-ckeditor-mxlink-titleText',

                        setup: function (element) {
                            // Get the value of the title attribute of the link.
                            this.setValue(element.getAttribute('title'));
                        },

                        commit: function (element) {
                            // Set the value of the title attribute of the link.
                            element.setAttribute('title' , this.getValue());
                        }
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection(),
                element = selection.getStartElement(),
                className = '';

            if (element) {
                element = element.getAscendant('a', true);
            }

            if (!element || element.getName() !== 'a') {
                element = editor.document.createElement( 'a' );
                element.setAttribute('class', 'mx-microflow-link');
                this.insertMode = true;
            }
            else {
                this.insertMode = false;
            }

            this.element = element;
            if (!this.insertMode) {
                this.setupContent(this.element);
            }
        },

        onOk: function() {
            var dialog = this,
                mxEl = this.element;
            this.commitContent(mxEl);

            if ( this.insertMode ) {
                editor.insertElement(mxEl);
            }
        }
    };
});