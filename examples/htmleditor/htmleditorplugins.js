Ext.onReady(function() {
    Ext.tip.QuickTipManager.init();
    
     var top = Ext.create('Ext.form.Panel', {
        frame:true,
        title:          'HtmlEditor plugins',
        bodyStyle:      'padding:5px 5px 0',
        width:          '100%',
        fieldDefaults: {
            labelAlign:     'top',
            msgTarget:      'side'
        },

        items: [{
            xtype:          'htmleditor',
            fieldLabel:     'Text editor',
            height:         300,
            plugins: [
                Ext.create('Ext.ux.form.plugin.HtmlEditor',{
                    enableAll:  true
                })
            ],
            anchor:         '100%'
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    top.render(document.body);
    
});
