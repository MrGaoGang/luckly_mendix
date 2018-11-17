//----------------------------------------------------------------------
// Inline Buttons
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/aspect",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/query",
    "dijit/registry"
], function(declare, _WidgetBase, aspect, lang, dojoClass, query, registry) {
    "use strict";

    return declare(null, {

        confirmed: false,

        inputargs: {
            inlineButtons: [] // column  caption icon buttonStyle onClickMicroflow showOnHover confirm conQuestion conProceed conCancel cssClass ccsStyles
        },

        checkConfigInlineButtons: function() {
            var inlineColumns = [];
            for (var i = 0; i < this.inlineButtons.length; i++) {
                if (this.inlineButtons[i].column > Object.keys(this.grid._gridColumnNodes).length) {
                    logger.error("Inline button column exceeds the amount of columns in the grid");
                }
                if (inlineColumns[this.inlineButtons[i].column]) {
                    this.showError("Cannot support 2 buttons in one column");
                } // can only attach 1 onclick event per cell
                inlineColumns[this.inlineButtons[i].column] = true;
                if (this.inlineButtons[i].confirm && (this.inlineButtons[i].conQuestion === "" || this.inlineButtons[i].conProceed === "" || this.inlineButtons[i].conCancel === "")) {
                    this.showError("When Inline button " + this.inlineButtons[i].caption + " confirmation is set; the Question, Proceed and Cancel are required fields");
                }
                if (this.inlineButtons[i].caption === "" && this.inlineButtons[i].icon === "" && !this.inlineButtons[i].valueCaption) {
                    this.showError("Inline button requires either a caption or a icon or Cell Caption Value");
                }
            }
        },

        postCreateInlineButtons: function() {
            this.checkConfigInlineButtons();

            if (this.inlineButtons.length > 0) {
                this.setupInlineButtons();
            }
            // this.loaded();
        },

        setupInlineButtons: function() {
            var self = this; // needed in aspect function

            aspect.around(this.grid, "_gridbodyFillRow", function(originalMethod) {
                // wrap around the grid function to change stuff before and after.
                return function(mxobj, gridMatrixRow) {
                    originalMethod.apply(this, arguments);
                    for (var col = 0; col < gridMatrixRow.length; col++) {
                        var first = true;
                        for (var i = 0; i < self.inlineButtons.length; i++) {
                            if (self.inlineButtons[i].column === col) {
                                var classes = self.inlineButtons[i].cssClass ? self.inlineButtons[i].cssClass : "";
                                classes = self.inlineButtons[i].buttonStyle === "link" ? classes : classes + " btn-" + self.inlineButtons[i].buttonStyle;
                                var td = gridMatrixRow[col];
                                if (!self.inlineButtons[i].valueCaption || (self.inlineButtons[i].valueCaption && td.firstChild.innerHTML !== "&nbsp;")) {
                                    var img = td.querySelector("img");
                                    var button = new mxui.widget.Button({
                                        caption: self.inlineButtons[i].valueCaption ? td.firstChild.innerHTML : self.inlineButtons[i].caption,
                                        iconUrl: (img && img.src && img.src.match(/[^/]*\/\/[^/]*(\/.*)/)[1]) || self.inlineButtons[i].icon,
                                        // Why does this onlick not work? Work around with liveConnect
                                        // onClick: dojo.hitch(this, this.onclickEventInline, self.inlineButtons[0].onClickMicroflow),
                                        btnSetting: self.inlineButtons[i],
                                        renderType: self.inlineButtons[i].buttonStyle.toLowerCase(),
                                        cssStyle: self.inlineButtons[i].ccsStyles, // + " " + self.inlineButtons[i].class
                                        cssClasses: classes
                                    });
                                    var dataContainer = td.firstChild;
                                    dojoClass.add(td, "inlineButtonContainer");
                                    td.innerHTML = "";
                                    td.appendChild(dataContainer);
                                    if (first) {
                                        dataContainer.innerHTML = button.domNode.outerHTML;
                                        first = false;
                                    } else {
                                        dataContainer.appendChild(button.domNode);
                                    }
                                }
                            }
                        }
                    }
                };
            });
            self.grid.liveConnect(self.grid.gridBodyNode, "onclick", {
                ".mx-button": lang.hitch(self, self.onclickEventInline),
                ".mx-link": lang.hitch(self, self.onclickEventInline)
            });
        },

        onclickEventInline: function(evt) {
            var tdNode = query(evt.target).closest("td")[0];
            var btnNode = query(evt.target).closest(".mx-link, .mx-button")[0];
            var btnSetting = registry.byNode(btnNode).btnSetting;

            if (btnSetting.confirm && !this.confirmed) {
                mx.ui.confirmation({
                    content: btnSetting.conQuestion,
                    proceed: btnSetting.conproceed,
                    cancel: btnSetting.conCancel,
                    handler: lang.hitch(this, function() {
                        this.confirmed = true;
                        this.onclickEventInline(evt);
                    })
                });
                return;
            }
            this.confirmed = false; // reset

            var row = this.grid.domData(tdNode, "row");
            row = parseInt(row, 10);
            var rowObject = this.grid.getMxObjectAtRow(row);
            var microflow = btnSetting.onClickMicroflow;
            if (microflow) {
                mx.ui.action(microflow, {
                    params: {
                        applyto: "selection",
                        guids: [ rowObject.getGuid() ]
                    },
                    progress: btnSetting.showProgress ? "modal" : null,
                    progressMsg: btnSetting.progressMessage,
                    origin: this.mxform,
                    callback: function() { /**/ },
                    error: function(error) {
                        mx.ui.error("Error executing microflow " + microflow + " : " + error.message);
                        logger.error("DataGridExtension.widget.InlineButtons.onclickEventInline: XAS error executing microflow" + error.message);
                    }
                }, this);
            }
        }

    });
});

// @ sourceURL=widgets/DataGridExtension/widget/InlineButtons.js
