/**
 * @private
 */
Ext.define('Ext.ux.grid.plugin.grouping.Column',{
    extend: 'Ext.Component',
    alias: 'widget.groupcolumn',
    
    childEls: [
        'groupCol', 'textCol', 'lineCol'
    ],
    
    renderTpl: 
        '<div id="{id}-groupCol" class="' + Ext.baseCSSPrefix + 'group-column-inner">' +
            '<span id="{id}-textCol" class="' + Ext.baseCSSPrefix + 'group-column-text ' + Ext.baseCSSPrefix + 'column-header-text">' + 
                '{text}' +
            '</span>' +
            '<div id="{id}-lineCol" class="' + Ext.baseCSSPrefix + 'group-column-line">&nbsp;</div>' + 
        '</div>',
        
    text:       '&#160;',
    idColumn:   '',
    dataIndex:  '',
    direction:  'ASC',

    ascSortCls:     Ext.baseCSSPrefix + 'column-header-sort-ASC',
    descSortCls:    Ext.baseCSSPrefix + 'column-header-sort-DESC',
    baseCls:        Ext.baseCSSPrefix + 'group-column',
    height:         '100%',
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.addEvents(
            /**
            * @event groupsort
            * @param {Ext.ux.grid.plugin.grouping.Column} col
            * @param String direction
            */
            'groupsort'
            
        );
        me.mon(me, 'afterrender', me.setMyPosition, me);
    },
    
    show: function(){
        var me = this;
        
        me.callParent();
        me.setMyPosition();
    },
    
    setMyPosition: function(){
        var me = this, 
            parent = me.up('groupingcontainer');
        
        if(me.rendered){
            var h = parent.minHeight;
            h += (parent.items.getCount() - 1) * parent.topPaddingChild;
            me.setHeight(h);

            if(me.index > 0){
                me.el.setStyle('padding', me.unitizeBox( (me.index * parent.topPaddingChild) + ' 0 0 0' ));
                me.lineCol.show();
            }else{
                me.el.setStyle('padding', me.unitizeBox( 0 ));
                me.lineCol.hide();
            }
        }
    },

    initRenderData: function() {
        var me = this;

        return Ext.apply(me.callParent(arguments), {
            text:   me.text
        });
    },
    
    afterRender: function(){
        var me = this;
        
        me.callParent();

        me.mon(me.getTargetEl(), {
            scope: me,
            click: me.handleGroupColClick
        });
        
        me.mon(me, 'afterlayout', me.showGroupByText, me);
    },

    handleGroupColClick: function(e, t){
        // handles grid column sorting
        var me = this, 
            direction = me.direction === 'ASC' ? 'DESC' : 'ASC';
        
        me.addSortCls(direction);
        me.ownerCt.panelPlugin.onGroupSort(me, direction);
        me.direction = direction;
    },
    
    addSortCls: function(direction){
        var me = this;
        
        if(direction === 'ASC'){
            me.addCls(me.ascSortCls);
            me.removeCls(me.descSortCls);
        }else{
            me.addCls(me.descSortCls);
            me.removeCls(me.ascSortCls);
        }

    }
    
});