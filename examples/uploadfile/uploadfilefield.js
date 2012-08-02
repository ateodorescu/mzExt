Ext.onReady(function() {
    Ext.tip.QuickTipManager.init();
    
    var form = Ext.create('Ext.form.Panel', {
        bodyPadding:    10,
        items: [{
            xtype:      'textfield',
            name:       'name',
            anchor:     '100%',
            fieldLabel: 'Name',
            allowBlank: true
        }, {
            xtype:      'uploadfilefield',
            name:       'f',
            fieldLabel: 'File',
            anchor:     '100%',
        }],
        
        buttons: [{
            text: 'Save',
            handler: function(){
                if(form.getForm().isValid()){
                    alert(form.getForm().getValues().f);
                }
            }
        }]
    }); 
    
    var win = Ext.create('Ext.window.Window', {
        title:      'Resize Me',
        width:      500,
        height:     400,
        minWidth:   300,
        minHeight:  200,
        layout:     'fit',
        plain:      true,
        items:      form

    });

    win.show();
    
});
