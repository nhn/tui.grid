/**
* @fileoverview 유틸리티 메서드 모음
* @author NHN Ent. FE Development Team
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
            var length = target.value.length,
                range;

            target.focus();
            if (target.setSelectionRange) {
                try {
                    target.setSelectionRange(length, length);
                } catch(e) {
                    // to prevent unspecified error in IE (occurs when running test)
                }
            } else if (target.createTextRange) {
                range = target.createTextRange();
                range.collapse(true);
                range.moveEnd('character', length);
                range.moveStart('character', length);
                try {
                     range.select();
                } catch(e) {
                     // to prevent unspecified error in IE (occurs when running test)
                }
            }
        }
    }
};
