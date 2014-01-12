/**
* This class acts like a global error handler. The class is overriding all methods of a defined class
* and replace them with new ones where error handling is implemented.
* 
* If you define a class where you don't want to handle errors you just need to provide
* a config in your class and set it on false. The config name is specified in "handleGlobalErrorsVar"
* and the default value assigned to each of your classes is "handleGlobalErrorsDefault".
* 
* 
* To use this class you need to do the following before defining your Application class:

Ext.require('Ext.ux.GlobalErrorManager', function(){
    Ext.ux.GlobalErrorManager.setHandlerFn(function(ex, cls, methodName){
        try {
            // do your own stuff here to handle errors
            Ext.error('New error caught: %s, %o', cls.$className + ':' + methodName + "(): " + ex.message, ex.stack);
        } catch (ex) {
            Ext.log(cls.$className + ':' + methodName + "(): " + ex.message);
        }
    });
});

* 
* @author Adrian Teodorescu (ateodorescu@gmail.com)
* 
*/
Ext.define('Ext.ux.GlobalErrorManager', {
    singleton:  true,
    
    forbiddenClasses: [
        'Ext.util.Observable', 
        'Ext.Base'
    ],
    forbiddenMethods: [
        'self'
    ],
    
    config: {
        /**
        * Configure your own global error handler function here. The following params are sent to it:
        * - ex          = the complete error object including the stack
        * - cls         = class where the error occured
        * - methodName  = method name where the error occured
        * 
        */
        handlerFn: Ext.emptyFn,
        
        /**
        * By default the property that is added to each class has the value "true". 
        * You can change this here if you don't want to handle errors on all classes.
        * 
        * @type Boolean
        */
        handleGlobalErrorsDefault: true,
        
        /**
        * You can change the config name used for the global error handler property which will 
        * be added to all your defined classes.
        * 
        * @type String
        */
        handleGlobalErrorsVar: 'handleGlobalErrors'
    },

    constructor: function(){
        var me = this,
            varName = me.getHandleGlobalErrorsVar();
        
        me.callParent(arguments);
        
        Ext.ClassManager.create = Ext.Function.createInterceptor(Ext.ClassManager.create, function(className, data, createdFn){
            // let's add a property available for all classes
            // we need this to be able to run our own postprocessor during class "define"
            
            if(!data.hasOwnProperty(varName)){
                data[varName] = me.getHandleGlobalErrorsDefault();
            }
        });
        
        // overriding some standard methods could cause problems and we want to avoid that
        Ext.each(me.forbiddenClasses, function(className){
            var c = Ext.ClassManager.get(className);
            
            Ext.Object.each(c, function(name, method){
                if(Ext.isFunction(method)){
                    me.forbiddenMethods.push(name);
                }
            });
        });
        
        Ext.ClassManager.registerPostprocessor(varName, me.getPostprocessor());
    },
    
    /**
    * @private
    *
    * Returns the global error handler post processor function
    * 
    */
    getPostprocessor: function(){
        var me = this,
            varName = me.getHandleGlobalErrorsVar();
        
        return function(processor, cls, data, fn){
            var newMethods = {};
            
            if(!data[varName]){
                return;
            }

            Ext.Object.each(cls.prototype, function(name, method){
                if(Ext.isFunction(method) && Ext.Array.indexOf(me.forbiddenMethods, name) < 0){
                    newMethods[name] = me.getNewMethod(cls, name, method);
                }
            });
            Ext.override(cls, newMethods);
        }
    },
    
    /**
    * Returns a new method with error handling inside.
    * 
    * @param cls
    * @param name
    * @param method
    */
    getNewMethod: function(cls, name, method){
        var me = this;
        
        return function(){
            try {
                return method.apply(this, arguments);
            } catch (ex) {
                // implement here a global error handler which can either pop up the error or send it to our server
                me.getHandlerFn().call(me, ex, cls, name);
            }
        }
    }
    
});
