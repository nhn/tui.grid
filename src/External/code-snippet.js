if (!window.ne) { window.ne = {}; }
if (!window.ne.util) { window.ne.util = {}; }
/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

    ne.type = ne.type || {
        isPlaneObject: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        },
        isFunction: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Function]';
        },
        isTruthy: function(obj){
            return ne.type.isDefined(obj) && obj !== false;
        },
        isDefined: function(obj) {
            return obj !== null && obj !== undefined;
        }
    };

    var ajax = {};

    /**
     * Ajax 요청 정보 저장 객체
     * @property _ajaxRequestData
     * @private
     * @type {DataObject}
     */
    ajax._ajaxRequestData = {};
    /**
     * 공통 Ajax 처리 함수
     * @method ajax
     * @param {String} api urlCode 페이지 코드 (pug.variables._url에 저장된 값) 혹은 API URL 직접 입력
     * @param {DataObject} options Ajax 요청 옵션 객체
     * 		@param {DataObject} [options.data] Ajax 요청 시 함께 전달할 파라미터 객체
     * 		@param {String} [options.type="post"] ajax 요청 형식
     * 		@param {String} [options.dataType="json"] ajax 응답받을 데이터 형식
     * 		@param {Funtion} [options.complete] 전송이 완료되었을 시 실행될 콜백함수
     * 		@param {Funtion} [options.success] 전송이 성공하였을 시 실행될 콜백함수
     * 		@param {Funtion} [options.error] 전송이 실패하였을 시 실행될 콜백함수
     * - $Ajax() 옵션 그대로 사용가능<br />
     * - 추가적인 옵션<br />
     *  bNotUseErrorAlert : Ajax 통신 중에, 에러가 발생하더라도, 얼럿을 띄우지 않도록 할 경우 true로 설정
     *  sResultType : 응답 포맷
     * @return {Object} $Ajax() 객체
     * @example
     * ne.ajax.request(url, {
     *	 "action" : "insertList",
     *	 "page" : 3
     *	 "success" : function(responseData, status, jqXHR){
     *		console.log("응답 데이터 : ", responseData.myData);
     *	 }
     * });
     */
    ajax.request = function(api, options) {
        // Ajax 요청을 할 API 설정
        var url = api;

        if (url) {
            // 랜덤 아이디 생성
            var randomId = ajax.util._getRandomId();

            // Ajax 요청용 파라미터 객체 설정
            options = options || {};
            options._complete = options.complete;
            options._success = options.success;
            options._error = options.error;
            options = $.extend(options, {
                url: url,
                data: options.data || {},
                type: options.type || 'post',
                dataType: options.dataType || 'json',
                complete: $.proxy(this._onAjaxComplete, this, randomId),
                success: $.proxy(this._onAjaxSuccess, this, randomId),
                error: $.proxy(this._onAjaxError, this, randomId)
            });

            // 중복된 요청일 경우 요청 중단
            var isMatchedURL, isExistJSON;
            for (var x in this._ajaxRequestData) {
                isMatchedURL = options.url === this._ajaxRequestData[x].url;
                isExistJSON = $.compareJSON(this._ajaxRequestData[x].data, options.data);
                if (isMatchedURL && isExistJSON) {
                    return false;
                }
            }

            // 요청 정보를 저장
            this._ajaxRequestData[randomId] = ajax.util.cloningObject(options);
            $.ajax(options);
        } else {
            alert('요청을 보낼 URL을 입력해 주시기 바랍니다.');
            return false;
        }
    };

    /**
     * ajax 전송이 완료되었을 때 실행되는 콜백함수
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxComplete
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @param {String} status Ajax 응답 status
     * @private
     */
    ajax._onAjaxComplete = function(requestKey, jqXHR, status) {
        var requestData = this._ajaxRequestData[requestKey];
        if (requestData) {
            if (requestData['_complete'] && $.isFunction(requestData['_complete'])) {
                requestData['_complete'](status, jqXHR);
            }
            delete this._ajaxRequestData[requestKey];
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * ajax 전송이 성공하였을 때 실행되는 콜백함수
     * - 응답값의 result가 true일 때 실행된다
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxSuccess
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {DataObject} responseData Ajax 응답받은 데이터
     * 		@param {Boolean} [responseData.result] 정상적인 응답결과인지 여부
     * 		@param {String} [responseData.data.message] 정의되어 있을 경우, 이 문자열로 시스템얼럿 발생
     * 		@param {String} [responseData.data.redirectUrl] 이동시킬 url, 있을 경우 리다이렉트 처리
     * 		@param {Boolean} [responseData.data.closeWindow] 창 닫을지 여부, true일 경우 현재창 닫음
     * @param {String} status Ajax 응답 status
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @private
     */
    ajax._onAjaxSuccess = function(requestKey, responseData, status, jqXHR) {
        var requestData = this._ajaxRequestData[requestKey];

        if (requestData) {
            var result = true;
            if (requestData['_success'] && ne.type.isFunction(requestData['_success'])) {
                result = requestData['_success'](responseData, status, jqXHR);
            }

            if (result !== false && responseData && responseData.data) {
                if (responseData.data.message) {
                    alert(responseData.data.message);
                }

                if (responseData.data.redirectUrl) {
                    location.href = responseData.data.redirectUrl;
                }

                if (responseData.data.closeWindow) {
                    ajax.util.close(true);
                }
            }
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * ajax 전송이 성공하였을 때 실행되는 콜백함수
     * - 응답값의 result가 false일 때 실행된다
     * - Ajax 요청이 완료되었을 때 수행되며, HTTP 상태 코드와 서버에서의 응답 결과에 따라 공통된 처리를 수행한다.
     * - Ajax 요청 시, 사용자가 등록한 콜백이 있으면 실행한다.
     *
     * @method _onAjaxError
     * @param {String} requestKey Ajax 요청에 대한 고유 아이디
     * @param {jqXHR} jqXHR Ajax 응답 객체
     * @param {String} status Ajax 응답 status
     * @param {String} errorMessage 서버로부터 전달받은 에러메세지
     * @private
     */
    ajax._onAjaxError = function(requestKey, jqXHR, status, errorMessage){
        var requestData = this._ajaxRequestData[requestKey];
        if (requestData) {
            var result = true;
            if (requestData['_error'] && $.isFunction(requestData['_error'])) {
                result = requestData['_error'](jqXHR, status, errorMessage);
            }
        } else {
            throw new Error('Ajax 요청 정보가 없습니다.');
        }
    };

    /**
     * @modules ne.ajax.util
     */

    ajax.util = {};
    /**
     * 객체를 복제하여 돌려준다.
     *
     * @param {*} sourceTarget 복제할 대상
     * @returns {*}
     */
    ajax.util.cloningObject = function(sourceTarget) {
        var constructor,
            destinationTarget,
            x, y;

        if (ne.type.isPlaneObject(sourceTarget) && (constructor = this.getConstructorName(sourceTarget))) {
            destinationTarget = eval('new ' + constructor + '()');

            if (sourceTarget.prototype) {
                for (x in sourceTarget.prototype) {
                    destinationTarget.prototype[x] = this.cloningObject(sourceTarget.prototype[x]);
                }
            }

            for (y in sourceTarget) {
                if (sourceTarget[y] instanceof RegExp) {
                    destinationTarget[y] = eval(sourceTarget[y].toString());
                } else {
                    destinationTarget[y] = this.cloningObject(sourceTarget[y]);
                }
            }
            return destinationTarget;
        }

        destinationTarget = sourceTarget;
        return destinationTarget;
    };

    /**
     * 클래스의 이름을 문자열로 가져온다.
     *
     * @param {*} target constructor를 체크 할 오브젝트
     * @returns {String|null}
     */
    ajax.util.getConstructorName = function(target) {
        if (target && target.constructor) {
            var code = target.constructor.toString();
            var match = code.match(/function ([^\(]*)/);
            return (match && match[1]) || null;
        }
        return null;
    };

    /**
     * 랜덤한 문자열을 생성하는 함수
     *
     * @private
     * @return {String} 랜덤값
     */
    ajax.util._getRandomId = function() {
        return String(parseInt(Math.random() * 10000000000, 10));
    };

    /**
     * 닫기를 실행, 대상이 엘리먼트이면 이벤트 제거만 수행
     *
     * @param {*} skipBeforeUnload
     * @param popup
     */
    ajax.util.close = function(skipBeforeUnload, popup) {
        var target = popup || window;

        if (ne.type.isTruthy(skipBeforeUnload)) {
            $(target).off('beforeunload');
        }

        if (!target.closed) {
            target.opener = window.location.href;
            target.close();
        }

    };

    ne.ajax = ajax;

})(window.ne.util);
/**
 * @fileoverview 클라이언트의 브라우저의 종류와 버전 검출을 위한 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

    /**
     * 다음의 브라우저에 한하여 종류와 버전을 제공하는 모듈
     *
     * - ie7 ~ ie11
     * - chrome
     * - firefox
     * - safari
     *
     * @module browser
     * @example
     * if (browser.msie && browser.version === 7) {
     *     // IE7일 경우의 루틴
     * }
     *
     * if (browser.chrome && browser.version >= 32) {
     *     // Chrome 32버전 이상일 때의 루틴
     * }
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

    var rIE = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})'),
        rIE11 = /Trident.*rv\:11\./,
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

    ne.browser = browser;

})(window.ne.util);

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

    /**
     * obj에 상속된 프로퍼티를 제외한 obj의 고유의 프로퍼티만 순회하며 콜백함수에 전달한다.
     * @param {object} obj
     * @param {Function} iteratee  프로퍼티가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     * var sum = 0;
     *
     * forEach({a:1,b:2,c:3}, function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     **/
    function forEachOwnProperties(obj, iteratee, context) {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iteratee.call(context || null, obj[key], key, obj);
            }
        }
    }

    /**
     * 파라메터로 전달된 객체나 어레이를 순회하며 데이터를 콜백함수에 전달한다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     * var sum = 0;
     *
     * forEach([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     **/
    function forEach(obj, iteratee, context) {
        var key,
            len;

        if (ne.isArray(obj)) {
            for (key = 0, len = obj.length; key < len; key++) {
                iteratee.call(context || null, obj[key], key, obj);
            }
        } else {
            ne.forEachOwnProperties(obj, iteratee, context);
        }
    }

    /**
     * 파라메터로 전달된 객체나 어레이를 순회하며 콜백을 실행한 리턴값을 배열로 만들어 리턴한다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {Array}
     * @example
     * map([0,1,2,3], function(value) {
     *     return value + 1;
     * });
     *
     * => [1,2,3,4];
     */
    function map(obj, iteratee, context) {
        var resultArray = [];

        ne.forEach(obj, function() {
            resultArray.push(iteratee.apply(context || null, arguments));
        });

        return resultArray;
    }

    /**
     * 파라메터로 전달된 객체나 어레이를 순회하며 콜백을 실행한 리턴값을 다음 콜백의 첫번째 인자로 넘겨준다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
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


        if (!ne.isArray(obj)) {
            keys = ne.keys(obj);
        }

        length = keys ? keys.length : obj.length;

        store = obj[keys ? keys[index++] : index++];

        for (; index < length; index++) {
            store = iteratee.call(context || null, store, obj[keys ? keys[index] : index]);
        }

        return store;
    }

    /**
     * 유사배열을 배열 형태로 변환한다.
     * @param {*} arrayLike 유사배열
     * @return {Array}
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
        return Array.prototype.slice.call(arrayLike);
    }

    ne.forEachOwnProperties = forEachOwnProperties;
    ne.forEach = forEach;
    ne.map = map;
    ne.reduce = reduce;
    ne.toArray = toArray;

})(window.ne.util);
/**
 * @fileoverview 옵저버 패턴을 이용하여 객체 간 커스텀 이벤트를 전달할 수 있는 기능을 제공하는 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }

    /**
     * 이벤트 핸들러에 저장되는 단위
     * @typedef {object} eventItem
     * @property {object.<string, object>} eventObject
     * @property {function()} eventObject.fn 이벤트 핸들러 함수
     * @property {*} [eventObject.ctx] 이벤트 핸들러 실행 시 컨텍스트 지정가능
     */


    /**
     * 커스텀 이벤트 클래스
     * @constructor
     * @exports CustomEvents
     * @class
     */
    function CustomEvents() {

        /**
         * 이벤트 핸들러를 저장하는 객체
         * @type {object.<string, eventItem>}
         * @private
         */
        this._events = {};
    }

    var CustomEventMethod = /** @lends CustomEvents */ {
        /**
         * 인스턴스가 발생하는 이벤트에 핸들러를 등록하는 메서드
         * @param {(object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @example
         * // 첫 번째 인자에 이벤트명:핸들러 데이터 객체를 넘긴 경우
         * instance.on({
         *     zoom: function() {},
         *     pan: function() {}
         * }, this);
         *
         * // 여러 이벤트를 한 핸들러로 처리할 수 있도록 함
         * instance.on('zoom pan', function() {});
         */
        on: function(types, fn, context) {
            this._toggle(true, types, fn, context);
        },

        /**
         * 인스턴스에 등록했던 이벤트 핸들러를 해제할 수 있다.
         * @param {(object|string)=} types 등록 해지를 원하는 이벤트 객체 또는 타입명. 아무 인자도 전달하지 않으면 모든 이벤트를 해제한다.
         * @param {Function=} fn
         * @param {*=} context
         * @example
         * // zoom 이벤트만 해제
         * instance.off('zoom', onZoom);
         *
         * // pan 이벤트 해제 (이벤트 바인딩 시에 context를 넘겼으면 그대로 넘겨주어야 한다)
         * instance.off('pan', onPan, this);
         *
         * // 인스턴스 내 모든 이벤트 해제
         * instance.off();
         */
        off: function(types, fn, context) {
            if (!ne.isDefined(types)) {
                this._events = null;
                return;
            }

            this._toggle(false, types, fn, context);
        },

        /**
         * on, off 메서드의 중복 코드를 줄이기 위해 만든 on토글 메서드
         * @param {boolean} isOn
         * @param {(Object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @private
         */
        _toggle: function(isOn, types, fn, context) {
            var methodName = isOn ? '_on' : '_off',
                method = this[methodName];

            if (ne.isObject(types)) {
                ne.forEachOwnProperties(types, function(handler, type) {
                    method.call(this, type, handler, fn);
                }, this);
            } else {
                types = types.split(' ');

                ne.forEach(types, function(type) {
                    method.call(this, type, fn, context);
                }, this);
            }
        },

        /**
         * 내부적으로 실제로 이벤트를 등록하는 로직을 담는 메서드.
         *
         * 옵션에 따라 이벤트를 배열에 등록하기도 하고 해시에 등록하기도 한다.
         *
         * 두개를 사용하는 기준:
         *
         * 핸들러가 이미 this바인딩이 되어 있고 핸들러를 사용하는 object가 같은 종류가 동시다발적으로 생성/삭제되는 경우에는 context인자를
         * 전달하여 해시의 빠른 접근 속도를 이용하는 것이 좋다.
         *
         * @param {(object.<string, function()>|string)} type - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()} fn - 이벤트 핸들러
         * @param {*=} context
         * @private
         */
        _on: function(type, fn, context) {
            var events = this._events = this._events || {},
                contextId = context && (context !== this) && ne.stamp(context);

            if (contextId) {
                /*
                 context가 현재 인스턴스와 다를 때 context의 아이디로 내부의 해시에서 빠르게 해당 핸들러를 컨트롤 하기 위한 로직.
                 이렇게 하면 동시에 많은 이벤트를 발생시키거나 제거할 때 성능면에서 많은 이점을 제공한다.
                 특히 동시에 많은 엘리먼트들이 추가되거나 해제될 때 도움이 될 수 있다.
                 */
                var indexKey = type + '_idx',
                    indexLenKey = type + '_len',
                    typeIndex = events[indexKey] = events[indexKey] || {},
                    id = ne.stamp(fn) + '_' + contextId; // 핸들러의 id + context의 id

                if (!typeIndex[id]) {
                    typeIndex[id] = {
                        fn: fn,
                        ctx: context
                    };

                    // 할당된 이벤트의 갯수를 추적해 두고 할당된 핸들러가 없는지 여부를 빠르게 확인하기 위해 사용한다
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }
            } else {
                // fn이 이미 this 바인딩이 된 상태에서 올 경우 단순하게 처리해준다
                events[type] = events[type] || [];
                events[type].push({fn: fn});
            }
        },

        /**
         * 실제로 구독을 해제하는 메서드
         * @param {(object|string)=} type 등록 해지를 원하는 핸들러명
         * @param {function} fn
         * @param {*} context
         * @private
         */
        _off: function(type, fn, context) {
            var events = this._events,
                indexKey = type + '_idx',
                indexLenKey = type + '_len';

            if (!events) {
                return;
            }

            var contextId = context && (context !== this) && ne.stamp(context),
                listeners,
                id;

            if (contextId) {
                id = ne.stamp(fn) + '_' + contextId;
                listeners = events[indexKey];

                if (listeners && listeners[id]) {
                    listeners[id] = null;
                    events[indexLenKey]--;
                }

            } else {
                listeners = events[type];

                if (listeners) {
                    ne.forEach(listeners, function(listener, arr, index) {
                        if (ne.isDefined(listener) && (listener.fn === fn)) {
                            listeners.splice(index, 1);
                            return true;
                        }
                    });
                }
            }
        },

        /**
         * 이벤트를 발생시키는 메서드
         * @param {string} type 이벤트 타입명
         * @param {(object|string)=} data 발생과 함께 전달할 이벤트 데이터
         * @return {*}
         * @example
         * instance.fire('move', { direction: 'left' });
         *
         * // 이벤트 핸들러 처리
         * instance.on('move', function(moveEvent) {
         *     var direction = moveEvent.direction;
         * });
         */
        fire: function(type, data) {
            if (!this.hasListener(type)) {
                return this;
            }

            var event = ne.extend({}, data, {type: type, target: this}),
                events = this._events;

            if (!events) {
                return;
            }

            var typeIndex = events[type + '_idx'],
                listeners;

            if (events[type]) {
                listeners = events[type].slice();

                ne.forEach(listeners, function(listener) {
                    listener.fn.call(this, event);
                }, this);
            }

            ne.forEachOwnProperties(typeIndex, function(eventItem) {
                eventItem.fn.call(eventItem.ctx, event);
            });

            return this;
        },

        /**
         * 이벤트 핸들러 존재 여부 확인
         * @param {string} type 핸들러명
         * @return {boolean}
         */
        hasListener: function(type) {
            var events = this._events,
                isDefineMethod = ne.isDefined;

            return isDefineMethod(events) && (isDefineMethod(events[type]) || events[type + '_len']);
        },

        /**
         * 단발성 커스텀 이벤트 핸들러 등록 시 사용
         * @param {(object|string)} types 이벤트명:핸들러 객체 또는 이벤트명
         * @param {function()=} fn 핸들러 함수
         * @param {*=} context
         */
        once: function(types, fn, context) {
            var that = this;

            if (ne.isObject(types)) {
                ne.forEachOwnProperties(types, function(type) {
                    this.once(type, types[type], fn)
                }, this);

                return;
            }

            function onceHandler() {
                fn.apply(context, arguments);
                that.off(types, onceHandler, context);
            }

            this.on(types, onceHandler, context);
        }

    };

    CustomEvents.prototype = CustomEventMethod;
    CustomEvents.prototype.constructor = CustomEvents;

    /**
     * 커스텀 이벤트 기능을 믹스인할 때 사용하는 메서드
     * @param {function()} func 생성자 함수
     * @example
     * // 모델 클래스 변경 시 컨트롤러에게 알림을 주고 싶은데
     * // 그 기능을 모델 클래스 자체에게 주고 싶다
     * function Model() {}
     *
     * // 커스텀 이벤트 믹스인
     * ne.CustomEvents.mixin(Model);
     *
     * var model = new Model();
     *
     * model.on('changed', function() {}, this);
     */
    CustomEvents.mixin = function(func) {
        ne.extend(func.prototype, CustomEventMethod);
    };

    ne.CustomEvents = CustomEvents;

})(window.ne.util);

/**
 * @fileoverview 클래스와 비슷한방식으로 생성자를 만들고 상속을 구현할 수 있는 메소드를 제공하는 모듈
 * @author FE개발팀
 * @dependency inheritance.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
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
     *
     *
     */
    var defineClass = function(parent, props) {
        var obj;

        if (!props) {
            props = parent;
            parent = null;
        }

        obj = props.init || function(){};

        parent && ne.inherit(obj, parent);

        if (props.hasOwnProperty('static')) {
            ne.extend(obj, props.static);
            delete props.static;
        }

        ne.extend(obj.prototype, props);

        return obj;
    };

    ne.defineClass = defineClass;

})(window.ne.util);

/**
 * @fileoverview Form 엘리먼트 헨들링 메서드
 * @author FE개발팀
 * @dependency jquery-1.8.3.js, collection.js, type.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

    /**
     * form 의 input 요소 값을 설정하기 위한 객체
     */
    var setInput = {
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
            if (ne.isArray(formValue)) {
                targetElement.checked = $.inArray(targetElement.value, _changeToStringInArray(formValue)) !== -1;
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
            var options = ne.toArray(targetElement.options),
                index = -1;

            ne.forEach(options, function(targetOption, i) {
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
            var options = ne.toArray(targetElement.options);

            if (ne.isArray(formValue)) {
                formValue = _changeToStringInArray(formValue);
                ne.forEach(options, function(targetOption) {
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
    };
    /**
     * 배열의 값들을 전부 String 타입으로 변환한다.
     * @private
     * @param {Array}  arr 변환할 배열
     * @return {Array} 변환된 배열 결과 값
     */
    function _changeToStringInArray(arr) {
        ne.forEach(arr, function(value, i) {
            arr[i] = String(value);
        }, this);
        return arr;
    }


    /**
     * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
     **/
    function getFormData($form) {
        var result = {},
            valueList = $form.serializeArray();

        ne.forEach(valueList, function(obj) {
            var value = obj.value,
                name = obj.name;
            if (ne.isDefined(result[name])) {
                if (!result[name].push) {
                    result[name] = [result[name]];
                }
                result[name].push(value || '');
            } else {
                result[name] = value || '';
            }
        }, this);

        return result;
    }
    /**
     * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
     * @method getFormElement
     * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
     * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
     */
    function getFormElement($form, elementName) {
        var formElement;
        if ($form && $form.length) {
            if (elementName) {
                formElement = $form.prop('elements')[elementName + ''];
            } else {
                formElement = $form.prop('elements');
            }
        }
        return $(formElement);
    }
    /**
     * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
     *
     * @method setFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {Object} formData 폼에 설정할 폼 데이터 객체
     **/
    function setFormData($form, formData) {
        ne.forEachOwnProperties(formData, function(value, property) {
            setFormElementValue($form, property, value);
        }, this);
    }
    /**
     * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
     * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
     * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
     **/
    function setFormElementValue($form, elementName, formValue) {
        var type,
            elementList = getFormElement($form, elementName);

        if (!elementList) {
            return;
        }
        if (!ne.isArray(formValue)) {
            formValue = String(formValue);
        }
        elementList = ne.isHTMLTag(elementList) ? [elementList] : elementList;
        elementList = ne.toArray(elementList);
        ne.forEach(elementList, function(targetElement) {
            type = setInput[targetElement.type] ? targetElement.type : 'defaultAction';
            setInput[type](targetElement, formValue);
        }, this);
    }
    /**
     * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
     * @param {HTMLElement} target HTML input 엘리먼트
     */
    function setCursorToEnd(target) {
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

    ne.getFormElement = getFormElement;
    ne.getFormData = getFormData;
    ne.setFormData = setFormData;
    ne.setFormElementValue = setFormElementValue;
    ne.setCursorToEnd = setCursorToEnd;
})(window.ne.util);
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

    /**
     * 커링 메서드
     * @param {function()} fn
     * @param {*} obj - this로 사용될 객체
     * @return {function()}
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

    ne.bind = bind;

})(window.ne.util);

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

    /**
     * 전달된 객체를 prototype으로 사용하는 객체를 만들어 반환하는 메서드
     * @param {Object} obj
     * @return {Object}
     */
    function createObject(){
        function F() {}

        return function(obj) {
            F.prototype = obj;
            return new F;
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
     */
    function inherit(subType, superType) {
        var prototype = ne.createObject(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }

    ne.createObject = createObject();
    ne.inherit = inherit;

})(window.ne.util);

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

})(window.ne.util);
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

    /**
     * 데이터 객체를 확장하는 메서드 (deep copy 는 하지 않는다)
     * @param {object} target - 확장될 객체
     * @param {...object} objects - 프로퍼티를 복사할 객체들
     * @return {object}
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
     */
    function stamp(obj) {
        obj.__fe_id = obj.__fe_id || ++lastId;
        return obj.__fe_id;
    }

    function resetLastId() {
        lastId = 0;
    }

    /**
     * 객체를 전달받아 객체의 키목록을 배열로만들어 리턴해준다.
     * @param obj
     * @returns {Array}
     */
    var keys = function(obj) {
        var keys = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    };

    ne.extend = extend;
    ne.stamp = stamp;
    ne._resetLastId = resetLastId;
    ne.keys = Object.keys || keys;

})(window.ne.util);

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

})(window.ne.util);

/**
 * @fileoverview 문자열 조작 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    /**
     * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
     * @method decodeHTMLEntity
     * @param {String} htmlEntity HTML Entity 타입의 문자열
     * @return {String} 원래 문자로 변환된 문자열
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
     * @method encodeHTMLEntity
     * @param {String} html HTML 문자열
     * @return {String} HTML Entity 타입의 문자열로 변환된 문자열
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
     * @return {boolean}
     */
    function hasEncodableString(string) {
        return /[<>&"']/.test(string);
    }

    ne.decodeHTMLEntity = decodeHTMLEntity;
    ne.encodeHTMLEntity = encodeHTMLEntity;
    ne.hasEncodableString = hasEncodableString;
})(window.ne.util);

/**
 * @fileoverview 타입체크 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }

    /**
     * 인자가 null 또는 undefined가 아닌지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isDefined(obj) {
        return obj !== null && obj !== undefined;
    }

    /**
     * 인자가 null, undefined, false가 아닌지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isTruthy(obj) {
        return isDefined(obj) && obj !== false;
    }

    /**
     * 인자가 null, undefined, false인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isFalsy(obj) {
        return !isTruthy(obj);
    }


    var toString = Object.prototype.toString;

    /**
     * 인자가 arguments 객체인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArguments(obj) {
        var result = isDefined(obj) &&
            ((toString.call(obj) === '[object Arguments]') || 'callee' in obj);

        return result;
    }

    /**
     * 인자가 배열인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArray(obj) {
        return toString.call(obj) === '[object Array]';
    }

    /**
     * 인자가 객체인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isObject(obj) {
        return obj === Object(obj);
    }

    /**
     * 인자가 함수인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    /**
     * 인자가 숫자인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isNumber(obj) {
        return toString.call(obj) === '[object Number]';
    }

    /**
     * 인자가 문자열인지 확인하는 메서드
     * @param obj
     * @return {boolean}
     */
    function isString(obj) {
        return toString.call(obj) === '[object String]';
    }

    /**
     * 인자가 불리언 타입인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isBoolean(obj) {
        return toString.call(obj) === '[object Boolean]';
    }

    /**
     * 인자가 HTML Node 인지 검사한다. (Text Node 도 포함)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
     */
    function isHTMLNode(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement));
        }
        return !!(html && html.nodeType);
    }
    /**
     * 인자가 HTML Tag 인지 검사한다. (Text Node 제외)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
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
     */
    function isEmpty(obj) {
        var key,
            hasKey = false;

        if (!isDefined(obj)) {
            return true;
        }

        if (isArray(obj) || isArguments(obj)) {
            return obj.length === 0;
        }

        if (isObject(obj) && !isFunction(obj)) {
            ne.forEachOwnProperties(obj, function() {
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
     */
    function isNotEmpty(obj) {
        return !isEmpty(obj);
    }


    ne.isDefined = isDefined;
    ne.isTruthy = isTruthy;
    ne.isFalsy = isFalsy;
    ne.isArguments = isArguments;
    ne.isArray = Array.isArray || isArray;
    ne.isObject = isObject;
    ne.isFunction = isFunction;
    ne.isNumber = isNumber;
    ne.isString = isString;
    ne.isBoolean = isBoolean;
    ne.isHTMLNode = isHTMLNode;
    ne.isHTMLTag = isHTMLTag;
    ne.isEmpty = isEmpty;
    ne.isNotEmpty = isNotEmpty;

})(window.ne.util);

/**
 * @fileoverview 전역변수를 쉽게 사용하기 위한 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }

    /**
     * 전역변수를 저장하기 위한 변수
     * @type {object}
     */
    var settings = {};


    /**
     * 설정했던 전역변수를 가져온다
     * @param {string} path
     */
    function get(path) {
        if (!ne.isDefined(path)) {
            return undefined;
        }

        var pathList = path.split('.'),
            i = 0,
            len = pathList.length,
            pathChunk,
            parent = settings;

        for (; i < len; i++) {
            pathChunk = pathList[i];
            if (typeof parent === 'undefined') {
                break;
            }

            parent = parent[pathChunk];
        }

        return parent;
    }

    /**
     * 전역변수를 설정한다
     *
     * 이미 설정되어있는 변수를 설정하면 덮어쓴다.
     *
     * @param {(string|object)} path 변수를 저장할 path 또는 변경할 {path:value} 객체
     * @param {*} obj 저장할 값
     * @return {*} 단일 값 세팅 시는 세팅한 값을 반환한다 (반환 값은 참조형이기 때문에 주의를 요한다)
     * @example
     * // 단일 값 세팅
     * ne.set('msg.loginerror', '로그인 오류가 발생했습니다');
     *
     * // 여러 값을 한번에 변경
     * ne.set({
     *     'msg.loginerror': '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도하세요',
     *     'msg.loginfail': '없는 아이디이거나 패스워드가 맞지 않습니다'
     * });
     */
    function set(path, obj) {
        if (typeof path !== 'string') {
            ne.forEach(path, function(value, key) {
                set(key, value);
            });
        } else if (typeof obj !== 'undefined') {
            var pathList = path.split('.'),
                i = 0,
                len = pathList.length,
                pathStr,
                parent = settings;

            for (; i < len; i++) {
                pathStr = pathList[i];

                if (i === len - 1) {
                    return parent[pathStr] = obj;
                }

                if (typeof parent[pathStr] === 'undefined') {
                    parent[pathStr] = {};
                }

                parent = parent[pathStr];
            }
        }
    }

    /**
     * 전역변수 공간을 인자 객체로 재설정한다
     * @param {object} obj
     */
    function reset(obj) {
        if (ne.isDefined(obj)) {

            if (!ne.isObject(obj) || ne.isFunction(obj) || ne.isArray(obj)) {
                throw new Error('variable: 전역변수 공간은 object 형태의 데이터로만 설정이 가능합니다.');
            } else {
                settings = obj;
            }

        } else {
            settings = {};
        }
    }

    ne.variable = {
        get: get,
        set: set,
        reset: reset
    };

})(window.ne.util);

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }

})(window.ne.util);
