/**
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.3
* 
* [1]: http://www.mzsolutions.eu/extjs/license.txt
* 
* 
* Provides an image upload field component for Sencha. The field allows you to preview the image that was previously uploaded.
* The component works with Extjs > 4.0.7, 4.1.1 and 4.2.x
* 
* ### Changelog:
* 
* #### 03.10.2012 - v1.2
* 
* - if the delete button is pressed then disable preview
* - if the field is readOnly then disable "delete" and "browse" buttons
* 
* #### 23.04.2013 - v1.3
* 
* - fixed the layout issue to make it work with Ext JS 4.2.x
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

*/
Ext.define('Ext.ux.form.field.ImageFileField', {
    extend: 'Ext.ux.form.field.UploadFileField',
    
    requires: [
        'Ext.ux.layout.component.field.ImageFileField'
    ],
    
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
        me.on('deletefile', me.deletePressed, me);
    },
    
    onDisable: function(){
        var me = this;
        
        me.callParent(arguments);
        if(me.buttonPreview){
            me.buttonPreview.setDisabled(true);
        }
    },
    
    onEnable: function(){
        var me = this;

        me.callParent(arguments);
        if(me.buttonPreview){
            me.buttonPreview.setDisabled(!Ext.isEmpty(me.getValue()));
        }
    },
    
    deletePressed: function(field, pressed){
        var me = this;
        if(me.buttonPreview){
            me.buttonPreview.setDisabled(pressed);
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
        var win = Ext.create('Ext.window.Window', {
            title:      this.buttonPreviewText,
            height:     400,
            width:      400,
            modal:      true,
            layout:     'fit',
            html: '<img src="' + this.getImageValue() + '" ' + style + ' />',
            tools: [{
                type:   'maximize',
                handler: function(event, toolEl, owner, tool){
                    win.toggleMaximize();
                },
                scope:  win
            }]
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
