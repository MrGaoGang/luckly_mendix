define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/_base/window"
], function(declare, lang, dojoClass, win) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobileFeatures.widget.advanced", [], {

        advancedListViewLazyLoad: true,
        advancedGroupboxLazyLoad: true,

        _enableListViewLazyLoad: function() {
            window.mxui.widget.ListView.prototype.update = function(obj, cb) {
                //var _showProgressId = mx.ui.showProgress(null, true);
                window.setTimeout(function() {
                    this._registerSubscriptions();
                    this._loadData(function() {
                        //mx.ui.hideProgress(_showProgressId); // Disabled, not working yet
                    });
                }.bind(this), 0);
                if (cb) {
                    cb();
                }
            };
        },

        _enableGroupboxLazyLoad: function() {
            window.mxui.widget.GroupBox.prototype.update = function(obj, cb) {
                window.setTimeout(function() {
                    var i = this;
                    function n() {
                        require(["dijit/registry"], function(registry) {
                            i.passContext(registry.findWidgets(i.domNode), cb);
                        });
                    }
                    this._captionTextTemplate ? this._captionTextTemplate.update(obj, n) : n();
                }.bind(this), 0);
                if (cb) {
                    cb();
                }
            };
        }
    });
});
