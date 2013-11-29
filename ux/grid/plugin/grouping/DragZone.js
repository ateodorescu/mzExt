/**
 * @private
 */
Ext.define('Ext.ux.grid.plugin.grouping.DragZone', {
    extend: 'Ext.dd.DragZone',

    groupColumnSelector:        '.' + Ext.baseCSSPrefix + 'group-column',
    groupColumnInnerSelector:   '.' + Ext.baseCSSPrefix + 'group-column-inner',
    maxProxyWidth:      120,
    dragging:           false,
    
    constructor: function(panel) {
        this.panel = panel;
        this.ddGroup =  this.getDDGroup();
        this.callParent([panel.el]);
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'header-dd-zone-' + this.panel.up('gridpanel').id;
    },
    
    getDragData: function(e) {
        if (e.getTarget(this.groupColumnInnerSelector)) {
            var header = e.getTarget(this.groupColumnSelector),
                headerCmp,
                headerCol,
                ddel;

            if (header) {
                headerCmp = Ext.getCmp(header.id);
                headerCol = Ext.getCmp(headerCmp.idColumn);
                
                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.text;
                    return {
                        ddel: ddel,
                        header: headerCol,
                        groupcol: headerCmp
                    };
                }
            }
        }
        return false;
    },

    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },

    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },
    
    onDragDrop: function() {
        if(!this.dragData.dropLocation){
            this.panel.dragging = false;
            this.callParent(arguments);
            return;
        }
        
        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        var dropCol = this.dragData.dropLocation.header, 
            dragCol = this.dragData.header,
            pos = -1;
        
        if(dropCol instanceof Ext.grid.column.Column){
            dropCol.show();
            pos = this.panel.items.findIndex('idColumn', dragCol.id);
            this.panel.remove(this.panel.items.getAt(pos));
            this.panel.notifyGroupChange();
        }

        this.panel.dragging = false;
        this.callParent(arguments);
    },

    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },

    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },
    
    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    }

});