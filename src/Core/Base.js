    /**
     * @fileoverview Grid 에서 사용할 모든 Backbone 의 View, Model, Collection 의 Base 클래스 정의.
     * @author Soonyoung Park <soonyoung.park@nhnent.com>
     */

    // IE 테스트용 코드. 개발 완료후 master 로 전환시 제거 함.
    if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};
    /**
     * 내부 관리용 객체 정의
     * @type {{CellFactory: null, Layout: {}, Layer: {}, Renderer: {Row: null, Cell: {}}}}
     */
    var View = {
            CellFactory: null,
            Layout: {},
            Layer: {},
            Painter: {
                Row: null,
                Cell: {}
            }
        },
        Model = {},
        Data = {},
        Collection = {},
        AddOn = {};
    var setOwnProperties = function(properties) {
        _.each(properties, function(value, key) {
            this[key] = value;
        }, this);
    };
    /**
     * Model Base Class
     * @constructor
     */
    Model.Base = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });

        },
        /**
         * 내부 프로퍼티 설정
         * @param {Object} properties
         */
        setOwnProperties: setOwnProperties
    });
    /**
     * Collection Base Class
     * @constructor
     */
    Collection.Base = Backbone.Collection.extend({
        initialize: function(models, options) {
            var grid = options && options.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });
        },
        /**
         * collection 내 model 들의 event listener 를 제거하고 메모리에서 해제한다.
         */
        clear: function() {
            this.each(function(model) {
                model.stopListening();
                model = null;
            });
            this.reset([], {silent: true});

            return this;
        },
        /**
         * 내부 프로퍼티 설정
         * @param {Object} properties
         */
        setOwnProperties: setOwnProperties
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
        /**
         * 에러 객체를 반환한다.
         * @param {String} message
         * @return {error}
         */
        error: function(message) {
            var error = function() {
                this.name = 'Grid Exception';
                this.message = message || 'error';
            };
            error.prototype = new Error();
            return new error();
        },
        /**
         * 내부 프로퍼티 설정
         * @param {Object} properties
         */
        setOwnProperties: setOwnProperties,

        /**
         * 자식 View 를 생성할 때 사용하는 메서드
         * 스스로를 다시 rendering 하거나 소멸 될 때 내부에서 스스로 생성한 View instance 들도 메모리에서 제거하기 위함이다.
         *
         * @param {class} klass
         * @param {object} params
         * @return {object} instance
         */
        createView: function(klass, params) {
            var instance = new klass(params);
            this.addView(instance);
            return instance;
        },
        /**
         * destroy 시 함께 삭제할 View 를 내부 변수 __viewList 에 추가한다.
         * @param {object} instance
         * @return {object} instance
         */
        addView: function(instance) {
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        /**
         * 자식 View를 제거한 뒤 자신도 제거한다.
         */
        destroy: function() {
            this.destroyChildren();
            this.remove();
        },
        /**
         * customEvent 에서 사용할 event 객체를 생성하여 반환한다..
         * @param {Object} data
         * @return {{_isStopped: boolean, stop: function ...}}
         */
        createEventData: function(data) {
            var eventData = $.extend({}, data);
            eventData.stop = function() {
                this._isStoped = true;
            };
            eventData.isStopped = function() {
                return this._isStoped;
            };
            eventData._isStoped = eventData._isStoped || false;
            return eventData;
        },
        /**
         * 등록되어있는 자식 View 들을 제거한다.
         */
        destroyChildren: function() {
            if (this.__viewList instanceof Array) {
                while (this.__viewList.length !== 0) {
                    this.__viewList.pop().destroy();
                }
            }
        }
    });
    /**
     * Drawer Base Class
     * - HTML Element 당 하나의 view 를 생성하면 성능이 좋지 않기 때문에 Drawer 라는 개념을 도입.
     * - 마크업 문자열을 생성하고 이벤트 핸들러를 attach, detach 하는 역할.
     * - backbone view 의 events 와 동일한 방식으로 evantHandler 라는 프로퍼티에 이벤트 핸들러를 정의한다.
     * @extends {View.Base}
     * @constructor
     */
    View.Base.Painter = View.Base.extend({
        eventHandler: {},
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        /**
         * eventHandler 를 미리 parsing 하여 들고있는다.
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
        /**
         * 인자로 받은 엘리먼트에 이벤트 핸들러를 할당한다.
         * @param {jQuery} $el
         * @private
         */
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
        /**
         * 인자로 받은 엘리먼트에 이벤트 핸들러를 제거한다.
         * @param {jQuery} $el
         * @private
         */
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
        /**
         * 렌더러에서 반환할 HTML 스트링
         * @return {String} html 스트링
         */
        getHtml: function() {
            throw this.error('implement getHtml() method');
        }
    });


