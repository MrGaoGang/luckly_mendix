define([
    "dojo/_base/declare",
    "dojo/_base/lang",
], function(declare, lang) {
    "use strict";

    return declare("MobileFeatures.widget.plugin.dialog", [], {

        // Set in modeler
        dialogEnabled: true,

        _enableDialog: function() {
            this.debug("._enableDialog");
            if (navigator && navigator.notification && (typeof mx.ui.mobileDialogLoaded === "undefined" || mx.ui.mobileDialogLoaded === null || mx.ui.mobileDialogLoaded === false)) {
                mx.ui.mobileDialogLoaded = true;
                mx.ui.confirmation = lang.hitch(this, this._confirmationReplacement);

                mx.ui.info = lang.hitch(this, this._infoReplacement);
                mx.ui.warning = lang.hitch(this, this._warningReplacement);
                mx.ui.error = lang.hitch(this, this._errorReplacement);

            } else if (mx.ui.mobileDialogLoaded === true) {
                this.debug("._enableDialog not loaded, already enabled");
            } else {
                console.warn(this.id + "._enableDialog dialog not enabled. Either already enabled or 'cordova-plugin-dialogs' plugin missing in Phonegap");
            }
        },

        _confirmationReplacement: function(args) {
            this.debug("._confirmationReplacement");
            navigator.notification.confirm(args.content, function(buttonNum) {
                if (buttonNum === 1) {
                    args.handler();
                    //Extra argument so other widgets can get a callback on the cancel button too
                } else if (buttonNum === 2) {
                    if (window.plugins && window.plugins.nativepagetransitions) {
                        window.plugins.nativepagetransitions.cancelPendingTransition(function(msg) {
                            //console.log("success: " + msg)
                        }); // called when the screenshot was hidden (almost instantly)
                    }
                    if (args.handlerCancel) {
                        args.handlerCancel();
                    }
                }
            }, "Confirm", [args.proceed, args.cancel]);
        },

        _infoReplacement: function(msg, modal) {
            navigator.notification.alert(msg, null, "Info");
        },
        _warningReplacement: function(msg, modal) {
            navigator.notification.alert(msg, null, "Warning");
        },
        _errorReplacement: function(msg, modal) {
            navigator.notification.alert(msg, null, "Error");
        }

    });
});
