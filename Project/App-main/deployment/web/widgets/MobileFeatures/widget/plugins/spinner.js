define([
    "dojo/_base/declare",
    "dojo/_base/lang",
], function(declare, lang) {
    "use strict";

    return declare("MobileFeatures.widget.plugin.spinner", [], {

        // Set in modeler
        spinnerEnabled: false,
        spinnerDelay: 500,

        spinnerOptions: {
            dimBackground: true
        },

        // Internal variables.
        _spinnerShowTimer: null,
        _spinnerShowing: false,
        _spinnerShowPending: false,

        _spinnerMessageId: 1,
        _spinnerMessages: null,

        _findInArray: function(array, test, scope) {
            for (var i = 0; i < array.length; i++) {
                if (test.call(scope, array[i], i, array)) return array[i];
            }
            return undefined;
        },

        _findIndex : function(array, test) {
            for (var i = 0; i < array.length; i++) {
                if (test(array[i], i)) return i;
            }
            return -1;
        },

        // spinner
        _enableSpinner: function() {
            this.debug("._enableSpinner");

            if (window.SpinnerPlugin && !mx.ui.hideProgressOrig) {
                mx.ui.showProgressOrig = mx.ui.showProgress;
                mx.ui.showProgress = this._spinnerShowProgressReplacement.bind(this);

                if (!mx.ui.hideProgressOrig) {
                    mx.ui.hideProgressOrig = mx.ui.hideProgress;
                }

                mx.ui.hideProgress = this._spinnerHideProgressReplacement.bind(this);
                //mx.ui.hideProgressOrig(0);

                this._spinnerMessages = [];
            } else if (!!mx.ui.hideProgressOrig) {
                this.debug("._enableSpinner spinner is already enabled. Locking previous one");
                if (!window.__SpinnerLock) {
                    window.__SpinnerLock = true;
                }
            } else {
                console.warn(this.id + "._enableSpinner spinner not enabled. 'cordova-plugin-spinner' plugin missing in Phonegap");
            }
        },

        _disableSpinner: function() {
            if (window.__SpinnerLock) {
                this.debug("._disableSpinner not running, got another instance requesting this.");
                window.__SpinnerLock = false;
                return;
            }
            this.debug("._disableSpinner");
            if (mx.ui.hideProgressOrig) {
                mx.ui.hideProgress = mx.ui.hideProgressOrig;
                mx.ui.hideProgressOrig = null;
            }
            if (mx.ui.showProgressOrig) {
                mx.ui.showProgress = mx.ui.showProgressOrig;
                mx.ui.showProgressOrig = null;
            }
        },

        _spinnerShowProgressReplacement: function(msg, modal) {
            this.debug("._spinnerShowProgressReplacement");
            var id = this._spinnerMessageId++;
            this._spinnerMessages.push({
                id: id,
                text: msg,
                modal: modal
            });

            if (!this._spinnerShowTimer) {
                this._spinnerShowPending = true;
                this._spinnerShowTimer = setTimeout(lang.hitch(this, function() {
                    this._spinnerShowing = true;
                    this._spinnerShowPending = false;
                    this._spinnerShowTimer = null;
                    window.SpinnerPlugin.activityStart(
                        !!msg ? msg : null,
                        !!msg ? this.spinnerOptions : { dimBackground: false },
                        lang.hitch(this, function () {
                            this.debug("._spinnerShow succes");
                        }),
                        lang.hitch(this, function () {
                            this.debug("._spinnerShow failed");
                        })
                    );
                }), this.spinnerDelay);
            }
            return id;
        },

        _spinnerHideProgressReplacement: function(pid) {
            this.debug("._spinnerHideProgressReplacement " + pid + "/" + this._spinnerShowPending);

            var message = this._findInArray(this._spinnerMessages, function (msg) {
                return msg.id === pid;
            });

            if (this._spinnerShowPending) {
                clearTimeout(this._spinnerShowTimer);
                this._spinnerShowTimer = null;
                this._spinnerShowPending = false;
                this._spinnerShowing = false;
                window.SpinnerPlugin.activityStop(
                    lang.hitch(this, function () {
                        this.debug("._spinnerHide succes");
                    }),
                    lang.hitch(this, function () {
                        this.debug("._spinnerHide failed");
                    })
                );
                if (message) {
                    this._removeMsg(pid);
                }
            } else if (this._spinnerShowing && message) {
                this._spinnerShowPending = false;
                this._spinnerShowing = false;
                window.SpinnerPlugin.activityStop(
                    lang.hitch(this, function () {
                        this.debug("._spinnerHide succes");
                    }),
                    lang.hitch(this, function () {
                        this.debug("._spinnerHide failed");
                    })
                );
                this._removeMsg(pid);
            } else if (pid !== null && pid !== undefined) {
                mx.ui.hideProgressOrig(pid);
            } else {
                this.debug("._spinnerHideProgressReplacement not closing this progress, not triggered by plugin");
            }
        },

        _removeMsg: function (id) {
            var index = this._findIndex(this._spinnerMessages, function (msg) { return msg.id === id; });
            if (index !== -1) {
                this._spinnerMessages.splice(index, 1);
            }
        }
    });
});
