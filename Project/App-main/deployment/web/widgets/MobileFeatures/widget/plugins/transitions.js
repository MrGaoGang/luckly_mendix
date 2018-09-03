define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/ready",
    "dojo/aspect",
    "dojo/_base/array",
    "dojo/query"
], function(declare, lang, on, ready, aspect, array, query) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobileFeatures.widget.plugin.transitions", [], {

        transitionsEnabled: false,
        fixedPixelsTop: 0,
        fixedPixelsBottom: 0,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _transitionListenerHandlers: [],
        _transitionObserver: null,
        _pendingTimeout: null,
        _onNavigateTo: null,
        _onNavigation: null,

        _enableTransitions: function() {
            this.debug("._enableTransitions");

            ready(lang.hitch(this, this._setupMutationObserver));
            //this._setupMutationObserver();
            this._onNavigateTo = aspect.before(this.mxform, "onNavigation", lang.hitch(this, this._prepTransition));
            this._onNavigation = aspect.after(this.mxform, "onNavigation", lang.hitch(this, this._fireTransition));
        },

        _disconnectListeners: function () {
            if (this._transitionListenerHandlers.length > 0) {
                array.forEach(this._transitionListenerHandlers, function (handle) {
                    if (handle.length > 0) {
                        array.forEach(handle, function (subhandle) {
                            subhandle.remove();
                        });
                    }
                });
            }
            this._transitionListenerHandlers = [];
        },

        _cleanupTransitions: function() {
            this.debug("._cleanupTransitions");
            if (this._transitionObserver) {
                this._transitionObserver.disconnect();
            }
            this._onNavigateTo.remove();
            this._onNavigation.remove();
            //Disconnect any listeners
            this._disconnectListeners();
        },

        _setupMutationObserver: function() {
            this.debug("._setupMutationObserver");
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

            this._transitionObserver = new MutationObserver(lang.hitch(this, this._setupListeners));

            // define what element should be observed by the observer
            // and what types of mutations trigger the callback
            this._transitionObserver.observe(document, {
                subtree: true,
                childList: true,
                attributes: false,
                characterData: false,
                attributeOldValue: false,
                characterDataOldValue: false
            });

            this._setupListeners();
        },

        _setupListeners: function() {
            this.debug("._setupListeners");
            this._disconnectListeners();
            if (typeof window.plugins !== "undefined" && typeof window.plugins.nativepagetransitions !== "undefined") {
                // Setup handlers here
                this._addTransition(this.classTransitionSU, "slide", this.duration, "up");
                this._addTransition(this.classTransitionSR, "slide", this.duration, "right");
                this._addTransition(this.classTransitionSD, "slide", this.duration, "down");
                this._addTransition(this.classTransitionSL, "slide", this.duration, "left");
                this._addTransition(this.classTransitionFU, "flip", this.duration, "up");
                this._addTransition(this.classTransitionFR, "flip", this.duration, "right");
                this._addTransition(this.classTransitionFD, "flip", this.duration, "down");
                this._addTransition(this.classTransitionFL, "flip", this.duration, "left");
                this._addTransition(this.classTransitionFade, "fade", this.duration);
            } else {
                console.warn(this.id + "._setupListeners: page transition plugin not found");
            }
        },

        _addTransition: function (className, transitionType, duration, direction) {
            var handle = null,
                elements =  query("." + className);

            if (elements.length === 0) {
                return;
            } else {
                this.debug("._addTransition " + className + " " + elements.length + " found");
            }

            if (transitionType === "fade") {

                handle = elements.on("click", lang.hitch(this, function() {
                    this.debug(this.id + " click transition " + transitionType);
                    window.plugins.nativepagetransitions.nextTransition = transitionType;
                    window.plugins.nativepagetransitions.nextOptions = {
                        "duration": duration, // in milliseconds (ms), default 400
                        "iosdelay": -1, // ms to wait for the iOS webview to update before animation kicks in, default 60
                        "androiddelay": -1
                    };
                }));

            } else if (transitionType === "slide") {

                handle = elements.on("click", lang.hitch(this, function() {
                    this.debug(this.id + " click transition " + transitionType + " " + direction);
                    window.plugins.nativepagetransitions.nextTransition = transitionType;
                    window.plugins.nativepagetransitions.nextOptions = {
                        "direction": direction, // "left|right|up|down", default "left" (which is like "next")
                        "duration": duration, // in milliseconds (ms), default 400
                        "slowdownfactor": 2, // overlap views (higher number is more) or no overlap (1), default 4
                        "iosdelay": -1, //defer transitions until they"re called later ////60, // ms to wait for the iOS webview to update before animation kicks in, default 60
                        "androiddelay": -1, //defer transitions until they"re called later ////70 // same as above but for Android, default 70
                        "winphonedelay": 200, // same as above but for Windows Phone, default 200,
                        "fixedPixelsTop": this.fixedPixelsTop, // the number of pixels of your fixed header, default 0 (iOS and Android)
                        "fixedPixelsBottom": this.fixedPixelsBottom // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                    };
                }));

            } else if (transitionType === "flip") {

                handle = elements.on("click", lang.hitch(this, function() {
                    this.debug(this.id + " click transition " + transitionType + " " + direction);
                    window.plugins.nativepagetransitions.nextTransition = transitionType;
                    window.plugins.nativepagetransitions.nextOptions = {
                        "direction": direction, // "left|right|up|down", default "left" (which is like "next")
                        "duration": duration, // in milliseconds (ms), default 400
                        "iosdelay": -1, //defer transitions until they"re called later ////60, // ms to wait for the iOS webview to update before animation kicks in, default 60
                        "androiddelay": -1, //defer transitions until they"re called later ////70 // same as above but for Android, default 70
                        "winphonedelay": 200, // same as above but for Windows Phone, default 200,
                    };
                }));

            }

            if (handle !== null) {
                this._transitionListenerHandlers.push(handle);
            }
        },

        _prepTransition: function(deferred) {
            this.debug("._prepTransition");
            //instead of setting up a pending when a button is clicked, we're just going to leave options on the plugin object, then prep it before onNavigation.
            //Then we'll call the actual animation after onNavigation
            //This should solve a bunch of problems with taking a screenshot too early, and covering up things like errors

            if (window.plugins && typeof window.plugins.nativepagetransitions !== "undefined" && window.plugins.nativepagetransitions.nextTransition) {
                //clean up any pending transitions, in case they didn't get fired yet.
                //Otherwise you can mess up the plugin by creating 2 screenshots and one of them never gets removed
                this._cancelTransition();

                var transitionType = window.plugins.nativepagetransitions.nextTransition;
                window.plugins.nativepagetransitions[transitionType](
                    window.plugins.nativepagetransitions.nextOptions,
                    function(msg) {
                        //console.log("success: " + msg);
                    }, // called when the animation has finished
                    function(msg) {
                        alert("error: " + msg);
                    } // called in case you pass in weird values
                );

                window.plugins.nativepagetransitions.nextTransition = null;
                window.plugins.nativepagetransitions.nextOptions = null;
                //set a limit on how long we're going to keep the transition waiting, in case something breaks
                this._pendingTimeout = setTimeout(lang.hitch(this, this._cancelTransition), 10000);
            }

            return deferred;
        },

        _fireTransition: function(deferred) {
            this.debug("._fireTransition");
            //Cancel a pending cancel transition timeout
            clearTimeout(this._pendingTimeout);

            //Run whatever pending transition is waiting
            if (window.plugins && typeof window.plugins.nativepagetransitions !== "undefined") {
                window.plugins.nativepagetransitions.executePendingTransition(
                    function(msg) {
                        //console.log("executePendingTransition", msg);
                    }, // called when the animation has finished
                    function(msg) {
                        alert("error: " + msg);
                    } // called in case you pass in weird values
                );
            }

            return deferred;
        },

        _cancelTransition: function() {
            this.debug("._cancelTransition");
            window.plugins.nativepagetransitions.cancelPendingTransition(

            function(msg) {
                //console.log("cancelPendingTransition", msg);
            } // called when the screenshot was hidden (almost instantly)
            );
        }
    });
});
