var axisRecordFields = [
    {name: 'dataIndex', type: 'string'},
    {name: 'direction', type: 'string'},
    {name: 'header',    type: 'string'},
    {name: 'width',     type: 'int'}
];
Ext.define('pivot.AxisRecord', {
    fields: axisRecordFields
}); 
Ext.define('pivot.AxisGrid', {
    extend: 'Ext.grid.Panel',
    border: false,
    style: 'border-top-width: 1px',
    flex: 1,
    selModel: {
        selType: 'cellmodel'
    },

    /**
     * @cfg {Array} fields The array of field names to control. Required
     */
    
    /**
     * @cfg {Boolean} hasWidthField True to add a column for 'width' (e.g. for left axes)
     */
    hasWidthField: false,
    
    initComponent: function() {
        this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        this.plugins = [this.cellEditing];
        
        this.store = new Ext.data.JsonStore({
            data  : this.dimensionData || [], 
            fields: axisRecordFields
        });

        var columns = [{
            header   : 'Dimension',
            dataIndex: 'dataIndex',
            editor   : this.buildDimensionEditor(),
            flex        : 1       
        }, {
            header   : 'Sort',
            dataIndex: 'direction',
            editor   : this.buildDirectionEditor(),
            width    : 50
        }, {
            header   : 'Header',
            dataIndex: 'header',
            editor   : {
                xtype:  'textfield'
            },
            width    : 50
        }];

        if (this.hasWidthField) {
            columns.push({
                header   : 'Width',
                dataIndex: 'width',
                editor   : new Ext.form.NumberField(),
                width    : 50
            });
        }

        columns.push({
            xtype: 'actioncolumn',
            width: 30,
            icon   : '../shared/icons/fam/delete.gif',
            scope  : this,
            handler: this.onRemoveDimension,
            tooltip: 'Delete this dimension',
            editable: false
        });

        Ext.applyIf(this, {
            bbar: [{
                text   : 'Add Dimension',
                icon   : '../shared/icons/fam/add.gif',
                scope  : this,
                handler: this.onAddDimension
            }],
            columns: columns
        });
        this.callParent(arguments);
    },

    /**
     * @private
     * Adds a new row to the store and auto-focusses its first editor
     */
    onAddDimension: function(grid, rowIndex, colIndex) {
        this.store.add(new pivot.AxisRecord({
            dataIndex    : this.fields[0],
            direction: "ASC",
            width    : 80
        }));

        this.cellEditing.startEditByPosition({row: this.store.count() - 1, column: 0});
    },

    /**
     * @private
     */
    onRemoveDimension: function(grid, rowIndex, colIndex) {
        var store  = grid.store,
            record = grid.store.getAt(rowIndex);
        
        store.remove(record);
    },

    /**
     * @private
     * @return {Ext.form.ComboBox} The editor
     */
    buildDimensionEditor: function() {
        return new Ext.form.ComboBox({
            mode : 'local',
            store: this.getFieldStore(),
            editable      : false,
            valueField    : 'name',
            displayField  : 'name',
            triggerAction : 'all',
            forceSelection: true
        });
    },

    /**
     * @private
     * @return {Ext.data.Store} The store
     */
    getFieldStore: function() {
        /**
         * @property fieldStore
         * @type Ext.data.JsonStore
         * The store bound to the combo for selecting the field
         */
        if (this.fieldStore == undefined) {
            var fields = [],
                length = this.fields.length,
                i;

            for (i = 0; i < length; i++) {
                fields[i] = [this.fields[i]];
            }

            this.fieldStore = new Ext.data.ArrayStore({
                fields: ['name'],
                data  : fields
            });
        }
        return this.fieldStore; 
    },

    /**
     * @private
     * Creates a local combo with options for ASC and DESC
     * @return {Ext.form.ComboBox} The editor
     */
    buildDirectionEditor: function() {
        return new Ext.form.ComboBox({
            name          : 'name',
            mode          : 'local',
            editable      : false,
            forceSelection: true,
            triggerAction : 'all',
            displayField  : 'name',
            valueField    : 'name',
            value         : 'ASC',
            store: new Ext.data.ArrayStore({
                fields : ['name'],
                data   : [['ASC'], ['DESC']]
            })
        });
    }
});