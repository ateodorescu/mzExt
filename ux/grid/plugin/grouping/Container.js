/**
 * @private
 */
Ext.define('Ext.ux.grid.plugin.grouping.Container', {
    extend: 'Ext.container.Container',

    requires: [
        'Ext.ux.grid.plugin.grouping.Column'
    ],
    
    alias: 'widget.groupingcontainer',
    
    baseCls:    Ext.baseCSSPrefix + 'grouping-panel-ct',
    dock:       'top',
    
    weight:     50, // the column header container has a weight of 100 so we want to dock it before that.
    height:     26,
    minHeight:  26,
    topPaddingChild:    15,
    layout:     'hbox',
    
    itemId:     'groupingPanel',
    childEls:   ['groupingPanel', 'innerCt', 'targetEl'],
    style:      'overflow:hidden',
    
    panelPlugin: undefined,
    
    destroy: function(){
        var me = this;
        
        delete me.panelPlugin;
        me.callParent();
    },

    afterRender: function(){
        var me = this;
        
        me.callParent();

        me.mon(me.getTargetEl(), {
            scope: me,
            contextmenu: me.handleContextMenu
        });
        
    },
    
    afterComponentLayout: function(){
        var me = this;
        
        me.callParent(arguments);
        
        me.showGroupByText();
    },
    
    handleContextMenu: function(e){
        var me = this, items = [];
        
        items = Ext.Array.from(me.panelPlugin.getContextMenu());
        
        var menu = Ext.create('Ext.menu.Menu', {
            items: items
        });
        
        menu.show();
        menu.setPosition(e.getX(), e.getY());
        e.stopEvent();
    },
    
    /**
    * Check if the specified grid column is already added to the panel
    * 
    * @param {Ext.grid.column.Column} col
    */
    isNewColumn: function(col){
        return this.items.findIndex('idColumn', col.id) < 0;
    },
    
    addColumn: function(config, pos, notify){
        var me = this, newCol;
        
        if(me.items.getCount() == 0){
            me.hideGroupByText();
        }
        
        newCol = Ext.create('Ext.ux.grid.plugin.grouping.Column', config);
        newCol.addSortCls(newCol.direction);
        
        if(pos != -1){
            me.insert(pos, newCol);
        }else{
            me.add(newCol);
        }
        me.updateColumnIndexes();

        if(notify === true){
            me.notifyGroupChange();
        }
    },
    
    getColumnPosition: function(column, position){
        var me = this, pos;
        
        if(column instanceof Ext.ux.grid.plugin.grouping.Column){
            //we have to insert before or after this column
            pos = me.items.findIndex('id', column.id);
            pos = (position === 'before') ? pos : pos + 1;
        }else{
            pos = -1;
        }
        return pos;
    },
    
    moveColumn: function(idFrom, idTo, position){
        var me = this,
            pos = me.items.findIndex('id', idFrom),
            newPos = me.items.findIndex('id', idTo);
        
        if(pos != newPos){
            if(newPos > pos){
                newPos = (position === 'before') ? Math.max(newPos - 1, 0) : newPos;                        
            }else{
                newPos = (position === 'before') ? newPos : newPos + 1;
            }
            
            me.move(pos, newPos);
            me.updateColumnIndexes();
            me.notifyGroupChange();
        }
    },
    
    updateColumnIndexes: function(){
        var me = this;
        
        me.items.each(function(item, index, all){
            item.index = index;
        });
    },
    
    notifyGroupChange: function(){
        var me = this, groupers = [];
        
        me.items.each(function(item, index, len){
            groupers.push({
                direction:  item.direction,
                property:   item.dataIndex
            });
        });
        
        me.panelPlugin.onGroupsChanged(me, groupers);
        me.buildTreeColumns();
    },
    
    /**
    * Builds a tree like structure with all columns.
    * 
    */
    buildTreeColumns: function(){
        var me = this, 
            h = me.minHeight,
            countItems = me.items.getCount();
        
        Ext.suspendLayouts();
        
        h += countItems > 0 ? (countItems - 1) * me.topPaddingChild : 0;
        me.setHeight(h);

        me.items.each(function(item, index, len){
            item.index = index;
            item.show();
        });
        
        Ext.resumeLayouts(true);
    },
    
    showGroupByText: function(){
        var me = this;
        
        if(me.items.getCount() === 0){
            me.innerCt.setHeight(me.minHeight);
            me.targetEl.setHTML('<div class="' + Ext.baseCSSPrefix + 'grouping-panel-text">' + me.panelPlugin.groupingPanelText + '</div>');
        }
    },
    
    hideGroupByText: function(){
        var me = this;
        
        me.targetEl.setHTML('');
    }
    
    
});