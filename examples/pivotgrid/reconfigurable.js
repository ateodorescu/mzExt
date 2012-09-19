/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('pivot');
Ext.define('pivot.SaleRecord', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'person',   type: 'string'},
        {name: 'product',  type: 'string'},
        {name: 'city',     type: 'string'},
        {name: 'state',    type: 'string'},
        {name: 'month',    type: 'int'},
        {name: 'quarter',  type: 'int'},
        {name: 'year',     type: 'int'},
        {name: 'quantity', type: 'int'},
        {name: 'value',    type: 'int'}
    ]
});

Ext.onReady(function() {

    var myStore = new Ext.data.Store({
        autoLoad:   true,
        model:      'pivot.SaleRecord',
        proxy: {
            type:       'ajax',
            url:        'summary.json',
            reader: {
                type:       'json',
                root:       'rows'
            }
        }
    });
    
    var featureSummary = Ext.create('Ext.ux.grid.feature.mzPivotSummary', {
        idItem: 'fs'
    });

    var pivotGrid = Ext.create('Ext.ux.grid.mzPivotGrid', {
        store       : myStore,
        region      : 'center',
        margins     : '5 5 5 0',
        enableLocking:  true,
        viewConfig: {
            trackOver:      true,
            stripeRows:     false
        },
        features: [featureSummary],
        aggregate: [{
            measure:    'value',
            header:     'Value',
            aggregator: 'sum',
            align:      'right',
            width:      80,
            renderer:   Ext.util.Format.numberRenderer('0,000.00')
        },{
            measure:    'quantity',
            header:     'Qnt',
            aggregator: 'sum',
            align:      'right',
            width:      80,
            renderer:   Ext.util.Format.numberRenderer('0,000.00')
        }],

        leftAxisTitle:  'Some report',
        leftAxis: [{
            width:      80,
            dataIndex:  'person',
            header:     'Person'
        },{
            width:      90,
            dataIndex:  'product',
            header:     'Product'
        },{
            width:      90,
            dataIndex:  'month',
            header:     'Quarter',
            direction:  'DESC'
        }],
        
        topAxis: [{
            dataIndex:  'year',
            header:     'Year',
            direction:  'DESC'
        },{
            dataIndex:  'city',
            header:     'City'
        }]
    });

    var configPanel = new pivot.ConfigPanel({
        width : 300,
        margins: '5 5 5 5',
        region: 'west',
        record: pivot.SaleRecord,

        aggregateDimensions: pivotGrid.aggregate,
        leftAxisDimensions: pivotGrid.leftAxis,
        topAxisDimensions: pivotGrid.topAxis,
        enableGrouping: pivotGrid.enableGrouping,
        enableSummary: true,

        listeners: {
            update: function(config) {
                pivotGrid.leftAxis = config.leftDimensions;
                pivotGrid.topAxis = config.topDimensions;
                pivotGrid.aggregate = config.aggregateDimensions;
                pivotGrid.enableGrouping = config.enableGrouping;
                if(config.enableSummary){
                    featureSummary.enable();
                    if(pivotGrid.enableLocking){
                        pivotGrid.view.normalView.features[0].enable();
                        pivotGrid.view.lockedView.features[0].enable();
                    }
                }else{
                    featureSummary.disable();
                    if(pivotGrid.enableLocking){
                        pivotGrid.view.normalView.features[0].disable();
                        pivotGrid.view.lockedView.features[0].disable();
                    }
                }

                pivotGrid.refresh();
            }
        }
    });

    var viewport = new Ext.Viewport({
        layout: 'fit',
        items: {
            border: false,
            title : 'mzPivotGrid configurator',
            layout: 'border',
            items : [
                configPanel,
                pivotGrid
            ]
        }
    }); 
});
