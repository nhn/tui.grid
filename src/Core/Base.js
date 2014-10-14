    if(typeof window.console == "undefined" || !window.console || !window.console.log) window.console = {"log" : function(){}, "error" : function(){}};
	/**
	 * define ddata container
	 * @type {{Layout: {}, Data: {}, Cell: {}}}
	 */
	var View = {
			Layout : {
			},
			Data : {
			},
			Cell : {
			},
			Plugin : {
			}
		},
		Model = {},
		Data = {},
		Collection = {};



	Model.Base = Backbone.Model.extend({
		initialize : function(attributes, options){
			var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid
			});
		},
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		}
	});

	Collection.Base = Backbone.Collection.extend({
		initialize : function(attributes){
			var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid
			});
		},
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		}
	});


    View.Base = Backbone.View.extend({
		initialize : function(attributes){
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid,
                __viewList : []
			});
		},
        error : function(message){
            var error = function(){
				this.name = "PugException";
				this.message = message || "error";
//				this.methodName = methodName;
				this.caller = arguments.caller;
			};
			error.prototype = new Error();
			return new error();
        },
		/**
		 * setOwnPropertieserties
		 *
		 * @param properties
		 */
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		},

        /**
         * create view
         * @param clazz
         * @param params
         * @returns {clazz}
         */
        createView : function(clazz, params){
            var instance = new clazz(params);
            if(!this.hasOwnProperty('__viewList')){
				this.setOwnProperties({
					__viewList : []
				})
			}
			this.__viewList.push(instance);
            return instance;
        },

        destroy : function(){
            this.destroyChildren();
            this.remove();
        },

        destroyChildren : function(){
            if(this.__viewList instanceof Array){
				while(this.__viewList.length !== 0){
					this.__viewList.pop().destroy();
				}
			}
        }
	});

    View.Base.PluginInterface = View.Base.extend({
        $super : View.Base.PluginInterface,
        initialize : function(){
            View.Base.prototype.initialize.apply(this, arguments);
            this.$super.__plugin = this;
        },
        activate : function(){

        },
        render : function(){
            return this;
        },
        appendTo : function(){

        }
    });




