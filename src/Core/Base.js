    if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};
    /**
     * define ddata container
     * @type {{Layout: {}, Data: {}, Cell: {}}}
     */
    var View = {
            CellFactory: null,
            Layout: {
            },
            Renderer: {
                Row: null,
                Cell: {}
            },
            Plugin: {
            }
        },
        Model = {},
        Data = {},
        Collection = {};

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
        },
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });

    /**
     * View base class
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
         * @return {class} clazz
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

        destroy: function() {
            this.destroyChildren();
            this.remove();
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
                $target.on(eventName, handler);
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
                $target.off(eventName, handler);
            }, this);
        },
        getHtml: function() {
            throw this.error('implement getHtml() method');
        }
    });
    /**
     * Cell Renderer Base
     */
    View.Base.Renderer.Cell = View.Base.Renderer.extend({
        cellType: 'normal',
        eventHandler: {},
        shouldRenderList: ['isEditable', 'optionList', 'value'],
        initialize: function(attributes, options) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        baseTemplate: _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' rowSpan="<%=rowSpan%>"' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            ' cellType="<%=cellType%>"' +
            '>' +
            '<%=content%>' +
            '</td>'),
        onModelChange: function(cellData, $tr) {
            var $target = this._getCellElement(cellData.columnName, $tr),
                shouldRender = false;

            this._setFocusedClass(cellData, $target);

            for (var i = 0; i < this.shouldRenderList.length; i++) {
                if ($.inArray(this.shouldRenderList[i], cellData.changed) !== -1) {
                    shouldRender = true;
                    break;
                }
            }
            if (shouldRender === true) {
                this.render(cellData, $target);
            }else {
                this.setElementAttribute(cellData, $target);
            }
        },
        attachHandler: function($target) {
            this._attachHandler($target);
        },
        detachHandler: function($target) {
            this._detachHandler($target);
        },
        _setFocusedClass: function(cellData, $target) {
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },
        setElementAttribute: function(cellData, $target) {

        },
        render: function(cellData, $target) {
            this._detachHandler($target);
            $target.html(this.getContentHtml(cellData));
            this._attachHandler($target);
        },

        getHtml: function(cellData) {
            var classNameList = [];

            if (cellData.className) {
                classNameList.push(cellData.className);
            }
            if (cellData.selected === true) {
                classNameList.push('selected');
            }
            if (cellData.focused === true) {
                classNameList.push('focused');
            }

            return this.baseTemplate({
                columnName: cellData.columnName,
                rowSpan: cellData.rowSpan,
                className: classNameList.join(' '),
                attributes: this.getAttributes(cellData),
                cellType: this.cellType,
                content: this.getContentHtml(cellData)
            });
        },
        getAttributesString: function(attributes) {
            var str = '';
            _.each(attributes, function(value, key) {
                str += ' ' + key + '="' + value + '"';
            }, this);
            return str;
        },
        getEventHandler: function() {
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getContentHtml: function(cellData) {
            return cellData.value;
        },
        /**
         * implement this.
         * @private
         */
        getAttributes: function(cellData) {
            return '';
        },
        _getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        _getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        _getCellElement: function(columnName, $tr) {
            return $tr.find('td[columnName="' + columnName + '"]');
        },
        _getCellAddress: function($target) {
            return {
                rowKey: this._getRowKey($target),
                columnName: this._getColumnName($target)
            };
        }
    });

    View.Base.PluginInterface = View.Base.extend({
        $super: View.Base.PluginInterface,
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.$super.__plugin = this;
        },
        activate: function() {

        },
        render: function() {
            return this;
        },
        appendTo: function() {

        }
    });




