//----------------------------------------------------------------------
// Flex Columns
//----------------------------------------------------------------------
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/json",
    "dojo/dnd/Moveable",
    "dojo/_base/event",
    "dojo/dnd/Mover",
    "dojo/dom-geometry",
    "mxui/lib/ColumnResizer",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/mouse",
    "dojo/on",
    "dojo/query",
    "dojo/NodeList-traverse"
], function(declare, _WidgetBase, JSON, Moveable, event, Mover, domGeom, ColumnResizer, domConstruct, domAttr, domClass, domStyle, dojoEvent, lang, dojoArray, mouse, on, query) {
    "use strict";

    return declare(null, {

        gridAttributesOrg: null,
        gridAttributesStore: null, // gridAttributes with 0 width will be removed.
        gridAttributes: null,
        selectedHeader: 0,
        selectedHeaderNode: null,
        settingLoaded: false,

        fillHandler: null,
        dataobject: null,
        columnChanges: [],
        columnMenuItems: [],

        useLocalStorage: true,
        settingsObj: null,

        // Templated variables:
        // gridExtension
        // contextMenu
        // columnMenu

        inputargs: {
            gridAttributesOrg: null,
            gridAttributesStore: null, // gridAttributes with 0 width will be removed.
            gridAttributes: null,
            selectedHeader: 0,
            selectedHeaderNode: null,
            settingLoaded: false,

            fillHandler: null,
            dataobject: null,
            columnChanges: [],
            columnMenuItems: []
        },

        checkConfigFlexColumns: function() {
            if (this.hasFlexHeader && this.gridAttributes[0].display.width.indexOf("%") === -1) {
                this.showError("You can no use the Flex Header feature in combination with 'Width unit = pixels' in a  data grid");
                this.hasFlexHeader = false;
            }

            if (this.responsiveHeaders && this.hasFlexHeader) {
                this.showError("You cannot enable both bootstrap responsive columns & Flex Header feature");
            }

            if (this.hasFlexHeader && this.gridSettingsEntity && this.settingsAttr && this.gridIdAttr && this.userEntity) {
                    // Guest users and users that are not of the correct entity type should always use local storage
                var uEntity = this.userEntity.split("/")[1];
                var meta = mx.meta.getEntity(mx.session.getUserClass());
                var superEntities = meta.getSuperEntities();
                if (mx.session.getUserClass() === uEntity || uEntity in superEntities) {
                    if (mx.session.isGuest() === false || mx.session.isGuest() === null) {
                        this.useLocalStorage = false;
                    }
                }
                if (this.useLocalStorage && !this.supportHtml5Storage()) {
                    logger.error("Your browser does not support html local storage, so no flex headers for you. pleas updgrade your browser and enjoy");
                    this.hasFlexHeader = false;
                }
            }
        },

        postCreateFlexColumns: function() {
            this.gridAttributes = this.grid._gridConfig.gridAttributes();
            this.checkConfigFlexColumns();

            if (this.responsiveHeaders || this.hasFlexHeader) {
                this.setupFlexColumns();
            }
        },

        setupFlexColumns: function() {
            // initialize all the create flexibility to change the columns in the header of the grid
            if (this.responsiveHeaders) {
                domConstruct.empty(this.grid.gridHeadNode);
                domConstruct.empty(this.grid.headTableGroupNode);
                domConstruct.empty(this.grid.bodyTableGroupNode);

                this.buildGridBody();
            } else if (this.hasFlexHeader) {
                var sortParams = this.grid._gridConfig.gridSetting("sortparams");
                var sortable = this.grid._gridConfig.gridSetting("sortable");
                for (var i = 0; i < this.gridAttributes.length; i++) {
                    // set sort order and width for future use.
                    this.gridAttributes[i].order = i;
                    if (sortable && sortParams) {
                        for (var j = 0; j < sortParams.length; j++) {
                            if (sortParams[j][0] === this.gridAttributes[i].tag) {
                                this.gridAttributes[i].sort = sortParams[j][1];
                            }
                        }
                    }
                }
                this.gridAttributesOrg = lang.clone(this.gridAttributes);
                this.gridAttributesStore = lang.clone(this.gridAttributes);
                this.loadSettings(lang.hitch(this, function() {
                    if (this.settingLoaded) {
                        this.reloadGridHeader();
                        if (sortable) {
                            this.setSortOrder();
                        }
                    }
                    this.getColumnMenu();
                    this.setHandlers();
                }));
            }
        },

        supportHtml5Storage: function() {
            // Checks if local storage is supported in the browser.
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (error) {
                return false;
            }
        },

        storeGridSetting: function() {
            // stores the setting based on the form ID and grid ID
            var storageKey = this.mxform.id + this.grid.mxid;
            var settings = JSON.stringify(this.gridAttributesStore);
            if (this.useLocalStorage) {
                localStorage.setItem(storageKey, settings);
            } else if (this.settingsObj) {
                this.settingsObj.set(this.settingsAttr, settings);
                mx.data.commit({
                    mxobj: this.settingsObj,
                    callback: function() {
                        logger.debug("Object committed");
                    },
                    error: function(error) {
                        logger.debug("Error occurred attempting to commit: ", error);
                    }
                });
            } else {
                mx.data.create({
                    entity: this.gridSettingsEntity,
                    callback: function(obj) {
                        logger.debug("Object created on server");
                        obj.set(this.userEntity.split("/")[0], mx.session.getUserId());
                        obj.set(this.gridIdAttr, storageKey);
                        obj.set(this.settingsAttr, settings);
                        mx.data.commit({
                            mxobj: obj,
                            callback: function() {
                                logger.debug("Object committed");
                            },
                            error: function(error) {
                                logger.debug("Error occurred attempting to commit: ", error);
                            }
                        });
                        this.settingsObj = obj;
                    },
                    error: function(error) {
                        logger.debug("Failed create Grid Settings: ", error);
                    }
                }, this);
            }
        },

        loadSettings: function(callback) {
            // load the setting from the local storage
            // checks stored object equal to the column before copy settings
            var storageKey = this.mxform.id + this.grid.mxid;

            if (this.useLocalStorage) {
                var storageValue = localStorage.getItem(storageKey);
                this.processSetting(storageValue);
                callback();
            } else {
                var xPath = "//" + this.gridSettingsEntity;
                xPath += "[" + this.userEntity.split("/")[0] + " = " + mx.session.getUserId() + "]";
                xPath += "[ " + this.gridIdAttr + " = '" + storageKey + "' ]";

                mx.data.get({
                    xpath: xPath,
                    callback: function(objs) {
                        logger.debug("Received " + objs.length + " MxObjects");
                        if (objs.length > 0) {
                            this.settingsObj = objs[0];
                            this.processSetting(objs[0].get(this.settingsAttr));
                        }
                        callback();
                    }
                }, this);
            }
        },

        processSetting: function(storageValue) {
            var compareAttObj = function(settingA, settingB) {
                // check if 2 attribute objects are equal
                try {
                    if (settingA.tag !== settingB.tag) { // check name
                        return false;
                    } else if ((!settingA.attrs && settingB.attrs) || (settingA.attrs && !settingB.attrs)) { // one has attrs
                        return false;
                    } else if (settingA.attrs && settingB.attrs && settingA.attrs[0] !== settingB.attrs[0]) { // check att
                        return false;
                    } else if (settingA.display.string !== settingB.display.string) { // display name
                        return false;
                    }
                    return true;
                } catch (error) {
                    logger.error(this.id + ".processSetting", error);
                    return false;
                }
            };
            if (storageValue) {
                var settings = JSON.parse(storageValue);
                if (settings) { // storage contains settings
                    var lenA = this.gridAttributes.length;
                    var lenS = settings.length;
                    for (var i = 0; i < lenA; i++) {
                        for (var j = 0; j < lenS; j++) {
                            if (compareAttObj(this.gridAttributes[i], settings[j])) { // Mix stored string with Mendix attribute Settings
                                this.gridAttributes[i] = lang.clone(settings[j]);
                                this.gridAttributesStore[i] = lang.clone(settings[j]);
                                this.settingLoaded = true;
                            }
                        }
                    }
                    if (this.settingLoaded) {
                        this.gridAttributes.sort(this.compareOrder);
                        var len = this.gridAttributes.length;
                        while (len--) { // remove columns with 0% width
                            if (this.gridAttributes[len].display.width === "0%") {
                                this.gridAttributes.splice(len, 1);
                            }
                        }
                    } else { // when no setting column is matched with current table, remove from storage
                        this.removeGridSettings();
                    }
                }
            }
        },

        getColumnMenu: function() {
            // render the bootstrap drop down menus for the header
            var $ = mxui.dom.create;

            for (var i = 0; i < this.gridAttributesOrg.length; i++) {
                var visible = false,
                    width = "";
                for (var j = 0; j < this.gridAttributes.length; j++) {
                    width = this.gridAttributes[j].display.width;
                    if (this.gridAttributes[j].tag === this.gridAttributesOrg[i].tag && width !== "0%" && width !== "0px") {
                        visible = true;
                    }
                }
                var selected = $("i", {
                    class: visible ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove",
                    tag: this.gridAttributesOrg[i].tag
                });
                var subLink = $("a", {
                    href: "#",
                    tag: this.gridAttributesOrg[i].tag,
                    visible: visible
                }, selected, " ", this.gridAttributesOrg[i].display.string);
                var listItem = $("li", {
                    role: "presentation"
                }, subLink);
                this.connect(subLink, "onclick", lang.hitch(this, this.onItemSelect, this.gridAttributesOrg[i].tag));
                this.columnMenuItems[this.gridAttributesOrg[i].tag] = subLink;
                this.columnMenu.appendChild(listItem);
            }
            this.connect(this.columnMenu, "onmouseleave", lang.hitch(this, this.updateColumnVisibility));
        },

        resetColumnMenu: function() {
            // Set the the correct state for all the columns in the menu
            for (var i = 0; i < this.gridAttributesOrg.length; i++) {
                var icon = this.columnMenuItems[this.gridAttributesOrg[i].tag].childNodes[0];
                var visible = false,
                    width = "";
                for (var j = 0; j < this.gridAttributes.length; j++) {
                    width = this.gridAttributesOrg[i].display.width;
                    if (this.gridAttributes[j].tag === this.gridAttributesOrg[i].tag && width !== "0%" && width !== "0px") {
                        visible = true;
                        break;
                    }
                }
                domAttr.set(icon, "class", visible ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove");
                domAttr.set(this.columnMenuItems[this.gridAttributesOrg[i].tag], "visible", visible);
            }
        },

        closeSubMenus: function(evt) {
            // close subMenus of main menu.
            query("*", evt.taget).removeClass("open");
        },

        columnHide: function(tag) {
            // remove from render columns
            var i = null;
            for (i = 0; i < this.gridAttributes.length; i++) {
                if (this.gridAttributes[i].tag === tag) {
                    this.gridAttributes.splice(i, 1);
                    break;
                }
            }
            // set store to 0%
            for (i = 0; i < this.gridAttributesStore.length; i++) {
                if (this.gridAttributesStore[i].tag === tag) {
                    this.gridAttributesStore[i].display.width = "0%";
                    break;
                }
            }
            this.distributeColumnWidth(this.gridAttributes);
            this.distributeColumnWidth(this.gridAttributesStore);
        },

        columnShow: function(tag) {
            // Find attribute
            var att = null;
            var i = null;
            for (var j = 0; j < this.gridAttributes.length; j++) {
                if (this.gridAttributes[j].tag === tag) {
                    att = this.gridAttributes[j];
                    break;
                }
            }
            if (!att) { // add attribute if not in collection
                for (i = 0; i < this.gridAttributesOrg.length; i++) {
                    if (this.gridAttributesOrg[i].tag === tag) {
                        att = lang.clone(this.gridAttributesOrg[i]); // keep sore copy original
                        this.gridAttributes.push(att);
                        break;
                    }
                }
            }
            // set minimum width: for columns hidden by modeler (set width to 0)
            if (att.display.width === "0%") {
                att.display.width = "10%";
            }
            // set store
            for (i = 0; i < this.gridAttributesStore.length; i++) {
                if (this.gridAttributesStore[i].tag === tag) {
                    this.gridAttributesStore[i].display.width = att.display.width;
                    break;
                }
            }
            this.gridAttributes.sort(this.compareOrder);
            this.gridAttributesStore.sort(this.compareOrder);
            this.distributeColumnWidth(this.gridAttributes);
            this.distributeColumnWidth(this.gridAttributesStore);
        },

        distributeColumnWidth: function(attrs) {
            var i = null;
            var total = 0; // count total
            for (i = 0; i < attrs.length; i++) {
                total += parseFloat(attrs[i].display.width, 10);
            }
                // redistribute the width over the 100%
            for (i = 0; i < attrs.length; i++) {
                var width = (parseFloat(attrs[i].display.width, 10) / total) * 100;
                attrs[i].display.width = (Math.round(width) === 0) ? "0%" : width.toString() + "%";
                attrs[i].order = i;
            }
        },

        updateColumnVisibility: function() {
            // update the column visibility
            if (this.columnChanges.length > 0) {
                var countVisible = 0;
                for (var key in this.columnMenuItems) {
                    if (this.columnMenuItems.hasOwnProperty(key)) {
                        var visible = domAttr.get(this.columnMenuItems[key], "visible");
                        if (visible === "true" || visible === true) {
                            countVisible++;
                        }
                    }
                }
                if (countVisible > 0) {
                    for (var i = 0; i < this.columnChanges.length; i++) {
                        var tag = this.columnChanges[i].tag;
                        if (this.columnChanges[i].visible) {
                            this.columnShow(tag);
                        } else {
                            this.columnHide(tag);
                        }
                    }
                    this.reloadFullGrid();
                    this.setHandlers();
                } else {
                    mx.ui.info("It is not possible to hide the last column");
                    this.resetColumnMenu();
                }
                this.columnChanges = [];
            }
            domClass.remove(this.columnListItem, "open");
        },

        onItemSelect: function(tag, evt) {
            // Change column menu icons and cache changes, change will be execute on leave of menu.
            var link = evt.target.nodeName === "A" ? evt.target : evt.target.parentNode;
            var visible = domAttr.get(link, "visible");
            visible = (visible === "true" || visible === true);

            domAttr.set(link, "visible", !visible);
            var icon = link.childNodes[0];
            domAttr.set(icon, "class", !visible ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove");

            var match = false;
            for (var i = 0; i < this.columnChanges.length; i++) {
                if (this.columnChanges[i].tag === tag) {
                    this.columnChanges[i].visible = !visible;
                    match = true;
                }
            }
            if (!match) {
                this.columnChanges.push({
                    tag: tag,
                    visible: !visible
                });
            }
            dojoEvent.stop(evt);
        },

        onSubMenuEnter: function(evt) {
            // open sub menu item,
            domClass.add(evt.target.parentNode, "open");
            dojoEvent.stop(evt);
        },

        setSortOrder: function() {
            // Code based in the Mendix dataGrid function: eventColumnClicked
            // set the stored sort order in the dataGrid.
            var headerNodes = this.grid.gridHeadNode.children[0].children;
            var isFirst = true;
            var i = null;
            // reset the current sort icons
            for (i in this.grid._gridColumnNodes) {
                if (this.grid._gridColumnNodes.hasOwnProperty(i)) {
                    var _c35 = this.grid._gridColumnNodes[i];
                    var icon = query("." + this.grid.cssmap.sortIcon, _c35);
                    if (icon) {
                        icon.style.display = "none";
                    }
                }
            }

            for (i = 0; i < this.gridAttributes.length; i++) {
                if (this.gridAttributes[i].sort) {
                    this.grid._dataSource.setSortOptions(this.gridAttributes[i].tag, this.gridAttributes[i].sort, !isFirst);
                    var sortNode = query("." + this.grid.cssmap.sortText, headerNodes[i])[0];
                    if (this.gridAttributes[i].sort === "asc") {
                        sortNode.innerHTML = "&#9650;";
                    } else {
                        sortNode.innerHTML = "&#9660;";
                    }
                    sortNode.parentNode.style.display = "";

                    isFirst = false;
                }
            }
            if (this.grid.constraintsFilled()) {
                this.grid._dataSource.refresh(lang.hitch(this.grid, this.grid.refreshGrid));
            }
        },

        eventColumnClicked: function(evt, node) {
            // is triggered after the Mx dataGrid eventColumnClicked
            // stores the sort into the locally
            var isAdditionalSort = evt.shiftKey;
            var sortOrder = this.grid.domData(node, "sortorder");
            var dataKey = this.grid.domData(node, "datakey");
            for (var i = 0; i < this.gridAttributes.length; i++) {
                for (var j = 0; j < this.gridAttributesStore.length; j++) {
                    if (this.gridAttributesStore[j].tag === this.gridAttributes[i].tag) {
                        if (!isAdditionalSort) {
                            this.gridAttributes[i].sort = null;
                            this.gridAttributesStore[j].sort = null;
                        }
                        if (this.gridAttributes[i].tag === dataKey) {
                            this.gridAttributes[i].sort = sortOrder;
                            this.gridAttributesStore[j].sort = sortOrder;
                        }
                    }
                }
            }
            this.storeGridSetting();
        },

        clearGridDataNodes: function() {
            // empty datagrid, nodes and data cache
            domConstruct.empty(this.grid.gridBodyNode);
            this.grid._gridRowNodes = [];
            this.grid._gridMatrix = [];
        },

        endResize: function() {
            // event triggered after the resize is done.
            // Stores the new size settings.
            var cols = this.grid._resizer.columns,
                total = 0,
                i = null,
                j = null;
            for (i = 0; i < cols.length; i++) {
                total += cols[i].width;
            }
            for (i = 0; i < cols.length; i++) {
                // TODO fix issue cols is less if it contains 0 with columns gridAttributes > cols
                var width = Math.round(cols[i].width / total * 100).toString() + "%";
                for (j = 0; j < this.gridAttributes.length; j++) {
                    if (this.gridAttributes[j].tag === cols[i].tag) {
                        this.gridAttributes[j].display.width = width;
                    }
                }
                for (j = 0; j < this.gridAttributesStore.length; j++) {
                    if (this.gridAttributesStore[j].tag === this.gridAttributes[i].tag) {
                        this.gridAttributesStore[j].display.width = Math.round(cols[i].width / total * 100).toString() + "%";
                    }
                }
            }
            this.storeGridSetting();
        },

        removeGridSettings: function() {
            // remove all settings from local storage
            var storageKey = this.mxform.id + this.grid.mxid;
            if (this.useLocalStorage) {
                localStorage.removeItem(storageKey);
            } else if (this.settingsObj) {
                mx.data.remove({
                    guid: this.settingsObj.getGuid(),
                    callback: function() {
                        logger.debug("Settings removed");
                    },
                    error: function(error) {
                        logger.debug("Error attempting to remove Grid Setting object ", error);
                    }
                });
                this.settingsObj = null;
            }
        },

        getSortParams: function() {
            // get and re-organize sort parameters from local storage.
            var sort = {};
            for (var i = 0; i < this.gridAttributes.length; i++) {
                if (this.gridAttributes[i].sort) {
                    sort[this.gridAttributes[i].tag] = [ this.gridAttributes[i].tag, this.gridAttributes[i].sort ];
                }
            }
            return sort;
        },

        _reset: function(evt) {
            // user menu click reset. restores the original settings
            this.closeContextMenu();
            // var sortParams = this.grid._gridConfig.gridSetting("sortparams");
            for (var i = 0; i < this.gridAttributesOrg.length; i++) {
                this.gridAttributes[i] = lang.clone(this.gridAttributesOrg[i]);
                this.gridAttributesStore[i] = lang.clone(this.gridAttributesOrg[i]);
            }
            var len = this.gridAttributes.length;
            while (len--) { // remove columns witn 0% width
                if (this.gridAttributes[len].display.width === "0%") {
                    this.gridAttributes.splice(len, 1);
                }
            }
            this.reloadFullGrid();
            this.setSortOrder();
            this.setHandlers();
            this.removeGridSettings();
            this.resetColumnMenu();
            dojoEvent.stop(evt);
        },

        _hideColumn: function(evt) {
            // hide a column from a grid. with is set to 0, so it is not rendered.
            // width is equally distributed over other columns.
            this.closeContextMenu();
            if (this.countVisibleCol() > 1) {
                this.columnHide(this.selectedHeader);
                    // update column menu
                var icon = this.columnMenuItems[this.selectedHeader].childNodes[0];
                domAttr.set(icon, "class", "glyphicon glyphicon-remove");
                domAttr.set(this.columnMenuItems[this.selectedHeader], "visible", false);

                var index = this.grid._gridColumnNodes.indexOf(this.selectedHeaderNode);
                if (index > -1) {
                    this.grid._gridColumnNodes.splice(index, 1);
                }

                this.reloadFullGrid();
                this.setHandlers();
            } else {
                mx.ui.info("It is not possible to hide the last column");
            }
            dojoEvent.stop(evt);
        },

        countVisibleCol: function() {
            // count the amount of visible columns.
            // to prevent hiding the last column
            var count = 0;
            var cols = this.grid.headTableGroupNode.children;
            for (var i = 0; i < cols.length; i++) {
                var display = domStyle.get(cols[i], "display");
                if (display !== "hidden" && display !== "none") {
                    count++;
                }
            }
            return count;
        },

        loadContextMenu: function() {
            // add the context menu to the document
            // Is this the best way?
            query("body").connect("oncontextmenu", lang.hitch(this, function(evt) {
                if (evt.target.parentElement === this.contextMenu) {
                    dojoEvent.stop(evt);
                }
            }));
            var headers = this.grid.gridHeadNode.children[0].children;
            for (var i = 0; i < headers.length; i++) {
                var tag = this.grid.domData(headers[i], "datakey");
                on(headers[i], "mousedown", lang.hitch(this, this.headerClick, tag, headers[i]));
            }
        },

        _enableMove: function(evt) {
            // user click context menu to enable the move of columns
            this.closeContextMenu();
            var headers = this.grid.gridHeadNode.children[0].children;
            for (var i = 0; i < headers.length; i++) {
                var horMover = declare([ Mover ], {
                    onMouseMove: function(moveEvent) {
                        var left = 0;
                        if (moveEvent.pageX - this.host.startPosX > this.host.minX) {
                            var width = domGeom.position(this.host.node).w;

                            if (moveEvent.pageX - this.host.startPosX < this.host.maxX - width) {
                                left = moveEvent.pageX - this.host.startPosX;
                            } else {
                                left = this.host.maxX - width;
                            }
                        } else {
                            left = this.host.minX;
                        }

                        this.host.onMove(this, {
                            l: left,
                            t: 0 // vertical no movement allowed
                        });
                        event.stop(moveEvent);
                    }
                });
                var dnd = new Moveable(headers[i], {
                    mover: horMover
                });
                on(dnd, "MoveStart", lang.hitch(this, this.headerMoveStart));
                on(dnd, "MoveStop", lang.hitch(this, this.headerMoveStop, i));
            }
            dojoEvent.stop(evt);
        },

        headerMoveStart: function(evt) {
            // start of header column move. store the limits of the movement.
            evt.host.startPosX = domGeom.position(evt.node).x - evt.node.offsetLeft;

            var headers = this.grid.gridHeadNode.children[0].children;
            for (var i = 0; i < headers.length; i++) {
                this.gridAttributes[i].i = i; // set original sort order
            }
            evt.host.minX = domGeom.position(evt.node.parentNode).x - domGeom.position(evt.node.parentNode).x;
            evt.host.maxX = domGeom.position(evt.node.parentNode).x + domGeom.position(evt.node.parentNode).w - domGeom.position(evt.node.parentNode).x;
            evt.host.node = evt.node;
        },

        headerMoveStop: function(index, evt) {
            // end of header column move. store setting and rebuild datagrid
            var headers = this.grid.gridHeadNode.children[0].children;
            var i = null;
            for (i = 0; i < headers.length; i++) {
                var pos = domGeom.position(headers[i]);
                this.gridAttributes[i].x = pos.x;
                this.gridAttributes[i].w = pos.w;
                if (headers[i] === evt.node) {
                    this.gridAttributes[i].moving = true;
                } else {
                    this.gridAttributes[i].moving = false;
                }
            }
            var compareXPos = function(attributeA, attributeB) {
                // Javascript array Sort function:
                // returns less than zero, sort a before b
                // return greater than zero, sort b before a
                // returns zero, leave a and be unchanged with respect to each other
                if ((attributeA.i < attributeB.i && (attributeA.moving === true)) || (attributeA.i > attributeB.i && (attributeB.moving === true))) {
                    // moved object left should compare to start position
                    if (attributeA.x < attributeB.x) {
                        return -1;
                    }
                    if (attributeA.x >= attributeB.x) {
                        return 1;
                    }
                } else { // moved object to the right should compare till the left site of the other object
                    if (attributeA.x + attributeA.w < attributeB.x + attributeB.w) {
                        return -1;
                    }
                    if (attributeA.x + attributeA.w >= attributeB.x + attributeB.w) {
                        return 1;
                    }
                }
                return 0;
            };
            this.gridAttributes.sort(compareXPos);
            for (i = 0; i < this.gridAttributesStore.length; i++) {
                this.gridAttributesStore[i].order = -1;
            }
            for (i = 0; i < this.gridAttributes.length; i++) {
                for (var j = 0; j < this.gridAttributesStore.length; j++) {
                    if (this.gridAttributesStore[j].tag === this.gridAttributes[i].tag) {
                        this.gridAttributesStore[j].order = i;
                    }
                }
            }
            this.gridAttributesStore.sort(this.compareOrder);
            this.reloadFullGrid();
            this.setHandlers();
        },

        compareOrder: function(objectA, objectB) {
            // function to compare order of the columns
            try {
                if (objectA.order < objectB.order) {
                    return -1;
                } else if (objectA.order > objectB.order) {
                    return +1;
                }
                return 0;
            } catch (error) {
                return 0;
            }
        },

        reloadFullGrid: function() {
            // rebuild grid header and body
            // this.doGridAttributes();
            this.reloadGridHeader();
            this.clearGridDataNodes();
            this.grid.fillGrid();
        },

        setHandlers: function() {
            // enable the context menu and connect with the resizer
            this.loadContextMenu();
            this.connect(this.grid, "eventColumnClicked", this.eventColumnClicked);
            this.connect(this.grid._resizer, "endResize", this.endResize);
        },

        reloadGridHeader: function() {
            // rebuild grid header
            domConstruct.empty(this.grid.gridHeadNode);
            domConstruct.empty(this.grid.headTableGroupNode);
            domConstruct.empty(this.grid.bodyTableGroupNode);

            this.buildGridBody();
            this.storeGridSetting();
        },

        doGridAttributes: function() {
            var columns = this.grid._visibleColumns;
            dojoArray.forEach(columns, function(col) {
                var path = col.tag.split("/");
                if (path.length === 2 || path.length === 4) {
                    path.shift();
                }
                col.attrs = path;
            }, this.grid);
        },

        buildGridBody: function() {
            // Copied form mendix BuildGridBody and commented out the creation of the handlers
            // this is needed otherwise the handlers will be create multiple times
            // replace this -> this.grid (except for in the forEach)
            // Added the following line to enable responsive columns viewing (disabled its bugging?):
            // line  class: _c15.display.cssClass ? _c15.display.cssClass: ""
            // for more changes see inline comments

            var _c4d = mxui.dom;
            // var self = this.grid,
            var $ = _c4d.create,
                _c6f = this.grid._gridConfig.gridAttributes(),
                _c70 = [],
                _c71 = [],
                row = $("tr", {
                    class: "mx-name-head-row"
                }),
                _c72 = $("div", {
                    class: this.grid.cssmap.headCaption
                }),
                _c73 = $("div", {
                    class: this.grid.cssmap.headWrapper
                }),
                _c74 = {},
                _c75 = this.grid._gridConfig.getPlugins().Calculations || {};
            _c4d.disableSelection(row);
            _c74 = this.getSortParams(); // Added function for this widget, getting sort param from settings
            this.grid._visibleColumns = [];
            this.grid._gridColumnNodes = [];
            // dojoArray.forEach(this.grid._gridConfig.gridSetting("sortparams"), function(_c76) {
            //    _c74[_c76[0]] = _c76;
            // });

            dojoArray.forEach(_c6f, function(_c77) {
                var _c78 = _c77.display.width,
                    _c79 = _c77.tag in _c75,
                    _c7a = _c78 !== null && (_c78 === "0px" || _c78 === "0%");
                if (_c79) {
                    _c71.push(_c7a);
                }
                if (!_c7a) {
                    this._visibleColumns.push(_c77);
                }
            }, this.grid);
            var columns = this.grid._visibleColumns;
            dojoArray.forEach(columns, function(col) { // add fix for unloaded attributes
                var path = col.tag.split("/");
                if (path.length === 2 || path.length === 4) {
                    path.shift();
                }
                col.attrs = path;
            }, this.grid);
            dojoArray.forEach(_c71, function(_c7b, i) {
                if (_c7b) {
                    this._hiddenAggregates.push(i);
                }
            }, this.grid);
            dojoArray.forEach(this.grid._visibleColumns, function(_c7c, i) {
                var _c7d = $("th");
                this.domData(_c7d, {
                    datakey: _c7c.tag,
                    index: i
                });
                this.setColumnStyle(_c7d, _c7c);
                var _c7e = $("span", {
                    class: this.cssmap.sortText
                });
                var _c7f = $("div", {
                    class: this.cssmap.sortIcon,
                    style: "display: none"
                }, _c7e);
                var _c80 = _c74[_c7c.tag];
                if (_c80) {
                    var _c81 = _c80[1];
                    this.domData(_c7d, "sortorder", _c81);
                    _c7e.innerHTML = _c81 === "asc" ? "&#9650;" : "&#9660;";
                    _c7f.style.display = "";
                }
                var _c82 = _c72.cloneNode(true);
                _c82.innerHTML = _c7c.display.string || "&nbsp;";
                var _c83 = _c73.cloneNode(true);
                _c83.appendChild(_c7f);
                _c83.appendChild(_c82);
                _c7d.appendChild(_c83);
                this.setNodeTitle(_c7d, _c82);
                var _c84 = $("col", {
                        style: "width:" + _c7c.display.width,
                        class: _c7c.display.cssClass ? _c7c.display.cssClass : ""
                    }),
                    _c85 = _c84.cloneNode(true);
                this.headTableGroupNode.appendChild(_c84);
                this.bodyTableGroupNode.appendChild(_c85);
                _c70.push([ _c84, _c85 ]);
                this._gridColumnNodes.push(_c7d);
                row.appendChild(_c7d);
            }, this.grid);
            this.grid.gridHeadNode.appendChild(row);
            /* Sort handler cannot be destroyed, so it should not set again
            if (this.grid._gridState.sortable) {
                this.grid.own(_c52(this.grid.gridHeadNode, "th:click", function(e) {
                    var key = self.domData(this.grid, "index");
                    if (_c6f[key].sortable !== false) {
                        self.eventColumnClicked(e, this.grid);
                    }
                }));
            }*/
            this.grid._resizer = new ColumnResizer({ // added AMD loading for ColumnResizer
                thNodes: _c4d.toArray(row.children),
                colNodes: _c70,
                colUnits: _c6f[0].display.width.indexOf("%") > 0 ? "%" : "px",
                rtl: !this.grid.isLeftToRight(),
                tableNode: this.grid.headTable,
                gridNode: this.grid.gridTable
            });
            if (this.grid._gridState.showemptyrows) {
                var _c86 = this.grid._gridConfig.gridSetting("rows");
                for (var i = 0; i < _c86; i++) {
                    this.grid.addNewRow();
                }
            }
            /* even handlers do not need be set again.
            this.grid.own(_c52(this.grid.gridBodyNode, "tr:click", function(e) {
                self.eventItemClicked(e, this.grid);
            }));
            this.grid.liveConnect(this.grid.gridBodyNode, "onclick", {
                td: "eventCellClicked"
            });
            this.grid.liveConnect(this.grid.gridBodyNode, "onmouseover", {
                tr: "eventRowMouseOver"
            });
            this.grid.liveConnect(this.grid.gridBodyNode, "onmouseout", {
                tr: "eventRowMouseOut"
            });
            var _c87 = function(e) {
                self.eventActionBindingHandler(this.grid, e.type);
            };
            var _c88 = this.grid._gridConfig.gridActionBindings();
            for (var _c89 in _c88) {
                this.grid.own(_c52(this.grid.gridBodyNode, "tr:" + _c89.replace(/^on/, ""), _c87));
            }
            */
        },


        headerClick: function(tag, node, evt) {
            // context menu on right button click.
            this.selectedHeader = tag;
            this.selectedHeaderNode = node;
            var compensation = 5; // TODO rename
            if (mouse.isRight(evt)) {
                // Correct x pos to prevent from overflowing on right hand side.
                domStyle.set(this.contextMenu, "display", "block");
                var x = evt.pageX - compensation,
                    menuWidth = domGeom.position(this.contextMenu).w,
                    winWidth = window.innerWidth;

                if (evt.pageX > winWidth - menuWidth) {
                    x = winWidth - menuWidth - compensation;
                }

                domStyle.set(this.contextMenu, "left", x + "px");
                domStyle.set(this.contextMenu, "top", (evt.pageY - compensation) + "px");
                this.connect(this.contextMenu, "onmouseleave", lang.hitch(this, this.closeContextMenu));

                dojoEvent.stop(evt);
            }
        },

        closeContextMenu: function() {
            // Close the context menu when mouse is leaving the menu.
            domStyle.set(this.contextMenu, "display", "none");
            domClass.remove(this.columnListItem, "open");
        }

    });
});

// @ sourceURL=widgets/DataGridExtension/widget/FlexColumns.js
