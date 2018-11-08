/*global logger*/
/*
    ExportToExcel
    ========================

    @file      : ExportToExcel.js
    @version   : 1.0.0
    @author    : mr.gao
    @date      : 2018-11-4
    @copyright : <Your Company> 2016
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
    "ExportToExcel/lib/jquery-1.11.2",
    "ExportToExcel/lib/jszip",
    "ExportToExcel/lib/xlsx",
    "dojo/text!ExportToExcel/widget/template/ExportToExcel.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry,
    dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml,
    dojoEvent, dojoJSON, _jQuery, jszip, XLSX, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("ExportToExcel.widget.ExportToExcel", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _readOnly: false,
        workBook: null,
        jsonData:[],
        showProcess:null,
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
            //this.exportToExcel();
            //设置按钮的名字
            $("#" + this.id + " .exportBtn").html(this.buttonName);

           
             var that = this;
            // //按钮的点击事件
            $("#" + this.id + " .exportBtn").on("click", function () {
               that.showProcess=mx.ui.showProgress();
                that._execMf(that.dataListMF, that._contextObj.getGuid(), lang.hitch(that, that.getListData))
            });

        },

       

        //组件传递过来的数据
        getListData: function (data) {
            var that=this;
            this.jsonData=[];
            /* 创建worksheet */
             /* 新建空workbook，然后加入worksheet */
             this.workBook = XLSX.utils.book_new();
           
           // console.log(dojoJSON.stringify(data));

            //获取到所有的sheet数据
            $.each(data, function (indexInArray, valueOfElement) { 
                 var attr=dojoJSON.parse(dojoJSON.stringify(valueOfElement)).attributes;
                 that.jsonData.push(dojoJSON.parse(attr.ParamValue.value));
            });

            var sheetCount=1;
            $.each(that.jsonData, function (indexInArray, valueOfElement) { 
                 if(valueOfElement.data!=undefined){
                     that.addDataToSheet(valueOfElement);
                 }else{
                    that.addDataToSheet({excelSheetName:"Sheet"+sheetCount,data:valueOfElement});
                    sheetCount++;
                 }
            });
            //数据写入
            that.writeFile();
        },

        addDataToSheet: function (data) {
           
           var ws = XLSX.utils.json_to_sheet(data.data);
            XLSX.utils.book_append_sheet(this.workBook, ws, data.excelSheetName);

                mx.ui.hideProgress(this.showProcess);
            
        },

        writeFile:function(){
            /* 生成xlsx文件 */
            XLSX.writeFile(this.workBook, this.fileName+".xlsx");
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

        },

        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
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
                }, this);
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


        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["ExportToExcel/widget/ExportToExcel"]);
