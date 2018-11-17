/*jslint -W061:false*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dijit/layout/LinkPane"
], function (declare, _WidgetBase, dom, domStyle, domAttr, domConstruct, lang, html, LinkPane) {
    "use strict";

    return declare("HTMLSnippet.widget.HTMLSnippet", [_WidgetBase], {

        // Set in Modeler
        contenttype: "html",
        contents: "",
        contentsPath: "",
        onclickmf: "",
        documentation: "",
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,
        encloseHTMLWithDiv: true,

        // Internal
        _objectChangeHandler: null,
        contextObj: null,

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._setupEvents();

            if (!this.refreshOnContextChange) {
                this.executeCode();
            }
        },

        executeCode: function () {
            logger.debug(this.id + ".executeCode");
            var external = this.contentsPath !== "" ? true : false;
            switch (this.contenttype) {
                case "html":
                    if (external) {
                        new LinkPane({
                            preload: true,
                            loadingMessage: "",
                            href: this.contentsPath,
                            onDownloadError: function () {
                                console.log("Error loading html path");
                            }
                        }).placeAt(this.domNode.id).startup();
                    } else if (!this.encloseHTMLWithDiv) {
                        html.set(this.domNode, this.contents);
                    } else {
                        domStyle.set(this.domNode, {
                            "height": "auto",
                            "width": "100%",
                            "outline": 0
                        });

                        domAttr.set(this.domNode, "style", this.style); // might override height and width
                        var domNode = domConstruct.create("div", {
                            innerHTML: this.contents
                        });
                        domConstruct.place(domNode, this.domNode, "only");
                    }
                    break;

                case "js":
                case "jsjQuery":
                    if (external) {
                        var scriptNode = document.createElement("script"),
                            intDate = +new Date();

                        scriptNode.type = "text/javascript";
                        scriptNode.src = this.contentsPath + "?v=" + intDate.toString();

                        domConstruct.place(scriptNode, this.domNode, "only");
                    } else {
                        if (this.contenttype === "jsjQuery") {
                            require([
                                "HTMLSnippet/lib/jquery"
                            ], lang.hitch(this, this.evalJs));
                        } else {
                            this.evalJs();
                        }
                    }
                    break;
            }
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this.contextObj = obj;
            if (this.refreshOnContextChange) {
                this.executeCode();

                if (this.refreshOnContextUpdate) {
                    if (this._objectChangeHandler !== null) {
                        this.unsubscribe(this._objectChangeHandler);
                    }
                    if (obj) {
                        this._objectChangeHandler = this.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, function () {
                                this.executeCode();
                            })
                        });
                    }
                }
            }

            this._executeCallback(callback, "update");
        },

        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
            if (this.onclickmf) {
                this.connect(this.domNode, "click", this._executeMicroflow);
            }
        },

        _executeMicroflow: function () {
            logger.debug(this.id + "._executeMicroflow");
            if (this.onclickmf) {
                var params = {};
                if (this.contextObj !== null) {
                    params.applyto = "selection";
                    params.guids = [this.contextObj.getGuid()];
                }
                mx.ui.action(this.onclickmf, {
                    params: params,
                    callback: function (obj) { },
                    error: function (error) { }
                }, this);
            }
        },

        evalJs: function () {
            logger.debug(this.id + ".evalJS");
            try {
                eval(this.contents + "\r\n//# sourceURL=" + this.id + ".js");
            } catch (e) {
                domConstruct.place("<div class=\"alert alert-danger\">Error while evaluating javascript input: " + e + "</div>", this.domNode, "only");
            }
        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["HTMLSnippet/widget/HTMLSnippet"]);
