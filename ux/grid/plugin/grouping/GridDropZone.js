/**
 *  This class is handling the column header drop on the grid panel to be able to hide that column.
 * 
 *  @author: Adrian Teodorescu (ateodorescu@gmail.com)
 *  @private
 */
Ext.define('Ext.ux.grid.plugin.grouping.GridDropZone', {
    extend: 'Ext.dd.DropZone',
    colHeaderCls: Ext.baseCSSPrefix + 'column-header',
    proxyOffsets: [-4, -9],
    gridViewCls: Ext.baseCSSPrefix + 'grid-view',
    dropAllowed: Ext.baseCSSPrefix + 'grid-col-remove-icon',

    constructor: function(grid){
        this.grid = grid;
        this.ddGroup = this.getDDGroup();
        this.callParent([grid.id]);
    },

    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'header-dd-zone-' + this.grid.id;
    },

    getTargetFromEvent : function(e){
        return e.getTarget('.' + this.gridViewCls);
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            header = data.header;
        
        // check if the data.header is a grid column header
        me.valid = header instanceof Ext.grid.column.Column;

        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    onNodeOut: function() {        
    },

    onNodeDrop: function(node, dragZone, e, data) {
        // let's find the grid column and hide it
        var me = this,
            header = data.header;
        
        if(me.valid){
            header.hide();
        }
    }
});