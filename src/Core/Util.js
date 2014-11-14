    var Util = {
        /**
         * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
         * @param {number} rowCount
         * @param {number} rowHeight
         * @return {*}
         */
        getHeight: function(rowCount, rowHeight) {
            return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
        },
        /**
         *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
         *
         * @param {number} height
         * @param {number} rowHeight
         * @return {number}
         */
        getDisplayRowCount: function(height, rowHeight) {
            return Math.ceil((height - 1) / (rowHeight + 1));
        },
        /**
         * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
         *
         * @param {number} rowCount
         * @param {number} height
         * @return {number}
         */
        getRowHeight: function(rowCount, height) {
            return rowCount === 0 ? 0 : Math.floor(((height - 1) / rowCount)) - 1;
        },

        /**
         * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
         * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지 지원됨.
         * @param {*} target
         * @param {*} dist
         * @return {boolean}
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
         * @param {string} htmlString
         * @return {String}
         */
        stripTags: function(htmlString) {
            htmlString = htmlString.replace(/[\n\r\t]/g, '');
            if (ne.util.hasEncodableString(htmlString)) {
                if (/<img/.test(htmlString)) {
                    var matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/);
                    htmlString = matchResult ? matchResult[1] : '';
                } else {
                    htmlString = htmlString.replace(/<button.*?<\/button>/g, '');
                }
                htmlString = ne.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, ''));
            }
            return htmlString;
        },
        /**
         * Create unique key
         * @return {string}
         */
        getUniqueKey: function() {
            var rand = String(parseInt(Math.random() * 10000000000, 10));
            return new Date().getTime() + rand;
        },
        /**
         * object 를 query string 으로 변경한다.
         * @param {object} dataObj
         * @return {string} query string
         */
        toQueryString: function(dataObj) {
            var queryList = [];

            ne.util.forEach(dataObj, function(value, name) {
                if (typeof value !== 'string' && typeof value !== 'number') {
                    value = JSON.stringify(value);
                }
                value = encodeURIComponent(value);
                queryList.push(name + '=' + value);
            }, this);
            return queryList.join('&');
        },
        /**
         * queryString 을 object 형태로 변형한다.
         * @param {String} queryString
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
         * @param {*} value
         * @param {String} type
         * @return {*}      컨버팅된 value
         */
        convertValueType: function(value, type) {
            if (type === 'string') {
                return value.toString();
            } else if (type === 'number') {
                return +value;
            } else {
                return value;
            }
        }
    };
