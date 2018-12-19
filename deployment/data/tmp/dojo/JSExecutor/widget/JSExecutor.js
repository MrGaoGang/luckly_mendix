require({cache:{
'url:JSExecutor/widget/template/JSExecutor.html':"<div data-dojo-attach-point=\"jsExecutor\">JS Executor</div>"}});
define("JSExecutor/widget/JSExecutor", [
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/text!JSExecutor/widget/template/JSExecutor.html"
], function (declare, _WidgetBase,template, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent,htmlTemplate) {
    "use strict";

    return declare("JSExecutor.widget.JSExecutor", [ _WidgetBase,template ], {


        // Internal variables.
        _handles: null,
        _contextObj: null,
        
        templateString:htmlTemplate,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);

            if(this.lableName!==""){
                this.jsExecutor.innerHTML=this.lableName;
            }

            var that=this;
            this.connect(this.jsExecutor,"click",function(e){
                if(that.micBeforClick!==""){
                    that._execMf(that.micBeforClick,that._contextObj.getGuid(),function(bool){
                        if(bool){
                            eval(that.jsCode);
                            that.callMFAfterEx();
                        }
                    })
                }else{
                    eval(that.jsCode);
                    that.callMFAfterEx();
                }
            });



        },

        callMFAfterEx:function(){
            var that=this;
            if(that.micAfterClick!==""){
                that._execMf(that.micAfterClick,that._contextObj.getGuid(),function(bool){
                  
                })
            }
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["JSExecutor/widget/JSExecutor"]);
