/**
* @class Ext.ux.form.field.UploadFileField
* @extends Ext.form.field.File
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.3
* 
* [1]: http://www.mzsolutions.eu/extjs/license.txt
* 
* 
* Provides a "delete" button to the file upload component. If the "delete" button is pressed the component behaves like a 
* textfield sending the value "delete" to the server. This is useful when you want to delete the uploaded file.
* The component works with Extjs > 4.0.7, 4.1.1 and 4.2.x
* 
* ### Changelog:
* 
* #### 03.10.2012 - v1.2
* 
* - if the field is readOnly then disable "delete" and "browse" buttons
* - raise the "deletefile" event when the "delete" button is pressed
* 
* #### 23.04.2013 - v1.3
* 
* - fixed the layout issue to make it work with Ext JS 4.2.x
* 
#Example usage:#

{@img Ext.ux.form.field.UploadFileField.png Ext.ux.form.field.UploadFileField component}

    var form = Ext.create('Ext.form.Panel', {
        title:          'File upload',
        bodyPadding:    10,
        width:          300,
        renderTo: Ext.getBody(),        
        items: [{
            xtype:      'uploadfilefield',
            name:       'name',
            anchor:     '100%',
            fieldLabel: 'File'
        }],
        
        buttons: [{
            text: 'Save'
        }]
    }); 

*/
Ext.define('Ext.ux.form.field.UploadFileField', {
    extend: 'Ext.form.field.File',
    
    requires: [
        'Ext.ux.layout.component.field.UploadFileField'
    ],
    
    alias: 'widget.uploadfilefield',
    alternateClassName: 'Ext.form.UploadFileField',

    componentLayout: 'uploadfilefield',
    
    /**
    * @cfg {String} buttonDeleteText Set the delete button caption.
    */
    buttonDeleteText:  'Delete',
    /**
    * @cfg {String} buttonDeleteMargin Set the margin of the delete button.
    */
    buttonDeleteMargin: 3,
    readOnly: false,
    
    initComponent : function(){
        var me = this;
        me.readOnlyTemp = me.readOnly || false;
        
        me.readOnly = true; // temporarily make it readOnly so that the parent function work properly
        me.addEvents(
            /**
             * @event deletefile
             * Fires when the delete file button is pressed
             * @param {Ext.ux.form.field.UploadFileField} this
             * @param {boolean} pressed
             */
            'deletefile'
        );
        me.callParent(arguments);
    },

    onRender: function() {
        var me = this;

        me.callParent(arguments);
        me.createDeleteButton();
        me.onReadOnly(me.readOnlyTemp);
    },
    
    setReadOnly: function(readOnly){
        var me = this;
        
        me.onReadOnly(readOnly);
        me.readOnly = readOnly;
    },
    
    onReadOnly: function(readOnly){
        var me = this;

        if(me.button){
            me.button.setDisabled(readOnly);
        }
        if(me['buttonEl-btnEl']){
            me['buttonEl-btnEl'].dom.disabled = readOnly;
        }
        if(me.fileInputEl){
            me.fileInputEl.dom.disabled = readOnly;
        }
        if(me.buttonDelete){
            me.buttonDelete.setDisabled(readOnly);
        }
    },
    
    onDisable: function(){
        var me = this;
        
        me.callParent(arguments);
        if(me.buttonDelete){
            me.buttonDelete.setDisabled(true);
        }
    },
    
    onEnable: function(){
        var me = this;

        me.callParent(arguments);
        if(me.buttonDelete){
            me.buttonDelete.setDisabled(false);
        }
    },
    
    createDeleteButton: function(){
        var me = this;
        var parent = me.browseButtonWrap ? me.browseButtonWrap : me.bodyEl;
        me.buttonDelete = Ext.widget('button', Ext.apply({
            ui:             me.ui,
            renderTo:       parent,
            text:           me.buttonDeleteText,
            cls:            Ext.baseCSSPrefix + 'form-file-btn',
            preventDefault: true,
            pressed:        false,
            style:          'margin-left:' + me.buttonDeleteMargin + 'px',
            toggleHandler:  me.handleDelete,
            enableToggle:   true,
            scope:          me
        }, me.buttonDeleteConfig));

    },
    
    handleDelete: function(btn, pressed, e){
        var me = this;
        
        if(pressed){
            me.originalValue = me.getValue();
            me.setValue('delete');
            me.fireEvent('deletefile', me, true);
        }else{
            me.setValue(me.originalValue);
            me.fireEvent('deletefile', me, false);
        }
    },
    
    isFileUpload: function(){
        return this.getValue() != 'delete';
    },
    
    setValue: function(value){
        var me = this,
            buttonDelete = me.buttonDelete;

        if(buttonDelete && value != 'delete'){
            buttonDelete.toggle(false, true);
        }

        me.setRawValue(me.valueToRaw(value));
        return me.mixins.field.setValue.call(me, value);
    },
    
    onDestroy: function(){
        Ext.destroyMembers(this, 'buttonDelete');
        this.callParent();
    }
});

