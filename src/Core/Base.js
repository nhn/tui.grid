    if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};
    /**
     * define data container
     * @type {{Layout: {}, Data: {}, Cell: {}}}
     */
    var View = {
            CellFactory: null,
            Layout: {},
            Layer: {},
            Renderer: {
                Row: null,
                Cell: {}
            }
        },
        Model = {},
        Data = {},
        Collection = {},
        AddOn = {};

    /**
     * Model Base Class
     */
    Model.Base = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });

        },

        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });
    /**
     * Collection Base Class
     */
    Collection.Base = Backbone.Collection.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });
            this.reset([], {silent: true});
        },
        clear: function() {
            this.each(function(model) {
                model.stopListening();
                model = null;
            });

            return this;
        },
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });

    /**
     * View base class
     * @constructor
     */
    View.Base = Backbone.View.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid,
                __viewList: []
            });
        },
        error: function(message) {
            var error = function() {
                this.name = 'PugException';
                this.message = message || 'error';
//                this.methodName = methodName;
//                this.caller = arguments.caller;
            };
            error.prototype = new Error();
            return new error();
        },
        /**
         * setOwnPropertieserties
         *
         * @param {object} properties
         */
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        },

        /**
         * create view
         * @param {class} clazz
         * @param {object} params
         * @return {class} instance
         */
        createView: function(clazz, params) {
            var instance = new clazz(params);
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        addView: function(instance) {
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        destroy: function() {
            this.destroyChildren();
            this.remove();
        },
        createEventData: function(eventData) {
            eventData = eventData || {};
            eventData.stop = function() {
                this._isStoped = true;
            };
            eventData.isStopped = function() {
                return this._isStoped;
            };
            eventData._isStoped = eventData._isStoped || false;
            return eventData;
        },
        destroyChildren: function() {
            if (this.__viewList instanceof Array) {
                while (this.__viewList.length !== 0) {
                    this.__viewList.pop().destroy();
                }
            }
        }
    });
    /**
     * Renderer Base Class
     * @extends {View.Base}
     * @constructor
     */
    View.Base.Renderer = View.Base.extend({
        eventHandler: {},
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        /**
         * eventHandler 초기화
         * @private
         */
        _initializeEventHandler: function() {
            var eventHandler = {};
            _.each(this.eventHandler, function(methodName, eventName) {
                var tmp = eventName.split(' '),
                    event = tmp[0],
                    selector = tmp[1] || '';

                eventHandler[event] = {
                    selector: selector,
                    handler: $.proxy(this[methodName], this)
                };
            }, this);
            this.setOwnProperties({
                _eventHandler: eventHandler
            });
        },
        _attachHandler: function($el) {
            _.each(this._eventHandler, function(obj, eventName) {
                var handler = obj.handler,
                    selector = obj.selector,
                    $target = $el;
                if (selector) {
                    $target = $el.find(selector);
                }
                if ($target.length > 0) {
                    $target.on(eventName, handler);
                }
            }, this);
        },
        _detachHandler: function($el) {
            _.each(this._eventHandler, function(obj, eventName) {
                var handler = obj.handler,
                    selector = obj.selector,
                    $target = $el;
                if (selector) {
                    $target = $el.find(selector);
                }
                if ($target.length > 0) {
                    $target.off(eventName, handler);
                }
            }, this);
        },
        getHtml: function() {
            throw this.error('implement getHtml() method');
        }
    });


