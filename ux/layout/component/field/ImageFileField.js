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

    publishInnerWidth: function (ownerContext, width) {
        var me = this,
            owner = me.owner,
            btnW = 0, btnH = 0;
        
        btnW = (owner.buttonEl ? owner.buttonEl.getWidth() : ( owner.button ? owner.button.el.getWidth() : 0) );
        btnH = (owner.buttonEl ? owner.buttonEl.getHeight() : ( owner.button ? owner.button.el.getHeight() : 0) );
        owner.browseButtonWrap.setWidth(btnW + owner.buttonMargin + owner.buttonDelete.getWidth() + owner.buttonDeleteMargin + owner.buttonPreview.getWidth() + owner.buttonPreviewMargin);
        owner.buttonDelete.setHeight(btnH);
        owner.buttonPreview.setHeight(btnH);
    },
    
    sizeBodyContents: function(width, height) {
        var me = this,
            owner = me.owner;

        if (!owner.buttonOnly) {
            me.setElementSize(owner.inputEl, Ext.isNumber(width) ? width - owner.button.getWidth() - owner.buttonMargin - owner.buttonDelete.getWidth() - owner.buttonDeleteMargin - owner.buttonPreview.getWidth() - owner.buttonPreviewMargin : width);
        }
    }
    
});

