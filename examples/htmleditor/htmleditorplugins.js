Ext.onReady(function() {
    Ext.tip.QuickTipManager.init();
    
     var top = Ext.create('Ext.form.Panel', {
        bodyStyle:      'padding:5px 5px 0',
        //width:          300,
        fieldDefaults: {
            labelAlign:     'top',
            msgTarget:      'side'
        },
        layout: 'fit',

        items: [{
            xtype:      'fieldset',
            layout:     'anchor',
            items: [{
                xtype:          'htmleditor',
                fieldLabel:     'Text editor',
                //height:         300,
                plugins: [
                    Ext.create('Ext.ux.form.plugin.HtmlEditor',{
                        enableAll:              true,
                        enableMultipleToolbars: true
                    })
                ],
                anchor:         '100%'
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });
    
    var w = Ext.create('Ext.window.Window',{
        title:          'HtmlEditor plugins',
        width:  700,
        height: 400,
        layout: 'fit',
        items: [top]
    });
    w.show();
    
});
