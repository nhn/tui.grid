    /**
     * @fileoverview Grid 에서 사용할 모든 Backbone 의 View, Model, Collection 의 Base 클래스 정의.
     * @author Soonyoung Park <soonyoung.park@nhnent.com>
     */


    /**
     * View 내부 관리용 객체 정의
     */
    var View = {
            CellFactory: null,
            /**
             * 그리드 레이아웃 정의
             */
            Layout: {},
            /**
             * 그리드 레이어 정의
             */
            Layer: {},
            /**
             * 그리드 Painter 클래스 정의
             */
            Painter: {
                Row: null,
                /**
                 * 그리드 Cell Painter 클래스 정의
                 */
                Cell: {}
            }
        };

    /**
     * Model 내부 관리용 객체 정의
     */
    var Model = {};

    /**
     * Data 내부 관리용 객체 정의
     */
    var Data = {};

    /**
     * Collection 내부 관리용 객체 정의
     */
    var Collection = {};

    /**
     * AddOn 내부 관리용 객체 정의
     */
    var AddOn = {};

    var setOwnProperties = function(properties) {
        _.each(properties, function(value, key) {
            this[key] = value;
        }, this);
    };
    /**
     * Model Base Class
     * @constructor Model.Base
     */
    Model.Base = Backbone.Model.extend(/**@lends Model.Base.prototype */{
        /**
         * 생성자 함수
         * @param {Object} attributes 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
         */
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });

        },
        /**
         * 내부 프로퍼티 설정
         * @param {Object} properties 할당할 프로퍼티 데이터
         */
        setOwnProperties: setOwnProperties
    });
    /**
     * Collection Base Class
     * @constructor Collection.Base
     */
    Collection.Base = Backbone.Collection.extend(/**@lends Collection.Base.prototype */{
        /**
         * 생성자 함수
         * @param {Array} models    콜랙션에 추가할 model 리스트
         * @param {Object} options   생성자의 option 객체. 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
         */
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
         * @param {Object} properties 할당할 프로퍼티 데이터
         */
        setOwnProperties: setOwnProperties
    });

    /**
     * View base class
     * @constructor View.Base
     */
    View.Base = Backbone.View.extend(/**@lends View.Base.prototype */{
        /**
         * 생성자 함수
         * @param {Object} attributes 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
         */
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid,
                _viewList: []
            });
        },
        /**
         * 에러 객체를 반환한다.
         * @param {String} message
         * @return {error} 에러객체
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
         * @param {Object} properties 할당할 프로퍼티 데이터
         */
        setOwnProperties: setOwnProperties,

        /**
         * 자식 View 를 생성할 때 사용하는 메서드
         * 스스로를 다시 rendering 하거나 소멸 될 때 내부에서 스스로 생성한 View instance 들도 메모리에서 제거하기 위함이다.
         *
         * @param {class} constructor   View 생성자
         * @param {object} params   생성자에 넘길 옵션 파라미터
         * @return {instance} instance    생성자를 통해 인스턴스화 한 객체
         */
        createView: function(constructor, params) {
            var instance = new constructor(params);
            this.addView(instance);
            return instance;
        },
        /**
         * destroy 시 함께 삭제할 View 를 내부 변수 _viewList 에 추가한다.
         * @param {instance} instance 인스턴스 객체
         * @return {instance} instance 인자로 전달받은 인스턴스 객체
         */
        addView: function(instance) {
            if (!this.hasOwnProperty('_viewList')) {
                this.setOwnProperties({
                    _viewList: []
                });
            }
            this._viewList.push(instance);
            return instance;
        },
        /**
         * 자식 View를 제거한 뒤 자신도 제거한다.
         */
        destroy: function() {
            this.stopListening();
            this.destroyChildren();
            this.remove();
        },
        /**
         * customEvent 에서 사용할 이벤트 객체를 포멧에 맞게 생성하여 반환한다.
         * @param {Object} data 이벤트 핸들러에 넘길 데이터
         * @return {{_isStopped: boolean, stop: function, param1: param1, param2: param2}} 생성된 커스텀 이벤트 객체
         */
        createEventData: function(data) {
            var eventData = $.extend({}, data);
            eventData.stop = function() {
                this._isStopped = true;
            };
            eventData.isStopped = function() {
                return this._isStopped;
            };
            eventData._isStopped = eventData._isStopped || false;
            return eventData;
        },
        /**
         * 등록되어있는 자식 View 들을 제거한다.
         */
        destroyChildren: function() {
            if (this._viewList instanceof Array) {
                while (this._viewList.length !== 0) {
                    this._viewList.pop().destroy();
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
     * @constructor View.Base.Painter
     */
    View.Base.Painter = View.Base.extend(/**@lends View.Base.Painter.prototype */{
        eventHandler: {},
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.initializeEventHandler();
        },
        /**
         * eventHandler 를 미리 parsing 하여 들고있는다.
         */
        initializeEventHandler: function() {
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
         * @param {jQuery} $el  이벤트를 바인딩할 엘리먼트
         */
        attachHandler: function($el) {
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
         * @param {jQuery} $el  이벤트를 바인딩할 엘리먼트
         */
        detachHandler: function($el) {
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
