    var Util = {
        getTBodyHeight: function(rowCount, rowHeight) {
            return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
        },
        getDisplayRowCount: function(tbodyHeight, rowHeight) {
            return Math.ceil((tbodyHeight - 1) / (rowHeight + 1));
        },
        getRowHeight: function(rowCount, tbodyHeight) {
            return Math.floor(((tbodyHeight - 1) / rowCount));
        },

        /**
         *
         * @param target
         * @param dist
         * @returns {boolean}
         */
        isEqual: function(target, dist) {
            var i, len, pro;
            if (typeof target !== typeof dist) {
                return false;
            }

            if (target instanceof Array) {
                len = target.length;
                if (len !== dist.length) {
                    return false;
                } else {
                    for (i = 0; i < len; i++) {
                        if (target[i] !== dist[i]) {
                            return false;
                        }
                    }
                }
            } else if (typeof target === 'object') {
                for (pro in target) {
                    if (target[pro] !== dist[pro]) {
                        return false;
                    }
                }
            } else {
                if (target !== dist) {
                    return false;
                }
            }
            return true;
        },
        /**
         * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
         * @param {string} htmlString
         * @return {*}
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
         * @private
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
            var name, val,
                queryList = [];

            for (name in dataObj) {
                val = dataObj[name];

                if (typeof val !== 'string' && typeof val !== 'number') {
                    val = JSON.stringify(val);
                }
                val = encodeURIComponent(val);
                queryList.push(name + '=' + val);
            }
            return queryList.join('&');
        },
        /**
         * queryString 을 object 형태로 변형한다.
         * @param {String} queryString
         * @return {Object} 변환한 Object
         */
        toQueryObject: function(queryString) {
            var queryList = queryString.split('&'),
                tmp, key, val, i, len = queryList.length,
                obj = {};
            for (i = 0; i < len; i++) {
                tmp = queryList[i].split('=');
                key = tmp[0];
                val = decodeURIComponent(tmp[1]);
                try {
                    val = $.parseJSON(val);
                } catch (e) {}
                obj[key] = val;
            }
            return obj;
        }

    };
