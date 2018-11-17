//----------------------------------------------------------------------
// Empty table
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/aspect",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-construct"
], function(declare, _WidgetBase, aspect, lang, dojoStyle, domConstruct) {
    "use strict";

    return declare(null, {
        emptyButton: null,

        inputargs: {
            onclickmf: "",
            buttonIcon: "",
            showAsButton: "",
            caption: "",
            hideEmptyTable: false
        },

        // Templated variable, TODO remove template dependency
        // emptyTableHolder

        checkConfigEmptyTable: function() {
            if ((this.showAsButton === "Button" || this.showAsButton === "Link") && !this.onclickmf) {
                this.showError("When Empty table grid message is rendered as button or link; a on click microflow is required");
            }
        },

        postCreateEmptyTable: function() {
            this.checkConfigEmptyTable();

            if (this.showAsButton !== "Disabled") {
                aspect.after(this.grid, "fillGrid", lang.hitch(this, this.updateEmptyTable));
            }
        },

        updateEmptyTable: function() {
            if (this.grid !== null) {
                var gridSize = this.grid.getCurrentGridSize
                    ? this.grid.getCurrentGridSize()
                    : this.grid._dataSource.getObjects().length;
                if (gridSize === 0) {
                    if (this.hideEmptyTable === true) {
                        dojoStyle.set(this.grid.gridHeadNode, "display", "none");
                    }
                    if (this.showAsButton !== "Disabled") { // show empty table info
                        this.showButton();
                    }
                } else {
                    if (this.hideEmptyTable === true) {
                        dojoStyle.set(this.grid.gridHeadNode, "display", "table-header-group");
                    }
                    if (this.showAsButton !== "Disabled") { // show empty table info
                        this.hideButton();
                    }
                }
            }
        },

        showButton: function() {
            this.hideButton();
            if (this.showAsButton.toLowerCase() === "text") {
                this.emptyButton = mxui.dom.create("div", {
                    class: "empty_grid"
                }, mxui.dom.escapeString(this.caption));
                this.emptyTableHolder.appendChild(this.emptyButton);
            } else {
                this.emptyButton = new mxui.widget._Button({
                    caption: mxui.dom.escapeString(this.caption),
                    iconUrl: this.buttonIcon,
                    onClick: lang.hitch(this, this.onclickEvent),
                    renderType: this.showAsButton.toLowerCase(),
                    cssclass: this.class
                });
                this.emptyTableHolder.appendChild(this.emptyButton.domNode);
            }
        },

        hideButton: function() {
            domConstruct.empty(this.emptyTableHolder);
        },

        onclickEvent: function() {
            var microflow = this.onclickmf;
            if (microflow) {
                mx.ui.action(microflow, {
                    context: this.dataobject,
                    origin: this.mxform,
                    error: function(error) {
                        mx.ui.error("Error executing microflow " + microflow + " : " + error.message);
                        logger.error(this.id, "EmptyTable.onclickEvent: XAS error executing microflow:", error);
                    },
                    callback: function() { /* */ }
                });
            }
        },

        applyContext: function(context, callback) {
            if (context && context.getTrackId() !== "") {
                this.dataobject = context;
            }
            if (callback) {
                callback();
            }
        }

    });
});

// @ sourceURL=widgets/DataGridExtension/widget/EmptyTable.js
