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
        transitionBeforePosition: "onNavigation",    // Set in Modeler in 'Advanced'
        onPauseTransitionTimeout: 10,                // Set in Modeler in 'Advanced'

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _transitionListenerHandlers: [],
        _transitionObserver: null,
        _pendingTimeout: null,
        _onNavigateTo: null,
        _onNavigation: null,
        _aroundNavigation: null,
        _onPauseListener: null,
        _onResumeListener: null,
        _paused: false,

        _enableTransitions: function() {
            this.debug("transitions._enableTransitions");

            ready(lang.hitch(this, this._setupMutationObserver));

            if (this.transitionBeforePosition === "onPersistViewChange") {
                this._aroundNavigation = aspect.around(this.mxform, "onPersistViewState", lang.hitch(this, function (onPersistViewState) {
                    return lang.hitch(this, function () {
                        var args = arguments;
                        this.sequence([
                            function(cb) {
                                setTimeout(cb, 1); // We're setting a timeout so the ui has set the actions in the "onClick"
                            },
                            function(cb) {
                                this.debug("onPersistViewState seq 1");
                                this._prepTransition();
                                setTimeout(cb, 1);
                            },
                            function(cb) {
                                this.debug("onPersistViewState seq 2");
                                onPersistViewState.apply(this, args);
                                setTimeout(cb, 1);
                            },
                            function(cb) {
                                this.debug("onPersistViewState seq 3");
                                this._fireTransition();
                                setTimeout(cb, 1);
                            },
                        ], function () {
                            this.debug("transition fired");
                        });
                    });
                }));
            } else {
                this._onNavigateTo = aspect.before(this.mxform, "onNavigation", lang.hitch(this, this._prepTransition));
                this._onNavigation = aspect.after(this.mxform, "onNavigation", lang.hitch(this, this._fireTransition));
            }

            this._onPauseListener = this.connect(document, "pause", lang.hitch(this, this._onPause));
            this._onResumeListener = this.connect(document, "resume", lang.hitch(this, this._onResume));
        },

        _onPause: function() {
            this.debug(this.id + "._onPause");
            setTimeout(lang.hitch(this, function () {
                this._paused = true;
                this._cancelTransition();
            }), this.onPauseTransitionTimeout);
        },

        _onResume: function() {
            this.debug(this.id + "._onResume");
            this._paused = false;
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
            this.debug("transitions._cleanupTransitions");
            if (this._transitionObserver) {
                this._transitionObserver.disconnect();
            }
            this._onNavigateTo && this._onNavigateTo.remove();
            this._onNavigation && this._onNavigation.remove();
            this._aroundNavigation && this._aroundNavigation.remove();

            this._onPauseListener && this._onPauseListener.remove();
            this._onResumeListener && this._onResumeListener.remove();

            if (this._pendingTimeout) {
                clearTimeout(this._pendingTimeout);
            }
            //Disconnect any listeners
            this._disconnectListeners();
        },

        _setupMutationObserver: function() {
            this.debug("transitions._setupMutationObserver");
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
            this.debug("transitions._setupListeners");
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
                this.debug("transitions._addTransition " + className + " " + elements.length + " found");
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
            this.debug("transitions._prepTransition");
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
                    lang.hitch(this, function(msg) {
                        this.debug("transitions._prepped", msg);
                    }), // called when the animation has finished
                    lang.hitch(this, function(msg) {
                        this.debug("transitions._prepped error", msg);
                        alert("error: " + msg);
                    }) // called in case you pass in weird valuesyou pass in weird values
                );

                window.plugins.nativepagetransitions.nextTransition = null;
                window.plugins.nativepagetransitions.nextOptions = null;
                //set a limit on how long we're going to keep the transition waiting, in case something breaks
                this._pendingTimeout = setTimeout(lang.hitch(this, this._cancelTransition), 10000);
            }

            return deferred;
        },

        _fireTransition: function(deferred) {
            this.debug("transitions._fireTransition");
            //Cancel a pending cancel transition timeout
            clearTimeout(this._pendingTimeout);

            //Run whatever pending transition is waiting
            if (window.plugins && typeof window.plugins.nativepagetransitions !== "undefined") {
                window.plugins.nativepagetransitions.executePendingTransition(
                    lang.hitch(this, function(msg) {
                        this.debug("transitions.executePendingTransition", msg);
                    }), // called when the animation has finished
                    lang.hitch(this, function(msg) {
                        this.debug("transitions.executePendingTransition error", msg);
                        alert("error: " + msg);
                    }) // called in case you pass in weird values
                );
            }

            return deferred;
        },

        _cancelTransition: function() {
            this.debug("transitions._cancelTransition");
            window.plugins.nativepagetransitions.cancelPendingTransition(
                lang.hitch(this, function(msg) {
                    this.debug("transitions.cancelPendingTransition", msg);
                }) // called when the screenshot was hidden (almost instantly)
            );
        }
    });
});
