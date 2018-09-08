define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/query"
], function(declare, lang, win, dom, domConstruct, domClass, query) {
    "use strict";

    var ConnectionError = mendix.lib.ConnectionError;

    return declare("MobileFeatures.widget.plugin.CustomConnectionError", [], {

        // Set in modeler
        customConnectionErrorEnabled: false,

        // private
        _timeOut: null,
        _oldError: null,
        _errorBar: null,

        _enableCustomConnectionError: function() {
            this.debug("._enableCustomConnectionError");

            if (!ConnectionError) {
                console.warn(this.id + "Connection Error Replacement: Cannot find mendix.lib.ConnectionError");
                return;
            }

            this._oldError = mx.onError;

            this._errorBar = domConstruct.create("div", {
                "id": "connection-error-bar",
                "class": "hidden"
            }, win.body());

            domConstruct.create("p", {
                "id": "connection-error-bar-message",
                "innerHTML": this.customConnectionErrorMsg,
            }, this._errorBar);

            setTimeout(lang.hitch(this, this._showConnectionError, false), 500);

            mx.onError = lang.hitch(this, function(e) {
                if (e && e instanceof ConnectionError) {

                    this._showConnectionError(true);
                    if (this._timeOut) {
                        clearTimeout(this._timeOut);
                    }

                    this._timeOut = setTimeout(lang.hitch(this, function() {
                        this._showConnectionError(false);
                        this._timeOut = null;
                    }), 2000);

                } else {
                    this._oldError(e);
                }
            });
        },

        _disableCustomConnectionError: function () {
            if (this._oldError) {
                mx.onError = this._oldError;
            }
            domConstruct.destroy(this._errorBar);
        },

        _showConnectionError: function(state) {
            this.debug("._showConnectionError");
            if (this._errorBar) {
                domClass.toggle(this._errorBar, "hidden", false);
                domClass.toggle(this._errorBar, "closed", !state);
                domClass.toggle(this._errorBar, "open", state);
            }
        }
    });
});
