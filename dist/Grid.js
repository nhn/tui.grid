(function(){
    if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};
    /**
     * define ddata container
     * @type {{Layout: {}, Data: {}, Cell: {}}}
     */
    var View = {
            CellFactory: null,
            Layout: {
            },
            Renderer: {
                Row: null,
                Cell: {}
            },
            Extra: {
            }
        },
        Model = {},
        Data = {},
        Collection = {};

    /**
     * Model Base Class
     */
    Model.Base = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });

        },

        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });
    /**
     * Collection Base Class
     */
    Collection.Base = Backbone.Collection.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });
        },
        clear: function() {
            this.each(function(model) {
                model.stopListening();
                model = null;
            });

            return this;
        },
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });

    /**
     * View base class
     */
    View.Base = Backbone.View.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid,
                __viewList: []
            });
        },
        error: function(message) {
            var error = function() {
                this.name = 'PugException';
                this.message = message || 'error';
//                this.methodName = methodName;
//                this.caller = arguments.caller;
            };
            error.prototype = new Error();
            return new error();
        },
        /**
         * setOwnPropertieserties
         *
         * @param {object} properties
         */
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        },

        /**
         * create view
         * @param {class} clazz
         * @param {object} params
         * @return {class} instance
         */
        createView: function(clazz, params) {
            var instance = new clazz(params);
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        addView: function(instance) {
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        destroy: function() {
            this.destroyChildren();
            this.remove();
        },

        destroyChildren: function() {
            if (this.__viewList instanceof Array) {
                while (this.__viewList.length !== 0) {
                    this.__viewList.pop().destroy();
                }
            }
        }
    });
    /**
     * Renderer Base Class
     */
    View.Base.Renderer = View.Base.extend({
        eventHandler: {},
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        /**
         * eventHandler 초기화
         * @private
         */
        _initializeEventHandler: function() {
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
        _attachHandler: function($el) {
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
        _detachHandler: function($el) {
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
        getHtml: function() {
            throw this.error('implement getHtml() method');
        }
    });
    /**
     * Cell Renderer Base
     */
    View.Base.Renderer.Cell = View.Base.Renderer.extend({
        cellType: 'normal',
        eventHandler: {},
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        initialize: function(attributes, options) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        baseTemplate: _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' <%=rowSpan%>' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            ' data-cell-type="<%=cellType%>"' +
            '>' +
            '<%=content%>' +
            '</td>'),
        onModelChange: function(cellData, $tr) {
            var $td = this._getCellElement(cellData.columnName, $tr),
                isRerender = false,
                isValueChanged = $.inArray('value', cellData.changed) !== -1,
                hasFocusedElement;

            this._setFocusedClass(cellData, $td);

            for (var i = 0; i < this.rerenderAttributes.length; i++) {
                if ($.inArray(this.rerenderAttributes[i], cellData.changed) !== -1) {
                    isRerender = true;
                    break;
                }
            }

            $td.attr('class', this._getClassNameList(cellData).join(' '));

            hasFocusedElement = !!($td.find(':focus').length);

            if (isRerender === true) {
                this.render(cellData, $td, hasFocusedElement);
                if (hasFocusedElement) {
                    this.focusIn($td);
                }
            } else {
                this.setElementAttribute(cellData, $td, hasFocusedElement);
            }


        },
        attachHandler: function($target) {
            this._attachHandler($target);
        },
        detachHandler: function($target) {
            this._detachHandler($target);
        },
        _setFocusedClass: function(cellData, $target) {
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },
        setElementAttribute: function(cellData, $td, $focused) {

        },
        render: function(cellData, $td, $focused) {
            this._detachHandler($td);
            $td.data('cell-type', this.cellType).html(this.getContentHtml(cellData, $td, $focused));
            this._attachHandler($td);
        },
        /**
         * cellData 정보에서 className 을 추출한다.
         * @param {Object} cellData
         * @return {Array}
         * @private
         */
        _getClassNameList: function(cellData) {
            var classNameList = [],
                classNameMap = {},
                columnName = cellData.columnName,
                privateColumnList = ['_button', '_number'],
                isPrivate = $.inArray(columnName, privateColumnList) !== -1,
                i, len;

            if (cellData.className) {
                classNameList.push(cellData.className);
            }
            if (cellData.selected === true) {
                classNameList.push('selected');
            }
            if (cellData.focused === true) {
                classNameList.push('focused');
            }
            if (cellData.isEditable === true && !isPrivate) {
                classNameList.push('editable');
            }
            if (cellData.isDisabled === true && !isPrivate) {
                classNameList.push('disabled');
            }

            len = classNameList.length;
            //중복제거
            for (i = 0; i < len; i++) {
                classNameMap[classNameList[i]] = true;
            }
            classNameList = [];
            _.each(classNameMap, function(val, className) {
                classNameList.push(className);
            }, this);
            return classNameList;
        },
        getHtml: function(cellData) {
            return this.baseTemplate({
                columnName: cellData.columnName,
                rowSpan: cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '',
                className: this._getClassNameList(cellData).join(' '),
                attributes: this.getAttributes(cellData),
                cellType: this.cellType,
                content: this.getContentHtml(cellData)
            });
        },
        getAttributesString: function(attributes) {
            var str = '';
            _.each(attributes, function(value, key) {
                str += ' ' + key + '="' + value + '"';
            }, this);
            return str;
        },
        getEventHandler: function() {
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getContentHtml: function(cellData) {
            return cellData.value;
        },
        /**
         * implement this.
         * @private
         */
        getAttributes: function(cellData) {
            return '';
        },
        _getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        _getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        _getCellElement: function(columnName, $tr) {
            return $tr.find('td[columnName="' + columnName + '"]');
        },
        _getCellData: function($tr) {
            return this.grid.renderModel.getCellData(this._getRowKey($tr), this._getColumnName($tr));
        },
        _getCellAddress: function($target) {
            return {
                rowKey: this._getRowKey($target),
                columnName: this._getColumnName($target)
            };
        }
    });

    View.Base.PluginInterface = View.Base.extend({
        $super: View.Base.PluginInterface,
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.$super.__plugin = this;
        },
        activate: function() {

        },
        render: function() {
            return this;
        },
        appendTo: function() {

        }
    });





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
        setCursorToEnd: function(targetEl) {
            targetEl.focus();
            var length = targetEl.value.length;

            if (targetEl.setSelectionRange) {
                targetEl.setSelectionRange(length, length);
            } else if (targetEl.createTextRange) {
                var range = targetEl.createTextRange();
                range.collapse(true);
                range.moveEnd('character', length);
                range.moveStart('character', length);
                range.select();
            }
        },
        isEqual: function(target, dist) {
            var i, len, pro;
            if ( typeof target !== typeof dist ) {
                return false;
            }

            if ( target instanceof Array ) {
                len = target.length;
                if (len !== dist.length){
                    return false;
                } else {
                    for (i = 0; i < len; i++) {
                        if (target[i] !== dist[i] ) {
                            return false;
                        }
                    }
                }
            } else if ( typeof target === 'object') {
                for (pro in target) {
                    if (target[pro] !== dist[pro] ) {
                        return false;
                    }
                }
            } else {
                if (target !== dist ) {
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
        encodeHTMLEntity: function(str) {
            var entities = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt', '\'': '#39'};
            return str.replace(/[<>&"']/g, function(m0) {
                return entities[m0] ? '&' + entities[m0] + ';' : m0;
            });
        }
    };

    /**
     * ColumnModel
     * @type {*|void}
     */
    Data.ColumnModel = Model.Base.extend({
        defaults: {
            keyColumnName: null,
            columnFixIndex: 0,  //columnFixIndex
            columnModelList: [],
            visibleList: [],

            columnModelMap: {},
            relationListMap: {}
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.on('change', this._onChange, this);

        },
        _appendDefaultColumn: function(data) {
            var columnModelList = $.extend(true, [], data),
                prependList = [],
                selectType = this.grid.option('selectType'),
                hasNumber = false,
                hasChecked = false,
                preparedColumnModel = {
                    '_number' : {
                        columnName: '_number',
                        title: 'No.',
                        width: 60
                    },
                    '_button' : {
                        columnName: '_button',
                        editOption: {
                            type: selectType,
                            list: [{
                                value: 'selected'
                            }]
                        },
                        width: 50
                    }
                };

            if (selectType === 'checkbox') {
                preparedColumnModel['_button'].title = '<input type="checkbox"/>';
            }else if (selectType === 'radio') {
                preparedColumnModel['_button'].title = '선택';
            }else {
                preparedColumnModel['_button'].isHidden = true;
            }

            _.each(columnModelList, function(columnModel, idx) {
                var columnName = columnModel.columnName;
                if (columnName === '_number') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_number']);
                    hasNumber = true;
                }else if (columnName === '_button') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_button']);
                    hasChecked = true;
                }
            }, this);

            if (!hasNumber) {
                prependList.push(preparedColumnModel['_number']);
            }
            if (!hasChecked) {
                prependList.push(preparedColumnModel['_button']);
            }
            columnModelList = _.union(prependList, columnModelList);
            return columnModelList;
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName
         * @param {Boolean} isVisible (default:true)
         * @return {number} index
         */
        indexOfColumnName: function(columnName, isVisible) {
            isVisible = (isVisible === undefined);
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList'),
                i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * index 에 해당하는 columnModel 을 반환한다.
         * @param {Number} index
         * @param {Boolean} isVisible
         * @returns {*}
         */
        at: function(index, isVisible) {
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return columnModelList[index];
        },
        /**
         * columnName 이 L Side 에 있는 column 인지 반환한다.
         * @param {String} columnName
         */
        isLside: function(columnName) {
            return this.get('columnFixIndex') > this.indexOfColumnName(columnName);
        },
        getVisibleColumnModelList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get('columnFixIndex');
            switch (whichSide) {
                case 'L':
                    columnModelList = this.get('visibleList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnModelList = this.get('visibleList').slice(columnFixIndex);
                    break;
                default :
                    columnModelList = this.get('visibleList');
                    break;
            }
            return columnModelList;
        },
        getColumnModel: function(columnName) {
            return this.get('columnModelMap')[columnName];
        },
        /**
         * 컬럼 모델로부터 editType 을 반환한다.
         * @param {string} columnName
         * @return {string}
         */
        getEditType: function(columnName) {
            var columnModel = this.getColumnModel(columnName);
            return (columnName === '_button') ? 'main' : columnModel && columnModel['editOption'] && columnModel['editOption']['type'];
        },
        _getVisibleList: function() {
            return _.filter(this.get('columnModelList'), function(item) {return !item['isHidden']});
        },
        /**
         * 각 columnModel 의 relationList 를 모아 relationListMap 를 생성하여 반환한다.
         * @return {*}
         * @private
         */
        _getRelationMart: function() {
            var columnModelList = this.get('columnModelList'),
                columnName, columnModel, relationList,
                relationListMap = {},
                i, len = columnModelList.length;

            for (i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];

                if (columnModelList[i].relationList) {
                    relationList = columnModelList[i].relationList;
                    relationListMap[columnName] = relationList;
                }
            }
            return relationListMap;

        },
        _onChange: function(model) {
            if (model.changed['columnModelList']) {
                this.set({
                    columnModelList: this._appendDefaultColumn(model.changed['columnModelList'])
                },{
                    silent: true
                });
            }
            var visibleList = this._getVisibleList();

            this.set({
                visibleList: visibleList,
                lsideList: visibleList.slice(0, this.get('columnFixIndex')),
                rsideList: visibleList.slice(this.get('columnFixIndex')),
                columnModelMap: _.indexBy(this.get('columnModelList'), 'columnName'),
                relationListMap: this._getRelationMart()
            }, {
                silent: true
            });
        }

    });

    /**
     * Row Data 모델
     * @class
     */
    Data.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null,
                'selected' : false,
                'focused' : ''
            }
        },
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 리턴한다.
         * @return {{isDisabled: boolean, isDisabledCheck: boolean}}
         * @private
         */
        getRowState: function() {
            var extraData = this.get('_extraData'),
                rowState = extraData && extraData['rowState'],
                isDisabledCheck = false,
                isDisabled = false,
                isChecked = false,
                classNameList = [];

            if (rowState) {
                switch (rowState) {
                    case 'DISABLED':
                        isDisabled = true;
                        break;
                    case 'DISABLED_CHECK':
                        isDisabledCheck = true;
                        break;
                    case 'CHECKED':
                        isChecked = true;
                }
            }
            isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;
            if (isDisabled) {
                classNameList.push('disabled');
            }

            return {
                isDisabled: isDisabled,
                isDisabledCheck: isDisabledCheck,
                isChecked: isChecked,
                classNameList: classNameList
            };
        },
        /**
         * getRowSpanData
         *
         * rowSpan 관련 data 가져온다.
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData'), defaultData;
            if (!columnName) {
                return extraData['rowSpanData'];
            }else {
                extraData = this.get('_extraData');
                defaultData = {
                    count: 0,
                    isMainRow: true,
                    mainRowKey: this.get('rowKey')
                };
                return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
            }
        },
        /**
         * html string 을 encoding 한다.
         * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
         *
         * @param {String} columnName
         * @return {String}
         * @private
         */
        getTagFiltered: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                editType = this.grid.columnModel.getEditType(columnName),
                value = this.get(columnName),
                notUseHtmlEntity = columnModel.notUseHtmlEntity;
            if (!notUseHtmlEntity && (!editType || editType === 'text') && Util.hasTagString(value)) {
                value = Util.encodeHTMLEntity(value);
            }
            return value;
        },
        /**
         * type 인자에 맞게 value type 을 convert 한다.
         * List 형태에서 editOption.list 에서 검색을 위해 value type 해당 type 에 맞게 변환한다.
         * @param {Number|String} value
         * @param {String} type
         * @return {Number|String}
         * @private
         */
        _convertValueType: function(value, type) {
            if (type === 'string') {
                return value.toString();
            } else if (type === 'number') {
                return parseInt(value, 10);
            } else {
                return value;
            }
        },
        /**
         * List type 의 경우 실제 데이터와 editOption.list 의 데이터가 다르기 때문에
         * text 로 전환해서 리턴할 때 처리를 하여 변환한다.
         *
         * @param {Number|String} value
         * @param {Object} columnModel
         * @return {string}
         * @private
         */
        _getListTypeVisibleText: function(value, columnModel) {
            var columnName = columnModel['columnName'],
                resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list,
                typeExpected, valueList;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                _.each(valueList, function(value, index) {
                    valueList[index] = this._convertValueType(value, typeExpected);
                }, this);
            }
            _.each(valueList, function(value, index) {
                valueList[index] = _.findWhere(editOptionList, {value: value}).text;
            }, this);

            return valueList.join(',');
        },
        /**
         * getRelationResult
         * 컬럼모델에 정의된 relation 을 수행한 결과를 반환한다.
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisable', 'isEditable'])
         * @return {{columnName: {attribute: resultValue}}}
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = callbackNameList || ['optionListChange', 'isDisable', 'isEditable'];

            var callback, attribute, columnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.toJSON(),
                relationListMap = this.grid.columnModel.get('relationListMap'),
                relationResult = {};

            //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
            // relationListMap 구조 {columnName : relationList}
            _.each(relationListMap, function(relationList, columnName) {
                value = rowData[columnName];

                //relationList 를 순회하며 수행한다.
                _.each(relationList, function(relation) {
                    columnList = relation.columnList;

                    //각 relation 에 걸려있는 콜백들을 수행한다.
                    _.each(callbackNameList, function(callbackName) {
                        callback = relation[callbackName];
                        if (typeof callback === 'function') {
                            attribute = '';
                            switch (callbackName) {
                                case 'optionListChange':
                                    attribute = 'optionList';
                                    break;
                                case 'isDisable':
                                    attribute = 'isDisabled';
                                    break;
                                case 'isEditable':
                                    attribute = 'isEditable';
                                    break;
                            }
                            if (attribute) {
                                //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                _.each(columnList, function(targetColumnName) {
                                    relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                    relationResult[targetColumnName][attribute] = callback(value, rowData);
                                }, this);
                            }
                        }
                    }, this);
                }, this);
            }, this);
            return relationResult;
        },
        /**
         * 화면에 보여지는 데이터를 반환한다.
         * @param {String} columnName
         * @return {*}
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
                    if (model.editOption && model.editOption.list && model.editOption.list[0].value) {
                        value = this._getListTypeVisibleText(value, model);
                    } else {
                       throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (typeof model.formatter === 'function') {
                        value = Util.stripTags(model.formatter(this.getTagFiltered(columnName), this.toJSON(), model));
                    }
                }
            }
            return value;
        }

    });
    /**
     * 실제 데이터 RowList 콜렉션
     * @class
     */
    Data.RowList = Collection.Base.extend({
        model: Data.Row,

        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _sortKey: 'rowKey',
//                _focused: {
//                    'rowKey' : null,
//                    'columnName' : ''
//                },
                _originalRowList: [],
                _startIndex: attributes.startIndex || 1,
                _privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.listenTo(this.grid.focusModel, 'change', this._onFocusChange, this);
            this.on('change', this._onChange, this);
            this.on('change:_button', this._onCheckChange, this);
    //            this.on('sort add remove reset', this._onSort, this);
            this.on('sort', this._onSort, this);
            this.on('all', this.test1, this);
        },
        test1: function() {
    //            console.log(arguments);
        },
        /**
         * rowKey 의 index를 가져온다.
         * @param {Number|String} rowKey
         * @return {Number}
         */
        indexOfRowKey: function(rowKey) {
            return this.indexOf(this.get(rowKey));
        },
        _onSort: function() {
            console.log('sort');
            this._refreshNumber();
        },
        _refreshNumber: function() {
            for (var i = 0; i < this.length; i++) {
                this.at(i).set('_number', this._startIndex + i, {silent: true});
            }
        },

        _isPrivateProperty: function(name) {
            return $.inArray(name, this._privateProperties) !== -1;
        },

        _onChange: function(row) {
            var getChangeEvent = function(row, columnName) {
                return {
                    'rowKey' : row.get('rowKey'),
                    'columnName' : columnName,
                    'columnData' : row.get(columnName)
                };
            };
            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    var columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) return;
                    var rowSpanData = row.getRowSpanData(columnName);

                    var changeEvent = getChangeEvent(row, columnName);
                    var obj;
                    //beforeChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
                        if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                            obj = {};
                            obj[columnName] = row.previous(columnName);
                            row.set(obj);
                            row.trigger('restore', {
                                changed: obj
                            });
                            return;
                        }
                    }
                    //sorted 가 되지 않았다면, rowSpan 된 데이터들도 함께 update
                    if (!this.isSortedByField()) {
                        if (!rowSpanData['isMainRow']) {
                            this.get(rowSpanData['mainRowKey']).set(columnName, value);
                        }else {
                            var index = this.indexOfRowKey(row.get('rowKey'));
                            for (var i = 0; i < rowSpanData['count'] - 1; i++) {
                                this.at(i + 1 + index).set(columnName, value);
                            }
                        }
                    }

                    changeEvent = getChangeEvent(row, columnName);
                    //afterChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                        columnModel.editOption.changeAfterCallback(changeEvent);
                    }
                    //check가 disable 이 아닐 경우에만.
                    if (!row.getRowState().isDisabledCheck) {
                        row.set('_button', true);
                    }
                }
            }, this);
        },
        _onCheckChange: function(row) {
            var columnModel = this.grid.columnModel.getColumnModel('_button'),
                selectType = this.grid.option('selectType'),
                rowKey = row.get('rowKey'),
                checkedList;
            if (selectType === 'radio') {
                checkedList = this.where({
                    '_button' : true
                });
                _.each(checkedList, function(checked, key) {
                    if (rowKey != checked.get('rowKey')) {
                        checked.set({
                            '_button' : false
                        }, {
                            silent: true
                        });
                    }
                });
            }
        },
        /**
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSortedByField: function() {
            return this._sortKey !== 'rowKey';
        },
        sortByField: function(fieldName) {
            this._sortKey = fieldName;
            this.sort();
        },
        comparator: function(item) {
            if (this.isSortedByField()) {
                return item.get(this._sortKey) * 1;
            }
        },
        /**
         * cell 값을 변경한다.
         * @param rowKey
         * @param columnName
         * @param columnValue
         * @param silent
         * @return {boolean}
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            var row = this.get(rowKey),
                obj = {};
            if (row) {
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        /**
         * column 에 해당하는 값을 전부 변경한다.
         * @param columnName
         * @param columnValue
         * @param silent
         */
        setColumnValue: function(columnName, columnValue, silent) {
            var obj = {};
            obj[columnName] = columnValue;
            this.forEach(function(row, key) {
                row.set(obj, {
                    silent: silent
                });
            }, this);
        },
        setExtraData: function(rowKey, value, silent) {
            var row = this.get(rowKey),
                obj = {}, extraData;

            if (row) {
                //적용
                extraData = _.clone(row.get('_extraData'));
                extraData = $.extend(extraData, value);
                obj['_extraData'] = extraData;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        _onFocusChange: function(focusModel) {
            console.log('onFocusChange', focusModel.changed);
            var selected = true,
                rowKey = focusModel.get('rowKey');
            _.each(focusModel.changed, function(value, name) {
                if (name === 'rowKey') {
                    if (value === null) {
                        value = focusModel.previous('rowKey');
                        selected = false;
                    }
                    this.setExtraData(value, { selected: selected});

                } else if (name === 'columnName') {
                    this.setExtraData(rowKey, { focused: value});
                }
            }, this);
        },

        parse: function(data) {
            this._originalRowList = this._parse(data);
            return this._originalRowList;
        },
        /**
         * 내부 변수를 제거한다.
         * @param rowList
         * @return {Array}
         * @private
         */
        _filterRowList: function(rowList) {
            var obj, filteredRowList = [];

            for (var i = 0, len = rowList.length; i < len; i++) {
                obj = {};
                //_로 시작하는 property 들은 제거한다.
                _.each(rowList[i], function(value, key) {
                    if (!this._isPrivateProperty(key)) {
                        obj[key] = value;
                    }
                }, this);
                filteredRowList.push(obj);
            }
            return filteredRowList;
        },
        /**
         * 수정된 rowList 를 반환한다.
         * @return {{inserted: Array, edited: Array, deleted: Array}}
         */
        getModifiedRowList: function() {
            var original = _.indexBy(this._filterRowList(this._originalRowList), 'rowKey'),
                current = _.indexBy(this._filterRowList(this.toJSON()), 'rowKey'),
                result = {
                    'inserted' : [],
                    'edited' : [],
                    'deleted' : []
                };

            // 추가/ 수정된 행 추출
            _.each(current, function(obj, rowKey) {
                if (!original[rowKey]) {
                    result.inserted.push(obj);
                }else if (JSON.stringify(obj) !== JSON.stringify(original[rowKey])) {
                    result.edited.push(obj);
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey) {
                if (!current[rowKey]) {
                    result.deleted.push(obj);
                }
            }, this);
            return result;
        },
        _parse: function(data) {
            var result = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName');

            function setExtraRowSpanData(extraData, columnName, rowSpanData) {
                extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
                extraData['rowSpanData'][columnName] = rowSpanData;
            }
            function isSetExtraRowSpanData(extraData, columnName) {
                return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
            }


            var count, rowKey, columnModel, rowState, extraData;


            for (var i = 0; i < result.length; i++) {
                rowKey = (keyColumnName === null) ? i : result[i][keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성

                result[i]['_extraData'] = result[i]['_extraData'] || {};

//                result[i]['_extraData']['rowState'] = (i % 5 === 0) ? 'DISABLED' : '';
//                result[i]['_extraData']['rowState'] = (i % 3 === 0) ? 'DISABLED_CHECK' : '';

                rowState = result[i]['_extraData'] && result[i]['_extraData']['rowState'];
                result[i]['rowKey'] = rowKey;
                result[i]['_button'] = rowState === 'CHECKED';
                if (!this.isSortedByField()) {
                    //extraData 의 rowSpanData 가공
                    if (result[i]['_extraData'] && result[i]['_extraData']['rowSpan']) {
                        for (var columnName in result[i]['_extraData']['rowSpan']) {
                            if (!isSetExtraRowSpanData(result[i]['_extraData'], columnName)) {
                                count = result[i]['_extraData']['rowSpan'][columnName];
                                setExtraRowSpanData(result[i]['_extraData'], columnName, {
                                    count: count,
                                    isMainRow: true,
                                    mainRowKey: result[i]['rowKey']
                                });
                                var subCount = -1;
                                for (var j = i + 1; j < i + count; j++) {
                                    //value 를 mainRow 의 값과 동일하게 설정
                                    result[j][columnName] = result[i][columnName];
                                    result[j]['_extraData'] = result[j]['_extraData'] || {};
                                    //rowSpan 값 변경
                                    setExtraRowSpanData(result[j]['_extraData'], columnName, {
                                        count: subCount--,
                                        isMainRow: false,
                                        mainRowKey: result[i]['rowKey']
                                    });
                                }
                            }
                        }
                    }
                }else {
                    if (result[i]['_extraData']) {
                        result[i]['_extraData']['rowSpan'] = null;
                    }
                }

            }
            return result;
        },
        _getEmptyRow: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList');
            var data = {};
            for (var i = 0; i < columnModelList.length; i++) {
                data[columnModelList[i]['columnName']] = '';
            }
            return data;
        },
        append: function(rowData, at) {
            at = at !== undefined ? at : this.length;

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get('key'),
                len = this.length,
                rowData = rowData || this._getEmptyRow();

            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._parse(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                modelList.push(new Data.Row(row));
            },this);
            this.add(modelList, {
                at: at,
                merge: true
            });
            this._refreshNumber();
        },
        prepend: function(rowData) {
            //리스트가 아닐경우 리스트 형태로 변경
            this.append(rowData, 0);
        }
    });

    /**
     * View 에서 Rendering 시 바라보는 객체
     * @type {*|void}
     */
    Model.Renderer = Model.Base.extend({
        defaults: {
            top: 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollLeft: 0,
            startIdx: 0,
            endIdx: 0,

            lside: null,
            rside: null
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRefresh: 0,
                isColumnModelChanged: false
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this);
            this.listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this);
            this.on('change', this.test, this);
            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList({
                grid: this.grid
            });
            var rside = new Model.RowList({
                grid: this.grid
            });
            this.set({
                lside: lside,
                rside: rside
            });
        },

        test: function(model) {
            console.log('change', model.changed);
        },
        getCollection: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var collection;
            switch (whichSide) {
                case 'L':
                    collection = this.get('lside');
                    break;
                case 'R':
                    collection = this.get('rside');
                    break;
                default :
                    collection = this.get('rside');
                    break;
            }
            return collection;
        },
        _onColumnModelChange: function() {
            this.set({
                'scrollTop' : 0,
                'top' : 0,
                'startIdx' : 0,
                'endIdx' : 0
            });
            this.isColumnModelChanged = true;
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
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
                'startIdx' : 0,
                'endIdx' : this.grid.dataModel.length - 1
            });
        },
        refresh: function() {
            this.trigger('beforeRefresh');

            this._setRenderingRange();
            //TODO : rendering 해야할 데이터만 가져온다.
            var len, i,
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, 'columnName'),

                lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex),

                lsideRowList = [],
                rsideRowList = [],

                lsideRow = [],
                rsideRow = [],
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');



            var start = new Date();

//            console.log('render', startIdx, endIdx);
            for (i = startIdx; i < endIdx + 1; i++) {
                var rowModel = this.grid.dataModel.at(i);
                var rowKey = rowModel.get('rowKey');
                //데이터 초기화
                lsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };
                rsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function(columnName) {
                    lsideRow[columnName] = rowModel.get(columnName);
                }, this);

                _.each(rsideColumnList, function(columnName) {
                    rsideRow[columnName] = rowModel.get(columnName);
                }, this);

                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
            this.get('lside').clear().reset(lsideRowList, {
                parse: true
            });
            this.get('rside').clear().reset(rsideRowList, {
                parse: true
            });

            i = startIdx;
            len = rsideRowList.length + startIdx;
            for (; i < len; i++) {
                this.executeRelation(i);
            }

            var end = new Date();
//            console.log('render done', end - start);
            if (this.isColumnModelChanged === true) {
                this.trigger('columnModelChanged');
                this.isColumnModelChanged = false;
            }else {
                this.trigger('rowListChanged');
            }

            this.trigger('afterRefresh');
        },
        /**
         * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
         * @param {String} columnName
         * @return {Collection}
         * @private
         */
        _getRowListDivision: function(columnName) {
            var lside = this.get('lside'),
                rside = this.get('rside');

            if (lside.at(0) && lside.at(0).get(columnName)) {
                return lside;
            } else {
                return rside;
            }
        },
        /**
         * CellData 를 가져온다.
         * @param rowKey
         * @param columnName
         * @returns {*}
         */
        getCellData: function(rowKey, columnName) {
            var collection = this._getRowListDivision(columnName),
                row = collection.get(rowKey);
            if (row) {
               return row.get(columnName);
            }
        },
        /**
         * rowIndex 에 해당하는 relation 을 수행한다.
         * @param {Number} rowIndex
         */
        executeRelation: function(rowIndex) {
            var relationResult = this.grid.dataModel.at(rowIndex).getRelationResult(),
                renderIdx = rowIndex - this.get('startIdx'),
                rowModel;

            _.each(relationResult, function(changes, columnName) {
                rowModel = this._getRowListDivision(columnName).at(renderIdx);
                if (rowModel) {
                    this._getRowListDivision(columnName).at(renderIdx).setCell(columnName, changes);
                }
            }, this);
        }

    });

    Model.Cell = Model.Base.extend({
        defaults: {
            rowKey: '',
            columnName: '',
            value: '',

            //Rendering properties
            rowSpan: 0,
            isMainRow: true,
            mainRowKey: '',
            isEditable: false,
            optionList: [],

            //Change attribute properties
            isDisabled: false,
            className: '',
            selected: false,
            focused: false
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _model: attributes._model || null,
                attrProperties: [
                    'isDisabled',
                    'className',
                    'selected',
                    'focused'
                ]

            });

            var columnName = attributes.columnName;

            //model 의 변경사항을 listen 한다.
            this.listenTo(this._model, 'change:' + columnName, this._onModelChange, this);
            this.on('change', this._onChange, this);

        },
        _onModelChange: function(row, value) {
            var columnModel = this.grid.columnModel.getColumnModel(this.get('columnName'));
            //@TODO : execute affect option

            if (columnModel.affectOption) {
                //@TODO:do AffectOption
            }

            this.set('value', value);
        },
        _onChange: function(cell) {
            var shouldRender = false;
            _.each(cell.changed, function(value, key) {
                if ($.inArray(key, this.attrProperties) === -1) {
                    shouldRender = true;
                }
            }, this);
            if (shouldRender === true) {
                this.trigger('render', cell);
            }else {
                this.trigger('changeAttr', cell);
            }
        },
        setValue: function(value) {
            this._model.set(this.get('columnName'), value);
        }
    });

    /**
     * 크기 관련 데이터 저장
     * @type {*|void}
     */
    Model.Dimension = Model.Base.extend({
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

            maxScrollLeft: 0
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel, 'change', this._onWidthChange);

            this.on('change:width', this._onWidthChange, this);
            this._setColumnWidth();
            this._setBodyHeight();
        },
        /**
         * 계산한 cell의 위치를 리턴한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {{top: *, left: number, right: *, bottom: *}}
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
                columnIdx = this.grid.columnModel.indexOfColumnName(columnName);



            if (!rowSpanData.isMainRow) {
                rowKey = rowSpanData.mainRowKey;
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
            }

            spanCount = rowSpanData.count || 1;

            rowIdx = dataModel.indexOfRowKey(rowKey);

            top = Util.getTBodyHeight(rowIdx, rowHeight);
            bottom = top + Util.getTBodyHeight(spanCount, rowHeight) - 1;

            if (columnFixIndex <= columnIdx) {
                i = columnFixIndex;
            }

            for (; i < columnIdx; i++) {
                left += columnWidthList[i] + 1;
            }

            right = columnWidthList[i] + 1;

            return {
                top: top,
                left: left,
                right: right,
                bottom: bottom
            };
        },
        /**
         * 현재 화면에 보이는 row 개수를 반환
         * @return {number}
         */
        getDisplayRowCount: function() {
            return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
        },
        /**
         * _onWidthChange
         *
         * width 값 변경시 각 column 별 너비를 계산하는 로직
         * @param {object} model
         * @private
         */
        _onWidthChange: function(model) {
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidth(this._calculateColumnWidthList(curColumnWidthList));
        },
        /**
         * scrollX 높이를 구한다.
         * @return {number}
         */
        getScrollXSize: function() {
            return !!this.grid.option('scrollX') * this.grid.scrollBarSize;
        },
        /**
         * body height 계산
         * @private
         */
        _setBodyHeight: function() {
            var height = Util.getTBodyHeight(this.grid.option('displayRowCount'), this.get('rowHeight'));
            //TODO scroll height 예외처리
            height += this.grid.scrollBarSize;
            this.set('bodyHeight', height);
        },
        /**
         * columnWidth 를 계산하여 저장한다.
         * @param {Array} columnWidthList
         * @private
         */
        _setColumnWidth: function(columnWidthList) {
            var rsideWidth, lsideWidth = 0,
                totalWidth = this.get('width'),
                columnFixIndex = this.columnModel.get('columnFixIndex');

            columnWidthList = columnWidthList || this._getOriginalWidthList();

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (i < columnFixIndex) {
                    lsideWidth += columnWidthList[i] + 1;
                }
            }
            lsideWidth += 1;
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth: rsideWidth,
                lsideWidth: lsideWidth,
                columnWidthList: columnWidthList
            });
            this.trigger('columnWidthChanged');
        },
        /**
         * 실제 너비를 계산한다.
         * @param {String} whichSide
         * @return {Number}
         */
        getTotalWidth: function(whichSide) {
            var columnWidthList = this.getColumnWidthList(whichSide),
                i, len = columnWidthList.length,
                totalWidth = 0;
            for (i = 0; i < len; i++) {
                totalWidth += columnWidthList[i] + 1;
            }
            return totalWidth;
        },
        /**
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index
         * @param {Number} width
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.grid.option('minimumColumnWidth'));
            var curColumnWidthList = this.get('columnWidthList'),
                calculatedColumnWidthList;

            curColumnWidthList[index] = width;
            calculatedColumnWidthList = this._calculateColumnWidthList(curColumnWidthList);
            this._setColumnWidth(calculatedColumnWidthList);
        },
        /**
         * L side 와 R side 에 따른 columnWidthList 를 반환한다.
         * @param {String} whichSide 생략했을 때 전체 columnList 반환
         * @return {Array}
         */
        getColumnWidthList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get('columnFixIndex');
            var columnList = [];

            switch (whichSide) {
                case 'L':
                    columnList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnList = this.get('columnWidthList');
                    break;
            }
            return columnList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         *
         * @return {Array}
         * @private
         */
        _getOriginalWidthList: function() {
            var columnModelList = this.columnModel.get('visibleList'),
                columnWidthList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                if (columnModelList[i].width) {
                    columnWidthList.push(columnModelList[i].width);
                }else {
                    columnWidthList.push(-1);
                }
            }

            return this._calculateColumnWidthList(columnWidthList);
        },

        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         *
         * @param {Array} columnWidthList
         * @return {Array}
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            var remainWidth, unassignedWidth, remainDividedWidth,
                newColumnWidthList = [],
                totalWidth = this.get('width'),
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (columnWidthList[i] > 0) {
                    width = Math.max(this.grid.option('minimumColumnWidth'), columnWidthList[i]);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                }else {
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }

            remainWidth = totalWidth - currentWidth;


            if (totalWidth > currentWidth && unassignedCount === 0) {
                newColumnWidthList[newColumnWidthList.length - 1] += remainWidth;
            }

            if (totalWidth > currentWidth) {
                remainWidth = totalWidth - currentWidth;
                unassignedWidth = Math.max(this.grid.option('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            }else {
                unassignedWidth = this.grid.option('minimumColumnWidth');
            }

            for (var i = 0, len = newColumnWidthList.length; i < len; i++) {
                if (newColumnWidthList[i] === -1) {
                    newColumnWidthList[i] = unassignedWidth;
                }
            }

            return newColumnWidthList;
        }
    });

    /**
     * Focus model
     * RowList collection 이 focus class 를 listen 한다.
     * @class
     */
    Model.Focus = Model.Base.extend({
        defaults: {
            rowKey: null,
            columnName: '',
            prevRowKey: null,
            prevColumnName: ''
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        _savePrevious: function() {
            if (this.get('rowKey') !== null) {
                this.set('prevRowKey', this.get('rowKey'));
            }
            if (this.get('columnName')) {
                this.set('prevColumnName', this.get('columnName'));
            }
        },
        _clearPrevious: function() {
            this.set({
                prevRowKey: null,
                prevColumnName: ''
            });
        },
        /**
         * 행을 select 한다.
         * @param {Number|String} rowKey
         * @return {Model.Focus}
         */
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            return this;
        },
        /**
         * 행을 unselect 한다.
         * @return {Model.Focus}
         */
        unselect: function() {
            this.set({
                'rowKey': null
            });
            return this;
        },
        /**
         * focus 처리한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @param {Boolean} isScrollable
         * @return {Model.Focus}
         */
        focus: function(rowKey, columnName, isScrollable) {
            console.log('#####focus', rowKey, columnName);
            rowKey = rowKey === undefined ? this.get('rowKey') : rowKey;
            columnName = columnName === undefined ? this.get('columnName') : columnName;
            this._savePrevious();

            if (rowKey !== this.get('rowKey')) {
                this.blur().select(rowKey);
            }
            if (columnName && columnName !== this.get('columnName')) {
                this.set('columnName', columnName);
            }
            if (isScrollable) {
                //todo scrolltop 및 left 값 조정하는 로직 필요.
                this._adjustScroll();
            }
            return this;
        },
        _adjustScroll: function() {
            var focused = this.which(),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName);


            if (position.top < scrollTop) {
                renderModel.set({
                    scrollTop: position.top
                });
            } else if (position.bottom > bodyHeight + scrollTop - (this.grid.option('scrollX') * this.grid.scrollBarSize)) {
                renderModel.set({
                    scrollTop: position.bottom - bodyHeight + (this.grid.option('scrollX') * this.grid.scrollBarSize)
                });
            }

            //스크롤 right 도 필요함.
            if (!this.grid.columnModel.isLside(focused.columnName)) {

            }

//            console.log(renderModel.get('scrollTop'), renderModel.get('scrollLeft'))

        },
        /**
         * blur 처리한다.
         * @return {Model.Focus}
         */
        blur: function() {
//            console.log("*********************************");
//            this._clearPrevious();
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
            return this;
        },
        /**
         * 현재 focus 정보를 반환한다.
         */
        which: function() {
            return {
                rowKey: this.get('rowKey'),
                columnName: this.get('columnName')
            };
        },
        /**
         * 현재 focus 정보를 index 기준으로 반환한다.
         */
        indexOf: function(isPrevious) {
            var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
                columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

            return {
                rowIdx: this.grid.dataModel.indexOfRowKey(rowKey),
                columnIdx: this.grid.columnModel.indexOfColumnName(columnName)
            };
        },
        /**
         * 현재 focus를 가지고 있는지 여부를 리턴한다.
         * @return {boolean}
         */
        has: function() {
            return !!(this.get('rowKey') !== undefined && this.get('columnName'));
        },
        /**
         * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
         * @param {Number} offset
         * @return {Number|String} rowKey
         */
        findRowKey: function(offset) {
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
         * @param {Number} offset
         * @return {String} columnName
         */
        findColumnName: function(offset) {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getVisibleColumnModelList();
            if (this.has()) {
                index = Math.max(Math.min(columnModel.indexOfColumnName(this.get('columnName')) + offset, columnModelList.length - 1), 0);
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        },
        /**
         * rowSpanData 를 반환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*}
         * @private
         */
        _getRowSpanData: function(rowKey, columnName) {
            return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
        },
        nextRowIndex: function(offset) {
            var rowKey = this.nextRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        prevRowIndex: function(offset) {
            var rowKey = this.prevRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        nextColumnIndex: function() {
            var columnName = this.nextColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        prevColumnIndex: function() {
            var columnName = this.prevColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        /**
         * keyEvent 발생 시 다음 rowKey 를 반환한다.
         * @return {Number|String}
         */
        nextRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                count, rowSpanData;

            offset = typeof offset === 'number' ? offset : 1;
            if (offset > 1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                    rowKey = this.findRowKey(rowSpanData.count);
                } else if (!rowSpanData.isMainRow) {
                    count = rowSpanData.count;
                    rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                    rowKey = this.findRowKey(rowSpanData.count + count);
                } else {
                    rowKey = this.findRowKey(1);
                }
            }
            return rowKey;
        },

        /**
         * keyEvent 발생 시 이전 rowKey 를 반환한다.
         * @return {Number|String}
         */
        prevRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                rowSpanData;
            offset = typeof offset === 'number' ? offset : 1;
            offset *= -1;

            if (offset < -1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count - 1);
                } else {
                    rowKey = this.findRowKey(-1);
                }
            }
            return rowKey;
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        nextColumnName: function() {
            return this.findColumnName(1);
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        prevColumnName: function() {
            return this.findColumnName(-1);
        }
    });

    Model.Renderer.Smart = Model.Renderer.extend({
        initialize: function() {
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onChange, this);
            this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);
            this.setOwnProperties({
                hiddenRowCount: 10,
                criticalPoint: 3
            });
        },
        _onChange: function() {
            if (this._isRenderable() === true) {
                this.refresh();
            }
        },
        /**
         * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
         * @private
         */
        _setRenderingRange: function() {
            var top,
                scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                endIdx = Math.min(this.grid.dataModel.length - 1,
                    Math.floor(startIdx + this.hiddenRowCount + displayRowCount + this.hiddenRowCount));
            if (!this.grid.isSorted()) {
                var minList = [];
                var maxList = [];
                _.each(this.grid.dataModel.at(startIdx).get('_extraData')['rowSpanData'], function(data, columnName) {
                    if (!data.isMainRow) {
                        minList.push(data.count);
                    }
                }, this);

                _.each(this.grid.dataModel.at(endIdx).get('_extraData')['rowSpanData'], function(data, columnName) {
                    if (data.count > 0) {
                        maxList.push(data.count);
                    }
                }, this);

                if (minList.length > 0) {
                    startIdx += Math.min.apply(Math, minList);
                }
                if (maxList.length > 0) {
                    endIdx += Math.max.apply(Math, maxList);
                }
            }

            top = (startIdx === 0) ? 0 : Util.getTBodyHeight(startIdx, rowHeight) - 1;

            this.set({
                top: top,
                startIdx: startIdx,
                endIdx: endIdx
            });

        },

        _isRenderable: function() {
            var scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                rowCount = this.grid.dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(this.grid.dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');
            console.log('#########GAP', endIdx - startIdx, displayRowCount);
            if ((startIdx !== 0 && startIdx + this.criticalPoint > displayStartIdx) ||
                endIdx !== rowCount - 1 && (endIdx < rowCount && (endIdx - this.criticalPoint < displayEndIdx))) {
                console.log(startIdx + this.criticalPoint, displayStartIdx);
                console.log(endIdx - this.criticalPoint, displayEndIdx);
                return true;
            }else {
                return false;
            }

        }
    });

    /**
     * row model
     * @type {*|void}
     */
    Model.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
            var rowKey = attributes && attributes['rowKey'];

            if (this.grid.dataModel.get(rowKey)) {
                this.listenTo(this.grid.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
                this.listenTo(this.grid.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
            }
        },
        /**
         * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
         * @param {Object} model
         * @private
         */
        _onDataModelChange: function(model) {
            _.each(model.changed, function(value, columnName) {
                if (columnName === '_extraData') {
                    // 랜더링시 필요한 정보인 extra data 가 변경되었을 때 rowSpan 된
                    // row model 에 연결된 focus, select, disable 를 업데이트 한다.
                    this.updateRowSpanned();
                }else {
                    this.setCell(columnName, {
                        value: value
                    });
                }
            }, this);
        },

        /**
         * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
         */
        updateRowSpanned: function(isRowSpanDataOnly) {
            if (this.collection) {
                var columnModel = this.grid.columnModel.getVisibleColumnModelList(),
                    model = this.grid.dataModel.get(this.get('rowKey')),
                    extraData = model.get('_extraData'),
                    selected = extraData['selected'] || false,
                    focusedColumnName = extraData['focused'],
                    rowState = model.getRowState(),
                    param;

                _.each(columnModel, function(column, key) {
                    var mainRowKey,
                        columnName = column['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        focused = (columnName === focusedColumnName),
                        isDisabled = columnName === '_button' ? rowState.isDisabledCheck : rowState.isDisabled;

                    if (cellData) {
                        if (!this.grid.isSorted()) {
                            if (!cellData['isMainRow']) {
                                rowModel = this.collection.get(cellData['mainRowKey']);
                            }
                        }

                        if (rowModel && !isRowSpanDataOnly || (isRowSpanDataOnly && !cellData['isMainRow'])) {
                            param = {
                                focused: focused,
                                selected: selected,
                                className: rowState.classNameList.join(' ')
                            };
                            if (isDisabled) {
                                param.isDisabled = true;
                            }
                            rowModel.setCell(columnName, param);
                        }
                    }
                }, this);
            }
        },
        parse: function(data) {
            //affect option 을 먼저 수행한다.
            var grid = this.collection.grid,
                dataModel = grid.dataModel,
                rowKey = data['rowKey'];

            _.each(data, function(value, columnName) {
                var rowSpanData,
                    focused = data['_extraData']['focused'] === columnName,
                    selected = !!data['_extraData']['selected'],
                    rowState = dataModel.get(rowKey).getRowState(),
                    isDisabled = rowState.isDisabled,
                    isEditable = grid.isEditable(rowKey, columnName),
                    defaultRowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };

                if (columnName !== 'rowKey' && columnName !== '_extraData') {

                    if (grid.isSorted()) {
                        rowSpanData = defaultRowSpanData;
                    }else {
                        rowSpanData = data['_extraData'] && data['_extraData']['rowSpanData'] && data['_extraData']['rowSpanData'][columnName] || defaultRowSpanData;
                    }
                    isDisabled = columnName === '_button' ? rowState.isDisabledCheck : isDisabled;

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
                        className: rowState.classNameList.join(' '),
                        focused: focused,
                        selected: selected,

                        changed: []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
//            this.executeAffectList(data);
            return data;
        },

        /**
         * Cell 의 값을 변경한다.
         * @param {String} columnName
         * @param {{key: value}} param
         */
        setCell: function(columnName, param) {
            if (this.get(columnName)) {
                var data = _.clone(this.get(columnName)),
                    isValueChanged = false,
                    changed = [],
                    rowIndex,
                    rowKey = this.get(columnName)['rowKey'];

                for (var name in param) {

                    if (!Util.isEqual(data[name], param[name])) {
                        isValueChanged = (name === 'value') ? true : isValueChanged;
                        data[name] = param[name];
                        changed.push(name);
                    }
                }
                if (changed.length) {
                    data['changed'] = changed;
                    this.set(columnName, data);
                    if (isValueChanged) {
                        //value 가 변경되었을 경우 relation 을 수행한다.
                        rowIndex = this.grid.dataModel.indexOfRowKey(rowKey);
                        this.grid.renderModel.executeRelation(rowIndex);
                    }
                }
            }
        }
    });

    /**
     * view model rowList collection
     * @type {*|void}
     */
    Model.RowList = Collection.Base.extend({
        model: Model.Row,
        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.on('reset', this._onReset, this);
        },
        _onReset: function() {
            var focused = this.grid.focusModel.which(),
                model = this.get(focused.rowKey);
            //랜더링시 rowSpan 된 view 들의 정보를 업데이트한다.
            if (model) {
                model.updateRowSpanned();
            }
        }

    });

    View.Layout.Frame = View.Base.extend({
        tagName: 'div',
        className: 'lside_area',
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
            this.setOwnProperties({
                header: null,
                body: null
            });
        },
        render: function() {
            this.destroyChildren();
            this.trigger('beforeRender');
            this.beforeRender();

            var header = this.header = this.createView(View.Layout.Header, {
                grid: this.grid,
                whichSide: this.whichSide
            });
            var body = this.body = this.createView(View.Layout.Body, {
                grid: this.grid,
                whichSide: this.whichSide
            });

            this.$el
                .append(header.render().el)
                .append(body.render().el);

            this.afterRender();
            this.trigger('afterRender');
            return this;
        },
        beforeRender: function() {
            //@TODO: override this function
        },
        afterRender: function() {
            //@TODO: override this function
        }
    });

















    /**
     * body layout 뷰
     *
     * @type {*|void}
     */
    View.Layout.Body = View.Base.extend({
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
            'scroll': '_onScroll',
            'mousedown': '_onMouseDown'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes && attributes.whichSide || 'R'
            });

            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)
                .listenTo(this.grid.renderModel, 'change:top', this._onTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);

        },
        _onBodyHeightChange: function(model, value) {
            this.$el.css('height', value + 'px');
        },
        /**
         * columnWidth change 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');
            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        /**
         * MouseDown event handler
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var focused, pos, selection = this.grid.selection;
            if (mouseDownEvent.shiftKey) {
                focused = this.grid.focusModel.indexOf(true);
                if (!selection.hasSelection()) {
                    selection.startSelection(focused.rowIdx, focused.columnIdx);
                }

                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
                pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
                selection.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
            } else {
                selection.endSelection();
                this.grid.selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * Scroll Event Handler
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            var obj = {};
            obj['scrollTop'] = scrollEvent.target.scrollTop;
            if (this.whichSide === 'R') {
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
            this.grid.renderModel.set(obj);
        },
        /**
         * Render model 의 Scroll left 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * Render model 의 Scroll top 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollTopChange: function(model, value) {
            this.el.scrollTop = value;
        },

        /**
         * Render model 의 top 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onTopChange: function(model, value) {
            this.$el.children('.table_container').css('top', value + 'px');
        },
        _onBeforeRefresh: function() {
            this.el.scrollTop = this.grid.renderModel.previous('scrollTop');
        },
        _getViewCollection: function() {
            return this.grid.renderModel.getCollection(this.whichSide);
        },
        render: function() {
            var selection, rowList;
            this.destroyChildren();
            this.$el.css({
                    height: this.grid.dimensionModel.get('bodyHeight')
                }).html(this.template({
                    colGroup: this._getColGroupMarkup()
                }));

            rowList = this.createView(View.RowList, {
                grid: this.grid,
                collection: this._getViewCollection(),
                el: this.$el.find('tbody'),
                whichSide: this.whichSide
            });
            rowList.render();

            //selection 을 랜더링한다.
            selection = this.addView(this.grid.selection.createLayer(this.whichSide));
            this.$el.append(selection.render().el);

            return this;
        },
        _getColGroupMarkup: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);

            var html = '';
            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        }
    });

    View.Layout.Frame.Lside = View.Layout.Frame.extend({
        className: 'lside_area',
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        },
        _onColumnWidthChanged: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                width: width + 'px'
            });
        },
        beforeRender: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                display: 'block',
                width: width + 'px'
            });
        }
    });

    /**
     * 우측 frame view
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend({
        className: 'rside_area',
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        },
        _onColumnWidthChanged: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');
            this.$el.css({
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        beforeRender: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');

            this.$el.css({
                display: 'block',
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        afterRender: function() {
            var virtualScrollBar,
                $space = $('<div></div>');
            $space.css({
                height: this.grid.dimensionModel.get('headerHeight') - 2
            }).addClass('space');
            this.$el.append($space);

            if (this.grid.option('notUseSmartRendering') === false) {
                virtualScrollBar = this.createView(View.Layout.Frame.Rside.VirtualScrollBar, {
                    grid: this.grid
                });
                this.$el.append(virtualScrollBar.render().el);
//                console.log(this.$el.html());
            }
        }
    });

    /**
     * virtual scrollbar
     *
     * @type {*|void|Object}
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend({
        tagName: 'div',
        className: 'virtual_scrollbar',

        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.dataModel, 'sort add remove reset', this._setHeight, this);
            this.listenTo(this.grid.dimensionModel, 'change', this._onDimensionChange, this);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);

        },
        template: _.template('<div class="content"></div>'),
        events: {
            'scroll' : '_onScroll'
        },
        _onScroll: function(scrollEvent) {
            this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
        },
        _onDimensionChange: function(model) {
            if (model.changed['headerHeight'] || model.changed['bodyHeight']) {
                this.render();
            }
        },

        _onScrollTopChange: function(model, value) {
            var scrollTop;
            this.el.scrollTop = value;
            scrollTop = this.el.scrollTop;
            if (scrollTop !== value) {
                this.grid.renderModel.set('scrollTop', scrollTop);
            }
        },
        render: function() {
            this.$el.css({
                height: this.grid.dimensionModel.get('bodyHeight') - this.grid.scrollBarSize,
                top: this.grid.dimensionModel.get('headerHeight'),
                display: 'block'
            }).html(this.template());
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 지정한다.
         * @private
         */
        _setHeight: function() {
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                rowCount = this.grid.dataModel.length,
                height = rowHeight * this.grid.dataModel.length + (rowCount + 1);
            this.$el.find('.content').height(height);
        }
    });

    /**
     * Header 레이아웃 View
     * @type {*|void}
     */
    View.Layout.Header = View.Base.extend({
        tagName: 'div',
        className: 'header',
        viewList: [],
        whichSide: 'R',
        events: {
            'click' : '_onClick'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.whichSide = attributes.whichSide;
            this.viewList = [];
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);

        },
        _onColumnWidthChanged: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');
//            console.log(columnWidthList[0],columnWidthList[1],columnWidthList[2]);

            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target);
            if ($target.closest('th').attr('columnname') === '_button') {

            }
        },
        template: _.template('' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody><%=tBody%></tbody>' +
                '    </table>'),
        render: function() {
            this.destroyChildren();
            var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
                whichSide: this.whichSide,
                grid: this.grid
            });
            this.$el.css({
                height: this.grid.dimensionModel.get('headerHeight')
            }).html(this.template({
                'colGroup' : this._getColGroupMarkup(),
                'tBody' : this._getTableBodyMarkup()
            }));


            this.$el.append(resizeHandler.render().el);
            return this;
        },

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
         * col group 마크업을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getColGroupMarkup: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                columnModelList = columnData.modelList,
                html = '';

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        },
        _getHeaderHeight: function() {
            return this.grid.dimensionModel.get('headerHeight');
        },
        /**
         * Header 의 body markup 을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getTableBodyMarkup: function() {
            var hierarchyList = this._getColumnHierarchyList();
            var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var columnData = this._getColumnData(),
                headerHeight = this._getHeaderHeight(),
                rowMarkupList = new Array(maxRowCount),
                headerMarkupList = [],
                height, curHeight;

            var columnModel, columnName = '', sRole = '', sHeight = '', colSpan = '', sRowSpan = '';
            var aColumnName = new Array(maxRowCount), colSpanList = [];
            var length, rowSpan = 1, title;
            var rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1;

            for (var i = 0; i < hierarchyList.length; i++) {
                length = hierarchyList[i].length;
                curHeight = 0;
                for (var j = 0; j < length; j++) {
                    rowSpan = (length - 1 == j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    columnModel = hierarchyList[i][j];

                    height = rowHeight * rowSpan;
                    if (j === length - 1) {
                        height = (headerHeight - curHeight) - 2;
                    }else {
                        curHeight += height + 1;
                    }
                    if (aColumnName[j] == columnModel['columnName']) {
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    }else {
                        colSpanList[j] = 1;
                    }
                    aColumnName[j] = columnModel['columnName'];
                    columnName = " columnName='" + columnModel['columnName'] + "'";
                    sHeight = " height='" + height + "'";
                    sRowSpan = rowSpan > 1 ? " rowSpan='" + rowSpan + "'" : '';
                    colSpan = (colSpanList[j] > 1) ? " colSpan='" + colSpanList[j] + "'" : '';
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    title = columnModel['title'];
                    rowMarkupList[j].push('<th'+ columnName + sRole + sHeight + sRowSpan + colSpan + '>'+ title + '</th>');
                }
            }
            for (var i = 0; i < rowMarkupList.length; i++) {
                headerMarkupList.push('<tr>'+ rowMarkupList[i].join('') + '</tr>');
            }

            return headerMarkupList.join('');
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param hierarchyList
         * @return {number}
         * @private
         */
        _getHierarchyMaxRowCount: function(hierarchyList) {
            var maxRowCount = 1,
                lengthList = [];
            _.each(hierarchyList, function(hierarchy, index) {
                lengthList.push(hierarchy.length);
            }, this);
            return Math.max.apply(Math, lengthList);
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
         * @return {Array}
         * @private
         */
        _getColumnHierarchyList: function() {
            var columnModelList = this._getColumnData().modelList;
            var hierarchyList = [];
            _.each(columnModelList, function(model, index) {
                hierarchyList.push(this._getColumnHierarchy(model).reverse());
            }, this);
            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param columnModelData
         * @param resultList
         * @return {*|Array}
         * @private
         */
        _getColumnHierarchy: function(columnModelData, resultList) {
            var columnMerge = this.grid.option('columnMerge'),
                resultList = resultList || [];

            if (columnModelData) {
                resultList.push(columnModelData);
                if (columnMerge) {
                    for (var i = 0; i < columnMerge.length; i++) {
                        if ($.inArray(columnModelData['columnName'], columnMerge[i]['columnNameList']) !== -1) {
                            resultList = this._getColumnHierarchy(columnMerge[i], resultList);
                        }
                    }
                }
            }
            return resultList;
        }
    });
    View.Layout.Header.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'resize_handle_container',
        viewList: [],
        whichSide: 'R',
        events: {
            'mousedown .resize_handle' : '_onMouseDown'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes.whichSide,
                isResizing: false,     //현재 resize 발생 상황인지
                $target: null,         //이벤트가 발생한 target resize handler
                differenceLeft: 0,
                initialWidth: 0,
                initialOffsetLeft: 0,
                initialLeft: 0
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        },
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
        _getResizeHandler: function() {
            var columnData = this._getColumnData(),
                columnModelList = columnData.modelList,
                resizeHandleMarkupList = [],
                headerHeight = this.grid.dimensionModel.get('headerHeight');

            for (var i = 0; i < columnModelList.length; i++) {
                resizeHandleMarkupList.push("<div columnIndex='" + i + "'" +
                    " columnName='" + columnModelList[i]['columnName'] +
                    "' class='resize_handle" +
                    (i + 1 == columnModelList.length ? ' resize_handle_last' : '') +
                    "' style='height:" + headerHeight + 'px;' +
//                    "background:red;opacity:1" +
                    "'" +
                    " title='마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,\n더블클릭을 통해 넓이를 초기화할 수 있습니다.'></div>");
            }
            return resizeHandleMarkupList.join('');

        },
        render: function() {
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    'marginTop' : -headerHeight + 'px',
                    'height' : headerHeight + 'px'
                })
                .html(this._getResizeHandler());
            this._refreshHandlerPosition();
            return this;
        },
        _refreshHandlerPosition: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $resizeHandleList = this.$el.find('.resize_handle'),
                curPos = 0;

            for (var i = 0, len = $resizeHandleList.length; i < len; i++) {
                curPos += columnWidthList[i] + 1;
                $resizeHandleList.eq(i).css('left', (curPos - 3) + 'px');
            }

        },

        _isResizing: function() {
            return !!this.isResizing;
        },
        _onMouseDown: function(mouseDownEvent) {
            this._startResizing(mouseDownEvent);
        },
        _onMouseUp: function(mouseUpEvent) {
            this._stopResizing();
            this.isResizing = false;
        },
        _onMouseMove: function(mouseMoveEvent) {
            if (this._isResizing()) {
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft;

                this.$target.css('left', left + 'px');

                var width = this._calculateWidth(mouseMoveEvent.pageX);
                var index = parseInt(this.$target.attr('columnindex'), 10);
                this.grid.dimensionModel.setColumnWidth(this._getColumnIndex(index), width);

            }
        },
        _calculateWidth: function(pageX) {
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        _getColumnIndex: function(index) {
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param mouseDownEvent
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
            this.grid.$el
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
            this.grid.$el
                .unbind('mousemove', $.proxy(this._onMouseMove, this))
                .unbind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'default');
        }
    });

    /**
     *  툴바 영역
     *  @class
     */
    View.Layout.Toolbar = View.Base.extend({
        tagName: 'div',
        className: 'toolbar',
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.destroyChildren();
            var option = this.grid.option('toolbar'),
                resizeHandler, controlPannel;

            this.$el.empty();
            if (option && option.hasControlPannel) {
                controlPannel = this.createView(View.Layout.Toolbar.ControlPannel, {
                    grid: this.grid
                });
                this.$el.append(controlPannel.render().el).css('display', 'block');
            }

            if (option && option.hasResizeHandler) {
                resizeHandler = this.createView(View.Layout.Toolbar.ResizeHandler, {
                    grid: this.grid
                });
                this.$el.append(resizeHandler.render().el).css('display', 'block');
            }
            return this;
        }
    });
    /**
     * 툴바 영역 resize handler
     * @class
     */
    View.Layout.Toolbar.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'height_resize_bar',
        events: {
            'mousedown': '_onMouseDown'
        },
        template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
        initialize: function() {
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
         * @param {event} mouseDownEvent
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
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var dimensionModel = this.grid.dimensionModel,
                offsetTop = dimensionModel.get('offsetTop'),
                headerHeight = dimensionModel.get('headerHeight'),
                rowHeight = dimensionModel.get('rowHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight'),
                bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXSize());
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
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
         * @return {boolean}
         * @private
         */
        _onSelectStart: function(e) {
            e.preventDefault();
            return false;
        },
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
    /**
     * control pannel
     * @class
     */
    View.Layout.Toolbar.ControlPannel = View.Base.extend({
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
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });



    /**
     * Row Renderer
     * 성능 향상을 위해 Row Rendering 을 위한 클래스 생성
     */
    View.Renderer.Row = View.Base.Renderer.extend({
        eventHandler: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        /**
         * TR 마크업 생성시 사용할 템플릿
         */
        baseTemplate: _.template('' +
            '<tr ' +
            'key="<%=key%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            'class="<%=className%>" ' +
            '</tr>'),
        /**
         * 초기화 함수
         * @param {object} attributes
         */
        initialize: function(attributes) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';

            this.setOwnProperties({
                $parent: attributes.$parent,        //부모 element
                collection: attributes.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
                cellHandlerList: [],
                _isEventAttached: false
            });

            //listener 등록
            this.collection.forEach(function(row) {
                this.listenTo(row, 'change', this._onModelChange, this);
            }, this);
        },
        destroy: function() {
            this.detachHandler();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandler
         * event handler 를 전체 tr에 한번에 붙인다.
         */
        attachHandler: function() {
            this._attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         */
        detachHandler: function() {
            if (this._isEventAttached) {
                this._detachHandler(this.$parent);
                this.grid.cellFactory.detachHandler(this.$parent);
            }
        },
        _onClick: function(clickEvent) {
            console.log('click', clickEvent);
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $td = $(mouseDownEvent.target).closest('td'),
                $tr = $(mouseDownEvent.target).closest('tr'),
                columnName = $td.attr('columnName'),
                rowKey = $tr.attr('key');
            this.grid.focus(rowKey, columnName);
            if (this.grid.option('selectType') === 'radio') {
                this.grid.checkRow(rowKey);
            }
        },
        /**
         * model 변경 시
         * @param {object} model
         * @private
         */
        _onModelChange: function(model) {
            var columnModel = this.grid.columnModel,
                editType, cellInstance, rowState;

            _.each(model.changed, function(cellData, columnName) {
                if (columnName !== '_extraData') {
                    //editable 프로퍼티가 false 라면 normal type 으로 설정한다.
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, this._getTrElement(cellData.rowKey));
                } else {
                    rowState = cellData.rowState;
                    if (rowState) {
                        this._setRowState(rowState, this._getTrElement(cellData.rowKey));
                    }
                }
            }, this);
        },
        _setRowState: function(rowState, $tr) {
//            $tr.addClass
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {string|number} rowKey
         * @return {jquery}
         * @private
         */
        _getTrElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 idEditable 프로퍼티에 따른 editType 을 반환한다.
         * @param {String} columnName
         * @param {Object} cellData
         * @return {String}
         * @private
         */
        _getEditType: function(columnName, cellData) {
            return !cellData.isEditable ? 'normal' : this.grid.columnModel.getEditType(columnName);
        },
        /**
         * html 마크업을 반환
         * @param {object} model
         * @return {string} html html 스트링
         */
        getHtml: function(model) {
            var columnModelList = this.columnModelList,
                columnModel = this.grid.columnModel,
                cellFactory = this.grid.cellFactory,
                columnName, cellData, editType, cellInstance,
                html = '';
            this.cellHandlerList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                cellData = model.get(columnName);
                if (cellData && cellData['isMainRow']) {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.cellHandlerList.push({
                        selector: 'td[columnName="' + columnName + '"]',
                        cellInstance: cellInstance
                    });
                }
            }
            return this.baseTemplate({
                key: model.get('rowKey'),
                height: this.grid.dimensionModel.get('rowHeight'),
                contents: html,
                className: ''
            });
        }
    });

    /**
     *  Cell Interface
     *  상속받아 cell renderer를 구현한다.
     */
    View.Base.Renderer.Cell.Interface = View.Base.Renderer.Cell.extend({
        /**
         * Cell factory 에서 전체 td에 eventHandler 를 attach, detach 할 때 구분자로 사용할 cellType
         */
        cellType: 'normal',
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록
         */
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        /**
         * event handler
         */
        eventHandler: {},
        initialize: function() {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력하여 focus 될 때 수행할 로직을 구현한다.
        },
        focusOut: function() {
            //todo: focus in 상태에서 키보드 esc 를 입력하여 focus out 될 때 수행할 로직을 필요에 따라 override 한다.
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * @param {object} cellData
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            //todo: rerenderAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        /**
         * model의 rerenderAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * @param {object} cellData
         * @param {jquery} $target
         */
        setElementAttribute: function(cellData, $target) {
            //todo: rerenderAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });



    /**
     *  Cell Abstract
     *  상속받아 cell renderer를 구현한다.
     */
    View.Base.Renderer.Cell.Abstract = View.Base.Renderer.Cell.extend({
        /**
         * Cell factory 에서 전체 td에 eventHandler 를 attach, detach 할 때 구분자로 사용할 cellType
         */
        cellType: 'normal',
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록
         */
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        /**
         * event handler
         */
        eventHandler: {},
        initialize: function() {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
        },
        focusOut: function($td) {
            //todo: focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직. 필요에 따라 override 한다.
            this.grid.focusClipboard();
        },
        /**
         *
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            var $target = $(keyDownEvent.target),
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['ESC']:
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    this.focusOut($target);
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동 후 편집모드로 전환
                    } else {
                        //이후 cell 로 focus 이동 후 편집모드로 전환
                    }
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * @param {object} cellData
         * @param {jquery} $td
         * @param {Boolean} hasFocusedElement
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData, $td, hasFocusedElement) {
            //todo: rerenderAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        /**
         * model의 re renderAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * @param {object} cellData
         * @param {jquery} $td
         * @param {Boolean} hasFocusedElement
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            //todo: rerenderAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });



    /**
     *  editOption 에 list 를 가지고 있는 형태의 추상 클래스
     * @type {*|void}
     */
    View.Renderer.Cell.List = View.Base.Renderer.Cell.Abstract.extend({
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
        },
        initialize: function() {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
        },
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        },
        _getOptionList: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
            return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
        },
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target);
            $target.closest('td').data('isFocused', false);
        },
        _onFocus: function(focusEvent) {
            var $target = $(focusEvent.target);
            $target.closest('td').data('isFocused', true);
        }
    });


    /**
     * editType select
     * @type {*|void}
     */
    View.Renderer.Cell.List.Select = View.Renderer.Cell.List.extend({
        cellType: 'select',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler: {
            'change select' : '_onChange',
            'keydown select' : '_onKeyDown',
            'blur select' : '_onBlur',
            'focus select' : '_onFocus'
        },

        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('select').focus();
        },
        getContentHtml: function(cellData, $td, hasFocusedElement) {
            console.log('!!!!getContentHtml', cellData.optionList);
            var list = this._getOptionList(cellData),
                html = '',
                isDisabled = cellData.isDisabled,
                len = list.length;

            html += '<select name="' + Util.getUniqueKey() + '"';
            html += isDisabled ? ' disabled ' : '';
            html += '>';

            for (var i = 0; i < len; i++) {
                html += '<option ';
                html += 'value="' + list[i].value + '"';

                if (cellData.value == list[i].value) {
                    html += ' selected';
                }
                html += ' >';
                html += list[i].text;
                html += '</option>';
            }
            html += '</select>';
            return html;

        },
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            console.log('!!!!setElementAttribute', cellData.optionList);
            var $select = $td.find('select');
            hasFocusedElement ? $select.blur() : null;
            $select.val(cellData.value);
            hasFocusedElement ? $select.focus() : null;

        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target),
                grid = this.grid;
            grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * editType = radio || checkbox
     * @type {*|void}
     */
    View.Renderer.Cell.List.Button = View.Renderer.Cell.List.extend({
        cellType: 'button',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler: {
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        template: {
            input: _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%> <%=disabled%> />'),
            label: _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('input').eq(0).focus();
        },
        _getNextInput: function($currentInput) {
            var $next = $currentInput;
            do{
                $next = $next.next();
            } while ($next.length && !$next.is('input'));
            return $next;
        },
        _getPrevInput: function($currentInput) {
            var $prev = $currentInput;
            do{
                $prev = $prev.prev();
            } while ($prev.length && !$prev.is('input'));
            return $prev;
        },
        /**
         *
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            var $target = $(keyDownEvent.target),
                $next, $prev,
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:

                    break;
                case keyMap['DOWN_ARROW']:

                    break;
                case keyMap['LEFT_ARROW']:
                    $prev = this._getPrevInput($target);
                    $prev.length ? $prev.focus() : null;
                    break;
                case keyMap['RIGHT_ARROW']:
                    $next = this._getNextInput($target);
                    $next.length ? $next.focus() : null;
                    break;
                case keyMap['ESC']:
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    $target.trigger('click');
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동 후 편집모드로 전환
                    } else {
                        //이후 cell 로 focus 이동 후 편집모드로 전환
                    }
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
        },
        getContentHtml: function(cellData) {
            var list = this._getOptionList(cellData),
                len = list.length,
                columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                html = '',
                name = Util.getUniqueKey(),
                isDisabled = cellData.isDisabled,
                id;

            for (var i = 0; i < len; i++) {
                id = name + '_' + list[i].value;
                html += this.template.input({
                    type: columnModel.editOption.type,
                    name: name,
                    id: id,
                    value: list[i].value,
                    checked: $.inArray('' + list[i].value, checkedList) === -1 ? '' : 'checked',
                    disabled: isDisabled ? 'disabled' : ''
                });
                if (list[i].text) {
                    html += this.template.label({
                        id: id,
                        text: list[i].text
                    });
                }
            }

            return html;
        },

        setElementAttribute: function(cellData, $td) {
            //TODO
            var value = cellData.value,
                checkedList = ('' + value).split(','),
                len = checkedList.length,
                i;
            $td.find('input:checked').prop('checked', false);
            for (i = 0; i < len; i++) {
                $td.find('input[value="' + checkedList[i] + '"]').prop('checked', true);
            }
        },
        _getEditType: function($target) {
            var columnName = this._getColumnName($target),
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                type = columnModel.editOption.type;

            return type;
        },
        _getCheckedList: function($target) {
            var $checkedList = $target.closest('td').find('input[type=' + this._getEditType($target) + ']:checked'),
                checkedList = [];

            for (var i = 0; i < $checkedList.length; i++) {
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);
            console.log('button _onChange', this._getCheckedList($target).join(','));
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target).join(','));
        }

    });

    /**
     * editOption 이 적용되지 않은 cell 의 renderer
     * @class
     */
    View.Renderer.Cell.Normal = View.Base.Renderer.Cell.Abstract.extend({
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
        },
        /**
         * Rendering 시 td 안에 들어가야 할 contentHtml string 을 반환한다
         * @param {object} cellData
         * @param {jQuery} $target
         * @return {String}
         */
        getContentHtml: function(cellData, $target) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(columnName),
                rowKey = cellData.rowKey;

            if (typeof columnModel.formatter === 'function') {
                value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).toJSON(), columnModel);
            }
            return value;
        },
        /**
         * model 의 onChange 시, innerHTML 변경 없이, element attribute 만 변경해야 할 때 수행된다.
         * @param {object} cellData
         * @param {jQuery} $target
         */
        setElementAttribute: function(cellData, $target) {
        }
    });

    /**
     * checkbox 혹은 radiobox 형태의 Main Button renderer
     * @class
     */
    View.Renderer.Cell.MainButton = View.Base.Renderer.Cell.Abstract.extend({
        /**
         * event Handler attach 하기 위한 cell type
         */
        cellType: 'main',
        /**
         * rendering 해야하는 cellData 의 변경 목록
         */
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'change input' : '_onChange'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
        },
        /**
         * rendering 시 사용할 template
         */
        template: _.template('<input type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%>/>'),
        /**
         * Rendering 시 td 안에 들어가야 할 contentHtml string 을 반환한다
         * @param {object} cellData
         * @param {jQuery} $target
         * @return {String}
         */
        getContentHtml: function(cellData, $target) {
            var isDisabled = cellData.isDisabled;
            return this.template({
                type: this.grid.option('selectType'),
                name: this.grid.id,
                checked: (!!cellData.value) ? 'checked' : '',
                disabled: isDisabled ? 'disabled' : ''
            });
        },
        setElementAttribute: function(cellData, $target) {
            $target.find('input').prop('checked', !!cellData.value);
        },
        getAttributes: function(cellData) {
            return this.getAttributesString({
                align: 'center'
            });
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            this.grid.setValue(rowKey, columnName, $target.prop('checked'));
        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!$target.is('input')) {
                $target.find('input').trigger('click');
            }
        }
    });

    /**
     * text-textbox 변환 가능한 cell renderer
     */
    View.Renderer.Cell.Text = View.Base.Renderer.Cell.Abstract.extend({
        cellType: 'text',
        rerenderAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        focusIn: function($td) {
            var $input = $td.find('input');
            this.originalText = $input.val();
            $input.focus();
            Util.setCursorToEnd($input.get(0));

        },
        focusOut: function() {
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName);
            return this.template({
                value: value,
                disabled: cellData.isDisabled ? 'disabled' : '',
                name: Util.getUniqueKey()
            });
        },
        setElementAttribute: function(cellData, $target) {
            $target.find('input').prop('disabled', cellData.isDisabled);
        },
        /**
         * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
         * @param {jQuery} $input
         * @return {Boolean}
         * @private
         */
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        /**
         * 원래 text로 값을 되돌린다.
         * @param {jQuery} $input
         * @private
         */
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            var $target = $(keyDownEvent.target),
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['ESC']:
                    this._restore($target);
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    this.focusOut($target);
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동
                    } else {
                        //이후 cell 로 focus 이동
                    }
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlur: function(blurEvent) {

            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
        }
    });


    /**
     * text-textbox 변환 가능한 cell renderer
     * @class
     */
    View.Renderer.Cell.Text.Convertible = View.Renderer.Cell.Text.extend({
        cellType: 'text-convertible',
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Renderer.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0
            });
        },
        focusIn: function($td) {
            this._startEdit($td);
        },
        focusOut: function($td) {
            this._endEdit($td);
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName),
                $td = this.grid.getCellElement(cellData.rowKey, cellData.columnName),
                isEdit = !!($td.length && $td.data('isEdit'));

            if (!isEdit) {
                return value;
            } else {
                return this.template({
                    value: value,
                    disabled: cellData.isDisabled ? 'disabled' : '',
                    name: Util.getUniqueKey()
                });
            }
        },
        /**
         * blur event handler
         * @param {event} blurEvent
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
         * @param {Element} $td
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input;
            if (!isEdit && this.grid.isEditable(this._getRowKey($td), this._getColumnName($td))) {
                $td.data('isEdit', true);
                this.render(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                $input.focus();
                Util.setCursorToEnd($input.get(0));
            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {Element} $td
         * @private
         */
        _endEdit: function($td) {
            var isEdit = $td.data('isEdit');
            if (isEdit) {
                $td.data('isEdit', false);
                this.render(this._getCellData($td), $td);
            }
        },
        /**
         * click Event handler
         * @param {event} clickEvent
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                $td = $target.closest('td'),
                isClicked = $td.data('clicked');

            if (isClicked) {
                this._startEdit($td);
            } else {
                $td.data('clicked', true);
                clearTimeout(this.timeoutIdForClick);
                this.timeoutIdForClick = setTimeout(function() {
                    $td.data('clicked', false);
                }, 400);
            }
        }
    });


    View.Extra.Log = View.Base.extend({
        events: {
            'click input' : 'clear'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                maxCount: 20,
                logs: [],
                buffer: '',
                lastTime: -1,
                timeoutIdForLogs: 0,
                width: 500,
                height: 200,
                opacity: 0.8
            });
        },
        activate: function() {
            if (this.grid.option('debug') === true) {
                this.listenTo(this.grid, 'afterRender', this.appendTo, this);
            }
        },
        appendTo: function() {
            this.grid.$el.append(this.render().el);
        },
        render: function() {
            this.$el.css({
                'position' : 'absolute',
                'right' : '25px',
                'top' : '25px',
                'opacity' : this.opacity,
                'background' : 'yellow',
                'width' : this.width + 'px',
                'height' : this.height + 'px',
                'overflow' : 'auto'
            });
            return this;
        },
        clear: function() {
//            this.buffer = '';
//            this.$el.html('');
        },
        write: function(text) {

            if (!this.buffer) {
                this.buffer = '';
            }
            clearTimeout(this.timeoutIdForLogs);
            var str = this.buffer;

            var d = new Date();
            var timeStamp = '['+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ';
            var elapsed = 0;

            if (this.lastTime > 0) {
                elapsed = d - this.lastTime;
            }

            this.lastTime = d;


            var lineList = str.split('<br>');
            if (lineList.length > this.maxCount) {
                lineList.pop();
            }

            lineList.unshift('<b>' + timeStamp + text + ' :elapsed [' + elapsed + ']</b>');
            this.buffer = lineList.join('<br>');
            this.timeoutIdForLogs = setTimeout($.proxy(function() {
                this.$el.html(this.buffer);
            }, this), 100);
        }
    });

    View.Extra.Selection = View.Base.extend({
        events: {
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
				whichSide: attributes && attributes.whichSide || 'R',
                lside: null,
                rside: null,
                range: {
                    column: [0, 1],
                    row: [2, 3]
                }
			});
        },
        activate: function() {
            this.listenTo(this.grid.view.rside, 'afterRender', this.appendToRside, 'a');
            this.listenTo(this.grid.view.lside, 'afterRender', this.appendToLside, 'b');
        },
        appendToRside: function() {
            this.rside = this.appendTo(this.grid.view.rside.body, View.Extra.Selection.Layer.Rside);
            this.show();
        },
        appendToLside: function() {
            this.lside = this.appendTo(this.grid.view.lside.body, View.Extra.Selection.Layer.Lside);

        },
        appendTo: function(view, clazz) {
//            var layer = new clazz({
//                grid : this.grid,
//                columnWidthList : this.grid.dimensionModel.getColumnWidthList(view.whichSide)
//            });
//            this.addView(layer);
//            view.$el.append(layer.render().el);
//            return layer;
        },


        startSelection: function(rowIndex, columnIndex) {
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
        },
        updateSelectionRange: function(rowIndex, columnIndex) {
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
        },
        endSelection: function() {
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
        },

        show: function() {
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                startRow = Math.min.apply(Math, this.range.row),
                endRow = Math.max.apply(Math, this.range.row),
                startColumn = Math.min.apply(Math, this.range.column),
                endColumn = Math.max.apply(Math, this.range.column),
                top = Util.getTBodyHeight(startRow, rowHeight),
                height = Util.getTBodyHeight(endRow - startRow, rowHeight) - 3;

            console.log('this.lside.$el', this.lside);
            this.lside.show(startRow, endRow, startColumn, endColumn);
            this.rside.show(startRow, endRow, startColumn, endColumn);

            this.lside.$el.css({
                top: top + 'px',
                width: 100 + 'px',
                height: height + 'px',
                display: 'block'
            });

//                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
//                columnWidthList = this.grid.dimensionModel.get('columnWidthList'),
//
//                top = Util.getTBodyHeight(startRow, rowHeight),
//                height = Util.getTBodyHeight(endRow-startRow, rowHeight) - 3;
//
//
//
//            //좌측 영역 랜더링
//
//
//            //우측 영역도 랜더링
//            if(endColumn >= columnFixIndex){
//
//            }
//
//            this.$el.css({
//                top : top+'px',
//                width : 100 + 'px',
//                height : height + 'px',
//                display: 'block'
//            });
        }
    });


    View.Extra.Selection.Layer = View.Base.extend({
        tagName: 'div',
        className: 'selection_layer',
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
			this.listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, 'change:top', this._onTopChange, this);
            this.setOwnProperties({
                columnWidthList: attributes.columnWidthList
            });
        },
        _onScrollTopChange: function() {

        },
        _onBeforeRefresh: function() {

        },
        _onTopChange: function() {

        },
        render: function() {
            console.log('@@Selection layer render');
            return this;
        }
    });

    View.Extra.Selection.Layer.Lside = View.Extra.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('LSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange: function() {

        },
        _onBeforeRefresh: function() {

        },
        _onTopChange: function() {
            console.log(this.$el.length);
        },
        show: function(startRow, endRow, startColumn, endColumn) {

        }
    });

    View.Extra.Selection.Layer.Rside = View.Extra.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('RSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange: function() {

        },
        _onBeforeRefresh: function() {

        },
        _onTopChange: function() {

        },
        show: function(startRow, endRow, startColumn, endColumn) {

        }
    });


    /**
     * Cell Factory
     */
    View.CellFactory = View.Base.extend({
        initialize: function(attributes, options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var args = {
                grid: this.grid
            };
            this._initializeInstances();
        },
        _initializeInstances: function() {
            var instances = {},
                args = {
                    grid: this.grid
                },
                instanceList = [
                    new View.Renderer.Cell.MainButton(args),
                    new View.Renderer.Cell.Normal(args),
                    new View.Renderer.Cell.Text(args),
                    new View.Renderer.Cell.List.Button(args),
                    new View.Renderer.Cell.List.Select(args),
                    new View.Renderer.Cell.Text.Convertible(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.cellType] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        getInstance: function(editType) {
            var instance = null;
            switch (editType) {
                case 'main' :
                    instance = this.instances[editType];
                    break;
                case 'text' :
                    instance = this.instances[editType];
                    break;
                case 'text-convertible' :
                    instance = this.instances[editType];
                    break;
                case 'select':
                    instance = this.instances[editType];
                    break;
                case 'radio' :
                case 'checkbox' :
                    instance = this.instances['button'];
                    break;
                default :
                    instance = this.instances['normal'];
                    break;
            }

            return instance;
        },
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                cellType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                cellType = $td.data('cell-type');
                this.instances[cellType].attachHandler($td);
            }
        },
        detachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                cellType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                cellType = $td.data('cell-type');
                this.instances[cellType].detachHandler($td);
            }
        }
    });

    /**
     * clipboard view class
     * @class
     */
    View.Clipboard = View.Base.extend({
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeydown',
            'focus': '_onFocus',
            'blur': '_onBlur'
        },
        /**
         * clipboard focus event handler
         * @private
         */
        _onFocus: function() {
            console.log('clipboard focus');
        },
        /**
         * clipboard blur event handler
         * @private
         */
        _onBlur: function() {
            console.log('clipboard blur');
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForCopy: 0,
                timeoutIdForKeyIn: 0,
                isLocked: false
            });
        },
        render: function() {
            this.$el.css({
                'top': 0,
                'left': 0,
                'width': '100px',
                'height': '100px'
            });
            return this;
        },
        _lock: function() {

        },
        _unlock: function() {

        },
        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeydown: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            if (this.isLocked) {
                keyDownEvent.prevetnDefault();
                return false;
            } else {
                clearTimeout(this.timeoutIdForKeyIn);
                this.isLocked = true;
                this.timeoutIdForKeyIn = setTimeout($.proxy(function(){
                    this.isLocked = false;
                }, this), 10);
                if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
                    this._keyInWithShiftAndCtrl(keyDownEvent);
                } else if (keyDownEvent.shiftKey) {
                    this._keyInWithShift(keyDownEvent);
                } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    this._keyInWithCtrl(keyDownEvent);
                } else {
                    this._keyIn(keyDownEvent);
                }
            }
        },
        /**
         * ctrl, shift 둘다 눌리지 않은 상태에서의 key down event 핸들러
         * @param {event} keyDownEvent
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
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            selection.endSelection();

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
                case keyMap['ENTER']:
                    this._focusIn(rowKey, columnName);
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
        },
        /**
         * Cell 을 편집모드로 전환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @private
         */
        _focusIn: function(rowKey, columnName){
            var grid = this.grid,
                cellInstance, cellData;
            if (grid.isEditable()) {
                cellInstance = grid.cellFactory.getInstance(grid.columnModel.getEditType(columnName));
                if (!grid.isSorted()) {
                    cellData = grid.renderModel.getCellData(rowKey, columnName);
                    rowKey = cellData.mainRowKey;
                }
                cellInstance.focusIn(grid.getCellElement(rowKey, columnName));
            }
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShiftAndCtrl: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    break;
                case keyMap['DOWN_ARROW']:
                    break;
                case keyMap['LEFT_ARROW']:
                    break;
                case keyMap['RIGHT_ARROW']:
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
        },
        /**
         * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
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
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                selection = this.grid.selection,
                focusModel = this.grid.focusModel,
                focused = this.grid.focusModel.indexOf(),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(), focused.columnIdx);
                    break;
                case keyMap['DOWN_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(), focused.columnIdx);
                    break;
                case keyMap['LEFT_ARROW']:
                    this._updateSelectionByKeyIn(focused.rowIdx, focusModel.prevColumnIndex());
                    break;
                case keyMap['RIGHT_ARROW']:
                    this._updateSelectionByKeyIn(focused.rowIdx, focusModel.nextColumnIndex());
                    break;
                case keyMap['PAGE_UP']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(displayRowCount - 1), focused.columnIdx);
                    break;
                case keyMap['PAGE_DOWN']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(displayRowCount - 1), focused.columnIdx);
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithCtrl: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['CHAR_A']:
                    this.grid.selection.selectAll();
                    break;
                case keyMap['CHAR_C']:
                    this._copyToClipboard();
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
        },
        /**
         * clipboard 의 String 을 반환한다.
         * @return {String}
         * @private
         */
        _getClipboardString: function() {
            var text,
                selection = this.grid.selection,
//                focused = this.grid.dataModel.getFocused();
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
        _copyToClipboard: function() {
            var text = this._getClipboardString();
            console.log(text);
            if (window.clipboardData) {
                if (window.clipboardData.setData('Text', text)) {
                    this.$el.select();
                }else {
                    this.$el.val('').select();
                }
            } else {
                this.$el.val(text).select();
            }
            this.timeoutIdForCopy = setTimeout($.proxy(function() {
                this.$el.val('');
            }, this), 0);
        }
    });


    /**
     * Collection 의 변화를 감지하는 클래스
     */
    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection: 0,
                rowRenderer: null
            });
            this._createRowRenderer();
            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },

        _createRowRenderer: function() {
            this.rowRenderer = this.createView(View.Renderer.Row, {
                grid: this.grid,
                $parent: this.$el,
                collection: this.collection,
                whichSide: this.whichSide
            });
        },
        render: function() {
            var html = '';
            var start = new Date();
            console.log('View.RowList.render start');
            this.rowRenderer.detachHandler();
            this.destroyChildren();
            this._createRowRenderer();
            //get html string
            this.collection.forEach(function(row) {
                html += this.rowRenderer.getHtml(row);
            }, this);
            this.$el.html('').prepend(html);
            this.rowRenderer.attachHandler();

            var end = new Date();
            console.log('View.RowList.addAll end', end - start);
            return this;
        }
    });

    /**
     *  selection layer 의 컨트롤을 담당하는 틀래스
     *  @class
     */
    View.Selection = View.Base.extend({
        events: {},
        initialize: function(attributes, option) {
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
                _isShown: false
            });
        },
        /**
         * 마우스 down 이벤트가 발생하여 selection 을 시작할 때, selection 영역을 계산하기 위해 document 에 이벤트 핸들러를 추가한다.
         * @param {Number} pageX
         * @param {Number} pageY
         */
        attachMouseEvent: function(pageX, pageY) {
            this.setOwnProperties({
                pageX: pageX,
                pageY: pageY
            });
            this.grid.updateLayoutData();
            $(document).on('mousemove', $.proxy(this._onMouseMove, this));
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
            $(document).on('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
         */
        detachMouseEvent: function() {
            clearInterval(this.intervalIdForAutoScroll);
            this.getSelectionToString();
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mouse move event handler
         * @param {event} mouseMoveEvent
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
         * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환.
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @return {boolean}
         * @private
         */
        _isAutoScrollable: function(overflowX, overflowY) {
            return !(overflowX === 0 && overflowY === 0);
        },
        /**
         *
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @private
         */
        _adjustScroll: function(overflowX, overflowY) {
            var renderModel = this.grid.renderModel,
                scrollLeft = renderModel.get('scrollLeft'),
                maxScrollLeft = renderModel.get('maxScrollLeft'),
                scrollTop = renderModel.get('scrollTop');
            if (overflowX < 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - 40), maxScrollLeft));
            } else if (overflowX > 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + 40), maxScrollLeft));
            }

            if (overflowY < 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop - 40));
            } else if (overflowY > 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop + 40));
            }
        },
        /**
         * mousedown 이 일어난 지점부터의 거리를 구한다.
         * @param {event} mouseMoveEvent
         * @return {number|*}
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
         * mouse up event handler
         * @param {event} mouseUpEvent
         * @private
         */
        _onMouseUp: function(mouseUpEvent) {
            this.detachMouseEvent();
        },
        /**
         * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{row: number, column: number, overflowX: number, overflowY: number}}
         */
        getIndexFromMousePosition: function(pageX, pageY) {
            var containerPos = this._getContainerPosition(pageX, pageY),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                columnWidthList = dimensionModel.getColumnWidthList(),
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                totalColumnWidth = dimensionModel.getTotalWidth(),
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
                rowIdx, columnIdx, i;


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
                for (i = 0; i < len; i++) {
                    curWidth += columnWidthList[i] + 1;
                    if (dataPosX <= curWidth) {
                        columnIdx = i;
                        break;
                    }
                }
            }

            return {
                row: rowIdx,
                column: columnIdx,
                overflowX: overflowX,
                overflowY: overflowY
            };
        },

        /**
         *  현재 selection 범위에 대한 string 을 반환한다.
         *  @return {String}
         */
        getSelectionToString: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(this.spannedRange.column[0], this.spannedRange.column[1] + 1),
                filteringMap = {
                    '_button': true
                },
                len = columnModelList.length,
                columnNameList = [],
                tmpString = [],
                strings = [],
                columnLen, i, j, rowList, string;

            for (i = 0; i < len; i++) {
                columnNameList.push(columnModelList[i]['columnName']);
            }
            rowList = this.grid.dataModel.slice(this.spannedRange.row[0], this.spannedRange.row[1] + 1);

            len = rowList.length;
            columnLen = columnNameList.length;
            for (i = 0; i < len; i++) {
                tmpString = [];
                for (j = 0; j < columnLen; j++) {
                    if (!filteringMap[columnNameList[j]]) {
                        tmpString.push(rowList[i].getVisibleText(columnNameList[j]));
                    }
                }
                strings.push(tmpString.join('\t'));
            }
            string = strings.join('\n');
            return string;
        },
        /**
         * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
         * @param {String} whichSide
         * @return {*}
         */
        createLayer: function(whichSide) {
            var clazz = whichSide === 'R' ? View.Selection.Layer.Rside : View.Selection.Layer.Lside,
                layer = this._getLayer(whichSide);

            layer && layer.destroy ? layer.destroy() : null;
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
            this.startSelection(0, 0);
            this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        },
        /**
         * selection 영역 선택을 시작한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        startSelection: function(rowIndex, columnIndex) {
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 확장한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        updateSelection: function(rowIndex, columnIndex) {
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
         */
        endSelection: function() {
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
            this.spannedRange.row[0] = this.spannedRange.row[1] = this.spannedRange.column[0] = this.spannedRange.column[1] = -1;
            this.hide();
        },
        /**
         * 현재 selection range 정보를 기반으로 selection Layer 를 노출한다.
         */
        show: function() {
            if (this.hasSelection()) {
                this._isShown = true;
                var tmpRowRange,
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
                if (!this.grid.isSorted()) {
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
            }
        },
        /**
         * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
         */
        hide: function() {
            this._isShown = false;
            this.lside.hide();
            this.rside.hide();
        },
        /**
         * 현재 selection 레이어가 노출되어 있는지 확인한다.
         * @return {boolean|*}
         */
        isShown: function() {
            return this._isShown;
        },
        /**
         * Selection Layer View 를 반환한다.
         * @param {String} whichSide
         * @return {*|View.Selection.rside}
         * @private
         */
        _getLayer: function(whichSide) {
            return whichSide === 'R' ? this.rside : this.lside;
        },
        /**
         * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{pageX: number, pageY: number}}
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
         * select start event handler
         * @param {event} selectStartEvent
         * @private
         */
        _onSelectStart: function(selectStartEvent) {
            selectStartEvent.preventDefault();
        },

        /**
         * selection 데이터가 존재하는지 확인한다.
         * @return {boolean}
         * @private
         */
        hasSelection: function() {
            return !(this.range.row[0] === -1);
        },

        /**
         * rowSpan 된 Index range 를 반환한다.
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         * @private
         */
        _getRowSpannedIndex: function(spannedRange) {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(spannedRange.column[0], spannedRange.column[1] + 1),
                dataModel = this.grid.dataModel,
                len = columnModelList.length,
                startIndexList = [spannedRange.row[0]],
                endIndexList = [spannedRange.row[1]],
                startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData(),
                endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData(),
                columnName, param,
                newSpannedRange = $.extend({}, spannedRange);

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

            for (var i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
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
            }

            newSpannedRange.row = [Math.min.apply(Math, startIndexList), Math.max.apply(Math, endIndexList)];

            return newSpannedRange;
        }
    });

    /**
     * 실제 selection layer view
     * @class
     */
    View.Selection.Layer = View.Base.extend({
        tagName: 'div',
        className: 'selection_layer',
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
            this.setOwnProperties({
                columnWidthList: attributes.columnWidthList,
                spannedRange: {
                    row: [-1, -1],
                    column: [-1, -1]
                },
                whichSide: 'R'
            });
        },
        _updateColumnWidthList: function() {
            this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
        },
        _onScrollTopChange: function() {

        },
        _onBeforeRefresh: function() {

        },
        /**
         * top 값과 height 값을 반환한다.
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         * @return {{display: string, width: string, height: string, top: string, left: string}}
         * @private
         */
        _getGeometryStyles: function(spannedRange) {
            spannedRange = spannedRange || this.indexObj;
            var style, i,
                columnWidthList = this.columnWidthList,
                rowRange = spannedRange.row,
                columnRange = spannedRange.column,
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
//                top = Util.getTBodyHeight(rowRange[0], rowHeight) + this.grid.renderModel.get('top'),
                top = Util.getTBodyHeight(rowRange[0], rowHeight) + 1,
                height = Util.getTBodyHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 3,
                len = columnWidthList.length,
                display = 'block',
                left = 0,
                width = 0;

            for (i = 0; i < columnRange[1] + 1 && i < len; i++) {
                if (i < columnRange[0]) {
                    left += columnWidthList[i] + 1;
                } else {
                    width += columnWidthList[i] + 1;
                }
            }
            width -= 1;

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
         *
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         */
        show: function(spannedRange) {
            this.indexObj = spannedRange;
            this.$el.css(this._getGeometryStyles(spannedRange));
        },
        /**
         * selection 을 숨긴다.
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
        render: function() {
            return this;
        }
    });
    /**
     * 왼쪽 selection layer
     * @class
     */
    View.Selection.Layer.Lside = View.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        }
    });
    /**
     * 오른쪽 selection layer
     * @class
     */
    View.Selection.Layer.Rside = View.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        }
    });



    var Grid = window.Grid = View.Base.extend({
        scrollBarSize: 17,
        minimumHeight: 150, //그리드의 최소 높이값
        lside: null,
        rside: null,
        toolbar: null,
        cellFactory: null,


        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
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
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var id = Util.getUniqueKey();
            this.__instance[id] = this;


            var defaultOptions = {
                debug: false,
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
                minimumWidth: 300,      //grid의 최소 너비

                scrollX: true,
                scrollY: true,
                useDataCopy: true,

                toolbar: {
                    hasResizeHandler: true,
                    hasControlPannel: true
                }
            };




            options = $.extend(true, defaultOptions, options);

            this.setOwnProperties({
                'cellFactory': null,
                'selection': null,
                'columnModel': null,
                'dataModel': null,
                'renderModel': null,
                'layoutModel': null,
                'focusModel': null,

                'view': {
                    'lside': null,
                    'rside': null,
                    'toolbar': null,
                    'clipboard': null
                },

                'id' : id,
                'options' : options,
                'timeoutIdForResize': 0
            });

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this._attachExtraEvent();

            this.render();

            this.updateLayoutData();

        },
        /**
         * event 속성에 정의되지 않은 이벤트 attach 하는 메서드
         * @private
         */
        _attachExtraEvent: function() {
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },
        /**
         * window resize  이벤트 핸들러
         * @param {event} resizeEvent
         * @private
         */
        _onWindowResize: function(resizeEvent) {
            clearTimeout(this.timeoutIdForResize);
            this.timeoutIdForResize = setTimeout($.proxy(function() {
                var width = Math.max(this.option('minimumWidth'), this.$el.css('width', '100%').width());
                this.dimensionModel.set('width', width);
            }, this), 100);
        },
        _initializeListener: function() {
            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
            this.listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight);
        },
        /**
         * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
         * @private
         */
        updateLayoutData: function() {
            var offset = this.$el.offset(),
                rsideTotalWidth = this.dimensionModel.getTotalWidth('R'),
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
         * width 변경시 layout data 를 update 한다.
         * @private
         */
        _onWidthChange: function() {
            this.updateLayoutData();
        },

        option: function(key, value) {
            if (value === undefined) {
                return this.options[key];
            }else {
                this.options[key] = value;
                return this;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target);
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select') || $target.is('label'))) {

            }
        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.focusClipboard();
                this.selection.show();
            }
        },
        focusClipboard: function() {
            this.view.clipboard.$el.focus();
        },
        /**
         * _initializeModel
         *
         * Initialize data model instances
         * @param options
         * @private
         */
        _initializeModel: function() {
            var offset = this.$el.offset();

            //define column model
            this.columnModel = new Data.ColumnModel({
                grid: this,
                keyColumnName: this.option('keyColumnName'),
                columnFixIndex: this.option('columnFixIndex')
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
                rowHeight: this.option('rowHeight')
            });

            // define focus model
            this.focusModel = new Model.Focus({
                grid: this
            });

            //define rowList
            this.dataModel = new Data.RowList({
                grid: this
            });



            if (this.option('notUseSmartRendering') === true) {
                this.renderModel = new Model.Renderer({
                    grid: this
                });
            }else {
                this.renderModel = new Model.Renderer.Smart({
                    grid: this
                });
            }

            this.cellFactory = this.createView(View.CellFactory, { grid: this });
        },
        /**
         * _initializeView
         *
         * Initialize view instances
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

            this.view.clipboard = this.createView(View.Clipboard, {
                grid: this
            });


        },

        _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },

        /**
         * render
         *
         * Rendering grid view
         */
        render: function() {
            this.trigger('beforeRender');

            this.$el.attr('instanceId', this.id)
                .append(this.view.lside.render().el)
                .append(this.view.rside.render().el)
                .append(this.view.toolbar.render().el)
                .append(this.view.clipboard.render().el);

            this._setHeight();
            this.trigger('afterRender');
        },
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
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSorted: function() {
            return this.dataModel.isSortedByField();
        },
        /**
         * rowKey 와 columnName 을 받아 edit 가능한 cell 인지를 반환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {Boolean}
         */
        isEditable: function(rowKey, columnName) {
            var focused = this.focusModel.which();

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;

            var columnModel = this.columnModel,
                dataModel = this.dataModel,
                editType = columnModel.getEditType(columnName),
                row, relationResult;

            if (!editType) {
                return false;
            } else {
                row = dataModel.get(rowKey);
                relationResult = row.getRelationResult()[columnName];
                return !(relationResult && (relationResult['isDisabled'] || relationResult['isEditable'] === false));
            }
        },
        /**
         * cell element (TD) 를 반환한다.
         * @param {Number|String}   rowKey
         * @param {String}  columnName
         * @return {Element}
         */
        getCellElement: function(rowKey, columnName) {
            var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
            return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
        },
        /**
         * setRowList
         *
         * set row list data
         * @param rowList
         */
        setRowList: function(rowList) {
            this.dataModel.set(rowList, {
                parse: true
            });
        },
        /**
         * setValue
         *
         * change cell value
         * @param rowKey
         * @param columnName
         * @param columnValue
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            //@TODO : rowKey to String
            this.dataModel.setValue(rowKey, columnName, columnValue, silent);
        },
        setColumnValue: function(columnName, columnValue, silent) {
            this.dataModel.setColumnValue(columnName, columnValue, silent);
        },
        /**
         * appendRow
         *
         * append row inside grid
         * @param row
         */
        appendRow: function(row) {
            this.dataModel.append(row);
        },
        /**
         * prependRow
         *
         * prepend row inside grid
         * @param row
         */
        prependRow: function(row) {
            this.dataModel.prepend(row);
        },
        /**
         * setColumnIndex
         *
         * change columnfix index
         * @param index
         */
        setColumnIndex: function(columnFixIndex) {
            this.option({
                columnFixIndex: columnFixIndex
            });
            this.columnModel.set({columnFixIndex: columnFixIndex});
        },
        setColumnModelList: function(columnModelList) {
            this.columnModel.set('columnModelList', columnModelList);
        },
        /**
         * sort by columnName
         *
         * @param columnName
         */
        sort: function(columnName) {
            this.dataModel.sortByField(columnName);
        },
        getRowList: function() {
            return this.dataModel.toJSON();
        },
        getCheckedRowList: function() {
            return this.dataModel.where({
                '_button' : true
            });
        },
        getCheckedRowKeyList: function() {
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row) {
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return rowKeyList;
        },
        getModifiedRowList: function() {
            return this.dataModel.getModifiedRowList();
        },
        disableCell: function(rowKey, columnName) {

        },
        enableCell: function(rowKey, columnName) {

        },
        setEditOptionList: function(rowKey, columnName, optionList) {

        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         */
        checkRow: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        /**
         * 전체 행을 선택한다
         */
        checkAllRow: function() {
            this.dataModel.setColumnValue('_button', true);
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택해제한다.
         */
        uncheckAllRow: function() {
            this.dataModel.setColumnValue('_button', false);
        },
        /**
         * rowKey, columnName에 해당하는 컬럼에 포커싱한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @param {Boolean} isScrollable
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.focusModel.focus(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {Number|String} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            this.focus(this.dataModel.at(rowIndex).get('rowKey'), this.columnModel.at(columnIndex)['columnName'], isScrollable);
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.focusModel.blur();
        },
        /**
         * @deprecated
         * @param whichSide
         * @return {*}
         * @private
         */
        _getDataCollection: function(whichSide) {
            return this.renderModel.get(whichSide);
        },

        destroy: function() {
            this.destroyChildren();
            this.$el.removeAttr('instanceId');
            this.stopListening();
            for (var property in this) {
                this[property] = null;
                delete this[property];
            }
        }

    });

    Grid.prototype.__instance = {};

    Grid.getInstanceById = function(id) {
        return this.prototype.__instance[id];
    };

View.Base.extend({

});
})();