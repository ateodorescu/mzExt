/**
 *  This plugin enables a grouping panel above the grid to allow easy grouping.
 * 
 *  @author: Adrian Teodorescu (ateodorescu@gmail.com)
 *  @version 1.0 (supports Ext JS 4.2.1)
 *
 */
Ext.define('Ext.ux.grid.plugin.GroupingPanel', {
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.ux.grid.plugin.grouping.Container',
        'Ext.ux.grid.plugin.grouping.Column',
        'Ext.ux.grid.plugin.grouping.DragZone', 
        'Ext.ux.grid.plugin.grouping.DropZone',
        'Ext.ux.grid.plugin.grouping.GridDropZone'
    ],
    alias: 'plugin.groupingpanel',

    localeProperties: {
        groupingPanelText:      '',
        showGroupingPanelText:  '',
        hideGroupingPanelText:  '',
        clearGroupText:         ''
    },
    
    groupingPanelText:      'Drag a column header here to group by that column',
    showGroupingPanelText:  'Show Group By Panel',
    hideGroupingPanelText:  'Hide Group By Panel',
    clearGroupText:         'Clear Group',
    groupingPanelIconCls:   Ext.baseCSSPrefix + 'group-by-panel-icon',
    clearGroupIconCls:      Ext.baseCSSPrefix + 'clear-icon',

    constructor: function(config){
        var me = this;
        
        if(config && config.cmp){
            // the state events listeners should be added here because "init" is called after restoring states.
            me.listenersState = config.cmp.on({
                beforestatesave:    me.onStateSave,
                beforestaterestore: me.onStateRestore,
                scope:              me,
                destroyable:        true
            });
        }
        
        me.callParent(arguments);
    },
    
    init: function(grid) {
        var me = this;

        me.callParent(arguments);
        me.grid = grid;

        me.listenersRender = me.grid.on({
            beforerender: function(){
                me.groupingCt = me.grid.addDocked(Ext.create('Ext.ux.grid.plugin.grouping.Container',{
                    panelPlugin: me
                }))[0];
            },
            afterrender: function(){
                me.dragZone = new Ext.ux.grid.plugin.grouping.DragZone(me.groupingCt);
                me.dropZone = new Ext.ux.grid.plugin.grouping.DropZone(me.groupingCt);
                me.gridDropZone = new Ext.ux.grid.plugin.grouping.GridDropZone(me.grid);
                
                if(me.disabled === true){
                    me.disable();
                }else{
                    me.enable();
                }
            },
            single:         true,
            scope:          me,
            destroyable:    true
        });
        
        // catch this event to refresh the grouping columns in case one of them changed its name
        me.listenersConfig = me.grid.on({
            configurationapplied:   me.initGroupingColumns,
            getcontextmenuitems:    me.onContextMenu,
            scope:                  me,
            destroyable:            true
            
        });

        me.grid.addEvents(
            /**
            * @event groupchange
            * @param {Ext.ux.grid.plugin.GroupingPanel} panel
            * @param {Array} groupers
            */
            'groupchange',
            
            /**
            * @event groupsort
            * @param {Ext.ux.grid.plugin.GroupingPanel} panel
            * @param {Array} groupers
            */
            'groupsort',
            
            /**
            * @event showpanel
            * @param {Ext.ux.grid.plugin.GroupingPanel} panel
            */
            'showgroupingpanel',
            
            /**
            * @event hidepanel
            * @param {Ext.ux.grid.plugin.GroupingPanel} panel
            */
            'hidegroupingpanel'
        );
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this;

        Ext.destroy(me.listenersState, me.listenersRender, me.listenersConfig, me.groupingCt, me.dragZone, me.dropZone);
        
        me.callParent(arguments);
    },
    
    enable: function() {
        var me = this;

        me.disabled = false;
        if (me.dropZone) {
            me.dropZone.enable();
        }
        if (me.dragZone) {
            me.dragZone.enable();
        }
        
        if(me.groupingCt){
            me.groupingCt.show();
            me.initGroupingColumns();
        }
    },
    
    disable: function() {
        var me = this;

        me.disabled = true;
        if (me.dropZone) {
            me.dropZone.disable();
        }
        if (me.dragZone) {
            me.dragZone.disable();
        }
        if(me.groupingCt){
            me.groupingCt.hide();
        }
    },
    
    onGroupsChanged: function(ct, groupers){
        var me = this;
        
        if(me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        
        var store = me.grid.getStore();
        
        store.suspendEvents();
        store.group(groupers);
        // there's a bug in Ext JS which doesn't allow ungrouping by specifying an empty groupers array
        if(groupers.length === 0) {
            //store.groupers.clear();
            store.clearGrouping();
        }
        store.resumeEvents();
        store.fireEvent('refresh', store);
        //store.fireEvent('groupchange');
        me.grid.fireEvent('groupchange', me, groupers);
    },
    
    onGroupSort: function(column, direction){
        var me = this,
            store = me.grid.getStore();
        
        if(me.disabled) {
            // if the plugin is disabled don't do anything
            return false;
        }
        
        store.groupers.each(function(item, index, len){
            if(item.property == column.dataIndex){
                item.setDirection(direction);
            }
        });
        
        store.suspendEvents();
        var newGroupers = Ext.clone(store.groupers.items);
        store.group(newGroupers);
        store.resumeEvents();
        store.fireEvent('refresh', store);
        //store.fireEvent('groupchange');
        me.grid.fireEvent('groupsort', me, direction);
    },
    
    /**
    * Check if the grid store has groupers and add them to the grouping panel
    */
    initGroupingColumns: function(){
        var me = this,
            groupers = me.grid.getStore().groupers,
            columns = Ext.Array.toValueMap( me.grid.headerCt.getGridColumns(), 'dataIndex'),
            columnsByDisplay = Ext.Array.toValueMap( me.grid.headerCt.getGridColumns(), 'displayField'),
            newCol;
        
        // remove all previously created columns
        me.groupingCt.removeAll();
        
        Ext.suspendLayouts();

        groupers.each(function(item, index, len){
            var col = columnsByDisplay[item.property] || columns[item.property];
            
            if(col){
                me.groupingCt.addColumn({
                    text:       col.text,
                    idColumn:   col.id,
                    dataIndex:  item.property,
                    direction:  item.direction
                }, -1);
            }
            
        });
        
        me.groupingCt.buildTreeColumns();

        Ext.resumeLayouts(true);
        
    },
    
    showHideGroupingPanel: function(){
        var me = this;
        
        if(me.disabled){
            me.enable();
        }else{
            me.disable();
        }
    },
    
    onContextMenu: function(grid, contextType, items, config){
        if(contextType != 'header') {
            return;
        }
        Ext.Array.insert(items, 0, this.getContextMenu());
    },
    
    getContextMenu: function(){
        var me = this, items = [];
        
        items.push({
            iconCls: me.groupingPanelIconCls,
            text: me.disabled ? me.showGroupingPanelText : me.hideGroupingPanelText,
            handler: function(){
                if(me.disabled){
                    me.enable();
                    me.grid.fireEvent('showgroupingpanel', me);
                }else{
                    me.disable();
                    me.grid.fireEvent('hidegroupingpanel', me);
                }
            }
        });
        
        if(me.grid.getStore().groupers.getCount() > 0){
            items.push({
                iconCls: me.clearGroupIconCls,
                text: me.clearGroupText,
                handler: function(){
                    me.grid.getStore().clearGrouping();
                    me.initGroupingColumns();
                }
            });
        }
        
        return items;
    },
    
    /**
    * Save state for [summaryTypeProperty] and [summaryFormatNumber] for each grid column and group footer position.
    * 
    * @param cmp
    * @param state
    * @param eOpts
    */
    onStateSave: function(cmp, state, eOpts){
        var me = this;

        state['showGroupingPanel'] = !me.disabled;
    },
    
    /**
    * Restore state for [summaryTypeProperty] and [summaryFormatNumber] for each grid column and group footer position.
    * 
    * @param cmp
    * @param state
    * @param eOpts
    */
    onStateRestore: function(cmp, state, eOpts){
        var me = this;

        if(state['showGroupingPanel'] === true){
            me.enable();
        }else{
            me.disable();
        }
    }
    
    
});