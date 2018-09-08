define([
    "dojo/_base/declare",
    "dijit/registry"
], function(declare, dijitRegistry) {
    "use strict";

    return declare("MobileFeatures.widget.advanced", [], {

        advancedListViewLazyLoad: true,
        advancedGroupboxLazyLoad: true,

        _enableListViewLazyLoad: function() {
            window.mxui.widget.ListView.prototype.update = function(obj, cb) {
                if (this.class.indexOf("disable-lazy") == -1) {
                    window.setTimeout(function () {
                        this._registerSubscriptions();
                        this._loadData(cb);
                    }.bind(this), 0);
                    if (cb) {
                        cb();
                    }
                } else {
                    this._registerSubscriptions();
                    this._loadData(cb);
                }
            };
        },

        _enableGroupboxLazyLoad: function() {
            window.mxui.widget.GroupBox.prototype.update = function(obj, callback) {
                if (this.class.indexOf("disable-lazy") == -1) {
                    window.setTimeout(function() {
                        if (this._captionTextTemplate) {
                            this._captionTextTemplate.update(obj);
                        }
                        this.passContext(dijitRegistry.findWidgets(this.domNode));
                    }.bind(this), 0);
                    if (callback) {
                        callback();
                    }
                } else {
                    if (this._captionTextTemplate) {
                        this._captionTextTemplate.update(obj);
                    }
                    this.passContext(dijitRegistry.findWidgets(this.domNode), callback);
                }
            };
        }
    });
});
