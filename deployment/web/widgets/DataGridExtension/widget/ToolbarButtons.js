//----------------------------------------------------------------------
// Toolbar Buttons
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/registry",
    "dojo/query",

    "dojo/NodeList-traverse"
], function(declare, domClass, domStyle, registry, query) {
    "use strict";

    return declare(null, {

        selectionButtons: [],
        nonSelectionButtons: [],
        hideOnEmptyButtons: [],
        showOnEmptyButtons: [],
        selectAllButtons: [],

        dataView: null,

        inputargs: {
            hideUnusableButtons: false
        },

        checkConfigToolbarButtons: function() {
            /* */
        },

        postCreateToolbarButtons: function() {
            this.checkConfigToolbarButtons();

            this.selectionButtons = [];
            this.nonSelectionButtons = [];
            this.hideOnEmptyButtons = [];
            this.showOnEmptyButtons = [];
            this.setButtons = [];

            var dvNode = query(this.domNode).closest(".mx-dataview")[0];
            if (dvNode) {
                this.dataView = registry.byNode(dvNode);
            } // data view for conditional visible buttons

            if (this.hideUnusableButtons) {
                this.setupControlbarButtonVisibility();
            }
            // this.loaded();
        },

        // ---------------------------------------------------------------------
        // Section for Controlbar Button Visibility
        // ---------------------------------------------------------------------

        setupControlbarButtonVisibility: function() {
            // Append empty button, so height is not bar is not collapsing (issue does not apply when there multiple lines of buttons
            if (this.grid.toolBarNode.childNodes[0]) { // has buttons
                var spacer = mxui.dom.create("button", {
                    class: "hightSpacer btn mx-button btn-default",
                    style: "display: inline-block; visibility: hidden; margin-left: 0; margin-right: 0; padding-left: 0; padding-right: 0;",
                    tabindex: "-1"
                }, "&nbsp;");
                this.grid.toolBarNode.appendChild(spacer);
            }

            for (var i = 0; i < this.grid.toolBarNode.childNodes.length; i++) {
                if (this.grid.toolBarNode.childNodes[i].nodeName === "BUTTON") {
                    var actionKey = this.grid.toolBarNode.childNodes[i].getAttribute("data-mendix-id");
                    if (actionKey) {
                        if (!domClass.contains(this.grid.toolBarNode.childNodes[i], "ignoreRowSelectionVisibility")) {
                            if (domClass.contains(this.grid.toolBarNode.childNodes[i], "hideOnRowSelect")) {
                                this.nonSelectionButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }
                            if (domClass.contains(this.grid.toolBarNode.childNodes[i], "showOnRowSelect")) {
                                this.selectionButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }
                            if (domClass.contains(this.grid.toolBarNode.childNodes[i], "hideOnEmpty")) {
                                this.hideOnEmptyButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }
                            if (domClass.contains(this.grid.toolBarNode.childNodes[i], "showOnEmpty")) {
                                this.showOnEmptyButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }

                            var action = this.grid._gridConfig.getActionsByKey(actionKey);
                            if (action.actionCall === "InvokeMicroflow") {
                                if (action.params) {
                                    var firstKey = null;
                                    for (var key in action.params) {
                                        if (action.params.hasOwnProperty(key)) {
                                            firstKey = key;
                                            break;
                                        }
                                    } // get first param
                                    if (firstKey && action.params[firstKey].applyTo && (action.params[firstKey].applyTo === "selectionset" || action.params[firstKey].applyTo === "selection")) {
                                        this.selectionButtons.push(this.grid.toolBarNode.childNodes[i]);
                                    }
                                    if (firstKey && action.params[firstKey].applyTo && action.params[firstKey].applyTo === "set") {
                                        this.setButtons.push(this.grid.toolBarNode.childNodes[i]);
                                    }
                                }
                            }
                            if (action.actionCall === "EditSelection" || action.actionCall === "DeleteSelection" || action.actionCall === "ClearSelection" || action.actionCall === "ReturnSelection" || action.actionCall === "DeleteRef") {
                                this.selectionButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }
                            if (action.actionCall === "SelectPage") {
                                this.hideOnEmptyButtons.push(this.grid.toolBarNode.childNodes[i]);
                                this.selectAllButtons.push(this.grid.toolBarNode.childNodes[i]);
                            }
                        }
                    }
                }
            }
            // many function will change can change the condition of visibility
            this.connect(this.grid, "eventGridRowClicked", this.selectChangeControlBarButtons); // mx5.3
            this.connect(this.grid, "eventItemClicked", this.selectChangeControlBarButtons); // mx 5.4
            this.connect(this.grid, "actionEditSelection", this.selectChangeControlBarButtons);

            this.connect(this.grid, "selectRow", this.selectChangeControlBarButtons);
            this.connect(this.grid, "deselectRow", this.selectChangeControlBarButtons);
            this.connect(this.grid, "fillGrid", this.selectChangeControlBarButtons);

            this.connect(this.dataView, "applyConditions", this.selectChangeControlBarButtons); // for conditional views
        },

        checkVisible: function(node) {
            // check Conditional view By modeller on data view
            if (this.dataView) {
                // no need to check visibility on mx 7 and 6 latest.
                var cf = this.dataView.getCFAction ? [ this.dataView.getCFAction(node) ] : this.dataView.getCFActions ? this.dataView.getCFActions(node) : [];

                for (var i = 0; i < cf.length; i++) {
                    if (cf[i] === "hide") {
                        return false;
                    }
                }
                return true;
            }
            return true;
        },

        selectChangeControlBarButtons: function() {
            var countSelected = 0;
            var i = null;

            if (this.grid.hasOwnProperty("_selectedGuids")) {
                if (this.grid._selectedGuids) { // before mx 5.11
                    countSelected = this.grid._selectedGuids.length;
                }
            } else if (this.grid.selection) { // from mx 5.11
                countSelected = this.grid.selection.length;
            }

            var gridSize = this.grid.getCurrentGridSize ? this.grid.getCurrentGridSize()
                    : this.grid.hasOwnProperty("_selectedGuids") ? this.grid._datagrid.getCurrentGridSize()
                    : this.grid.hasOwnProperty("_dataSource") ? this.grid._dataSource.getSetSize() : 0;

            if (countSelected > 0) {
                // show the buttons that need a row selection
                for (i = 0; i < this.selectionButtons.length; i++) {
                    if (this.checkVisible(this.selectionButtons[i])) {
                        domStyle.set(this.selectionButtons[i], "display", "inline-block");
                    }
                }
                // hide buttons that should not be shown on selection
                for (i = 0; i < this.nonSelectionButtons.length; i++) {
                    domStyle.set(this.nonSelectionButtons[i], "display", "none");
                }
                if (gridSize === countSelected) {
                    for (i = 0; i < this.selectAllButtons.length; i++) {
                        domStyle.set(this.selectAllButtons[i], "display", "none");
                    }
                }
            } else {
                // hide buttons that need a selection.
                for (i = 0; i < this.selectionButtons.length; i++) {
                    domStyle.set(this.selectionButtons[i], "display", "none");
                }
                // show buttons that are marked to display only when no row is selected.
                for (i = 0; i < this.nonSelectionButtons.length; i++) {
                    if (this.checkVisible(this.nonSelectionButtons[i])) {
                        domStyle.set(this.nonSelectionButtons[i], "display", "inline-block");
                    }
                }
                if (gridSize === 0) {
                    for (i = 0; i < this.setButtons.length; i++) {
                        domStyle.set(this.setButtons[i], "display", "none");
                    }
                    for (i = 0; i < this.hideOnEmptyButtons.length; i++) {
                        domStyle.set(this.hideOnEmptyButtons[i], "display", "none");
                    }
                    for (i = 0; i < this.showOnEmptyButtons.length; i++) {
                        if (this.checkVisible(this.showOnEmptyButtons[i])) {
                            domStyle.set(this.showOnEmptyButtons[i], "display", "inline-block");
                        }
                    }
                } else {
                    // when grid has record show set buttons
                    for (i = 0; i < this.setButtons.length; i++) {
                        if (this.checkVisible(this.setButtons[i])) {
                            domStyle.set(this.setButtons[i], "display", "inline-block");
                        }
                    }
                    for (i = 0; i < this.hideOnEmptyButtons.length; i++) {
                        if (this.checkVisible(this.hideOnEmptyButtons[i])) {
                            domStyle.set(this.hideOnEmptyButtons[i], "display", "inline-block");
                        }
                    }
                    for (i = 0; i < this.showOnEmptyButtons.length; i++) {
                        domStyle.set(this.showOnEmptyButtons[i], "display", "none");
                    }
                }
            }
        }

    });
});

// @ sourceURL=widgets/DataGridExtension/widget/ToolbarButtons.js
