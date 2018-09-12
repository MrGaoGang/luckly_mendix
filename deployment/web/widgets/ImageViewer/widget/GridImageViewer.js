/*global logger*/
/*
    GridImageViewer
    ========================

    @file      : GridImageViewer.js
    @version   : 1.0.0
    @author    : MrGao
    @date      : Mon, 27 Aug 2018 16:21:23 GMT
    @copyright : 
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/json",
    "ImageViewer/lib/jquery-1.11.2",

    "ImageViewer/lib/imagesloaded",
    "ImageViewer/lib/masonry",

    "dojo/text!ImageViewer/widget/template/GridImageViewer.html",
    "dojo/dom-attr",
    "dojo/window"
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    dom,
    dojoDom,
    dojoProp,
    dojoGeometry,
    dojoClass,
    dojoStyle,
    dojoConstruct,
    dojoArray,
    lang,
    dojoText,
    dojoHtml,
    dojoEvent,
    dojoJson,
    jQuery,

    imagesloaded,
    masonry,
    widgetTemplate,
    dojoAttr,
    dojoWindow

) {
    "use strict";

    var $ = jQuery.noConflict(true);


    // Declare widget's prototype.
    return declare(
        "ImageViewer.widget.GridImageViewer",
        [_WidgetBase, _TemplatedMixin], {
            // _TemplatedMixin will create our dom node using this HTML template.
            templateString: widgetTemplate,

            // DOM elements
            inputNodes: null,
            colorSelectNode: null,
            colorInputNode: null,
            infoTextNode: null,

            // Parameters configured in the Modeler.
            mfToExecute: "",
            messageString: "",
            backgroundColor: "",

            // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
            _handles: null,
            _contextObj: null,
            _alertDiv: null,
            _readOnly: false,

            imageData: null,
            imageCSS: null,
            // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
            constructor: function () {
                logger.debug(this.id + ".constructor");
                this._handles = [];
            },


            // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
            postCreate: function () {
                logger.debug(this.id + ".postCreate");

                if (this.readOnly || this.get("disabled") || this.readonly) {
                    this._readOnly = true;
                }


                this._updateRendering();
                this._setupEvents();
            },

            // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
            update: function (obj, callback) {
                logger.debug(this.id + ".update");

                this._contextObj = obj;
                this._resetSubscriptions();
                this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation

                if (!this._contextObj) {
                    return;
                }


                //获取属性的值
                var attr = this._contextObj.get(this.dataAttr);

                if (attr && attr != "") {
                    this.imageData = eval("(" + attr + ")")
                } else if (this.dataMF && this.dataMF != "") {
                    this._execMf(this.dataMF, this._contextObj.getGuid(), lang.hitch(this, this.resolveMFData))
                } else if (this.dataString && this.dataString != "") {
                    this.imageData = eval("(" + this.dataString + ")")
                }

                if (this.cssParse && this.cssParse != "") {
                    this.imageCSS = eval("(" + this.cssParse + ")")
                }

                var columnWidth = this.getImageSize()
                console.log("图片的宽度"+columnWidth)
                this.refreshScreen(columnWidth)

                var self = this
                $(window).resize(function () {
                    var columnWidth = self.getImageSize()
                    console.log("图片的宽度"+columnWidth)
                    self.refreshScreen(columnWidth)
                });


            },


            refreshScreen: function (columnWidth) {
                var self = this
                //设置属性
                dojoAttr.set(this.gaoGrid, "data-masonry", dojoJson.stringify({
                    "itemelector": ".item",
                    "columnWidth": columnWidth
                }))

                var htmlShow = ""
                $.each(this.imageData, function (indexInArray, valueOfElement) {
                    htmlShow += '<div class="item"><img src="' + valueOfElement.imageUrl + '" width="' + columnWidth + 'px" />'
                    if (valueOfElement.desc && valueOfElement.desc != "") {
                        htmlShow += ' <p>' + valueOfElement.desc + '</p>'
                    }
                    htmlShow += '</div>'
                });

                $(".container").html(htmlShow)

                $(".item").css("width", columnWidth)


                //设置了image和css的样式
                if (this.imageCSS) {
                    if (this.imageCSS.img) {
                        $(".item img").css(this.imageCSS.img)
                    }

                    if (this.imageCSS.item) {
                        $(".item").css(this.imageCSS.item)
                    }

                    if (this.imageCSS.desc) {
                        $(".item p").css(this.imageCSS.desc)
                    }
                }




                new imagesloaded(document.querySelector('.container'), function (instance) {
                    // container.fadeIn();
                    new masonry('.item', {
                        itemSelector: '.item',
                        isAnimated: true,
                        gutterWidth: self.gutterWidth
                    });
                });



                //如果为圆角图片则设置为圆角
                // if (this.isRoundImg) {
                //     $(".item img").each(function (indexInArray) {
                //         if ($(this).width() > $(this).height()) {
                //             $(this).css("border-radius", $(this).width())
                //         } else {
                //             $(this).css("border-radius", $(this).height())
                //         }
                //     });

                // }

            },

            getImageSize: function () {

                if (this.imageCSS.item) {
                    var len = 0
                    for (var key in this.imageCSS.item) {
                        if (key.search("margin") > -1) {
                            len += parseInt((this.imageCSS.item[key].replace(/[^0-9]/ig, ""))) * (this.numColumn-1);
                        }
                    }
                    return ($(window.parent.window).width() - len) / (this.numColumn+1);
                } else {

                    return ($(window.parent.window).width()) / (this.numColumn + 1);
                }
            },

            //执行微流，会将微流的返回结果到这里
            resolveMFData: function (data) {
                //  dojoProp.set(this.MRGaoImage, "src", data);
                this.imageData = eval("(" + data + ")")
                // $(this.gaoGrid).imagesGrid(this.imageData);
            },


            // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
            enable: function () {
                logger.debug(this.id + ".enable");
            },

            // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
            disable: function () {
                logger.debug(this.id + ".disable");
            },

            // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
            resize: function (box) {
                logger.debug(this.id + ".resize");
            },

            // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
            uninitialize: function () {
                logger.debug(this.id + ".uninitialize");
                // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
            },

            // We want to stop events on a mobile device
            _stopBubblingEventOnMobile: function (e) {
                logger.debug(this.id + "._stopBubblingEventOnMobile");
                if (typeof document.ontouchstart !== "undefined") {
                    dojoEvent.stop(e);
                }
            },

            // Attach events to HTML dom elements
            _setupEvents: function () {
                logger.debug(this.id + "._setupEvents");
                this.connect(
                    this.colorSelectNode,
                    "change",
                    function (e) {
                        // Function from mendix object to set an attribute.
                        this._contextObj.set(
                            this.backgroundColor,
                            this.colorSelectNode.value
                        );
                    }
                );

                this.connect(
                    this.infoTextNode,
                    "click",
                    function (e) {
                        // Only on mobile stop event bubbling!
                        this._stopBubblingEventOnMobile(e);

                        // If a microflow has been set execute the microflow on a click.
                        if (this.mfToExecute !== "") {
                            this._execMf(
                                this.mfToExecute,
                                this._contextObj.getGuid()
                            );
                        }
                    }
                );
            },

            _execMf: function (mf, guid, cb) {
                logger.debug(this.id + "._execMf");
                if (mf && guid) {
                    mx.ui.action(
                        mf, {
                            params: {
                                applyto: "selection",
                                guids: [guid]
                            },
                            callback: lang.hitch(this, function (objs) {
                                if (cb && typeof cb === "function") {
                                    cb(objs);
                                }
                            }),
                            error: function (error) {
                                console.debug(error.description);
                            }
                        },
                        this
                    );
                }
            },

            // Rerender the interface.
            _updateRendering: function (callback) {
                logger.debug(this.id + "._updateRendering");

                // Important to clear all validations!
                this._clearValidations();

                // The callback, coming from update, needs to be executed, to let the page know it finished rendering
                this._executeCallback(callback, "_updateRendering");
            },

            // Handle validations.
            _handleValidation: function (validations) {
                logger.debug(this.id + "._handleValidation");
                this._clearValidations();
            },

            // Clear validations.
            _clearValidations: function () {
                logger.debug(this.id + "._clearValidations");
                dojoConstruct.destroy(this._alertDiv);
                this._alertDiv = null;
            },

            // Show an error message.
            _showError: function (message) {
                logger.debug(this.id + "._showError");
                if (this._alertDiv !== null) {
                    dojoHtml.set(this._alertDiv, message);
                    return true;
                }
                this._alertDiv = dojoConstruct.create("div", {
                    class: "alert alert-danger",
                    innerHTML: message
                });
                dojoConstruct.place(this._alertDiv, this.domNode);
            },

            // Add a validation.
            _addValidation: function (message) {
                logger.debug(this.id + "._addValidation");
                this._showError(message);
            },

            // Reset subscriptions.
            _resetSubscriptions: function () {
                logger.debug(this.id + "._resetSubscriptions");
                // Release handles on previous object, if any.
                this.unsubscribeAll();

                // When a mendix object exists create subscribtions.
                if (this._contextObj) {
                    this.subscribe({
                        guid: this._contextObj.getGuid(),
                        callback: lang.hitch(this, function (guid) {
                            this._updateRendering();
                        })
                    });

                    this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: this.backgroundColor,
                        callback: lang.hitch(this, function (
                            guid,
                            attr,
                            attrValue
                        ) {
                            this._updateRendering();
                        })
                    });

                    this.subscribe({
                        guid: this._contextObj.getGuid(),
                        val: true,
                        callback: lang.hitch(this, this._handleValidation)
                    });
                }
            },

            _executeCallback: function (cb, from) {
                logger.debug(
                    this.id +
                    "._executeCallback" +
                    (from ? " from " + from : "")
                );
                if (cb && typeof cb === "function") {
                    cb();
                }
            }
        }
    );
});

require(["ImageViewer/lib/imagesloaded",
    "ImageViewer/lib/masonry",
    "ImageViewer/widget/GridImageViewer"
]);
