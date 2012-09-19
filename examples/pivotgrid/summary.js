Ext.onReady(function() {
    
    var pivotGrid = Ext.create('Ext.ux.grid.mzPivotGrid', {
        title     : 'PivotGrid example',
        width     : 600,
        height    : 300,
        renderTo  : 'docbody',
        store:  new Ext.data.ArrayStore({
            proxy: {
                type:       'ajax',
                url:        'summary.json',
                reader: {
                    type:       'json',
                    root:       'rows'
                }
            },
            autoLoad:   true,
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
        }),

        enableLocking:  true,
        viewConfig: {
            trackOver:      true,
            stripeRows:     false
        },
        
        features:[{
            ftype:      'mzpivotsummary'
        }],
        
        aggregate: [{
            measure:    'value',
            header:     'Value',
            aggregator: 'sum',
            align:      'right',
            renderer:   Ext.util.Format.numberRenderer('0')
        },{
            measure:    'quantity',
            header:     'Qnt',
            aggregator: 'sum',
            align:      'right',
            renderer:   Ext.util.Format.numberRenderer('0')
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
            header:     'Year'
        },{
            dataIndex:  'city',
            header:     'City'
        }]
    });
});