/**
* @private
* @class Ext.ux.layout.component.field.UploadFileField
* @extends Ext.layout.component.field.Trigger
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* 
* Layout class for {@link Ext.ux.form.field.UploadFileField} fields. Handles sizing the image field upload.
*/
Ext.define('Ext.ux.layout.component.field.UploadFileField', {
    alias: ['layout.uploadfilefield'],
    extend: 'Ext.layout.component.field.Trigger',

    type: 'uploadfilefield',

    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner;

        if (!owner.buttonOnly) {
            me.setElementSize(owner.inputEl, Ext.isNumber(width) ? width - owner.button.getWidth() - owner.buttonMargin - owner.buttonDelete.getWidth() - owner.buttonDeleteMargin : width);
        }
    }
});

/**
* @class Ext.ux.form.field.UploadFileField
* @extends Ext.form.field.File
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.0
* 
* [1]: http://www.mzsolutions.eu/extjs/license.txt
* 
* 
* Provides a "delete" button to the file upload component. If the "delete" button is pressed the component behaves like a 
* textfield sending the value "delete" to the server. This is useful when you want to delete the uploaded file.
* The component works with Extjs 4.0.7 and 4.1.0.
* 
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

* @markdown
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
*/
Ext.define('Ext.ux.form.field.UploadFileField', {
    extend: 'Ext.form.field.File',
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
    
    onRender: function() {
        var me = this;

        me.callParent(arguments);
        me.createDeleteButton();
        if(me.browseButtonWrap){
            me.browseButtonWrap.dom.style.width = me.buttonEl.getWidth() + me.buttonMargin + me.buttonDelete.getWidth() + me.buttonDeleteMargin + 'px';
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
        }else{
            me.setValue(me.originalValue);
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

