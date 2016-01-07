/**
* @fileoverview 유틸리티 메서드 모음
* @author NHN Ent. FE Development Team
*/
'use strict';

/**
* util 모듈
* @module util
*/
var util = {
    uniqueId: 0,
    /**
     * HTML Attribute 설정 시 필요한 문자열을 가공한다.
     * @memberof module:util
     * @param {{key:value}} attributes  문자열로 가공할 attribute 데이터
     * @return {string} html 마크업에 포함될 문자열
     * @example
     var str = util.getAttributesString({
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
     * 배열의 합을 반환한다.
     * @memberof module:util
     * @param {number[]} list   총 합을 구할 number 타입 배열
     * @return {number} 합산한 결과값
     */
    sum: function(list) {
        return _.reduce(list, function(memo, value) {
            memo += value;
            return memo;
        }, 0);
    },

    /**
     * Return min and max value in array
     * @param {Array} arr
     * @returns {{min: number, max: number}}
     * @see {@link http://jsperf.com/getminmax}
     */
    getMinMax: function(arr) {
        return {
            min: Math.min.apply(null, arr),
            max: Math.max.apply(null, arr)
        };
    },

    /**
     * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
     * @memberof module:util
     * @param {number} rowCount  행 개수
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 계산된 높이
     */
    getHeight: function(rowCount, rowHeight) {
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
    },

    /**
     *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
     * @memberof module:util
     * @param {number} height 테이블 body 높이
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 테이블 body 당 보여지는 행 개수
     */
    getDisplayRowCount: function(height, rowHeight) {
        return Math.ceil((height - 1) / (rowHeight + 1));
    },

    /**
     * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
     * @memberof module:util
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
     * @memberof module:util
     * @param {*} target    동등 비교할 target
     * @param {*} dist      동등 비교할 dist
     * @return {boolean}    동일한지 여부
     */
    isEqual: function(target, dist) {
        var isDiff,
            compareObject = function(targetObj, distObj) {
                var result = false;

                tui.util.forEach(targetObj, function(item, key) {
                    result = (item === distObj[key]);
                    return result;
                });
                return result;
            };

        if (typeof target !== typeof dist) {
            return false;
        } else if (_.isArray(target) && target.length !== dist.length) {
            return false;
        } else if (_.isObject(target)) {
            isDiff = !compareObject(target, dist) || !compareObject(dist, target);
            return !isDiff;
        } else if (target !== dist) {
            return false;
        }
        return true;
    },

    /**
     * Returns whether the string blank.
     * @memberof module:util
     * @param {*} target - target object
     * @return {boolean} True if target is undefined or null or ''
     */
    isBlank: function(target) {
        if (_.isString(target)) {
            return !target.length;
        }
        return target === undefined || target === null;
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @memberof module:util
     * @param {string} htmlString   html 마크업 문자열
     * @return {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (tui.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(tui.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')));
        }
        return htmlString;
    },

    /**
     * Create unique key
     * @memberof module:util
     * @return {number} unique key 를 반환한다.
     */
    getUniqueKey: function() {
        this.uniqueId += 1;
        return this.uniqueId;
    },

    /**
     * object 를 query string 으로 변경한다.
     * @memberof module:util
     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
     * @return {string} 변환된 쿼리 문자열
     */
    toQueryString: function(dataObj) {
        var queryList = [];

        _.each(dataObj, function(value, name) {
            if (!_.isString(value) && !_.isNumber(value)) {
                value = $.toJSON(value);
            }
            value = encodeURIComponent(value);
            if (value) {
                queryList.push(name + '=' + value);
            }
        });

        return queryList.join('&');
    },

    /**
     * queryString 을 object 형태로 변형한다.
     * @memberof module:util
     * @param {String} queryString 쿼리 문자열
     * @return {Object} 변환한 Object
     */
    toQueryObject: function(queryString) {
        var queryList = queryString.split('&'),
            obj = {};

        _.each(queryList, function(query) {
            var tmp = query.split('='),
                key, value;

            key = tmp[0];
            value = decodeURIComponent(tmp[1]);
            try {
                value = $.parseJSON(value);
            } catch(e) {} // eslint-disable-line

            if (!_.isNull(value)) {
                obj[key] = value;
            }
        });

        return obj;
    },

    /**
     * type 인자에 맞게 value type 을 convert 한다.
     * Data.Row 의 List 형태에서 editOption.list 에서 검색을 위해,
     * value type 해당 type 에 맞게 변환한다.
     * @memberof module:util
     * @param {*} value 컨버팅할 value
     * @param {String} type 컨버팅 될 타입
     * @return {*}  타입 컨버팅된 value
     */
    convertValueType: function(value, type) {
        if (type === 'string') {
            return value.toString();
        } else if (type === 'number') {
            return +value;
        }
        return value;
    },

    /**
     * Capitalize first character of the target string.
     * @param  {string} string Target string
     * @return {string} Converted new string
     */
    toUpperCaseFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * Returns a number whose value is limited to the given range.
     * @param {Number} value - A number to force within given min-max range
     * @param {Number} min - The lower boundary of the output range
     * @param {Number} max - The upper boundary of the output range
     * @returns {number} A number in the range [min, max]
     * @Example
     *      // limit the output of this computation to between 0 and 255
     *      value = clamp(value, 0, 255);
     */
    clamp: function(value, min, max) {
        var temp;
        if (min > max) { // swap
            temp = min;
            min = max;
            max = temp;
        }
        return Math.max(min, Math.min(value, max));
    },

    /**
     * Returns whether the browser is IE7
     * @return {boolean} True if the browser is IE7
     */
    isBrowserIE7: function() {
        var browser = tui.util.browser;
        return browser.msie && browser.version === 7;
    }
};

module.exports = util;
