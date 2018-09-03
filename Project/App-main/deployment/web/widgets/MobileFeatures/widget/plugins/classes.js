define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/ready",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/_base/window",
    "dojo/_base/array",
    "dojo/query",
    "dojo/NodeList-data"
], function(declare, lang, on, ready, attr, dojoClass, win, array, query) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobileFeatures.widget.plugin.classes", [], {

        classOnline: "app-online",
        classOffline: "app-offline",
        classAndroid: "app-android",
        classIOS: "app-ios",

        _transitionClassesObserver: null,

        _enableClasses: function() {
            this.debug("._enableClasses");

            ready(lang.hitch(this, this._setupClassesMutationObserver));

            // Platform
            if (typeof device !== "undefined" && device.platform) {
                var platform = device.platform.toLowerCase().trim();
                if  (platform === "android") {
                    dojoClass.toggle(win.body(), this.classAndroid, true);
                } else if (platform === "ios") {
                    dojoClass.toggle(win.body(), this.classIOS, true);
                } else {
                    console.warn(this.id + "._enableClasses: unknown platform: " + platform);
                }
            } else {
                console.warn(this.id + "._enableClasses: cannot determine platform");
            }

            // Connection
            if (navigator.connection && typeof Connection !== "undefined") {
                this._enableConnectionDetection();
            } else {
                console.warn(this.id + "._enableClasses: cannot set connection classes");
            }

        },

        _setupClassesMutationObserver: function() {
            this.debug("._setupClassesMutationObserver");
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

            this._transitionClassesObserver = new MutationObserver(lang.hitch(this, this._setupClassListeners));

            // define what element should be observed by the observer
            // and what types of mutations trigger the callback
            this._transitionClassesObserver.observe(document, {
                subtree: true,
                childList: true,
                attributes: false,
                characterData: false,
                attributeOldValue: false,
                characterDataOldValue: false
            });

            this._setupClassListeners();
        },

        _setupClassListeners: function() {
            this._setTypes(this.classNumeric, "number");
        },

        _setTypes: function(formClass, type) {
            var handle = null,
                elements =  query("." + formClass + " input[type=text]");

            if (elements.length === 0) {
                return;
            } else {
                this.debug("._setTypes " + formClass + " " + elements.length + " found");
            }

            array.forEach(elements, lang.hitch(this, function (element, index) {
                attr.set(element, "type", type);
            }));
        },

        _enableConnectionDetection: function () {
            this._toggleStatus(true);
            document.addEventListener("offline", lang.hitch(this, this._onOffline), false);
            document.addEventListener("online", lang.hitch(this, this._onOnline), false);
        },

        _toggleStatus: function (online) {
            dojoClass.toggle(win.body(), this.classOnline, online);
            dojoClass.toggle(win.body(), this.classOffline, !online);
        },

        _onOnline: function () {
            var networkState = navigator.connection.type;
            this._toggleStatus(networkState && networkState !== Connection.NONE);
        },

        _onOffline: function () {
            this._toggleStatus(false);
        },

        _disableClasses: function () {
            this.debug("._disableClasses");
            if (this._transitionClassesObserver) {
                this._transitionClassesObserver.disconnect();
            }
        }
    });
});
