/**
* @fileoverview 유틸리티 메서드 모음
* @author NHN Ent. FE Development Team
*/

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var CELL_BORDER_WIDTH = require('./constMap').dimension.CELL_BORDER_WIDTH;
var util;

/**
 * Decode URI
 * @param {string} uri - URI
 * @param {boolean} mod - Whether maintaining "%25" or not
 * @returns {string} Decoded URI
 * @ignore
 */
function decodeURIComponentSafe(uri, mod) {
    var decodedURI = '';
    var i = 0;
    var length, arr, tempDecodedURI;

    mod = !!(mod);
    arr = uri.split(/(%(?:d0|d1)%.{2})/);

    for (length = arr.length; i < length; i += 1) {
        try {
            tempDecodedURI = decodeURIComponent(arr[i]);
        } catch (e) {
            tempDecodedURI = mod ? arr[i].replace(/%(?!\d+)/g, '%25') : arr[i];
        }

        decodedURI += tempDecodedURI;
    }

    return decodedURI;
}

/**
* util 모듈
* @module util
* @ignore
*/
util = {
    uniqueId: 0,
    /**
     * HTML Attribute 설정 시 필요한 문자열을 가공한다.
     * @memberof module:util
     * @param {{key:value}} attributes  문자열로 가공할 attribute 데이터
     * @returns {string} html 마크업에 포함될 문자열
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
     * @returns {number} 합산한 결과값
     */
    sum: function(list) {
        return _.reduce(list, function(memo, value) {
            memo += value;

            return memo;
        }, 0);
    },

    /**
     * Returns the minimum value and the maximum value of the values in array.
     * @param {Array} arr - Target array
     * @returns {{min: number, max: number}} Min and Max
     * @see {@link http://jsperf.com/getminmax}
     */
    getMinMax: function(arr) {
        return {
            min: Math.min.apply(null, arr),
            max: Math.max.apply(null, arr)
        };
    },

    /**
     * Convert a string value to number.
     * If the value cannot be converted to number, returns original value.
     * @param {string} str - string value
     * @returns {number|string}
     */
    strToNumber: function(str) {
        var converted = Number(str);

        return isNaN(converted) ? str : converted;
    },

    /**
     * Omits all undefined or null properties of given object.
     * @param {Object} obj - object
     * @returns {Object}
     */
    pruneObject: function(obj) {
        var pruned = {};
        _.each(obj, function(value, key) {
            if (!_.isUndefined(value) && !_.isNull(value)) {
                pruned[key] = value;
            }
        });

        return pruned;
    },

    /**
     * Returns the table height including height of rows and borders.
     * @memberof module:util
     * @param {number} rowCount - row count
     * @param {number} rowHeight - row height
     * @returns {number}
     */
    getHeight: function(rowCount, rowHeight) {
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + CELL_BORDER_WIDTH);
    },

    /**
     * Returns the total number of rows by using the table height and row height.
     * @memberof module:util
     * @param {number} tableHeight - table height
     * @param {number} rowHeight - individual row height
     * @returns {number}
     */
    getDisplayRowCount: function(tableHeight, rowHeight) {
        return Math.ceil(tableHeight / (rowHeight + CELL_BORDER_WIDTH));
    },

    /**
     * Returns the individual height of a row bsaed on the total number of rows and table height.
     * @memberof module:util
     * @param {number} rowCount - row count
     * @param {number} tableHeight - table height
     * @returns {number} 한 행당 높이값
     */
    getRowHeight: function(rowCount, tableHeight) {
        return rowCount === 0 ? 0 : Math.floor(((tableHeight - CELL_BORDER_WIDTH) / rowCount));
    },

    /**
     * Returns whether the column of a given name is meta-column.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isMetaColumn: function(columnName) {
        return _.contains(['_button', '_number'], columnName);
    },

    /**
     * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
     * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지만 지원함.
     * @memberof module:util
     * @param {*} target    동등 비교할 target
     * @param {*} dist      동등 비교할 dist
     * @returns {boolean}    동일한지 여부
     */
    isEqual: function(target, dist) { // eslint-disable-line complexity
        var compareObject = function(targetObj, distObj) {
            var result = false;

            snippet.forEach(targetObj, function(item, key) {
                result = (item === distObj[key]);

                return result;
            });

            return result;
        };
        var result = true;
        var isDiff;

        if (typeof target !== typeof dist) {
            result = false;
        } else if (_.isArray(target) && target.length !== dist.length) {
            result = false;
        } else if (_.isObject(target)) {
            isDiff = !compareObject(target, dist) || !compareObject(dist, target);

            result = !isDiff;
        } else if (target !== dist) {
            result = false;
        }

        return result;
    },

    /**
     * Returns whether the string blank.
     * @memberof module:util
     * @param {*} target - target object
     * @returns {boolean} True if target is undefined or null or ''
     */
    isBlank: function(target) {
        if (_.isString(target)) {
            return !target.length;
        }

        return _.isUndefined(target) || _.isNull(target);
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @memberof module:util
     * @param {string} htmlString   html 마크업 문자열
     * @returns {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (snippet.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=["']?([^>"']+)["']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(snippet.decodeHTMLEntity(
                htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?::[a-z]+)?)[^>]*>/ig, '')
            ));
        }

        return htmlString;
    },

    /**
     * Converts the given value to String and returns it.
     * If the value is undefined or null, returns the empty string.
     * @param {*} value - value
     * @returns {String}
     */
    toString: function(value) {
        if (_.isUndefined(value) || _.isNull(value)) {
            return '';
        }

        return String(value);
    },

    /**
     * Create unique key
     * @memberof module:util
     * @returns {number} unique key 를 반환한다.
     */
    getUniqueKey: function() {
        this.uniqueId += 1;

        return this.uniqueId;
    },

    /**
     * object 를 query string 으로 변경한다.
     * @memberof module:util
     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
     * @returns {string} 변환된 쿼리 문자열
     */
    toQueryString: function(dataObj) {
        var queryList = [];

        _.each(dataObj, function(value, name) {
            if (!_.isString(value) && !_.isNumber(value)) {
                value = JSON.stringify(value);
            }
            value = encodeURIComponent(unescape(value));
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
     * @returns {Object} 변환한 Object
     */
    toQueryObject: function(queryString) {
        var queryList = queryString.split('&'),
            obj = {};

        _.each(queryList, function(query) {
            var tmp = query.split('='),
                key, value;

            key = tmp[0];
            value = decodeURIComponentSafe(tmp[1]);

            try {
                value = JSON.parse(value);
            } catch(e) {} // eslint-disable-line

            if (!_.isNull(value)) {
                obj[key] = value;
            }
        });

        return obj;
    },

    /**
     * type 인자에 맞게 value type 을 convert 한다.
     * Data.Row 의 List 형태에서 editOptions.listItems 에서 검색을 위해,
     * value type 해당 type 에 맞게 변환한다.
     * @memberof module:util
     * @param {*} value 컨버팅할 value
     * @param {String} type 컨버팅 될 타입
     * @returns {*}  타입 컨버팅된 value
     */
    convertValueType: function(value, type) {
        var result = value;

        if (type === 'string') {
            result = String(value);
        } else if (type === 'number') {
            result = Number(value);
        } else if (type === 'boolean') {
            result = Boolean(value);
        }

        return result;
    },

    /**
     * Capitalize first character of the target string.
     * @param  {string} string Target string
     * @returns {string} Converted new string
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
     * Returns whether the given option is enabled. (Only for values the type of which can be Boolean or Object)
     * @param {*} option - option value
     * @returns {Boolean}
     */
    isOptionEnabled: function(option) {
        return _.isObject(option) || option === true;
    },

    /**
     * create style element and append it into the head element.
     * @param {String} id - element id
     * @param {String} cssString - css string
     */
    appendStyleElement: function(id, cssString) {
        var style = document.createElement('style');

        style.type = 'text/css';
        style.id = id;

        if (style.styleSheet) {
            style.styleSheet.cssText = cssString;
        } else {
            style.appendChild(document.createTextNode(cssString));
        }

        document.getElementsByTagName('head')[0].appendChild(style);
    },

    /**
     * Outputs a warning message to the web console.
     * @param {string} message - message
     */
    warning: function(message) {
        /* eslint-disable no-console */
        if (console && console.warn) {
            console.warn(message);
        }
        /* eslint-enable no-console */
    },

    /**
     * Replace text
     * @param {string} text - Text including handlebar expression
     * @param {Object} values - Replaced values
     * @returns {string} Replaced text
     */
    replaceText: function(text, values) {
        return text.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
            return values.hasOwnProperty(prop) ? values[prop] : '';
        });
    },

    /**
     * Detect right button by mouse event
     * @param {object} ev - Mouse event
     * @returns {boolea} State
     */
    isRightClickEvent: function(ev) {
        var rightClick;

        ev = ev || window.event;

        if (ev.which) {
            rightClick = ev.which === 3;
        } else if (ev.button) {
            rightClick = ev.button === 2;
        }

        return rightClick;
    }
};

module.exports = util;
