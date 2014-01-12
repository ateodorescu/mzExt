/**
* @private
* @author Adrian Teodorescu (ateodorescu@gmail.com)
* 
* Layout class for {@link Ext.ux.form.field.CodeMirror} fields. Handles sizing the codemirror field.
*/

if (Ext.getVersion('extjs').match('4.0.7')) {
    Ext.define('Ext.ux.layout.component.field.CodeMirror', {
        extend: 'Ext.layout.component.field.Field',
        alias: ['layout.codemirror'],

        sizeBodyContents: function(width, height) {
            var me = this,
                owner = me.owner,
                bodyEl = owner.bodyEl,
                toolbar = owner.getToolbar(),
                editor = owner.editorEl,
                editorHeight;

            if (Ext.isNumber(width)) {
                width -= bodyEl.getFrameWidth('lr');
            }
            toolbar.setWidth(width);
            editor.setWidth(width);

            
            if (Ext.isNumber(height)) {
                editorHeight = height - toolbar.getHeight() - bodyEl.getFrameWidth('tb');
                editor.setHeight(editorHeight);
            }
        },

        /*
            Functions for Extjs v4.1.0
        */
        toolbarSizePolicy: {
            setsWidth: 0,
            setsHeight: 0
        },

        beginLayout: function(ownerContext) {
            this.callParent(arguments);

            ownerContext.editorContext   = ownerContext.getEl('editorEl');
            ownerContext.toolbarContext  = ownerContext.context.getCmp(this.owner.getToolbar());
        },

        getItemSizePolicy: function (item) {
            
            return this.toolbarSizePolicy;
        },

        getLayoutItems: function () {
            var toolbar = this.owner.getToolbar();
            
            return toolbar ? [toolbar] : [];
        },

        getRenderTarget: function() {
            return this.owner.bodyEl;
        },

        publishInnerHeight: function (ownerContext, height) {
            var me = this,
                innerHeight = height - me.measureLabelErrorHeight(ownerContext) -
                              ownerContext.toolbarContext.getProp('height') -
                              ownerContext.bodyCellContext.getPaddingInfo().height;

            
            if (Ext.isNumber(innerHeight)) {
                ownerContext.editorContext.setHeight(innerHeight);
            } else {
                me.done = false;
            }
        }

    });
}


if (Ext.getVersion('extjs').isGreaterThan('4.0.7')) {
    Ext.define('Ext.ux.layout.component.field.CodeMirror', {
        extend: 'Ext.layout.component.field.Field',
        alias: ['layout.codemirror'],

        toolbarSizePolicy: {
            setsWidth: 0,
            setsHeight: 0
        },

        beginLayout: function(ownerContext) {
            this.callParent(arguments);

            ownerContext.editorContext   = ownerContext.getEl('editorEl');
            ownerContext.toolbarContext  = ownerContext.getEl('toolbar');
        },

        renderItems: Ext.emptyFn,

        getItemSizePolicy: function (item) {
            
            return this.toolbarSizePolicy;
        },

        getLayoutItems: function () {
            var toolbar = this.owner.getToolbar();
            
            return toolbar ? [toolbar] : [];
        },

        getRenderTarget: function() {
            return this.owner.bodyEl;
        },

        publishInnerHeight: function (ownerContext, height) {
            var me = this,
                innerHeight = height - me.measureLabelErrorHeight(ownerContext) -
                              ownerContext.toolbarContext.getProp('height') -
                              ownerContext.bodyCellContext.getPaddingInfo().height;

            
            if (Ext.isNumber(innerHeight)) {
                ownerContext.editorContext.setHeight(innerHeight);
            } else {
                me.done = false;
            }
            
            // hide the toolbar if there is no button visible
            if(this.owner.toolbar.items.length == 0){
                this.owner.toolbar.hide();
            }
        },

        publishInnerWidth: function (ownerContext, width) {
            var me = this;
            
            width = ownerContext.bodyCellContext.el.getWidth();
            if (Ext.isNumber(width)) {
                ownerContext.editorContext.setWidth(width);
                ownerContext.toolbarContext.setWidth(width);
            } else {
                me.done = false;
            }
        }
    });
}
