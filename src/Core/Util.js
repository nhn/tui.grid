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
         * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
         * @param {element} target HTML input 엘리먼트
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
         * html Tag 문자가 포함되었는지 확인
         * @param {String} string
         * @return {boolean}
         */
        hasTagString: function(string) {
            return /[<>&"']/.test(string);
        },
        /**
         * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
         * @param {string} htmlString
         * @return {*}
         */
        stripTags: function(htmlString) {
            htmlString = htmlString.replace(/[\n\r\t]/g, '');
            if (this.hasTagString(htmlString)) {
                if (/<img/.test(htmlString)) {
                    var matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/);
                    htmlString = matchResult ? matchResult[1] : '';
                } else {
                    htmlString = htmlString.replace(/<button.*?<\/button>/g, '');
                }
                htmlString = this.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, ''));
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
         * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
         * @method decodeHTMLEntity
         * @param {String} html HTML Entity 타입의 문자열
         * @return {String} 원래 문자로 변환된 문자열
         * @example
         var htmlEntityString = "A &#039;quote&#039; is &lt;b&gt;bold&lt;/b&gt;"
         var result = Util.decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
         */
        decodeHTMLEntity: function(html) {
            var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
            return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
                return entities[m0] ? entities[m0] : m0;
            });
        },
        /**
         * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
         * @method encodeHTMLEntity
         * @param {String} html 문자열
         * @return {String} html HTML Entity 타입의 문자열로 변환된 문자열
         * @example
         var htmlEntityString = "<script> alert('test');</script><a href='test'>"
         var result = Util.encodeHTMLEntity(htmlEntityString);
         //결과값 : "&lt;script&gt; alert('test');&lt;/script&gt;&lt;a href='test'&gt;"
         */
        encodeHTMLEntity: function(html) {
            var entities = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt', '\'': '#39'};
            return html.replace(/[<>&"']/g, function(m0) {
                return entities[m0] ? '&' + entities[m0] + ';' : m0;
            });
        },
        /**
         * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
         **/
        getFormData: function($form) {
            var result = {};
            var valueList = $form.serializeArray();

            $.each(valueList, function() {
                if (result[this.name] !== undefined) {
                    if (!result[this.name].push) {
                        result[this.name] = [result[this.name]];
                    }
                    result[this.name].push(this.value || '');
                } else {
                    result[this.name] = this.value || '';
                }
            });
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
            if ($form) {
                var formElement;
                if (elementName) {
                    formElement = $form.prop('elements')[elementName + ''];
                } else {
                    formElement = $form.prop('elements');
                }
                return $(formElement);
            }
        },
        /**
         * 파라미터로 받은 데이터 객체를 이용하여 폼에 값을 설정한다.
         *
         * @method setFormData
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {Object} formData 폼에 설정할 폼 데이터 객체
         **/
        setFormData: function($form, formData) {
            for (var x in formData) {
                if (formData.hasOwnProperty(x)) {
                    this.setFormElementValue($form, x, formData[x]);
                }
            }
        },
        /**
         * 배열의 값들을 전부 String 타입으로 변환한다.
         * @method _changeToStringInArray
         * @private
         * @param {Array}  arr 변환할 배열
         * @return {Array} 변환된 배열 결과 값
         */
        changeToStringInArray: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = String(arr[i]);
            }
            return arr;
        },
        /**
         * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
         * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
         * @method setValue
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
         * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
         **/
        setFormElementValue: function($form, elementName, formValue) {
            var i, j, index, targetOption;
            var elementList = this.getFormElement($form, elementName, true);
            if (!elementList) {
                return;
            }
            elementList = elementList.nodeType == 1 ? [elementList] : elementList;

            for (var i = 0, targetElement; i < elementList.length; i++) {
                targetElement = elementList[i];
                switch (targetElement.type) {
                    case 'radio':
                        targetElement.checked = (targetElement.value == formValue);
                        break;
                    case 'checkbox':
                        if ($.isArray(formValue)) {
                            targetElement.checked = $.inArray(targetElement.value, this.changeToStringInArray(formValue)) !== -1;
                        }else {
                            targetElement.checked = (targetElement.value == formValue);
                        }
                        break;
                    case 'select-one':
                        index = -1;
                        for (j = 0; j < targetElement.options.length; j++) {
                            targetOption = targetElement.options[j];
                            if (targetOption.value == formValue || targetOption.text == formValue) {
                                index = j;
                                continue;
                            }
                        }
                        targetElement.selectedIndex = index;
                        break;
                    case 'select-multiple':
                        if ($.isArray(formValue)) {
                            formValue = this.changeToStringInArray(formValue);
                            for (j = 0; j < targetElement.options.length; j++) {
                                targetOption = targetElement.options[j];
                                targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                                    $.inArray(targetOption.text, formValue) !== -1;
                            }
                        }else {
                            index = -1;
                            for (j = 0; j < targetElement.options.length; j++) {
                                targetOption = targetElement.options[j];
                                if (targetOption.value == formValue || targetOption.text == formValue) {
                                    index = j;
                                    continue;
                                }
                            }
                            targetElement.selectedIndex = index;
                        }
                        break;
                    default:
                        targetElement.value = formValue;
                }
            }
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
