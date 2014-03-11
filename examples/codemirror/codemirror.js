Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', '../../ux');

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
        }, Ext.create('Ext.ux.form.field.CodeMirror', {
            pathModes:  'CodeMirror-3.20/mode',
            pathExtensions: 'CodeMirror-3.20/lib/util',
            name:       'f',
            allowBlank: false,
            fieldLabel: 'Code',
            anchor:     '100% -20',
            //hideLabel:  true,
            labelAlign: 'top',
            mode:       'text/x-php',
            listeners: {
                modechanged: function(editor, newMode, oldMode){
                    switch(newMode){
                        case 'text/x-php':
                            editor.setValue(Ext.get('codePhp').getValue());
                        break;
                        
                        case 'application/json':
                            editor.setValue(Ext.get('codeJson').getValue());
                        break;
                        
                        case 'text/javascript':
                            editor.setValue(Ext.get('codeJs').getValue());
                        break;
                        
                        case 'text/html':
                            editor.setValue(Ext.get('codeHtml').getValue());
                        break;
                        
                        case 'text/css':
                            editor.setValue(Ext.get('codeCss').getValue());
                        break;
                        
                        case 'text/plain':
                        break;
                    }
                }
            }
        })],
        
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
        title:          'Resize Me',
        width:          500,
        height:         400,
        minWidth:       300,
        minHeight:      200,
        layout:         'fit',
        closeAction:    'destroy',
        plain:          true,
        items:          form

    });

    win.show();
    
});
