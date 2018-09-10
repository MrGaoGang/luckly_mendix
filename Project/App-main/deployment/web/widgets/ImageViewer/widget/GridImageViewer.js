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


                // $(this.gaoGrid).css("width", this.imageWidth);
                // $(this.gaoGrid).css("height", this.imageHeight);
                //获取属性的值
                var attr = this._contextObj.get(this.dataAttr);

                if (attr && attr != "") {
                    this.imageData = eval("(" + attr + ")")
                } else if (this.dataMF && this.dataMF != "") {
                    this._execMf(this.dataMF, this._contextObj.getGuid(), lang.hitch(this, this.resolveMFData))
                } else if (this.dataString && this.dataString != "") {
                    this.imageData = eval("(" + this.dataString + ")")
                }

              
                   new  imagesloaded(document.querySelector('.container'), function () {
                        // container.fadeIn();
                        console.log("显示咯1")
                        new masonry('.container', {
                            itemSelector: '.item',
                            isAnimated: true,
                        });
                    });
                


                // this.rowGrid(this.gaoGrid, {
                //     itemSelector: '.item',
                //     minMargin: 10,
                //     maxMargin: 25,
                //     firstItemClass: 'first-item',
                //     lastRowClass: 'last-row',
                //     minWidth: 500
                // })

            },


            rowGrid: function (container, options) {
                if (container == null || container == undefined) {
                    console.log("不可能唯恐吧")
                    return;
                }

                if (options === 'appended') {

                    options = dojoJson.parse(dojoAttr.get(container, 'data-row-grid'));
                    var lastRow = container.getElementsByClassName(options.lastRowClass)[0];
                    var items = nextAll(lastRow);
                    layout(container, options, items);
                } else {
                    if (!options) {
                        options = dojoJson.parse(dojoAttr.get(container, 'data-row-grid'));
                    } else {
                        if (options.minWidth === undefined) options.minWidth = 0;
                        if (options.lastRowClass === undefined) options.lastRowClass = 'last-row';

                        dojoAttr.set(container, 'data-row-grid', dojoJson.stringify(options))
                        //container.setAttribute('data-row-grid', JSON.stringify(options));
                        window.addEventListener('resize', function (event) {
                            layout(container, options);
                        });
                    }

                    layout(container, options);
                }

                /* Get elem and all following siblings of elem */
                function nextAll(elem) {
                    var matched = [elem];

                    while ((elem = elem['nextSibling']) && elem.nodeType !== 9) {
                        if (elem.nodeType === 1) {
                            matched.push(elem);
                        }
                    }
                    return matched;
                }

                function layout(container, options, items) {
                    var rowWidth = 0,
                        rowElems = [],
                        items = Array.prototype.slice.call(items || container.querySelectorAll(options.itemSelector)),
                        itemsSize = items.length,
                        singleImagePerRow = !!window.matchMedia && !window.matchMedia('(min-width:' + options.minWidth + 'px)').matches;

                    // read
                    var containerStyle =dojoStyle.getComputedStyle(container);
                    var containerWidth = Math.floor(dojoWindow.getBox().w) - parseFloat(containerStyle.getPropertyValue('padding-left')) - parseFloat(containerStyle.getPropertyValue('padding-right'));
                   
                    console.log("contains的宽度Wie"+containerWidth)
                    var itemAttrs = [];
                    var theImage, w, h;
                    for (var i = 0; i < itemsSize; ++i) {
                        theImage = items[i].getElementsByTagName('img')[0];
                        if (!theImage) {
                            items.splice(i, 1);
                            --i;
                            --itemsSize;
                            continue;
                        }
                        // get width and height via attribute or js value

                        if (!(w = parseInt(dojoAttr.get(theImage, 'width')))) {
                            dojoAttr.set(theImage, 'width', w = theImage.offsetWidth)
                            // theImage.setAttribute('width', w = theImage.offsetWidth);
                        }
                        if (!(h = parseInt(dojoAttr.get(theImage, 'height')))) {
                            dojoAttr.set(theImage, 'height', h = theImage.offsetHeight)
                            // theImage.setAttribute('height', h = theImage.offsetHeight);
                        }

                        itemAttrs[i] = {
                            width: w,
                            height: h
                        };
                    }
                    console.log("item的个数:"+itemsSize)

                    // write
                    for (var index = 0; index < itemsSize; ++index) {
                        if (items[index].classList) {
                            // items[index].classList.remove(options.firstItemClass);
                            // items[index].classList.remove(options.lastRowClass);
                        } else {
                            // IE <10
                            items[index].className = items[index].className.replace(new RegExp('(^|\\b)' + options.firstItemClass + '|' + options.lastRowClass + '(\\b|$)', 'gi'), ' ');
                        }

                        // add element to row
                        rowWidth += itemAttrs[index].width;
                       
                        rowElems.push(items[index]);
                        console.log("rowElems个数为:"+rowElems.length)

                        // check if it is the last element
                        if (index === itemsSize - 1) {
                            for (var rowElemIndex = 0; rowElemIndex < rowElems.length; rowElemIndex++) {
                                // if first element in row
                                if (rowElemIndex == 0) {
                                    rowElems[rowElemIndex].className += ' ' + options.lastRowClass;
                                }

                                var css = {
                                    width: itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].width + 'px',
                                    height: itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].height + 'px'
                                }
                                // var css = 'width: ' + itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].width + 'px;' +
                                //     'height: ' + itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].height + 'px;';
                                dojoStyle.set(rowElems[rowElemIndex], css)
                                if (rowElemIndex < rowElems.length - 1) {
                                    // css += 'margin-right:' + options.minMargin + 'px';

                                    dojoStyle.set(rowElems[rowElemIndex], "margin-right:", options.minMargin + 'px')
                                }


                                // dojoStyle.set(rowElems[rowElemIndex],dojoJson.parse(css))
                                // rowElems[rowElemIndex].style.cssText = css;
                            }
                        }

                        // check whether width of row is too high
                        if (rowWidth + options.maxMargin * (rowElems.length - 1) > containerWidth || singleImagePerRow) {
                            var diff = rowWidth + options.maxMargin * (rowElems.length - 1) - containerWidth;
                            var nrOfElems = rowElems.length;

                            // change margin
                            var maxSave = (options.maxMargin - options.minMargin) * (nrOfElems - 1);
                            if (maxSave < diff) {
                                var rowMargin = options.minMargin;
                                diff -= (options.maxMargin - options.minMargin) * (nrOfElems - 1);
                            } else {
                                var rowMargin = options.maxMargin - diff / (nrOfElems - 1);
                                diff = 0;
                            }

                            var rowElem,
                                newHeight = null,
                                widthDiff = 0;
                            
                                console.log("个数为:"+rowElems.length)

                            for (var rowElemIndex = 0; rowElemIndex < rowElems.length; rowElemIndex++) {
                                rowElem = rowElems[rowElemIndex];

                                var rowElemWidth = itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].width;
                                var newWidth = rowElemWidth - (rowElemWidth / rowWidth) * diff;
                                newHeight = newHeight || Math.round(itemAttrs[index + parseInt(rowElemIndex) - rowElems.length + 1].height * (newWidth / rowElemWidth));

                                if (widthDiff + 1 - newWidth % 1 >= 0.5) {
                                    widthDiff -= newWidth % 1;
                                    newWidth = Math.floor(newWidth);
                                } else {
                                    widthDiff += 1 - newWidth % 1;
                                    newWidth = Math.ceil(newWidth);
                                }

                                // var css = 'width: ' + newWidth + 'px;' +
                                //     'height: ' + newHeight + 'px;';

                                var css = {
                                    width: newWidth + 'px',
                                    height: newHeight + 'px'
                                }
                                dojoStyle.set(rowElem, css)

                                if (rowElemIndex < rowElems.length - 1) {
                                    // css += 'margin-right: ' + rowMargin + 'px';
                                    dojoStyle.set(rowElem, "margin-right", rowMargin + 'px')
                                }

                                //rowElem.style.cssText = css;
                                //dojoStyle.set(rowElem,dojoJson.parse(css))

                                console.log("位置是:" + rowElemIndex)
                                if (rowElemIndex == 0 && !options.firstItemClass) {
                                    rowElem.className += ' ' + options.firstItemClass;
                                }
                            }

                            rowElems = [],
                                rowWidth = 0;
                        }
                    }
                }
            },

       
              
            //执行微流，会将微流的返回结果到这里
            resolveMFData: function (data) {
                //  dojoProp.set(this.MRGaoImage, "src", data);
                this.imageData = eval("(" + data + ")")
                $(this.gaoGrid).imagesGrid(this.imageData);
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
