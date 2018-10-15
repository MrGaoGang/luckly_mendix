require({cache:{
'url:PieChart/widget/template/PieChart.html':"<div data-dojo-attach-point=\"MRGaoChart\">\r\n    <div data-dojo-attach-point=\"MRGaoPieChart\"></div>\r\n</div>\r\n\r\n"}});
/*global logger*/
/*
    PieChart
    ========================

    @file      : PieChart.js
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
define("PieChart/widget/PieChart", [
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
  "PieChart/lib/echarts",
  "PieChart/lib/jquery-1.11.2",
  "dojo/text!PieChart/widget/template/PieChart.html"
], function(
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
  echarts,
  _jQuery,
  widgetTemplate
) {
  "use strict";

  var $ = _jQuery.noConflict(true);

  // Declare widget's prototype.
  return declare("PieChart.widget.PieChart", [_WidgetBase, _TemplatedMixin], {
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

    myChart: null,
    option: null,

    // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
    constructor: function() {
      logger.debug(this.id + ".constructor");
      this._handles = [];
    },

    // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
    postCreate: function() {
      logger.debug(this.id + ".postCreate");

      if (this.readOnly || this.get("disabled") || this.readonly) {
        this._readOnly = true;
      }

      this._updateRendering();
      this._setupEvents();
    },

    /**
     * 从data中获取到配置的信息
     */
    initConfig: function(config) {
      var legend = [];
      var selected = {};
      $.each(config, function(index, item) {
        legend.push(item.name);
        selected[item.name] = true;
      });

      return {
        legendData: legend,
        selectedData: selected
      };
    },
    // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
    update: function(obj, callback) {
      logger.debug(this.id + ".update");

      this._contextObj = obj;
      this._resetSubscriptions();
      this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation

      if (!this._contextObj) {
        return;
      }
      //设置图表的宽和高
      $(this.MRGaoPieChart).css("width", this.chartWidth);
      $(this.MRGaoPieChart).css("height", this.chartHeight);
      //初始化echarts
      this.myChart = echarts.init(this.MRGaoPieChart);
      //初始化config中图表的配置信息，并将JSon字符串转换成对象
      this.option = eval("(" + this.chartConfig + ")");

	  
      //优先读取配置中的字符串
      if (this.dataString && this.dataString != "") {
        //其中option.series为配置信息中的对象，也就是需要显示图表的数据
        this.option.series[0].data = eval("(" + this.dataString + ")");
        //legend的值和默认显示多少项都是可以通过图表数据计算得到
       var legendConfig = this.initConfig(eval("(" + this.dataString + ")"));
        this.option.legend.data = legendConfig.legendData;
        this.option.legend.selected = legendConfig.selectedData;
        //一定要记得设置option
        this.myChart.setOption(this.option);
        this.commanCallback();
      } else if (this.dataMF && this.dataMF != "") {
        this._execMf(
          this.dataMF,
          this._contextObj.getGuid(),
          lang.hitch(this.resolveCallback)
        );
      }
    },
    //从微流中获取到的数据
    resolveCallback: function(results) {
      if (!results || results == "") {
        return;
      }
      //得到图表配置的数据
      var legendConfig = this.initConfig(dojoJson.parse(results));

      //分别给图表设置数据和配置数据
      this.option.series[0].data = dojoJson.parse(results);
      this.option.legend.data = legendConfig.legendData;
      this.option.legend.selected = legendConfig.selectedData;
      this.myChart.setOption(this.option);
      this.commanCallback();
    },
    //点击图表的回调微流事件
    commanCallback: function() {
      //点击图表的回调微流事件
      var mf = this.callBackMF;
      //点击饼状图的每一项
      this.myChart.on("click", function(param) {
        if (mf) {
          mx.data.create({
            //此处的实体为点击后需要将参数数据存储在哪个实体中
            entity: "Widgets.StringParam",
            callback: function(obj) {
              //设置实体中params字段的值为，对应点击项的数据
              obj.set("param", dojoJson.stringify(param.data));
              mx.data.action({
                params: {
                  applyto: "selection",
                  actionname: mf,
                  guids: [obj.getGuid()]
                },
                callback: function() {},
                error: function(error) {}
              });
            }
          });
        }
      });
    },
    // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
    enable: function() {
      logger.debug(this.id + ".enable");
    },

    // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
    disable: function() {
      logger.debug(this.id + ".disable");
    },

    // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
    resize: function(box) {
      logger.debug(this.id + ".resize");
    },

    // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
    uninitialize: function() {
      logger.debug(this.id + ".uninitialize");
      // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
    },

    // We want to stop events on a mobile device
    _stopBubblingEventOnMobile: function(e) {
      logger.debug(this.id + "._stopBubblingEventOnMobile");
      if (typeof document.ontouchstart !== "undefined") {
        dojoEvent.stop(e);
      }
    },

    // Attach events to HTML dom elements
    _setupEvents: function() {
      logger.debug(this.id + "._setupEvents");
      this.connect(
        this.colorSelectNode,
        "change",
        function(e) {
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
        function(e) {
          // Only on mobile stop event bubbling!
          this._stopBubblingEventOnMobile(e);

          // If a microflow has been set execute the microflow on a click.
          if (this.mfToExecute !== "") {
            this._execMf(this.mfToExecute, this._contextObj.getGuid());
          }
        }
      );
    },

    _execMf: function(mf, guid, cb) {
      logger.debug(this.id + "._execMf");
      if (mf && guid) {
        mx.ui.action(
          mf,
          {
            params: {
              applyto: "selection",
              guids: [guid]
            },
            callback: lang.hitch(this, function(objs) {
              if (cb && typeof cb === "function") {
                cb(objs);
              }
            }),
            error: function(error) {
              console.debug(error.description);
            }
          },
          this
        );
      }
    },

    // Rerender the interface.
    _updateRendering: function(callback) {
      logger.debug(this.id + "._updateRendering");
   

      // Important to clear all validations!
      this._clearValidations();

      // The callback, coming from update, needs to be executed, to let the page know it finished rendering
      this._executeCallback(callback, "_updateRendering");
    },

    // Handle validations.
    _handleValidation: function(validations) {
      logger.debug(this.id + "._handleValidation");
      this._clearValidations();

    
    },

    // Clear validations.
    _clearValidations: function() {
      logger.debug(this.id + "._clearValidations");
      dojoConstruct.destroy(this._alertDiv);
      this._alertDiv = null;
    },

    // Show an error message.
    _showError: function(message) {
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
    _addValidation: function(message) {
      logger.debug(this.id + "._addValidation");
      this._showError(message);
    },

    // Reset subscriptions.
    _resetSubscriptions: function() {
      logger.debug(this.id + "._resetSubscriptions");
      // Release handles on previous object, if any.
      this.unsubscribeAll();

      // When a mendix object exists create subscribtions.
      if (this._contextObj) {
        this.subscribe({
          guid: this._contextObj.getGuid(),
          callback: lang.hitch(this, function(guid) {
            this._updateRendering();
          })
        });

        this.subscribe({
          guid: this._contextObj.getGuid(),
          attr: this.backgroundColor,
          callback: lang.hitch(this, function(guid, attr, attrValue) {
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

    _executeCallback: function(cb, from) {
      logger.debug(
        this.id + "._executeCallback" + (from ? " from " + from : "")
      );
      if (cb && typeof cb === "function") {
        cb();
      }
    }
  });
});

require(["PieChart/widget/PieChart"]);
