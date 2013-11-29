/**
 * @author Adrian Teodorescu (ateodorescu@gmail.com)
 */
Ext.define('Ext.ux.grid.feature.MultiGrouping', {
    extend: 'Ext.grid.feature.Feature',
    mixins: {
        summary: 'Ext.ux.grid.feature.MultiAbstractSummary'
    },
    requires: [
        'Ext.ux.grid.feature.MultiGroupStore',
        'Ext.ux.grid.feature.MultiAbstractSummary',
        'Ext.ux.grid.feature.TableLayout'
    ],

    alias: 'feature.multigrouping',

    eventPrefix: 'group',
    groupCls: Ext.baseCSSPrefix + 'grid-group-hd',
    firstGroupCls: Ext.baseCSSPrefix + 'grid-group-hd-first',
    eventSelector: '.' + Ext.baseCSSPrefix + 'grid-group-hd',
    
    refreshData: {},
    groupInfo: {},
    wrapsItem: true,

    /**
     * @event groupclick
     * @param {Ext.view.Table} view
     * @param {HTMLElement} node
     * @param {String} group The name of the group
     * @param {Ext.EventObject} e
     */

    /**
     * @event groupdblclick
     * @param {Ext.view.Table} view
     * @param {HTMLElement} node
     * @param {String} group The name of the group
     * @param {Ext.EventObject} e
     */

    /**
     * @event groupcontextmenu
     * @param {Ext.view.Table} view
     * @param {HTMLElement} node
     * @param {String} group The name of the group
     * @param {Ext.EventObject} e
     */

    /**
     * @event groupcollapse
     * @param {Ext.view.Table} view
     * @param {HTMLElement} node
     * @param {String} group The name of the group
     */

    /**
     * @event groupexpand
     * @param {Ext.view.Table} view
     * @param {HTMLElement} node
     * @param {String} group The name of the group
     */

    /**
     * @cfg {String/Array/Ext.Template} groupHeaderTpl
     * Define here a template to be used for each grouping level.
     * A string Template snippet, an array of strings (optionally followed by an object containing Template methods) to be used to construct a Template, or a Template instance.
     * 
     * - Example 1 (Template snippet):
     * 
     *       groupHeaderTpl: 'Group: {name}'
     *     
     * - Example 2 (Array):
     * 
     *       groupHeaderTpl: [
     *           'Group: ',
     *           '<div>{name:this.formatName}</div>',
     *           {
     *               formatName: function(name) {
     *                   return Ext.String.trim(name);
     *               }
     *           }
     *       ]
     *     
     * - Example 3 (Template Instance):
     * 
     *       groupHeaderTpl: Ext.create('Ext.XTemplate',
     *           'Group: ',
     *           '<div>{name:this.formatName}</div>',
     *           {
     *               formatName: function(name) {
     *                   return Ext.String.trim(name);
     *               }
     *           }
     *       )
     *
     * @cfg {String}           groupHeaderTpl.groupField         The field name being grouped by.
     * @cfg {String}           groupHeaderTpl.columnName         The column header associated with the field being grouped by *if there is a column for the field*, falls back to the groupField name.
     * @cfg {Mixed}            groupHeaderTpl.groupValue         The value of the {@link Ext.data.Store#groupField groupField} for the group header being rendered.
     * @cfg {String}           groupHeaderTpl.renderedGroupValue The rendered value of the {@link Ext.data.Store#groupField groupField} for the group header being rendered, as produced by the column renderer.
     * @cfg {String}           groupHeaderTpl.name               An alias for renderedGroupValue
     * @cfg {Ext.data.Model[]} groupHeaderTpl.rows               Deprecated - use children instead. An array containing the child records for the group being rendered. *Not available if the store is {@link Ext.data.Store#buffered buffered}*
     * @cfg {Ext.data.Model[]} groupHeaderTpl.children           An array containing the child records for the group being rendered. *Not available if the store is {@link Ext.data.Store#buffered buffered}*
     */
    groupHeaderTpl: '{columnName}: {name}',

    /**
     * @cfg {Number} [depthToIndent=17]
     * Number of pixels to indent per grouping level
     */
    depthToIndent: 17,

    collapsedCls: Ext.baseCSSPrefix + 'grid-group-collapsed',
    hdCollapsedCls: Ext.baseCSSPrefix + 'grid-group-hd-collapsed',
    hdNotCollapsibleCls: Ext.baseCSSPrefix + 'grid-group-hd-not-collapsible',
    collapsibleCls: Ext.baseCSSPrefix + 'grid-group-hd-collapsible',
    ctCls: Ext.baseCSSPrefix + 'group-hd-container',
    groupDirtyCls: Ext.baseCSSPrefix + 'grid-group-dirty',

    //<locale>
    
    /**
     * @cfg {String} [groupByText="Group by this field"]
     * Text displayed in the grid header menu for grouping by header.
     */
    groupByText: 'Group by this field',
    //</locale>

    //<locale>
    /**
     *  @cfg {String} [addGroupFieldText="Add to grouping"]
     *  Text displayed in the grid header menu for ungrouping the column.
    */
    addGroupFieldText: 'Add to grouping',
    //</locale>

    //<locale>
    /**
     *  @cfg {String} [ungroupFieldText="Ungroup this field"]
     *  Text displayed in the grid header menu for ungrouping the column.
    */
    ungroupFieldText: 'Ungroup this field',
    //</locale>

    //<locale>
    /**
     * @cfg {String} [showGroupsText="Show in groups"]
     * Text displayed in the grid header for enabling/disabling grouping.
     */
    showGroupsText: 'Show in groups',
    //</locale>

    /**
     * @cfg {Boolean} [hideGroupedHeader=false]
     * True to hide the header that is currently grouped.
     */
    hideGroupedHeader: false,

    /**
     * @cfg {Boolean} [startCollapsed=false]
     * True to start all groups collapsed.
     */
    startCollapsed: false,

    /**
     * @cfg {Boolean} [enableGroupingMenu=true]
     * True to enable the grouping control in the header menu.
     */
    enableGroupingMenu: true,

    /**
     * @cfg {Boolean} [enableNoGroups=true]
     * True to allow the user to turn off grouping.
     */
    enableNoGroups: true,

    /**
     * @cfg {Boolean} [collapsible=true]
     * Set to `false` to disable collapsing groups from the UI.
     *
     * This is set to `false` when the associated {@link Ext.data.Store store} is 
     * {@link Ext.data.Store#buffered buffered}.
     */
    collapsible: true,

    //<locale>
    expandTip: 'Click to expand. CTRL key collapses all others',
    //</locale>

    //<locale>
    collapseTip: 'Click to collapse. CTRL/click collapses all others',
    //</locale>

    showSummaryRow: false,
    
    /**
    * Position of the summary row. Possible values:
    *  - outside: aligns with the group header and is visible when group is collapsed
    *  - inside: aligns with the group rows and is not visible when group is collapsed
    *  - hide: hides the group footer; this is the same as showSummaryRow: false
    *  
    * @type String
    */
    summaryRowPosition: 'outside',
    
    expandFirstGroupHierarchy: true,
    
    tableTpl: {
        before: function (values) {
            // Do not process summary records
            if (values.rows.length === 1 && values.rows[0].isSummary) {
                return;
            }
            this.groupingFeature.setup(values.rows, values.view.rowValues);
        },
        after: function (values) {
            // Do not process summary records
            if (values.rows.length === 1 && values.rows[0].isSummary) {
                return;
            }
            this.groupingFeature.cleanup(values.rows, values.view.rowValues);
        },
        priority: 200
    },

    groupTpl: [
        '{%',
            'var me = this.groupingFeature;\n',
            'me.setupRowData(values.record, values.recordIndex, values);\n',
//            'debugger;\n',
            //'values.needsWrap = values.isFirstRow || (values.summaryRecords.length > 0);\n',
            'values.recordIndex += me.skippedRows;\n',
            'values.isCollapsedGroup = me.isLastGroupCollapsed(values);\n',
            'values.hasSummary = values.summaryRecords.length > 0;\n',
			'var locked = me.gridLocked;\n',
			'var grid = me.gridMaster;\n',
			'var useIndent = grid.lockable ? locked : true;\n',
        '%}',
        '<tpl if="hasGroups">',
            '<tr data-boundView="{view.id}" data-recordId="{record.internalId}" data-recordIndex="{[values.isCollapsedGroup ? -1 : values.recordIndex]}" class="{[values.itemClasses.join(" ")]} ' + Ext.baseCSSPrefix + 'grid-wrap-row">',
                '<td class="' + Ext.baseCSSPrefix + 'group-hd-container" colspan="{columns.length}">',
                    '<tpl if="isFirstRow">',
                        '{%',
                            // Group title is visible if not locking, or we are the locked side, or the locked side has no columns/
                            // Use visibility to keep row heights synced without intervention.
                            'var groupTitleTextStyle = locked ? "" : "visibility:hidden";',
                            'var myParent = parent;\n',
                        '%}',
                        '<tpl for="groupInfo">',
                            '{%',
                                'me.lastDepth = values.depth;\n',
                                'var groupTitleStyle =  useIndent ? "margin-left: " + values.depth + "px;" : "";\n',
                            '%}',
                            '<div id="{groupId}" class="{[values.itemClasses.join(" ")]} ' + Ext.baseCSSPrefix + 'grid-group-hd {parent.collapsibleCls}" tabIndex="0" style="{[groupTitleStyle]}">',
                                '<div class="' + Ext.baseCSSPrefix + 'grid-group-title" style="{[groupTitleTextStyle]}">',
                                    '{[values.groupHeaderTpl.apply(values, myParent) || "&#160;"]}',
                                '</div>',
                            '</div>',
                        '</tpl>',
                    '</tpl>',

                    // Only output the child rows if  this is *not* a collapsed group
                    '<tpl if="!isCollapsedGroup">',
                        '{%',
                            'var cssClass = Ext.baseCSSPrefix + values.view.id + "-table " + Ext.baseCSSPrefix + "grid-table ";\n',
                            'if(values.hasGroups === true) {\n',
                                'cssClass += Ext.baseCSSPrefix + "grid-summary-wrap ";\n',
                                'var myIndent = locked ? me.lastDepth + me.depthToIndent : 0;\n',
                            '}else{\n',
                                'var myIndent = 0;\n',
                            '}\n',
                        '%}',
                        '<table class="{[cssClass]}" border="0" cellspacing="0" cellpadding="0" style="margin-left:{[myIndent]}px;">',
                            '{[me.renderColumnSizer(out, myIndent+1)]}',
                            // Only output the first row if this is *not* a collapsed group
                                '{%',
                                    'values.itemClasses.length = 0;',
                                    'this.nextTpl.applyOut(values, out, parent);',
                                '%}',
                        '</table>',
                    '</tpl>',

                '</td>',
            '</tr>',

            '<tpl if="hasSummary">',
                '{%',
                    //'debugger;\n',
                    'var lastDepth = me.summaryRowPosition == "inside" ? me.lastDepth + me.depthToIndent : me.lastDepth;\n',
					'lastDepth = !locked ? 0 : lastDepth;\n',
                    'values.showMySummary = (me.summaryRowPosition == "inside" && !values.isCollapsedGroup) || me.summaryRowPosition == "outside";\n',
                '%}',
                '<tpl for="summaryRecords">',
                    '{%',
                        'var cssClass = Ext.baseCSSPrefix + parent.view.id + "-table-summary " + Ext.baseCSSPrefix + "grid-summary " + Ext.baseCSSPrefix + "grid-table ";\n',
                        'if(xindex < xcount) { cssClass += Ext.baseCSSPrefix + "grid-summary-item "; }\n',
                        'if(xindex > 1) { parent.showMySummary = true; } \n',
                    '%}',
                    '<tpl if="parent.showMySummary">',
                        '<tr data-boundView="{parent.view.id}" data-recordId="{parent.record.internalId}" data-recordIndex="-1" class="{[parent.itemClasses.join(" ")]}">',
                            '<td>',
                                '<table class="{[cssClass]}" border="0" cellspacing="0" cellpadding="0" style="margin-left:{[lastDepth]}px; width:100%;">',
                                    '{[me.renderColumnSizer(out, lastDepth+1)]}',
                                    '{%me.outputSummaryRecord(values, parent, out);%}',
                                '</table>',
                            '</td>',
                        '</tr>',
                    '</tpl>',
                    '{%',
                        'if(lastDepth > 0) { lastDepth -= me.depthToIndent; }\n',
                    '%}',
                '</tpl>',
            '</tpl>',

            '{%',
                'if (values.isCollapsedGroup) {',
                    'me.skippedRows += values.record.children.length - 1;',
                '}',
            '%}',
        '<tpl else>',
            '{%this.nextTpl.applyOut(values, out, parent);%}',
        '</tpl>',
        {
            priority: 200,

            syncRowHeights: function (firstRow, secondRow) {
                firstRow = Ext.fly(firstRow, 'syncDest');
                secondRow = Ext.fly(secondRow, 'sycSrc');
                var owner = this.owner,
                    firstHd = firstRow.down(owner.eventSelector, true),
                    secondHd,
                    firstSummaryRow = firstRow.down(owner.summaryRowSelector, true),
                    secondSummaryRow,
                    firstHeight, secondHeight;

                // Sync the heights of header elements in each row if they need it.
                if (firstHd && (secondHd = secondRow.down(owner.eventSelector, true))) {
                    firstHd.style.height = secondHd.style.height = '';
                    if ((firstHeight = firstHd.offsetHeight) > (secondHeight = secondHd.offsetHeight)) {
                        Ext.fly(secondHd).setHeight(firstHeight);
                    }
                    else if (secondHeight > firstHeight) {
                        Ext.fly(firstHd).setHeight(secondHeight);
                    }
                }

                // Sync the heights of summary row in each row if they need it.
                if (firstSummaryRow && (secondSummaryRow = secondRow.down(owner.summaryRowSelector, true))) {
                    firstSummaryRow.style.height = secondSummaryRow.style.height = '';
                    if ((firstHeight = firstSummaryRow.offsetHeight) > (secondHeight = secondSummaryRow.offsetHeight)) {
                        Ext.fly(secondSummaryRow).setHeight(firstHeight);
                    }
                    else if (secondHeight > firstHeight) {
                        Ext.fly(firstSummaryRow).setHeight(secondHeight);
                    }
                }
            },

            syncContent: function (destRow, sourceRow) {
                destRow = Ext.fly(destRow, 'syncDest');
                sourceRow = Ext.fly(sourceRow, 'sycSrc');
                var owner = this.owner,
                    destHd = destRow.select(owner.eventSelector),
                    sourceHd = sourceRow.select(owner.eventSelector),
                    destSummaryRow = destRow.select(owner.summaryRowSelector),
                    sourceSummaryRow = sourceRow.select(owner.summaryRowSelector);

                // Sync the content of header element.
                if (destHd && sourceHd && destHd.getCount() <= sourceHd.getCount()) {
                    destHd.each(function (el, c, index) {
                        el.syncContent(sourceHd.item(index));
                    });
                }

                // Sync the content of summary row elements. There may be more summary elements for multiple level grouping
                if (destSummaryRow && sourceSummaryRow && destSummaryRow.getCount() <= sourceSummaryRow.getCount()) {
                    destSummaryRow.each(function (el, c, index) {
                        el.syncContent(sourceSummaryRow.item(index));
                    });
                }
            }
        }
    ],

    constructor: function () {
        this.groupCache = {};
        this.callParent(arguments);
    },

    init: function (grid) {
        var me = this,
            view = me.view,
            store = me.grid.getStore();

        me.mixins.summary.init.call(me);

        me.callParent(arguments);
        
        if(store.remoteFilter === true || store.remoteSort === true || store.remoteGroup === true){
            Ext.warn('Store is not properly configured!');
            store.pageSize = 1000000;
            store.remoteFilter = store.remoteSort = store.remoteGroup = false;
        }
        
        view.groupingFeature = me;
        
        view.headerCt.on({
            columnhide: me.onColumnHideShow,
            columnshow: me.onColumnHideShow,
            columnmove: me.onColumnMove,
            scope: me
        });
        
        // Add a table level processor
        view.addTableTpl(me.tableTpl).groupingFeature = me;

        // Add a row level processor
        view.addRowTpl(Ext.XTemplate.getTpl(me, 'groupTpl')).groupingFeature = me;

        view.preserveScrollOnRefresh = true;

        // Sparse store - we can never collapse groups
        if (view.store.buffered) {
            me.collapsible = false;
        }
            // If it's a local store we can build a grouped store for use as the view's dataSource
        else {
            me.dataSource = view.dataSource = new Ext.ux.grid.feature.MultiGroupStore(me, view.store);
        }

        me.grid.on({
            beforereconfigure: me.onBeforeReconfigure,
            reconfigure: me.onReconfigure,
            scope: me
        });
        
        // we have to create an interceptor for view.onDataRefresh to cancel the refresh event for the view
        // if ExtJS will change this in the future, this approach will not work.
        view.onDataRefresh = Ext.Function.createInterceptor(view.onDataRefresh, function(store){
            // we actually stop the execution of this function.
            if(store != me.dataSource && this.firstRefreshDone === true){
                return false;
            }
        });
        
        view.on({
            afterrender: me.afterViewRender,
            scope: me,
            single: true
        });
        
        me.grid.getSelectionModel().on({
            selectionchange: me.onSelectionChange,
            scope: me
        })

        // recalculate summary when columns are locked/unlocked
        view.headerCt.on({
            add: me.onChangeColumns,
            remove: me.onChangeColumns,
            scope: me
        });
        
    },
    
    vetoEvent: function (record, row, rowIndex, e) {
        // Do not veto mouseover/mouseout
        if (e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave' && e.getTarget(this.eventSelector)) {
            return false;
        }
    },

    enable: function () {
        var me = this,
            view = me.view,
            store = view.store,
            groupToggleMenuItem;

        me.lastGroupers = me.getGroupers();

        if (me.lastGroupIndex) {
            me.block();
            store.group(me.lastGroupIndex);
            me.unblock();
        }
        me.callParent();
        groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
        if (groupToggleMenuItem) {
            groupToggleMenuItem.setChecked(true, true);
        }
        me.refreshIf();
    },

    disable: function () {
        var me = this,
            view = me.view,
            store = view.store,
            groupToggleMenuItem,
            lastGroupers;

        lastGroupers = store.groupers;
        if (lastGroupers) {
            me.lastGroupIndex = store.groupers.getRange();
            me.block();
            store.clearGrouping();
            me.unblock();
        }

        me.callParent();
        groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
        if (groupToggleMenuItem) {
            groupToggleMenuItem.setChecked(false, true);
        }
        me.refreshIf();
    },

    refreshIf: function () {
        var ownerCt = this.grid.ownerCt,
            view = this.view;

        if (!view.store.remoteGroup && !this.blockRefresh) {

            // We are one side of a lockable grid, so refresh the locking view
            if (ownerCt && ownerCt.lockable) {
                ownerCt.view.refresh();
            } else {
                view.refresh();
            }
        }
    },
    
    renderColumnSizer: function(out, indent) {
        var columns = this.view.getGridColumns(),
            len = columns.length, i,
            column, width, margin = '';
        
		var locked = !this.view.lockingPartner || (this.view.ownerCt === this.view.ownerCt.ownerLockable.lockedGrid) || (this.view.lockingPartner.headerCt.getVisibleGridColumns().length === 0);
        for (i = 0; i < len; i++) {
            column = columns[i];
            width = column.hidden ? 0 : (column.lastBox ? column.lastBox.width : Ext.grid.header.Container.prototype.defaultWidth);
            if(i === 0 && indent > 0 && locked){
                margin = ' groupingleftmargin="' + indent +'" ';
                width -= indent;
            }
            out.push('<colgroup><col class="', Ext.baseCSSPrefix, 'grid-cell-', columns[i].getItemId(), '"' + margin + ' style="width:' + width + 'px"></colgroup>');
        }
    },

    getColumnsSettings: function(columns){
        var me = this, 
            columnsSettings = {};
            
        Ext.Array.each(columns, function(col, index, all){
            col.groupHeaderTpl = col.groupHeaderTpl || me.groupHeaderTpl;
            columnsSettings[col.displayField || col.dataIndex] = col;
        });
        
        return columnsSettings;
    },

    // Attach events to view
    afterViewRender: function () {
        var me = this,
            view = me.view;

        view.on({
            scope: me,
            groupclick: me.onGroupClick,
            groupcontextmenu: me.onGroupContextMenu
        });

        if (me.enableGroupingMenu) {
            me.injectGroupingMenu();
        }

        me.pruneGroupedHeaders();

        me.lastGroupers = me.getGroupers();
        me.block();
        me.onGroupChange();
        me.unblock();
    },
    
    onGroupContextMenu: function(){
        // a group context menu might be usefull here.
        //debugger;
    },

    injectGroupingMenu: function () {
        var me = this,
            headerCt = me.view.headerCt;

        headerCt.showMenuBy = me.showMenuBy;
        headerCt.getMenuItems = me.getMenuItems();
    },

    onChangeColumns: function () {
        var me = this,
            data = me.refreshData;

        if (me.showSummaryRow) {
            Ext.Object.each(me.groupCache, function (key, groupInfo, obj) {
                // remove the group summaries to recalculate them
                delete (groupInfo.aggregate);
            });
            // recalculate the summary data
            data.summaryData = me.generateSummaryData();
        }
    },

    onColumnHideShow: function (headerOwnerCt, header) {
        var view = this.view,
            headerCt = view.headerCt,
            menu = headerCt.getMenu(),
            groupToggleMenuItem = menu.down('#groupMenuItem'),
            colCount = headerCt.getGridColumns().length,
            items,
            len,
            i;

        // "Group by this field" must be disabled if there's only one column left visible.
        if (groupToggleMenuItem) {
            if (headerCt.getVisibleGridColumns().length > 1) {
                groupToggleMenuItem.enable();
            } else {
                groupToggleMenuItem.disable();
            }
        }

        // header containing TDs have to span all columns, hiddens are just zero width
        if (view.rendered) {
            items = view.el.query('.' + this.ctCls);
            for (i = 0, len = items.length; i < len; ++i) {
                items[i].colSpan = colCount;
            }
        }
    },

    // Update first and last records in groups when column moves
    // Because of the RowWrap template, this will update the groups' headers and footers
    onColumnMove: function () {
        var me = this,
            store = me.view.store;

        if (store.isGrouped()) {
            /* ATE 24.07.2013 - I don't think that this step is necessary right now. Just do a refresh.
            groups = Ext.clone(me.groupCache);
            Ext.Object.each(groups, function (key, obj, myself) {
                firstRec = obj.records[0];
                lastRec = obj.records[obj.records.length - 1];
                store.fireEvent('update', store, firstRec, 'edit');
                if (lastRec !== firstRec) {
                    store.fireEvent('update', store, lastRec, 'edit');
                }
            });*/
            store.fireEvent('refresh', store);
        }
    },

    showMenuBy: function (t, header) {
        var menu = this.getMenu(),
            groupMenuItem = menu.down('#groupMenuItem'),
            groupMenuMeth = header.groupable === false || this.view.headerCt.getVisibleGridColumns().length < 2 ? 'disable' : 'enable',
            groupToggleMenuItem = menu.down('#groupToggleMenuItem'),
            addGroupMenuItem = menu.down('#addGroupMenuItem'),
            removeGroupMenuItem = menu.down('#removeGroupMenuItem'),
            isGrouped = this.view.store.isGrouped(),
            groupers = this.view.store.groupers;

        groupMenuItem[groupMenuMeth]();
        if (groupToggleMenuItem) {
            groupToggleMenuItem.setChecked(isGrouped, true);
            groupToggleMenuItem[isGrouped ? 'enable' : 'disable']();
        }
        
        groupMenuMeth = (header.groupable === false || this.view.headerCt.getVisibleGridColumns().length < 2 || groupers.getByKey(header.dataIndex) ) ? 'disable' : 'enable';
        addGroupMenuItem[groupMenuMeth]();

        groupMenuMeth = (header.groupable === false || !groupers.getByKey(header.dataIndex)) ? 'disable' : 'enable';
        removeGroupMenuItem[groupMenuMeth]();

        Ext.grid.header.Container.prototype.showMenuBy.apply(this, arguments);
    },

    getMenuItems: function () {
        var me = this,
            groupByText = me.groupByText,
            disabled = me.disabled || me.getGroupers().getCount() === 0,
            showGroupsText = me.showGroupsText,
            enableNoGroups = me.enableNoGroups,
            getMenuItems = me.view.headerCt.getMenuItems;

        // runs in the scope of headerCt
        return function () {

            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this);
            o.push('-', {
                iconCls: Ext.baseCSSPrefix + 'group-by-icon',
                itemId: 'groupMenuItem',
                text: groupByText,
                handler: me.onGroupMenuItemClick,
                scope: me
            });
            o.push({
                iconCls: Ext.baseCSSPrefix + 'group-by-icon',
                itemId: 'addGroupMenuItem',
                text: me.addGroupFieldText,
                handler: me.onAddGroupMenuItemClick,
                scope: me
            });
            o.push({
                iconCls: Ext.baseCSSPrefix + 'group-by-icon',
                itemId: 'removeGroupMenuItem',
                text: me.ungroupFieldText,
                handler: me.onRemoveGroupMenuItemClick,
                scope: me
            });
            if (enableNoGroups) {
                o.push({
                    itemId: 'groupToggleMenuItem',
                    text: showGroupsText,
                    checked: !disabled,
                    checkHandler: me.onGroupToggleMenuItemClick,
                    scope: me
                });
            }
            return o;
        };
    },

    /**
     * Add clicked header to grouping
     * @private
     */
    onAddGroupMenuItemClick: function (menuItem, e) {
        var me = this,
            menu = menuItem.parentMenu,
            hdr = menu.activeHeader,
            view = me.view,
            store = view.store,
            groupers = me.getGroupers().getRange();

        delete me.lastGroupIndex;
        groupers.push(hdr.dataIndex);
        me.getGroupers().clear();
        me.block();
        me.enable();
        store.group(groupers);
        me.pruneGroupedHeaders();
        me.unblock();
        me.refreshIf();
    },

    /**
     * Add clicked header to grouping
     * @private
     */
    onRemoveGroupMenuItemClick: function (menuItem, e) {
        var me = this,
            menu = menuItem.parentMenu,
            hdr = menu.activeHeader,
            view = me.view,
            store = view.store,
            groupers = me.getGroupers();

        delete me.lastGroupIndex;
        groupers.removeAtKey(hdr.dataIndex);
        me.block();
        me.enable();
        store.group(groupers.getRange());
        me.pruneGroupedHeaders();
        me.unblock();
        me.refreshIf();
    },
    

    /**
     * Group by the header the user has clicked on.
     * @private
     */
    onGroupMenuItemClick: function (menuItem, e) {
        var me = this,
            menu = menuItem.parentMenu,
            hdr = menu.activeHeader,
            view = me.view,
            store = view.store,
            groupers = me.getGroupers();

        delete me.lastGroupIndex;
        groupers.clear();
        me.block();
        me.enable();
        store.group(hdr.dataIndex);
        me.pruneGroupedHeaders();
        me.unblock();
        me.refreshIf();
    },

    block: function () {
        this.blockRefresh = this.view.blockRefresh = true;
    },

    unblock: function () {
        this.blockRefresh = this.view.blockRefresh = false;
    },

    /**
     * Turn on and off grouping via the menu
     * @private
     */
    onGroupToggleMenuItemClick: function (menuItem, checked) {
        this[checked ? 'enable' : 'disable']();
    },

    /**
     * Prunes the grouped header from the header container
     * @private
     */
    pruneGroupedHeaders: function () {
        var me = this,
            headers = me.getGroupedHeaders(),
            pHeaders = [];

        //Ext.suspendLayouts();
        if (me.prunedHeaders) {
            me.prunedHeaders = Ext.Array.from(me.prunedHeaders);
            pHeaders = Ext.Array.difference(me.prunedHeaders, headers);
            Ext.Array.each(pHeaders, function (item, index, allItems) {
                if(item.hidden === true){
                    item.show();
                }
            });
        }

        if (me.hideGroupedHeader && headers.length > 0) {
            me.prunedHeaders = headers;
            Ext.Array.each(headers, function (item, index, allItems) {
                if(item.hideable && item.hidden === false){
                    item.hide();
                }
            });
        }

        //Ext.resumeLayouts(true);
    },

    getHeaderNode: function (groupId) {
        return Ext.get(groupId);
    },

    getGroup: function (groupId) {
        var cache = this.groupCache,
            item = cache[groupId];

        if (!item) {
            item = {
                isCollapsed: false
            };
        }
        return item;
    },

    /**
     * Returns `true` if the named group is expanded.
     * @param {String} groupId The group id
     * @return {Boolean} `true` if the group defined by that value is expanded.
     */
    isExpanded: function (groupId) {
        return !this.getGroup(groupId).isCollapsed;
    },

    /**
     * Expand a group
     * @param {String} groupId The group id
     * @param {Boolean} focus Pass `true` to focus the group after expand.
     */
    expand: function (groupId, focus) {
        this.doCollapseExpand(false, groupId, focus);
    },

    /**
     * Expand all groups
     */
    expandAll: function () {
        var me = this,
            view = me.view,
            groupCache = me.groupCache,
            groupName,
            lockingPartner = me.lockingPartner;

        // Clear all collapsed flags
        for (groupName in groupCache) {
            if (groupCache.hasOwnProperty(groupName)) {
                groupCache[groupName].isCollapsed = false;
            }
        }
        Ext.suspendLayouts();
        view.suspendEvent('beforerefresh', 'refresh');
        me.dataSource.onRefresh();
        view.resumeEvent('beforerefresh', 'refresh');

        if (lockingPartner) {
            lockingPartner.expandAll();
        }
        Ext.resumeLayouts(true);

        // Fire event for all groups post expand
        for (groupName in groupCache) {
            if (groupCache.hasOwnProperty(groupName)) {
                view.fireEvent('groupexpand', view, Ext.get(this.getHeaderNode(groupName)), groupName);
            }
        }
    },

    /**
     * Collapse a group
     * @param {String} groupId The group id
     * @param {Boolean} focus Pass `true` to focus the group after expand.
     */
    collapse: function (groupId, focus) {
        this.doCollapseExpand(true, groupId, focus);
    },

    /**
     * Collapse all groups
     */
    collapseAll: function () {
        var me = this,
            view = me.view,
            groupCache = me.groupCache,
            groupName,
            lockingPartner = me.lockingPartner;

        // Set all collapsed flags
        for (groupName in groupCache) {
            if (groupCache.hasOwnProperty(groupName)) {
                groupCache[groupName].isCollapsed = true;
            }
        }
        Ext.suspendLayouts();
        view.suspendEvent('beforerefresh', 'refresh');
        me.dataSource.onRefresh();
        view.resumeEvent('beforerefresh', 'refresh');

        if (lockingPartner) {
            lockingPartner.collapseAll();
        }
        Ext.resumeLayouts(true);

        // Fire event for all groups post collapse
        for (groupName in groupCache) {
            if (groupCache.hasOwnProperty(groupName)) {
                view.fireEvent('groupcollapse', view, Ext.get(this.getHeaderNode(groupName)), groupName);
            }
        }

    },

    doCollapseExpand: function (collapsed, groupId, focus) {
        var me = this,
            view = me.view,
            lockingPartner = me.lockingPartner,
            header,
            groupName, doStuff = false;

        if(!me.groupCache[groupId]){
            me.dataSource.refreshDataSource({
                groupKeysToExpand:  groupId
            });
            doStuff = true;
        }else if (me.groupCache[groupId].isCollapsed != collapsed) {
            me.groupCache[groupId].isCollapsed = collapsed;
            me.dataSource.refreshDataSource({
                groupKeysToExpand: []
            });
            doStuff = true;
        }
        
        if(doStuff){
            header = Ext.get(me.getHeaderNode(groupId));
            if(me.groupCache[groupId]){
                groupName = me.groupCache[groupId].name;
                view.fireEvent(collapsed ? 'groupcollapse' : 'groupexpand', view, header, groupName);
            }

            // If we are one side of a locking view, the other side has to stay in sync
            if (lockingPartner) {
                lockingPartner.doCollapseExpand(collapsed, groupId, focus);
            }

            /*
            // this is actually doing an updateLayout on all visible components
            Ext.resumeLayouts(true); 
            Ext.resumeLayouts();
            // update only this grid and the locking partner if available
            view.updateLayout(); 
            if(view.lockingPartner){
                view.lockingPartner.updateLayout();
            }*/
            
            if (focus) {
                header.up(view.getItemSelector()).scrollIntoView(view.el, null, true);
            }
        }
    },

    onGroupChange: function () {
        var me = this,
            groupers = me.getGroupers(),
            menuItem,
            visibleGridColumns,
            groupingByLastVisibleColumn;

        if (me.hideGroupedHeader) {
            if (me.lastGroupers) {
                me.lastGroupers.each(function (item, index, len) {
                    menuItem = me.getMenuItem(item.property);
                    if (menuItem) {
                        menuItem.setChecked(true);
                    }
                });
            }
            if (groupers) {
                groupers.each(function (item, index, len) {
                    visibleGridColumns = me.view.headerCt.getVisibleGridColumns();

                    // See if we are being asked to group by the sole remaining visible column.
                    // If so, then do not hide that column.
                    groupingByLastVisibleColumn = ((visibleGridColumns.length === 1) && (visibleGridColumns[0].dataIndex == item.property));
                    menuItem = me.getMenuItem(item.property);
                    if (menuItem && !groupingByLastVisibleColumn) {
                        menuItem.setChecked(false);
                    }
                });
            }
        }
        me.refreshIf();
        me.lastGroupers = groupers;
    },

    /**
     * Gets the related menu item for a dataIndex
     * @private
     * @return {Ext.grid.header.Container} The header
     */
    getMenuItem: function (dataIndex) {
        var view = this.view,
            header = view.headerCt.down('gridcolumn[dataIndex=' + dataIndex + ']'),
            menu = view.headerCt.getMenu();

        return header ? menu.down('menuitem[headerId=' + header.id + ']') : null;
    },

    onGroupKey: function (keyCode, event) {
        var me = this,
            groupName = me.getGroupId(event.target);
        
        if (groupName) {
            me.onGroupClick(me.view, event.target, groupName, event);
        }
    },

    /**
     * Toggle between expanded/collapsed state when clicking on
     * the group.
     * @private
     */
    onGroupClick: function (view, rowElement, groupId, e) {
        var me = this,
            groupCache = me.groupCache,
            groupIsCollapsed = !me.isExpanded(groupId),
            g;

        if (me.collapsible) {

            // CTRL means collapse all others
            if (e.ctrlKey) {
                Ext.suspendLayouts();
                for (g in groupCache) {
                    if (g === groupId) {
                        if (groupIsCollapsed) {
                            me.expand(groupId);
                        }
                    } else {
                        me.doCollapseExpand(true, g, false);
                    }
                }
                Ext.resumeLayouts(true);
                return;
            }

            if (groupIsCollapsed) {
                me.expand(groupId);
            } else {
                me.collapse(groupId);
            }
        }
    },

    /**
    *   @private
    *   Check if the last group is collapsed
    */
    isLastGroupCollapsed: function (values) {
        if (!values.groupInfo) return false;
        var groups = values.groupInfo;
        if (groups.length === 0) return false;
        return groups[groups.length - 1].isCollapsedGroup;
    },

    setupRowData: function (record, idx, rowValues) {
        var me = this,
            data = me.refreshData,
            groupInfo = me.groupInfo,
            header = data.header,
            store = me.view.dataSource,
            groupers, grouper, groupName, prev, next, i, groupersCount, rows, groupId,
            itemClasses, isCollapsedGroup = false, isLastCollapsed = false, isLastRow = false, summaryRecords,
            colSettings,
			groupField, groupHeaderTpl,
            parentGrid = me.gridMaster,
            columns;
            
        rowValues.isCollapsedGroup = false;
        rowValues.summaryRecords = [];
        groupInfo = [];
        summaryRecords = new Ext.util.MixedCollection();
        
        colSettings = me.columnsSettings;

        if (data.doGrouping) {
            groupers = me.view.store.groupers;
            groupersCount = groupers.getCount();

            // See if the current record is the first in the group
            rowValues.isFirstRow = idx === 0;
            if (!rowValues.isFirstRow) {
                prev = store.getAt(idx - 1);
                // If the previous row is of a different group, then we're at the first for a new group
                if (prev) {
                    for (i = 0; i < groupersCount; i++) {
                        grouper = groupers.getAt(i);
                        // Must use Model's comparison because Date objects are never equal
                        rowValues.isFirstRow = rowValues.isFirstRow || !prev.isEqual(grouper.getGroupString(prev), grouper.getGroupString(record));
                    }
                }
            }

            // See if the current record is the last in the group
            rowValues.isLastRow = idx == store.getTotalCount() - 1;
            if (!rowValues.isLastRow) {
                next = store.getAt(idx + 1);
                if (next) {
                    var lastRowIndex = groupersCount;
                    i = 0;
                    // let's find out which groups have changed
                    while (lastRowIndex == groupersCount && i < groupersCount) {
                        grouper = groupers.getAt(i);
                        // Must use Model's comparison because Date objects are never equal
                        isLastRow = !next.isEqual(grouper.getGroupString(next), grouper.getGroupString(record));
                        rowValues.isLastRow = rowValues.isLastRow || isLastRow;
                        if (isLastRow && me.showSummaryRow) {
                            lastRowIndex = i;
                        }
                        i++;
                    }
                    // add the summary records
                    for (i = groupersCount - 1; i >= lastRowIndex ; i--) {
                        groupId = me.getGroupKey(record, groupers.getRange(0, i));
                        if (data.summaryData[groupId]) {
                            //rowValues.summaryRecords.push(data.summaryData[groupId]);
                            summaryRecords.add(groupId, data.summaryData[groupId]);
                        }
                    }
                }
            } else {
                // add summary records to all remaining groups
                for (i = groupersCount - 1; i >= 0 ; i--) {
                    grouper = groupers.getAt(i);
                    if (me.showSummaryRow) {
                        groupId = me.getGroupKey(record, groupers.getRange(0, i));
                        if (data.summaryData[groupId]) {
                            //rowValues.summaryRecords.push(data.summaryData[groupId]);
                            summaryRecords.add(groupId, data.summaryData[groupId]);
                        }
                    }
                }
            }

            rowValues.summaryRecords = summaryRecords.getRange();


            if (rowValues.isFirstRow) {
                // create the group info list
                prev = store.getAt(idx - 1);
                // If the previous row is of a different group, then we're at the first for a new group
                isCollapsedGroup = false;
                for (i = 0; i < groupersCount; i++) {
                    grouper = groupers.getAt(i);
                    groupField = grouper.property;
                    groupName = grouper.getGroupString(record);
                    groupId = me.getGroupKey(record, groupers.getRange(0, i));
                    groupHeaderTpl = colSettings[groupField]['groupHeaderTpl'];
                    if (groupHeaderTpl && !groupHeaderTpl.isTemplate) {
                        groupHeaderTpl = Ext.ClassManager.dynInstantiate('Ext.XTemplate', groupHeaderTpl);
                    } else {
                        // load the default template
                        if (!groupHeaderTpl) {
                            groupHeaderTpl = Ext.XTemplate.getTpl(me, 'groupHeaderTpl');
                        }
                    }

                    itemClasses = [];
                    if(i === 0){
                        itemClasses.push(me.firstGroupCls);
                    }
                    if (!me.isExpanded(groupId)) {
                        itemClasses.push(me.hdCollapsedCls);
                        isCollapsedGroup = true;
                    }
                    // We only get passed a GroupStore if the store is not buffered
                    if (store.buffered) {
                        rows = [];
                    } else {
                        rows = me.groupCache[groupId];
                        rows = rows ? rows.records : [];
                    }
                    if (!isLastCollapsed) {
                        var sameGroupsBefore = true;
                        for(var j = 0; j <= i; j++){
                            var g = groupers.getAt(j);
                            sameGroupsBefore = sameGroupsBefore && (prev ? prev.isEqual(g.getGroupString(prev), g.getGroupString(record)) : false);
                        }
                        if (!sameGroupsBefore) {
                            groupInfo.push({
                                groupField: groupField,
                                //name: groupName,
                                // use the column renderer for the group name
                                name: colSettings[groupField].renderer ? colSettings[groupField].renderer(record.get(groupField), null, record) : record.get(groupField),
                                groupValue: record.get(groupField),
                                columnName: colSettings[groupField]['text'],
                                groupId: groupId,
                                rows: rows,
                                children: rows,
                                depth: me.depthToIndent * i,
                                isCollapsedGroup: isCollapsedGroup,
                                itemClasses: itemClasses,
                                groupHeaderTpl: groupHeaderTpl
                            });
                        }
                    }
                    isLastCollapsed = isCollapsedGroup;
                }


                rowValues.collapsibleCls = me.collapsible ? me.collapsibleCls : me.hdNotCollapsibleCls;
                rowValues.groupInfo = groupInfo;
                rowValues.isCollapsedGroup = isCollapsedGroup;
            }

        }
    },

    setup: function (rows, rowValues) {
        var me = this,
            data = me.refreshData;

        me.skippedRows = 0;
        if (rowValues.view.bufferedRenderer) {
            rowValues.view.bufferedRenderer.variableRowHeight = true;
        }
        //data.groupField = me.getGroupers();
        //data.header = me.getGroupedHeader(data.groupField);
        data.doGrouping = !me.disabled && me.view.store.groupers && me.view.store.isGrouped();

        if (me.showSummaryRow) {
            // calculate the summary data
            data.summaryData = me.generateSummaryData();
        }
        
        // let's cache this here before the template is rendered
        rowValues.hasGroups = rowValues.view.store.groupers ? rowValues.view.store.groupers.getCount() > 0 : false;
        me.gridLocked = !rowValues.view.lockingPartner || (rowValues.view.ownerCt === rowValues.view.ownerCt.ownerLockable.lockedGrid) || (rowValues.view.lockingPartner.headerCt.getVisibleGridColumns().length === 0);
        me.gridMaster = rowValues.view.ownerCt.up("gridpanel") || rowValues.view.ownerCt;
        me.columnsSettings = me.getColumnsSettings(me.gridMaster.headerCt.getGridColumns());
        me.lastDepth = 0;
    },

    cleanup: function (rows, rowValues) {
        var data = this.refreshData;

        rowValues.groupInfo = rowValues.groupHeaderTpl = rowValues.isFirstRow = null;
        data.groupField = data.header = null;
    },


    /**
    *   @private
    *   @returns The group id is taken from the html element
    */
    getGroupId: function (element) {
        var me = this,
            view = me.view,
            eventSelector = me.eventSelector,
            parts,
            targetEl,
            row;

        // See if element is, or is within a group header. If so, we can extract its name
        targetEl = Ext.fly(element).findParent(eventSelector);

        if (!targetEl) {
            // Otherwise, navigate up to the row and look down to see if we can find it    
            row = Ext.fly(element).findParent(view.itemSelector);
            if (row) {
                targetEl = row.down(eventSelector, true);
            }
        }

        if (targetEl) {
            return Ext.htmlDecode(targetEl.id);
        }
    },

    ///**
    // * Returns the group data object for the group to which the passed record belongs **if the Store is grouped**.
    // *
    // * @param {Ext.data.Model} record The record for which to return group information.
    // * @param {Ext.util.Grouper} grouper The grouper object used to identify the record inside all groups.
    // * @return {Object} A single group data block as returned from {@link Ext.data.Store#getGroups Store.getGroups}. Returns
    // * `undefined` if the Store is not grouped.
    // *
    // */
    //getRecordGroup: function (record, grouper) {
    //    if (!grouper) {
    //        grouper = this.view.store.groupers.last();
    //    }
    //    if (grouper) {
    //        return this.groupCache[this.getGroupKey(record, [grouper])];
    //    }
    //},



    /**
    *   Generate a unique key for a group.
    *
    *   @private
    *   @param {Ext.data.Model} record The record for which to return group key.
    *   @param {Array} groupers The groupers used for generating the key. If no groupers are specified then the store ones are used.
    */
    getGroupKey: function (record, groupers) {
        if (!groupers) {
            groupers = this.view.store.groupers.getRange();
        }
        var groupersCount = groupers.length,
            i, keys = [];

        for (i = 0; i < groupersCount; i++) {
            keys.push(groupers[i].getGroupString(record));
        }
        return this.formatKey.apply(this, keys);
    },

    formatKey: function () {
        var i, s = '', a = '';
        for (i = 0; i < arguments.length; i++) {
            if (i > 0 && s) s += '#_#';
            a = Ext.isEmpty(arguments[i]) ? '' : arguments[i];
            s += a.toString().replace(/[^\w#]/gi, '_');
        }
        return s;
    },

    getGroupers: function () {
        return this.view.store.groupers;
    },

    getGroupedHeaders: function() {
        var me = this,
            headerCt = me.view.headerCt,
            partner = me.lockingPartner,
            selector, headers = [], groupers = me.getGroupers();

        groupers.each(function (item, index, len) {
            var groupField, header, selector;
            
            groupField = item.property;
            selector = '[dataIndex=' + groupField + ']';
            header = headerCt.down(selector);
            // The header may exist in the locking partner, so check there as well
            if (!header && partner) {
                header = partner.view.headerCt.down(selector);
            }
            
            // if we still don't find the header let's try with the displayField. it might be a picker column
            if(!header){
                selector = '[displayField=' + groupField + ']';
                header = headerCt.down(selector);
                // The header may exist in the locking partner, so check there as well
                if (!header && partner) {
                    header = partner.view.headerCt.down(selector);
                }
            }
            
            if(header){
                headers.push(header);
            }
        });
        return headers;
    },

    getFireEventArgs: function (type, view, targetEl, e) {
        return [type, view, targetEl, this.getGroupId(targetEl), e];
    },

    destroy: function () {
        var me = this,
            dataSource = me.dataSource;

        delete me.view;
        delete me.prunedHeader;
        delete me.grid;
        delete me.groupingFeature;
        Ext.destroy(me.groupingPanel);
        me.callParent();
        me.groupCache = null;
        if (dataSource) {
            dataSource.bindStore(null);
        }
    },

    onBeforeReconfigure: function (grid, store, columns, oldStore, oldColumns) {
        var me = this;
        
        me.dataSource.beforeReconfigure(store, oldStore);
    },
    
    onReconfigure: function (grid, store, columns, oldStore, oldColumns) {
        var me = this;

        if (store !== oldStore) {
            // Grouping involves injecting a dataSource in early
            if (store.buffered !== oldStore.buffered) {
                Ext.Error.raise('Cannot reconfigure grouping switching between buffered and non-buffered stores');
            }
            
            me.dataSource.reconfigure(store, true);
        }
    },
    
    // if the selected records are in collapsed groups then expand the tree structures
    onSelectionChange: function(sm, selected, eOpts){
        // implement a method in the MultiGroupStore to check if the record is in a collapsed group
        var me = this, key;
        
        if(selected.length == 1){
            if(sm instanceof Ext.selection.RowModel){
                key = me.getGroupKey(selected[0]);
            }else if(sm instanceof Ext.ux.grid.selection.MultiCellModel){
                key = me.getGroupKey(selected[0]);
            }
            if(!Ext.isEmpty(key)){
                me.doCollapseExpand(false, key, false);
            }
        }
    }
    

});