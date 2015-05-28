/*!code-snippet v1.0.1 | NHN Entertainment*/
/**********
 * browser.js
 **********/

/**
 * @fileoverview 클라이언트의 브라우저의 종류와 버전 검출을 위한 모듈
 * @author FE개발팀
 */

/** @namespace ne */
/** @namespace ne.util */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    /* istanbul ignore if */
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 다음 브라우저들에 한해 종류와 버전 정보를 제공
     *
     * - ie7 ~ ie11
     * - chrome
     * - firefox
     * - safari
     * @example
     * ne.util.browser.chrome === true;    // chrome
     * ne.util.browser.firefox === true;    // firefox
     * ne.util.browser.safari === true;    // safari
     * ne.util.browser.msie === true;    // IE
     * ne.util.browser.other === true;    // other browser
     * ne.util.browser.version;    // 브라우저 버전 type: Number
     * @memberof ne.util
     */
    var browser = {
        chrome: false,
        firefox: false,
        safari: false,
        msie: false,
        others: false,
        version: 0
    };

    var nav = window.navigator,
        appName = nav.appName.replace(/\s/g, '_'),
        userAgent = nav.userAgent;

    var rIE = /MSIE\s([0-9]+[.0-9]*)/,
        rIE11 = /Trident.*rv:11\./,
        versionRegex = {
            'firefox': /Firefox\/(\d+)\./,
            'chrome': /Chrome\/(\d+)\./,
            'safari': /Version\/([\d\.]+)\sSafari\/(\d+)/
        };

    var key, tmp;

    var detector = {
        'Microsoft_Internet_Explorer': function() {
            // ie8 ~ ie10
            browser.msie = true;
            browser.version = parseFloat(userAgent.match(rIE)[1]);
        },
        'Netscape': function() {
            var detected = false;

            if (rIE11.exec(userAgent)) {
                // ie11
                browser.msie = true;
                browser.version = 11;
            } else {
                // chrome, firefox, safari, others
                for (key in versionRegex) {
                    if (versionRegex.hasOwnProperty(key)) {
                        tmp = userAgent.match(versionRegex[key]);
                        if (tmp && tmp.length > 1) {
                            browser[key] = detected = true;
                            browser.version = parseFloat(tmp[1] || 0);
                            break;
                        }
                    }
                }
            }

            // 브라우저 검출 실패 시 others로 표기
            if (!detected) {
                browser.others = true;
            }
        }
    };

    detector[appName]();

    ne.util.browser = browser;

})(window.ne);

/**********
 * collection.js
 **********/

/**
 * @fileoverview 객체나 배열을 다루기위한 펑션들이 정의 되어있는 모듈
 * @author FE개발팀
 * @dependency type.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * Array 의 prototype 에 indexOf 가 존재하는지 여부를 저장한다.
     * 페이지 로드 시 한번만 확인하면 되므로, 변수에 캐싱한다.
     * @type {boolean}
     */
    var hasIndexOf = !!Array.prototype.indexOf;

    /**
     * 배열이나 유사배열을 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {Array} arr
     * @param {Function} iteratee  값이 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @memberof ne.util
     * @example
     *
     * var sum = 0;
     *
     * forEachArray([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     */
    function forEachArray(arr, iteratee, context) {
        var index = 0,
            len = arr.length;

        context = context || null;

        for (; index < len; index++) {
            if (iteratee.call(context, arr[index], index, arr) === false) {
                break;
            }
        }
    }


    /**
     * obj에 상속된 프로퍼티를 제외한 obj의 고유의 프로퍼티만 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 중료한다.
     * @param {object} obj
     * @param {Function} iteratee  프로퍼티가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @memberof ne.util
     * @example
     * var sum = 0;
     *
     * forEachOwnProperties({a:1,b:2,c:3}, function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     **/
    function forEachOwnProperties(obj, iteratee, context) {
        var key;

        context = context || null;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (iteratee.call(context, obj[key], key, obj) === false) {
                    break;
                }
            }
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 데이터를 콜백함수에 전달한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(ex2 참고)
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @memberof ne.util
     * @example
     *
     * //ex1)
     * var sum = 0;
     *
     * forEach([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     *
     * //ex2) 유사 배열사용
     * function sum(){
     *     var factors = Array.prototype.slice.call(arguments); //arguments를 배열로 변환, arguments와 같은정보를 가진 새 배열 리턴
     *
     *     forEach(factors, function(value){
     *          ......
     *     });
     * }
     *
     **/
    function forEach(obj, iteratee, context) {
        var key,
            len;

        context = context || null;

        if (ne.util.isArray(obj)) {
            for (key = 0, len = obj.length; key < len; key++) {
                iteratee.call(context, obj[key], key, obj);
            }
        } else {
            ne.util.forEachOwnProperties(obj, iteratee, context);
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 배열로 만들어 리턴한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {Array}
     * @memberof ne.util
     * @example
     * map([0,1,2,3], function(value) {
     *     return value + 1;
     * });
     *
     * => [1,2,3,4];
     */
    function map(obj, iteratee, context) {
        var resultArray = [];

        context = context || null;

        ne.util.forEach(obj, function() {
            resultArray.push(iteratee.apply(context, arguments));
        });

        return resultArray;
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 다음 콜백의 첫번째 인자로 넘겨준다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
     * @memberof ne.util
     * @example
     * reduce([0,1,2,3], function(stored, value) {
     *     return stored + value;
     * });
     *
     * => 6;
     */
    function reduce(obj, iteratee, context) {
        var keys,
            index = 0,
            length,
            store;

        context = context || null;

        if (!ne.util.isArray(obj)) {
            keys = ne.util.keys(obj);
        }

        length = keys ? keys.length : obj.length;

        store = obj[keys ? keys[index++] : index++];

        for (; index < length; index++) {
            store = iteratee.call(context, store, obj[keys ? keys[index] : index]);
        }

        return store;
    }
    /**
     * 유사배열을 배열 형태로 변환한다.
     * - IE 8 이하 버전에서 Array.prototype.slice.call 이 오류가 나는 경우가 있어 try-catch 로 예외 처리를 한다.
     * @param {*} arrayLike 유사배열
     * @return {Array}
     * @memberof ne.util
     * @example


     var arrayLike = {
        0: 'one',
        1: 'two',
        2: 'three',
        3: 'four',
        length: 4
    };
     var result = toArray(arrayLike);

     => ['one', 'two', 'three', 'four'];
     */
    function toArray(arrayLike) {
        var arr;
        try {
            arr = Array.prototype.slice.call(arrayLike);
        } catch (e) {
            arr = [];
            forEachArray(arrayLike, function(value) {
                arr.push(value);
            });
        }
        return arr;
    }

    /**
     * 파라메터로 전달된 객체나 어레이를 순회하며 콜백을 실행한 리턴값이 참일 경우의 모음을 만들어서 리턴한다.
     *
     * @param {*} obj 순회할 객체나 배열
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
     * @memberof ne.util
     * @example
     * filter([0,1,2,3], function(value) {
     *     return (value % 2 === 0);
     * });
     *
     * => [0, 2];
     * filter({a : 1, b: 2, c: 3}, function(value) {
     *     return (value % 2 !== 0);
     * });
     *
     * => {a: 1, c: 3};
     */
    var filter = function(obj, iteratee, context) {
        var result,
            add;

        context = context || null;

        if (!ne.util.isObject(obj) || !ne.util.isFunction(iteratee)) {
            throw new Error('wrong parameter');
        }

        if (ne.util.isArray(obj)) {
            result = [];
            add = function(result, args) {
                result.push(args[0]);
            };
        } else {
            result = {};
            add = function(result, args) {
                result[args[1]] = args[0];
            };
        }

        ne.util.forEach(obj, function() {
            if (iteratee.apply(context, arguments)) {
                add(result, arguments);
            }
        }, context);

        return result;
    };

    /**
     * 배열 내의 값을 찾아서 인덱스를 반환한다. 찾고자 하는 값이 없으면 -1 반환.
     * @param {*} value 배열 내에서 찾고자 하는 값
     * @param {array} array 검색 대상 배열
     * @param {number} index 검색이 시작될 배열 인덱스. 지정하지 않으면 기본은 0이고 전체 배열 검색.
     * @memberof ne.util
     * @return {number} targetValue가 발견된 array내에서의 index값
     * @example
     *
     *   var arr = ['one', 'two', 'three', 'four'];
     *   ne.util.inArray('one', arr, 3);
     *      => return -1;
     *
     *   ne.util.inArray('one', arr);
     *      => return 0
     */
    var inArray = function(value, array, index) {
        if (!ne.util.isArray(array)) {
            return -1;
        }

        if (hasIndexOf) {
            return Array.prototype.indexOf.call(array, value, index);
        }

        var i,
            length = array.length;

        //index를 지정하되 array 길이보다 같거나 큰 숫자로 지정하면 오류이므로 -1을 리턴한다.
        if (ne.util.isUndefined(index)) {
            index = 0;
        } else if (index >= length || index < 0) {
            return -1;
        }

        //array에서 value 탐색하여 index반환
        for (i = index; i < length; i++) {
            if (array[i] === value) {
                return i;
            }
        }

        return -1;
    };

    ne.util.forEachOwnProperties = forEachOwnProperties;
    ne.util.forEachArray = forEachArray;
    ne.util.forEach = forEach;
    ne.util.toArray = toArray;
    ne.util.map = map;
    ne.util.reduce = reduce;
    ne.util.filter = filter;
    ne.util.inArray = inArray;

})(window.ne);

/**********
 * customEvent.js
 **********/

/**
 * @fileoverview 옵저버 패턴을 이용하여 객체 간 커스텀 이벤트를 전달할 수 있는 기능을 제공하는 모듈
 * @author FE개발팀
 * @dependency type.js, collection.js object.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    /* istanbul ignore if */
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 이벤트 핸들러 저장 단위
     * @ignore
     * @typedef {{fn: function, ctx: *}} handlerItem
     */

    /**
     * 컨텍스트 별로 저장하기 위한 데이터 구조
     * @ignore
     * @typedef {object.<string, handlerItem>} ctxEvents
     */

    /**
     * @constructor
     * @memberof ne.util
     */
    function CustomEvents() {
        /**
         * 일반 핸들러 캐싱
         * @type {object.<string, handlerItem[]>}
         * @private
         */
        this._events = null;

        /**
         * 컨텍스트 핸들러 캐싱
         * @type {ctxEvents}
         * @private
         */
        this._ctxEvents = null;
    }

    /**********
     * static props
     **********/

    /**
     * 커스텀 이벤트 기능을 믹스인할 때 사용하는 메서드
     * @param {function()} func 생성자 함수
     * @example
     * // 모델 클래스 변경 시 컨트롤러에게 알림을 주고 싶은데
     * // 그 기능을 모델 클래스 자체에게 주고 싶다
     * function Model() {}
     *
     * // 커스텀 이벤트 믹스인
     * ne.util.CustomEvents.mixin(Model);
     *
     * var model = new Model();
     *
     * model.on('changed', function() {}, this);
     */
    CustomEvents.mixin = function(func) {
        ne.util.extend(func.prototype, CustomEvents.prototype);
    };

    /**********
     * private props
     **********/

    /**
     * 배열 반복자를 실행시키되 전체 순회 수를 감소시키는 메서드를 제공한다
     * @param {Array} arr
     * @param {function} iteratee
     */
    CustomEvents.prototype._forEachArraySplice = function(arr, iteratee) {
        var i,
            len,
            item,
            decrease = function() {
                arr.splice(i, 1);
                len -= 1;
                i -= 1;
            };

        if (!ne.util.isExisty(arr) || !ne.util.isArray(arr)) {
            return;
        }

        for (i = 0, len = arr.length; i < len; i++) {
            item = arr[i];

            if (iteratee(item, i, arr, decrease) === false) {
                return;
            }
        }
    };

    /**********
     * context event handler
     **********/

    /**
     * 컨텍스트 핸들러 캐시 데이터 구조를 순회하며 반복자 수행
     * @param {function(ctxEvents, eventKey)} iteratee
     * @private
     */
    CustomEvents.prototype._eachCtxEvents = function(iteratee) {
        var events = this._ctxEvents;
        ne.util.forEachOwnProperties(events, iteratee);
    };

    /**
     * ctxEvents 구조에서 id문자열을 포함하는 핸들러를 순회하며 반복자를 수행
     *
     * 커스텀 이벤트 데이터 내에서 각 핸들러를 순회할 때 사용한다
     * @param {ctxEvents} ctxEvents
     * @param {string} id
     * @param {function(handlerItem, handlerItemId)} iteratee
     * @private
     */
    CustomEvents.prototype._eachCtxHandlerItemByContainId = function(ctxEvents, id, iteratee) {
        ne.util.forEachOwnProperties(ctxEvents, function(handlerItem, handlerItemId) {
            if (handlerItemId.indexOf(id) > -1) {
                iteratee(handlerItem, handlerItemId);
            }
        });
    };

    /**
     * 핸들러를 받아 핸들러가 포함된 컨텍스트 이벤트 핸들러를 순회하며 반복자를 실행함
     * @param {function} handler
     * @param {function(handlerItem, ctxEventId, ctxEvents, eventKey)} iteratee
     * @private
     */
    CustomEvents.prototype._eachCtxEventByHandler = function(handler, iteratee) {
        var handlerId = ne.util.stamp(handler),
            eachById = this._eachCtxHandlerItemByContainId;

        this._eachCtxEvents(function(ctxEvents, eventKey) {
            eachById(ctxEvents, handlerId, function(handlerItem, handlerItemId) {
                iteratee(handlerItem, handlerItemId, ctxEvents, eventKey);
            });
        });
    };

    /**
     * 컨텍스트를 기준으로 할당된 이벤트 핸들러를 순회하며 반복자를 수행
     * @param {*} context
     * @param {function(handlerItem, ctxEventId, ctxEvents, eventKey)} iteratee
     * @private
     */
    CustomEvents.prototype._eachCtxEventByContext = function(context, iteratee) {
        var contextId = ne.util.stamp(context),
            eachById = this._eachCtxHandlerItemByContainId;

        this._eachCtxEvents(function(ctxEvents, eventKey) {
            eachById(ctxEvents, contextId, function(handlerItem, handlerItemId) {
                iteratee(handlerItem, handlerItemId, ctxEvents, eventKey);
            });
        });
    };

    /**
     * 이벤트 이름 기준으로 컨텍스트 이벤트 핸들러를 순회하며 반복자를 실행
     * @param {string} name
     * @param {function(handlerItem, handlerItemId, ctxEvents, eventKey)} iteratee
     * @private
     */
    CustomEvents.prototype._eachCtxEventByEventName = function(name, iteratee) {
        if (!this._ctxEvents) {
            return;
        }

        var key = this._getCtxKey(name),
            ctxEvents = this._ctxEvents[key],
            args;

        ne.util.forEachOwnProperties(ctxEvents, function() {
            args = Array.prototype.slice.call(arguments);
            args.push(key);
            iteratee.apply(null, args);
        });
    };

    /**********
     * normal event handler
     **********/

    /**
     * 핸들러를 받아 핸들러가 포함된 일반 이벤트 핸들러를 순회하며 반복자를 수행
     * @param {function} handler
     * @param {function(handlerItem, index, eventList[], eventKey, decrease)} iteratee
     * @private
     */
    CustomEvents.prototype._eachEventByHandler = function(handler, iteratee) {
        var events = this._events,
            forEachArrayDecrease = this._forEachArraySplice,
            idx = 0;

        ne.util.forEachOwnProperties(events, function(eventList, eventKey) {
            forEachArrayDecrease(eventList, function(handlerItem, index, eventList, decrease) {
                if (handlerItem.fn === handler) {
                    iteratee(handlerItem, idx++, eventList, eventKey, decrease);
                }
            });
        });
    };

    /**
     * 이벤트명 기준으로 일반 이벤트를 순회하며 반복자를 수행
     * @param {string} name
     * @param {function(handlerItem, index, itemList[], decrease)} iteratee
     * @private
     */
    CustomEvents.prototype._eachEventByEventName = function(name, iteratee) {
        if (!this._events) {
            return;
        }

        var events = this._events[name];

        if (!ne.util.isExisty(events)) {
            return;
        }

        this._forEachArraySplice(events, iteratee);
    };

    /**
     * 컨텍스트 핸들러 저장용 키를 만든다
     * @param {string} name 이벤트명
     * @returns {string}
     * @private
     */
    CustomEvents.prototype._getCtxKey = function(name) {
        return name + '_idx';
    };

    /**
     * 컨텍스트 핸들러 등록 개수 저장용 키를 만든다
     * @param {string} name 이벤트명
     * @returns {string}
     * @private
     */
    CustomEvents.prototype._getCtxLenKey = function(name) {
        return name + '_len';
    };

    /**
     * 핸들러 저장용 키를 만든다
     * @param {function} func 이벤트 핸들러
     * @param {*} ctx 핸들러 실행 컨텍스트
     * @returns {string}
     * @private
     */
    CustomEvents.prototype._getHandlerKey = function(func, ctx) {
        return ne.util.stamp(func) + '_' + ne.util.stamp(ctx);
    };


    /**
     * 컨텍스트 이벤트 핸들러의 갯수를 카운팅
     * @param {string} lenKey 컨텍스트 이벤트 갯수를 저장하기 위한 프로퍼티 명 (getCtxLenKey메서드로 계산가능)
     * @param {number} change 증감 값
     * @private
     */
    CustomEvents.prototype._setCtxLen = function(lenKey, change) {
        var events = this._ctxEvents;

        if (!ne.util.isExisty(events[lenKey])) {
            events[lenKey] = 0;
        }

        events[lenKey] += change;
    };


    /**
     * 컨텍스트용 이벤트 캐시 구조로 저장한다
     * @param {string} name 이벤트명
     * @param {*} context 핸들러에 바인딩할 컨텍스트
     * @param {function} handler 핸들러 함수
     * @private
     */
    CustomEvents.prototype._addCtxEvent = function(name, context, handler) {
        var events = this._ctxEvents,
            key = this._getCtxKey(name),
            event;

        // 핸들러 등록
        if (!ne.util.isExisty(events)) {
            events = this._ctxEvents = {};
        }

        event = events[key];
        if (!ne.util.isExisty(event)) {
            event = events[key] = {};
        }

        var lenKey = this._getCtxLenKey(name),
            handlerItemId = this._getHandlerKey(handler, context);

        event[handlerItemId] = {
            fn: handler,
            ctx: context
        };

        // 핸들러 갯수 설정
        this._setCtxLen(lenKey, +1);
    };

    /**
     * 일반 이벤트 등록
     * @param {string} name 이벤트명
     * @param {function} handler 이벤트 핸들러
     * @private
     */
    CustomEvents.prototype._addNormalEvent = function(name, handler) {
        var events = this._events,
            event;

        if (!ne.util.isExisty(events)) {
            events = this._events = {};
        }

        event = events[name];
        if (!ne.util.isExisty(event)) {
            event = events[name] = [];
        }

        event.push({ fn: handler });
    };


    /**
     * 핸들러 함수로 이벤트 해제
     * @param {function} handler 이벤트 핸들러 함수
     * @private
     */
    CustomEvents.prototype._offByHandler = function(handler) {
        var ctxEvents = this._ctxEvents,
            lenKey;

        this._eachCtxEventByHandler(handler, function(handlerItem, hanId, ctxItems, eventKey) {
            lenKey = eventKey.replace('_idx', '_len');
            delete ctxItems[hanId];
            ctxEvents[lenKey] -= 1;
        });

        this._eachEventByHandler(handler, function(handlerItem, index, items, eventKey, decrease) {
            items.splice(index, 1);
            decrease();
        });
    };

    /**
     * 컨텍스트로 이벤트 해제
     * @param {*} context
     * @param {(string|function)} [eventName]
     * @private
     */
    CustomEvents.prototype._offByContext = function(context, eventName) {
        var ctxEvents = this._ctxEvents,
            hasArgs = ne.util.isExisty(eventName),
            matchEventName,
            matchHandler,
            lenKey;

        this._eachCtxEventByContext(context, function(handlerItem, hanId, ctxItems, eventKey) {
            lenKey = eventKey.replace('_idx', '_len');

            matchEventName = hasArgs && ne.util.isString(eventName) && eventKey.indexOf(eventName) > -1;
            matchHandler = hasArgs && ne.util.isFunction(eventName) && handlerItem.fn === eventName;

            if (!hasArgs || (matchEventName || matchHandler)) {
                delete ctxItems[hanId];
                ctxEvents[lenKey] -= 1;
            }
        });
    };

    /**
     * 이벤트명으로 이벤트 해제
     * @param {string} eventName 이벤트명
     * @param {function} [handler] 이벤트 핸들러
     * @private
     */
    CustomEvents.prototype._offByEventName = function(eventName, handler) {
        var ctxEvents = this._ctxEvents,
            hasHandler = ne.util.isExisty(handler),
            lenKey;

        this._eachCtxEventByEventName(eventName, function(handlerItem, hanId, ctxItems, eventKey) {
            lenKey = eventKey.replace('_idx', '_len');
            if (!hasHandler || (hasHandler && handlerItem.fn === handler)) {
                delete ctxItems[hanId];
                ctxEvents[lenKey] -= 1;
            }
        });

        this._eachEventByEventName(eventName, function(handlerItem, index, items, decrease) {
            if (!hasHandler || (hasHandler && handlerItem.fn === handler)) {
                items.splice(index, 1);
                decrease();
            }
        });

    };

    /**********
     * public props
     **********/

    /**
     * 이벤트를 등록한다
     * @param {(string|{name:string, handler:function})} name 등록할 이벤트명 또는 {이벤트명: 핸들러} 객체
     * @param {(function|*)} [handler] 핸들러 함수 또는 context
     * @param {*} [context] 핸들러 함수의 context 지정 가능
     * @example
     * // 1. 기본적인 등록
     * customEvent.on('onload', handler);
     *
     * // 2. 컨텍스트 전달
     * customEvent.on('onload', handler, myObj);
     *
     * // 3. 이벤트명: 핸들러 객체로 등록
     * customEvent.on({
     *   'play': handler,
     *   'pause': handler2
     * });
     *
     * // 4. 이벤트명: 핸들러 + 컨텍스트
     * customEvent.on({
     *   'play': handler
     * }, myObj);
     */
    CustomEvents.prototype.on = function(name, handler, context) {
        var names;

        if (ne.util.isObject(name)) {
            // 이벤트명: 핸들러 전달
            context = handler;
            ne.util.forEachOwnProperties(name, function(handler, name) {
                 this.on(name, handler, context);
            }, this);
            return;
        } else if (ne.util.isString(name) && name.indexOf(' ') > -1) {
            // 공백으로 여러 이벤트 처리
            names = name.split(' ');
            ne.util.forEachArray(names, function(name) {
                this.on(name, handler, context);
            }, this);
            return;
        }

        var ctxId;

        if (ne.util.isExisty(context)) {
            ctxId = ne.util.stamp(context);
        }

        if (ne.util.isExisty(ctxId)) {
            // 컨텍스트 전달
            this._addCtxEvent(name, context, handler);
        } else {
            // 일반 이벤트 등록
            this._addNormalEvent(name, handler);
        }
    };

    /**
     * 등록된 이벤트를 해제한다
     * @param {(string|function|{name:string, handler:function})} name 이벤트명 또는 핸들러 또는 {이벤트명: 핸들러} 객체
     * @param {function} [handler] 핸들러 함수
     * @example
     * // 1. 컨텍스트 전달
     * customEvent.off(myObj);
     *
     * // 2. 이벤트명 전달
     * customEvent.off('onload');
     *
     * // 3. 핸들러 전달
     * customEvent.off(handler);
     *
     * // 4. 이벤트명, 핸들러 전달
     * customEvent.off('play', handler);
     *
     * // 5. 컨텍스트, 핸들러 전달
     * customEvent.off(myObj, handler);
     *
     * // 6. 컨텍스트, 이벤트명 전달
     * customEvent.off(myObj, 'onload');
     *
     * // 7. 이벤트명: 핸들러 전달 (특정 핸들러만 해제 원할때)
     * customEvent.off({
     *   'play': handler,
     *   'pause': handler2
     * });
     *
     * // 8. 모든 등록 핸들러 제거
     * customEvent.off();
     */
    CustomEvents.prototype.off = function(name, handler) {
        if (!arguments.length) {
            // 8. 모든 핸들러 제거
            this._events = null;
            this._ctxEvents = null;
            return;
        }

        if (ne.util.isFunction(name)) {
            // 3. 핸들러 기준
            this._offByHandler(name);

        } else if (ne.util.isObject(name)) {
            if (ne.util.hasStamp(name)) {
                // 1, 5, 6 컨텍스트 기준
                this._offByContext(name, handler);
            } else {
                // 4. 이벤트명: 핸들러 전달
                ne.util.forEachOwnProperties(name, function(handler, name) {
                    this.off(name, handler);
                }, this);
            }

        } else {
            // 2, 4 이벤트명 기준
            this._offByEventName(name, handler);

        }
    };

    /**
     * 이벤트 등록 수 반환
     * @param {string} eventName
     * @returns {*}
     */
    CustomEvents.prototype.getListenerLength = function(eventName) {
        var ctxEvents = this._ctxEvents,
            events = this._events,
            existy = ne.util.isExisty,
            lenKey = this._getCtxLenKey(eventName);

        var normal = (existy(events) && ne.util.isArray(events[eventName])) ? events[eventName].length : 0,
            ctx = (existy(ctxEvents) && existy(ctxEvents[lenKey])) ? ctxEvents[lenKey] : 0;

        return normal + ctx;
    };

    /**
     * 이벤트 등록 여부 반환
     * @param {string} eventName 이벤트명
     * @returns {boolean}
     */
    CustomEvents.prototype.hasListener = function(eventName) {
        return this.getListenerLength(eventName) > 0;
    };



    /**
     * 이벤트를 발생시키는 메서드
     *
     * 등록한 리스너들의 실행 결과를 boolean AND 연산하여
     *
     * 반환한다는 점에서 {@link CustomEvents#fire} 와 차이가 있다
     *
     * 보통 컴포넌트 레벨에서 before 이벤트로 사용자에게
     *
     * 이벤트를 취소할 수 있게 해 주는 기능에서 사용한다.
     * @param {string} eventName
     * @param {...*} data
     * @returns {*}
     * @example
     * // 확대 기능을 지원하는 컴포넌트 내부 코드라 가정
     * if (this.invoke('beforeZoom')) {    // 사용자가 등록한 리스너 결과 체크
     *     // 리스너의 실행결과가 true 일 경우
     *     // doSomething
     * }
     *
     * //
     * // 아래는 사용자의 서비스 코드
     * map.on({
     *     'beforeZoom': function() {
     *         if (that.disabled && this.getState()) {    //서비스 페이지에서 어떤 조건에 의해 이벤트를 취소해야한다
     *             return false;
     *         }
     *         return true;
     *     }
     * });
     */
    CustomEvents.prototype.invoke = function(eventName, data) {
        if (!this.hasListener(eventName)) {
            return true;
        }

        var args = Array.prototype.slice.call(arguments, 1),
            self = this,
            result = true,
            existy = ne.util.isExisty;

        this._eachEventByEventName(eventName, function(item) {
            if (existy(item) && item.fn.apply(self, args) === false) {
                result = false;
            }
        });

        this._eachCtxEventByEventName(eventName, function(item) {
            if (existy(item) && item.fn.apply(item.ctx, args) === false) {
                result = false;
            }
        });

        return result;
    };

    /**
     * 이벤트를 발생시키는 메서드
     * @param {string} eventName 이벤트 이름
     * @param {...*} data 발생과 함께 전달할 이벤트 데이터 (래핑하지 않고 인자로 전달한다)
     * @return {*}
     * @example
     * instance.fire('move', 'left');
     *
     * // 이벤트 핸들러 처리
     * instance.on('move', function(direction) {
     *     var direction = direction;
     * });
     */
    CustomEvents.prototype.fire = function(eventName, data) {
        this.invoke.apply(this, arguments);
        return this;
    };

    /**
     * 단발성 커스텀 이벤트 핸들러 등록 시 사용
     * @param {(object|string)} eventName 이벤트명:핸들러 객체 또는 이벤트명
     * @param {function()=} fn 핸들러 함수
     * @param {*=} context
     */
    CustomEvents.prototype.once = function(eventName, fn, context) {
        var that = this;

        if (ne.util.isObject(eventName)) {
            ne.util.forEachOwnProperties(eventName, function(handler, eventName) {
                this.once(eventName, handler, fn);
            }, this);

            return;
        }

        function onceHandler() {
            fn.apply(context, arguments);
            that.off(eventName, onceHandler, context);
        }

        this.on(eventName, onceHandler, context);
    };

    ne.util.CustomEvents = CustomEvents;

})(window.ne);

/**********
 * defineClass.js
 **********/

/**
 * @fileoverview 클래스와 비슷한방식으로 생성자를 만들고 상속을 구현할 수 있는 메소드를 제공하는 모듈
 * @author FE개발팀
 * @dependency inheritance.js, object.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    /* istanbul ignore if */
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 객체의 생성및 상속을 편하게 도와주는 메소드
     * @param {*} [parent] 상속받을 생성자.
     * @param {Object} props 생성할 생성자의프로토타입에 들어갈 멤버들
     * @param {Function} props.init 인스턴스가 생성될때 실행됨
     * @param {Object} props.static 생성자의 클래스 맴버형태로 들어갈 멤버들
     * @returns {*}
     * @example
     *
     * var Parent = defineClasss({
     *     init: function() {
     *         this.name = 'made by def';
     *     },
     *     method: function() {
     *         //..can do something with this
     *     },
     *     static: {
     *         staticMethod: function() {
     *              //..do something
     *         }
     *     }
     * });
     *
     * var Child = defineClass(Parent, {
     *     method2: function() {}
     * });
     *
     *
     * Parent.staticMethod();
     *
     * var parentInstance = new Parent();
     * console.log(parentInstance.name); //made by def
     * parentInstance.staticMethod(); // Error
     *
     *
     * var childInstance = new Child();
     * childInstance.method();
     * childInstance.method2();
     * @memberof ne.util
     *
     */
    var defineClass = function(parent, props) {
        var obj;

        if (!props) {
            props = parent;
            parent = null;
        }

        obj = props.init || function(){};

        if(parent) {
            ne.util.inherit(obj, parent);
        }

        if (props.hasOwnProperty('static')) {
            ne.util.extend(obj, props.static);
            delete props.static;
        }

        ne.util.extend(obj.prototype, props);

        return obj;
    };

    ne.util.defineClass = defineClass;

})(window.ne);

/**********
 * enum.js
 **********/

/**
 * @fileoverview Enum을 구현한 모듈이 정의 되어있다.
 * @author 김성호 sungho-kim@nhnent.com
 * @dependency type, collection.js
 */

(function(ne) {

'use strict';

/* istanbul ignore if */
if (!ne) {
    ne = window.ne = {};
}
if (!ne.util) {
    ne.util = window.ne.util = {};
}

/**
 * definedProperty지원 여부 체크
 * @returns {boolean}
 */
var isSupportDefinedProperty = (function () {
    try {
        Object.defineProperty({}, 'x', {});
        return true;
    } catch (e) {
        return false;
    }
}());

/**
 * 상수에 들어갈 임의의 값
 * @type {number}
 */
var enumValue = 0;

/**
 * Enum
 * 임의의 값이지만 중복되지 않는 값을 갖는 상수의 목록을 만든다
 * IE8이하를 제외한 모던브라우저에서는
 * 한번 결정된값은 추후 변경될수 없다(바꾸려고 시도해도 원래 값을 유지한다)
 *
 * @param {...string | string[]} itemList 상수목록, 스트링 배열 가능
 * @exports Enum
 * @constructor
 * @class
 * @memberof ne.util
 * @examples
 *
 * //생성
 * var MYENUM = new Enum('TYPE1', 'TYPE2');
 * var MYENUM2 = new Enum(['TYPE1', 'TYPE2']);
 *
 * //사용
 * if (value === MYENUM.TYPE1) {
 *      ....
 * }
 *
 * //추가하기(이미 정해진 상수명을 입력하는경우 무시된다)
 * MYENUM.set('TYPE3', 'TYPE4');
 *
 * //값을 이용해 상수명을 얻어오는 방법
 * MYENUM.getName(MYENUM.TYPE1); // 'TYPE1'이 리턴된다.
 *
 * //IE9이상의 브라우저와 기타 모던브라우저에서는 값이 변경되지 않는다.
 * var originalValue = MYENUM.TYPE1;
 * MYENUM.TYPE1 = 1234; // maybe TypeError
 * MYENUM.TYPE1 === originalValue; // true
 *
 **/
function Enum(itemList) {
    if (itemList) {
        this.set.apply(this, arguments);
    }
}

/**
 * set
 * 상수를 정의한다.
 * @param {...string| string[]} itemList 상수목록, 스트링 배열도
 */
Enum.prototype.set = function(itemList) {
    var self = this;

    if (!ne.util.isArray(itemList)) {
        itemList = ne.util.toArray(arguments);
    }

    ne.util.forEach(itemList, function itemListIteratee(item) {
        self._addItem(item);
    });
};

/**
 * getName
 * 값을 넘기면 해당하는 상수의 키값을 리턴해준다.
 * @param {number} value 비교할 값
 * @returns {string} 상수의 키값
 */
Enum.prototype.getName = function(value) {
    var foundedKey,
        self = this;

    ne.util.forEach(this, function(itemValue, key) {
        if (self._isEnumItem(key) && value === itemValue) {
            foundedKey = key;
            return false;
        }
    });

    return foundedKey;
};

/**
 * _addItem
 * 상수를 생성한다
 * @private
 * @param {string} name 상수명
 */
Enum.prototype._addItem = function(name) {
    var value;

    if (!this.hasOwnProperty(name)) {
        value = this._makeEnumValue();

        if (isSupportDefinedProperty) {
            Object.defineProperty(this, name, {
                enumerable: true,
                configurable: false,
                writable: false,
                value: value
            });
        } else {
            this[name] = value;
        }
    }
};

/**
 * _makeEnumValue
 * 상수에 대입할 임의의 중복되지 않는 값을 구한다.
 * @private
 * @returns {number} 상수에 대입될 값
 */
Enum.prototype._makeEnumValue = function() {
    var value;

    value = enumValue;
    enumValue += 1;

    return value;
};

/**
 * _isEnumItem
 * 키의 이름을 입력받아 이 키에 해당하는 내용이 상수인지 아닌지를 판별한다
 * @param {string} key 프로퍼티 키값
 * @returns {boolean} 결과
 * @private
 */
Enum.prototype._isEnumItem = function(key) {
    return ne.util.isNumber(this[key]);
};

ne.util.Enum = Enum;

})(window.ne);

/**********
 * func.js
 **********/

/**
 * @fileoverview 함수관련 메서드 모음
 * @author FE개발팀
 */

(function(ne) {
    'use strict';

    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 커링 메서드
     * @param {function()} fn
     * @param {*} obj - this로 사용될 객체
     * @return {function()}
     * @memberof ne.util
     */
    function bind(fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        /* istanbul ignore next */
        var args = slice.call(arguments, 2);

        /* istanbul ignore next */
        return function() {
            /* istanbul ignore next */
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    }

    ne.util.bind = bind;

})(window.ne);

/**********
 * hashMap.js
 **********/

/**
 * @fileoverview Hash Map을 구현한 모듈이 정의 되어있다.
 * @author FE개발팀
 * @dependency type, collection.js
 */

(function(ne) {
    'use strict';

    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 해쉬맵에서 사용하는 데이터는 _MAPDATAPREFIX로 시작한다.
     * @type {string}
     * @private
     */
    var _MAPDATAPREFIX = 'å';

    /**
     * HashMap
     * 키/밸류로 데이터를 관리할수있다(자바의 hashMap과 유사)
     * 주의) length프로퍼티를 가지고있어 유사 배열을 length의 유무로 체크하는 로직에서 의도되지 않은 동작을 할수있다.
     * @param {Object} [obj] 인스턴스가 만들어질때 셋팅할 초기 데이터
     * @constructor
     * @memberof ne.util
     * @example
     * var hm = new HashMap({
     *     'mydata': {
     *          'hello': 'imfine'
     *      },ne.util.HashMap
     *     'what': 'time'
     * });
     */
    function HashMap(obj) {
        /**
         * 사이즈
         * @type {number}
         */
        this.length = 0;

        if (obj) {
            this.setObject(obj);
        }
    }

    /**
     * 키/밸류 혹은 Object를 전달하여 데이터를 셋팅한다.
     * @param {String|Object} key 키에 해당하는 스트링이나 객체
     * @param {*} [value] 데이터
     * @example
     * var hm = new HashMap();
     *
     * hm.set('key', 'value');
     * hm.set({
     *     'key1': 'data1',
     *     'key2': 'data2'
     * });
     */
    HashMap.prototype.set = function(key, value) {
        if(arguments.length === 2) {
            this.setKeyValue(key, value);
        } else {
            this.setObject(key);
        }
    };

    /**
     * 키/밸류로 데이터를 셋팅한다.
     * @param {String} key 키스트링
     * @param {*} value 데이터
     * @example
     * var hm = new HashMap();
     * hm.setKeyValue('key', 'value');
     */
    HashMap.prototype.setKeyValue = function(key, value) {
        if (!this.has(key)) {
            this.length += 1;
        }
        this[this.encodeKey(key)] = value;
    };

    /**
     * 객체로 데이터를 셋팅한다.
     * @param {Object} obj
     * @example
     * var hm = new HashMap();
     *
     * hm.setObject({
     *     'key1': 'data1',
     *     'key2': 'data2'
     * });
     */
    HashMap.prototype.setObject = function(obj) {
        var self = this;

        ne.util.forEachOwnProperties(obj, function(value, key) {
            self.setKeyValue(key, value);
        });
    };

    /**
     * 해쉬맵을 인자로 받아 병합한다.
     * @param {HashMap} hashMap
     */
    HashMap.prototype.merge = function(hashMap) {
        var self = this;

        hashMap.each(function(value, key) {
            self.setKeyValue(key, value);
        });
    };

    /**
     * 해쉬맵에서 사용할 키를 생성한다.
     * @param {String} key
     * @returns {string}
     * @private
     */
    HashMap.prototype.encodeKey = function(key) {
        return _MAPDATAPREFIX + key;
    };

    /**
     * 해쉬맵키에서 실제 키를 가져온다.
     * @param {String} key
     * @returns {String}
     * @private
     */
    HashMap.prototype.decodeKey = function(key) {
        var decodedKey = key.split(_MAPDATAPREFIX);
        return decodedKey[decodedKey.length-1];
    };

    /**
     * 키값을 전달하여 데이터를 반환한다.
     * @param {String} key
     * @returns {*}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.get('key') // value
     */
    HashMap.prototype.get = function(key) {
        return this[this.encodeKey(key)];
    };

    /**
     * 키를 전달하여 데이터가 존재하는지 체크한다.
     * @param {String} key
     * @returns {boolean}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.has('key') // true
     */
    HashMap.prototype.has = function(key) {
        return this.hasOwnProperty(this.encodeKey(key));
    };

    /**
     * 키나 키의 목록을 전달하여 데이터를 삭제한다.
     * @param {...String|String[]} key
     * @returns {String|String[]}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * //ex1
     * hm.remove('key');
     *
     * //ex2
     * hm.remove('key', 'key2');
     *
     * //ex3
     * hm.remove(['key', 'key2']);
     */
    HashMap.prototype.remove = function(key) {
        if (arguments.length > 1) {
            key = ne.util.toArray(arguments);
        }

        return ne.util.isArray(key) ? this.removeByKeyArray(key) : this.removeByKey(key);
    };

    /**
     * 키를 전달하여 데이터를 삭제한다.
     * @param {String} key
     * @returns {*|null} 삭제된 데이터
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     *
     * hm.removeByKey('key')
     */
    HashMap.prototype.removeByKey = function(key) {
        var data = this.has(key) ? this.get(key) : null;

        if (data !== null) {
            delete this[this.encodeKey(key)];
            this.length -= 1;
        }

        return data;
    };

    /**
     * 키의 목록을 전달하여 데이터를 삭제한다.
     * @param {String[]} keyArray
     * @returns {String[]} 삭제된 데이터
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.removeByKeyArray(['key', 'key2']);
     */
    HashMap.prototype.removeByKeyArray = function(keyArray) {
        var data = [],
            self = this;

        ne.util.forEach(keyArray, function(key) {
            data.push(self.removeByKey(key));
        });

        return data;
    };

    /**
     * 모든데이터를 지운다.
     */
    HashMap.prototype.removeAll = function() {
        var self = this;

        this.each(function(value, key) {
            self.remove(key);
        });
    };

    /**
     * 데이터를 순회하며 콜백에 전달해준다.
     * @param {Function} iteratee
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.each(function(value, key) {
     *     //do something...
     * });
     */
    HashMap.prototype.each = function(iteratee) {
        var self = this,
            flag;

        ne.util.forEachOwnProperties(this, function(value, key) {
            if (key.charAt(0) === _MAPDATAPREFIX) {
                flag = iteratee(value, self.decodeKey(key));
            }

            if (flag === false) {
                return flag;
            }
        });
    };

    /**
     * 저장된 키의 목록을 배열로 리턴해준다.
     * @returns {Array}
     * @example
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.keys();  //['key', 'key2');
     */
    HashMap.prototype.keys = function() {
        var keys = [],
            self = this;

        this.each(function(value, key) {
            keys.push(self.decodeKey(key));
        });

        return keys;
    };

    /**
     * 조건을 체크하는 콜백을 전달받아 데이터를 전달해주고 콜백의 결과가 true인경우의 데이터를 모와 배열로 만들어 리턴해준다.
     * @param {Function} condition
     * @returns {Array}
     * @example
     *
     * //ex1
     * var hm = new HashMap();
     * hm.set('key', 'value');
     * hm.set('key2', 'value');
     *
     * hm.find(function(value, key) {
     *     return key === 'key2';
     * }); // ['value']
     *
     * //ex2
     * var hm = new HashMap({
     *     'myobj1': {
     *          visible: true
     *      },
     *     'mybobj2': {
     *          visible: false
     *      }
     * });
     *
     * hm.find(function(obj, key) {
     *     return obj.visible === true;
     * }); // [{visible: true}];
     */
    HashMap.prototype.find = function(condition) {
        var founds = [];

        this.each(function(value, key) {
            if (condition(value, key)) {
                founds.push(value);
            }
        });

        return founds;
    };

    /**
     * 내부의 값들을 순서에 상관없이 배열로 반환한다
     * @returns {Array}
     */
    HashMap.prototype.toArray = function() {
        var result = [];

        this.each(function(v) {
            result.push(v);
        });

        return result;
    };

    ne.util.HashMap = HashMap;

})(window.ne);

/**********
 * inheritance.js
 **********/

/**
 * @fileoverview 간단한 상속 시뮬레이션
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    /* istanbul ignore if */
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }



    /**
     * 전달된 객체를 prototype으로 사용하는 객체를 만들어 반환하는 메서드
     * @param {Object} obj
     * @return {Object}
     * @memberof ne.util
     */
    function createObject() {
        function F() {}

        return function(obj) {
            F.prototype = obj;
            return new F();
        };
    }

    /**
     * 단순 prototype 확장을 응용한 상속 메서드
     *
     * **주의점**
     *
     * 단순 프로토타입 확장 기능만 제공하므로 자식 생성자의 prototype을 덮어쓰면 안된다.
     *
     * @example
     * function Animal(leg) {
     *     this.leg = leg;
     * }
     *
     * Animal.prototype.growl = function() {
     *     // ...
     * };
     *
     * function Person(name) {
     *     this.name = name;
     * }
     *
     * // 상속
     * core.inherit(Person, Animal);
     *
     * // 이 이후부터는 프로퍼티 편집만으로 확장해야 한다.
     * Person.prototype.walk = function(direction) {
     *     // ...
     * };
     * @param {function} subType 자식 생성자 함수
     * @param {function} superType 부모 생성자 함수
     * @memberof ne.util
     */
    function inherit(subType, superType) {
        var prototype = ne.util.createObject(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }

    ne.util.createObject = createObject();
    ne.util.inherit = inherit;

})(window.ne);

/**********
 * object.js
 **********/

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 데이터 객체를 확장하는 메서드 (deep copy 는 하지 않는다)
     * @param {object} target - 확장될 객체
     * @param {...object} objects - 프로퍼티를 복사할 객체들
     * @return {object}
     * @memberOf ne.util
     */
    function extend(target, objects) {
        var source,
            prop,
            hasOwnProp = Object.prototype.hasOwnProperty,
            i,
            len;

        for (i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProp.call(source, prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    /**
     * @type {number}
     */
    var lastId = 0;

    /**
     * 객체에 unique한 ID를 프로퍼티로 할당한다.
     * @param {object} obj - ID를 할당할 객체
     * @return {number}
     * @memberOf ne.util
     */
    function stamp(obj) {
        obj.__fe_id = obj.__fe_id || ++lastId;
        return obj.__fe_id;
    }

    /**
     * object#stamp로 UniqueID를 부여했었는지 여부 확인
     * @param {object} obj
     * @returns {boolean}
     * @memberOf ne.util
     */
    function hasStamp(obj) {
        return ne.util.isExisty(ne.util.pick(obj, '__fe_id'));
    }

    function resetLastId() {
        lastId = 0;
    }

    /**
     * 객체를 전달받아 객체의 키목록을 배열로만들어 리턴해준다.
     * @param obj
     * @returns {Array}
     * @memberOf ne.util
     */
    function keys(obj) {
        var keys = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    }


    /**
     *
     * 여러개의 json객체들을 대상으로 그것들이 동일한지 비교하여 리턴한다.
     * (출처) http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * @param {...object} object 비교할 객체 목록
     * @return {boolean} 파라미터로 전달받은 json객체들의 동일 여부
     * @example
     *
       var jsonObj1 = {name:'milk', price: 1000},
           jsonObj2 = {name:'milk', price: 1000},
           jsonObj3 = {name:'milk', price: 1000}

       ne.util.compareJSON(jsonObj1, jsonObj2, jsonObj3);
           => return true

       var jsonObj4 = {name:'milk', price: 1000},
           jsonObj5 = {name:'beer', price: 3000}

       ne.util.compareJSON(jsonObj4, jsonObj5);
          => return false

     * @memberOf ne.util
     */
    function compareJSON(object) {
        var leftChain,
            rightChain,
            argsLen = arguments.length,
            i;

        function isSameObject(x, y) {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) &&
                isNaN(y) &&
                ne.util.isNumber(x) &&
                ne.util.isNumber(y)) {
                return true;
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on step when comparing prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((ne.util.isFunction(x) && ne.util.isFunction(y)) ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good a we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) ||
                y.isPrototypeOf(x) ||
                x.constructor !== y.constructor ||
                x.prototype !== y.prototype) {
                return false;
            }

            // check for infinitive linking loops
            if (ne.util.inArray(x, leftChain) > -1 ||
                ne.util.inArray(y, rightChain) > -1) {
                return false;
            }

            // Quick checking of one object beeing a subset of another.
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            //인풋 데이터 x의 오브젝트 키값으로 값을 순회하면서
            //hasOwnProperty, typeof 체크를 해서 비교하고 x[prop]값과 y[prop] 가 같은 객체인지 판별한다.
            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                if (typeof(x[p]) === 'object' || typeof(x[p]) === 'function') {
                    leftChain.push(x);
                    rightChain.push(y);

                    if (!isSameObject(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                } else if (x[p] !== y[p]) {
                    return false;
                }
            }

            return true;
        }

        if (argsLen < 1) {
            return true;
        }

        for (i = 1; i < argsLen; i++) {
            leftChain = [];
            rightChain = [];

            if (!isSameObject(arguments[0], arguments[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * 인자로 받은 object 와 하위 프로퍼티 문자열로 해당 위치의 값을 반환한다.
     * @param {object} 대상 객체
     * @param {...string}   하위 프로퍼티 문자열
     * @returns {*} 반환된 값
     * @example
     *
        var obj = {
            'key1': 1,
            'nested' : {
                'key1': 11,
                'nested': {
                    'key1': 21
                }
            }
        };


         ne.util.pick(obj, 'nested', 'nested', 'key1');
         => 21

        ne.util.pick(obj, 'nested', 'nested', 'key2');
        => undefined

        var arr = ['a', 'b', 'c'];

        ne.util.pick(arr, 1);
         => 'b'
     */
    function pick() {
        var args = arguments,
            target = args[0],
            length = args.length,
            i;
        try {
            for (i = 1; i < length; i++) {
                target = target[args[i]];
            }
            return target;
        } catch(e) {
            return;
        }
    }

    ne.util.extend = extend;
    ne.util.stamp = stamp;
    ne.util.hasStamp = hasStamp;
    ne.util._resetLastId = resetLastId;
    ne.util.keys = Object.keys || keys;
    ne.util.compareJSON = compareJSON;
    ne.util.pick = pick;
})(window.ne);

/**********
 * string.js
 **********/

/**
 * @fileoverview 문자열 조작 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';

    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
     * @param {String} htmlEntity HTML Entity 타입의 문자열
     * @return {String} 원래 문자로 변환된 문자열
     * @memberof ne.util
     * @example
     var htmlEntityString = "A &#39;quote&#39; is &lt;b&gt;bold&lt;/b&gt;"
     var result = decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
     */
    function decodeHTMLEntity(htmlEntity) {
        var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
        return htmlEntity.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
            return entities[m0] ? entities[m0] : m0;
        });
    }

    /**
     * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
     * @param {String} html HTML 문자열
     * @return {String} HTML Entity 타입의 문자열로 변환된 문자열
     * @memberof ne.util
     * @example
     var htmlEntityString = "<script> alert('test');</script><a href='test'>";
     var result = encodeHTMLEntity(htmlEntityString);
     //결과값 : "&lt;script&gt; alert(&#39;test&#39;);&lt;/script&gt;&lt;a href=&#39;test&#39;&gt;"
     */
    function encodeHTMLEntity(html) {
        var entities = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt', '\'': '#39'};
        return html.replace(/[<>&"']/g, function(m0) {
            return entities[m0] ? '&' + entities[m0] + ';' : m0;
        });
    }

    /**
     * html Entity 로 변환할 수 있는 문자가 포함되었는지 확인
     * @param {String} string
     * @memberof ne.util
     * @return {boolean}
     */
    function hasEncodableString(string) {
        return /[<>&"']/.test(string);
    }

    ne.util.decodeHTMLEntity = decodeHTMLEntity;
    ne.util.encodeHTMLEntity = encodeHTMLEntity;
    ne.util.hasEncodableString = hasEncodableString;
})(window.ne);

/**********
 * type.js
 **********/

/**
 * @fileoverview 타입체크 모듈
 * @author FE개발팀
 * @dependency collection.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 값이 정의되어 있는지 확인(null과 undefined가 아니면 true를 반환한다)
     * @param {*} param
     * @returns {boolean}
     * @example
     *
     *
     * ne.util.isExisty(''); //true
     * ne.util.isExisty(0); //true
     * ne.util.isExisty([]); //true
     * ne.util.isExisty({}); //true
     * ne.util.isExisty(null); //false
     * ne.util.isExisty(undefined); //false
     * @memberOf ne.util
    */
    function isExisty(param) {
        return param != null;
    }

    /**
     * 인자가 undefiend 인지 체크하는 메서드
     * @param {*} obj 평가할 대상
     * @returns {boolean}
     * @memberOf ne.util
     */
    function isUndefined(obj) {
        return obj === undefined;
    }

    /**
     * 인자가 null 인지 체크하는 메서드
     * @param {*} obj 평가할 대상
     * @returns {boolean}
     * @memberOf ne.util
     */
    function isNull(obj) {
        return obj === null;
    }

    /**
     * 인자가 null, undefined, false가 아닌지 확인하는 메서드
     * (0도 true로 간주한다)
     *
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isTruthy(obj) {
        return isExisty(obj) && obj !== false;
    }

    /**
     * 인자가 null, undefined, false인지 확인하는 메서드
     * (truthy의 반대값)
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isFalsy(obj) {
        return !isTruthy(obj);
    }


    var toString = Object.prototype.toString;

    /**
     * 인자가 arguments 객체인지 확인
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isArguments(obj) {
        var result = isExisty(obj) &&
            ((toString.call(obj) === '[object Arguments]') || !!obj.callee);

        return result;
    }

    /**
     * 인자가 배열인지 확인
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isArray(obj) {
        return obj instanceof Array;
    }

    /**
     * 인자가 객체인지 확인하는 메서드
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isObject(obj) {
        return obj === Object(obj);
    }

    /**
     * 인자가 함수인지 확인하는 메서드
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isFunction(obj) {
        return obj instanceof Function;
    }

    /**
     * 인자가 숫자인지 확인하는 메서드
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isNumber(obj) {
        return typeof obj === 'number' || obj instanceof Number;
    }

    /**
     * 인자가 문자열인지 확인하는 메서드
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isString(obj) {
        return typeof obj === 'string' || obj instanceof String;
    }

    /**
     * 인자가 불리언 타입인지 확인하는 메서드
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isBoolean(obj) {
        return typeof obj === 'boolean' || obj instanceof Boolean;
    }


    /**
     * 인자가 배열인지 확인.
     * <br>iframe 사용할 경우 부모 자식 window 간 타입 체크를 위해 사용한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isArraySafe(obj) {
        return toString.call(obj) === '[object Array]';
    }

    /**
     * 인자가 함수인지 확인하는 메서드
     * <br>iframe 사용할 경우 부모 자식 window 간 타입 체크를 위해 사용한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isFunctionSafe(obj) {
        return toString.call(obj) === '[object Function]';
    }

    /**
     * 인자가 숫자인지 확인하는 메서드
     * <br>iframe 사용할 경우 부모 자식 window 간 타입 체크를 위해 사용한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isNumberSafe(obj) {
        return toString.call(obj) === '[object Number]';
    }

    /**
     * 인자가 문자열인지 확인하는 메서드
     * <br>iframe 사용할 경우 부모 자식 window 간 타입 체크를 위해 사용한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isStringSafe(obj) {
        return toString.call(obj) === '[object String]';
    }

    /**
     * 인자가 불리언 타입인지 확인하는 메서드
     * <br>iframe 사용할 경우 부모 자식 window 간 타입 체크를 위해 사용한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isBooleanSafe(obj) {
        return toString.call(obj) === '[object Boolean]';
    }

    /**
     * 인자가 HTML Node 인지 검사한다. (Text Node 도 포함)
     * @param {*} html 평가할 대상
     * @return {Boolean} HTMLElement 인지 여부
     * @memberOf ne.util
     */
    function isHTMLNode(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement || !!html.nodeType));
        }
        return !!(html && html.nodeType);
    }

    /**
     * 인자가 HTML Tag 인지 검사한다. (Text Node 제외)
     * @param {*} html 평가할 대상
     * @return {Boolean} HTMLElement 인지 여부
     * @memberOf ne.util
     */
    function isHTMLTag(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement));
        }
        return !!(html && html.nodeType && html.nodeType === 1);
    }

    /**
     * null, undefined 여부와 순회 가능한 객체의 순회가능 갯수가 0인지 체크한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isEmpty(obj) {
        var hasKey = false;

        if (!isExisty(obj)) {
            return true;
        }

        if (isString(obj) && obj === '') {
            return true;
        }

        if (isArray(obj) || isArguments(obj)) {
            return obj.length === 0;
        }

        if (isObject(obj) && !isFunction(obj)) {
            ne.util.forEachOwnProperties(obj, function() {
                hasKey = true;
                return false;
            });

            return !hasKey;
        }

        return true;

    }

    /**
     * isEmpty 메서드와 반대로 동작한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     * @memberOf ne.util
     */
    function isNotEmpty(obj) {
        return !isEmpty(obj);
    }


    ne.util.isExisty = isExisty;
    ne.util.isUndefined = isUndefined;
    ne.util.isNull = isNull;
    ne.util.isTruthy = isTruthy;
    ne.util.isFalsy = isFalsy;
    ne.util.isArguments = isArguments;
    ne.util.isArray = Array.isArray || isArray;
    ne.util.isArraySafe = Array.isArray || isArraySafe;
    ne.util.isObject = isObject;
    ne.util.isFunction = isFunction;
    ne.util.isFunctionSafe = isFunctionSafe;
    ne.util.isNumber = isNumber;
    ne.util.isNumberSafe = isNumberSafe;
    ne.util.isString = isString;
    ne.util.isStringSafe = isStringSafe;
    ne.util.isBoolean = isBoolean;
    ne.util.isBooleanSafe = isBooleanSafe;
    ne.util.isHTMLNode = isHTMLNode;
    ne.util.isHTMLTag = isHTMLTag;
    ne.util.isEmpty = isEmpty;
    ne.util.isNotEmpty = isNotEmpty;

})(window.ne);

/**********
 * window.js
 **********/

/**
 * @fileoverview 팝업 윈도우 관리 모듈
 * @author FE개발팀
 * @dependency browser.js, type.js, object.js, collection.js, func.js, window.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    var popup_id = 0;

    /**
     * 팝업 컨트롤 클래스
     * @constructor
     * @memberof ne.util
     */
    function Popup() {

        /**
         * 팝업창 캐시용 객체 프로퍼티
         * @type {object}
         */
        this.openedPopup = {};

        /**
         * IE7 에서 부모창과 함께 팝업이 닫힐 지 여부를 가리는 closeWithParent프로퍼티를 Window객체에 추가하면
         * 오류가 발생하는 문제가 있어서, 이를 저장하기 위한 별개의 프로퍼티를 만듦.
         * @type {object}
         */
        this.closeWithParentPopup = {};

        /**
         * IE11 팝업 POST 데이터 브릿지
         * @type {string}
         */
        this.postDataBridgeUrl = '';
    }

    /**********
     * public methods
     **********/

    /**
     * 현재 윈도우가 관리하는 팝업 창 리스트를 반환합니다.
     * @param {String} [key] key에 해당하는 팝업을 반환한다
     * @returns {Object} popup window list object
     */
    Popup.prototype.getPopupList = function(key) {
        var target;
        if (ne.util.isExisty(key)) {
            target = this.openedPopup[key];
        } else {
            target = this.openedPopup;
        }
        return target;
    };

    /**
     * 팝업창을 여는 메서드
     *
     * IE11에서 POST를 사용해 팝업에 값을 전달할 땐 꼭 postDataBridgeUrl을 설정해야 한다
     *
     * 주의: 다른 도메인을 팝업으로 띄울 경우 보안 문제로 팝업 컨트롤 기능을 사용할 수 없다.
     *
     * @param {String} url 팝업 URL
     * @param {object} options
     *     @param {String} [options.popupName]
     *     팝업창의 key를 설정할 수 있습니다.
     *     이 key를 지정하면 같은 key로 팝업을 열려 할 때 이미 열려있는 경우에는 포커스를 주고, 없는 경우 같은 key로 팝업을 엽니다.
     *
     *     @param {String} [options.popupOptionStr=""]
     *     팝업 윈도우의 기능을 설정할 수 있습니다. window.open() 메서드의 세 번째 인자를 그대로 전달하면 됩니다.
     *     이 기능의 적용에는 브라우저마다 차이가 있습니다. http://www.w3schools.com/jsref/met_win_open.asp 를 참고하시기 바랍니다.
     *
     *     @param {Boolean} [options.closeWithParent=true]
     *     팝업 윈도우를 연 윈도우가 닫힐 때 같이 닫힐 지 여부를 설정할 수 있습니다.
     *
     *     @param {Boolean} [options.useReload=false]
     *     이미 열린 팝업 윈도우를 다시 열 때 새로고침 할 것인지를 설정할 수 있습니다. post 데이터를 전송하는 경우 일부 브라우저에서는 다시 전송 여
     *     부를 묻는 메시지가 출력될 수 있습니다.
     *
     *     @param {string} [options.postDataBridgeUrl='']
     *     IE11 에서 POST로 팝업에 데이터를 전송할 때 팝업이 아닌 새 탭으로 열리는 버그를 우회하기 위한 페이지의 url을 입력합니다.
     *     참고: http://wiki.nhnent.com/pages/viewpage.action?pageId=240562844
     *
     *     @param {String} [options.method=get]
     *     팝업 윈도우에 폼 데이터 자동 전송 기능 이용 시, 데이터 전달 방식을 지정할 수 있습니다.
     *
     *     @param {object} [options.param=null]
     *     팝업 윈도우에 폼 데이터 자동 전송 기능 이용 시, 전달할 데이터를 객체로 넘겨주시면 됩니다.
     */
    Popup.prototype.openPopup = function(url, options) {
        options = ne.util.extend({
            popupName: 'popup_' + popup_id + '_' + (+new Date()),
            popupOptionStr: '', // 팝업 옵션
            useReload: true, // 팝업이 열린 상태에서 다시 열려고 할 때 새로고침 하는지 여부
            closeWithParent: true, // 부모창 닫힐때 팝업 닫기 여부
            method: 'get',
            param: {}
        }, options || {});

        options.method = options.method.toUpperCase();

        this.postDataBridgeUrl = options.postDataBridgeUrl || this.postDataBridgeUrl;

        var popup,
            formElement,
            useIEPostBridge = options.method === 'POST' && options.param &&
                ne.util.browser.msie && ne.util.browser.version === 11;

        if (!ne.util.isExisty(url)) {
            throw new Error('Popup#open() 팝업 URL이 입력되지 않았습니다');
        }

        popup_id += 1;

        // 폼 전송 기능 이용 시 팝업 열기 전 폼을 생성하고 팝업이 열림과 동시에 폼을 전송한 후 폼을 제거한다.
        if (options.param) {
            if (options.method === 'GET') {
                url = url + (/\?/.test(url) ? '&' : '?') + this._parameterize(options.param);
            } else if (options.method === 'POST') {
                if (!useIEPostBridge) {
                    formElement = this.createForm(url, options.param, options.method, options.popupName);
                    url = 'about:blank';
                }
            }
        }

        popup = this.openedPopup[options.popupName];

        if (!ne.util.isExisty(popup)) {
            this.openedPopup[options.popupName] = popup = this._open(useIEPostBridge, options.param,
                url, options.popupName, options.popupOptionStr);

        } else {
            if (popup.closed) {
                this.openedPopup[options.popupName] = popup = this._open(useIEPostBridge, options.param,
                    url, options.popupName, options.popupOptionStr);

            } else {
                if (options.useReload) {
                    popup.location.replace(url);
                }
                popup.focus();
            }
        }

        this.closeWithParentPopup[options.popupName] = options.closeWithParent;

        if (!popup || popup.closed || ne.util.isUndefined(popup.closed)) {
            alert('브라우저에 팝업을 막는 기능이 활성화 상태이기 때문에 서비스 이용에 문제가 있을 수 있습니다. 해당 기능을 비활성화 해 주세요');
        }

        if (options.param && options.method === 'POST' && !useIEPostBridge) {
            if (popup) {
                formElement.submit();
            }
            if (formElement.parentNode) {
                formElement.parentNode.removeChild(formElement);
            }
        }

        window.onunload = ne.util.bind(this.closeAllPopup, this);
    };

    /**
     * 팝업 윈도우를 닫습니다.
     * @param {Boolean} [skipBeforeUnload]
     * @param {Window} [popup] 닫을 윈도우 객체. 생략하면 현재 윈도우를 닫습니다
     */
    Popup.prototype.close = function(skipBeforeUnload, popup) {
        skipBeforeUnload = ne.util.isExisty(skipBeforeUnload) ? skipBeforeUnload : false;

        var target = popup || window;

        if (skipBeforeUnload) {
            window.onunload = null;
        }

        if (!target.closed) {
            target.opener = window.location.href;
            target.close();
        }
    };

    /**
     * 이 창에서 열린 모든 팝업을 닫습니다.
     * @param {Boolean} closeWithParent true 면 openPopup 메서드 호출 시 부모창과 함께 닫기로 설정된 팝업들만 닫습니다.
     */
    Popup.prototype.closeAllPopup = function(closeWithParent) {
        var hasArg = ne.util.isExisty(closeWithParent);

        ne.util.forEachOwnProperties(this.openedPopup, function(popup, key) {
            if ((hasArg && this.closeWithParentPopup[key]) || !hasArg) {
                this.close(false, popup);
            }
        }, this);
    };

    /**
     * 해당 팝업 윈도우를 활성화 시킨다.
     * @param {String} popupName 활성화 시킬 팝업 윈도우 이름
     */
    Popup.prototype.focus = function(popupName) {
        this.getPopupList(popupName).focus();
    };

    /**
     * 브라우저의 query string을 파싱해 객체 형태로 반환
     * @return {object}
     * @private
     */
    Popup.prototype.parseQuery = function() {
        var search,
            pair,
            param = {};

        search = window.location.search.substr(1);
        ne.util.forEachArray(search.split('&'), function(part) {
            pair = part.split('=');
            param[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        });

        return param;
    };

    /**
     * 주어진 인자로 숨겨진 폼을 생성하여 문서에 추가하고 반환
     * @param {string} action 폼 전송 URL
     * @param {object} [data] 폼 전송 시 보내질 데이터
     * @param {string} [method]
     * @param {string} [target]
     * @param {HTMLElement} [container]
     * @returns {HTMLElement}
     */
    Popup.prototype.createForm = function(action, data, method, target, container) {
        var form = document.createElement('form'),
            input;

        container = container || document.body;

        form.method = method || 'POST';
        form.action = action || '';
        form.target = target || '';
        form.style.display = 'none';

        ne.util.forEachOwnProperties(data, function(value, key) {
            input = document.createElement('input');
            input.name = key;
            input.type = 'hidden';
            input.value = value;
            form.appendChild(input);
        });

        container.appendChild(form);

        return form;
    };

    /**********
     * private methods
     **********/

    /**
     * 객체를 쿼리스트링 형태로 변환
     * @param {object} object
     * @returns {string}
     * @private
     */
    Popup.prototype._parameterize = function(object) {
        var query = [];

        ne.util.forEachOwnProperties(object, function(value, key) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });

        return query.join('&');
    };

    /**
     * 실제 팝업을 여는 메서드
     * @param {Boolean} useIEPostBridge IE11에서 팝업에 포스트 데이터를 전달할 때 우회 기능 사용 여부
     * @param {object} param 팝업에 전달할 데이터
     * @param {String} url 팝업 URL
     * @param {String} popupName 팝업 이름
     * @param {String} optionStr 팝업 기능 설정용 value ex) 'width=640,height=320,scrollbars=yes'
     * @returns {Window}
     * @private
     */
    Popup.prototype._open = function(useIEPostBridge, param, url, popupName, optionStr) {
        var popup;

        if (useIEPostBridge) {
            url = this.postDataBridgeUrl + '?storageKey=' + encodeURIComponent(popupName) +
            '&redirectUrl=' + encodeURIComponent(url);
            if (!window.localStorage) {
                alert('IE11브라우저의 문제로 인해 이 기능은 브라우저의 LocalStorage 기능을 활성화 하셔야 이용하실 수 있습니다');
            } else {
                localStorage.removeItem(popupName);
                localStorage.setItem(popupName, JSON.stringify(param));

                popup = window.open(url, popupName, optionStr);
            }
        } else {
            popup = window.open(url, popupName, optionStr);
        }

        return popup;
    };

    ne.util.popup = new Popup();

})(window.ne);
