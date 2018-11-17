//----------------------------------------------------------------------
// Dynamic Row Classes
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/aspect",
    "dojo/dom-attr"
], function(declare, _WidgetBase, aspect, domAttr) {
    "use strict";

    return declare(null, {

        rowClassTable: [],

        inputargs: {
            rowClassMapping: [],
            rowClassAttr: ""
        },

        checkConfigRowClasses: function() {
            if (this.rowClassMapping.length > 0 && !this.rowClassAttr) {
                this.showError("Row Class mapping needs an entity and attribute.");
            }
            // dataGridEntity is only required to for the widget to select an attribute of the context.
            // So we  need to check that they are of the same type.
            if (this.dataGridEntity && this.dataGridEntity !== this.grid.entity) {
                this.showError("The Row Grid Entity should be the same as the grid.");
            }
        },

        postCreateRowClasses: function() {
            this.checkConfigRowClasses();

            this.rowClassTable = [];

            if (this.rowClassAttr.length > 0) {
                this.setupDynamicRowClasses();
            }
        },

        setupDynamicRowClasses: function() {
            if (this.rowClassAttr) {
                var self = this; // needed in aspect function

                this.grid.rowClassMapping = {};
                for (var i = 0; i < this.rowClassMapping.length; i++) {
                    this.rowClassTable[this.rowClassMapping[i].key] = this.rowClassMapping[i].value;
                }
                // TODO Fix issues; when object is updates it does not refresh the row, and not the class
                aspect.around(this.grid, "_gridbodyFillRow", function(originalMethod) {
                    // wrap around the grid function to change stuff before and after.
                    return function(mxObject, gridMatrixRow) {
                        if (mxObject.has(self.rowClassAttr)) { // check Has Attribute
                            var tr = gridMatrixRow[0].parentNode,
                                value = mxObject.get(self.rowClassAttr);
                            if (value in self.rowClassTable) {
                                value = self.rowClassTable[value];
                            } else {
                                value = value.toString().replace(/[^\w_-]/gi, ""); // remove all special characters, TODO: remove leading digits too.
                            }
                            domAttr.set(tr, "class", value);
                        }
                        originalMethod.apply(this, arguments);
                    };
                });
            }
        }

    });
});

// @ sourceURL=widgets/DataGridExtension/widget/RowClasses.js
