define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/_base/window"
], function(declare, lang, dojoClass, win) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobileFeatures.widget.plugin.statusbar", [], {

        statusbarBackgroundColor: "000000",
        statusbarTextColor: "white",
        statusbarShowStatusBar: true,
        statusbarOverlayWebView: true,

        _enableStatusbar: function() {
            this.debug("._enableStatusbar");

            // Platform
            if (typeof StatusBar !== "undefined") {
                if (this.statusbarBackgroundColor && StatusBar.backgroundColorByHexString) {
                    StatusBar.backgroundColorByHexString(this.statusbarBackgroundColor);
                }
                if (this.statusbarTextColor === "white" && StatusBar.styleLightContent) {
                    StatusBar.styleLightContent();
                } else {
                    StatusBar.styleDefault();
                }
                if (this.statusbarShowStatusBar) {
                    StatusBar.show();
                } else {
                    StatusBar.hide();
                }
                if (StatusBar.overlaysWebView) {
                    StatusBar.overlaysWebView(this.statusbarOverlayWebView);
                }
            } else {
                console.warn(this.id + "._enableStatusbar: cannot find StatusBar");
            }
        }
    });
});
