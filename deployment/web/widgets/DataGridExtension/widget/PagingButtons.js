//----------------------------------------------------------------------
// Section for dynamic showing paging and Empty table
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "dojo/dom-style"
], function(declare, domStyle) {
    "use strict";

    return declare(null, {
        inputargs: {
            hideUnusedPaging: false,
            firstLastMinPages: 3
        },

        checkConfigPagingButtons: function() {
            /* */
        },

        postCreatePagingButtons: function() {
            this.checkConfigPagingButtons();

            if (this.hideUnusedPaging) {
                this.connect(this.grid, "fillGrid", this.updatePaging);
            }
        },

        updatePaging: function() {
            if (this.grid !== null) {
                if (this.hideUnusedPaging === true) {
                    var ds = this.grid._dataSource;
                    var atBegin = ds.atBeginning();
                    var atEnd = ds.atEnd();
                    if (atBegin === true && atEnd === true) {
                        domStyle.set(this.grid.pagingBarNode, "display", "none");
                    } else {
                        domStyle.set(this.grid.pagingBarNode, "display", "block");
                    }
                }
                if (this.hideUnusedPaging && this.grid.pagingBarNode.children.length > 0) {
                    var countPages = Math.ceil(this.grid._dataSource.getSetSize() / this.grid._dataSource._pageSize);
                    var lastButtonIndex = this.grid.pagingBarNode.children.length - 1;
                    if (countPages <= this.firstLastMinPages) {
                        domStyle.set(this.grid.pagingBarNode.children[0], "display", "none");
                        domStyle.set(this.grid.pagingBarNode.children[lastButtonIndex], "display", "none");
                    } else {
                        domStyle.set(this.grid.pagingBarNode.children[0], "display", "inline-block");
                        domStyle.set(this.grid.pagingBarNode.children[lastButtonIndex], "display", "inline-block");
                    }
                }
            }
        }
    });
});

// @ sourceURL=widgets/DataGridExtension/widget/PagingButtons.js
