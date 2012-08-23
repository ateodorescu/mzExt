/**
* @private
* @class Ext.ux.layout.component.field.CodeMirror
* @extends Ext.layout.component.field.Field
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* 
* Layout class for {@link Ext.ux.form.field.CodeMirror} fields. Handles sizing the codemirror field.
*/
Ext.define('Ext.ux.layout.component.field.CodeMirror', {
    extend: 'Ext.layout.component.field.Field',
    alias: ['layout.codemirror'],

    type: 'codemirror',

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

/**
* @class Ext.ux.form.field.CodeMirror
* @extends Ext.form.field.Base
* @author Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
* @license [MIT][1]
* 
* @version 1.1
* 
* 
* Provides a [CodeMirror][2] component wrapper for Sencha. The supported and tested CodeMirror versions are 2.2, 2.3 and 2.4.
* The component works with Extjs 4.0.7.
* 
* [1]: http://www.mzsolutions.eu/extjs/license.txt
* [2]: http://codemirror.net/
* 
* 
* The editor's toolbar buttons have tooltips defined in the {@link #buttonTips} property, but they are not
* enabled by default unless the global {@link Ext.tip.QuickTipManager} singleton is {@link Ext.tip.QuickTipManager#init initialized}.
*
* If you include the modes script files by yourself then ignore the {@link #modes} property.
* If you also include the extensions script files by yourself then ignore the {@link #extensions} property.
* 
* 
#Example usage:#

{@img Ext.ux.form.field.CodeMirror.png Ext.ux.form.field.CodeMirror component}

    var form = Ext.create('Ext.form.Panel', {
        title:          'Function info',
        bodyPadding:    10,
        width:          500,
        renderTo: Ext.getBody(),        
        items: [{
            xtype:      'textfield',
            name:       'name',
            anchor:     '100%',
            fieldLabel: 'Name',
            allowBlank: false  // requires a non-empty value
        }, {
            xtype:      'codemirror',
            name:       'function',
            fieldLabel: 'Code',
            anchor:     '100%'
        }],
        
        buttons: [{
            text: 'Save',
            handler: function(){
                if(form.getForm().isValid()){
                    alert(form.getForm().getValues().function);
                }
            }
        }]
    }); 

* @markdown
* @docauthor Adrian Teodorescu (ateodorescu@gmail.com; http://www.mzsolutions.eu)
*/
Ext.define('Ext.ux.form.field.CodeMirror', {
    extend: 'Ext.form.field.Base',
    mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.codemirror',
    alternateClassName: 'Ext.form.CodeMirror',
    requires: [
        'Ext.tip.QuickTipManager',
        'Ext.toolbar.Item',
        'Ext.toolbar.Toolbar',
        'Ext.util.Format',
        'Ext.ux.layout.component.field.CodeMirror'
    ],

    fieldSubTpl: [
        '<div class="{toolbarWrapCls}"></div>',
        '<textarea id="{id}" name="{name}" tabIndex="-1" class="{textareaCls}" ',
            'style="{size}" autocomplete="off"></textarea>',
        '<div class="{editorCls}" name="{editorName}" style="{size}"></div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    componentLayout: 'codemirror',

    fieldBodyCls: Ext.baseCSSPrefix + 'html-editor-wrap',
    
    /**
    * @cfg {String} mode The default mode to use when the editor is initialized. When not given, this will default to the first mode that was loaded. 
    * It may be a string, which either simply names the mode or is a MIME type associated with the mode. Alternatively, 
    * it may be an object containing configuration options for the mode, with a name property that names the mode 
    * (for example {name: "javascript", json: true}). The demo pages for each mode contain information about what 
    * configuration parameters the mode supports.
    */
    mode:               'text/plain',

    /**
    * @cfg {Boolean} showModes Enable mode selection in the toolbar
    */
    showModes:          true,

    /**
    * @cfg {Boolean} showAutoIndent Enable auto indent button for indenting the selected range 
    */
    showAutoIndent:     true,

    /**
    * @cfg {Boolean} showLineNumbers Enable line numbers button in the toolbar.
    */
    showLineNumbers:    true,

    /**
    * @cfg {Boolean} enableMatchBrackets Force matching-bracket-highlighting to happen 
    */
    enableMatchBrackets:    true,

    /**
    * @cfg {Boolean} enableElectricChars Configures whether the editor should re-indent the current line when a character is typed 
    * that might change its proper indentation (only works if the mode supports indentation). 
    */
    enableElectricChars:    false,

    /**
    * @cfg {Boolean} enableIndentWithTabs Whether, when indenting, the first N*tabSize spaces should be replaced by N tabs.
    */
    enableIndentWithTabs:   true,

    /**
    * @cfg {Boolean} enableSmartIndent Whether to use the context-sensitive indentation that the mode provides (or just indent the same as the line before).
    */
    enableSmartIndent:      true,

    /**
    * @cfg {Boolean} enableLineWrapping Whether CodeMirror should scroll or wrap for long lines.
    */
    enableLineWrapping:     false,

    /**
    * @cfg {Boolean} enableLineNumbers Whether to show line numbers to the left of the editor.
    */
    enableLineNumbers:      true,

    /**
    * @cfg {Boolean} enableGutter Can be used to force a 'gutter' (empty space on the left of the editor) to be shown even 
    * when no line numbers are active. This is useful for setting markers.
    */
    enableGutter:           false,

    /**
    * @cfg {Boolean} enableFixedGutter When enabled (off by default), this will make the gutter stay visible when the 
    * document is scrolled horizontally.
    */
    enableFixedGutter:      false,

    /**
    * @cfg {Number} firstLineNumber At which number to start counting lines.
    */
    firstLineNumber:         1,

    /**
     * @cfg {Boolean} readOnly <tt>true</tt> to mark the field as readOnly.
     */
    readOnly : false,

    /**
    * @cfg {Number} pollInterval Indicates how quickly (miliseconds) CodeMirror should poll its input textarea for changes. 
    * Most input is captured by events, but some things, like IME input on some browsers, doesn't generate events 
    * that allow CodeMirror to properly detect it. Thus, it polls.
    */
    pollInterval:         100,

    /**
    * @cfg {Number} indentUnit How many spaces a block (whatever that means in the edited language) should be indented.
    */
    indentUnit:         4,

    /**
    * @cfg {Number} tabSize The width of a tab character.
    */
    tabSize:            4,

    /**
    * @cfg {String} theme The theme to style the editor with. You must make sure the CSS file defining the corresponding 
    * .cm-s-[name] styles is loaded (see the theme directory in the distribution). The default is "default", for which 
    * colors are included in codemirror.css. It is possible to use multiple theming classes at once—for example 
    * "foo bar" will assign both the cm-s-foo and the cm-s-bar classes to the editor.
    */
    theme:              'default',
    
    /**
    * @property {String} pathModes Path to the modes folder to dinamically load the required scripts. You could also
    * include all your required modes in a big script file and this path will be ignored. 
    * Do not fill in the trailing slash.
    */
    pathModes:          'mode',
    
    /**
    * @property {String} pathExtensions Path to the extensions folder to dinamically load the required scripts. You could also
    * include all your required extensions in a big script file and this path will be ignored. 
    * Do not fill in the trailing slash. 
    */
    pathExtensions:     'lib/util',

    /**
    * @cfg {Array} listModes Define here what modes do you want to show in the selection list of the toolbar
    */
    listModes: [{
        text: 'PHP',
        mime: 'text/x-php'
    },{
        text: 'JSON',
        mime: 'application/json'
    },{
        text: 'Javascript',
        mime: 'text/javascript'
    },{
        text: 'HTML mixed',
        mime: 'text/html'
    },{
        text: 'CSS',
        mime: 'text/css'
    },{
        text: 'Plain text',
        mime: 'text/plain'
    }],
        
    /**
    * @property {Array} modes Define here mode script dependencies; When choosing a specific mode the script files are automatically loaded
    */
    modes: [{
        mime:           ['text/plain'],
        dependencies:   []
    },{
        mime:           ['application/x-httpd-php', 'text/x-php'],
        dependencies:   ['xml/xml.js', 'javascript/javascript.js', 'css/css.js', 'clike/clike.js', 'php/php.js']
    },{
        mime:           ['text/javascript', 'application/json'],
        dependencies:   ['javascript/javascript.js']
    },{
        mime:           ['text/html'],
        dependencies:   ['xml/xml.js', 'javascript/javascript.js', 'css/css.js', 'htmlmixed/htmlmixed.js']
    },{
        mime:           ['text/css'],
        dependencies:   ['css/css.js']
    }],
    
    /**
    * @property {Array} extensions Define here extensions script dependencies; This is used by toolbar buttons to automatically 
    * load the scripts before using an extension.
    */
    extensions:{
        format: {
            dependencies: ['formatting.js']
        }
    },
    
    scriptsLoaded: [],
    lastMode: '',
    
    initComponent : function(){
        var me = this;
        
        me.addEvents(
            /**
             * @event initialize
             * Fires when the editor is fully initialized (including the iframe)
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'initialize',
            /**
             * @event activate
             * Fires when the editor is first receives the focus. Any insertion must wait
             * until after this event.
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'activate',
            /**
             * @event deactivate
             * Fires when the editor looses the focus. 
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'deactivate',
             /**
             * @event change
             * Fires when the content of the editor is changed. 
             * @param {Ext.ux.form.field.CodeMirror} this
             * @param {String} newValue New value
             * @param {String} oldValue Old value
             * @param {Array} options 
             */
            'change',
             /**
             * @event modechanged
             * Fires when the editor mode changes. 
             * @param {Ext.ux.form.field.CodeMirror} this
             * @param {String} newMode New mode
             * @param {String} oldMode Old mode
             */
            'modechanged',
            /**
             * @event cursoractivity
             * Fires when the cursor or selection moves, or any change is made to the editor content.
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'cursoractivity',
            /**
             * @event gutterclick
             * Fires whenever the editor gutter (the line-number area) is clicked. 
             * @param {Ext.ux.form.field.CodeMirror} this
             * @param {Number} lineNumber Zero-based number of the line that was clicked
             * @param {Object} event The raw mousedown event
             */
            'gutterclick',
            /**
             * @event scroll
             * Fires whenever the editor is scrolled.
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'scroll',
            /**
             * @event highlightcomplete
             * Fires whenever the editor's content has been fully highlighted.
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'highlightcomplete',
            /**
             * @event update
             * Fires whenever CodeMirror updates its DOM display.
             * @param {Ext.ux.form.field.CodeMirror} this
             */
            'update',
            /**
             * @event keyevent
             * Fires on eery keydown, keyup, and keypress event that CodeMirror captures.
             * @param {Ext.ux.form.field.CodeMirror} this
             * @param {Object} event This key event is pretty much the raw key event, except that a stop() method is always 
             * added to it. You could feed it to, for example, jQuery.Event to further normalize it. This function can inspect 
             * the key event, and handle it if it wants to. It may return true to tell CodeMirror to ignore the event. 
             * Be wary that, on some browsers, stopping a keydown does not stop the keypress from firing, whereas on others 
             * it does. If you respond to an event, you should probably inspect its type property and only do something when 
             * it is keydown (or keypress for actions that need character data).
             */
            'keyevent'
        );

        me.initLabelable();
        me.initField();

        me.callParent(arguments);
        
    },

    /**
    * @private override
    */
    getSubTplData: function() {
        var cssPrefix = Ext.baseCSSPrefix;
        return {
            toolbarWrapCls: cssPrefix + 'html-editor-tb',
            textareaCls: cssPrefix + 'hidden',
            editorCls: cssPrefix + 'codemirror',
            editorName: Ext.id(),
            size: 'height:100px;'
        };
    },

    getBodyNaturalWidth: function() {
        return 565;
    },

    /**
    * @private override
    */
    onRender: function() {
        var me = this,
            renderSelectors = me.renderSelectors;
        
        Ext.applyIf(renderSelectors, {
            toolbarWrap: 'div.' + Ext.baseCSSPrefix + 'html-editor-tb',
            editorEl: 'div.' + Ext.baseCSSPrefix + 'codemirror'
        });

        me.callParent(arguments);

        me.createToolbar(me);
        me.disableItems(true);
        me.initEditor();
        me.rendered = true;
    },
    
    /**
    * @private override
    */
    initEditor : function(){
        var me = this;
        
        me.editor = CodeMirror(me.editorEl, {
            matchBrackets:      me.enableMatchBrackets,
            electricChars:      me.enableElectricChars,
            indentUnit:         me.indentUnit,
            smartIndent:        me.enableSmartIndent,
            indentWithTabs:     me.enableIndentWithTabs,
            pollInterval:       me.pollInterval,
            lineNumbers:        me.enableLineNumbers,
            lineWrapping:       me.enableLineWrapping,
            firstLineNumber:    me.firstLineNumber,
            tabSize:            me.tabSize,
            gutter:             me.enableGutter,
            fixedGutter:        me.enableFixedGutter,
            theme:              me.theme,
            onChange:           function(editor, tc){
                me.checkChange();
            },
            onCursorActivity:   function(editor){
                me.fireEvent('cursoractivity', me);
            },
            onGutterClick:      function(editor, line, event){
                me.fireEvent('gutterclick', me, line, event);
            },
            onFocus:            function(editor){
                me.fireEvent('activate', me);
            },
            onBlur:             function(editor){
                me.fireEvent('deactivate', me);
            },
            onScroll:           function(editor){
                me.fireEvent('scroll', me);
            },
            onHighlightComplete: function(editor){
                me.fireEvent('highlightcomplete', me);
            },
            onUpdate:           function(editor){
                me.fireEvent('update', me);
            },
            onKeyEvent:         function(editor, event){
                me.fireEvent('keyevent', me, event);
            }
        });
//        me.editor.setValue(me.rawValue);
        me.setMode(me.mode);
        me.setReadOnly(me.readOnly);
        me.fireEvent('initialize', me);

        // change the codemirror css
        var css = Ext.util.CSS.getRule('.CodeMirror');
        if(css){
            css.style.height = '100%';
        }
        var css = Ext.util.CSS.getRule('.CodeMirror-Scroll');
        if(css){
            css.style.height = '100%';
        }

    },
    
    /**
    * @private
    */
    createToolbar : function(editor){
        var me = this, 
            items = [],
            tipsEnabled = Ext.tip.QuickTipManager && Ext.tip.QuickTipManager.isEnabled(),
            baseCSSPrefix = Ext.baseCSSPrefix,
            toolbar, undef;
        
        function btn(id, toggle, handler){
            return {
                itemId : id,
                cls : baseCSSPrefix + 'btn-icon',
                iconCls: baseCSSPrefix + 'edit-'+id,
                enableToggle:toggle !== false,
                scope: editor,
                handler:handler||editor.relayBtnCmd,
                clickEvent:'mousedown',
                tooltip: tipsEnabled ? editor.buttonTips[id] || undef : undef,
                overflowText: editor.buttonTips[id].title || undef,
                tabIndex:-1
            };
        }

        if(me.showModes){
            modesSelectItem = Ext.widget('component', {
                renderTpl: [
                    '<select class="{cls}">',
                        '<tpl for="modes">',
                            '<option value="{mime}" <tpl if="this.isSelected(values.mime)"> selected</tpl>>{text}</option>',
                        '</tpl>',
                    '</select>',{
                        mode: me.mode,
                        isSelected: function(value){
                            return this.mode == value;
                        }
                    }
                ],
                renderData: {
                    cls: baseCSSPrefix + 'font-select',
                    modes: me.listModes
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

            items.push(
                modesSelectItem,
                '-'
            );
        }
        // auto indenting button
        if(me.showAutoIndent)
            items.push(btn('justifycenter', false));
            
        // line numbers button
        if(me.showLineNumbers)
            items.push(btn('insertorderedlist'));
        
        toolbar = Ext.widget('toolbar', {
            renderTo: me.toolbarWrap,
            enableOverflow: true,
            items: items,
            componentCls: baseCSSPrefix + 'html-editor-tb'
        });
        
        if(items.length == 0){
            toolbar.hide();
        }
        
        if(me.showModes){
            me.modesSelect = modesSelectItem.selectEl;
            me.mon(me.modesSelect, 'change', function(){
                me.setMode(me.modesSelect.dom.value);
            });
        }

        me.mon(toolbar.el, 'click', function(e){
            e.preventDefault();
        });

        me.toolbar = toolbar;
        me.updateToolbarButtons();
    },
    
    /**
    * @private
    */
    getToolbar : function(){
        return this.toolbar;
    },
    
    updateToolbarButtons: function(){
        var me = this;
        
        btns = me.getToolbar().items.map;
        if(me.showLineNumbers)
            btns['insertorderedlist'].toggle(me.enableLineNumbers);
        
    },
    
    /**
    * @private
    */
    relayBtnCmd: function(btn){
        this.relayCmd(btn.getItemId());
    },
    
    /**
    * @private
    */
    relayCmd: function(cmd){
        Ext.defer(function() {
            var me = this;
            me.editor.focus();
            switch(cmd){
                // auto formatting
                case 'justifycenter':
                    if(!CodeMirror.extensions.autoIndentRange){
                        me.loadDependencies(me.extensions.format, me.pathExtensions, me.doIndentSelection, me);                        
                    }else{
                        me.doIndentSelection();
                    }
                break;
                
                // line numbers
                case 'insertorderedlist':
                    me.doChangeLineNumbers();
                break;
            }
        }, 10, this);
    },
    
    /**
    * @private
    * Reload all CodeMirror extensions for the current instance;
    * 
    */
    reloadExtentions: function(){
        var me = this;
        
        for (var ext in CodeMirror.extensions)
          if (CodeMirror.extensions.propertyIsEnumerable(ext) &&
              !me.editor.propertyIsEnumerable(ext))
            me.editor[ext] = CodeMirror.extensions[ext];
    },
    
    doChangeLineNumbers: function(){
        var me = this;
        
        me.enableLineNumbers = !me.enableLineNumbers;
        me.editor.setOption('lineNumbers', me.enableLineNumbers);
    },
    /**
    * @private
    */
    doIndentSelection: function(){
        var me = this;
        
        me.reloadExtentions();
        
        try{
            var range = { from: me.editor.getCursor(true), to: me.editor.getCursor(false) };
            me.editor.autoIndentRange(range.from, range.to);        
        }catch(err){}
    },

    /**
    * @private
    */
    getMime: function(mime){
        var me = this, item, found = false;
        
        for(var i=0;i<me.modes.length;i++){
            item = me.modes[i];
            if(Ext.isArray(item.mime)){
                if(Ext.Array.contains(item.mime, mime)){
                    found = true;
                    break;
                }
            }else{
                if(item == mime){
                    found = true;
                    break;
                }
            }
        }
        if(found)
            return item;
        else
            return null;
    },
    
    /**
    * @private
    */
    loadDependencies: function(item, path, handler, scope){
        var me = this;
        
        me.scripts = [];
        me.scriptIndex = -1;
        
        // load the dependencies
        for(var i=0; i < item.dependencies.length; i++){
            if(!Ext.Array.contains(me.scriptsLoaded, path + '/' + item.dependencies[i])){
                var options = {
                    url: path + '/' + item.dependencies[i],
                    index: ++me.scriptIndex,
                    onLoad: function(options){
                        var ok = true;
                        for(j=0; j < me.scripts.length; j++){
                            if(me.scripts[j].called) {// this event could be raised before one script if fetched
                                ok = ok && me.scripts[j].success;
                                if(me.scripts[j].success && !Ext.Array.contains(me.scriptsLoaded, me.scripts[j].url)){
                                    me.scriptsLoaded.push(me.scripts[j].url);
                                }
                            }else{
                                ok = false;
                            }
                        }
                        if(ok){
                            handler.call(scope || me.editor);
                        }
                    }
                };
            
                me.scripts[me.scriptIndex] = {
                    url: options.url,
                    success: true,
                    called: false,
                    options: options,
                    onLoad: options.onLoad || Ext.emptyFn,
                    onError: options.onError || Ext.emptyFn
                };
            }
        }
        for(var i=0; i < me.scripts.length; i++){
            me.loadScript(me.scripts[i].options);
        }
    },
    
    /**
    * @private
    */
    loadScript: function(options){
        var me = this;
        Ext.Ajax.request({
            url: options.url,
            scriptIndex: options.index,
            success: function(response, options) {
                var script = 'Ext.getCmp("' + this.id + '").scripts[' + options.scriptIndex + ']';
                window.setTimeout('try { ' + response.responseText + ' } catch(e) { '+script+'.success = false; '+script+'.onError('+script+'.options, e); };  ' + script + '.called = true; if ('+script+'.success) '+script+'.onLoad('+script+'.options);', 0);
            },
            failure: function(response, options) {
                var script = this.scripts[options.scriptIndex];
                script.success = false;
                script.called = true;
                script.onError(script.options, response.status);
            },
            scope: me
        });        
    },
    
    /**
    * @private
    * Return mode depending on the mime; If the mime is not loaded then return null
    * 
    * @param mime
    */
    getMimeMode: function(mime){
        var mode = null;
        var mimes = CodeMirror.listMIMEs();
        for(var i=0; i<mimes.length; i++){
            if(mimes[i].mime == mime){
                mode = mimes[i].mode;
                if(typeof mode == "object")
                    mode = mode.name;
                break;
            }
        }
        return mode;
    },
    
    /**
    * Change the CodeMirror mode to the specified mime.
    * 
    * @param {String} mime The MIME value according to the CodeMirror documentation
    */
    setMode: function(mime){
        var me = this, 
            found = false;
        // search mime to find script dependencies
        var item = me.getMime(mime);
        
        if(!item) {
            // mime not found
            return;
        }
        
        var mode = me.getMimeMode(mime);

        if(!mode){
            me.loadDependencies(item, me.pathModes, function(){
                var mode = me.getMimeMode(mime);
                if(typeof mode == "string")
                    me.editor.setOption('mode', mime);
                else
                    me.editor.setOption('mode', mode);
            });
        }else{
            if(typeof mode == "string")
                me.editor.setOption('mode', mime);
            else
                me.editor.setOption('mode', mode);
        }
        
        if(me.modesSelect){
            me.modesSelect.dom.value = mime;
        }
        try{
            me.fireEvent('modechanged', me, mime, me.lastMode);
        }catch(err){}
        me.lastMode = mime;
    },
    
    /**
    * Set the editor as read only
    * 
    * @param {Boolean} readOnly
    */
    setReadOnly: function(readOnly) {
        var me = this;
        
        if(me.editor){
            me.editor.setOption('readOnly', readOnly);
            me.disableItems(readOnly);
        }
    },
    
    onDisable: function() {
        this.bodyEl.mask();
        this.callParent(arguments);
    },

    onEnable: function() {
        this.bodyEl.unmask();
        this.callParent(arguments);
    },
    
    disableItems: function(disabled) {
        this.getToolbar().items.each(function(item){
            item.setDisabled(disabled);
        });
    },

    /**
    * Sets a data value into the field and runs the change detection. 
    * @param {Mixed} value The value to set
    * @return {Ext.ux.form.field.CodeMirror} this
    */
    setValue: function(value){
        var me = this;
        me.mixins.field.setValue.call(me, value);
        me.rawValue = value;
        if(me.editor)
            me.editor.setValue(value);
        return me;
    },
    
    /**
    * Return submit value to the owner form.
    * @return {Mixed} The field value
    */
    getSubmitValue: function(){
        var me = this;
        return me.getValue();
    },
    
    /**
    * Return the value of the CodeMirror editor
    * @return {Mixed} The field value
    */
    getValue: function(){
        var me = this;
        
        if(me.editor)
            return me.editor.getValue();
        else
            return null;
    },
    
    /**
    * @private
    */
    onDestroy: function(){
        var me = this;
        if(me.rendered){
            try {
                Ext.EventManager.removeAll(me.editor);
                for (prop in me.editor) {
                    if (me.editor.hasOwnProperty(prop)) {
                        delete me.editor[prop];
                    }
                }
            }catch(e){}
            Ext.destroyMembers('tb', 'toolbarWrap', 'editorEl');
        }
        me.callParent();
    },
    
    /**
    * Object collection of toolbar tooltips for the buttons in the editor. The key
    * is the command id associated with that button and the value is a valid QuickTips object.
    * These are taken from the HtmlEditor to avoid including additional css.
    * @type Object
    */
    buttonTips : {
        justifycenter : {
            title: 'Auto indent',
            text: 'Applies automatic mode-aware indentation to the specified range.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        insertorderedlist : {
            title: 'Line numbers',
            text: 'Show line numbers.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        }
    }
    
    
});
