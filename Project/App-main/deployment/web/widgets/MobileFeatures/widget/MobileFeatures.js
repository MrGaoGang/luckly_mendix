define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang",

    "MobileFeatures/widget/plugins/spinner",
    "MobileFeatures/widget/plugins/dialog",
    "MobileFeatures/widget/plugins/transitions",
    "MobileFeatures/widget/plugins/classes",
    "MobileFeatures/widget/plugins/statusbar",
    "MobileFeatures/widget/plugins/customconnectionerror",
    "MobileFeatures/widget/plugins/advanced"

], function(declare, _WidgetBase, lang, spinner, dialog, transitions, classes, statusbar, customconnectionerror, advanced) {
    "use strict";

    return declare("MobileFeatures.widget.MobileFeatures", [
        _WidgetBase,
        spinner, dialog, transitions, classes, statusbar, customconnectionerror, advanced
    ], {

        _phonegapEnabled: false,

        constructor: function () {
            this._phonegapEnabled = (typeof cordova !== "undefined");
            this._phonegapEnabled && this.advancedListViewLazyLoad && this._enableListViewLazyLoad();
            this._phonegapEnabled && this.advancedListViewLazyLoad && this._enableGroupboxLazyLoad();
        },

        _debuggingKey: "MobileFeatures_debugging",

        _getDebugging: function () {
            logger.debug(this.id + "._getDebugging");
            var storage = window.localStorage;
            var val = storage.getItem(this._debuggingKey);
            if (val) {
                window.__MobileFeatures_debugging = val === "true";
            } else {
                this.setDebugging(false);
            }
        },

        setDebugging: function (val) {
            var storage = window.localStorage;
            storage.setItem(this._debuggingKey, val);
            window.__MobileFeatures_debugging = val;
        },

        postCreate: function() {
            this.debug(".postCreate");

            window.__MobileFeaturesWidget = this;
            if (typeof window.__MobileFeatures_debugging === "undefined") {
                this._getDebugging();
            }

            if (this._phonegapEnabled) {
                this.spinnerEnabled && this._enableSpinner();
                this.dialogEnabled && this._enableDialog();
                this.transitionsEnabled && this._enableTransitions();
                this._enableClasses();
                this.statusbarEnabled && this._enableStatusbar();
                this.customConnectionErrorEnabled && this._enableCustomConnectionError();
            } else {
                console.warn(this.id + " widget is only enabled in Hybrid Mobile app (Phonegap)");
            }
        },

        uninitialize: function() {
            this.debug(".uninitialize");

            if (this._phonegapEnabled) {
                this._disableClasses();
                this.spinnerEnabled && this._disableSpinner();
                this.transitionsEnabled && this._cleanupTransitions();
                this.customConnectionErrorEnabled && this._disableCustomConnectionError();
            }
        },

        debug: function() {
            [].unshift.call(arguments, this.id);
            if (window.__MobileFeatures_debugging) {
                console.log.apply(console, arguments);
            } else {
                logger.debug.apply(this, arguments);
            }
        }
    });
});

require(["MobileFeatures/widget/MobileFeatures"]);
