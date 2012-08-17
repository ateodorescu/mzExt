/**
* @private
* @class Ext.ux.layout.component.field.ImageFileField
* @extends Ext.layout.component.field.Field
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* 
* Layout class for {@link Ext.ux.form.field.ImageFileField} fields. Handles sizing the image field upload.
*/
Ext.define('Ext.ux.layout.component.field.ImageFileField', {
    alias: ['layout.imagefield'],
    extend: 'Ext.layout.component.field.Trigger',

    type: 'imagefield',

    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner;

        if (!owner.buttonOnly) {
            me.setElementSize(owner.inputEl, Ext.isNumber(width) ? width - owner.button.getWidth() - owner.buttonMargin - owner.buttonDelete.getWidth() - owner.buttonDeleteMargin - owner.buttonPreview.getWidth() - owner.buttonPreviewMargin : width);
        }
    }
    
});

/**
* @class Ext.ux.form.field.ImageFileField
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
* Provides an image upload field component for Sencha. The field allows you to preview the image that was previously uploaded.
* The component works with Extjs 4.0.7 and 4.1.0.
* 
* 
#Example usage:#

{@img Ext.ux.form.field.ImageFileField.png Ext.ux.form.field.ImageFileField component}

    var form = Ext.create('Ext.form.Panel', {
        title:          'Image upload',
        bodyPadding:    10,
        width:          300,
        renderTo: Ext.getBody(),        
        items: [{
            xtype:      'imagefield',
            name:       'name',
            anchor:     '100%',
            fieldLabel: 'Image'
        }],
        
        buttons: [{
            text: 'Save'
        }]
    }); 

* @markdown
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
*/
Ext.define('Ext.ux.form.field.ImageFileField', {
    extend: 'Ext.ux.form.field.UploadFileField',
    alias: ['widget.imagefilefield', 'widget.imagefield'],
    alternateClassName: 'Ext.form.ImageFileField',

    componentLayout: 'imagefield',
    /**
    * @cfg {String} buttonPreviewText Set the preview button caption.
    */
    buttonPreviewText:  'Preview',
    /**
    * @cfg {String} buttonPreviewMargin Set the margin of the preview button.
    */
    buttonPreviewMargin: 3,
    /**
    * @cfg {String} imageRootPath Set the root URL to the uploaded picture
    */
    imageRootPath:      '/',
    
    onRender: function() {
        var me = this;

        me.callParent(arguments);
        me.createPreviewButton();
        if(!Ext.isEmpty(me.getValue())){
            me.buttonPreview.enable();
        }
        if(me.browseButtonWrap){
            me.browseButtonWrap.dom.style.width = me.buttonEl.getWidth() + me.buttonMargin + me.buttonDelete.getWidth() + me.buttonDeleteMargin + me.buttonPreview.getWidth() + me.buttonPreviewMargin + 'px';
        }
    },
    
    createPreviewButton: function(){
        var me = this;
        var parent = me.browseButtonWrap ? me.browseButtonWrap : me.bodyEl;
        me.buttonPreview = Ext.widget('button', Ext.apply({
            ui:             me.ui,
            renderTo:       parent,
            text:           me.buttonPreviewText,
            cls:            Ext.baseCSSPrefix + 'form-file-btn',
            preventDefault: true,
            disabled:       true,
            style:          'margin-left:' + me.buttonPreviewMargin + 'px',
            handler:        me.showPreview,
            scope:          me
        }, me.buttonPreviewConfig));

    },
    
    showPreview: function(btn, e){
        try{
            var img = new Image(),
                style;
            img.src = this.getImageValue();
            if(400 / img.width < 400 / img.height){
                style = 'style="max-width:100%"';
            }else{
                style = 'style="max-height:100%"';
            }
        }catch(err){}
        Ext.create('Ext.window.Window', {
            title:      this.buttonPreviewText,
            height:     400,
            width:      400,
            modal:      true,
            layout:     'fit',
            html: '<img src="' + this.getImageValue() + '" ' + style + ' />'
        }).show();
    },
    
    getImageValue: function(){
        return this.imageRootPath + this.getValue();
    },
    
    setValue: function(value){
        var me = this,
            buttonPreview = me.buttonPreview;

        if (buttonPreview && !Ext.isEmpty(value) && value != 'delete') {
            buttonPreview.enable();
        }
        return me.callParent(arguments);
    },
    
    onDestroy: function(){
        Ext.destroyMembers(this, 'buttonPreview');
        this.callParent();
    }
});
