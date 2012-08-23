/**
* @class Ext.ux.form.plugin.HtmlEditor
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.2
* 
* 
* Provides plugins for the HtmlEditor. Many thanks to [Shea Frederick][2] as I was inspired by his [work][3].
* 
* [1]: http://www.mzsolutions.eu/extjs/license.txt
* [2]: http://www.vinylfox.com
* [3]: http://www.vinylfox.com/plugin-set-for-additional-extjs-htmleditor-buttons/
* 
* The plugin buttons have tooltips defined in the {@link #buttonTips} property, but they are not
* enabled by default unless the global {@link Ext.tip.QuickTipManager} singleton is {@link Ext.tip.QuickTipManager#init initialized}.
*
* 
* 
#Example usage:#

{@img Ext.ux.form.plugin.HtmlEditor.png Ext.ux.form.plugin.HtmlEditor plugins}

     var top = Ext.create('Ext.form.Panel', {
        frame:true,
        title:          'HtmlEditor plugins',
        bodyStyle:      'padding:5px 5px 0',
        width:          '80%',
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

*/
Ext.define('Ext.ux.form.plugin.HtmlEditor', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    alternateClassName: 'Ext.form.plugin.HtmlEditor',
    requires: [
        'Ext.tip.QuickTipManager',
        'Ext.form.field.HtmlEditor'
    ],
    
    /**
    * @cfg {Boolean} enableAll Enable all available plugins
    */
    enableAll:              false,
    /**
    * @cfg {Boolean} enableUndoRedo Enable "undo" and "redo" plugins
    */
    enableUndoRedo:         false,
    /**
    * @cfg {Boolean} enableRemoveHtml Enable the plugin "remove html" which is removing all html entities from the entire text
    */
    enableRemoveHtml:       false,
    /**
    * @cfg {Boolean} enableRemoveFormatting Enable "remove format" plugin
    */
    enableRemoveFormatting: false,
    /**
    * @cfg {Boolean} enableIndenting Enable "indent" and "outdent" plugins
    */
    enableIndenting:        false,
    /**
    * @cfg {Boolean} enableSmallLetters Enable "superscript" and "subscript" plugins
    */
    enableSmallLetters:     false,
    /**
    * @cfg {Boolean} enableHorizontalRule Enable "horizontal rule" plugin
    */
    enableHorizontalRule:   false,
    /**
    * @cfg {Boolean} enableSpecialChars Enable "special chars" plugin
    */
    enableSpecialChars:     false,
    /**
    * @cfg {Boolean} enableWordPaste Enable "word paste" plugin which is cleaning the pasted text that is coming from MS Word
    */
    enableWordPaste:        false,
    /**
    * @cfg {Boolean} enableFormatBlocks Enable "format blocks" plugin which allows to insert formatting tags.
    */
    enableFormatBlocks:     false,
    /**
    * @cfg {Boolean} defaultFormatBlock Set the default block format.
    */
    defaultFormatBlock:     'p',
    /**
    * @cfg {Boolean} enableNewToolbar Should we create a new toolbar or use the existing one?
    */
    enableNewToolbar:       false,

    enableInsertTable:      false,
    
    wordPasteEnabled:       false,
    toolbar:                null,
    
    /**
     * @cfg {Array} specialChars
     * An array of additional characters to display for user selection.  Uses numeric portion of the ASCII HTML Character Code only. For example, to use the Copyright symbol, which is &#169; we would just specify <tt>169</tt> (ie: <tt>specialChars:[169]</tt>).
     */
    specialChars: [],
    /**
     * @cfg {Array} charRange
     * Two numbers specifying a range of ASCII HTML Characters to display for user selection. Defaults to <tt>[160, 256]</tt>.
     */
    charRange: [160, 256],
    /**
     * @cfg {Array} listFormatBlocks Array of available format blocks.
     */
    listFormatBlocks: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "address", "pre"],
    
    constructor: function(config) {
        Ext.apply(this, config);
    },
        
    init: function(editor){
        var me = this;
        me.editor = editor;
        me.mon(editor, 'initialize', me.onInitialize, me);
    },
    
    onInitialize: function(){
        var me = this, undef,
            items = [],
            baseCSSPrefix = Ext.baseCSSPrefix,
            tipsEnabled = Ext.tip.QuickTipManager && Ext.tip.QuickTipManager.isEnabled();
        
        function btn(id, toggle, handler){
            return {
                itemId : id,
                cls : baseCSSPrefix + 'btn-icon',
                iconCls: baseCSSPrefix + 'edit-'+id,
                enableToggle:toggle !== false,
                scope: me,
                handler:handler||me.relayBtnCmd,
                clickEvent:'mousedown',
                tooltip: tipsEnabled ? me.buttonTips[id] || undef : undef,
                overflowText: me.buttonTips[id].title || undef,
                tabIndex:-1
            };
        }

        if(me.enableFormatBlocks || me.enableAll){
            var i, listFormatBlocks = new Array();
            for(i=0; i < me.listFormatBlocks.length; i++){
                listFormatBlocks.push({
                    value:      me.listFormatBlocks[i].toLowerCase(),
                    caption:    me.buttonTips.listFormatBlocks[me.listFormatBlocks[i]]
                });
            }
            formatBlockSelectItem = Ext.widget('component', {
                renderTpl: [
                    '<select class="{cls}">',
                        '<tpl for="formats">',
                            '<option value="<{value}>" <tpl if="values.toLowerCase()==parent.defaultFormatBlock"> selected</tpl>>{caption}</option>',
                        '</tpl>',
                    '</select>'
                ],
                renderData: {
                    cls:                    baseCSSPrefix + 'font-select',
                    formats:                listFormatBlocks,
                    defaultFormatBlock:     me.defaultFormatBlock
                },
                renderSelectors: {
                    selectEl: 'select'
                },
                onDisable: function() {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = true;
                    }
                    Ext.Component.superclass.onDisable.apply(this, arguments);
                },
                onEnable: function() {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = false;
                    }
                    Ext.Component.superclass.onEnable.apply(this, arguments);
                }
            });
            if(!me.enableNewToolbar){
                items.push('-');
            };
            items.push(
                formatBlockSelectItem
            );
        }

        if(me.enableRemoveHtml || me.enableAll){
            items.push(btn('removehtml', false, me.doRemoveHtml));
        }
        if(me.enableRemoveFormatting || me.enableAll){
            items.push(btn('removeformat', false));
        }
        if(me.enableUndoRedo || me.enableAll){
            items.push('-');
            items.push(btn('undo', false));
            items.push(btn('redo', false));
        }
        /*if(me.enableInsertTable || me.enableAll){
            items.push('-');
            items.push(btn('inserttable', false, me.doInsertTable));
        }*/
        if(me.enableIndenting || me.enableAll){
            items.push('-');
            items.push(btn('indent', false));
            items.push(btn('outdent', false));
        }
        if(me.enableSmallLetters || me.enableAll){
            items.push('-');
            items.push(btn('superscript'));
            items.push(btn('subscript'));
        }
        if(me.enableHorizontalRule || me.enableAll){
            items.push(btn('inserthorizontalrule', false));
        }
        if(me.enableSpecialChars || me.enableAll){
            items.push(btn('chars', false, me.doSpecialChars));
        }
        if(me.enableWordPaste || me.enableAll){
            items.push(btn('wordpaste', true, me.doWordPaste));
            me.wordPasteEnabled = true;
        }else{
            me.wordPasteEnabled = false;
        }
        
        if(items.length > 0){
            if(me.enableNewToolbar){
                //me.tt = me.editor.getToolbar().getEl().wrap({tag: 'div'});
                me.toolbar = new Ext.Toolbar({
                    renderTo:           me.editor.getToolbar().getEl(),
                    border:             false,
                    enableOverflow:     true,
                    cls:                'x-html-editor-tb'
                });
                //me.editor.toolbar = tt;
                //me.toolbar.removeCls(['x-toolbar', 'x-toolbar-default', 'x-box-layout-ct']);
            }
            me.getToolbar().add(items);
            
            fn = Ext.Function.bind(me.onEditorEvent, me);
            Ext.EventManager.on(me.editor.getDoc(), {
                mousedown: fn,
                dblclick: fn,
                click: fn,
                keyup: fn,
                buffer:100
            });
            
            if(formatBlockSelectItem){
                me.formatBlockSelect = formatBlockSelectItem.selectEl;

                me.mon(me.formatBlockSelect, 'change', function(){
                    me.relayCmd('formatblock', me.formatBlockSelect.dom.value);
                    me.editor.deferFocus();
                });                
            }
            
        }
    },
    
    getToolbar: function(){
        return this.enableNewToolbar ? this.toolbar : this.editor.getToolbar();
    },
    
    onEditorEvent: function(e){
        var me = this,
            diffAt = 0;
        
        me.updateToolbar();
        
        me.curLength = me.editor.getValue().length;
        
        if (e.ctrlKey) {
            var c = e.getCharCode();
            if (c > 0) {
                c = String.fromCharCode(c);
                if(c.toLowerCase() == 'v' && me.wordPasteEnabled){
                    me.cleanWordPaste();
                }
            }
        }
        
        me.lastLength = me.editor.getValue().length;
        me.lastValue = me.editor.getValue();

    },
    
    updateToolbar: function(){
        var me = this,
            btns, doc;
        
        if(me.editor.readOnly){
            return;
        }
        
        btns = me.getToolbar().items.map;
        doc = me.editor.getDoc();
        
        function updateButtons() {
            Ext.Array.forEach(Ext.Array.toArray(arguments), function(name) {
                btns[name].toggle(doc.queryCommandState(name));
            });
        }
        
        if(me.enableSmallLetters || me.enableAll){
            updateButtons('superscript', 'subscript');
        }
        
        if(me.enableWordPaste || me.enableAll){
            btns['wordpaste'].toggle(me.wordPasteEnabled);
        }
        
        if(me.enableFormatBlocks || me.enableAll){
            this.checkSelectionFormatBlock();
        }
    },
    
    doRemoveHtml: function() {
        Ext.defer(function() {
            var me = this;
            me.editor.focus();
            var tmp = document.createElement("DIV");
            tmp.innerHTML = me.editor.getValue();
            me.editor.setValue(tmp.textContent||tmp.innerText);
        }, 10, this);
    },
    
    doInsertTable: function(){
        
    },
    
    doSpecialChars: function(){
        var specialChars = [];
        if (this.specialChars.length) {
            Ext.each(this.specialChars, function(c, i){
                specialChars[i] = ['&#' + c + ';'];
            }, this);
        }
        for (i = this.charRange[0]; i < this.charRange[1]; i++) {
            specialChars.push(['&#' + i + ';']);
        }
        var charStore = new Ext.data.ArrayStore({
            fields: ['char'],
            data: specialChars
        });
        this.charWindow = Ext.create('Ext.Window', {
            title:          this.buttonTips.chars.text,
            width:          436,
            autoHeight:     true,
            modal:          true,
            layout:         'fit',
            items: [{
                itemId:         'idDataView',
                xtype:          'dataview',
                store:          charStore,
                autoHeight:     true,
                multiSelect:    true,
                tpl: new Ext.XTemplate('<tpl for="."><div class="char-item">{char}</div></tpl><div class="x-clear"></div>'),
                overItemCls:    'char-over',
                trackOver:      true,
                itemSelector:   'div.char-item',
                listeners: {
                    itemdblclick: function(t, i, n, e){
                        this.editor.insertAtCursor(i.get('char'));
                        this.charWindow.close();
                    },
                    scope: this
                }
            }],
            buttons: [{
                text: 'Insert',
                handler: function(){
                    Ext.each(this.charWindow.down('#idDataView').selModel.getSelection(), function(rec){
                        var c = rec.get('char');
                        this.editor.focus();
                        this.editor.insertAtCursor(c);
                    }, this);
                    this.charWindow.close();
                },
                scope: this
            }, {
                text: 'Cancel',
                handler: function(){
                    this.charWindow.close();
                },
                scope: this
            }]
        });
        this.charWindow.show();
    },
    
    doWordPaste: function(){
        this.wordPasteEnabled = !this.wordPasteEnabled;
    },
    
    cleanWordPaste: function(){
        this.editor.suspendEvents();
        
        diffAt = this.findValueDiffAt(this.editor.getValue());
        var parts = [
            this.editor.getValue().substr(0, diffAt),
            this.fixWordPaste(this.editor.getValue().substr(diffAt, (this.curLength - this.lastLength))),
            this.editor.getValue().substr((this.curLength - this.lastLength)+diffAt, this.curLength)
        ];
        this.editor.setValue(parts.join(''));
        
        this.editor.resumeEvents();        
    },
    
    findValueDiffAt: function(val){
        
        for (i=0;i<this.curLength;i++){
            if (this.lastValue[i] != val[i]){
                return i;            
            }
        }
        
    },

    fixWordPaste: function(wordPaste) {
        var removals = [/&nbsp;/ig, /[\r\n]/g, /<(xml|style)[^>]*>.*?<\/\1>/ig, /<\/?(meta|object|span)[^>]*>/ig,
            /<\/?[A-Z0-9]*:[A-Z]*[^>]*>/ig, /(lang|class|type|href|name|title|id|clear)=\"[^\"]*\"/ig, /style=(\'\'|\"\")/ig, /<![\[-].*?-*>/g, 
            /MsoNormal/g, /<\\?\?xml[^>]*>/g, /<\/?o:p[^>]*>/g, /<\/?v:[^>]*>/g, /<\/?o:[^>]*>/g, /<\/?st1:[^>]*>/g, /&nbsp;/g, 
            /<\/?SPAN[^>]*>/g, /<\/?FONT[^>]*>/g, /<\/?STRONG[^>]*>/g, /<\/?H1[^>]*>/g, /<\/?H2[^>]*>/g, /<\/?H3[^>]*>/g, /<\/?H4[^>]*>/g, 
            /<\/?H5[^>]*>/g, /<\/?H6[^>]*>/g, /<\/?P[^>]*><\/P>/g, /<!--(.*)-->/g, /<!--(.*)>/g, /<!(.*)-->/g, /<\\?\?xml[^>]*>/g, 
            /<\/?o:p[^>]*>/g, /<\/?v:[^>]*>/g, /<\/?o:[^>]*>/g, /<\/?st1:[^>]*>/g, /style=\"[^\"]*\"/g, /style=\'[^\"]*\'/g, /lang=\"[^\"]*\"/g, 
            /lang=\'[^\"]*\'/g, /class=\"[^\"]*\"/g, /class=\'[^\"]*\'/g, /type=\"[^\"]*\"/g, /type=\'[^\"]*\'/g, /href=\'#[^\"]*\'/g, 
            /href=\"#[^\"]*\"/g, /name=\"[^\"]*\"/g, /name=\'[^\"]*\'/g, / clear=\"all\"/g, /id=\"[^\"]*\"/g, /title=\"[^\"]*\"/g, 
            /<span[^>]*>/g, /<\/?span[^>]*>/g, /class=/g];
                    
        Ext.each(removals, function(s){
            wordPaste = wordPaste.replace(s, "");
        });
        
        // keep the divs in paragraphs
        wordPaste = wordPaste.replace(/<div[^>]*>/g, "<p>");
        wordPaste = wordPaste.replace(/<\/?div[^>]*>/g, "</p>");
        return wordPaste;
        
    },
    
    getSelectedNode: function(){
        try{
            if (this.editor.getWin().getSelection) {
                var currNode = this.editor.getWin().getSelection().focusNode;
            } else if (this.editor.getDoc().getSelection) {
                var currNode = this.editor.getDoc().getSelection().focusNode;
            } else if (this.editor.getDoc().selection) {
                var currNode = this.editor.getDoc().selection.createRange().parentElement();
            }
        }catch(err){}
        if(currNode){
            if(currNode.nodeName == "#text") currNode = currNode.parentNode;
        }
        return currNode;
    },
    
    checkSelectionFormatBlock: function(){
        currNode = this.getSelectedNode();
        var index = -1;
        try{
            var currTag = currNode;
            var prevTagName = currNode.tagName;
            if (prevTagName) prevTagName = prevTagName.toLowerCase();

            while(prevTagName != "html"){
                if (prevTagName == "paragraph"){
                    index = this.listFormatBlocks.indexOf('p')
                }else{
                    index = this.listFormatBlocks.indexOf(prevTagName);
                }
                if (index >= 0) break;
                
                currTag = currTag.parentNode;
                prevTagName = currTag.tagName;
                if (prevTagName) prevTagName = prevTagName.toLowerCase();
            }
        }catch(err){}

        this.formatBlockSelect.dom.selectedIndex = index;
        return index;
    },

    relayBtnCmd: function(btn){
        this.relayCmd(btn.getItemId());
    },
    
    relayCmd: function(cmd, value) {
        Ext.defer(function() {
            var me = this;
            me.editor.focus();
            me.editor.execCmd(cmd, value);
        }, 10, this);
    },

    buttonTips : {
        undo : {
            title: 'Undo',
            text: 'Undo the last action.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        redo : {
            title: 'Redo',
            text: 'Redo the last action.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        removehtml : {
            title: 'Remove html',
            text: 'Remove html from the entire text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        removeformat : {
            title: 'Remove formatting',
            text: 'Remove formatting for the selected area.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        inserttable : {
            title: 'Insert table',
            text: 'Insert table at the cursor.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        indent : {
            title: 'Indent',
            text: 'Indent paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        outdent : {
            title: 'Outdent',
            text: 'Outdent paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        superscript : {
            title: 'Superscript',
            text: 'Change font size to superscript.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        subscript : {
            title: 'Subscript',
            text: 'Change font size to subscript.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        inserthorizontalrule : {
            title: 'Insert horizontal rule',
            text: 'Insert horizontal rule at the cursor.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        chars : {
            title: 'Special chars',
            text: 'Insert special characters.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        wordpaste : {
            title: 'Word paste',
            text: 'Clean the pasted text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        images : {
            title: 'Images',
            text: 'Insert images.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        listFormatBlocks: {
            p:          "Paragraph", 
            h1:         "Header 1", 
            h2:         "Header 2", 
            h3:         "Header 3", 
            h4:         "Header 4", 
            h5:         "Header 5", 
            h6:         "Header 6", 
            address:    "Address", 
            pre:        "Formatted"
        }
    }
    
})

/**
*   This override is required to make the formatBlock plugin to work in IE and WebKit browsers.
*   The default behaviour was to insert <br> tags when Enter was pressed. We have to let the browser insert a new paragraph
*	to be able to change the format.
*/
Ext.override(Ext.form.field.HtmlEditor, {
    /*childEls: [
        'iframeEl', 'textareaEl', 'toolbarsEl'
    ],
    initRenderData: function() {
        this.beforeSubTpl = '<div class="' + this.editorWrapCls + '"><div id="{id}-toolbarsEl">' + Ext.DomHelper.markup(this.toolbar.getRenderTree()) + '</div>';
        return Ext.applyIf(Ext.Component.superclass.initRenderData(), this.getLabelableRenderData());
    }*/
});

if(Ext.isIE || Ext.isWebKit){
    Ext.override(Ext.form.field.HtmlEditor, {
        fixKeys: function() { 
            if (Ext.isIE) {
                return function(e){
                    var me = this,
                        k = e.getKey(),
                        doc = me.getDoc(),
                        range, target;
                    if (k === e.TAB) {
                        e.stopEvent();
                        range = doc.selection.createRange();
                        if(range){
                            range.collapse(true);
                            range.pasteHTML('&nbsp;&nbsp;&nbsp;&nbsp;');
                            me.deferFocus();
                        }
                    }
                };
            }

            if (Ext.isOpera) {
                return function(e){
                    var me = this;
                    if (e.getKey() === e.TAB) {
                        e.stopEvent();
                        me.win.focus();
                        me.execCmd('InsertHTML','&nbsp;&nbsp;&nbsp;&nbsp;');
                        me.deferFocus();
                    }
                };
            }

            if (Ext.isWebKit) {
                return function(e){
                    var me = this,
                        k = e.getKey();
                    if (k === e.TAB) {
                        e.stopEvent();
                        me.execCmd('InsertText','\t');
                        me.deferFocus();
                    }
                };
            }

            return null; 
        }()
        
    })
}
