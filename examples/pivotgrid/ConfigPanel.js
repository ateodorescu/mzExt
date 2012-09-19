Ext.define('pivot.ConfigPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pivotconfig',
    title: 'Configure',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    /**
     * @cfg {Ext.data.Record} record The Ext.data.Record to extract the field list from. Required
     */

    initComponent: function() {
        var fields = this.getRecordFields();

        this.form = new Ext.Container({
            layout: 'column',
            style: 'padding: 7px',
            items: [{
                xtype:          'checkbox',
                fieldLabel:     'Enable summary',
                ref:            '/chkSummary',
                name:           'chkSummary',
                checked:        this.enableSummary
            }, {
                xtype:          'checkbox',
                fieldLabel:     'Enable grouping',
                ref:            '/chkGrouping',
                name:            'chkGrouping',
                checked:        this.enableGrouping,
                margin:         '0 5 5'
            }]
        });

        this.aggregateGrid = new pivot.AggGrid({
            title : 'Aggregates',
            fields: fields,
            dimensionData: this.aggregateDimensions || [],
            hasWidthField: true
        });
            
        /**
         * @property leftAxisGrid
         * @type pivot.AxisGrid
         */
        this.leftAxisGrid = new pivot.AxisGrid({
            title : 'Left Axis',
            fields: fields,
            dimensionData: this.leftAxisDimensions || [],
            hasWidthField: true
        });

        /**
         * @property topAxisGrid
         * @type pivot.AxisGrid
         */
        this.topAxisGrid = new pivot.AxisGrid({
            title : 'Top Axis',
            fields: fields,
            dimensionData: this.topAxisDimensions || []
        });

        Ext.applyIf(this, {
            items: [
                this.form,
                this.aggregateGrid,
                this.topAxisGrid,
                this.leftAxisGrid
            ],
            fbar: {
                buttonAlign: 'left',
                items: [{
                    icon   : '../shared/icons/fam/accept.png',
                    text   : 'Update',
                    scope  : this,
                    handler: this.updateGrid
                }]
            }
        });
        
        this.callParent(arguments);
    },

    /**
     * @private
     * Retrieves the configured axis dimensions for the top and left grids and updates the PivotGrid accordingly
     */
    updateGrid: function() {
        var leftDimensions = [],
            topDimensions  = [],
            aggregateDimensions = [],
            leftGridItems  = this.leftAxisGrid.store.data.items,
            topGridItems   = this.topAxisGrid.store.data.items,
            aggregateGrid = this.aggregateGrid.store.data.items,
            i;

        for (i = 0; i < leftGridItems.length; i++) {
            leftDimensions.push(leftGridItems[i].data);
        }

        for (i = 0; i < topGridItems.length; i++) {
            topDimensions.push(topGridItems[i].data);
        }

        for (i = 0; i < aggregateGrid.length; i++) {
            aggregateDimensions.push(aggregateGrid[i].data);
        }

        this.fireEvent('update', {
            leftDimensions          : leftDimensions,
            topDimensions           : topDimensions,
            aggregateDimensions     : aggregateDimensions,
            enableGrouping          : this.down('[name=chkGrouping]').getValue(),
            enableSummary           : this.down('[name=chkSummary]').getValue()
        });
    },

    /**
     * Extracts the field names from the configured record
     * @return {Array} The set of Record fields
     */
    getRecordFields: function() {
        return Ext.pluck(this.record.prototype.fields.items, 'name');
    }

});

