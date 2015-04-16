/*!grid v0.9.0 | NHN Entertainment*/
(function(){
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



/**
* @fileoverview 유틸리티 메서드 모음
* @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
*/
/**
* Util 모듈
* @type {{getAttributesString: Function, sum: Function, getHeight: Function, getDisplayRowCount: Function, getRowHeight: Function, isEqual: Function, stripTags: Function, getUniqueKey: Function, toQueryString: Function, toQueryObject: Function, convertValueType: Function}}
*/
var Util = {
    uniqueId: 0,
    /**
     * HTML Attribute 설정 시 필요한 문자열을 가공한다.
     * @param {{key:value}} attributes  문자열로 가공할 attribute 데이터
     * @return {string} html 마크업에 포함될 문자열
     * @example
     var str = Util.getAttributesString({
            'class': 'focused disabled',
            'width': '100',
            'height': '200'
      });

     =>
     class="focused disabled" width="100" height="200"
     */
    getAttributesString: function(attributes) {
        var str = '';
        _.each(attributes, function(value, key) {
            str += ' ' + key + '="' + value + '"';
        }, this);
        return str;
    },

    /**
     * 템플릿데이터에 객체의 데이터를 삽입해 스트링을 리턴한다.
     * 매핑데이터를 배열로 전달하면 갯수만큼 템플릿을 반복생성한다.
     * @param {string} template 템플릿 텍스트
     * @param {object|object[]} mapper 템플릿과 합성될 데이터
     * @return {Array}
     */
    template: function(template, mapper) {
        var totalReplaced = [],
            replaced;

        if(!ne.util.isArray(mapper)){
            mapper = [mapper];
        }

        ne.util.forEach(mapper, function(mapdata) {
            replaced = template.replace(/<%=([^%]+)%>/g, function(matchedString, name) {
                return mapdata[name] ? mapdata[name].toString() : '';
            });

            totalReplaced.push(replaced);
        });

        return totalReplaced;
    },
    /**
     * 배열의 합을 반환한다.
     * @param {number[]} list   총 합을 구할 number 타입 배열
     * @return {number} 합산한 결과값
     */
    sum: function(list) {
        return _.reduce(list, function(memo, value) {
            return memo += value;
        }, 0);
    },
    /**
     * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
     * @param {number} rowCount  행 개수
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 계산된 높이
     */
    getHeight: function(rowCount, rowHeight) {
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
    },
    /**
     *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
     *
     * @param {number} height 테이블 body 높이
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 테이블 body 당 보여지는 행 개수
     */
    getDisplayRowCount: function(height, rowHeight) {
        return Math.ceil((height - 1) / (rowHeight + 1));
    },
    /**
     * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
     *
     * @param {number} rowCount  행 개수
     * @param {number} height   테이블 body 높이
     * @return {number} 한 행당 높이값
     */
    getRowHeight: function(rowCount, height) {
        return rowCount === 0 ? 0 : Math.floor(((height - 1) / rowCount)) - 1;
    },

    /**
     * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
     * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지만 지원함.
     * @param {*} target    동등 비교할 target
     * @param {*} dist      동등 비교할 dist
     * @return {boolean}    동일한지 여부
     */
    isEqual: function(target, dist) {
        var isDiff,
            compareObject = function(target, dist) {
                var name,
                    result = true;
                /*
                    빠른 loop 탈출을 위해 ne.forEach 대신 for in 구문을 사용한다.
                    (추후 forEach 에 loop 탈출 기능이 추가되면 forEach 로 적용함.
                */
                for (name in target) {
                    if (target[name] !== dist[name]) {
                        result = false;
                        break;
                    }
                }
                return result;
            };
        if (typeof target !== typeof dist) {
            return false;
        } else if (ne.util.isArray(target) && target.length !== dist.length) {
            return false;
        } else if (typeof target === 'object') {
            isDiff = !compareObject(target, dist) || !compareObject(dist, target);
            return !isDiff;
        } else if (target !== dist) {
            return false;
        }
        return true;
    },
    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @param {string} htmlString   html 마크업 문자열
     * @return {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (ne.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(ne.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')));
        }
        return htmlString;
    },
    /**
     * Create unique key
     * @return {number} unique key 를 반환한다.
     */
    getUniqueKey: function() {
        return ++this.uniqueId;
    },
    /**
     * object 를 query string 으로 변경한다.
     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
     * @return {string} 변환된 쿼리 문자열
     */
    toQueryString: function(dataObj) {
        var queryList = [];

        ne.util.forEach(dataObj, function(value, name) {
            if (typeof value !== 'string' && typeof value !== 'number') {
                value = $.toJSON(value);
            }
            value = encodeURIComponent(value);
            queryList.push(name + '=' + value);
        }, this);
        return queryList.join('&');
    },
    /**
     * queryString 을 object 형태로 변형한다.
     * @param {String} queryString 쿼리 문자열
     * @return {Object} 변환한 Object
     */
    toQueryObject: function(queryString) {
        var queryList = queryString.split('&'),
            obj = {};

        ne.util.forEach(queryList, function(queryString) {
            var tmp = queryString.split('='),
                key,
                value;
            key = tmp[0];
            value = decodeURIComponent(tmp[1]);
            try {
                value = $.parseJSON(value);
            } catch (e) {}

            obj[key] = value;
        }, this);

        return obj;
    },
    /**
     * type 인자에 맞게 value type 을 convert 한다.
     * Data.Row 의 List 형태에서 editOption.list 에서 검색을 위해,
     * value type 해당 type 에 맞게 변환한다.
     * @param {*} value 컨버팅할 value
     * @param {String} type 컨버팅 될 타입
     * @return {*}  타입 컨버팅된 value
     */
    convertValueType: function(value, type) {
        if (type === 'string') {
            return value.toString();
        } else if (type === 'number') {
            return +value;
        } else {
            return value;
        }
    },
    /**
     * form 요소 설정
     */
    form: {
        /**
         * form 의 input 요소 값을 설정하기 위한 객체
         */
        setInput: {
            /**
             * 배열의 값들을 전부 String 타입으로 변환한다.
             * @private
             * @param {Array}  arr 변환할 배열
             * @return {Array} 변환된 배열 결과 값
             */
            _changeToStringInArray: function(arr) {
                ne.util.forEach(arr, function(value, i) {
                    arr[i] = String(value);
                }, this);
                return arr;
            },

            /**
             * radio type 의 input 요소의 값을 설정한다.
             * @param {HTMLElement} targetElement
             * @param {String} formValue
             */
            'radio': function(targetElement, formValue) {
                targetElement.checked = (targetElement.value === formValue);
            },

            /**
             * radio type 의 input 요소의 값을 설정한다.
             * @param {HTMLElement} targetElement
             * @param {String} formValue
             */
            'checkbox': function(targetElement, formValue) {
                if (ne.util.isArray(formValue)) {
                    targetElement.checked = $.inArray(targetElement.value, this._changeToStringInArray(formValue)) !== -1;
                } else {
                    targetElement.checked = (targetElement.value === formValue);
                }
            },

            /**
             * select-one type 의 input 요소의 값을 설정한다.
             * @param {HTMLElement} targetElement
             * @param {String} formValue
             */
            'select-one': function(targetElement, formValue) {
                var options = ne.util.toArray(targetElement.options),
                    index = -1;

                ne.util.forEach(options, function(targetOption, i) {
                    if (targetOption.value === formValue || targetOption.text === formValue) {
                        index = i;
                        return false;
                    }
                }, this);

                targetElement.selectedIndex = index;

            },

            /**
             * select-multiple type 의 input 요소의 값을 설정한다.
             * @param {HTMLElement} targetElement
             * @param {String|Array} formValue
             */
            'select-multiple': function(targetElement, formValue) {
                var options = ne.util.toArray(targetElement.options);

                if (ne.util.isArray(formValue)) {
                    formValue = this._changeToStringInArray(formValue);
                    ne.util.forEach(options, function(targetOption) {
                        targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                        $.inArray(targetOption.text, formValue) !== -1;
                    }, this);
                } else {
                    this['select-one'].apply(this, arguments);
                }
            },

            /**
             * input 요소의 값을 설정하는 default 로직
             * @param {HTMLElement} targetElement
             * @param {String} formValue
             */
            'defaultAction': function(targetElement, formValue) {
                targetElement.value = formValue;
            }
        },

        /**
         * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
         **/
        getFormData: function($form) {
            var result = {},
                valueList = $form.serializeArray();

            ne.util.forEach(valueList, function(obj) {
                var value = obj.value,
                    name = obj.name;
                if (ne.util.isExisty(result[name])) {
                    if (!result[name].push) {
                        result[name] = [result[name]];
                    }
                    result[name].push(value || '');
                } else {
                    result[name] = value || '';
                }
            }, this);

            return result;
        },

        /**
         * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
         * @method getFormElement
         * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
         * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
         */
        getFormElement: function($form, elementName) {
            var formElement;
            if ($form && $form.length) {
                if (elementName) {
                    formElement = $form.prop('elements')[elementName + ''];
                } else {
                    formElement = $form.prop('elements');
                }
            }
            return $(formElement);
        },

        /**
         * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
         *
         * @method setFormData
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {Object} formData 폼에 설정할 폼 데이터 객체
         **/
        setFormData: function($form, formData) {
            ne.util.forEachOwnProperties(formData, function(value, property) {
                this.setFormElementValue($form, property, value);
            }, this);
        },

        /**
         * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
         * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
         * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
         **/
        setFormElementValue: function($form, elementName, formValue) {
            var type,
                elementList = this.getFormElement($form, elementName);

            if (!elementList) {
                return;
            }
            if (!ne.util.isArray(formValue)) {
                formValue = String(formValue);
            }
            elementList = ne.util.isHTMLTag(elementList) ? [elementList] : elementList;
            elementList = ne.util.toArray(elementList);
            ne.util.forEach(elementList, function(targetElement) {
                type = this.setInput[targetElement.type] ? targetElement.type : 'defaultAction';
                this.setInput[type](targetElement, formValue);
            }, this);
        },

        /**
         * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
         * @param {HTMLElement} target HTML input 엘리먼트
         */
        setCursorToEnd: function(target) {
            target.focus();
            var length = target.value.length;

            if (target.setSelectionRange) {
                target.setSelectionRange(length, length);
            } else if (target.createTextRange) {
                var range = target.createTextRange();
                range.collapse(true);
                range.moveEnd('character', length);
                range.moveStart('character', length);
                range.select();
            }
        }
    }
};

/**
 * @fileoverview 컬럼 모델
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * 컬럼 모델 데이터를 다루는 객체
     * @constructor Data.ColumnModel
     */
    Data.ColumnModel = Model.Base.extend(/**@lends Data.ColumnModel.prototype */{
        defaults: {
            keyColumnName: null,
            columnFixIndex: 0,  //columnFixIndex
            columnModelList: [],
            visibleList: [],
            hasNumberColumn: true,
            selectType: '',
            columnModelMap: {},
            relationListMap: {}
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.textType = {
                'normal': true,
                'text': true,
                'text-password': true,
                'text-convertible': true
            };
            this._setColumnModelList(this.get('columnModelList'), this.get('columnFixIndex'));
            this.on('change', this._onChange, this);
        },

        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 number column 을 추가한다.
         * @param {Array} columnModelList   컬럼모델 배열
         * @return {Array}  _number 컬럼이 추가된 컬럼모델 배열
         * @private
         */
        _initializeNumberColumn: function(columnModelList) {
            var hasNumberColumn = this.get('hasNumberColumn'),
                numberColumn = {
                    columnName: '_number',
                    title: 'No.',
                    width: 60
                };
            if (!hasNumberColumn) {
                numberColumn.isHidden = true;
            }

            columnModelList = this._extendColumn(numberColumn, columnModelList);
            return columnModelList;
        },
        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 button column 을 추가한다.
         * @param {Array} columnModelList 컬럼모델 배열
         * @return {Array} _button 컬럼이 추가된 컬럼모델 배열
         * @private
         */
        _initializeButtonColumn: function(columnModelList) {
            var selectType = this.get('selectType'),
                buttonColumn = {
                    columnName: '_button',
                    editOption: {
                        type: selectType,
                        list: [{
                            value: 'selected'
                        }]
                    },
                    width: 50
                };

            if (selectType === 'checkbox') {
                buttonColumn.title = '<input type="checkbox"/>';
            } else if (selectType === 'radio') {
                buttonColumn.title = '선택';
            } else {
                buttonColumn.isHidden = true;
            }

            columnModelList = this._extendColumn(buttonColumn, columnModelList);

            return columnModelList;
        },
        /**
         * column 을 prepend 한다.
         * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
         * - _number, _button 컬럼 초기화시 사용함.
         * @param {object} columnObj    prepend 할 컬럼모델
         * @param {Array} columnModelList   컬럼모델 배열
         * @return {Array} 확장한 결과 컬럼모델 배열
         * @private
         */
        _extendColumn: function(columnObj, columnModelList) {
            var index;
            if (!ne.util.isUndefined(columnObj) && !ne.util.isUndefined(columnObj['columnName'])) {
                index = this._indexOfColumnName(columnObj['columnName'], columnModelList);
                if (index === -1) {
                    columnModelList = _.union([columnObj], columnModelList);
                } else {
                    columnModelList[index] = $.extend(columnModelList[index], columnObj);
                }
            }
            return columnModelList;
        },
        /**
         * index 에 해당하는 columnModel 을 반환한다.
         * @param {Number} index    조회할 컬럼모델의 인덱스 값
         * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
         * @return {object} 조회한 컬럼 모델
         */
        at: function(index, isVisible) {
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return columnModelList[index];
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName   컬럼명
         * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
         * @return {number} index   컬럼명에 해당하는 인덱스 값
         */
        indexOfColumnName: function(columnName, isVisible) {
            isVisible = (isVisible === undefined) ? true : isVisible;
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return this._indexOfColumnName(columnName, columnModelList);
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * - columnModel 이 내부에 세팅되기 전에 button, number column 을 추가할 때만 사용됨.
         * @param {string} columnName   컬럼명
         * @param {Array} columnModelList   컬럼모델 배열
         * @return {number} 컬럼명에 해당하는 인덱스 값
         * @private
         */
        _indexOfColumnName: function(columnName, columnModelList) {
            var i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * columnName 이 열고정 영역에 있는 column 인지 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
         */
        isLside: function(columnName) {
            var index = this.indexOfColumnName(columnName, true);
            if (index < 0) {
                return false;
            } else {
                return this.get('columnFixIndex') > index;
            }
        },
        /**
         * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
         * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList 를 반환한다.
         * @return {Array}  조회한 컬럼모델 배열
         */
        getVisibleColumnModelList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get('columnFixIndex');

            if (whichSide === 'L') {
                columnModelList = this.get('visibleList').slice(0, columnFixIndex);
            } else if (whichSide === 'R') {
                columnModelList = this.get('visibleList').slice(columnFixIndex);
            } else {
                columnModelList = this.get('visibleList');
            }

            return columnModelList;
        },
        /**
         * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Object} 컬럼명에 해당하는 컬럼모델
         */
        getColumnModel: function(columnName) {
            return this.get('columnModelMap')[columnName];
        },
        /**
         * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
         * 랜더링시 html 태그 문자열을 제거할때 사용됨.
         * @param {String} columnName 컬럼명
         * @return {boolean} text 타입인지 여부
         */
        isTextType: function(columnName) {
            return !!this.textType[this.getEditType(columnName)];
        },
        /**
         * 컬럼 모델로부터 editType 을 반환한다.
         * @param {string} columnName
         * @return {string} 해당하는 columnName 의 editType 을 반환한다.
         */
        getEditType: function(columnName) {
            var columnModel = this.getColumnModel(columnName),
                editType = 'normal';
            if (columnName === '_button' || columnName === '_number') {
                editType = columnName;
            } else if (columnModel && columnModel['editOption'] && columnModel['editOption']['type']) {
                editType = columnModel['editOption']['type'];
            }
            return editType;
        },
        /**
         * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
         * @param {Array} columnModelList   컬럼모델 배열
         * @return {Array}  isHidden 이 설정되지 않은 컬럼모델 배열
         * @private
         */
        _getVisibleList: function(columnModelList) {
            return _.filter(columnModelList, function(item) {return !item['isHidden'];});
        },
        /**
         * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
         * @return {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
         * @private
         */
        _getRelationListMap: function(columnModelList) {
            var columnName,
                relationListMap = {};

            ne.util.forEachArray(columnModelList, function(columnModel) {
                columnName = columnModel['columnName'];
                if (columnModel.relationList) {
                    relationListMap[columnName] = columnModel.relationList;
                }
            });
            return relationListMap;

        },
        /**
         * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.
         * @return {Array} isIgnore 가 true 로 설정된 columnName 배열.
         */
        getIngoredColumnNameList: function() {
            var columnModelLsit = this.get('columnModelList'),
                ignoreColumnNameList = [];
            _.each(columnModelLsit, function(columnModel) {
                if (columnModel.isIgnore) {
                    ignoreColumnNameList.push(columnModel['columnName']);
                }
            });
            return ignoreColumnNameList;
        },
        /**
         * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
         * 열고정 영역 기준으로 partition 으로 나뉜 visible list 등 내부적으로 사용할 부가정보를 가공하여 저장한다.
         * @param {Array} columnModelList   컬럼모델 배열
         * @param {Number} columnFixIndex   열고정 인덱스
         * @private
         */
        _setColumnModelList: function(columnModelList, columnFixIndex) {
            columnModelList = $.extend(true, [], columnModelList);
            columnModelList = this._initializeNumberColumn(this._initializeButtonColumn(columnModelList));

            var visibleList = this._getVisibleList(columnModelList);

            this.set({
                columnModelList: columnModelList,
                columnModelMap: _.indexBy(columnModelList, 'columnName'),
                relationListMap: this._getRelationListMap(columnModelList),
                columnFixIndex: columnFixIndex,
                visibleList: visibleList
            }, {silent: true});
            this.trigger('columnModelChange');
        },
        /**
         * change 이벤트 발생시 핸들러
         * @param {Object} model change 이벤트가 발생한 model 객체
         * @private
         */
        _onChange: function(model) {
            var changed = model.changed,
                columnModelList = changed['columnModelList'] || this.get('columnModelList'),
                columnFixIndex = changed['columnFixIndex'] ? changed['columnFixIndex'] : this.get('columnFixIndex');

            this._setColumnModelList(columnModelList, columnFixIndex);
        }

    });

    /**
     * @fileoverview Grid 의 Data Source 에 해당하는 Collection 과 Model 정의
     * @author Soonyoung Park <soonyoung.park@nhnent.com>
     */
    /**
     * Data 중 각 행의 데이터 모델 (DataSource)
     * @constructor Data.Row
     */
    Data.Row = Model.Base.extend(/**@lends Data.Row.prototype */{
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null
            }
        },

        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 반환한다.
         * @return {{isDisabled: boolean, isDisabledCheck: boolean}} rowState 정보
         * @private
         */
        getRowState: function() {
            var extraData = this.get('_extraData'),
                rowState = extraData && extraData['rowState'],
                isDisabledCheck = false,
                isDisabled = false,
                isChecked = false;

            if (rowState === 'DISABLED') {
                isDisabled = true;
            } else if (rowState === 'DISABLED_CHECK') {
                isDisabledCheck = true;
            } else if (rowState === 'CHECKED') {
                isChecked = true;
            }

            isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;

            return {
                isDisabled: isDisabled,
                isDisabledCheck: isDisabledCheck,
                isChecked: isChecked
            };
        },
        /**
         * row의 extraData에 설정된 classNameList 를 반환한다.
         * @param {String} [columnName] columnName 이 없을 경우 row 에 정의된 className 만 반환한다.
         * @return {Array} css 클래스 이름의 배열
         */
        getClassNameList: function(columnName) {
            var classNameList = [],
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                extraData = this.get('_extraData'),
                classNameObj = extraData.className,
                rowClassNameList = (classNameObj && classNameObj['row']) ? classNameObj['row'] : [], //_extraData 의 row 에 할당된 className 을 담는다.
                columnClassNameList = (classNameObj && classNameObj['column'] && classNameObj['column'][columnName]) ? classNameObj['column'][columnName] : [], //_extraData 의 column 에 할당된 className 을 담는다.
                tmpList,
                classNameMap = {},
                columnModelClassNameList = []; //columnModel 에 할당된 className 리스트

            if (columnModel.className) {
                columnModelClassNameList.push(columnModel.className);
            }
            if (columnModel.isEllipsis) {
                columnModelClassNameList.push('ellipsis');
            }

            tmpList = [classNameList, rowClassNameList, columnClassNameList, columnModelClassNameList];

            ne.util.forEachArray(tmpList, function(list) {
                ne.util.forEachArray(list, function(item) {
                    var sliced = item.slice(' ');
                    if (ne.util.isArray(sliced)) {
                        ne.util.forEachArray(sliced, function (className) {
                            classNameMap[className] = true;
                        });
                    } else {
                        classNameMap[item] = true;
                    }
                });
            });

            ne.util.forEach(classNameMap, function(value, className) {
                classNameList.push(className);
            });
            //classNameList = _.union(classNameList, rowClassNameList, columnClassNameList, columnModelClassNameList);
            return classNameList;
        },
        /**
         * columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {{isEditable: boolean, isDisabled: boolean}} 편집 가능여부와 disabled 상태 정보
         */
        getCellState: function(columnName) {
            var notEditableTypeList = ['_number', 'normal'],
                columnModel = this.grid.columnModel,
                isDisabled = false,
                isEditable = true,
                editType = columnModel.getEditType(columnName),
                rowState, relationResult;


            relationResult = this.getRelationResult(['isDisabled', 'isEditable'])[columnName];
            rowState = this.getRowState();

            if (columnName === '_button') {
                isDisabled = rowState.isDisabledCheck;
            } else {
                isDisabled = rowState.isDisabled;
            }
            isDisabled = isDisabled || !!(relationResult && relationResult['isDisabled']);

            if ($.inArray(editType, notEditableTypeList) !== -1) {
                isEditable = false;
            } else {
                isEditable = !(relationResult && relationResult['isEditable'] === false);
            }

            return {
                isEditable: isEditable,
                isDisabled: isDisabled
            };
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Boolean}    편집 가능한지 여부
         */
        isEditable: function(columnName) {
            var notEditableTypeList = ['_number', 'normal'],
                editType, cellState;

            editType = this.grid.columnModel.getEditType(columnName);

            if ($.inArray(editType, notEditableTypeList) !== -1) {
                return false;
            } else {
                cellState = this.getCellState(columnName);
                return cellState.isEditable;
            }
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 disable 상태인지 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Boolean}    disabled 처리를 할지 여부
         */
        isDisabled: function(columnName) {
            var cellState;
            cellState = this.getCellState(columnName);
            return cellState.isDisabled;
        },
        /**
         * getRowSpanData
         *
         * rowSpan 설정값을 반환한다.
         * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData');
            if (this.collection.isRowSpanEnable()) {
                if (!columnName) {
                    return extraData['rowSpanData'];
                } else {
                    extraData = this.get('_extraData');
                    if (extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName]) {
                        return extraData['rowSpanData'][columnName];
                    }
                }
            } else {
                if (!columnName) {
                    return null;
                }
            }
            return {
                count: 0,
                isMainRow: true,
                mainRowKey: this.get('rowKey')
            };


        },
        /**
         * html string 을 encoding 한다.
         * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
         *
         * @param {String} columnName   컬럼명
         * @return {String} 인코딩된 결과값
         * @private
         */
        getHTMLEncodedString: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                isTextType = this.grid.columnModel.isTextType(columnName),
                value = this.get(columnName),
                notUseHtmlEntity = columnModel.notUseHtmlEntity;
            if (!notUseHtmlEntity && isTextType && ne.util.hasEncodableString(value)) {
                value = ne.util.encodeHTMLEntity(value);
            }
            return value;
        },

        /**
         * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
         * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
         * text 로 전환해서 반환할 때 처리를 하여 변환한다.
         *
         * @param {String} columnName   컬럼명
         * @return {String} text 형태로 가공된 문자열
         * @private
         */
        _getListTypeVisibleText: function(columnName) {
            var value = this.get(columnName),
                columnModel = this.grid.columnModel.getColumnModel(columnName);

            if (ne.util.isExisty(ne.util.pick(columnModel, 'editOption', 'list'))) {
                var resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                    editOptionList = resultOptionList && resultOptionList['optionList'] ?
                        resultOptionList['optionList'] : columnModel.editOption.list,
                    typeExpected, valueList;

                typeExpected = typeof editOptionList[0].value;
                valueList = value.toString().split(',');
                if (typeExpected !== typeof valueList[0]) {
                    valueList = _.map(valueList, function(val) {
                        return Util.convertValueType(val, typeExpected);
                    });
                }
                _.each(valueList, function(val, index) {
                    var item = _.findWhere(editOptionList, {value: val});
                    valueList[index] = item && item.text || '';
                }, this);

                return valueList.join(',');
            }
        },
        /**
         * 복사 기능을 사용할 때 화면에 보여지는 데이터를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {String} 화면에 보여지는 데이터로 가공된 문자열
         */
        getVisibleText: function(columnName) {
            var columnModel = this.grid.columnModel,
                value = this.get(columnName),
                editType, model,
                listTypeMap = {
                    'select': true,
                    'radio': true,
                    'checkbox': true
                };

            if (columnModel) {
                editType = columnModel.getEditType(columnName);
                model = columnModel.getColumnModel(columnName);
                //list type 의 editType 이 존재하는 경우
                if (listTypeMap[editType]) {
                    if (ne.util.isExisty(ne.util.pick(model, 'editOption', 'list', 0, 'value'))) {
                        value = this._getListTypeVisibleText(columnName);
                    } else {
                        throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (_.isFunction(model.formatter)) {
                        value = Util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
                    }
                }
            }
            value = !ne.util.isUndefined(value) ? value.toString() : value;
            return value;
        },
        /**
         * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisabled', 'isEditable'])
         * @return {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = (callbackNameList && callbackNameList.length) ?
                callbackNameList : ['optionListChange', 'isDisabled', 'isEditable'];
            var callback, attribute, targetColumnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.attributes,
                relationListMap = this.grid.columnModel.get('relationListMap'),
                relationResult = {},
                rowState = this.getRowState();

            //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
            // relationListMap 구조 {columnName : relationList}
            _.each(relationListMap, function(relationList, columnName) {
                value = rowData[columnName];
                //relationList 를 순회하며 수행한다.
                _.each(relationList, function(relation) {
                    targetColumnList = relation.columnList;

                    //각 relation 에 걸려있는 콜백들을 수행한다.
                    _.each(callbackNameList, function(callbackName) {
                        //isDisabled relation 의 경우 rowState 설정 값을 우선적으로 선택한다.
                        if (!(rowState.isDisabled && callbackName === 'isDisabled')) {
                            callback = relation[callbackName];
                            if (typeof callback === 'function') {
                                attribute = '';
                                if (callbackName === 'optionListChange') {
                                    attribute = 'optionList';
                                } else if (callbackName === 'isDisabled') {
                                    attribute = 'isDisabled';
                                } else if (callbackName === 'isEditable') {
                                    attribute = 'isEditable';
                                }
                                if (attribute) {
                                    //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                    _.each(targetColumnList, function(targetColumnName) {
                                        relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                        relationResult[targetColumnName][attribute] = callback(value, rowData);
                                    }, this);
                                }
                            }
                        }
                    }, this);
                }, this);
            }, this);
            return relationResult;
        }
    });

    /**
     * Raw 데이터 RowList 콜렉션. (DataSource)
     * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
     *
     * @constructor Data.RowList
     */
    Data.RowList = Collection.Base.extend(/**@lends Data.RowList.prototype */{
        model: Data.Row,
        /**
         * 생성자 함수
         * @param {Array} models    콜랙션에 추가할 model 리스트
         * @param {Object} options   생성자의 option 객체
         */
        initialize: function(models, options) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                sortKey: 'rowKey',
                originalRowList: [],
                originalRowMap: {},
                startIndex: options.startIndex || 1,
                privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.on('change', this._onChange, this);
        },
        /**
         * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
         * @param {Array} data  원본 데이터
         * @return {Array}  파싱하여 가공된 데이터
         */
        parse: function(data) {
            data = data && data['contents'] || data;
            return this._formatData(data);
        },
        /**
         * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
         * _extraData 필드에 rowSpanData 를 추가한다.
         * @param {Array} data  가공할 데이터
         * @return {Array} 가공된 데이터
         * @private
         */
        _formatData: function(data) {
            var rowList = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName');

            _.each(rowList, function(row, i) {
                rowList[i] = this._baseFormat(rowList[i], i);
                if (this.isRowSpanEnable()) {
                    this._setExtraRowSpanData(rowList, i);
                }
            }, this);

            return rowList;
        },
        /**
         * row 를 기본 포멧으로 wrapping 한다.
         * 추가적으로 rowKey 를 할당하고, rowState 에 따라 checkbox 의 값을 할당한다.
         *
         * @param {object} row  대상 row 데이터
         * @param {number} index    해당 row 의 인덱스 정보. rowKey 를 자동 생성할 경우 사용된다.
         * @return {object} 가공된 row 데이터
         * @private
         */
        _baseFormat: function(row, index) {
            var defaultExtraData = {
                    rowSpan: null,
                    rowSpanData: null,
                    rowState: null
                },
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                rowKey = (keyColumnName === null) ? index : row[keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성

            row['_extraData'] = $.extend(defaultExtraData, row['_extraData']);
            row['_button'] = (row['_extraData']['rowState'] === 'CHECKED');
            row['rowKey'] = rowKey;
            return row;
        },
        /**
         * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
         * @param {Array} rowList   전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
         * @param {number} index    해당 배열에서 extraData 를 설정할 배열
         * @return {Array} rowList  가공된 rowList
         * @private
         */
        _setExtraRowSpanData: function(rowList, index) {
            function hasRowSpanData(row, columnName) {
                var extraData = row['_extraData'];
                return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
            }
            function setRowSpanData(row, columnName, rowSpanData) {
                var extraData = row['_extraData'];
                extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
                extraData['rowSpanData'][columnName] = rowSpanData;
                return extraData;
            }

            var row = rowList[index],
                rowSpan = row && row['_extraData'] && row['_extraData']['rowSpan'],
                rowKey = row && row['rowKey'],
                subCount,
                childRow,
                i;

            if (rowSpan) {
                _.each(rowSpan, function(count, columnName) {
                    if (!hasRowSpanData(row, columnName)) {
                        setRowSpanData(row, columnName, {
                            count: count,
                            isMainRow: true,
                            mainRowKey: rowKey
                        });
                        //rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
                        subCount = -1;
                        for (i = index + 1; i < index + count; i++) {
                            childRow = rowList[i];
                            childRow[columnName] = row[columnName];
                            childRow['_extraData'] = childRow['_extraData'] || {};
                            setRowSpanData(childRow, columnName, {
                                count: subCount--,
                                isMainRow: false,
                                mainRowKey: rowKey
                            });
                        }
                    }
                });
            }
            return rowList;
        },
        /**
         * originalRowList 와 originalRowMap 을 생성한다.
         * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRowList 로 저장한다.
         * @return {Array} format 을 거친 데이터 리스트.
         */
        setOriginalRowList: function(rowList) {
            this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
            this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
            return this.originalRowList;
        },
        /**
         * 원본 데이터 리스트를 반환한다.
         * @param {boolean} [isClone=true]  데이터 복제 여부.
         * @return {Array}  원본 데이터 리스트 배열.
         */
        getOriginalRowList: function(isClone) {
            isClone = isClone === undefined ? true : isClone;
            return isClone ? _.clone(this.originalRowList) : this.originalRowList;
        },
        /**
         * 원본 row 데이터를 반환한다.
         * @param {(Number|String)} rowKey  데이터의 키값
         * @return {Object} 해당 행의 원본 데이터값
         */
        getOriginalRow: function(rowKey) {
            return _.clone(this.originalRowMap[rowKey]);
        },
        /**
         * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
         * @param {(Number|String)} rowKey  데이터의 키값
         * @param {String} columnName   컬럼명
         * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
         */
        getOriginal: function(rowKey, columnName) {
            return _.clone(this.originalRowMap[rowKey][columnName]);
        },
        /**
         * mainRowKey 를 반환한다.
         * @param {(Number|String)} rowKey  데이터의 키값
         * @param {String} columnName   컬럼명
         * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
         */
        getMainRowKey: function(rowKey, columnName) {
            var row = this.get(rowKey),
                rowSpanData;
            if (this.isRowSpanEnable()) {
                rowSpanData = row && row.getRowSpanData(columnName);
                rowKey = rowSpanData ? rowSpanData.mainRowKey : rowKey;
            }
            return rowKey;
        },
        /**
         * rowKey 에 해당하는 index를 반환한다.
         * @param {(Number|String)} rowKey 데이터의 키값
         * @return {Number} 키값에 해당하는 row의 인덱스
         */
        indexOfRowKey: function(rowKey) {
            return this.indexOf(this.get(rowKey));
        },
        /**
         * rowData 의 프로퍼티 중 내부에서 사용하는 프로퍼티인지 여부를 반환한다.
         * - 서버로 전송 시 내부에서 사용하는 데이터 제거시 사용 됨
         * @param {String} name 확인할 프로퍼티 명
         * @return {boolean}    private 프로퍼티인지 여부.
         * @private
         */
        _isPrivateProperty: function(name) {
            return $.inArray(name, this.privateProperties) !== -1;
        },
        /**
         * rowSpan 이 적용되어야 하는지 여부를 반환한다.
         * 랜더링시 사용된다.
         * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
         * @return {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
         */
        isRowSpanEnable: function() {
            return !this.isSortedByField();
        },
        /**
         * 현재 정렬된 상태인지 여부를 반환한다.
         * @return {Boolean}    정렬된 상태인지 여부
         */
        isSortedByField: function() {
            return this.sortKey !== 'rowKey';
        },
        /**
         * sorting 한다.
         * @param {string} fieldName 정렬할 column 의 이름
         */
        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
        },

        /**
         * rowList 를 반환한다.
         * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         */
        getRowList: function(isOnlyChecked, isRaw) {
            var rowList,
                checkedRowList;
            if (isOnlyChecked) {
                checkedRowList = this.where({
                    '_button' : true
                });
                rowList = [];
                _.each(checkedRowList, function(checkedRow) {
                    rowList.push(checkedRow.attributes);
                }, this);
            } else {
                rowList = this.toJSON();
            }
            return isRaw ? rowList : this._removePrivateProp(rowList);
        },
        /**
         * rowData 변경 이벤트 핸들러.
         * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
         * @param {object} row  데이터의 키값
         * @private
         */
        _onChange: function(row) {
            var columnModel;

            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) {
                        return;
                    }
                    //beforeCallback 의 결과가 false 이면 모든 수행을 중지한다.
                    if (!this._executeChangeBeforeCallback(row, columnName)) {
                        return;
                    }
                    this._syncRowSpannedData(row, columnName, value);

                    //afterChangeCallback 수행
                    this._executeChangeAfterCallback(row, columnName);

                    //check 가 disable 이 아니고, columnModel 에 isIgnore 가 설정되지 않았을 경우, _button 필드 변경에 따라 check
                    if (!row.getRowState().isDisabledCheck && !columnModel.isIgnore) {
                        row.set('_button', true);
                    }
                }
            }, this);
        },
        /**
         * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
         * rowSpan 된 데이터들도 함께 update 한다.
         *
         * @param {object} row row 모델
         * @param {String} columnName   변경이 발생한 컬럼명
         * @param {(String|Number)} value 변경된 값
         * @private
         */
        _syncRowSpannedData: function(row, columnName, value) {
            var index,
                rowSpanData,
                i;

            //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
            if (this.isRowSpanEnable()) {
                rowSpanData = row.getRowSpanData(columnName);
                if (!rowSpanData['isMainRow']) {
                    this.get(rowSpanData['mainRowKey']).set(columnName, value);
                } else {
                    index = this.indexOfRowKey(row.get('rowKey'));
                    for (i = 0; i < rowSpanData['count'] - 1; i++) {
                        this.at(i + 1 + index).set(columnName, value);
                    }
                }
            }
        },
        /**
         * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
         * @param {object} row row 모델
         * @param {String} columnName 컬럼명
         * @return {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}} changeCallback 에 전달될 이벤트 객체
         * @private
         */
        _createChangeCallbackEvent: function(row, columnName) {
            return {
                'rowKey' : row.get('rowKey'),
                'columnName' : columnName,
                'value' : row.get(columnName),
                'instance': this.grid.publicInstance
            };
        },
        /**
         * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
         * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
         *
         * @param {object} row row 모델
         * @param {String} columnName   컬럼명
         * @return {boolean} changeBeforeCallback 수행 결과값
         * @private
         */
        _executeChangeBeforeCallback: function(row, columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                changeEvent,
                obj;
            if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
                changeEvent = this._createChangeCallbackEvent(row, columnName);
                //beforeChangeCallback 의 결과값이 false 라면 restore 후 false 를 반환한다.
                if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                    obj = {};
                    obj[columnName] = row.previous(columnName);
                    row.set(obj);
                    row.trigger('restore', {
                        changed: obj
                    });
                    return false;
                }
            }
            return true;
        },
        /**
         * columnModel 에 정의된 changeAfterCallback 을 수행한다.
         *
         * @param {object} row row 모델
         * @param {String} columnName
         * @return {boolean} changeAfterCallback 수행 결과값
         * @private
         */
        _executeChangeAfterCallback: function(row, columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                changeEvent;
            //afterChangeCallback 수행
            if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                changeEvent = this._createChangeCallbackEvent(row, columnName);
                return !!(columnModel.editOption.changeAfterCallback(changeEvent));
            }
            return true;
        },

        /**
         * Backbone 에서 sort 연산을 위해 구현되어야 하는 interface
         * @param {object} row row 모델
         * @return {number}
         */
        comparator: function(row) {
            if (this.isSortedByField()) {
                return +row.get(this.sortKey);
            }
        },
        /**
         * row 의 extraData 를 변경한다.
         * -Backbone 내부적으로 참조형 데이터의 프로퍼티 변경시 변화를 감지하지 못하므로, 데이터를 복제하여 변경 후 set 한다.
         *
         * @param {(Number|String)} rowKey  데이터의 키값
         * @param {Object} value    extraData 에 설정될 값
         * @param {Boolean} [silent=false] Backbone 의 'change' 이벤트 발생 여부
         * @return {boolean} rowKey 에 해당하는 데이터가 존재하는지 여부.
         */
        setExtraData: function(rowKey, value, silent) {
            var row = this.get(rowKey),
                obj = {},
                extraData;

            if (row) {
                //적용
                extraData = $.extend(true, {}, row.get('_extraData'));
                extraData = $.extend(true, extraData, value);
                obj['_extraData'] = extraData;
                row.set(obj, {
                    silent: silent
                });
                return true;
            } else {
                return false;
            }
        },
        /**
         * rowState 를 설정한다.
         * @param {(Number|String)} rowKey 데이터의 키값
         * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
         * @param {boolean} silent 내부 change 이벤트 발생 여부
         */
        setRowState: function(rowKey, rowState, silent) {
            this.setExtraData(rowKey, {rowState: rowState}, silent);
        },
        /**
         * rowKey 에 해당하는 _extraData 를 복제하여 반환한다.
         * @param {(Number|String)} rowKey  데이터의 키값
         * @return {object} 조회한 rowKey 에 해당하는 extraData 사본
         * @private
         */
        _getExtraDataClone: function(rowKey) {
            var row = this.get(rowKey),
                extraData;

            if (row) {
                extraData = $.extend(true, {}, row.get('_extraData'));
                return extraData;
            }
        },
        /**
         * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
         * @param {Array} classNameList 디자인 클래스명 리스트
         * @param {String} className    제거할 클래스명
         * @return {Array}  제거된 디자인 클래스명 리스트
         * @private
         */
        _removeClassNameFromArray: function(classNameList, className) {
            //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
            var classNameString = classNameList.join(' ');
            classNameList = classNameString.split(' ');
            return _.without(classNameList, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        removeCellClassName: function(rowKey, columnName, className) {
            var extraData = this._getExtraDataClone(rowKey),
                row = this.get(rowKey),
                classNameData;

            if (ne.util.isExisty(ne.util.pick(extraData, 'className', 'column', columnName))) {
                classNameData = extraData.className;
                classNameData.column[columnName] = this._removeClassNameFromArray(classNameData.column[columnName], className);
                row.set('_extraData', extraData);
            }
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        removeRowClassName: function(rowKey, className) {
            var extraData = this._getExtraDataClone(rowKey),
                row = this.get(rowKey),
                classNameData;

            if (ne.util.isExisty(extraData, 'className.row')) {
                classNameData = extraData.className;
                classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
                //배열 제거이기 때문에 deep extend 를 하는 setExtraData 를 호출하면 삭제가 반영되지 않는다.
                row.set('_extraData', extraData);
            }
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        addCellClassName: function(rowKey, columnName, className) {
            var extraData = this._getExtraDataClone(rowKey),
                classNameData,
                classNameList;

            if (!ne.util.isUndefined(extraData)) {
                classNameData = extraData.className || {};
                classNameData.column = classNameData.column || {};
                classNameList = classNameData.column[columnName] || [];
                classNameList.push(className);
                classNameData.column[columnName] = classNameList;
                this.setExtraData(rowKey, {className: classNameData});
            }
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        addRowClassName: function(rowKey, className) {
            var extraData = this._getExtraDataClone(rowKey),
                classNameData,
                classNameList;

            if (!ne.util.isUndefined(extraData)) {
                classNameData = extraData.className || {};
                classNameList = classNameData.row || [];
                classNameList.push(className);
                classNameData.row = classNameList;
                this.setExtraData(rowKey, {className: classNameData});
            }
        },
        /**
         * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
         * @param {Array} rowList   내부에 설정된 rowList 배열
         * @return {Array}  private 프로퍼티를 제거한 결과값
         * @private
         */
        _removePrivateProp: function(rowList) {
            var obj,
                filteredRowList = [];

            _.each(rowList, function(row) {
                obj = {};
                //_로 시작하는 property 들은 제거한다.
                _.each(row, function(value, key) {
                    if (!this._isPrivateProperty(key)) {
                        obj[key] = value;
                    }
                }, this);
                filteredRowList.push(obj);
            }, this);

            return filteredRowList;
        },
        /**
         * rowKey 에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 삭제 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            var row = this.get(rowKey);
            if (row) {
                this.remove(row);
                if (isRemoveOriginalData) {
                    this.setOriginalRowList();
                }
            }
        },
        /**
         * append, prepend 시 사용할 dummy row를 생성한다.
         * @return {Object} 값이 비어있는 더미 row 데이터
         * @private
         */
        _createDummyRow: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList'),
                data = {};
            _.each(columnModelList, function(columnModel) {
                data[columnModel['columnName']] = '';
            }, this);
            return data;
        },
        /**
         * 현재 rowList 중 at 에 해당하는 인덱스에 데이터를 append 한다.
         * @param {Object|Array} rowData Array 형태일 경우 여러 줄의 row 를 append 한다.
         * @param {number} [at=this.length] 데이터를 append 할 index
         */
        append: function(rowData, at) {
            at = at !== undefined ? at : this.length;
            rowData = rowData || this._createDummyRow();

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = this.length;


            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._formatData(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                row['_button'] = true;
                modelList.push(new Data.Row(row, {collection: this}));
            }, this);
            this.add(modelList, {
                at: at,
                merge: true
            });
        },
        /**
         * 현재 rowList 에 최상단에 데이터를 append 한다.
         * @param {Object} rowData  prepend 할 행 데이터
         */
        prepend: function(rowData) {
            this.append(rowData, 0);
        },

        /**
         * 수정된 rowList 를 반환한다.
         * @param {Object} options
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}} options 조건에 해당하는 수정된 rowList 정보
         */
        getModifiedRowList: function(options) {

            var isRaw = options && options.isRaw,
                isOnlyChecked = options && options.isOnlyChecked,
                isOnlyRowKeyList = options && options.isOnlyRowKeyList,
                original = isRaw ? this.originalRowList : this._removePrivateProp(this.originalRowList),
                current = isRaw ? this.toJSON() : this._removePrivateProp(this.toJSON()),
                result = {
                    'createList' : [],
                    'updateList' : [],
                    'deleteList' : []
                },
                filteringColumnMap = {},
                filteringColumnList = _.union(options && options.filteringColumnList || [],
                    this.grid.columnModel.getIngoredColumnNameList()),
                item;

            _.each(filteringColumnList, function(columnName) {
                filteringColumnMap[columnName] = true;
            });

            original = _.indexBy(original, 'rowKey');
            current = _.indexBy(current, 'rowKey');

            // 추가/ 수정된 행 추출
            _.each(current, function(row, rowKey) {
                var isDiff,
                    originalRow = original[rowKey];
                item = isOnlyRowKeyList ? row['rowKey'] : row;
                if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                    if (!originalRow) {
                        result.createList.push(item);
                    } else {
                        //filtering 이 설정되어 있다면 filter 를 한다.
                        _.each(row, function(value, columnName) {
                            if (!filteringColumnMap[columnName]) {
                                if (typeof value === 'object') {
                                    isDiff = ($.toJSON(value) !== $.toJSON(originalRow[columnName]));
                                } else {
                                    isDiff = value !== originalRow[columnName];
                                }
                                if (isDiff) {
                                    result.updateList.push(item);
                                }
                            }
                        }, this);
                    }
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey) {
                item = isOnlyRowKeyList ? obj['rowKey'] : obj;
                if (!current[rowKey]) {
                    result.deleteList.push(item);
                }
            }, this);
            return result;
        }
    });

/**
 * @fileoverview Rendering 모델
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * View 에서 Rendering 시 사용할 객체
     * @constructor Model.Renderer
     */
    Model.Renderer = Model.Base.extend(/**@lends Model.Renderer.prototype */{
        defaults: {
            top: 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollLeft: 0,
            startIndex: 0,
            endIndex: 0,
            startNumber: 1,
            lside: null,
            rside: null
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRowListChange: 0,
                timeoutIdForRefresh: 0,
                isColumnModelChanged: false
            });

            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList([], {
                grid: this.grid
            });
            var rside = new Model.RowList([], {
                grid: this.grid
            });
            this.set({
                lside: lside,
                rside: rside
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this)
                .listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this)
                .listenTo(lside, 'valueChange', this._onValueChange, this)
                .listenTo(rside, 'valueChange', this._onValueChange, this);
        },
        /**
         * lside 와 rside collection 에서 value 값이 변경되었을 시 executeRelation 을 수행하기 위한 이벤트 핸들러
         * @param {number} rowIndex row 의 index 값
         * @private
         */
        _onValueChange: function(rowIndex) {
            this.executeRelation(rowIndex);
        },
        /**
         * 내부 변수를 초기화 한다.
         */
        initializeVariables: function() {
            this.set({
                top: 0,
                scrollTop: 0,
                $scrollTarget: null,
                scrollLeft: 0,
                startIndex: 0,
                endIndex: 0,
                startNumber: 1
            });
        },
        /**
         * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
         * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
         * @return {Object} collection  해당 영역의 랜더 데이터 콜랙션
         */
        getCollection: function(whichSide) {
            return this.get(ne.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
        },

        /**
         * Data.ColumnModel 이 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
         * @private
         */
        _onColumnModelChange: function() {
            this.set({
                'scrollTop' : 0,
                'top' : 0,
                'startIndex' : 0,
                'endIndex' : 0
            });
            this.isColumnModelChanged = true;
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        /**
         * Data.RowList 가 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
         * @private
         */
        _onRowListChange: function() {
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        /**
         * rendering 할 index 범위를 결정한다.
         * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
         * @private
         */
        _setRenderingRange: function() {
            this.set({
                'startIndex' : 0,
                'endIndex' : this.grid.dataModel.length - 1
            });
        },
        /**
         * rendering 할 데이터를 생성한다.
         */
        refresh: function() {
            this._setRenderingRange(this.get('scrollTop'));

            //TODO : rendering 해야할 데이터만 가져온다.
            var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, 'columnName'),

                lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex),

                lsideRowList = [],
                rsideRowList = [],
                lsideRow = [],
                rsideRow = [],
                startIndex = this.get('startIndex'),
                endIndex = this.get('endIndex'),
                num = this.get('startNumber') + startIndex,
                len,
                i,
                rowModel,
                rowKey;

            for (i = startIndex; i < endIndex + 1; i++) {
                rowModel = this.grid.dataModel.at(i);
                if (rowModel) {
                    rowKey = rowModel.get('rowKey');

                    //데이터 초기화
                    lsideRow = {
                        '_extraData': rowModel.get('_extraData'),
                        'rowKey': rowKey
                    };
                    rsideRow = {
                        '_extraData': rowModel.get('_extraData'),
                        'rowKey': rowKey
                    };

                    //lside 데이터 먼저 채운다.
                    _.each(lsideColumnList, function (columnName) {
                        if (columnName === '_number') {
                            lsideRow[columnName] = num++;
                        } else {
                            lsideRow[columnName] = rowModel.get(columnName);
                        }
                    });

                    _.each(rsideColumnList, function (columnName) {
                        if (columnName === '_number') {
                            rsideRow[columnName] = num++;
                        } else {
                            rsideRow[columnName] = rowModel.get(columnName);
                        }
                    });
                    lsideRowList.push(lsideRow);
                    rsideRowList.push(rsideRow);
                }
            }
            //lside 와 rside 를 초기화한다.
            this.get('lside').clear().reset(lsideRowList, {
                parse: true
            });
            this.get('rside').clear().reset(rsideRowList, {
                parse: true
            });


            len = rsideRowList.length + startIndex;

            //relation 을 수행한다.
            for (i = startIndex; i < len; i++) {
                this.executeRelation(i);
            }
            //컬럼모델의 변경이 있을 경우 columnModelChanged 이벤트를 발생한다.
            if (this.isColumnModelChanged) {
                this.trigger('columnModelChanged', this.get('top'));
                this.isColumnModelChanged = false;
            } else {
                this.trigger('rowListChanged', this.get('top'));
            }
            this.trigger('refresh', this.get('top'));
        },
        /**
         * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Collection} 컬럼명에 해당하는 영역의 콜랙션
         * @private
         */
        _getCollectionByColumnName: function(columnName) {
            var lside = this.get('lside'),
                rside = this.get('rside');

            if (lside.at(0) && lside.at(0).get(columnName)) {
                return lside;
            } else {
                return rside;
            }
        },
        /**
         * 셀 데이터를 반환한다.
         * @param {number} rowKey   데이터의 키값
         * @param {String} columnName   컬럼명
         * @return {object} cellData 셀 데이터
         * @example
         =>
         {
             rowKey: rowKey,
             columnName: columnName,
             value: value,
             rowSpan: rowSpanData.count,
             isMainRow: rowSpanData.isMainRow,
             mainRowKey: rowSpanData.mainRowKey,
             isEditable: isEditable,
             isDisabled: isDisabled,
             optionList: [],
             className: row.getClassNameList(columnName).join(' '),
             changed: []    //변경된 프로퍼티 목록들
         }
         */
        getCellData: function(rowKey, columnName) {
            var collection = this._getCollectionByColumnName(columnName),
                row = collection.get(rowKey);
            if (row) {
               return row.get(columnName);
            }
        },
        /**
         * rowIndex 에 해당하는 relation 을 수행한다.
         * @param {Number} rowIndex row 의 index 값
         */
        executeRelation: function(rowIndex) {
            var row = this.grid.dataModel.at(rowIndex),
                renderIdx = rowIndex - this.get('startIndex'),
                rowModel, relationResult;
            relationResult = row.getRelationResult();

            _.each(relationResult, function(changes, columnName) {
                rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
                if (rowModel) {
                    this._getCollectionByColumnName(columnName).at(renderIdx).setCell(columnName, changes);
                }
            }, this);
        },
        _destroy: function() {
            clearTimeout(this.timeoutIdForRefresh);
        }
    });

/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * 크기 관련 데이터 저장
     * @constructor Model.Dimension
     */
    Model.Dimension = Model.Base.extend(/**@lends Model.Dimension.prototype */{
        models: null,
        columnModel: null,
        defaults: {
            offsetLeft: 0,
            offsetTop: 0,

            width: 0,

            headerHeight: 0,
            bodyHeight: 0,
            toolbarHeight: 0,

            rowHeight: 0,

            rsideWidth: 0,
            lsideWidth: 0,
            columnWidthList: [],

            minimumColumnWidth: 0,
            displayRowCount: 1,
            scrollBarSize: 17,
            scrollX: true,
            scrollY: true
        },

        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel, 'columnModelChange', this._setColumnWidthVariables);

            this.on('change:width', this._onWidthChange, this);
            this._setColumnWidthVariables();
            this._setBodyHeight();
        },

        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         * @param {Array} columnWidthList   컬럼 너비 리스트
         * @return {Array}  totalWidth 에 맞게 계산한 컬럼 너비 리스트
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            var columnFixIndex = this.columnModel.get('columnFixIndex'),
                totalWidth = this.get('width'),
                availableTotalWidth,
                remainWidth,
                unassignedWidth,
                newColumnWidthList = [],
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            availableTotalWidth = totalWidth - columnWidthList.length - 1;

            if (this.get('scrollY')) {
                availableTotalWidth -= this.get('scrollBarSize');
            }

            if (columnFixIndex > 0) {
                availableTotalWidth -= 1;
            }

            _.each(columnWidthList, function(columnWidth) {
                if (columnWidth > 0) {
                    width = Math.max(this.get('minimumColumnWidth'), columnWidth);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                } else {
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }, this);

            remainWidth = availableTotalWidth - currentWidth;

            if (availableTotalWidth > currentWidth) {
                remainWidth = availableTotalWidth - currentWidth;
                unassignedWidth = Math.max(this.get('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            } else {
                unassignedWidth = this.get('minimumColumnWidth');
            }
            _.each(newColumnWidthList, function(newColumnWidth, index) {
                if (newColumnWidth === -1) {
                    newColumnWidthList[index] = unassignedWidth;
                }
            }, this);
            return newColumnWidthList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         * @return {Array}  columnModel 에 설정된 width 값 기준의 너비 리스트
         * @private
         */
        _getOriginalWidthList: function() {
            var columnModelList = this.columnModel.get('visibleList'),
                columnWidthList = [];

            _.each(columnModelList, function(columnModel) {
                if (columnModel.width) {
                    columnWidthList.push(columnModel.width);
                } else {
                    //width 가 지정되지 않았을 경우, 마지막에 동일한 값을 지정해주기 위해 마킹의 의미로 -1 값을 할당한다.
                    columnWidthList.push(-1);
                }
            });
            return this._calculateColumnWidthList(columnWidthList);
        },
        /**
         * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
         * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
         * @return {Number} 해당 frame 의 너비
         */
        getFrameWidth: function(whichSide) {
            var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnWidthList = this.getColumnWidthList(whichSide),
                frameWidth = this._getFrameWidth(columnWidthList);
            if (ne.util.isUndefined(whichSide) && columnFixIndex > 0) {
                //columnFixIndex 가 0보다 클 경우, 열고정 되어있기 때문에, 경계영역에 대한 1px도 함께 더한다.
                ++frameWidth;
            }
            return frameWidth;
        },
        /**
         * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
         * @param {Array} widthList 너비 리스트 배열
         * @return {Number} 계산된 frame 너비값
         * @private
         */
        _getFrameWidth: function(widthList) {
            //border 값(1px 도 함께 더한다.)
            return widthList.length ? Util.sum(widthList) + widthList.length + 1 : 0;
        },

        /**
         * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
         * @param {Array} [columnWidthList] 인자가 존재하지 않을 경우, 현재 columnModel 에 저장된 정보 기준으로 columnWidth 를 설정한다.
         * @private
         */
        _setColumnWidthVariables: function(columnWidthList) {
            var isSaveWidthList = false;

            if (!columnWidthList) {
                columnWidthList = this._getOriginalWidthList();
                isSaveWidthList = true;
            }

            var rsideWidth,
                lsideWidth,
                totalWidth = this.get('width'),
                columnFixIndex = this.columnModel.get('columnFixIndex'),
                maxLeftSideWidth = this._getMaxLeftSideWidth(),
                lsideWidthList = columnWidthList.slice(0, columnFixIndex),
                rsideWidthList = columnWidthList.slice(columnFixIndex);

            lsideWidth = this._getFrameWidth(lsideWidthList);
            if (maxLeftSideWidth < lsideWidth) {
                lsideWidthList = this._adjustLeftSideWidthList(lsideWidthList, maxLeftSideWidth);
                lsideWidth = this._getFrameWidth(lsideWidthList);
                columnWidthList = lsideWidthList.concat(rsideWidthList);
            }
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth: rsideWidth,
                lsideWidth: lsideWidth,
                columnWidthList: columnWidthList
            });

            if (isSaveWidthList) {
                this.set('originalWidthList', columnWidthList);
            }

            this.trigger('columnWidthChanged');
        },

        /**
         * 열 고정 영역의 minimum width 값을 구한다.
         * @return {number} 열고정 영역의 최소 너비값.
         * @private
         */
        _getMinLeftSideWidth: function() {
            var minimumColumnWidth = this.get('minimumColumnWidth'),
                columnFixIndex = this.columnModel.get('columnFixIndex'),
                minWidth;
            //border 값(1px 도 함께 더한다.) columnFixIndex 가 0보다 클 경우, 좌우 나누어진 영역에 대한 보더값도 더한다.
            minWidth = columnFixIndex ? (columnFixIndex * (minimumColumnWidth + 1)) + 1 : 0;
            return minWidth;
        },
        /**
         * 열 고정 영역의 maximum width 값을 구한다.
         * @return {number} 열고정 영역의 최대 너비값.
         * @private
         */
        _getMaxLeftSideWidth: function() {
            var maxWidth = Math.ceil(this.get('width') * 0.9);
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
            return maxWidth;
        },
        /**
         * 계산한 cell 의 위치를 리턴한다.
         * @param {Number|String} rowKey 데이터의 키값
         * @param {String} columnName   칼럼명
         * @return {{top: number, left: number, right: number, bottom: number}}
         */
        getCellPosition: function(rowKey, columnName) {
            var top, left = 0, right, bottom, i = 0,
                dataModel = this.grid.dataModel,
                offsetLeft = this.get('offsetLeft'),
                offsetTop = this.get('offsetTop'),
                rowHeight = this.get('rowHeight'),
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
                rowIdx, spanCount,
                columnWidthList = this.get('columnWidthList'),
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnIdx = this.grid.columnModel.indexOfColumnName(columnName, true);


            if (!rowSpanData.isMainRow) {
                rowKey = rowSpanData.mainRowKey;
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
            }

            spanCount = rowSpanData.count || 1;

            rowIdx = dataModel.indexOfRowKey(rowKey);

            top = Util.getHeight(rowIdx, rowHeight);
            bottom = top + Util.getHeight(spanCount, rowHeight) - 1;

            if (columnFixIndex <= columnIdx) {
                i = columnFixIndex;
            }

            for (; i < columnIdx; i++) {
                //border 값(1px 도 함께 더한다.)
                left += columnWidthList[i] + 1;
            }
            //border 값(1px 도 함께 더한다.)
            right = left + columnWidthList[i] + 1;

            return {
                top: top,
                left: left,
                right: right,
                bottom: bottom
            };
        },
        /**
         * columnFixIndex 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
         * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
         * @param {Number} totalWidth   grid 전체 너비
         * @return {Array} 열고정 영역의 너비 리스트
         * @private
         */
        _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
            var i = lsideWidthList.length - 1,
                minimumColumnWidth = this.get('minimumColumnWidth'),
                currentWidth = this._getFrameWidth(lsideWidthList),
                diff = currentWidth - totalWidth,
                changedWidth;
            if (diff > 0) {
                while (i >= 0 && diff > 0) {
                    changedWidth = Math.max(minimumColumnWidth, lsideWidthList[i] - diff);
                    diff -= lsideWidthList[i] - changedWidth;
                    lsideWidthList[i] = changedWidth;
                    i--;
                }
            } else if (diff < 0) {
                lsideWidthList[i] += Math.abs(diff);
            }
            return lsideWidthList;
        },
        /**
         * 그리드의 body height 를 계산하여 할당한다.
         * @private
         */
        _setBodyHeight: function() {
            var height = Util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
            if (this.get('scrollX')) {
                height += this.get('scrollBarSize');
            }
            this.set('bodyHeight', height);
        },
        /**
         * 현재 화면에 보이는 row 개수를 반환
         * @return {number} 화면에 보이는 행 개수
         */
        getDisplayRowCount: function() {
            return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
        },
        /**
         * 수평 스크롤바의 높이를 구한다. 수평 스크롤바를 사용하지 않을 경우 0을 반환한다.
         * @return {number} 수평 스크롤바의 높이
         */
        getScrollXHeight: function() {
            return +this.get('scrollX') * this.get('scrollBarSize');
        },
        /**
         * width 값 변경시 각 column 별 너비를 계산한다.
         * @private
         */
        _onWidthChange: function() {
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidthVariables(this._calculateColumnWidthList(curColumnWidthList));
        },

        /**
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index    너비를 변경할 컬럼의 인덱스
         * @param {Number} width    변경할 너비 pixel값
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.get('minimumColumnWidth'));
            var curColumnWidthList = this.get('columnWidthList');
            if (!ne.util.isUndefined(curColumnWidthList[index])) {
                curColumnWidthList[index] = width;
                this._setColumnWidthVariables(curColumnWidthList);
            }
        },
        /**
         * 초기 너비로 돌린다.
         * @param {Number} index    너비를 변경할 컬럼의 인덱스
         */
        restoreColumnWidth: function(index) {
            var curColumnWidthList = this.get('columnWidthList');
            if (!ne.util.isUndefined(curColumnWidthList[index])) {
                curColumnWidthList[index] = this.get('originalWidthList')[index];
                this._setColumnWidthVariables(curColumnWidthList);
            }
        },
        /**
         * 실제 조정된 column의 width 들을 반영한다.
         * @param {Array} columnWidthList   조정된 열의 너비 리스트
         * @param {Boolean} [whichSide]   어느 영역인지 여부. 'L|R' 중 하나를 인자로 넘긴다. 생략시 columnList 변경
         */
        setColumnWidthList: function(columnWidthList, whichSide) {
            var oppositeSide = (whichSide === 'L') ? 'R' : 'L',
                oppositeSideColumnWidthList = this.getColumnWidthList(oppositeSide) || [],
                newColumnWidthList;

            if (whichSide === 'L') {
                newColumnWidthList = columnWidthList.concat(oppositeSideColumnWidthList);
            } else if (whichSide === 'R') {
                newColumnWidthList = oppositeSideColumnWidthList.concat(columnWidthList);
            } else {
                newColumnWidthList = columnWidthList;
            }

            this._setColumnWidthVariables(newColumnWidthList);

        },
        /**
         * L side 와 R side 에 따른 columnWidthList 를 반환한다.
         * @param {String} [whichSide] 어느 영역인지 여부. 'L|R' 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
         * @return {Array}  조회한 영역의 columnWidthList
         */
        getColumnWidthList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get('columnFixIndex'),
                columnWidthList = [];

            switch (whichSide) {
                case 'L':
                    columnWidthList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnWidthList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnWidthList = this.get('columnWidthList');
                    break;
            }
            return columnWidthList;
        }
    });

/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Focus model
     * RowList collection 이 focus class 를 listen 한다.
     * @constructor Model.Focus
     */
    Model.Focus = Model.Base.extend(/**@lends Model.Focus.prototype */{
        defaults: {
            rowKey: null,
            columnName: '',
            prevRowKey: null,
            prevColumnName: '',
            scrollX: true,
            scrollY: true,
            scrollBarSize: 17
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * 이전 focus 정보를 저장한다.
         * @private
         */
        _savePrevious: function() {
            if (this.get('rowKey') !== null) {
                this.set('prevRowKey', this.get('rowKey'));
            }
            if (this.get('columnName')) {
                this.set('prevColumnName', this.get('columnName'));
            }
        },
        /**
         * 이전 focus 정보를 제거한다.
         * @private
         */
        _clearPrevious: function() {
            this.set({
                prevRowKey: null,
                prevColumnName: ''
            });
        },
        /**
         * 행을 select 한다.
         * @param {Number|String} rowKey    select 할 행의 키값
         * @return {Model.Focus}
         */
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            this.trigger('select', rowKey);
            return this;
        },
        /**
         * 행을 unselect 한다.
         * @return {Model.Focus}
         */
        unselect: function() {
            this.blur();
            this.trigger('unselect', this.get('rowKey'));
            this.set({
                'rowKey': null
            });
            return this;
        },
        /**
         * focus 처리한다.
         * @param {Number|String} rowKey focus 처리할 셀의 rowKey 값
         * @param {String} columnName focus 처리할 셀의 컬럼명
         * @param {Boolean} isScrollable focus 처리한 영역으로 scroll 위치를 이동할지 여부
         * @return {Model.Focus}
         */
        focus: function(rowKey, columnName, isScrollable) {
            var scrollPosition;
            if (ne.util.isUndefined(rowKey) && ne.util.isUndefined(columnName)) {
                if (ne.util.isUndefined(this.grid.renderModel.getCollection('R').get(rowKey))) {
                    this.trigger('focus', this.get('rowKey'), this.get('columnName'));
                }
            } else if (this.get('rowKey') !== rowKey || this.get('columnName') !== columnName) {
                rowKey = ne.util.isUndefined(rowKey) ? this.get('rowKey') : rowKey;
                columnName = ne.util.isUndefined(columnName) ? this.get('columnName') : columnName;
                this._savePrevious();
                this.blur();
                if (rowKey !== this.get('rowKey')) {
                    this.select(rowKey);
                }
                if (columnName && columnName !== this.get('columnName')) {
                    this.set('columnName', columnName);
                }
                this.trigger('focus', rowKey, columnName);
                if (isScrollable) {
                    //todo scrolltop 및 left 값 조정하는 로직 필요.
                    scrollPosition = this._getScrollPosition();
                    !ne.util.isEmpty(scrollPosition) && this.grid.renderModel.set(scrollPosition);
                }
            }
            return this;
        },
        /**
         * focus 이동에 맞추어 scroll 위치를 조정한 값을 반환한다.
         * @return {{scrollTop: number, scrollLeft: number}} 위치 조정한 값
         * @private
         */
        _getScrollPosition: function() {
            var focused = this.which(),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                lsideWidth = dimensionModel.get('lsideWidth'),
                rsideWidth = dimensionModel.get('rsideWidth'),
                position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName),
                currentLeft = scrollLeft,
                currentRight = scrollLeft + rsideWidth,
                scrollXSize = +this.get('scrollX') * this.get('scrollBarSize'),
                scrollYSize = +this.get('scrollY') * this.get('scrollBarSize'),
                scrollPosition = {};


            //수직 스크롤 조정
            if (position.top < scrollTop) {
                scrollPosition.scrollTop = position.top;
            } else if (position.bottom > bodyHeight + scrollTop - scrollXSize) {
                scrollPosition.scrollTop = position.bottom - bodyHeight + scrollXSize;
            }

            //수평 스크롤 조정
            if (!this.grid.columnModel.isLside(focused.columnName)) {
                if (position.left < currentLeft) {
                    scrollPosition.scrollLeft = position.left;
                } else if (position.right > currentRight) {
                    scrollPosition.scrollLeft = position.right - rsideWidth + scrollYSize + 1;
                }
            }
            return scrollPosition;
        },
        /**
         * 디자인 blur 처리한다.
         * @return {Model.Focus}
         */
        blur: function() {
            this.trigger('blur', this.get('rowKey'), this.get('columnName'));
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
            return this;
        },
        /**
         * 현재 focus 정보를 반환한다.
         * @return {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
         */
        which: function() {
            return {
                rowKey: this.get('rowKey'),
                columnName: this.get('columnName')
            };
        },
        /**
         * 현재 focus 정보를 index 기준으로 반환한다.
         * @param {boolean} isPrevious 이전 focus 정보를 반환할지 여부
         */
        indexOf: function(isPrevious) {
            var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
                columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

            return {
                rowIdx: this.grid.dataModel.indexOfRowKey(rowKey),
                columnIdx: this.grid.columnModel.indexOfColumnName(columnName, true)
            };
        },
        /**
         * 현재 focus를 가지고 있는지 여부를 리턴한다.
         * @return {boolean} 현재 focus 가 설정되어 있는지 여부
         */
        has: function() {
            var has = !!((!ne.util.isUndefined(this.get('rowKey')) && this.get('rowKey') !== null) && this.get('columnName'));
            return has;
        },
        /**
         * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
         * @param {Number} offset   이동할 offset
         * @return {Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
         * @private
         */
        _findRowKey: function(offset) {
            var index, row,
                dataModel = this.grid.dataModel;
            if (this.has()) {
                index = Math.max(Math.min(dataModel.indexOfRowKey(this.get('rowKey')) + offset, this.grid.dataModel.length - 1), 0);
                row = dataModel.at(index);
                return row && row.get('rowKey');
            }
        },
        /**
         * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
         * @param {Number} offset   이동할 offset
         * @return {String} columnName  offset 만큼 이동한 위치의 columnName
         * @private
         */
        _findColumnName: function(offset) {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getVisibleColumnModelList(),
                columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true);
            if (this.has()) {
                index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        },
        /**
         * rowSpanData 를 반환한다.
         * @param {Number|String} rowKey    조회할 데이터의 키값
         * @param {String} columnName   컬럼명
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
         * @private
         */
        _getRowSpanData: function(rowKey, columnName) {
            return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
        },
        /**
         * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
         * @param {number} offset   이동할 offset
         * @return {Number} 이동한 위치의 row index
         */
        nextRowIndex: function(offset) {
            var rowKey = this.nextRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        /**
         * offset 만큼 앞으로 이동한 row의 index를 반환한다.
         * @param {number} offset 이동할 offset
         * @return {Number} 이동한 위치의 row index
         */
        prevRowIndex: function(offset) {
            var rowKey = this.prevRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        /**
         * 다음 컬럼의 인덱스를 반환한다.
         * @return {Number} 다음 컬럼의 index
         */
        nextColumnIndex: function() {
            var columnName = this.nextColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName, true);
        },
        /**
         * 이전 컬럼의 인덱스를 반환한다.
         * @return {Number} 이전 컬럼의 인덱스
         */
        prevColumnIndex: function() {
            var columnName = this.prevColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName, true);
        },
        /**
         * keyEvent 발생 시 호출될 메서드로,
         * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
         * @param {number}  offset 이동할 offset
         * @return {Number|String} offset 만큼 이동한 위치의 rowKey
         */
        nextRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                count, rowSpanData;

            offset = (typeof offset === 'number') ? offset : 1;
            if (offset > 1) {
                rowKey = this._findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this._findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                    rowKey = this._findRowKey(rowSpanData.count);
                } else if (!rowSpanData.isMainRow) {
                    count = rowSpanData.count;
                    rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                    rowKey = this._findRowKey(rowSpanData.count + count);
                } else {
                    rowKey = this._findRowKey(1);
                }
            }
            return rowKey;
        },
        /**
         * keyEvent 발생 시 호출될 메서드로,
         * rowSpan 정보 까지 계산된 이전 rowKey 를 반환한다.
         * @param {number}  offset 이동할 offset
         * @return {Number|String} offset 만큼 이동한 위치의 rowKey
         */
        prevRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                rowSpanData;
            offset = typeof offset === 'number' ? offset : 1;
            offset *= -1;

            if (offset < -1) {
                rowKey = this._findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this._findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this._findRowKey(rowSpanData.count - 1);
                } else {
                    rowKey = this._findRowKey(-1);
                }
            }
            return rowKey;
        },
        /**
         * keyEvent 발생 시 호출될 메서드로, 다음 columnName 을 반환한다.
         * @return {String} 다음 컬럼명
         */
        nextColumnName: function() {
            return this._findColumnName(1);
        },
        /**
         * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
         * @return {String} 이전 컬럼명
         */
        prevColumnName: function() {
            return this._findColumnName(-1);
        },
        /**
         * 첫번째 row 의 key 를 반환한다.
         * @return {(string|number)} 첫번째 row 의 키값
         */
        firstRowKey: function() {
            return this.grid.dataModel.at(0).get('rowKey');
        },
        /**
         * 마지막 row의 key 를 반환한다.
         * @return {(string|number)} 마지막 row 의 키값
         */
        lastRowKey: function() {
            return this.grid.dataModel.at(this.grid.dataModel.length - 1).get('rowKey');
        },
        /**
         * 첫번째 columnName 을 반환한다.
         * @return {string} 첫번째 컬럼명
         */
        firstColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList();
            return columnModelList[0]['columnName'];
        },
        /**
         * 마지막 columnName 을 반환한다.
         * @return {string} 마지막 컬럼명
         */
        lastColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList(),
                lastIndex = columnModelList.length - 1;
            return columnModelList[lastIndex]['columnName'];
        }
    });

/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  View 에서 Rendering 시 사용할 객체
     *  Smart Rendering 을 지원한다.
     *  @constructor Model.Renderer.Smart
     */
    Model.Renderer.Smart = Model.Renderer.extend(/**@lends Model.Renderer.Smart.prototype */{
        /**
         * 초기화 함수
         */
        initialize: function() {
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onChange, this);
            this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);

            this.setOwnProperties({
                hiddenRowCount: 10,
                criticalPoint: 3
            });
        },
        /**
         * bodyHeight 가 변경 되었을때 이벤트 핸들러
         * @private
         */
        _onChange: function() {
            if (this._isRenderable(this.get('scrollTop'))) {
                this.refresh();
            }
        },
        /**
         * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
         * @param {Number} scrollTop    랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
         * @private
         */
        _setRenderingRange: function(scrollTop) {
            var top,
                dimensionModel = this.grid.dimensionModel,
                dataModel = this.grid.dataModel;
            if (dimensionModel && dataModel) {
                var rowHeight = dimensionModel.get('rowHeight'),
                    bodyHeight = dimensionModel.get('bodyHeight'),
                    displayRowCount = dimensionModel.getDisplayRowCount(),
                    startIndex = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                    endIndex = Math.min(
                        dataModel.length - 1,
                        Math.floor(startIndex + this.hiddenRowCount + displayRowCount + this.hiddenRowCount)
                    ),
                    startRow, endRow, minList, maxList;

                if (dataModel.isRowSpanEnable()) {
                    minList = [];
                    maxList = [];
                    startRow = dataModel.at(startIndex);
                    endRow = dataModel.at(endIndex);
                    if (startRow && endRow) {
                        _.each(startRow.get('_extraData')['rowSpanData'], function (data, columnName) {
                            if (!data.isMainRow) {
                                minList.push(data.count);
                            }
                        }, this);

                        _.each(endRow.get('_extraData')['rowSpanData'], function (data, columnName) {
                            if (data.count > 0) {
                                maxList.push(data.count);
                            }
                        }, this);

                        if (minList.length > 0) {
                            startIndex += Math.min.apply(Math, minList);
                        }

                        if (maxList.length > 0) {
                            endIndex += Math.max.apply(Math, maxList);
                        }
                    }
                }
                top = (startIndex === 0) ? 0 : Util.getHeight(startIndex, rowHeight) - 1;

                this.set({
                    top: top,
                    startIndex: startIndex,
                    endIndex: endIndex
                });
            }
        },
        /**
         * scrollTop 값 에 따라 rendering 해야하는지 판단한다.
         * @param {Number} scrollTop 랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
         * @return {boolean}    랜더링 해야할지 여부
         * @private
         */
        _isRenderable: function(scrollTop) {
            var grid = this.grid,
                dimensionModel = grid.dimensionModel,
                dataModel = grid.dataModel,
                rowHeight = dimensionModel.get('rowHeight'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                rowCount = dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIndex = this.get('startIndex'),
                endIndex = this.get('endIndex');

            //시작 지점이 임계점 이하로 올라갈 경우 return true
            if (startIndex !== 0) {
                if (startIndex + this.criticalPoint > displayStartIdx) {
                    return true;
                }
            }
            //마지막 지점이 임계점 이하로 내려갔을 경우 return true
            if (endIndex !== rowCount - 1) {
                if (endIndex - this.criticalPoint < displayEndIdx) {
                    return true;
                }
            }
            return false;
        }
    });

/**
 * @fileoverview RowList 클래스파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Row Model
     * @constructor Model.Row
     */
    Model.Row = Model.Base.extend(/**@lends Model.Row.prototype */{
        idAttribute: 'rowKey',
        defaults: {
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
            var rowKey = attributes && attributes['rowKey'];

            this.setOwnProperties({
                dataModel: this.grid.dataModel,
                columnModel: this.grid.columnModel,
                renderModel: this.grid.renderModel
            });

            if (this.dataModel.get(rowKey)) {
                this.listenTo(this.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
                this.listenTo(this.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
            }
        },
        /**
         * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
         * @param {Object} model    변경이 발생한 row 모델
         * @private
         */
        _onDataModelChange: function(model) {
            _.each(model.changed, function(value, columnName) {
                if (columnName === '_extraData') {
                    // 랜더링시 필요한 정보인 extra data 가 변경되었을 때 해당 row 에 disable, editable 상태를 업데이트 한다.
                    // rowSpan 되어있는 행일 경우 main row 에 해당 처리를 수행한다..
                    this._setRowExtraData();
                } else {
                    this.setCell(columnName, {
                        value: value
                    });
                }
            }, this);
        },

        /**
         * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
         */
        _setRowExtraData: function() {
            if (!ne.util.isUndefined(this.collection)) {
                var dataModel = this.dataModel,
                    columnModelList = this.columnModel.getVisibleColumnModelList(),
                    row = this.dataModel.get(this.get('rowKey')),
                    rowState = row.getRowState(),
                    param;
                _.each(columnModelList, function(columnModel) {
                    var mainRowKey,
                        columnName = columnModel['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        isEditable,
                        isDisabled;


                    if (!ne.util.isUndefined(cellData)) {
                        isEditable = row.isEditable(columnName);
                        isDisabled = (columnName === '_button') ? rowState.isDisabledCheck : rowState.isDisabled;
                        if (dataModel.isRowSpanEnable() && !cellData['isMainRow']) {
                            rowModel = this.collection.get(cellData['mainRowKey']);
                        }
                        if (rowModel) {
                            param = {
                                isDisabled: isDisabled,
                                isEditable: isEditable,
                                className: row.getClassNameList(columnName).join(' ')
                            };
                            rowModel.setCell(columnName, param);
                        }
                    }
                }, this);
            }
        },
        /**
         * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 형식에 맞게 가공한다.
         * @param {Array} data  원본 데이터
         * @return {Array}  형식에 맞게 가공된 데이터
         */
        parse: function(data) {
            return this._formatData(data);
        },
        /**
         * 데이터를 View 에서 사용할 수 있도록 가공한다.
         * @param {Array} data  원본 데이터
         * @return {Array}  가공된 데이터
         * @private
         */
        _formatData: function(data) {
            var grid = this.grid || this.collection.grid,
                dataModel = grid.dataModel,
                rowKey = data['rowKey'],
                row = dataModel.get(rowKey),
                rowState = row.getRowState(),
                isDisabled = rowState.isDisabled;

            _.each(data, function(value, columnName) {
                var rowSpanData,
                    isEditable = row.isEditable(columnName);

                if (columnName !== 'rowKey' && columnName !== '_extraData') {
                    if (dataModel.isRowSpanEnable() &&
                        data['_extraData'] && data['_extraData']['rowSpanData'] &&
                        data['_extraData']['rowSpanData'][columnName]) {
                        rowSpanData = data['_extraData']['rowSpanData'][columnName];
                    } else {
                        rowSpanData = {
                            mainRowKey: rowKey,
                            count: 0,
                            isMainRow: true
                        };
                    }
                    isDisabled = (columnName === '_button') ? rowState.isDisabledCheck : isDisabled;

                    data[columnName] = {
                        rowKey: rowKey,
                        columnName: columnName,
                        value: value,
                        //Rendering properties
                        rowSpan: rowSpanData.count,
                        isMainRow: rowSpanData.isMainRow,
                        mainRowKey: rowSpanData.mainRowKey,
                        //Change attribute properties
                        isEditable: isEditable,
                        isDisabled: isDisabled,
                        optionList: [],
                        className: row.getClassNameList(columnName).join(' '),

                        changed: []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
            return data;
        },

        /**
         * Cell 의 값을 변경한다.
         * - 참조형 데이터 타입이기 때문에 change 이벤트 발생을 위해 이 method 를 사용하여 값 변경을 수행한다.
         * @param {String} columnName   컬럼명
         * @param {{key: value}} param  key:value 로 이루어진 셀에서 변경할 프로퍼티 목록
         */
        setCell: function(columnName, param) {
            if (this.get(columnName)) {
                var data = _.clone(this.get(columnName)),
                    isValueChanged = false,
                    changed = [],
                    rowIndex,
                    rowKey = this.get('rowKey');
                _.each(param, function(changeValue, name) {
                    if (!Util.isEqual(data[name], changeValue)) {
                        isValueChanged = (name === 'value') ? true : isValueChanged;
                        data[name] = changeValue;
                        changed.push(name);
                    }
                }, this);

                if (changed.length) {
                    data['changed'] = changed;
                    this.set(columnName, data);
                    if (isValueChanged) {
                        //value 가 변경되었을 경우 relation 을 수행한다.
                        rowIndex = this.dataModel.indexOfRowKey(rowKey);
                        this.trigger('valueChange', rowIndex);
                    }
                }
            }
        }
    });

    /**
     * View Model rowList collection
     * @constructor Model.RowList
     */
    Model.RowList = Collection.Base.extend(/**@lends Model.RowList.prototype */{
        model: Model.Row,
        /**
         * 생성자 함수
         */
        initialize: function() {
            Collection.Base.prototype.initialize.apply(this, arguments);
        }
    });

/**
 * @fileoverview Layer Base
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 레이어 기본 클래스
 * @constructor View.Layer.Base
 */
View.Layer.Base = View.Base.extend(/**@lends View.Layer.Base.prototype */{
    template: _.template('' +
    '<div>' +
    '    <%=text%>' +
    '    <div class="loading_img"></div>' +
    '</div>'),
    /**
     * 초기화 함수
     */
    initialize: function() {
        View.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '기본 텍스트'
        });
        this.listenTo(this.grid.dimensionModel, 'change', this._resize, this);
    },
    /**
     * 랜더링 한다.
     * @param {String} text 레이어에 노출할 text
     * @return {View.Layer.Base}
     */
    render: function(text) {
        this.$el.html(this.template({
            text: text || this.text
        })).css('display', 'none');
        return this;
    },
    /**
     * Layer를 노출한다.
     * @param {String} text 레이어에 노출할 text
     */
    show: function(text) {
        this.render(text).$el.css('display', 'block')
            .css('zIndex', 1);
        this._resize();
    },
    /**
     * Layer 를 감춘다.
     */
    hide: function() {
        this.$el.css('display', 'none');
    },
    /**
     * 그리드의 크기에 맞추어 resize 한다.
     * @private
     */
    _resize: function() {
        if (this.$el.css('display') === 'block') {
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight');
            this.$el.css('marginTop', headerHeight + 'px')
                .css('height', bodyHeight + 'px');
        }
    }
});

/**
 * @fileoverview Layer Empty
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 데이터 없음 레이어
 * @constructor View.Layer.Empty
 */
View.Layer.Empty = View.Layer.Base.extend(/**@lends View.Layer.Empty.prototype */{
    className: 'no_row_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '데이터가 존재하지 않습니다.'
        });
    },
    template: _.template('<%=text%>')
});

/**
 * @fileoverview Layer Loading
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 로딩 레이어
 * @constructor View.Layer.Loading
 */
View.Layer.Loading = View.Layer.Base.extend(/**@lends View.Layer.Loading.prototype */{
    className: 'loading_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});

/**
 * @fileoverview Layer Ready
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 초기화 레이어
 * @constructor View.Layer.Ready
 */
View.Layer.Ready = View.Layer.Base.extend(/**@lends View.Layer.Ready.prototype */{
    className: 'initializing_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    }
});

/**
 * @fileoverview Frame Base
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * frame Base 클래스
     * @namespace
     * @constructor View.Layout.Frame
     */
    View.Layout.Frame = View.Base.extend(/**@lends View.Layout.Frame.prototype */{
        tagName: 'div',
        className: 'lside_area',
        /**
         * 초기화 메서드
         * @param {Object} options
         *      @param {String} [options.whichSide='R']  어느 영역의 frame 인지 여부.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this)
                .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);

            this.setOwnProperties({
                header: null,
                body: null,
                whichSide: options && options.whichSide || 'R'
            });
        },
        /**
         * 랜더링 메서드
         * @return {View.Layout.Frame}
         */
        render: function() {
            var header,
                body;
            this.destroyChildren();
            this.beforeRender();

            header = this.header = this.createView(View.Layout.Header, {
                grid: this.grid,
                whichSide: this.whichSide
            });
            body = this.body = this.createView(View.Layout.Body, {
                grid: this.grid,
                whichSide: this.whichSide
            });

            this.$el
                .append(header.render().el)
                .append(body.render().el);

            this.afterRender();
            return this;
        },
        /**
         *columnModel change 시 수행되는 핸들러 스켈레톤
         * @private
         */
        _onColumnWidthChanged: function() {},
        /**
         * 랜더링 하기전에 수행하는 함수 스켈레톤
         */
        beforeRender: function() {},
        /**
         * 랜더링 이후 수행하는 함수 스켈레톤
         */
        afterRender: function() {}
    });

















/**
 * @fileoverview Body View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * body layout 뷰
     *
     * @constructor View.Layout.Body
     */
    View.Layout.Body = View.Base.extend(/**@lends View.Layout.Body.prototype */{
        tagName: 'div',
        className: 'data',
        template: _.template('' +
                '<div class="table_container" style="top: 0px">' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody></tbody>' +
                '    </table>' +
                '</div>'),
        events: {
            'scroll': '_onScroll'
        },
        /**
         * 생성자 함수
         * @param {Object} options
         *      @param {String} [options.whichSide='R']  어느 영역의 body 인지 여부.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: options && options.whichSide || 'R',
                isScrollSync: false
            });

            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.renderModel, 'refresh', this._setTopPosition, this);
        },
        /**
         * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
         * @param {Object} model 변경이 일어난 model 인스턴스
         * @param {Number} value bodyHeight 값
         * @private
         */
        _onBodyHeightChange: function(model, value) {
            this.$el.css('height', value + 'px');
        },
        /**
         * 컬럼 너비 변경 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');

            _.each(columnWidthList, function(width, index) {
                $colList.eq(index).css('width', width + 'px');
            });
        },
        /**
         * 마우스다운 이벤트 핸들러
         * @param {event} mouseDownEvent    마우스 이벤트
         * @private
         */
        //_onMouseDown: function(mouseDownEvent) {
        //    var grid = this.grid,
        //        selection = grid.selection,
        //        focused,
        //        pos;
        //
        //    if (mouseDownEvent.shiftKey) {
        //        focused = grid.focusModel.indexOf(true);
        //
        //        if (!selection.hasSelection()) {
        //            selection.startSelection(focused.rowIdx, focused.columnIdx);
        //        }
        //
        //        selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
        //        pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
        //        selection.updateSelection(pos.row, pos.column);
        //        grid.focusAt(pos.row, pos.column);
        //    } else {
        //        selection.endSelection();
        //        selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
        //    }
        //},
        /**
         * 스크롤 이벤트 핸들러
         * @param {event} scrollEvent   스크롤 이벤트
         * @private
         */
        _onScroll: function(scrollEvent) {
            var obj = {},
                renderModel = this.grid.renderModel;

            obj['scrollTop'] = scrollEvent.target.scrollTop;

            if (this.whichSide === 'R') {
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
            renderModel.set(obj);
        },
        /**
         * Render model 의 Scroll left 변경 이벤트 핸들러
         * @param {object} model 변경이 일어난 모델 인스턴스
         * @param {Number} value scrollLeft 값
         * @private
         */
        _onScrollLeftChange: function(model, value) {
            /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * Render model 의 Scroll top 변경 이벤트 핸들러
         * @param {object} model 변경이 일어난 모델 인스턴스
         * @param {Number} value scrollTop값
         * @private
         */
        _onScrollTopChange: function(model, value) {
            /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
            this.el.scrollTop = value;
        },
        /**
         * rowList 가 rendering 될 때 top 값을 조정한다.
         * @param {number} top  조정할 top 위치 값
         * @private
         */
        _setTopPosition: function(top) {
            this.$el.children('.table_container').css('top', top + 'px');
        },
        /**
         * rendering 한다.
         * @return {View.Layout.Body}   자기 자신
         */
        render: function() {
            var grid = this.grid,
                whichSide = this.whichSide,
                selection,
                rowList,
                collection = grid.renderModel.getCollection(whichSide);

            this.destroyChildren();

            if (!this.grid.option('scrollX')) {
                this.$el.css('overflow-x', 'hidden');
            }

            if (!this.grid.option('scrollY') && whichSide === 'R') {
                this.$el.css('overflow-y', 'hidden');
            }

            this.$el.css({
                    height: grid.dimensionModel.get('bodyHeight')
                }).html(this.template({
                    colGroup: this._getColGroupMarkup()
                }));

            rowList = this.createView(View.RowList, {
                grid: grid,
                collection: collection,
                el: this.$el.find('tbody'),
                whichSide: whichSide
            });
            rowList.render();

            //selection 을 랜더링한다.
            selection = this.addView(grid.selection.createLayer(whichSide));
            this.$el.append(selection.render().el);

            return this;
        },
        /**
         * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
         * @return {string} <colgroup> 안에 들어갈 마크업 문자열
         * @private
         */
        _getColGroupMarkup: function() {
            var grid = this.grid,
                whichSide = this.whichSide,
                columnModel = grid.columnModel,
                dimensionModel = grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(whichSide),
                html = '';

            _.each(columnModelList, function(columnModel, index) {
                html += '<col columnname="' + columnModel['columnName'] + '" style="width:' + columnWidthList[index] + 'px">';
            });
            return html;
        }
    });

/**
 * @fileoverview Left Side Frame
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * left side 프레임 클래스
     * @constructor View.Layout.Frame.Lside
     */
    View.Layout.Frame.Lside = View.Layout.Frame.extend(/**@lends View.Layout.Frame.Lside.prototype */{
        className: 'lside_area',
        /**
         * 초기화 메서드
         */
        initialize: function() {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        },
        /**
         * columnWidth 변경시 호출될 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                width: width + 'px'
            });
        },
        /**
         * 랜더링하기 전 수행되는 메서드
         */
        beforeRender: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                display: 'block',
                width: width + 'px'
            });
        }
    });

/**
 * @fileoverview Left Side Frame, Virtual Scrollbar 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * right side 프레임 클래스
     * @constructor View.Layout.Frame.Rside
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend(/**@lends View.Layout.Frame.Rside.prototype */{
        className: 'rside_area',
        /**
         * 초기화 함수
         */
        initialize: function() {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        },
        /**
         * 컬럼 width 값이 변경되었을때 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var dimensionModel = this.grid.dimensionModel,
                marginLeft = dimensionModel.get('lsideWidth'),
                width = dimensionModel.get('rsideWidth');

            this.$el.css({
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        /**
         * 랜더링하기 전 수행되는 메서드
         * @private
         */
        beforeRender: function() {
            var dimensionModel = this.grid.dimensionModel,
                marginLeft = dimensionModel.get('lsideWidth'),
                width = dimensionModel.get('rsideWidth');

            this.$el.css({
                display: 'block',
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        /**
         * 랜더링 후 수행되는 메서드
         * @private
         */
        afterRender: function() {
            if (this.grid.option('scrollY')) {
                var virtualScrollBar,
                    $space = $('<div></div>'),
                    height = this.grid.dimensionModel.get('headerHeight') - 2;  //높이에서 상 하단 border 값 2를 뺀다.

                $space.css({
                    height: height + 'px'
                }).addClass('space');

                this.$el.append($space);

                if (!this.grid.option('notUseSmartRendering')) {
                    virtualScrollBar = this.createView(View.Layout.Frame.Rside.VirtualScrollBar, {
                        grid: this.grid
                    });
                    this.$el.append(virtualScrollBar.render().el);
                }
            }
        }
    });

    /**
     * virtual scrollbar
     * @constructor View.Layout.Frame.Rside.VirtualScrollBar
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend(/**@lends View.Layout.Frame.Rside.VirtualScrollBar.prototype */{
        tagName: 'div',
        className: 'virtual_scrollbar',
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                hasFocus: false
            });
            this.listenTo(this.grid.dataModel, 'sort add remove reset', this._setHeight, this);
            this.listenTo(this.grid.dimensionModel, 'change', this._onDimensionChange, this);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.timeoutForScroll = 0;
        },
        events: {
            'scroll' : '_onScroll',
            'mousedown': '_onMouseDown'
        },
        /**
         * 마우스 down 이벤트 핸들러
         * 스크롤 핸들러를 직접 조작할 경우 rendering 성능 향상을 위해 매번 랜더링 하지 않고 한번에 랜더링 하기위해
         * hasFocus 내부 변수를 할당하고, document 에 mouseup 이벤트 핸들러를 바인딩한다.
         * @private
         */
        _onMouseDown: function() {
            this.hasFocus = true;
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * 마우스 up 이벤트 핸들러
         * 바인딩 해제한다.
         * @private
         */
        _onMouseUp: function() {
            this.hasFocus = false;
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * scroll 이벤트 발생시 renderModel 의 scroll top 값을 변경하여 frame 과 body 의 scrollTop 값을 동기화한다.
         * @param {event} scrollEvent 스크롤 이벤트
         * @private
         */
        _onScroll: function(scrollEvent) {
            clearTimeout(this.timeoutForScroll);
            if (this.hasFocus) {
                this.timeoutForScroll = setTimeout($.proxy(function() {
                    this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
                }, this), 0);
            }
        },
        /**
         * 크기 값이 변경될 때 해당 사항을 반영한다.
         * @param {object} model 변경이 발생한 모델
         * @private
         */
        _onDimensionChange: function(model) {
            if (model.changed['headerHeight'] || model.changed['bodyHeight']) {
                this.render();
            }
        },
        /**
         * scrollTop 이 변경된다면 scrollTop 값을 갱신하고,
         * scrollTop 값 자체가 잘못된 경우 renderModel 의 scrollTop 값을 정상값으로 갱신한다.
         * @param {object} model 변경이 발생한 모델
         * @param {number} value scrollTop 값
         * @private
         */
        _onScrollTopChange: function(model, value) {
            var scrollTop;
            this.el.scrollTop = value;
            scrollTop = this.el.scrollTop;
            if (scrollTop !== value) {
                this.grid.renderModel.set('scrollTop', scrollTop);
            }
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Frame.Rside.VirtualScrollBar}
         */
        render: function() {
            var grid = this.grid,
                height = grid.dimensionModel.get('bodyHeight'),
                top = grid.dimensionModel.get('headerHeight');

            if (this.grid.option('scrollX')) {
                height -= this.grid.scrollBarSize;
            }

            this.$el.css({
                height: height + 'px',
                top: top + 'px',
                display: 'block'
            }).html('<div class="content"></div>');
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 설정한다.
         * @private
         */
        _setHeight: function() {
            var grid = this.grid,
                rowHeight = grid.dimensionModel.get('rowHeight'),
                rowCount = grid.dataModel.length,
                height = rowHeight * grid.dataModel.length + (rowCount + 1);

            this.$el.find('.content').height(height);
        },
        /**
         * 소멸자
         */
        destroy: function() {
            this.stopListening();
            this._onMouseUp();
            this.destroyChildren();
            this.remove();
        }
    });

/**
 * @fileoverview Header 관련
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Header 레이아웃 View
     * @constructor View.Layout.Header
     */
    View.Layout.Header = View.Base.extend(/**@lends View.Layout.Header.prototype */{
        tagName: 'div',
        className: 'header',
        whichSide: 'R',
        events: {
            'click' : '_onClick'
        },
        /**
         * 초기화 메서드
         * @param {Object} options
         *      @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.whichSide = options.whichSide;
            this.setOwnProperties({
                timeoutForAllChecked: 0
            });
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this);

        },
        /**
         * 전체 template
         */
        template: _.template('' +
        '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '        <colgroup><%=colGroup%></colgroup>' +
        '        <tbody><%=tBody%></tbody>' +
        '    </table>'),
        /**
         * <th> 템플릿
         */
        templateHeader: _.template('' +
        '<th columnname="<%=columnName%>" ' +
        'height="<%=height%>" ' +
        '<%if(colspan > 0) {%>' +
        'colspan=<%=colspan%> ' +
        '<%}%>' +
        '<%if(rowspan > 0) {%>' +
        'rowspan=<%=rowspan%> ' +
        '<%}%>' +
        '><%=title%></th>' +
        ''),
        /**
         * <col> 템플릿
         */
        templateCol: _.template('' +
        '<col ' +
        'columnname="<%=columnName%>" ' +
        'style="width:<%=width%>px">' +
        ''),
        /**
         * col group 마크업을 생성한다.
         *
         * @return {string} <colgroup>에 들어갈 html 마크업 스트링
         * @private
         */
        _getColGroupMarkup: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                columnModelList = columnData.modelList,
                htmlList = [];

            _.each(columnWidthList, function(width, index) {
                htmlList.push(this.templateCol({
                    columnName: columnModelList[index]['columnName'],
                    width: width
                }));
            }, this);
            return htmlList.join('');
        },
        /**
         * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
         * @private
         */
        _onCheckCountChange: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                clearTimeout(this.timeoutForAllChecked);
                this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckState, this), 10);
            }
        },
        /**
         * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
         * @return {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
         * @private
         */
        _getHeaderMainCheckbox: function() {
            return this.$el.find('th[columnname="_button"] input');
        },
        /**
         * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
         * @private
         */
        _syncCheckState: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                var $input = this._getHeaderMainCheckbox(),
                    enableCount = 0,
                    checkedCount;
                /* istanbul ignore else */
                if ($input.length) {
                    checkedCount = this.grid.dataModel.getRowList(true).length;
                    this.grid.dataModel.forEach(function(row, key) {
                        var cellState = row.getCellState('_button');
                        if (!cellState.isDisabled && cellState.isEditable) {
                            enableCount++;
                        }
                    }, this);
                    $input.prop('checked', enableCount === checkedCount);
                }
            }
        },
        /**
         * column width 변경시 col 엘리먼트들을 조작하기 위한 헨들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');

            _.each(columnWidthList, function(columnWidth, index) {
                $colList.eq(index).css('width', columnWidth + 'px');
            });
        },
        /**
         * scroll left 값이 변경되었을 때 header 싱크를 맞추는 이벤트 핸들러
         * @param {Object} model    변경이 발생한 model 인스턴스
         * @param {Number} value    scrollLeft 값
         * @private
         */
        /* istanbul ignore next: scrollLeft 를 확인할 수 없음 */
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * 클릭 이벤트 핸들러
         * @param {Event} clickEvent    클릭이벤트
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target);

            /* istanbul ignore else */
            if ($target.closest('th').attr('columnname') === '_button' && $target.is('input')) {
                if ($target.prop('checked')) {
                    this.grid.checkAll();
                } else {
                    this.grid.uncheckAll();
                }
            }
        },

        /**
         * 랜더링
         * @return {View.Layout.Header}
         */
        render: function() {
            this.destroyChildren();

            var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
                whichSide: this.whichSide,
                grid: this.grid
            });
            if (!this.grid.option('scrollX')) {
                this.$el.css('overflow-x', 'hidden');
            }

            if (!this.grid.option('scrollY')) {
                this.$el.css('overflow-y', 'hidden');
            }

            this.$el.css({
                height: this.grid.dimensionModel.get('headerHeight')
            }).html(this.template({
                'colGroup' : this._getColGroupMarkup(),
                'tBody' : this._getTableBodyMarkup()
            }));


            this.$el.append(resizeHandler.render().el);
            return this;
        },
        /**
         * 컬럼 정보를 반환한다.
         * @return {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
         * @private
         */
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },

        /**
         * Header 의 body markup 을 생성한다.
         * @return {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
         * @private
         */
        _getTableBodyMarkup: function() {
            var hierarchyList = this._getColumnHierarchyList(),
                maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                rowMarkupList = new Array(maxRowCount),
                columnNameList = new Array(maxRowCount),
                colSpanList = [],
                rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1,
                rowSpan = 1,
                title,
                height,
                headerMarkupList;

            _.each(hierarchyList, function(hierarchy, i) {
                var length = hierarchyList[i].length,
                    curHeight = 0;
                _.each(hierarchy, function(columnModel, j) {
                    var columnName = columnModel['columnName'];

                    rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    height = rowHeight * rowSpan;

                    if (j === length - 1) {
                        height = (headerHeight - curHeight) - 2;
                    } else {
                        curHeight += height + 1;
                    }
                    if (columnNameList[j] === columnName) {
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    } else {
                        colSpanList[j] = 1;
                    }
                    columnNameList[j] = columnName;
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    rowMarkupList[j].push(this.templateHeader({
                        columnName: columnName,
                        height: height,
                        colspan: colSpanList[j],
                        rowspan: rowSpan,
                        title: columnModel['title']
                    }));
                }, this);
            }, this);
            headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
                return '<tr>' + rowMarkup.join('') + '</tr>';
            });

            return headerMarkupList.join('');
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
         * @return {number} 헤더 영역의 row 최대값
         * @private
         */
        _getHierarchyMaxRowCount: function(hierarchyList) {
            var lengthList = [0];
            _.each(hierarchyList, function(hierarchy) {
                lengthList.push(hierarchy.length);
            }, this);
            return Math.max.apply(Math, lengthList);
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
         * @return {Array}  계층구조 리스트
         * @private
         */
        _getColumnHierarchyList: function() {
            var columnModelList = this._getColumnData().modelList,
                hierarchyList;

            hierarchyList = _.map(columnModelList, function(columnModel) {
                return this._getColumnHierarchy(columnModel).reverse();
            }, this);

            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param {Object} columnModel 컬럼모델
         * @param {Array} [resultList]  결과로 메모이제이션을 이용하기 위한 인자값
         * @return {Array} 계층구조 결과값
         * @private
         */
        _getColumnHierarchy: function(columnModel, resultList) {
            var columnMergeList = this.grid.option('columnMerge');
            resultList = resultList || [];
            /* istanbul ignore else */
            if (columnModel) {
                resultList.push(columnModel);
                /* istanbul ignore else */
                if (columnMergeList) {
                    _.each(columnMergeList, function(columnMerge, i) {
                        if ($.inArray(columnModel['columnName'], columnMerge['columnNameList']) !== -1) {
                            resultList = this._getColumnHierarchy(columnMerge, resultList);
                        }
                    }, this);
                }
            }
            return resultList;
        }
    });

    /**
     * Reside Handler class
     * @constructor View.Layout.Header.ResizeHandler
     */
    View.Layout.Header.ResizeHandler = View.Base.extend(/**@lends View.Layout.Header.ResizeHandler.prototype */{
        tagName: 'div',
        className: 'resize_handle_container',
        events: {
            'mousedown .resize_handle' : '_onMouseDown',
            'click .resize_handle': '_onClick'
        },
        /**
         * 초기화 함수
         * @param {Object} options
         *      @param {String} [options.whichSide='R']  어느 영역의 handler 인지 여부.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: options.whichSide || 'R',
                isResizing: false,     //현재 resize 발생 상황인지
                $target: null,         //이벤트가 발생한 target resize handler
                differenceLeft: 0,
                initialWidth: 0,
                initialOffsetLeft: 0,
                initialLeft: 0
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
            if (this.grid instanceof View.Base) {
                this.listenTo(this.grid, 'rendered', $.proxy(this._refreshHandlerPosition, this, true));
            }
        },
        /**
         * resize handler 마크업 템플릿
         */
        template: _.template('' +
            '<div columnindex="<%=columnIndex%>" ' +
            'columnname="<%=columnName%>" ' +
            'class="resize_handle' +
            '<% if(isLast === true) ' +
            ' print(" resize_handle_last");%>' +
            '" ' +
            'style="<%=height%>" ' +
            'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
            '</div>'),
        /**
         * columnWidthList 와 columnModelList 를 함께 반환한다.
         * @return {{widthList: (Array|*), modelList: (Array|*)}}
         * @private
         */
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        /**
         * resize handler 마크업을 구성한다.
         * @return {String} resize handler 의 html 마크업 스트링
         * @private
         */
        _getResizeHandlerMarkup: function() {
            var columnData = this._getColumnData(),
                columnModelList = columnData.modelList,
                headerHeight = this.grid.dimensionModel.get('headerHeight'),
                length = columnModelList.length,
                resizeHandleMarkupList;

            resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
                return this.template({
                    columnIndex: index,
                    columnName: columnModel['columnName'],
                    isLast: index + 1 === length,
                    height: headerHeight
                });
            }, this);
            return resizeHandleMarkupList.join('');

        },
        /**
         * 랜더링 한다.
         * @return {View.Layout.Header.ResizeHandler}
         */
        render: function() {
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    'marginTop' : -headerHeight + 'px',
                    'height' : headerHeight + 'px'
                })
                .html(this._getResizeHandlerMarkup());

            //header 가 랜더링 된 이후 widthList 를 보정 하기위해 setTimeout 을 사용한다.
            this._refreshHandlerPosition(true);
            return this;
        },
        /**
         * 생성된 핸들러의 위치를 설정한다.
         * @private
         */
        _refreshHandlerPosition: function(isUpdateWidthList) {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                newColumnWidthList = [],
                $resizeHandleList = this.$el.find('.resize_handle'),
                $table = this.$el.parent().find('table:first'),
                isChanged = false,
                $handler,
                columnName,
                curPos = 0,
                border = 1,
                width;

            ne.util.forEachArray($resizeHandleList, function(item, index) {
                $handler = $resizeHandleList.eq(index);
                columnName = $handler.attr('columnname');
                width = $table.find('th[columnname="' + columnName + '"]').width();
                if (ne.util.isExisty(width)) {
                    isChanged = isChanged || (width !== columnWidthList[index]);
                } else {
                    width = columnWidthList[index];
                }
                curPos += width + border;
                $handler.css('left', (curPos - 3) + 'px');
                newColumnWidthList.push(width);
            });

            if (isUpdateWidthList) {
                this.grid.dimensionModel.setColumnWidthList(newColumnWidthList, this.whichSide);
            }
        },
        /**
         * 현재 mouse move resizing 중인지 상태 flag 반환
         * @return {boolean}    현재 resize 중인지 여부
         * @private
         */
        _isResizing: function() {
            return !!this.isResizing;
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent    마우스 이벤트 객체
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            this._startResizing(mouseDownEvent);
        },
        /**
         * click 이벤트 핸들러
         * @param {Event} clickEvent 마우스 이벤트 객체
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                index = parseInt($target.attr('columnindex'), 10),
                isClicked = $target.data('isClicked');

            if (isClicked) {
                this.grid.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
                this._clearClickedFlag($target);
                this._refreshHandlerPosition(true);
            } else {
                this._setClickedFlag($target);
            }
        },
        /**
         * 더블클릭을 확인하기 위한 isClicked 플래그를 설정한다.
         * @param {jQuery} $target 설정할 타겟 엘리먼트
         * @private
         */
        _setClickedFlag: function($target) {
            $target.data('isClicked', true);
            setTimeout($.proxy(this._clearClickedFlag, this, $target), 500);
        },

        /**
         * 더블클릭을 확인하기 위한 isClicked 를 제거한다.
         * @param {jQuery} $target 설정할 타겟 엘리먼트
         * @private
         */
        _clearClickedFlag: function($target) {
            $target.data('isClicked', false);
        },

        /**
         * mouseup 이벤트 핸들러
         * @private
         */
        _onMouseUp: function() {
            this._stopResizing();
        },
        /**
         * mousemove 이벤트 핸들러
         * @param {event} mouseMoveEvent    마우스 이벤트 객체
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            /* istanbul ignore else */
            if (this._isResizing()) {
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft,
                    width = this._calculateWidth(mouseMoveEvent.pageX),
                    index = parseInt(this.$target.attr('columnindex'), 10);

                this.$target.css('left', left + 'px');
                this.grid.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
                this._refreshHandlerPosition(true);
            }
        },
        /**
         * 너비를 계산한다.
         * @param {number} pageX    마우스의 x 좌표
         * @return {number} x좌표를 기준으로 계산한 width 값
         * @private
         */
        _calculateWidth: function(pageX) {
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        /**
         * 핸들러의 index 로부터 컬럼의 index 를 반환한다.
         * @param {number} index 핸들러의 index 값
         * @return {number} 컬럼 index 값
         * @private
         */
        _getHandlerColumnIndex: function(index) {
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param {event} mouseDownEvent 마우스 이벤트
         * @private
         */
        _startResizing: function(mouseDownEvent) {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $target = $(mouseDownEvent.target);

            this.isResizing = true;
            this.$target = $target;
            this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
            this.initialOffsetLeft = this.$el.offset().left;
            this.initialWidth = columnWidthList[$target.attr('columnindex')];
            $('body')
                .bind('mousemove', $.proxy(this._onMouseMove, this))
                .bind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'col-resize');

        },
        /**
         * resize stop 세팅
         * @private
         */
        _stopResizing: function() {
            this.isResizing = false;
            this.$target = null;
            this.initialLeft = 0;
            this.initialOffsetLeft = 0;
            this.initialWidth = 0;
            $('body')
                .unbind('mousemove', $.proxy(this._onMouseMove, this))
                .unbind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'default');
        },
        /**
         * 소멸자
         */
        destroy: function() {
            this.stopListening();
            this._stopResizing();
            this.destroyChildren();
            this.remove();
        }
    });

/**
 * @fileoverview 툴바영역 클래스
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  툴바 영역
     *  @constructor View.Layout.Toolbar
     */
    View.Layout.Toolbar = View.Base.extend(/**@lends View.Layout.Toolbar.prototype */{
        tagName: 'div',
        className: 'toolbar',
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                controlPanel: null,
                resizeHandler: null,
                pagination: null
            });
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar}
         */
        render: function() {
            this.destroyChildren();
            var option = this.grid.option('toolbar'),
                resizeHandler, controlPanel, pagination;

            this.$el.empty();
            if (option && option.hasControlPanel) {
                controlPanel = this.createView(View.Layout.Toolbar.ControlPanel, {
                    grid: this.grid
                });
                this.$el.append(controlPanel.render().el).css('display', 'block');
            }

            if (option && option.hasResizeHandler) {
                resizeHandler = this.createView(View.Layout.Toolbar.ResizeHandler, {
                    grid: this.grid
                });
                this.$el.append(resizeHandler.render().el).css('display', 'block');
            }

            if (option && option.hasPagination) {
                pagination = this.createView(View.Layout.Toolbar.Pagination, {
                    grid: this.grid
                });
                this.$el.append(pagination.render().el).css('display', 'block');
            }
            this.setOwnProperties({
                controlPanel: controlPanel,
                resizeHandler: resizeHandler,
                pagination: pagination
            });
            return this;
        }
    });
    /**
     * 툴바 영역 컨트롤 패널 UI
     * @constructor View.Layout.Toolbar.ControlPanel
     */
    View.Layout.Toolbar.ControlPanel = View.Base.extend(/**@lends View.Layout.Toolbar.ControlPanel.prototype */{
        tagName: 'div',
        className: 'btn_setup',
        template: _.template(
                '<a href="#" class="excel_download_button btn_text excel_all" style="display: inline-block;">' +
                '<span><em class="f_bold p_color5">전체엑셀다운로드</em></span>' +
                '</a>' +
                '<a href="#" class="excel_download_button btn_text excel_grid" style="display: inline-block;">' +
                '<span><em class="excel">엑셀다운로드</em></span>' +
                '</a>' +
                '<a href="#" class="grid_configurator_button btn_text" style="display: none;">' +
                '<span><em class="grid">그리드설정</em></span>' +
                '</a>'),
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar.ControlPanel}
         */
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
    /**
     * 툴바 영역 resize handler
     * @constructor View.Layout.Toolbar.ResizeHandler
     */
    View.Layout.Toolbar.ResizeHandler = View.Base.extend(/**@lends View.Layout.Toolbar.ResizeHandler.prototype */{
        tagName: 'div',
        className: 'height_resize_bar',
        events: {
            'mousedown': '_onMouseDown'
        },
        template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
        /**
         * 생성자 함수
         */
        initialize: function() {
            this.timeoutIdForResize = 0;
            View.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _attachMouseEvent: function() {
            $(document).on('mousemove', $.proxy(this._onMouseMove, this));
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
            $(document).on('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _detachMouseEvent: function() {
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent 마우스 이벤트
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            mouseDownEvent.preventDefault();
            $(document.body).css('cursor', 'row-resize');
            this.grid.updateLayoutData();
            this._attachMouseEvent();
        },
        /**
         * mousemove 이벤트 핸들러
         * @param {event} mouseMoveEvent 마우스 이벤트
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            clearTimeout(this.timeoutIdForResize);

            var dimensionModel = this.grid.dimensionModel,
                offsetTop = dimensionModel.get('offsetTop'),
                headerHeight = dimensionModel.get('headerHeight'),
                rowHeight = dimensionModel.get('rowHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight'),
                bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());


            //매번 수행하면 성능이 느려지므로, resize 이벤트가 발생할 시 천첮히 업데이트한다.
            this.timeoutIdForResize = setTimeout(function() {
                dimensionModel.set({
                    bodyHeight: bodyHeight
                });
            }, 0);

        },
        /**
         * mouseup 이벤트 핸들러
         * @private
         */
        _onMouseUp: function() {
            $(document.body).css('cursor', 'default');
            this._detachMouseEvent();
        },
        /**
         * selection start 이벤트 핸들러
         * @return {boolean}    기본 동작 방지를 위해 무조건 false 를 반환한다.
         * @private
         */
        _onSelectStart: function(e) {
            e.preventDefault();
            return false;
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar.ResizeHandler}
         */
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        },
        /**
         * 소멸자
         */
        destroy: function() {
            this.stopListening();
            this._onMouseUp();
            this.destroyChildren();
            this.remove();
        }
    });
    /**
     * 툴바의 Pagination 영역
     * @constructor View.Layout.Toolbar.Pagination
     */
    View.Layout.Toolbar.Pagination = View.Base.extend(/**@lends Base.prototype */{
        tagName: 'div',
        className: 'pagination',
        template: _.template('' +
            '<a href="#" class="pre_end">맨앞</a>' +
            '<a href="#" class="pre">이전</a> ' +
            '<a href="#" class="next">다음</a>' +
            '<a href="#" class="next_end">맨뒤</a>'
        ),
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                instance: null
            });
        },
        /**
         * pagination 을 rendering 한다.
         * @return {View.Layout.Toolbar.Pagination}
         */
        render: function() {
            this.destroyChildren();
            this.$el.empty().html(this.template());
            this._setPaginationInstance();
            return this;
        },
        /**
         * pagination instance 를 설정한다.
         * @private
         */
        _setPaginationInstance: function() {
            var PaginationClass = ne && ne.component && ne.component.Pagination,
                pagination = this.instance;
            if (!pagination && PaginationClass) {
                pagination = new PaginationClass({
                    itemCount: 1,
                    itemPerPage: 1
                }, this.$el);
            }
            this.setOwnProperties({
                instance: pagination
            });
        }
    });



/**
 * @fileoverview Row Painter 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Row Painter
     * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
     * @constructor View.Painter.Row
     */
    View.Painter.Row = View.Base.Painter.extend(/**@lends View.Painter.Row.prototype */{
        eventHandler: {
            'mousedown' : '_onMouseDown'
        },
        /**
         * TR 마크업 생성시 사용할 템플릿
         */
        baseTemplate: _.template('' +
            '<tr ' +
            'key="<%=key%>" ' +
            'class="<%=className%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            '</tr>'),
        /**
         * 초기화 함수
         * @param {object} options
         *      @param {string} [options.whichSide='R']   어느 영역에 속하는 row 인지 여부. 'L|R' 중 하나를 지정한다.
         *      @param {jquery} options.$parent 부모 table body jQuery 엘리먼트
         *      @param {object} options.collection change 를 감지할 collection 객체
         */
        initialize: function(options) {
            View.Base.Painter.prototype.initialize.apply(this, arguments);

            var whichSide = (options && options.whichSide) || 'R',
                focusModel = this.grid.focusModel;

            this.setOwnProperties({
                $parent: options.$parent,        //부모 table body element
                collection: options.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
                cellHandlerList: [],
                _isEventAttached: false
            });

            //listener 등록
            if (this.collection) {
                this.collection.forEach(function(row) {
                    this.listenTo(row, 'change', this._onModelChange, this);
                }, this);
            }
            this.listenTo(focusModel, 'select', this._onSelect, this)
                .listenTo(focusModel, 'unselect', this._onUnselect, this)
                .listenTo(focusModel, 'focus', this._onFocus, this)
                .listenTo(focusModel, 'blur', this._onBlur, this);
        },
        /**
         * detachHandlerAll 을 호출하고 기본 destroy 로직을 수행한다.
         */
        destroy: function() {
            //this.detachHandlerAll();
            this.stopListening();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandlerAll
         * event handler 를 전체 tr에 한번에 붙인다.
         * 자기 자신의 이벤트 핸들러 및 cellFactory 의 이벤트 헨들러를 bind 한다.
         */
        attachHandlerAll: function() {
            this.attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         * 자기 자신의 이벤트 핸들러 및 cellFactory 의 이벤트 헨들러를 unbind 한다.
         */
        detachHandlerAll: function() {
            if (this._isEventAttached) {
                this.detachHandler(this.$parent);
                this.grid.cellFactory.detachHandler(this.$parent);
            }
        },

        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent 이벤트 객체
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $td = $(mouseDownEvent.target).closest('td'),
                $tr = $(mouseDownEvent.target).closest('tr'),
                columnName = $td.attr('columnName'),
                rowKey = $tr.attr('key');
            this.grid.focus(rowKey, columnName);
            if (this.grid.option('selectType') === 'radio') {
                this.grid.check(rowKey);
            }
            this.grid.selection.onMouseDown(mouseDownEvent);
        },
        /**
         * model 변경 시 이벤트 핸들러
         * @param {object} model    변화가 일어난 모델 인스턴스
         * @private
         */
        _onModelChange: function(model) {
            var editType,
                cellInstance,
                $trCache = {},
                rowKey,
                $tr;

            _.each(model.changed, function(cellData, columnName) {
                rowKey = cellData.rowKey;
                $trCache[rowKey] = $trCache[rowKey] || this._getRowElement(rowKey);
                $tr = $trCache[rowKey];

                if (columnName !== '_extraData') {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, $tr);
                }
            }, this);
        },
        /**
         * focusModel 의 select 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey 대상의 키값
         * @private
         */
        _onSelect: function(rowKey) {
            this._setCssSelect(rowKey, true);
        },
        /**
         * focusModel 의 unselect 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey 대상의 키값
         * @private
         */
        _onUnselect: function(rowKey) {
            this._setCssSelect(rowKey, false);
        },
        /**
         * 인자로 넘어온 rowKey 에 해당하는 행(각 TD)에 Select 디자인 클래스를 적용한다.
         * @param {(Number|String)} rowKey 대상의 키값
         * @param {Boolean} isSelected  css select 를 수행할지 unselect 를 수행할지 여부
         * @private
         */
        _setCssSelect: function(rowKey, isSelected) {
            var grid = this.grid,
                columnModelList = this.columnModelList,
                columnName,
                $trCache = {},
                $tr, $td,
                mainRowKey;

            _.each(columnModelList, function(columnModel) {
                columnName = columnModel['columnName'];
                mainRowKey = grid.dataModel.getMainRowKey(rowKey, columnName);

                $trCache[mainRowKey] = $trCache[mainRowKey] || this._getRowElement(mainRowKey);
                $tr = $trCache[mainRowKey];
                $td = $tr.find('td[columnname="' + columnName + '"]');
                if ($td.length) {
                    isSelected ? $td.addClass('selected') : $td.removeClass('selected');
                }
            }, this);
        },
        /**
         * focusModel 의 blur 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 제거한다.
         * @param {(Number|String)} rowKey 대상의 키값
         * @param {String} columnName 컬럼명
         * @private
         */
        _onBlur: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            if ($td.length) {
                $td.removeClass('focused');
            }
        },
        /**
         * focusModel 의 _onFocus 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 추가한다.
         * @param {(Number|String)} rowKey 대상의 키값
         * @param {String} columnName 컬럼명
         * @private
         */
        _onFocus: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            if ($td.length) {
                $td.addClass('focused');
            }
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {(string|number)} rowKey rowKey 대상의 키값
         * @return {jquery} 조회한 tr jquery 엘리먼트
         * @private
         */
        _getRowElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
         * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
         * @param {String} columnName 컬럼명
         * @param {Object} cellData 셀 데이터
         * @return {String} cellFactory 에서 사용될 editType
         * @private
         */
        _getEditType: function(columnName, cellData) {
            var editType = this.grid.columnModel.getEditType(columnName);
            if (!cellData.isEditable && columnName !== '_number') {
                editType = 'normal';
            }
            return editType;
        },
        /**
         * tr html 마크업을 반환한다.
         * @param {object} model 마크업을 생성할 모델 인스턴스
         * @return {string} tr 마크업 문자열
         */
        getHtml: function(model) {
            /* istanbul ignore if */
            if (ne.util.isUndefined(model.get('rowKey'))) {
               return '';
            }

            var columnModelList = this.columnModelList,
                cellFactory = this.grid.cellFactory,
                columnName, cellData, editType, cellInstance,
                html = '';
            this.cellHandlerList = [];
            _.each(columnModelList, function(columnModel) {
                columnName = columnModel['columnName'];
                cellData = model.get(columnName);
                /* istanbul ignore else */
                if (cellData && cellData['isMainRow']) {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.cellHandlerList.push({
                        selector: 'td[columnName="' + columnName + '"]',
                        cellInstance: cellInstance
                    });
                }
            }, this);

            return this.baseTemplate({
                key: model.get('rowKey'),
                height: this.grid.dimensionModel.get('rowHeight'),
                contents: html,
                className: ''
            });

        }
    });

/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Cell Painter Base
     * @extends {View.Base.Painter}
     * @constructor View.Base.Painter.Cell
     */
    View.Base.Painter.Cell = View.Base.Painter.extend(/**@lends View.Base.Painter.Cell.prototype*/{
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록. 필요에 따라 확장 시 재정의 한다.
         */
        redrawAttributes: ['isEditable', 'optionList', 'value'],

        /**
         * keyDownEvent 발생시 기본 동작 switch
         */
        _defaultKeyDownSwitch: {
            'ESC': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'TAB': function(keyDownEvent, param) {
//                this.grid.focusClipboard();
                if (keyDownEvent.shiftKey) {
                    //이전 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                } else {
                    //이후 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                }
            },
            'defaultAction': function(keyDownEvent, param) {
            }
        },
        /**
         * event handler
         */
        eventHandler: {},
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.prototype.initialize.apply(this, arguments);
            this.initializeEventHandler();
            this.setOwnProperties({
                _keyDownSwitch: $.extend({}, this._defaultKeyDownSwitch)
            });
        },

        /**
         * RowPainter 에서 Render model 변경 감지 시 RowPainter 에서 호출하는 onChange 핸들러
         * @param {object} cellData Model 의 셀 데이터
         * @param {jQuery} $tr  tr 에 해당하는 jquery 로 감싼 html 엘리먼트
         */
        onModelChange: function(cellData, $tr) {
            var $td = $tr.find('td[columnname="' + cellData.columnName + '"]'),
                isRedraw = false,
                hasFocusedElement;

            ne.util.forEachArray(this.redrawAttributes, function(attribute) {
                if ($.inArray(attribute, cellData.changed) !== -1) {
                    isRedraw = true;
                    return false;
                }
            }, this);

            $td.attr('class', this._getClassNameList(cellData).join(' '));
            try {
                /*
                IE 7, 8 에서 $td.find(':focus') 호출시 unexpected error 발생하는 경우가 발생하여 try/catch 함.
                 */
                hasFocusedElement = !!($td.find(':focus').length);
            } catch (e) {
                hasFocusedElement = false;
            }

            if (isRedraw) {
                this.redraw(cellData, $td, hasFocusedElement);
                if (hasFocusedElement) {
                    this.focusIn($td);
                }
            } else {
                this.setElementAttribute(cellData, $td, hasFocusedElement);
            }
        },
        /**
         * keyDown 이 발생했을 때, switch object 에서 필요한 공통 파라미터를 생성한다.
         * @param {Event} keyDownEvent  이벤트 객체
         * @return {{keyDownEvent: *, $target: (*|jQuery|HTMLElement), focusModel: (grid.focusModel|*), rowKey: *, columnName: *, keyName: *}}
         * _keyDownSwitch 에서 사용될 공통 파라미터 객체
         * @private
         */
        _getParamForKeyDownSwitch: function(keyDownEvent) {
            var grid = this.grid,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                focused = grid.focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName;
            return {
                keyDownEvent: keyDownEvent,
                $target: $(keyDownEvent.target),
                focusModel: grid.focusModel,
                rowKey: rowKey,
                columnName: columnName,
                keyName: grid.keyName[keyCode]
            };
        },
        /**
         * keyDownSwitch 를 수행한다.
         * @param {Event} keyDownEvent 이벤트 객체
         * @return {boolean} 정의된 keyDownSwitch 가 존재하는지 여부. Default 액션을 수행한 경우 false 를 반환한다.
         * @private
         */
        _executeKeyDownSwitch: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                keyName = this.grid.keyName[keyCode],
                param = this._getParamForKeyDownSwitch(keyDownEvent);
            (this._keyDownSwitch[keyName] || this._keyDownSwitch['defaultAction']).call(this, keyDownEvent, param);
            return !!this._keyDownSwitch[keyName];
        },
        /**
         * keyDownSwitch 에 정의된 액션을 override 한다.
         *
         * @param {(String|Object)} keyName  정의된 key 이름. Object 형태일 경우 기존 keyDownSwitch 를 확장한다.
         * @param {function} [fn] keyDown 이 발생하였을 경우 수행할 액션
         */
        setKeyDownSwitch: function(keyName, fn) {
            if (typeof keyName === 'object') {
                this._keyDownSwitch = $.extend(this._keyDownSwitch, keyName);
            } else {
                this._keyDownSwitch[keyName] = fn;
            }
        },

        /**
         * keyDown 이벤트 핸들러
         * @param {event} keyDownEvent  이벤트 객체
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            if (this._executeKeyDownSwitch(keyDownEvent)) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * cellData에 설정된 데이터를 기반으로 classNameList 를 생성하여 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Array} 생성된 css 디자인 클래스 배열
         * @private
         */
        _getClassNameList: function(cellData) {
            var focused = this.grid.focusModel.which(),
                columnName = cellData.columnName,
                focusedRowKey = this.grid.dataModel.getMainRowKey(focused.rowKey, columnName),
                classNameList = [],
                classNameMap = {},
                privateColumnMap = {
                    '_button': true,
                    '_number': true
                },
                isPrivateColumnName = !!privateColumnMap[columnName];

            if (focusedRowKey === cellData.rowKey) {
                classNameMap['selected'] = true;
                if (focused.columnName === columnName) {
                    classNameMap['focused'] = true;
                }
            }
            if (cellData.className) {
                classNameMap[cellData.className] = true;
            }

            if (cellData.isEditable && !isPrivateColumnName) {
                classNameMap['editable'] = true;
            }

            if (cellData.isDisabled) {
                classNameMap['disabled'] = true;
            }

            ne.util.forEach(classNameMap, function(val, className) {
                classNameList.push(className);
            });

            return classNameList;
        },
        /**
         * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
         * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
         * @private
         */
        _getContentHtml: function(cellData) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                editOption = columnModel.editOption,
                content;

            //if (!ne.util.isNumber(cellData.value) && !cellData.value) {
            if (!ne.util.isExisty(cellData.value)) {
                cellData.value = columnModel.defaultValue;
            }

            content = this.getContentHtml(cellData);
            if (editOption) {
                if (editOption.beforeText) {
                    content = columnModel.editOption.beforeText + content;
                }
                if (editOption.afterText) {
                    content = content + columnModel.editOption.afterText;
                }
            }
            return content;
        },
        /**
         * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
         * td 단위의 html 문자열을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {string} td 마크업 문자열
         */
        getHtml: function(cellData) {
            var attributeString = Util.getAttributesString(this.getAttributes(cellData)),
                htmlArr = [];

            htmlArr.push('<td');
            htmlArr.push(' columnName="');
            htmlArr.push(cellData.columnName);
            htmlArr.push('" ');
            htmlArr.push(cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '');
            htmlArr.push(' class="');
            htmlArr.push(this._getClassNameList(cellData).join(' '));
            htmlArr.push('" ');
            htmlArr.push(attributeString);
            htmlArr.push(' edit-type="');
            htmlArr.push(this.getEditType());
            htmlArr.push('">');
            htmlArr.push(this._getContentHtml(cellData));
            htmlArr.push('</td>');
            return htmlArr.join('');
        },
        /**
         * 이미 rendering 되어있는 TD 엘리먼트 전체를 다시 랜더링 한다.
         * @param {object} cellData Model 의 셀 데이터
         * @param {jQuery} $td  td 에 해당하는 jquery 로 감싼 html 엘리먼트
         */
        redraw: function(cellData, $td) {
            this.detachHandler($td);
            var attributes = {
                'class': this._getClassNameList(cellData).join(' ')
            };
            if (cellData.rowSpan) {
                attributes['rowSpan'] = cellData.rowSpan;
            }
            attributes['edit-type'] = this.getEditType();
            attributes = $.extend(attributes, this.getAttributes(cellData));
            $td.attr(attributes);
            $td.html(this._getContentHtml(cellData));
            this.attachHandler($td);
        },
        /**
         * 인자로 받은 element 의 cellData 를 반환한다.
         * @param {jQuery} $target  조회할 엘리먼트
         * @return {Object} 조회한 cellData 정보
         * @private
         */
        _getCellData: function($target) {
            var cellData = this._getCellAddress($target);
            return this.grid.renderModel.getCellData(cellData.rowKey, cellData.columnName);
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {{rowKey: String, columnName: String}} rowKey 와 columnName 정보
         * @private
         */
        _getCellAddress: function($target) {
            return {
                rowKey: this.getRowKey($target),
                columnName: this.getColumnName($target)
            };
        },
        /**
         * 인자로 받은 element 로 부터 columnName 을 반환한다.
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {String} 컬럼명
         */
        getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 를 반환한다.
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {String} 행의 키값
         */
        getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        /**
         * columnModel 을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {*|Object} 컬럼모델
         */
        getColumnModel: function(cellData) {
            return this.grid.columnModel.getColumnModel(cellData.columnName);
        },
        /**
         * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Object} td 에 지정할 attribute 데이터
         */
        getAttributes: function(cellData) {
            var columnModel = this.getColumnModel(cellData);
            return {
                align: columnModel.align || 'left'
            };
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * - 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'normal';
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {},
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            return '';
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focuse 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {}

    });


    /**
     * Cell Painter 추가 시 반드시 필요한 Interface 정의
     * @interface
     */
    View.Base.Painter.Cell.Interface = function() {};
    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    View.Base.Painter.Cell.Interface.prototype.getEditType = function() {};
    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    View.Base.Painter.Cell.Interface.prototype.focusIn = function($td) {};
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
//    View.Base.Painter.Cell.Interface.prototype.focusOut = function($td) {};
    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    View.Base.Painter.Cell.Interface.prototype.getContentHtml = function(cellData) {};
    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    View.Base.Painter.Cell.Interface.prototype.setElementAttribute = function(cellData, $td, hasFocusedElement) {};


/**
 * @fileoverview 리스트 형태의 Cell(select, radio, checkbox) Painter 가 정의된 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * editOption 에 list 를 가지고 있는 형태의 추상 클래스
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.List
     */
    View.Painter.Cell.List = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.List.prototype */{
        redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],
        eventHandler: {
        },
        /**
         * 생성자 메서드
         */
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {},
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {},
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jQuery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        },
        /**
         * List Type 의 option list 를 반환하는 메서드
         *
         * cellData 의 optionsList 가 존재한다면 cellData 의 옵션 List 를 반환하고,
         * 그렇지 않다면 columnModel 의 optionList 를 반환한다.
         * @param {Object} cellData 모델의 셀 데이터
         * @return {Array} 옵션 리스트
         */
        getOptionList: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
            return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
        },
        /**
         * blur 이벤트 핸들러
         * @param {Event} blurEvent 이벤트 객체
         * @private
         */
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target);
            $target.closest('td').data('isFocused', false);
        },
        /**
         * focus 이벤트 핸들러
         * @param {Event} focusEvent 이벤트 객체
         * @private
         */
        _onFocus: function(focusEvent) {
            var $target = $(focusEvent.target);
            $target.closest('td').data('isFocused', true);
        }
    });

    /**
     * select type 의 Cell renderer
     *
     * @extends {View.Painter.Cell.List}
     * @constructor View.Painter.Cell.List.Select
     */
    View.Painter.Cell.List.Select = View.Painter.Cell.List.extend(/**@lends View.Painter.Cell.List.Select.prototype */{
        /**
         * 생성자 메서드
         */
        initialize: function() {
            View.Painter.Cell.List.prototype.initialize.apply(this, arguments);

            this.setKeyDownSwitch({
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                }
            });
        },
        eventHandler: {
            'change select' : '_onChange',
            'keydown select' : '_onKeyDown',
            'blur select' : '_onBlur',
            'focus select' : '_onFocus'
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'select';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            /* istanbul ignore next */
            $td.find('select').focus();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var list = this.getOptionList(cellData),
                isDisabled = cellData.isDisabled,
                htmlArr = [];

            htmlArr.push('<select name="' + Util.getUniqueKey() + '"');
            htmlArr.push(isDisabled ? ' disabled ' : '');
            htmlArr.push('>');

            ne.util.forEachArray(list, function(item) {
                htmlArr.push('<option ');
                htmlArr.push('value="' + item.value + '"');
                //option의 value 는 문자열 형태인데, cellData 의 변수 type과 관계없이 비교하기 위해 == 연산자를 사용함
                if (cellData.value == item.value) {
                    htmlArr.push(' selected');
                }
                htmlArr.push(' >');
                htmlArr.push(item.text);
                htmlArr.push('</option>');
            });

            htmlArr.push('</select>');
            return htmlArr.join('');

        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var $select = $td.find('select');
            /*
            키보드 상하로 조작시 onChange 콜백에서 false 리턴시 이전 값으로
            돌아가지 않는 현상때문에 blur focus 를 수행한다.
             */

            /* istanbul ignore next: blur 확인 불가 */
            if (hasFocusedElement) {
                $select.blur();
            }
            $select.val(cellData.value);

            /* istanbul ignore next: focus 확인 불가 */
            if (hasFocusedElement) {
                $select.focus();
            }
        },
        /**
         * change 이벤트 핸들러
         * @param {Event} changeEvent   이벤트 객체
         * @private
         */
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target),
                grid = this.grid;
            grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * checkbox, radio button type 의 Cell renderer
     *
     * @extends {View.Painter.Cell.List}
     * @constructor View.Painter.Cell.List.Button
     */
    View.Painter.Cell.List.Button = View.Painter.Cell.List.extend(/**@lends View.Painter.Cell.List.Button.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Painter.Cell.List.prototype.initialize.apply(this, arguments);
            this.setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    param.$target.trigger('click');
                },
                'LEFT_ARROW': function(keyDownEvent, param) {
                    this._focusPrevInput(param.$target);
                },
                'RIGHT_ARROW': function(keyDownEvent, param) {
                    this._focusNextInput(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'TAB': function(keyDownEvent, param) {
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동
                        if (!this._focusPrevInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                        }
                    } else {
                        //이후 cell 로 focus 이동
                        if (!this._focusNextInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                        }
                    }
                }
            });
        },
        eventHandler: {
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'button';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            /* istanbul ignore next: focus 확인 불가 */ $td.find('input').eq(0).focus();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var list = this.getOptionList(cellData),
                columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                checkedMap = {},
                htmlArr = [],
                name = Util.getUniqueKey(),
                isDisabled = cellData.isDisabled,
                id;

            ne.util.forEachArray(checkedList, function(item) {
                checkedMap[item] = true;
            });

            ne.util.forEachArray(list, function(item) {
                id = name + '_' + item.value;

                htmlArr.push('<input type="');
                htmlArr.push(columnModel.editOption.type);
                htmlArr.push('" name="');
                htmlArr.push(name);
                htmlArr.push('" id="');
                htmlArr.push(id);
                htmlArr.push('" value="');
                htmlArr.push(item.value);
                htmlArr.push('" ');
                htmlArr.push(checkedMap[item.value] ? 'checked' : '');
                htmlArr.push(isDisabled ? 'disabled' : '');
                htmlArr.push('/>');

                if (item.text) {
                    htmlArr.push('<label for="');
                    htmlArr.push(id);
                    htmlArr.push('" style="margin-right:10px">');
                    htmlArr.push(item.text);
                    htmlArr.push('</label>');
                }

            }, this);

            return htmlArr.join('');
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var value = cellData.value,
                checkedList = ('' + value).split(',');

            $td.find('input:checked').prop('checked', false);

            ne.util.forEachArray(checkedList, function(item) {
                $td.find('input[value="' + item + '"]').prop('checked', true);
            });
        },
        /**
         * 다음 input 에 focus 한다
         * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
         * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
         * @private
         */
        _focusNextInput: function($currentInput) {
            return this._focusTargetInput($currentInput, 'next');
        },
        /**
         * 이전 input 에 focus 한다.
         * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
         * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
         * @private
         */
        _focusPrevInput: function($currentInput) {
            return this._focusTargetInput($currentInput, 'prev');
        },
        /**
         * 이전 혹은 다음 input 에 focus 한다.
         * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
         * @param {string} direction 방향 'next|prev'
         * @return {boolean} 해당 엘리먼트에 focus 되었는지 여부
         * @private
         */
        _focusTargetInput: function($currentInput, direction) {
            var $target = $currentInput,
                find;

            if (direction === 'next') {
                find = function($target) {
                    return $target.next();
                };
            } else if (direction === 'prev') {
                find = function($target) {
                    return $target.prev();
                };
            }

            do {
                $target = find($target);
            } while ($target.length && !$target.is('input'));

            if ($target.length) {
                $target.focus();
                return true;
            } else {
                return false;
            }
        },
        /**
         * check 된 button 의 값들을 가져온다. onChange 이벤트 핸들러에서 호출한다.
         * @param {jQuery} $target 이벤트가 발생한 targetElement
         * @return {Array}  check 된 값들의 결과 배열
         * @private
         */
        _getCheckedValueList: function($target) {
            var $checkedList = $target.closest('td').find('input:checked'),
                checkedList = [];

            ne.util.forEachArray($checkedList, function($checked, index) {
                checkedList.push($checkedList.eq(index).val());
            });

            return checkedList;
        },
        /**
         * onChange 이벤트 핸들러
         * @param {Event} changeEvent 이벤트 객체
         * @private
         */
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddress = this._getCellAddress($target);
            this.grid.setValue(cellAddress.rowKey, cellAddress.columnName, this._getCheckedValueList($target).join(','));
        }

    });

/**
 * @fileoverview 기본 Cell (일반, 숫자, 메인 Checkbox) 관련 Painter 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * editOption 이 적용되지 않은 cell 의 Painter
     * @constructor View.Painter.Cell.Normal
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.Normal = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.Normal.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|select|button|text|text-convertible'
         */
        getEditType: function() {
            return 'normal';
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(columnName),
                rowKey = cellData.rowKey;
            if (ne.util.isFunction(columnModel.formatter)) {
                value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).attributes, columnModel);
            }
            return value;
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        /* istanbul ignore next */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {}
    });
    /**
     * Number Cell 의 Painter
     * @constructor View.Painter.Cell.Normal.Number
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.Normal.Number = View.Painter.Cell.Normal.extend(/**@lends View.Painter.Cell.Normal.Number.prototype */{
        redrawAttributes: [],
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Painter.Cell.Normal.prototype.initialize.apply(this, arguments);
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return '_number';
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            return cellData.value;
        }
    });
    /**
     * checkbox 혹은 radiobox 형태의 Main Button Painter
     * @constructor View.Painter.Cell.MainButton
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.MainButton = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.MainButton.prototype */{
        /**
         * rendering 해야하는 cellData 의 변경 목록
         */
        redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
            this.setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'LEFT_ARROW': function(keyDownEvent, param) {},
                'RIGHT_ARROW': function(keyDownEvent, param) {},
                'ESC': function(keyDownEvent, param) {}
            });
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return '_button';
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var isDisabled = cellData.isDisabled,
                htmlArr = [];
            htmlArr.push('<input type="');
            htmlArr.push(this.grid.option('selectType'));
            htmlArr.push('" name="');
            htmlArr.push(this.grid.id);
            htmlArr.push('" ');
            htmlArr.push((!!cellData.value) ? 'checked' : '');
            htmlArr.push(isDisabled ? 'disabled' : '');
            htmlArr.push('/>');
            return htmlArr.join('');
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        /* istanbul ignore next */
        focusIn: function($td) {
            //아무것도 안하도록 변경
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var $input = $td.find('input'),
                isChecked = $input.prop('checked');
            if (isChecked !== !!cellData.value) {
                $input.prop('checked', cellData.value);
            }
        },
        /**
         * checked 를 toggle 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        toggle: function($td) {
            var $input = $td.find('input');
            if (this.grid.option('selectType') === 'checkbox') {
                $input.trigger('click');
            }
        },
        /**
         * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Object} td 에 지정할 attribute 데이터
         */
        getAttributes: function(cellData) {
            return {
                align: 'center'
            };
        },
        /**
         * onChange 이벤트 핸들러
         * @param {Event} changeEvent 이벤트 객체
         * @private
         */
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                rowKey = this.getRowKey($target);
            this.grid.setValue(rowKey, '_button', $target.prop('checked'));
        },
        /**
         * TD 전체 mousedown 이벤트 발생시 checkbox 클릭 이벤트를 발생시킨다.
         * @param {Event} mouseDownEvent 이벤트 객체
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!$target.is('input')) {
                $target.find('input').trigger('click');
            }
        }
    });

/**
 * @fileoverview Text 편집 가능한 Cell Painter
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * text 타입의 cell renderer
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text
     */
    View.Painter.Cell.Text = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.Text.prototype */{
        redrawAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });

            this.setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target.closest('td'));
                },
                'ESC': function(keyDownEvent, param) {
                    this._restore(param.$target);
                    this.focusOut(param.$target.closest('td'));
                }
            });
        },
        template: _.template('<input type="<%=type%>" value="<%=value%>" name="<%=name%>" align="center" <%=disabled%> maxLength="<%=maxLength%>"/>'),
        /**
         * input type 을 반환한다.
         * @return {string} input 타입
         * @private
         */
        _getInputType: function() {
            return 'text';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        /* istanbul ignore next: focus, select 를 검증할 수 없음 */
        focusIn: function($td) {
            var $input = $td.find('input');
            Util.form.setCursorToEnd($input.get(0));
            $input.focus().select();

        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var columnModel = this.getColumnModel(cellData),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
                htmlArr = [];

            htmlArr.push('<input type="');
            htmlArr.push(this._getInputType());
            htmlArr.push('" value="');
            htmlArr.push(value);
            htmlArr.push('" name="');
            htmlArr.push(Util.getUniqueKey());
            htmlArr.push('" align="center" ');
            htmlArr.push(cellData.isDisabled ? 'disabled' : '');
            htmlArr.push(' maxLength="');
            htmlArr.push(columnModel.editOption.maxLength);
            htmlArr.push('"/>');

            return htmlArr.join('');
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var isValueChanged = $.inArray('value', cellData.changed) !== -1,
                $input = $td.find('input');

            if (isValueChanged) {
                $input.val(cellData.value);
            }
            $input.prop('disabled', cellData.isDisabled);
        },
        /**
         * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
         * @param {jQuery} $input   인풋 jquery 엘리먼트
         * @return {Boolean}    값의 변경여부
         * @private
         */
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        /**
         * 원래 text로 값을 되돌린다.
         * @param {jQuery} $input 인풋 jquery 엘리먼트
         * @private
         */
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * blur 이벤트 핸들러
         * @param {event} blurEvent 이벤트 객체
         * @private
         */
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target),
                rowKey = this.getRowKey($target),
                columnName = this.getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
            this.grid.selection.enable();
        },
        /**
         * focus 이벤트 핸들러
         * @param {Event} focusEvent 이벤트 객체
         * @private
         */
        _onFocus: function(focusEvent) {
            var $input = $(focusEvent.target);
            this.originalText = $input.val();
            this.grid.selection.disable();
        }
    });
    /**
     * Password 타입의 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @constructor View.Painter.Cell.Text.Password
     */
    View.Painter.Cell.Text.Password = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Password.prototype */{
        initialize: function(attributes, options) {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
        },
        /**
         * input type 을 반환한다.
         * @return {string} input 타입
         * @private
         */
        _getInputType: function() {
            return 'password';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-password';
        }
    });

    /**
     * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text.Convertible
     */
    View.Painter.Cell.Text.Convertible = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Convertible.prototype */{
        /**
         * 더블클릭으로 간주할 time millisecond 설정
         * @type {number}
         */
        doubleClickDuration: 800,
        redrawAttributes: ['isDisabled', 'isEditable', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0,
                editingCell: {
                    rowKey: null,
                    columnName: '',
                    $clickedTd: null
                },
                clicked: {
                    rowKey: null,
                    columnName: null
                }
            });
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-convertible';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            this._startEdit($td);
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            //$td.find('input').blur();
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var columnModel = this.getColumnModel(cellData),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
                htmlArr = [];

            if (!this._isEditingCell(cellData)) {
                if (ne.util.isFunction(columnModel.formatter)) {
                    value = columnModel.formatter(value, this.grid.dataModel.get(cellData.rowKey).attributes, columnModel);
                }
                return value;
            } else {
                htmlArr.push('<input type="');
                htmlArr.push(this._getInputType());
                htmlArr.push('" value="');
                htmlArr.push(value);
                htmlArr.push('" name="');
                htmlArr.push(Util.getUniqueKey());
                htmlArr.push('" align="center" ');
                htmlArr.push(cellData.isDisabled ? 'disabled' : '');
                htmlArr.push(' maxLength="');
                htmlArr.push(columnModel.editOption.maxLength);
                htmlArr.push('"/>');

                return htmlArr.join('');
            }
        },
        _isEditingCell: function(cellData) {
            var editingCell = this.editingCell;
            return !!(editingCell.rowKey === cellData.rowKey.toString() && editingCell.columnName === cellData.columnName.toString());
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {},
        /**
         * blur 이벤트 핸들러
         * @param {event} blurEvent 이벤트 객체
         * @private
         */
        _onBlurConvertible: function(blurEvent) {
            var $target = $(blurEvent.target),
                $td = $target.closest('td');
            this._onBlur(blurEvent);
            this._endEdit($td);
        },
        /**
         * text를 textbox 로 교체한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input,
                rowKey = this.getRowKey($td),
                columnName = this.getColumnName($td),
                cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);

            this.editingCell = {
                rowKey: rowKey,
                columnName: columnName
            };

            if (!isEdit && cellState.isEditable && !cellState.isDisabled) {
                this.redraw(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                Util.form.setCursorToEnd($input.get(0));
                $input.focus().select();
            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         * @private
         */
        _endEdit: function($td) {
            var cellData = this._getCellData($td);
            this.editingCell = {
                rowKey: null,
                columnName: ''
            };
            this.clicked = {
                rowKey: null,
                columnName: null
            };
            if (cellData) {
                this.redraw(this._getCellData($td), $td);
            }
        },
        /**
         * click 이벤트 핸들러
         * @param {event} clickEvent 이벤트 객체
         * @private
         */
        _onClick: function(clickEvent) {
            var that = this,
                $target = $(clickEvent.target),
                $td = $target.closest('td'),
                address = this._getCellAddress($td);

            if (this._isClickedCell($td)) {
                this._startEdit($td);
            } else {
                clearTimeout(this.timeoutIdForClick);
                this.clicked = address;
                this.timeoutIdForClick = setTimeout(function() {
                    that.clicked = {
                        rowKey: null,
                        columnName: null
                    };
                }, this.doubleClickDuration);
            }
        },
        _isClickedCell: function($td) {
            var address = this._getCellAddress($td);
            return !!(this.clicked.rowKey === address.rowKey && this.clicked.columnName === address.columnName);
        }
    });


/**
 * @fileoverview Cell Painter Factory
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Cell Factory
     * @constructor View.CellFactory
     */
    View.CellFactory = View.Base.extend(/**@lends View.CellFactory.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeInstances();
        },
        /**
         * 종류별 Cell Painter Instance 를 를 생성한다.
         * @private
         */
        _initializeInstances: function() {
            var instances = {},
                args = {
                    grid: this.grid
                },
                instanceList = [
                    new View.Painter.Cell.MainButton(args),
                    new View.Painter.Cell.Normal.Number(args),
                    new View.Painter.Cell.Normal(args),
                    new View.Painter.Cell.List.Button(args),
                    new View.Painter.Cell.List.Select(args),
                    new View.Painter.Cell.Text(args),
                    new View.Painter.Cell.Text.Password(args),
                    new View.Painter.Cell.Text.Convertible(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.getEditType()] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        /**
         * 인자로 받은 editType 에 해당하는 Cell Painter Instance 를 반환한다.
         * @param {String} editType editType 정보
         * @return {Object} editType 에 해당하는 페인터 인스턴스
         */
        getInstance: function(editType) {
            var instance = this.instances[editType];

            if (!instance) {
                //checkbox, radio 의 경우, instance 의 이름이 전달받는 editType 과 다르기 때문에 예외처리 한다.
                if (editType === 'radio' || editType === 'checkbox') {
                    instance = this.instances['button'];
                } else {
                    //그 외의 경우 모두 normal 로 처리한다.
                    instance = this.instances['normal'];
                }
            }
            return instance;
        },
        /**
         * Frame(Left Side 혹은 Right Side)엘리먼트 tbody 하위에 모든 td 에 이벤트 핸들러를 bind 한다.
         * @param {jQuery} $parent 자신이 속한 tbody jquery 엘리먼트
         */
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;

            _.each($tdList, function(item, index) {
                $td = $tdList.eq(index);
                editType = $td.attr('edit-type');
                if (this.instances[editType]) {
                   this.instances[editType].attachHandler($td);
                }
            }, this);
        },
        /**
         * Frame(Left Side 혹은 Right Side)엘리먼트 tbody 하위에 모든 td 에 이벤트 핸들러를 unbind 한다.
         * @param {jQuery} $parent 자신이 속한 tbody jquery 엘리먼트
         */
        detachHandler: function($parent) {
            $parent.find().off();
            //var $tdList = $parent.find('td'),
            //    $td,
            //    editType;
            //
            //_.each($tdList, function(item, index) {
            //    $td = $tdList.eq(index);
            //    editType = $td.attr('edit-type');
            //    if (this.instances[editType]) {
            //        this.instances[editType].detachHandler($td);
            //    }
            //}, this);
        }
    });

/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Clipboard view class
     * @constructor View.Clipboard
     */
    View.Clipboard = View.Base.extend(/**@lends View.Clipboard.prototype */{
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeyDown',
            'focusin': '_onFocus'
        },
        /**
         * 클립보드 focus 이벤트 핸들러
         * @private
         */
        _onFocus: function() {
            this.grid.focusModel.focus();
        },
        /**
         * 생성자
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForKeyIn: 0,
                isLocked: false
            });
        },
        /**
         * 랜더링 한다.
         * @return {View.Clipboard}
         */
        render: function() {
            return this;
        },
        /**
         * keyEvent 의 중복 호출을 방지하는 lock 을 설정한다.
         * @private
         */
        _lock: function() {
            clearTimeout(this.timeoutIdForKeyIn);
            this.isLocked = true;
            this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10);
        },
        /**
         * keyEvent 의 중복 호출을 방지하는 lock 을 해제한다.
         * @private
         */
        _unlock: function() {
            this.isLocked = false;
        },
        /**
         * keyDown 이벤트 핸들러
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            if (this.isLocked) {
                keyDownEvent.preventDefault();
                return false;
            }

            if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
                this._keyInWithShiftAndCtrl(keyDownEvent);
            } else if (keyDownEvent.shiftKey) {
                this._keyInWithShift(keyDownEvent);
            } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                this._keyInWithCtrl(keyDownEvent);
            } else {
                this._keyIn(keyDownEvent);
            }
            this._lock();

        },
        /**
         * ctrl, shift 둘다 눌리지 않은 상태에서의 key down 이벤트 핸들러
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyIn: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                selection = grid.selection,
                focused = focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    grid.focus(focusModel.prevRowKey(), columnName, true);
                    break;
                case keyMap['DOWN_ARROW']:
                    grid.focus(focusModel.nextRowKey(), columnName, true);
                    break;
                case keyMap['LEFT_ARROW']:
                    grid.focus(rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['RIGHT_ARROW']:
                    grid.focus(rowKey, focusModel.nextColumnName(), true);
                    break;
                case keyMap['PAGE_UP']:
                    grid.focus(focusModel.prevRowKey(displayRowCount - 1), columnName, true);
                    break;
                case keyMap['PAGE_DOWN']:
                    grid.focus(focusModel.nextRowKey(displayRowCount - 1), columnName, true);
                    break;
                case keyMap['HOME']:
                    grid.focus(rowKey, focusModel.firstColumnName(), true);
                    break;
                case keyMap['END']:
                    grid.focus(rowKey, focusModel.lastColumnName(), true);
                    break;
                //space 와 enter 는 동일동작
                case keyMap['SPACE']:
                case keyMap['ENTER']:
                    this._onEnterSpace(rowKey, columnName);
                    break;
                case keyMap['DEL']:
                    this._del(rowKey, columnName);
                    break;
                case keyMap['TAB']:
                    grid.focusIn(rowKey, focusModel.nextColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
            selection.endSelection();
            return isKeyIdentified;
        },
        /**
         * enter 또는 space 가 입력되었을 때, 처리하는 로직
         * @param {(number|string)} rowKey 키 입력이 발생한 엘리먼트의 rowKey
         * @param {string} columnName 키 입력이 발생한 엘리먼트의 컬럼명
         * @private
         */
        _onEnterSpace: function(rowKey, columnName) {
            var cellInstance,
                grid = this.grid,
                editType = this.grid.columnModel.getEditType(columnName);
            if (editType === '_button') {
                cellInstance = this.grid.cellFactory.getInstance(editType);
                cellInstance.toggle(grid.getElement(rowKey, columnName));
            } else {
                grid.focusIn(rowKey, columnName);
            }
        },
        /**
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                focusedIndex = grid.focusModel.indexOf(),
                focused = focusModel.which(),
                isKeyIdentified = true,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['DOWN_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['LEFT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.prevColumnIndex());
                    break;
                case keyMap['RIGHT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.nextColumnIndex());
                    break;
                case keyMap['PAGE_UP']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['PAGE_DOWN']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['HOME']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, 0);
                    break;
                case keyMap['END']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, columnModelList.length - 1);
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    grid.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
            return isKeyIdentified;
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyInWithCtrl: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['CHAR_A']:
                    this.grid.selection.selectAll();
                    break;
                case keyMap['CHAR_C']:
                    this._copyToClipboard();
                    break;
                case keyMap['HOME']:
                    grid.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
                    break;
                case keyMap['END']:
                    grid.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            return isKeyIdentified;
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyInWithShiftAndCtrl: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['HOME']:
                    this._updateSelectionByKeyIn(0, 0);
                    break;
                case keyMap['END']:
                    this._updateSelectionByKeyIn(grid.dataModel.length - 1, columnModelList.length - 1);
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
            return isKeyIdentified;
        },
        /**
         * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
         * selection 영역이 지정되어 있다면 selection 영역에 해당하는 모든 셀.
         * selection 영역이 지정되어 있지 않다면 focus된 셀
         * @private
         */
        _del: function() {
            var grid = this.grid,
                selection = grid.selection,
                dataModel = grid.dataModel,
                focused = grid.focusModel.which(),
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                range, i, j;

            if (selection.hasSelection()) {
                //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
                range = selection.getRange();
                for (i = range.row[0]; i < range.row[1] + 1; i++) {
                    rowKey = dataModel.at(i).get('rowKey');
                    for (j = range.column[0]; j < range.column[1] + 1; j++) {
                        columnName = columnModelList[j]['columnName'];
                        grid.del(rowKey, columnName, true);
                    }
                }
                grid.renderModel.refresh();
            } else {
                grid.del(rowKey, columnName);
            }
        },
        /**
         * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
         * @param {Number} rowIndex 행의 index 정보
         * @param {Number} columnIndex 열의 index 정보
         * @private
         */
        _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
            var selection = this.grid.selection,
                focused = this.grid.focusModel.indexOf();

            if (!selection.hasSelection()) {
                selection.startSelection(focused.rowIdx, focused.columnIdx);
            }
            selection.updateSelection(rowIndex, columnIndex);
            this.grid.focusAt(rowIndex, columnIndex, true);
        },

        /**
         * clipboard 에 설정될 문자열 반환한다.
         * @return {String} 데이터를 text 형태로 변환한 문자열
         * @private
         */
        _getClipboardString: function() {
            var text,
                selection = this.grid.selection,
                focused = this.grid.focusModel.which();
            if (selection.isShown()) {
                text = this.grid.selection.getSelectionToString();
            } else {
                text = this.grid.dataModel.get(focused.rowKey).getVisibleText(focused.columnName);
            }
            return text;
        },
        /**
         * 현재 그리드의 data 를 clipboard 에 copy 한다.
         * @private
         */
         /* istanbul ignore next */
        _copyToClipboard: function() {
            var text = this._getClipboardString();
            if (window.clipboardData) {
                window.clipboardData.setData('Text', text);
            } else {
                this.$el.val(text).select();
            }
        }
    });

/**
 * @fileoverview RowList View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * RowList View.
     * Collection 의 변화를 감지한다.
     * @constructor View.RowList
     */
    View.RowList = View.Base.extend(/**@lends View.RowList.prototype */{

        /**
         * 초기화 함수
         * @param {object} options
         *      @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (options && options.whichSide) || 'R',
                timeoutIdForCollection: 0,
                timeoutIdForFocusClipboard: 0,
                rowPainter: null
            });
            this._createRowPainter();
            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },
        /**
         * Rendering 에 사용할 RowPainter Instance 를 생성한다.
         * @private
         */
        _createRowPainter: function() {
            this.rowPainter = this.createView(View.Painter.Row, {
                grid: this.grid,
                $parent: this.$el,
                collection: this.collection,
                whichSide: this.whichSide
            });
        },

        /**
         * 랜더링한다.
         * @return {View.RowList}
         */
        render: function() {
            var self = this,
                html = '',
                firstRow = this.collection.at(0);

            var start = new Date();

            //alert('a');
            this.rowPainter.detachHandlerAll();
            this.destroyChildren();
            this._createRowPainter();
            //get html string
            /* istanbul ignore else */
            if (firstRow && ne.util.isExisty(firstRow.get('rowKey'))) {
                this.collection.forEach(function(row) {
                    html += this.rowPainter.getHtml(row);
                }, this);
            }
            this.$el.empty().prepend(html);
            this.rowPainter.attachHandlerAll();

            clearTimeout(this.timeoutIdForFocusClipboard);
            this.timeoutIdForFocusClipboard = setTimeout(function() {
                if (ne.util.pick(self, 'grid', 'focusClipboard')) {
                    self.grid.focusClipboard();
                }
            }, 10);

            //var end = new Date();
            //console.log('View.RowList.addAll end', end - start);
            this._showLayer();

            return this;
        },
        /**
         * 데이터가 있다면 Layer 를 노출하고, 없는 경우 데이터 없음 레이어를 노출한다.
         * @private
         */
        _showLayer: function() {
            if (this.grid.dataModel.length) {
                this.grid.hideGridLayer();
            } else {
                this.grid.showGridLayer('empty');
            }
        },
        ///**
        // * selection 영역의 mousedown 이벤트
        // * @param {Event} mouseDownEvent
        // * @private
        // */
        //_onMouseDown: function(mouseDownEvent) {
        //    this.grid.selection.onMouseDown(mouseDownEvent);
        //}
    });

/**
 * @fileoverview Selection 클래스 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  selection layer 의 컨트롤을 담당하는 틀래스
     *  @constructor View.Selection
     */
    View.Selection = View.Base.extend(/**@lends View.Selection.prototype */{
        events: {},
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                //메서드 호출시 range 값
                range: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                //rowspan 처리후 Selection box 의 range
                spannedRange: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                lside: null,
                rside: null,

                pageX: 0,
                pageY: 0,

                intervalIdForAutoScroll: 0,
                scrollPixelScale: 40,
                isEnable: true,
                _isShown: false
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dataModel, 'add remove sort reset', this.endSelection, this);
        },
        /**
         * selection 을 disable 한다.
         */
        enable: function() {
            if (this.grid.option('useDataCopy')) {
                this.isEnable = true;
            }
        },
        /**
         * selection 을 disable 한다.
         */
        disable: function() {
            this.endSelection();
            this.isEnable = false;
        },
        /**
         * 마우스 down 이벤트가 발생하여 selection 을 시작할 때, selection 영역을 계산하기 위해 document 에 이벤트 핸들러를 추가한다.
         * @param {Number} pageX    초기값으로 설정할 마우스 x좌표
         * @param {Number} pageY    초기값으로 설정할 마우스 y 좌표
         */
        attachMouseEvent: function(pageX, pageY) {
            if (this.isEnable) {
                this.setOwnProperties({
                    pageX: pageX,
                    pageY: pageY
                });
                this.grid.updateLayoutData();
                $(document).on('mousemove', $.proxy(this._onMouseMove, this));
                $(document).on('mouseup', $.proxy(this._onMouseUp, this));
                $(document).on('selectstart', $.proxy(this._onSelectStart, this));
            }
        },
        /**
         * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
         */
        detachMouseEvent: function() {
            clearInterval(this.intervalIdForAutoScroll);
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * selection 영역에 대한 mouseDown 퍼블릭 이벤트 핸들러
         * @param mouseDownEvent
         */
        onMouseDown: function(mouseDownEvent) {
            var grid = this.grid,
                selection = this,
                focused,
                pos;

            if (mouseDownEvent.shiftKey) {
                focused = grid.focusModel.indexOf(true);
                if (!selection.hasSelection()) {
                    selection.startSelection(focused.rowIdx, focused.columnIdx);
                }

                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
                pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
                selection.updateSelection(pos.row, pos.column);
                grid.focusAt(pos.row, pos.column);
            } else {
                selection.endSelection();
                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * mouse move 이벤트 핸들러
         * @param {event} mouseMoveEvent 이벤트 객체
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var pos;
            clearInterval(this.intervalIdForAutoScroll);
            if (this.hasSelection()) {
                pos = this.getIndexFromMousePosition(mouseMoveEvent.pageX, mouseMoveEvent.pageY);
                this.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
                if (this._isAutoScrollable(pos.overflowX, pos.overflowY)) {
                    this.intervalIdForAutoScroll = setInterval($.proxy(this._adjustScroll, this, pos.overflowX, pos.overflowY));
                }
            } else if (this._getDistance(mouseMoveEvent) > 10) {
                pos = this.getIndexFromMousePosition(this.pageX, this.pageY);
                this.startSelection(pos.row, pos.column);
            }
        },
        /**
         * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
         * @param {Number} overflowX    가로축 기준 영역 overflow 값
         * @param {Number} overflowY    세로축 기준 영역 overflow 값
         * @return {boolean} overflow 되었는지 여부
         * @private
         */
        _isAutoScrollable: function(overflowX, overflowY) {
            return !(overflowX === 0 && overflowY === 0);
        },
        /**
         * scrollTop 과 scrollLeft 값을 조정한다.
         * @param {Number} overflowX    가로축 기준 영역 overflow 값
         * @param {Number} overflowY    세로축 기준 영역 overflow 값
         * @private
         */
        _adjustScroll: function(overflowX, overflowY) {
            var renderModel = this.grid.renderModel,
                scrollLeft = renderModel.get('scrollLeft'),
                maxScrollLeft = renderModel.get('maxScrollLeft'),
                scrollTop = renderModel.get('scrollTop');
            if (overflowX < 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - this.scrollPixelScale), maxScrollLeft));
            } else if (overflowX > 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + this.scrollPixelScale), maxScrollLeft));
            }

            /* istanbul ignore next: scrollTop 은 보정로직과 얽혀있어 확인이 어렵기 때문에 무시한다. */
            if (overflowY < 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop - this.scrollPixelScale));
            } else if (overflowY > 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop + this.scrollPixelScale));
            }
        },
        /**
         * mousedown 이 일어난 지점부터의 거리를 구한다.
         * @param {event} mouseMoveEvent 이벤트 객체
         * @return {number} 처음 위치좌표로 부터의 거리.
         * @private
         */
        _getDistance: function(mouseMoveEvent) {
            var pageX = mouseMoveEvent.pageX,
                pageY = mouseMoveEvent.pageY,
                x = Math.abs(this.pageX - pageX),
                y = Math.abs(this.pageY - pageY);
            return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        },
        /**
         * mouse up 이벤트 핸들러
         * @private
         */
        _onMouseUp: function() {
            this.detachMouseEvent();
        },
        /**
         * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
         * @param {Number} pageX    마우스 x좌표
         * @param {Number} pageY    마우스 y 좌표
         * @return {{row: number, column: number, overflowX: number, overflowY: number}} row, column의 인덱스 정보와 x, y축 overflow 정보.
         */
        getIndexFromMousePosition: function(pageX, pageY) {
            var containerPos = this._getContainerPosition(pageX, pageY),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                columnWidthList = dimensionModel.getColumnWidthList(),
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                totalColumnWidth = dimensionModel.getFrameWidth(),
                dataPosY = containerPos.pageY + scrollTop,
                dataPosX = containerPos.pageX,
                overflowX = 0,
                overflowY = 0,
                isLside = (dimensionModel.get('lsideWidth') > containerPos.pageX),
                len = columnWidthList.length,
                curWidth = 0,
                height = this.grid.option('scrollX') ?
                    dimensionModel.get('bodyHeight') - this.grid.scrollBarSize : dimensionModel.get('bodyHeight'),
                width = this.grid.option('scrollY') ?
                    dimensionModel.get('width') - this.grid.scrollBarSize : dimensionModel.get('width'),
                rowIdx, columnIdx;


            if (!isLside) {
                dataPosX = dataPosX + scrollLeft;
            }
            rowIdx = Math.max(0, Math.min(Math.floor(dataPosY / (dimensionModel.get('rowHeight') + 1)), this.grid.dataModel.length - 1));

            if (containerPos.pageY < 0) {
                overflowY = -1;
            } else if (containerPos.pageY > height) {
                overflowY = 1;
            }

            if (containerPos.pageX < 0) {
                overflowX = -1;
            } else if (containerPos.pageX > width) {
                overflowX = 1;
            }

            if (dataPosX < 0) {
                columnIdx = 0;
            } else if (totalColumnWidth < dataPosX) {
                columnIdx = len - 1;
            } else {
                ne.util.forEachArray(columnWidthList, function(columnWidth, i) {
                    curWidth += columnWidth + 1;
                    if (dataPosX <= curWidth) {
                        columnIdx = i;
                        return false;
                    }
                });
            }

            return {
                row: rowIdx,
                column: columnIdx,
                overflowX: overflowX,
                overflowY: overflowY
            };
        },
        /**
         * rowSpan 을 함께 계산한 범위를 반환한다.
         * @return {{row: array, column: array}} rowSpan 을 함께 계산한 범위정보
         */
        getRange: function() {
            return $.extend(true, {}, this.spannedRange);
        },
        /**
         *  현재 selection 범위내 데이터를 문자열 형태로 변환하여 반환한다.
         *  @return {String} selection 범위내 데이터 문자열
         */
        getSelectionToString: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList()
                    .slice(this.spannedRange.column[0], this.spannedRange.column[1] + 1),
                filteringMap = {
                    '_button': true
                },
                columnNameList = [],
                tmpString = [],
                strings = [],
                startIdx = this.grid.renderModel.get('startNumber') + this.spannedRange.row[0],
                rowList, string;

            _.each(columnModelList, function(columnModel) {
                columnNameList.push(columnModel['columnName']);
            });

            rowList = this.grid.dataModel.slice(this.spannedRange.row[0], this.spannedRange.row[1] + 1);

            _.each(rowList, function(row, i) {
                tmpString = [];
                _.each(columnNameList, function(columnName, j) {
                    if (!filteringMap[columnName]) {
                        //number 형태의 경우 실 데이터는 존재하지 않으므로 가공하여 추가한다.
                        if (columnNameList[j] === '_number') {
                            tmpString.push(startIdx + i);
                        } else {
                            tmpString.push(row.getVisibleText(columnName));
                        }
                    }
                });
                strings.push(tmpString.join('\t'));
            });

            string = strings.join('\n');
            return string;
        },
        /**
         * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
         * @param {String} [whichSide='L'] 좌 우 영역중 어느 영역인지 여부
         * @return {Object} 해당 영역의 selection layer view 인스턴스
         */
        createLayer: function(whichSide) {
            var clazz = whichSide === 'R' ? View.Selection.Layer.Rside : View.Selection.Layer.Lside,
                layer = this._getLayer(whichSide);
            if (layer && ne.util.isFunction(layer.destroy())) {
                layer.destroy();
            }
            layer = this.createView(clazz, {
                grid: this.grid,
                columnWidthList: this.grid.dimensionModel.getColumnWidthList(whichSide)
            });
            whichSide === 'R' ? this.rside = layer : this.lside = layer;
            return layer;
        },
        /**
         * 전체 영역을 선택한다.
         */
        selectAll: function() {
            if (this.isEnable) {
                this.startSelection(0, 0);
                this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
            }
        },
        /**
         * selection 영역 선택을 시작한다.
         * @param {Number} rowIndex 시작점의 row 인덱스 정보
         * @param {Number} columnIndex 시작점의 column 인덱스 정보
         */
        startSelection: function(rowIndex, columnIndex) {
            if (this.isEnable) {
                this.range.row[0] = this.range.row[1] = rowIndex;
                this.range.column[0] = this.range.column[1] = columnIndex;
                this.show();
            }
        },
        /**
         * selection 영역 선택을 확장한다.
         * @param {Number} rowIndex 확장할 지점의 row 인덱스 정보
         * @param {Number} columnIndex 확장할 지점의 column 인덱스 정보
         */
        updateSelection: function(rowIndex, columnIndex) {
            if (this.isEnable) {
                this.range.row[1] = rowIndex;
                this.range.column[1] = columnIndex;
                this.show();
            }
        },
        /**
         * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
         */
        endSelection: function() {
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
            this.spannedRange.row[0] = this.spannedRange.row[1] = this.spannedRange.column[0] = this.spannedRange.column[1] = -1;
            this.hide();
            this.detachMouseEvent();
        },
        /**
         * dimension model 의 columnWidth 가 변경되었을 경우 크기를 재 계산하여 rendering 한다.
         * @private
         */
        _onColumnWidthChanged: function() {
            this.show();
        },
        /**
         * 현재 selection range 정보를 기반으로 selection Layer 를 노출한다.
         */
        show: function() {
            if (this.isEnable && this.hasSelection()) {
                this._isShown = true;
                var tmpRowRange,
                    dataModel = this.grid.dataModel,
                    columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                    rowHeight = this.grid.dimensionModel.get('rowHeight'),
                    startRow = Math.min.apply(Math, this.range.row),
                    endRow = Math.max.apply(Math, this.range.row),
                    startColumn = Math.min.apply(Math, this.range.column),
                    endColumn = Math.max.apply(Math, this.range.column),
                    spannedRange = {
                        row: [startRow, endRow],
                        column: [startColumn, endColumn]
                    };
                if (dataModel.isRowSpanEnable()) {
                    tmpRowRange = $.extend([], spannedRange.row);

                    //rowSpan 처리를 위해 startIndex 와 endIndex 의 모든 데이터 mainRow 일때까지 loop 를 수행한다.
                    do {
                        tmpRowRange = $.extend([], spannedRange.row);
                        spannedRange = this._getRowSpannedIndex(spannedRange);
                    } while (spannedRange.row[0] !== tmpRowRange[0] ||
                        spannedRange.row[1] !== tmpRowRange[1]);

                }
                this.spannedRange = spannedRange;
                this.lside.show(spannedRange);
                this.rside.show({
                    row: spannedRange.row,
                    column: [Math.max(-1, spannedRange.column[0] - columnFixIndex), Math.max(-1, spannedRange.column[1] - columnFixIndex)]
                });
                //selection 이 생성될 때에는 무조건 input 에 focus 가 가지 않도록 clipboard에 focus 를 준다.
                this.grid.focusClipboard();
            }
        },
        /**
         * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
         */
        hide: function() {
            this._isShown = false;
            if (this.lside) {
                this.lside.hide();
            }
            if (this.rside) {
                this.rside.hide();
            }
        },
        /**
         * 현재 selection 레이어가 노출되어 있는지 확인한다.
         * @return {boolean}    레이어 노출여부
         */
        isShown: function() {
            return this._isShown;
        },
        /**
         * Selection Layer View 를 반환한다.
         * @param {String} [whichSide='L'] 어느 영역의 layer 를 조회할지 여부. 'L|R' 중 하나를 지정한다.
         * @return {View.Selection.rside|View.Selection.lside} 해당 selection layer view 인스턴스
         * @private
         */
        _getLayer: function(whichSide) {
            return whichSide === 'R' ? this.rside : this.lside;
        },
        /**
         * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
         * @param {Number} pageX    마우스 x 좌표
         * @param {Number} pageY    마우스 y 좌표
         * @return {{pageX: number, pageY: number}} 그리드 container 기준의 pageX, pageY 값
         * @private
         */
        _getContainerPosition: function(pageX, pageY) {
            var dimensionModel = this.grid.dimensionModel,
                containerPosX = pageX - dimensionModel.get('offsetLeft'),
                containerPosY = pageY - (dimensionModel.get('offsetTop') + dimensionModel.get('headerHeight') + 2);

            return {
                pageX: containerPosX,
                pageY: containerPosY
            };
        },
        /**
         * select start 이벤트를 방지한다.
         * @param {event} selectStartEvent 이벤트 객체
         * @private
         */
        _onSelectStart: function(selectStartEvent) {
            selectStartEvent.preventDefault();
            return false;
        },

        /**
         * selection 데이터가 존재하는지 확인한다.
         * @return {boolean}    selection 데이터 존재여부
         * @private
         */
        hasSelection: function() {
            return !(this.range.row[0] === -1);
        },

        /**
         * rowSpan 된 Index range 를 반환한다.
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         * @private
         */
        _getRowSpannedIndex: function(spannedRange) {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(spannedRange.column[0], spannedRange.column[1] + 1),
                dataModel = this.grid.dataModel,
                startIndexList = [spannedRange.row[0]],
                endIndexList = [spannedRange.row[1]],
                startRow = dataModel.at(spannedRange.row[0]),
                endRow = dataModel.at(spannedRange.row[1]),
                newSpannedRange = $.extend({}, spannedRange);

            if (startRow && endRow) {
                var startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData(),
                    endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData(),
                    columnName, param;

                /**
                 * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromStart(param) {
                    var startIndex = param.startIndex,
                        endIndex = param.endIndex,
                        rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
                        startIndexList = param.startIndexList,
                        endIndexList = param.endIndexList,
                        spannedIndex;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = startIndex + rowSpanData['count'];
                            startIndexList.push(spannedIndex);
                        } else {
                            spannedIndex = startIndex + rowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        }
                    }
                }

                /**
                 * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromEnd(param) {
                    var endIndex = param.endIndex,
                        columnName = param.columnName,
                        rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
                        endIndexList = param.endIndexList,
                        dataModel = param.dataModel,
                        spannedIndex, tmpRowSpanData;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = endIndex + rowSpanData['count'];
                            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
                            spannedIndex += tmpRowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        } else {
                            spannedIndex = endIndex + rowSpanData['count'] - 1;
                            endIndexList.push(spannedIndex);
                        }
                    }
                }
                //모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
                _.each(columnModelList, function(columnModel) {
                    columnName = columnModel['columnName'];
                    param = {
                        columnName: columnName,
                        startIndex: spannedRange.row[0],
                        endIndex: spannedRange.row[1],
                        endRowSpanDataMap: endRowSpanDataMap,
                        startRowSpanDataMap: startRowSpanDataMap,
                        startIndexList: startIndexList,
                        endIndexList: endIndexList,
                        dataModel: dataModel
                    };
                    concatRowSpanIndexFromStart(param);
                    concatRowSpanIndexFromEnd(param);
                }, this);

                newSpannedRange.row = [Math.min.apply(Math, startIndexList), Math.max.apply(Math, endIndexList)];
            }
            return newSpannedRange;
        },

        /**
         * 소멸자
         */
        destroy: function() {
            this.stopListening();
            this.detachMouseEvent();
            this.destroyChildren();
            this.remove();
        }
    });

    /**
     * 실제 selection layer view
     * @constructor View.Selection.Layer
     */
    View.Selection.Layer = View.Base.extend(/**@lends View.Selection.Layer.prototype */{
        tagName: 'div',
        className: 'selection_layer',
        events: {
            mousedown: '_onMouseDown'
        },
        /**
         * 생성자 함수
         * @param {object} options
         *      @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
            this.setOwnProperties({
                columnWidthList: options.columnWidthList,
                spannedRange: {
                    row: [-1, -1],
                    column: [-1, -1]
                },
                whichSide: 'R'
            });
        },
        /**
         * selection 영역의 mousedown 이벤트
         * @param {Event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            this.grid.selection.onMouseDown(mouseDownEvent);
        },
        /**
         * 컬럼 widthList 값의 변화가 발생했을때 이벤트 핸들러
         * @private
         */
        _updateColumnWidthList: function() {
            this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
        },
        /**
         * 영역 정보를 바탕으로 selection 레이어의 크기와 위치 정보를 담은 css 스타일을 반환한다.
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         * @return {{display: string, width: string, height: string, top: string, left: string}} css 스타일 정보
         * @private
         */
        _getGeometryStyles: function(spannedRange) {
            spannedRange = spannedRange || this.indexObj;
            var style,
                i,
                border = 1,
                columnWidthList = this.columnWidthList,
                rowRange = spannedRange.row,
                columnRange = spannedRange.column,
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
//                top = Util.getTBodyHeight(rowRange[0], rowHeight) + this.grid.renderModel.get('top'),
                top = Util.getHeight(rowRange[0], rowHeight) + 1,
                height = Util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 3,
                len = columnWidthList.length,
                display = 'block',
                left = 0,
                width = 0;

            for (i = 0; i < columnRange[1] + 1 && i < len; i++) {
                //border 두께 (1px) 값도 포함하여 계산한다.
                if (i < columnRange[0]) {
                    left += columnWidthList[i] + border;
                } else {
                    width += columnWidthList[i] + border;
                }
            }
            //border 두께 (1px) 가 추가로 한번 더 계산되었기 때문에 -1 한다.
            width -= border;

            if (width <= 0 || height <= 0) {
                display = 'none';
            }

            style = {
                display: display,
                width: width + 'px',
                height: height + 'px',
                top: top + 'px',
                left: left + 'px'
            };
            return style;
        },
        /**
         * 레이어를 노출한다.
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         */
        show: function(spannedRange) {
            this.indexObj = spannedRange;
            this.$el.css(this._getGeometryStyles(spannedRange));
        },
        /**
         * 레이어를 숨긴다.
         */
        hide: function() {
            this.$el.css({
                display: 'none',
                width: '0px',
                height: '0px',
                top: 0,
                left: 0
            });
        },
        /**
         * 렌더링한다.
         * @return {View.Selection.Layer}
         */
        render: function() {
            return this;
        }
    });
    /**
     * 왼쪽 selection layer
     * @constructor View.Selection.Layer.Lside
     */
    View.Selection.Layer.Lside = View.Selection.Layer.extend(/**@lends View.Selection.Layer.Lside.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        }
    });
    /**
     * 오른쪽 selection layer
     * @constructor View.Selection.Layer.Rside
     */
    View.Selection.Layer.Rside = View.Selection.Layer.extend(/**@lends View.Selection.Layer.Rside.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        }
    });

/**
 * @fileoverview Network 모듈 addon
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Network 모듈 addon
     * @param {object} options
     *      @param {jquery} options.el   form 엘리먼트
     *      @param {boolean} [options.initialRequest=true]   Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
     *      @param {object} [options.api]   사용할 API URL 리스트
     *          @param {string} [options.api.readData]  데이터 조회 API 주소
     *          @param {string} [options.api.createData] 데이터 생성 API 주소
     *          @param {string} [options.api.updateData] 데이터 업데이트 API 주소
     *          @param {string} [options.api.modify] 데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
     *          @param {string} [options.api.deleteData] 데이터 삭제 API 주소
     *      @param {number} [options.perPage=500]  한 페이지당 보여줄 item 개수
     *      @param {boolean} [options.enableAjaxHistory=true]   ajaxHistory 를 사용할지 여부
     * @constructor AddOn.Net
     * @example
     <form id="data_form">
     <input type="text" name="query"/>
     </form>
     <script>
     var net,
     grid = new ne.Grid({
            //...option 생략...
    });

     //Net AddOn 을 그리드 내부에서 인스턴스화 하며 초기화 한다.
     grid.use('Net', {
        el: $('#data_form'),         //필수 - form 엘리먼트
        initialRequest: true,   //(default: true) Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
        perPage: 500,           //(default: 500) 한 페이지당 load 할 데이터 개수
        enableAjaxHistory: true, //(default: true) ajaxHistory 를 사용할지 여부
        //사용할 API URL 리스트
        api: {
            'readData': './api/read',       //데이터 조회 API 주소
            'createData': './api/create',   //데이터 생성 API 주소
            'updateData': './api/update',   //데이터 업데이트 API 주소
            'deleteData': './api/delete',   //데이터 삭제 API 주소
            'modifyData': './api/modify'    //데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
        }
    });
     //이벤트 핸들러 바인딩
     grid.on('beforeRequest', function(data) {
        //모든 dataRequest 시 호출된다.
    }).on('response', function(data) {
        //response 이벤트 핸들러
        //성공/실패와 관계없이 response 를 받을 떄 호출된다.
    }).on('successResponse', function(data) {
        //successResponse 이벤트 핸들러
        //response.result 가 truthy 일 때 호출된다.
    }).on('failResponse', function(data) {
        //failResponse 이벤트 핸들러
        //response.result 가 falsy 일 때 호출된다.
    }).on('errorResponse', function(data) {
        //ajax error response 이벤트 핸들러
    });

     //grid 로부터 사용할 net 인스턴스를 가져온다.
     net = grid.getAddOn('Net');

     //request 관련 자세한 옵션은 Net#request 를 참고한다.
     //createData API 요청
     net.request('createData');

     //updateData API 요청
     net.request('updateData');

     //deleteData API 요청
     net.request('deleteData');

     //modifyData API 요청
     net.request('modifyData');
     </script>
     */
    AddOn.Net = View.Base.extend(/**@lends AddOn.Net.prototype */{
        events: {
            'submit': '_onSubmit'
        },
        /**
         * 생성자
         * @param {Object} attributes 생성자 option 정보
         */
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            var defaultOptions = {
                    initialRequest: true,
                    api: {
                        'readData': '',
                        'createData': '',
                        'updateData': '',
                        'deleteData': '',
                        'modifyData': '',
                        'downloadData': '',
                        'downloadAllData': ''
                    },
                    perPage: 500,
                    enableAjaxHistory: true
                },
                options = $.extend(true, defaultOptions, attributes),
                pagination = this.grid.getPaginationInstance();

            this.setOwnProperties({
                curPage: 1,
                perPage: options.perPage,
                options: options,
                router: null,
                pagination: pagination,
                requestedFormData: null,
                isLocked: false,
                lastRequestedReadData: null
            });
            this._initializeDataModelNetwork();
            this._initializeRouter();
            this._initializePagination();

            if (options.initialRequest) {
                this._readDataAt(1, false);
            }
        },
        /**
         * pagination instance 를 초기화 한다.
         * @private
         */
        _initializePagination: function() {
            var pagination = this.pagination;
            if (pagination) {
                pagination.setOption('itemPerPage', this.perPage);
                pagination.setOption('itemCount', 1);
                pagination.on('beforeMove', $.proxy(this._onPageBeforeMove, this));
            }
        },
        /**
         * dataModel 이 network 통신을 할 수 있도록 설정한다.
         * @private
         */
        _initializeDataModelNetwork: function() {
            this.grid.dataModel.url = this.options.api.readData;
            this.grid.dataModel.sync = $.proxy(this._sync, this);
        },
        /**
         * ajax history 를 사용하기 위한 router 를 초기화한다.
         * @private
         */
        _initializeRouter: function() {
            if (this.options.enableAjaxHistory) {
                //router 생성
                this.router = new AddOn.Net.Router({
                    grid: this.grid,
                    net: this
                });
                if (!Backbone.History.started) {
                    Backbone.history.start();
                }
            }
        },
        /**
         * pagination 에서 before page move가 발생했을 때 이벤트 핸들러
         * @param {{page:number}} customEvent pagination 으로부터 전달받는 이벤트 객체
         * @private
         */
        _onPageBeforeMove: function(customEvent) {
            var page = customEvent.page;
            if (this.curPage !== page) {
                this._readDataAt(page, true);
            }
        },
        /**
         * form 의 submit 이벤트 발생시 이벤트 핸들러
         * @param {event} submitEvent   submit 이벤트 객체
         * @private
         */
        _onSubmit: function(submitEvent) {
            submitEvent.preventDefault();
            /*
            page 이동시 form input 을 수정하더라도,
            formData 를 유지하기 위해 데이터를 기록한다.
             */
            this._readDataAt(1, false);
        },

        /**
         * 폼 데이터를 설정한다.
         * 내부에서 사용하는 메서드이므로 외부에서 사용하지 않기를 권장한다.
         * @param {Object} formData 폼 데이터 정보
         */
        setFormData: function(formData) {
            //form data 를 실제 form 에 반영한다.
            /* istanbul ignore next */
            Util.form.setFormData(this.$el, formData);
        },

        /**
         * fetch 수행 이후 custom ajax 동작 처리를 위해 Backbone 의 기본 sync 를 오버라이드 하기위한 메서드.
         * @param {String} method   router 로부터 전달받은 method 명
         * @param {Object} model    fetch 를 수행한 dataModel
         * @param {Object} options  request 정보
         * @private
         */
        _sync: function(method, model, options) {
            var params;
            if (method === 'read') {
                options = options || {};
                params = $.extend({}, options);
                if (!options.url) {
                    params.url = _.result(model, 'url');
                }
                this._ajax(params);
            } else {
                Backbone.sync.call(Backbone, method, model, options);
            }
        },
        /**
         * network 통신에 대한 _lock 을 건다.
         * @private
         */
        _lock: function() {
            this.grid.showGridLayer('loading');
            this.isLocked = true;
        },
        /**
         * network 통신에 대해 unlock 한다.
         * loading layer hide 는 rendering 하는 로직에서 수행한다.
         * @private
         */
        _unlock: function() {
            this.isLocked = false;
        },

        /**
         * form 으로 지정된 엘리먼트의 Data 를 반환한다.
         * @return {object} formData 데이터 오브젝트
         * @private
         */
        _getFormData: function() {
            /* istanbul ignore next*/
            return Util.form.getFormData(this.$el);
        },
        /**
         * DataModel 에서 Backbone.fetch 수행 이후 success 콜백
         * @param {object} dataModel grid 의 dataModel
         * @param {object} responseData 응답 데이터
         * @param {object} options  ajax 요청 정보
         * @private
         */
        _onReadSuccess: function(dataModel, responseData, options) {
            dataModel.setOriginalRowList();
            var pagination = this.pagination,
                page, totalCount;

            //pagination 처리
            if (pagination && responseData.pagination) {
                page = responseData.pagination.page;
                totalCount = responseData.pagination.totalCount;
                pagination.setOption('itemPerPage', this.perPage);
                pagination.setOption('itemCount', totalCount);
                pagination.movePageTo(page);
                this.curPage = page;
            }
        },
        /**
         * DataModel 에서 Backbone.fetch 수행 이후 error 콜백
         * @param {object} dataModel grid 의 dataModel
         * @param {object} responseData 응답 데이터
         * @param {object} options  ajax 요청 정보
         * @private
         */
        _onReadError: function(dataModel, responseData, options) {},
        /**
         * 가장 마지막에 조회 요청한 request 파라미터로 다시 요청한다.
         */
        reloadData: function() {
            this.readData(this.lastRequestedReadData);
        },
        /**
         * 데이터 조회 요청.
         * 내부적으로 사용하는 메서드이므로 외부에서 호출하지 않기를 권장함.
         * @param {object} data 요청시 사용할 request 파라미터
         */
        readData: function(data) {
            var startNumber = 1,
                grid = this.grid;
            if (!this.isLocked) {
                grid.renderModel.initializeVariables();
                this._lock();
                this.requestedFormData = _.clone(data);
                this.curPage = data.page || this.curPage;
                startNumber = (this.curPage - 1) * this.perPage + 1;
                grid.renderModel.set({
                    startNumber: startNumber
                });

                //todo: 바로 아랫줄은 테스트코드이므로 제거해야함.
                data.columnModel = $.toJSON(this.grid.columnModel.get('columnModelList'));

                //마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
                this.lastRequestedReadData = _.clone(data);
                grid.dataModel.fetch({
                    requestType: 'readData',
                    data: data,
                    type: 'POST',
                    success: $.proxy(this._onReadSuccess, this),
                    error: $.proxy(this._onReadError, this),
                    reset: true
                });
            }
        },
        /**
         * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
         * @param {Number} page 조회할 페이지 정보
         * @param {Boolean} [isUsingRequestedData=true] page 단위 검색이므로, form 수정여부와 관계없이 처음 보낸 form 데이터로 조회할지 여부를 결정한다.
         * @private
         */
        _readDataAt: function(page, isUsingRequestedData) {
            isUsingRequestedData = isUsingRequestedData === undefined ? true : isUsingRequestedData;
            var data = isUsingRequestedData ? this.requestedFormData : this._getFormData();
            data.page = page;
            data.perPage = this.perPage;

            if (this.router) {
                this.router.navigate('read/' + Util.toQueryString(data), {
                    trigger: false
                });
            }
            this.readData(data);
        },
        /**
         * 서버로 API request 한다.
         * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
         * @param {object} options
         *      @param {String} [options.url]  url 정보. 생략시 Net 에 설정된 api 옵션 정보로 요청한다.
         *      @param {String} [options.hasDataParam=true] rowList 데이터 파라미터를 포함하여 보낼지 여부
         *      @param {String} [options.isOnlyChecked=true]  선택(Check)된 row 에 대한 목록 데이터를 포함하여 요청한다.
         *      isOnlyModified 도 설정되었을 경우, 선택&변경된 목록을 요청한다.
         *      @param {String} [options.isOnlyModified=true]  수정된 행 데이터 목록을 간추려 요청한다.
         *      isOnlyChecked 도 설정되었을 경우, 선택&변경된 목록을 요청한다.
         *      @param {String} [options.isSkipConfirm=false]  confirm 메세지를 보여줄지 여부를 지정한다.
         */
        request: function(requestType, options) {
            var defaultOptions = {
                    url: this.options.api[requestType],
                    type: null,
                    hasDataParam: true,
                    isOnlyChecked: true,
                    isOnlyModified: true,
                    isSkipConfirm: false
                },
                newOptions = $.extend(defaultOptions, options),
                param = this._getRequestParam(requestType, newOptions);

            if (param) {
                this._ajax(param);
            }
        },
        /**
         * 서버로 요청시 사용될 파라미터 중 Grid 의 데이터에 해당하는 데이터를 Option 에 맞추어 반환한다.
         * @param {String} requestType  요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
         * @param {Object} [options]
         *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
         *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
         *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
         * @return {{count: number, data: {requestType: string, url: string, data: object, type: string, dataType: string}}}
         * 옵션 조건에 해당하는 그리드 데이터 정보
         * @private
         */
        _getDataParam: function(requestType, options) {
            var defaultOptions = {
                    hasDataParam: true,
                    isOnlyModified: true,
                    isOnlyChecked: true
                };


            options = $.extend(defaultOptions, options);

            var hasDataParam = options.hasDataParam,
                isOnlyModified = options.isOnlyModified,
                isOnlyChecked = options.isOnlyChecked,
                dataModel = this.grid.dataModel,
                checkMap = {
                    'createData': ['createList'],
                    'updateData': ['updateList'],
                    'deleteData': ['deleteList'],
                    'modifyData': ['createList', 'updateList', 'deleteList']
                },
                checkList = checkMap[requestType],
                data = $.extend({}, this.requestedFormData),
                count = 0,
                dataMap;

            if (hasDataParam) {
                if (isOnlyModified) {
                    //{createList: [], updateList:[], deleteList: []} 에 담는다.
                    dataMap = dataModel.getModifiedRowList({
                        isOnlyChecked: isOnlyChecked
                    });
                    _.each(dataMap, function(list, name) {
                        if ($.inArray(name, checkList) !== -1) {
                            count += list.length;
                        }
                        dataMap[name] = $.toJSON(list);
                    }, this);
                } else {
                    //{rowList: []} 에 담는다.
                    dataMap = {rowList: dataModel.getRowList(isOnlyChecked)};
                    count = dataMap.rowList.length;
                }
            }

            data = $.extend(data, dataMap);

            return {
                data: data,
                count: count
            };
        },
        /**
         * requestType 에 따라 서버에 요청할 파라미터를 반환한다.
         * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
         * @param {Object} [options]
         *      @param {String} [options.url=this.options.api[requestType]] 요청할 url.
         *      지정하지 않을 시 option 으로 넘긴 API 중 request Type 에 해당하는 url 로 지정됨
         *      @param {String} [options.type='POST'] request method 타입
         *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
         *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
         *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
         * @return {{requestType: string, url: string, data: object, type: string, dataType: string}} ajax 호출시 사용될 option 파라미터
         * @private
         */
        _getRequestParam: function(requestType, options) {
            var defaultOptions = {
                    url: this.options.api[requestType],
                    type: null,
                    hasDataParam: true,
                    isOnlyModified: true,
                    isOnlyChecked: true
                },
                newOptions = $.extend(defaultOptions, options),
                dataParam = this._getDataParam(requestType, newOptions),
                param;

            if (this._isConfirmed(requestType, dataParam.count)) {
                param = {
                    requestType: requestType,
                    url: newOptions.url,
                    data: dataParam.data,
                    type: newOptions.type
                };
                return param;
            }
        },
        /**
         * requestType 에 따른 컨펌 메세지를 노출한다.
         * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
         * @param {Number} count   전송될 데이터 개수
         * @return {boolean}    계속 진행할지 여부를 반환한다.
         * @private
         */
        _isConfirmed: function(requestType, count) {
            /* istanbul ignore next: confirm 을 확인할 수 없읔 */
            if (count > 0) {
                return confirm(this._getConfirmMessage(requestType, count));
            } else {
                alert(this._getConfirmMessage(requestType, count));
                return false;
            }
        },
        /**
         * confirm message 를 반환한다.
         * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
         * @param {Number} count 전송될 데이터 개수
         * @return {string} 생성된 confirm 메세지
         * @private
         */
        _getConfirmMessage: function(requestType, count) {
            var textMap = {
                    'createData': '입력',
                    'updateData': '수정',
                    'deleteData': '삭제',
                    'modifyData': '반영'
                },
                actionName = textMap[requestType];
            if (count > 0) {
                return count + '건의 데이터를 ' + actionName + '하시겠습니까?';
            } else {
                return actionName + '할 데이터가 없습니다.';
            }
        },
        /**
         * ajax 통신을 한다.
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @private
         */
        _ajax: function(options) {
            var eventData = this.createEventData(options.data);

            //beforeRequest 이벤트를 발생한다.
            this.grid.trigger('beforeRequest', eventData);

            //event 의 stopped 가 호출 된다면 ajax 호출을 중지한다.
            if (eventData.isStopped()) {
                return;
            }

            options = $.extend({requestType: ''}, options);
            var params = {
                'url' : options.url,
                'data' : options.data || {},
                'type' : options.type || 'POST',
                'dataType' : options.dataType || 'json',
                'complete' : $.proxy(this._onComplete, this, options.complete, options),
                'success' : $.proxy(this._onSuccess, this, options.success, options),
                'error' : $.proxy(this._onError, this, options.error, options)
            };
            if (options.url) {
                $.ajax(params);
            }
        },
        /**
         * ajax complete 이벤트 핸들러
         * @param {Function} callback   통신 완료 이후 수행할 콜백함수
         * @param {object} jqXHR    jqueryXHR  객체
         * @param {number} status   http status 정보
         * @private
         */
        _onComplete: function(callback, jqXHR, status) {
            this._unlock();
        },
        /**
         * ajax success 이벤트 핸들러
         * @param {Function} callback
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @param {Object} responseData 응답 데이터
         * @param {number} status   http status 정보
         * @param {object} jqXHR    jqueryXHR  객체
         * @private
         */
        _onSuccess: function(callback, options, responseData, status, jqXHR) {
            var message = responseData && responseData['message'],
                eventData = this.createEventData({
                    httpStatus: status,
                    requestType: options.requestType,
                    requestParameter: options.data,
                    responseData: responseData
                });
            this.grid.trigger('response', eventData);
            if (eventData.isStopped()) {
                return;
            }
            if (responseData && responseData['result']) {
                this.grid.trigger('successResponse', eventData);
                if (eventData.isStopped()) {
                    return;
                }
                if (_.isFunction(callback)) {
                    callback(responseData['data'] || {}, status, jqXHR);
                }
            } else {
                //todo: 오류 처리 - invalid 셀에 마크하기 등. 스펙아웃 할 수도 있음
                this.grid.trigger('failResponse', eventData);
                if (eventData.isStopped()) {
                    return;
                }
                message ? alert(message) : null;
            }
        },
        /**
         * ajax error 이벤트 핸들러
         * @param {Function} callback
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @param {object} jqXHR    jqueryXHR  객체
         * @param {number} status   http status 정보
         * @param {String} errorMessage 에러 메세지
         * @private
         */
        _onError: function(callback, options, jqXHR, status, errorMessage) {
            var eventData = this.createEventData({
                httpStatus: status,
                requestType: options.requestType,
                requestParameter: options.data,
                responseData: null
            });
            this.grid.hideGridLayer();

            this.grid.trigger('response', eventData);
            if (eventData.isStopped()) {
                return;
            }

            this.grid.trigger('errorResponse', eventData);
            if (eventData.isStopped()) {
                return;
            }

            if (jqXHR.readyState > 1) {
                alert('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
            }
        }
    });
    /**
     * Ajax History 관리를 위한 Router AddOn
     * @constructor AddOn.Net.Router
     */
    AddOn.Net.Router = Backbone.Router.extend(/**@lends AddOn.Net.Router.prototype */{
        routes: {
            'read/:queryStr': 'read'
        },
        initialize: function(attributes) {
            this.setOwnProperties({
                grid: attributes && attributes.grid || null,
                net: attributes && attributes.net || null
            });
        },
        /**
         * Backbone Router 에서 url 정보를 통해 서버로 read 요청을 한다.
         * @param {String} queryStr 쿼리 문자열
         */
        read: function(queryStr) {
            var data = Util.toQueryObject(queryStr);
            //formData 를 설정한다.
            this.net.setFormData(data);
            //그 이후 read
            this.net.readData(data);
        },
        /**
         * 내부 프로퍼티 설정
         * @param {Object} properties 할당할 프로퍼티 데이터
         */
        setOwnProperties: setOwnProperties
    });

/**
 * @fileoverview Grid Core 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Grid 코어
     * @constructor Core
     */
    var Core = View.Base.extend(/**@lends Core.prototype */{
        /**
         * 스크롤바의 높이
         * @type {Number}
         */
        scrollBarSize: 17,
        lside: null,
        rside: null,
        toolbar: null,
        cellFactory: null,
        events: {
            'click': '_onClick',
            'mousedown': '_onMouseDown',
            'selectstart': '_preventDrag',
            'dragstart': '_preventDrag'
        },
        keyMap: {
            'TAB': 9,
            'ENTER': 13,
            'CTRL': 17,
            'ESC': 27,
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'CHAR_A': 65,
            'CHAR_C': 67,
            'CHAR_F': 70,
            'CHAR_R': 82,
            'CHAR_V': 86,
            'LEFT_WINDOW_KEY': 91,
            'F5': 116,
            'BACKSPACE': 8,
            'SPACE': 32,
            'PAGE_UP': 33,
            'PAGE_DOWN': 34,
            'HOME': 36,
            'END': 35,
            'DEL': 46,
            'UNDEFINED': 229
        },
        keyName: {
            9: 'TAB',
            13: 'ENTER',
            17: 'CTRL',
            27: 'ESC',
            37: 'LEFT_ARROW',
            38: 'UP_ARROW',
            39: 'RIGHT_ARROW',
            40: 'DOWN_ARROW',
            65: 'CHAR_A',
            67: 'CHAR_C',
            70: 'CHAR_F',
            82: 'CHAR_R',
            86: 'CHAR_V',
            91: 'LEFT_WINDOW_KEY',
            116: 'F5',
            8: 'BACKSPACE',
            32: 'SPACE',
            33: 'PAGE_UP',
            34: 'PAGE_DOWN',
            36: 'HOME',
            35: 'END',
            46: 'DEL',
            229: 'UNDEFINED'
        },
        /**
         * 생성자 함수
         * @param {Object} options Grid.js 의 생성자 option 과 동일값.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.publicInstance = options.publicInstance;
            var id = Util.getUniqueKey();
            this.__instance[id] = this;
            this.id = id;

            this._initializeOptions(options);
            this._initializeProperties();

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this._attachExtraEvent();

            this.render();

            this.updateLayoutData();
        },
        /**
         * default 설정된 옵션에서 생성자로부터 인자로 받은 옵션들을 확장하여 옵션을 설정한다.
         * @param {Object} options Grid.js 의 생성자 option 과 동일값.
         * @private
         */
        _initializeOptions: function(options) {
            var defaultOptions = {
                columnFixIndex: 0,
                columnModelList: [],
                keyColumnName: null,
                selectType: '',

                autoNumbering: true,

                headerHeight: 35,
                rowHeight: 27,
                displayRowCount: 10,
                minimumColumnWidth: 50,
                notUseSmartRendering: false,
                columnMerge: [],
                scrollX: true,
                scrollY: true,
                useDataCopy: true,

                toolbar: {
                    hasResizeHandler: true,
                    hasControlPanel: true,
                    hasPagination: true
                }
            };

            this.options = $.extend(true, defaultOptions, options);
        },
        /**
         * 내부 properties 를 초기화한다.
         * @private
         */
        _initializeProperties: function() {
            this.setOwnProperties({
                'cellFactory': null,
                'selection': null,
                'columnModel': null,
                'dataModel': null,
                'renderModel': null,
                'layoutModel': null,
                'focusModel': null,
                'addOn': {},
                'view': {
                    'lside': null,
                    'rside': null,
                    'toolbar': null,
                    'clipboard': null,
                    'layer': {
                        ready: null,
                        loading: null,
                        empty: null
                    }
                },
                'timeoutIdForBlur': 0,
                'timeoutIdForResize': 0,
                'timeoutIdForSetRowList': 0,
                '__$el': this.$el.clone()
            });
        },
        /**
         * 내부에서 사용할 모델 instance를 초기화한다.
         *
         * Initialize data model instances
         * @private
         */
        _initializeModel: function() {
            var offset = this.$el.offset();

            //define column model
            this.columnModel = new Data.ColumnModel({
                grid: this,
                hasNumberColumn: this.option('autoNumbering'),
                keyColumnName: this.option('keyColumnName'),
                columnFixIndex: this.option('columnFixIndex'),
                selectType: this.option('selectType')
            });
            this.setColumnModelList(this.option('columnModelList'));

            //define layout model
            this.dimensionModel = new Model.Dimension({
                grid: this,
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                headerHeight: this.option('headerHeight'),
                rowHeight: this.option('rowHeight'),

                scrollX: !!this.option('scrollX'),
                scrollY: !!this.option('scrollY'),
                scrollBarSize: this.scrollBarSize,

                minimumColumnWidth: this.option('minimumColumnWidth'),
                displayRowCount: this.option('displayRowCount')
            });

            // define focus model
            this.focusModel = new Model.Focus({
                grid: this,
                scrollX: !!this.option('scrollX'),
                scrollY: !!this.option('scrollY'),
                scrollBarSize: this.scrollBarSize
            });

            //define rowList
            this.dataModel = new Data.RowList([], {
                grid: this
            });
            this.dataModel.reset([]);

            if (this.option('notUseSmartRendering')) {
                this.renderModel = new Model.Renderer({
                    grid: this
                });
            } else {
                this.renderModel = new Model.Renderer.Smart({
                    grid: this
                });
            }

            this.cellFactory = this.createView(View.CellFactory, { grid: this });
        },
        /**
         * 내부에서 사용할 view 인스턴스들을 초기화한다.
         * @private
         */
        _initializeView: function() {
            this.cellFactory = this.createView(View.CellFactory, {
                grid: this
            });

            this.selection = this.createView(View.Selection, {
                grid: this
            });

            //define header & body area
            this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid: this
            });

            this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid: this
            });

            this.view.toolbar = this.createView(View.Layout.Toolbar, {
                grid: this
            });

            this.view.layer.ready = this.createView(View.Layer.Ready, {
                grid: this
            });
            this.view.layer.empty = this.createView(View.Layer.Empty, {
                grid: this
            });
            this.view.layer.loading = this.createView(View.Layer.Loading, {
                grid: this
            });

            this.view.clipboard = this.createView(View.Clipboard, {
                grid: this
            });

            if (this.options && !this.options.useDataCopy) {
                this.selection.disable();
            }
        },
        /**
         * 커스텀 이벤트 리스너를 초기화한다.
         * @private
         */
        _initializeListener: function() {
            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange)
                .listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight)
                .listenTo(this.focusModel, 'select', this._onRowSelectChanged);
        },
        /**
         * scrollbar 를 초기화한다.
         * @private
         */
        _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },
        /**
         * event 속성에 정의되지 않은 이벤트 attach 한다.
         * @private
         */
        _attachExtraEvent: function() {
            $(window).on('resize', $.proxy(this._onWindowResize, this));
            $(document).on('focusin', $.proxy(this._onBlur, this));
        },

        /**
         * 클립보드 blur 이벤트 핸들러
         * @private
         */
        _onBlur: function() {
            clearTimeout(this.timeoutIdForBlur);
            this.timeoutIdForBlur = setTimeout($.proxy(this._doBlur, this), 0);
        },
        /**
         * 실제 blur 를 한다.
         * @private
         */
        _doBlur: function() {
            if (this.$el) {
                var $focused = this.$el.find(':focus'),
                    hasFocusedElement = !!$focused.length;

                if (!hasFocusedElement) {
                    this.focusModel.blur();
                } else if ($focused.is('td') || $focused.is('a')) {
                    this.focusClipboard();
                }
            }
        },
        /**
         * drag 이벤트 발생시 이벤트 핸들러
         * @returns {boolean}
         * @private
         */
        _preventDrag: function() {
            return false;
        },
        /**
         * window resize  이벤트 핸들러
         * @private
         */
        _onWindowResize: function() {
            if (this.$el && this.$el.length) {
                var width = Math.max(this.option('minimumWidth'), this.$el.css('width', '100%').width());
                this.dimensionModel.set('width', width);
            }
        },
        /**
         * click 이벤트 핸들러
         * @param {event} clickEvent 이벤트 객체
         * @private
         */
        _onClick: function(clickEvent) {
            var eventData = this.createEventData(clickEvent);
            this.trigger('click', eventData);
            if (eventData.isStopped()) {
                return;
            }
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent 이벤트 객체
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target),
                eventData = this.createEventData(mouseDownEvent);
            this.trigger('mousedown', eventData);

            if (eventData.isStopped()) return;
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.selection.show();
            }
            this.focusClipboard();
        },
        /**
         * select 된 row 가 변경된 경우 이벤트 핸들러.
         * radio select type 의 경우에 select 된 행을 check 해주는 로직을 담당한다.
         * @param {(Number|String)} rowKey 변경이 일어난 데이터의 rowKey
         * @private
         */
        _onRowSelectChanged: function(rowKey) {
            if (this.columnModel.get('selectType') === 'radio') {
                this.uncheckAll();
                this.check(rowKey);
            }
        },
        /**
         * width 변경시 layout data 를 update 한다.
         * @private
         */
        _onWidthChange: function() {
            this.updateLayoutData();
        },
        /**
         * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
         * @private
         */
        updateLayoutData: function() {
            var offset = this.$el.offset(),
                rsideTotalWidth = this.dimensionModel.getFrameWidth('R'),
                maxScrollLeft = rsideTotalWidth - this.dimensionModel.get('rsideWidth');

            this.renderModel.set({
                maxScrollLeft: maxScrollLeft
            });
            this.dimensionModel.set({
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                toolbarHeight: this.view.toolbar.$el.height()
            });
        },

        /**
         * option 값을 설정하거나 가져온다.
         * @param {(String|Number)} key 데이터의 key
         * @param {*} [value]   설정할 값. 두번째 값이 설정되어 있지 않다면 getter 로 활용된다.
         * @return {*}  결과값
         */
        option: function(key, value) {
            if (ne.util.isUndefined(value)) {
                this.options = this.options || {};
                return this.options[key];
            } else {
                this.options[key] = value;
                return this;
            }
        },
        /**
         * clipboard 에 focus 한다.
         */
        focusClipboard: function() {
            /* istanbul ignore next: focus 이벤트 확인이 불가함 */
            if (ne.util.isExisty(ne.util.pick(this, 'view', 'clipboard'))) {
                this.view.clipboard.$el.focus();
            }

        },


        /**
         * 랜더링한다.
         *
         * Rendering grid view
         */
        render: function() {
            var leftLine = $('<div>').addClass('left_line'),
                rightLine = $('<div>').addClass('right_line');

            this.$el.addClass('grid_wrapper')
                .addClass('uio_grid')
                .attr('instanceId', this.id)
                .append(this.view.layer.empty.render().el)
                .append(this.view.layer.loading.render().el)
                .append(this.view.layer.ready.render().el);

            this.view.layer.loading.show('초기화 중입니다.');

            this.$el.append(this.view.lside.render().el)
                .append(this.view.rside.render().el)
                .append(this.view.toolbar.render().el)
                .append(leftLine)
                .append(rightLine)
                .append(this.view.clipboard.render().el);
            this._setHeight();
            this.trigger('rendered');
        },
        /**
         * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
         * grid 의 전체 너비를 설정한다.
         * @private
         */
        _setHeight: function() {
            var bodyHeight = this.dimensionModel.get('bodyHeight'),
                headerHeight = this.dimensionModel.get('headerHeight'),
                toolbarHeight = this.view.toolbar.$el.height(),
                height = toolbarHeight + headerHeight + bodyHeight;
            this.$el.css('height', height + 'px');
            this.dimensionModel.set({
                toolbarHeight: toolbarHeight
            });
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
         * @return {(Number|String)}    조회한 셀의 값.
         */
        getValue: function(rowKey, columnName, isOriginal) {
            var value;
            if (isOriginal) {
                value = this.dataModel.getOriginal(rowKey, columnName);
            } else {
                value = this.dataModel.get(rowKey).get(columnName);
            }
            return value;
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼명
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
         */
        getColumnValues: function(columnName, isJsonString) {
            var valueList = this.dataModel.pluck(columnName);
            return isJsonString ? $.toJSON(valueList) : valueList;
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey  행 데이터의 고유 키
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRow: function(rowKey, isJsonString) {
            var row = this.dataModel.get(rowKey);
            row = row && row.toJSON();
            return isJsonString ? $.toJSON(row) : row;
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index 행의 인덱스
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRowAt: function(index, isJsonString) {
            var row = this.dataModel.at(index).toJSON();
            row = isJsonString ? $.toJSON(row) : row;
            return row;
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number} 데이터 개수
         */
        getRowCount: function() {
            return this.dataModel.length;
        },
        /**
         * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
         * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
            return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        select: function(rowKey) {
            this.focusModel.select(rowKey);
        },
        /**
         * 선택되었던 행에 대한 선택을 해제한다.
         */
        unselect: function() {
            this.focusModel.unselect();
        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)} 행 데이터의 고유 키
         */
        getSelectedRowKey: function() {
            return this.focusModel.which().rowKey;
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            columnValue = _.isString(columnValue) ? $.trim(columnValue) : columnValue;
            var row = this.dataModel.get(rowKey),
                obj = {};
            if (row) {
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent: silent
                });
                return true;
            } else {
                return false;
            }
        },
        /**
         * columnName 에 해당하는 값을 전부 변경한다.
         * @param {String} columnName 컬럼명
         * @param {(Number|String)} columnValue 변경할 컬럼 값
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
         */
        setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
            isCheckCellState = isCheckCellState === undefined ? true : isCheckCellState;
            var obj = {},
                cellState = {
                    isDisabled: false,
                    isEditable: true
                };
            obj[columnName] = columnValue;

            this.dataModel.forEach(function(row) {
                if (isCheckCellState) {
                    cellState = this.getCellState(row.get('rowKey'), columnName);
                }
                if (!cellState.isDisabled && cellState.isEditable) {
                    row.set(obj, {
                        silent: silent
                    });
                }
            }, this);
        },
        /**
         * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
         * @param {Array} rowList 설정할 데이터 배열 값
         * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
         */
        replaceRowList: function(rowList, isParse) {
            var callback = ne.util.bind(function() {
                this.dataModel.set(rowList, {
                    parse: isParse
                });
            }, this);
            this.showGridLayer('loading');
            isParse = isParse === undefined ? true : isParse;
            //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
            if (rowList && rowList.length > 500) {
                clearTimeout(this.timeoutIdForSetRowList);
                this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                    callback();
                }, this), 0);
            } else {
                callback();
            }
        },
        /**
         * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
         * @param {Array} rowList 설정할 데이터 배열 값
         * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
         */
        setRowList: function(rowList, isParse) {
            var callback = ne.util.bind(function() {
                this.dataModel.set(rowList, {
                    parse: isParse
                });
                this.dataModel.setOriginalRowList();
            }, this);
            this.showGridLayer('loading');
            isParse = isParse === undefined ? true : isParse;
            //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
            if (rowList && rowList.length > 500) {
                clearTimeout(this.timeoutIdForSetRowList);
                this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                    callback();
                }, this), 0);
            } else {
                callback();
            }
        },
        /**
         * rowKey, columnName 에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.focusModel.focus(rowKey, columnName, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            var cellInstance;
            this.focus(rowKey, columnName, isScrollable);
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
            if (this.isEditable(rowKey, columnName)) {
                cellInstance = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
                cellInstance.focusIn(this.getElement(rowKey, columnName));
            } else {
                this.focusClipboard();
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex, true);
            if (row && column) {
                this.focus(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex, true);
            if (row && column) {
                this.focusIn(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.focusModel.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.setColumnValues('_button', true);
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.setColumnValues('_button', false);
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.setValue(rowKey, '_button', false);
        },

        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            //@todo: empty 레이어 추가
            this.setRowList([]);
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            this.dataModel.removeRow(rowKey, isRemoveOriginalData);
        },

        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        enableRow: function(rowKey) {
            this.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.dataModel.setRowState(rowKey, 'DISABLED');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        enableCheck: function(rowKey) {
            this.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        disableCheck: function(rowKey) {
            this.dataModel.setRowState(rowKey, 'DISABLED_CHECK');
        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 키값 리스트.
         */
        getCheckedRowKeyList: function(isJsonString) {
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row) {
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return isJsonString ? $.toJSON(rowKeyList) : rowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 데이터값 리스트.
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.dataModel.getRowList(true);
            return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}  컬럼모델 리스트
         */
        getColumnModelList: function() {
            return this.columnModel.get('columnModelList');
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         * @param {Object} [options]
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}} 옵션에 따라 반환된 수정된 데이터 목록
         */
        getModifiedRowList: function(options) {
            //@todo 파라미터 옵션에 따른 데이터 형 변화
            return this.dataModel.getModifiedRowList(options);
        },

        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        appendRow: function(row) {
            this.dataModel.append(row);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        prependRow: function(row) {
            this.dataModel.prepend(row);
        },
        /**
         * 열 고정 위치를 변경한다.
         * @param {Number} columnFixIndex 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(columnFixIndex) {
            this.option({
                columnFixIndex: columnFixIndex
            });
            this.columnModel.set({columnFixIndex: columnFixIndex});
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}    데이터가 변경되었는지 여부
         */
        isChanged: function() {
            var modifiedRowMap = this.getModifiedRowList(),
                result = false;

            ne.util.forEach(modifiedRowMap, function(data) {
                if (data.length) {
                    result = true;
                    return false;
                }
            });

            return result;
        },
        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            var originalRowList = this.dataModel.getOriginalRowList();
            this.replaceRowList(originalRowList, false);
        },
        /**
         * Grid Layer 를 모두 감춘다.
         */
        hideGridLayer: function() {
            _.each(this.view.layer, function(view) {
                view.hide();
            }, this);
        },
        /**
         * name 에 해당하는 Grid Layer를 보여준다.
         * @param {String} name ready|empty|loading 중 하나를 설정한다.
         */
        showGridLayer: function(name) {
            this.hideGridLayer();
            this.view.layer[name] ? this.view.layer[name].show() : null;
        },

        /**
         * pagination instance 를 반환한다.
         * @return {instance} pagination 인스턴스
         */
        getPaginationInstance: function() {
            var paginationView = this.view.toolbar.pagination;
            if (paginationView) {
                return paginationView.instance;
            }
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {Core}
         */
        use: function(name, options) {
            options = $.extend({grid: this}, options);
            if (AddOn[name]) {
                this.addOn[name] = new AddOn[name](options);
            }
            return this;
        },
        /**
         * 정렬이 되었는지 여부 반환
         * @return {Boolean} 현재 정렬이 되어있는지 여부
         */
        isSorted: function() {
            return this.dataModel.isSortedByField();
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         * @param {String} columnName 컬럼 이름
         * @return {Boolean} 편집 가능한지 여부
         */
        isEditable: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel,
                row,
                isEditable;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;
            row = dataModel.get(rowKey);
            isEditable = row ? row.isEditable(columnName) : true;
            return isEditable;
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 disabled 상태인지 여부를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         * @param {String} columnName 컬럼 이름
         * @return {Boolean} disabled 상태인지 여부
         */
        isDisabled: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel,
                row,
                isDisabled;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;
            row = dataModel.get(rowKey);
            isDisabled = row ? row.isDisabled(columnName) : false;
            return isDisabled;
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         * @param {String} columnName 컬럼 이름
         * @return {{isEditable: boolean, isDisabled: boolean}} 편집가능한지 여부와 disabled 인지 여부.
         */
        getCellState: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                dataModel = this.dataModel;

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;

            return dataModel.get(rowKey).getCellState(columnName);
        },
        /**
         * columnModelList 를 재설정한다..
         * @param {Array} columnModelList 컬럼모델 리스트
         */
        setColumnModelList: function(columnModelList) {
            this.columnModel.set('columnModelList', columnModelList);
        },
        /**
         * columnName 기준으로 정렬한다.
         * @param {String} columnName 컬럼명
         */
        sort: function(columnName) {
            this.dataModel.sortByField(columnName);
        },
        /**
         * 현재 그리드의 rowList 를 반환한다.
         * @return {Array} 그리드의 데이터 리스트
         */
        getRowList: function() {
            return this.dataModel.getRowList();
        },

        /**
         * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         * @param {String} columnName 컬럼 이름
         * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
         */
        del: function(rowKey, columnName, silent) {
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

            var editType = this.columnModel.getEditType(columnName),
                isDisabledCheck = this.dataModel.get(rowKey).getRowState().isDisabledCheck,
                deletableEditTypeList = ['text', 'text-convertible'],
                isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
                selectType = this.option('selectType'),
                cellState = this.getCellState(rowKey, columnName),
                isRemovable = !!(isDeletable && cellState.isEditable && !cellState.isDisabled);

            if (isRemovable) {
                this.setValue(rowKey, columnName, '', silent);
                //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
                if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                    this.setValue(rowKey, '_button', true, silent);
                }
            }
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        addCellClassName: function(rowKey, columnName, className) {
            this.dataModel.addCellClassName(rowKey, columnName, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        addRowClassName: function(rowKey, className) {
            this.dataModel.addRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        removeCellClassName: function(rowKey, columnName, className) {
            this.dataModel.removeCellClassName(rowKey, columnName, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        removeRowClassName: function(rowKey, className) {
            this.dataModel.removeRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         */
        getRowSpanData: function(rowKey, columnName) {
            var row = this.dataModel.get(rowKey);
            if (row) {
                return row.getRowSpanData(columnName);
            }
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @todo 기능 구현
         * @param {String} columnName 컬럼 이름
         * @param {(String|Number)} columnValue 컬럼 이름
         */
        filterData: function(columnName, columnValue) {
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         * @todo 기능 구현
         */
        enable: function() {
        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {
        },
        /**
         * 그리드의 layout 데이터를 갱신한다.
         * 그리드가 숨겨진 상태에서 초기화 되었을 경우 사옹한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        refreshLayout: function() {
        },
        /**
         * 그리드의 크기 정보를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setGridSize: function(size) {
            //var dimensionModel = this.dimensionModel,
            //    width = size && size.width || dimensionModel.get('width'),
            //    bodyHeight = dimensionModel.get('bodyHeight'),
            //    headerHeight = dimensionModel.get('headerHeight'),
            //    toolbarHeight = dimensionModel.get('toolbarHeight');
            //
            //if (size && size.height) {
            //    bodyHeight = height - (headerHeight + toolbarHeight);
            //}
        },
        /**
         * 스크롤 핸들러의 위치를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setScrollHandlerPosition: function() {},

        /**
         * 소멸자
         */
        destroy: function() {
            this.stopListening();
            this.destroyChildren();
            _.each(this, function(value, property) {
                if (property !== 'publicInstance') {
                    if (value instanceof View.Base) {
                        if (value && ne.util.isFunction(value.destroy)) {
                            value.destroy();
                        }
                    }
                    if (property === 'view') {
                        _.each(value, function(instance, name) {
                            if (instance && ne.util.isFunction(instance.destroy)) {
                                instance.destroy();
                            }
                        }, this);
                    }
                }

                if (value && ne.util.isFunction(value._destroy)) {
                    value._destroy();
                }

                if (value && ne.util.isFunction(value.stopListening)) {
                    value.stopListening();
                }

                if (property !== '$el' && property !== '__$el') {
                    this[property] = null;
                }
            }, this);
            this.$el.replaceWith(this.__$el);
            this.$el = this.__$el = null;
        }
    });

    Core.prototype.__instance = Core.prototype.__instance || {};

/**
 * @fileoverview 기본 클래스 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * ne
     * @namespace
     */
    ne = window.ne = ne || {};
    /**
     * Grid public API
     *
     * @param {Object} options
     *      @param {number} [options.columnFixIndex=0] 열고정 기능을 사용하기 위한 인덱스 값으로 고정시킬 컬럼들의 다음 컬럼 인덱스 번호를 설정한다.
     *      setColumnFixIndex()메서드를 사용해서 동적으로 열고정 위치를 변경할 수도 있다.
     *      @param {string} [options.selectType=''] 그리드의 각 행 앞에 선택을 위한 체크박스 및 라디오박스를 추가한다.
     *      값을 지정하지 않은 경우 UI적인 변화는 없으며 라디오박스인 경우처럼 단일 선택만 가능하다.
     *      @param {boolean} [options.autoNumbering=true] 데이터를 출력 시에 행마다 순번을 자동으로 부여하여 표시한다.
     *      @param {number} [options.headerHeight=35] 그리드 헤더 영역의 기본 높이. 헤더 영역에서 컬럼 병합 기능을 사용하여 여러 개의 행을 출력하는 경우, 전체 행의 높이를 지정해야 한다.
     *      @param {number} [options.rowHeight=27] 그리드에 표시되는 행들의 기본 높이를 지정하는 값.
     *      각 컬럼에 보여줘야 할 내용이 많을 경우 rowHeight값을 크게 지정하여야 모든 내용을 표시할 수 있다.
     *      @param {number} [options.displayRowCount=10] 그리드에 표시될 행의 개수를 지정하며, 이 값에 따라 그리드의 높이가 자동으로 계산된다
     *      @param {number} [options.minimumColumnWidth=50] 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
     *      @param {boolean} [options.scrollX=true] 수평 스크롤바 사용 여부.
     *      @param {boolean} [options.scrollY=true] 수직 스크롤바 사용 여부.
     *      @param {string} [options.keyColumnName=null] 각각의 데이터를 구분지을 수 있는 키 값의 필드명(=privateKey).
     *      존재하지 않을 시 내부적으로 키를 생성하여 할당한다.
     *      @param {object} [options.toolbar]       툴바영역의 UI 컴포넌트 사용 여부 설정
     *          @param {boolean} [options.toolbar.hasResizeHandler=true]    수직 resizeHandler 를 사용한다.
     *          @param {boolean} [options.toolbar.hasControlPanel=true]     컨트롤 패널을 사용한다.
     *          @param {boolean} [options.toolbar.hasPagination=true]       pagination 을 사용한다.
     *      @param {array} options.columnModelList
     *          @param {string} options.columnModelList.columnName 컬럼의 데이터 필드명
     *          @param {string} [options.columnModelList.isEllipsis=false] 컬럼의 말줄임 여부를 설정
     *          @param {string} [options.columnModelList.align=left] 컬럼에 설정할 정렬값
     *          @param {string} [options.columnModelList.className] 컬럼 전체에 적용할 디자인 클래스 이름
     *          @param {string} [options.columnModelList.title] 그리드 헤더 영역에 보여질 컬럼 이름
     *          @param {string} [options.columnModelList.width] 컬럼 너비 값. pixel 로 지정한다.
     *          @param {string} [options.columnModelList.isHidden ] 설정된 데이터 중에 화면 상에 표시하지 않을 컬럼에 대해서 true로 설정을 한다.
     *          @param {String} [options.columnModelList.defaultValue] 컬럼에 값이 없는 경우 화면에 보여질 기본 텍스트.
     *          @param {string} [options.columnModelList.formatter] 데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수로, 값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
     *          @param {string} [options.columnModelList.notUseHtmlEntity=false] 그리드 랜더링 시 원본 데이터를 HTML Entity 로 변환하지 않도록 하려면 옵션을 true 로 준다.
     *          @param {string} [options.columnModelList.isIgnore=false] 그리드에서 값 변경으로 간주하지 않을 column 인지 여부를 결정한다.
     *          @param {Array} [options.columnModelList.editOption] 수정 UI 및 기능에 대한 좀 더 세분화된 설정을 할 수 있도록 지원한다.
     *              @param {string} [options.columnModelList.editOption.type='normal'] 컬럼의 데이터를 사용자가 직접 수정할 수 있는 UI를 제공하며, "text", "text-convertible", "select", "radio", "checkbox" 등을 지정할 수 있다.
     *              @param {Array} [options.columnModelList.editOption.list] select, checkbox, radio 와 같이 list 형태일 경우 [{text: '노출 text', value: '1'}] 과 같은 형태로 설정한다.
     *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경되기 전에 호출될 콜백함수를 지정한다. false 반환시 변경을 취소한다.
     *              @param {function} [options.columnModelList.editOption.changeAfterCallback] 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경된 후 호출될 콜백함수를 지정한다.
     *              @param {string} [options.columnModelList.editOption.beforeText] 인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
     *              @param {string} [options.columnModelList.editOption.afterText] 인풋 엘리먼트가 표시될 때 인풋 엘리먼트 뒤에 추가하여 보여줄 텍스트를 지정한다.
     *          @param {Array} [options.columnModelList.relationList] 현재 컬럼의 값 변화에 따라 다른 컬럼의 상태를 변경할 수 있다.
     *              @param {array} [options.columnModelList.relationList.columnList]    상태값을 변경할 타켓 컬럼 리스트.
     *              @param {function} [options.columnModelList.relationList.isDisabled] 타켓 컬럼을 disabled 로 변경할지 여부를 반환한다.
     *              @param {function} [options.columnModelList.relationList.isEditable] 타켓 컬럼을 편집 가능한 컬럼으로 지정할지 여부를 반환한다.
     *              @param {function} [options.columnModelList.relationList.optionListChange] 타겟 컬럼이 select, checkbox, radio 와 같이 list 형태일 경우 list 를 변경한다.
     *      @param {array} options.columnMerge
     * @constructor ne.Grid
     * @example
         <div id='grid'></div>
         <script>
     var grid = new ne.Grid({
        el: $('#grid'),
        columnFixIndex: 2,  //(default=0) 열고정 기능을 사용하기 위한 인덱스 값으로 고정시킬 컬럼들의 다음 컬럼 인덱스 번호를 설정한다.
        selectType: 'checkbox', //(default='') 그리드의 각 행 앞에 선택을 위한 체크박스 및 라디오박스를 추가한다. 'checkbox' 또는 'radio' 로 설정한다. 값을 지정하지 않은 경우 UI적인 변화는 없으며 라디오박스인 경우처럼 단일 선택만 가능하다.
        autoNumbering: true, //(default=true) 데이터를 출력 시에 행마다 순번을 자동으로 부여하여 표시한다. 값을 지정하지 않은 경우 UI적인 변화는 없다.
        headerHeight: 100, //(default=35) 그리드 헤더 영역의 기본 높이. 헤더 영역에서 컬럼 병합 기능을 사용하여 여러 개의 행을 출력하는 경우, 전체 행의 높이를 지정해야 한다.
        rowHeight: 27, // (default=27) 그리드에 표시되는 행들의 기본 높이를 지정하는 값. 각 컬럼에 보여줘야 할 내용이 많을 경우 rowHeight 값을 크게 지정하여야 모든 내용을 표시할 수 있다.
        displayRowCount: 10, //(default=10) 그리드에 표시될 행의 개수를 지정하며, 이 값에 따라 그리드의 높이가 자동으로 계산된다.
        minimumColumnWidth: 50, //(default=50) 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
        minimumWidth: 50, //(default=50) 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
        scrollX: true, //(default:true) 수평 스크롤바 사용 여부.
        scrollY: true, //(default:true) 수직 스크롤바 사용 여부.
        keyColumnName: 'column1', //(default:null) 각 행의 primaryKey 가 될 컬럼 필드명. 지정하지 않을 시 내부적으로 키를 생성하여 할당한다.
        toolbar: {  //툴바영역의 UI 컴포넌트 사용 여부 설정
            hasResizeHandler: true, //(default:true) 수직 resizeHandler 를 사용한다.
            hasControlPanel: true,  //(default:true) 컨트롤 패널을 사용한다.
            hasPagination: true     //(default:true) pagination 을 사용한다.
        },
        columnModelList: [
            {
                title: '일반 타이틀',         //그리드 헤더 영역에 보여질 컬럼 이름
                columnName: 'column0',      //컬럼의 데이터 필드명
                className: 'bg_red',        //컬럼 전체에 적용할 디자인 클래스 이름
                width: 100,                 //컬럼 너비 값. pixel 로 지정한다.
                isEllipsis: false,          //(default:false) 컬럼의 말줄임 여부를 설정
                notUseHtmlEntity: false,    //(default:false) 그리드 랜더링 시 원본 데이터를 HTML Entity 로 변환하지 않도록 하려면 옵션을 true 로 준다.
                defaultValue: '빈값',        //컬럼에 값이 없는 경우 화면에 보여질 기본 텍스트.
                isIgnore: false             //(default:false) 그리드에서 값 변경으로 간주하지 않을 column 인지 여부

            },
            {
                title: '노출되지 않음',
                columnName: 'column1',
                isHidden: true              //설정된 데이터 중에 화면 상에 표시하지 않을 컬럼에 대해서 true로 설정을 한다.
            },
            {
                title: 'formatter 설정',
                columnName: 'column2',
                formatter: function(value, row) {       //데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수로, 값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
                    return '<img src="' + value + '" />';
                }
            },
            {
                title: '일반 text input 컬럼',
                columnName: 'column3',
                editOption: {
                    type: 'text',
                    beforeText: '가격:',  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
                    afterText: '원'  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 뒤에 추가하여 보여줄 텍스트를 지정한다.
                },
                //
                // 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경되기 전에 호출될 콜백함수를 지정한다. false 반환시 변경을 취소한다.
                // change beforeCallback 에서 정수가 입력되지 않았을 경우 이전값으로 되돌린다.
                // - param {object}  changeEvent
                //      - param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
                //      - param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
                //      - param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
                //      - param {object}  changeEvent.instance grid 인스턴스
                // - returns {boolean}
                //
                changeBeforeCallback: function(changeEvent) {
                    if (!/[0-9]+/.test(changeEvent.value)) {
                        alert('정수만 입력할 수 있습니다.');
                        return false;
                    }
                },
                //
                // 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경된 후 호출될 콜백함수를 지정한다.
                // - param {object}  changeEvent
                //      - param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
                //      - param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
                //      - param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
                //      - param {object}  changeEvent.instance grid 인스턴스
                // - returns {boolean}
                //
                changeAfterCallback: function(changeEvent) {}
            },
            {
                title: 'password text input 컬럼',
                columnName: 'column4',
                editOption: {
                    type: 'text-password',
                    beforeText: '비밀번호:'  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
                }
            },
            {
                title: 'text 에서 편집시 text input 으로 변경되는 컬럼',
                columnName: 'column5',
                editOption: {
                    type: 'text-convertible'
                },
                isIgnore: true
            },
            {
                title: '셀렉트박스',
                columnName: 'column6',
                editOption: {
                    type: 'select',
                    list: [                     //select, checkbox, radio 와 같이 list 형태일 경우 [{text: '노출 text', value: '1'}] 과 같은 형태로 설정한다.
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                },
                relationList: [
                    {
                        columnList: ['column7', 'column8'],     //상태값을 변경할 타켓 컬럼 리스트.
                        //
                        // 타켓 컬럼을 disabled 로 변경할지 여부를 반환한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {boolean} columnList 에 해당하는 column 이 disabled 될지 여부.
                        //
                        isDisabled: function(value, rowData) {
                            return value == 2;
                        },
                        //
                        // 타켓 컬럼을 편집 가능한 컬럼으로 지정할지 여부를 반환한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {boolean} columnList 에 해당하는 column 이 편집 가능한 상태일지 여부.
                        //
                        isEditable: function(value, rowData) {
                            return value != 3;
                        },
                        //
                        // 타겟 컬럼이 select, checkbox, radio 와 같이 list 형태일 경우 설정된 list 를 변경한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {{text: string, value: number}[]} columnList 에 해당하는 column 의 editOption.list 를 대신할 콜렉션.
                        //
                        optionListChange: function(value, rowData) {
                            if (value == 1) {
                                console.log('changev return');
                                return [
                                    { text: '하나', value: 1},
                                    { text: '둘', value: 2},
                                    { text: '셋', value: 3},
                                    { text: '넷', value: 4}
                                ];
                            }
                        }
                    }
                ]
            },
            {
                title: '체크박스',
                columnName: 'column7',
                editOption: {
                    type: 'checkbox',
                    list: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                }
            },
            {
                title: '라디오 버튼',
                columnName: 'column8',
                editOption: {
                    type: 'radio',
                    list: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                }
            }
        ],
        //table header 의 열 병합 정보
        columnMerge: [
            {
                'columnName' : 'mergeColumn1',
                'title' : '1 + 2',
                'columnNameList' : ['column1', 'column2']
            },
            {
                'columnName' : 'mergeColumn2',
                'title' : '1 + 2 + 3',
                'columnNameList' : ['mergeColumn1', 'column3']
            },
            {
                'columnName' : 'mergeColumn3',
                'title' : '1 + 2 + 3 + 4 + 5',
                'columnNameList' : ['mergeColumn2', 'column4', 'column5']
            }
        ]
    });

         </script>
     *
     */
    ne.Grid = View.Base.extend(/**@lends ne.Grid.prototype */{
        /**
         * 초기화 함수
         * @param {Object} options 생성자의 옵션 정보와 동일.
         */
        initialize: function(options) {
            //grid 에서 public instance 를 참조할 수 있도록 자신의 참조 추가
            options.publicInstance = this;
            this.core = new Core(options);
            this.listenTo(this.core, 'all', this._relayEvent, this);
        },
        /**
         * Grid 에서 발생하는 event 를 외부로 relay 한다.
         * @private
         */
        _relayEvent: function() {
            this.trigger.apply(this, arguments);
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.core.disableRow(rowKey);
        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey  행 데이터의 고유 키
         */
        enableRow: function(rowKey) {
            this.core.enableRow(rowKey);
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
         * @return {(Number|String)}    조회한 셀의 값.
         */
        getValue: function(rowKey, columnName, isOriginal) {
            return this.core.getValue(rowKey, columnName, isOriginal);
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼명
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
         */
        getColumnValues: function(columnName, isJsonString) {
            return this.core.getColumnValues(columnName, isJsonString);
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey  행 데이터의 고유 키
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRow: function(rowKey, isJsonString) {
            return this.core.getRow(rowKey, isJsonString);
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index 행의 인덱스
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRowAt: function(index, isJsonString) {
            return this.core.getRowAt(index, isJsonString);
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number} 데이터 개수
         */
        getRowCount: function() {
            return this.core.getRowCount();
        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)} 행 데이터의 고유 키
         */
        getSelectedRowKey: function() {
            return this.core.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            return this.core.getElement(rowKey, columnName);
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        setValue: function(rowKey, columnName, columnValue) {
            this.core.setValue(rowKey, columnName, columnValue);
        },
        /**
         * columnName 에 해당하는 값을 전부 변경한다.
         * @param {String} columnName 컬럼명
         * @param {(Number|String)} columnValue 변경할 컬럼 값
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         */
        setColumnValues: function(columnName, columnValue, isCheckCellState) {
            this.core.setColumnValues(columnName, columnValue, isCheckCellState);
        },
        /**
         * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
         * @param {Array} rowList 설정할 데이터 배열 값
         */
        replaceRowList: function(rowList) {
            this.core.replaceRowList(rowList);
        },
        /**
         * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
         * @param {Array} rowList 설정할 데이터 배열 값
         */
        setRowList: function(rowList) {
            this.core.setRowList(rowList);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.core.focus(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            this.core.focusIn(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusInAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.core.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.core.checkAll();
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.core.check(rowKey);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.core.uncheckAll();
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.core.uncheck(rowKey);
        },
        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            this.core.clear();
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalDta) {
            this.core.removeRow(rowKey, isRemoveOriginalDta);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        enableCheck: function(rowKey) {
            this.core.enableCheck(rowKey);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        disableCheck: function(rowKey) {
            this.core.disableCheck(rowKey);
        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 키값 리스트.
         */
        getCheckedRowKeyList: function(isJsonString) {
            var checkedRowKeyList = this.core.getCheckedRowKeyList();
            return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 데이터값 리스트.
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.core.getCheckedRowList();
            return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}  컬럼모델 리스트
         */
        getColumnModelList: function() {
            return this.core.getColumnModelList();
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         * @param {Object} [options]
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}} 옵션에 따라 반환된 수정된 데이터 목록
         */
        getModifiedRowList: function(options) {
            return this.core.getModifiedRowList(options);
        },
        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        appendRow: function(row) {
            this.core.appendRow(row);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        prependRow: function(row) {
            this.core.prependRow(row);
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}    데이터가 변경되었는지 여부
         */
        isChanged: function() {
            return this.core.isChanged();
        },
        /**
         * AddOn 인스턴스를 반환한다.
         * @param {String} name AddOn의 이름
         * @return {instance} addOn 인스턴스
         */
        getAddOn: function(name) {
            return name ? this.core.addOn[name] : this.core.addOn;
        },

        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            this.core.restore();
        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        select: function(rowKey) {
            this.core.select(rowKey);
        },
        /**
         * 선택되었던 행에 대한 선택을 해제한다.
         */
        unselect: function() {
            this.core.unselect();
        },
        /**
         * 열 고정 위치를 변경한다.
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(index) {
            this.core.setColumnFixIndex(index);
        },
        /**
         * columnModelList 를 재설정한다..
         * @param {Array} columnModelList 컬럼모델 리스트
         */
        setColumnModelList: function(columnModelList) {
            this.core.setColumnModelList(columnModelList);
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {ne.Grid}
         */
        use: function(name, options) {
            this.core.use(name, options);
            return this;
        },
        /**
         * 현재 그리드의 rowList 를 반환한다.
         * @return {Array} 그리드의 데이터 리스트
         */
        getRowList: function() {
            return this.core.getRowList();
        },
        /**
         * 인자로 들어온 columnName 기준으로 정렬 한다.
         * @param {String} columnName 정렬할 컬럼이름
         */
        sort: function(columnName) {
            this.core.sort(columnName);
        },
        /**
         * sort 를 해제한다.
         */
        unSort: function() {
            this.core.sort('rowKey');
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        addCellClassName: function(rowKey, columnName, className) {
            this.core.addCellClassName(rowKey, columnName, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        addRowClassName: function(rowKey, className) {
            this.core.addRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        removeCellClassName: function(rowKey, columnName, className) {
            this.core.removeCellClassName(rowKey, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        removeRowClassName: function(rowKey, className) {
            this.core.removeRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         */
        getRowSpanData: function(rowKey, columnName) {
            this.core.getRowSpanData(rowKey, columnName);
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {
            //@todo:
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @todo 기능 구현
         * @param {String} columnName 컬럼 이름
         * @param {(String|Number)} columnValue 컬럼 이름
         */
        filterData: function(columnName, columnValue) {
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         * @todo 기능 구현
         */
        enable: function() {
        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {
        },
        /**
         * 그리드의 layout 데이터를 갱신한다.
         * 그리드가 숨겨진 상태에서 초기화 되었을 경우 사옹한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        refreshLayout: function() {
        },
        /**
         * 그리드의 크기 정보를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setGridSize: function(size) {
            //var dimensionModel = this.dimensionModel,
            //    width = size && size.width || dimensionModel.get('width'),
            //    bodyHeight = dimensionModel.get('bodyHeight'),
            //    headerHeight = dimensionModel.get('headerHeight'),
            //    toolbarHeight = dimensionModel.get('toolbarHeight');
            //
            //if (size && size.height) {
            //    bodyHeight = height - (headerHeight + toolbarHeight);
            //}
        },
        /**
         * 스크롤 핸들러의 위치를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setScrollHandlerPosition: function() {},

        /**
         * 소멸자.
         */
        destroy: function() {
            this.core.destroy();
            this.core = null;
        }
    });

    ne.Grid.getInstanceById = function(id) {
        return Core.prototype.__instance[id];
    };



})();