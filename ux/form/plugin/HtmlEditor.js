/**
* @class Ext.ux.form.plugin.HtmlEditor
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.4
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
* ### Changelog:
* 
* #### 28.08.2012 - v1.3
* 
* Benedikt Elser <boun@gmx.de> - Resurrect the table plugin.
* 
* #### 03.10.2012 - v1.4
* 
* - Updated the table insertion to allow strings to be translated to other languages;
* - New plugins: strikethrough and justify full;
* - Multiple toolbars
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
     * @cfg {Array} tableBorderOptions
     * A nested array of value/display options to present to the user for table border style. Defaults to a simple list of 5 varrying border types.
     */
    tableBorderOptions: [['none', 'None'], ['1px solid #000', 'Solid Thin'], ['2px solid #000', 'Solid Thick'], ['1px dashed #000', 'Dashed'], ['1px dotted #000', 'Dotted']],
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
    * @cfg {Boolean} enableInsertTable Enable "insert table" plugin which allows inserting tables at the cursor.
    */
    enableInsertTable:      false,
    /**
    * @cfg {Boolean} enableMultipleToolbars Use this if you want to use multiple toolbars instead of the 
    * original one full of buttons
    */
    enableMultipleToolbars:  true,
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
    
    wordPasteEnabled:       false,
    toolbar:                null,
    
    constructor: function(config) {
        Ext.apply(this, config);
    },
        
    init: function(editor){
        var me = this;
        me.editor = editor;
        me.toolbar = null;
        
        me.mon(editor, 'initialize', me.onInitialize, me);
        me.mon(editor, 'sync', me.updateToolbar, me);
        me.mon(editor, 'editmodechange', me.onEditorModeChanged, me);
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
            var formatBlockSelectItem = Ext.widget('component', {
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
            if(!me.enableMultipleToolbars){
                items.push('-');
            };
            items.push(
                formatBlockSelectItem, '-'
            );
        }
        
        //insert buttons between original items
        if(me.editor.enableFormat){
            me.editor.getToolbar().insert(me.editor.getToolbar().items.indexOfKey('underline')+1, btn('strikethrough'));
        }
        if(me.editor.enableAlignments){
            me.editor.getToolbar().insert(me.editor.getToolbar().items.indexOfKey('justifyright')+1, btn('justifyfull'));
        }
                
        if(me.enableUndoRedo || me.enableAll){
            items.push(btn('undo', false));
            items.push(btn('redo', false));
            items.push('-');
        }
        if(me.enableIndenting || me.enableAll){
            items.push(btn('indent', false));
            items.push(btn('outdent', false));
            items.push('-');
        }
        if(me.enableSmallLetters || me.enableAll){
            items.push(btn('superscript'));
            items.push(btn('subscript'));
            items.push('-');
        }
        if(me.enableInsertTable || me.enableAll){
            items.push(btn('inserttable', false, me.doInsertTable));
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
        if(me.enableRemoveHtml || me.enableAll){
            items.push(btn('removehtml', false, me.doRemoveHtml));
        }
        if(me.enableRemoveFormatting || me.enableAll){
            items.push(btn('removeformat', false));
        }
        
        if(items.length > 0){
            if(me.enableMultipleToolbars){
                if(me.editor.items){
                    // for 4.2.x
                    me.toolbar = me.editor.items.insert(1, new Ext.Toolbar({
                        enableOverflow:     true,
                        cls:                'x-html-editor-tb'
                    }));
                    me.editor.updateLayout();
                }else{
                    // for 4.1.x
                    me.toolbar = new Ext.Toolbar({
                        renderTo:           Ext.getBody(),
                        border:             false,
                        enableOverflow:     true,
                        cls:                'x-html-editor-tb'
                    });
                    me.toolbar.getEl().insertAfter(me.editor.getToolbar().getEl());
                }
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
        return this.enableMultipleToolbars ? this.toolbar : this.editor.getToolbar();
    },
    
    onEditorModeChanged: function(editor, sourceEdit, eOpts){
        this.disableItems(sourceEdit);
    },

    disableItems: function(disabled) {
        var items = this.getToolbar().items.items,
            i,
            iLen  = items.length,
            item;

        for (i = 0; i < iLen; i++) {
            item = items[i];

            if (item.getItemId() !== 'sourceedit') {
                item.setDisabled(disabled);
            }
        }
    },
    
    onEditorEvent: function(e){
        var me = this,
            diffAt = 0;
        
        //me.updateToolbar();
        
        me.curLength = me.editor.getValue().length;
        me.currPos = me.getSelectionNodePos();
        me.currNode = me.getSelectionNode();
        
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
        me.lastPos = me.getSelectionNodePos();
        me.lastNode = me.getSelectionNode();

    },
    
    updateToolbar: function(){
        var me = this,
            btns, doc;
        
        if(me.editor.readOnly){
            return;
        }
        
        btns = Ext.Object.merge(me.getToolbar().items.map, me.editor.getToolbar().items.map);
        doc = me.editor.getDoc();
        
        function updateButtons() {
            Ext.Array.forEach(Ext.Array.toArray(arguments), function(name) {
                if(btns[name]){
                    btns[name].toggle(doc.queryCommandState(name));
                }
            });
        }
        
        if(me.enableSmallLetters || me.enableAll){
            updateButtons('superscript', 'subscript');
        }
        
        if(me.enableWordPaste || me.enableAll){
            btns['wordpaste'].toggle(me.wordPasteEnabled);
        }

        if(me.editor.enableFormat){
            updateButtons('strikethrough');
        }

        if(me.editor.enableAlignments){
            updateButtons('justifyleft', 'justifycenter', 'justifyright', 'justifyfull');
        }
        
        if(me.enableFormatBlocks || me.enableAll){
            me.checkSelectionFormatBlock();
        }
        me.editor.deferFocus();
    },
    
    doRemoveHtml: function() {
        Ext.defer(function() {
            var me = this, newString;
            //if editor is empty this operation should not be execute
            if (!Ext.isEmpty( me.editor.getValue() )) {
            	me.editor.focus();
            	var tmp = document.createElement("DIV");
            	tmp.innerHTML = me.editor.getValue();
            	newString = tmp.textContent||tmp.innerText;
            	newString  = newString.replace(/\n\n/g, "<br />").replace(/.*<!--.*-->/g,"");
                me.editor.setValue(newString);
            }    
        }, 10, this);
    },

    doInsertTable: function(){
		// Table language text
		var me = this, 
            showCellLocationText = false;

		if (!me.tableWindow){
		    me.tableWindow = new Ext.Window({
		        title:          me.buttonTips['table'].title,
		        closeAction:    'hide',
                modal:          true,
		        width:          '335px',
		        items: [{
		            itemId:     'insert-table',
		            xtype:      'form',
		            border:     false,
		            plain:      true,
		            bodyStyle:  'padding: 10px;',
		            labelWidth: '65px',
		            labelAlign: 'right',
                    defaults: {
                        anchor:     '100%'
                    },
		            items: [{
		                xtype:          'numberfield',
		                allowBlank:     false,
		                allowDecimals:  false,
		                fieldLabel:     me.buttonTips['table'].rows,
		                name:           'row'
		            }, {
		                xtype:          'numberfield',
		                allowBlank:     false,
		                allowDecimals:  false,
		                fieldLabel:     me.buttonTips['table'].columns,
		                name:           'col'
		            }, {
		                xtype:          'combo',
		                fieldLabel:     me.buttonTips['table'].border,
		                name:           'border',
		                forceSelection: true,
		                mode:           'local',
		                store: new Ext.data.ArrayStore({
		                    autoDestroy:    true,
		                    fields:         ['spec', 'val'],
		                    data:           me.tableBorderOptions
		                }),
		                triggerAction:  'all',
		                value:          'none',
		                displayField:   'val',
		                valueField:     'spec'
		            }]
		        }],
				buttons: [{
				    text: me.buttonTips['table'].insert,
				    handler: function(){
				        var frm = this.tableWindow.getComponent('insert-table').getForm();
				        if (frm.isValid()) {
				            var border = frm.findField('border').getValue();
				            var rowcol = [frm.findField('row').getValue(), frm.findField('col').getValue()];
				            if (rowcol.length == 2 && rowcol[0] > 0 && rowcol[1] > 0) {
				                var colwidth = Math.floor(100/rowcol[0]);
				                var html = "<table style='border-collapse: collapse'>";
				                var cellText = '&nbsp;';
				                for (var row = 0; row < rowcol[0]; row++) {
				                    html += "<tr>";
				                    for (var col = 0; col < rowcol[1]; col++) {
				                        html += "<td width='" + colwidth + "%' style='border: " + border + ";'>" + cellText + "</td>";
				                    }
				                    html += "</tr>";
				                }
				                html += "</table>";

								// Workaround, if the editor is currently not in focus
                                var before = this.editor.getValue();
                                this.editor.insertAtCursor(html);
                                var after = this.editor.getValue();
                                if (before==after) {       
                                    this.editor.setValue(before+html);
                                }
				            }
				            this.tableWindow.hide();
				        } else {
				            if (!frm.findField('row').isValid()){
				                frm.findField('row').getEl().frame();
				            } else if (!frm.findField('col').isValid()){
				                frm.findField('col').getEl().frame();
				            }
				        }
				    },
				    scope: this
				}, {
				    text: me.buttonTips['table'].cancel,
				    handler: function(){
				        this.tableWindow.hide();
				    },
				    scope: this
				}]
		    }).show();
		} else {
            this.tableWindow.down('form').getForm().reset();
			this.tableWindow.show();
		}
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
            width:          '436px',
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
        var me = this, selection, range, temp;
        
        me.editor.suspendEvents();
        selection = me.getSelection();
        range = me.editor.getDoc().createRange();
        range.setStart(me.lastNode, me.lastPos);
        range.setEnd(me.currNode, me.currPos);
        selection.removeAllRanges();
        selection.addRange(range);

        temp = document.createElement("DIV");
        temp.appendChild(range.cloneContents());

        me.relayCmd('delete');
        me.editor.insertAtCursor(me.fixWordPaste(temp.innerHTML));
        
        me.editor.resumeEvents();        
    },
    
    fixWordPaste: function(wordPaste) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = wordPaste;
        var newString = tmp.textContent||tmp.innerText;
        // this next piece converts line breaks into break tags
        // and removes the seemingly endless crap code
        newString  = newString.replace(/\n\n/g, "<br />").replace(/.*<!--.*-->/g,"");

        return newString;        
        
    },

    getSelection: function(){
        if (this.editor.getWin().getSelection) {
            return this.editor.getWin().getSelection();
        } else if (this.editor.getDoc().getSelection) {
            return this.editor.getDoc().getSelection();
        } else if (this.editor.getDoc().selection) {
            return this.editor.getDoc().selection;
        }
    },
    
    getSelectionNode: function(){
        var currNode;
        if (this.editor.getWin().getSelection) {
            currNode = this.editor.getWin().getSelection().focusNode;
        } else if (this.editor.getDoc().getSelection) {
            currNode = this.editor.getDoc().getSelection().focusNode;
        } else if (this.editor.getDoc().selection) {
            currNode = this.editor.getDoc().selection.createRange().parentElement();
        }
        
        return currNode;
    },
    
    getSelectionNodePos: function(){
        return this.getSelection().getRangeAt(0).startOffset;
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
//            me.updateToolbar();
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
        },
        strikethrough: {
            title:  'Strikethrough',
            text:   'Strikethrough the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifyfull: {
            title:  'Justify text',
            text:   'Justify the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        table: {
            title:      'Insert Table',
            insert:     'Insert',
            cancel:     'Cancel',
            rows:       'Rows',
            columns:    'Columns',
            border:     'Border'
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
