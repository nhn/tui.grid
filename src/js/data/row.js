/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var ExtraDataManager = require('./extraDataManager');
var util = require('../common/util');

// Propertie names that indicate meta data
var PRIVATE_PROPERTIES = [
    '_button',
    '_number',
    '_extraData'
];

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module data/row
 */
var Row = Model.extend(/**@lends module:data/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.extraDataManager = new ExtraDataManager(this.get('_extraData'));

        this.columnModel = this.collection.columnModel;
        this.on('change', this._onChange, this);
    },

    idAttribute: 'rowKey',

    /**
     * Overrides Backbone's parse method for extraData not to be null.
     * @override
     * @param  {object} data - initial data
     * @return {object} - parsed data
     */
    parse: function(data) {
        if (!data._extraData) {
            data._extraData = {};
        }
        return data;
    },

    /**
     * Event handler for change event in _extraData.
     * Reset _extraData value with cloned object to trigger 'change:_extraData' event.
     */
    _triggerExtraDataChangeEvent: function() {
        this.trigger('extraDataChanged', this.get('_extraData'));
    },

    /**
     * rowData 변경 이벤트 핸들러.
     * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
     * @param {object} row  데이터의 키값
     * @private
     */
    _onChange: function() {
        var publicChanged = _.omit(this.changed, PRIVATE_PROPERTIES);

        if (this.isDuplicatedPublicChanged(publicChanged)) {
            return;
        }
        _.each(publicChanged, function(value, columnName) {
            var columnModel = this.columnModel.getColumnModel(columnName);
            if (!columnModel) {
                return;
            }
            if (!this._executeChangeBeforeCallback(columnName)) {
                return;
            }
            this.collection.syncRowSpannedData(this, columnName, value);
            this._executeChangeAfterCallback(columnName);
            if (!this.getRowState().isDisabledCheck && !columnModel.isIgnore) {
                this.set('_button', true);
            }
        }, this);
    },

    /**
     * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
     * @param {object} row row 모델
     * @param {String} columnName 컬럼명
     * @return {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}} changeCallback 에 전달될 이벤트 객체
     * @private
     */
    _createChangeCallbackEvent: function(columnName) {
        return {
            rowKey: this.get('rowKey'),
            columnName: columnName,
            value: this.get(columnName),
            instance: tui.Grid.getInstanceById(this.collection.gridId)
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
    _executeChangeBeforeCallback: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            changeEvent, obj;

        if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
            changeEvent = this._createChangeCallbackEvent(columnName);

            //beforeChangeCallback 의 결과값이 false 라면 restore 후 false 를 반환한다.
            if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                obj = {};
                obj[columnName] = this.previous(columnName);
                this.set(obj);
                this.trigger('restore', {
                    changed: obj
                });
                return false;
            }
        }
        return true;
    },

    /**
     * columnModel 에 정의된 changeAfterCallback 을 수행한다.
     * @param {object} row - row 모델
     * @param {String} columnName - 컬럼명
     * @return {boolean} changeAfterCallback 수행 결과값
     * @private
     */
    _executeChangeAfterCallback: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            changeEvent;

        if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
            changeEvent = this._createChangeCallbackEvent(columnName);
            return !!(columnModel.editOption.changeAfterCallback(changeEvent));
        }
        return true;
    },

    /**
     * Returns the Array of private property names
     * @return {array} An array of private property names
     */
    getPrivateProperties: function() {
        return PRIVATE_PROPERTIES;
    },

    /**
     * Returns the object that contains rowState info.
     * @return {{isDisabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
     */
    getRowState: function() {
        return this.extraDataManager.getRowState();
    },

    /**
     * row의 extraData에 설정된 classNameList 를 반환한다.
     * @param {String} [columnName] columnName 이 없을 경우 row 에 정의된 className 만 반환한다.
     * @return {Array} css 클래스 이름의 배열
     */
    getClassNameList: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            classNameList = this.extraDataManager.getClassNameList(columnName);

        if (columnModel.className) {
            classNameList.push(columnModel.className);
        }
        if (columnModel.isEllipsis) {
            classNameList.push('ellipsis');
        }
        return this._makeUniqueStringArray(classNameList);
    },

    /**
     * Returns a new array, which splits all comma-separated strings in the targetList and removes duplicated item.
     * @param  {Array} targetArray - Target array
     * @return {Array} - New array
     */
    _makeUniqueStringArray: function(targetArray) {
        var singleStringArray = _.uniq(targetArray.join(' ').split(' '));
        return _.without(singleStringArray, '');
    },

    /**
     * columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {{isEditable: boolean, isDisabled: boolean}} 편집 가능여부와 disabled 상태 정보
     */
    getCellState: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            columnModel = this.columnModel,
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
            editType = this.columnModel.getEditType(columnName),
            result = false;

        if ($.inArray(editType, notEditableTypeList) === -1) {
            result = this.getCellState(columnName).isEditable;
        }
        return result;
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
     * rowSpan 설정값을 반환한다.
     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
     * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
     */
    getRowSpanData: function(columnName) {
        var isRowSpanEnable = this.collection.isRowSpanEnable(),
            rowKey = this.get('rowKey');

        return this.extraDataManager.getRowSpanData(columnName, rowKey, isRowSpanEnable);
    },

    /**
     * rowSpanData를 설정한다.
     * @param {string} columnName - 컬럼명
     * @param {object} data - rowSpan 정보를 가진 객체
     */
    setRowSpanData: function(columnName, data) {
        this.extraDataManager.setRowSpanData(columnName, data);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowState 를 설정한다.
     * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
     * @param {boolean} silent 내부 change 이벤트 발생 여부
     */
    setRowState: function(rowState, silent) {
        this.extraDataManager.setRowState(rowState);
        if (!silent) {
            this._triggerExtraDataChangeEvent();
        }
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(columnName, className) {
        this.extraDataManager.addCellClassName(columnName, className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    addClassName: function(className) {
        this.extraDataManager.addClassName(columnName, className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        this.extraDataManager.removeCellClassName(columnName, className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        this.extraDataManager.removeClassName(className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * html string 을 encoding 한다.
     * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
     *
     * @param {String} columnName   컬럼명
     * @return {String} 인코딩된 결과값
     */
    getHTMLEncodedString: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            isTextType = this.columnModel.isTextType(columnName),
            value = this.get(columnName),
            notUseHtmlEntity = columnModel.notUseHtmlEntity;
        if (!notUseHtmlEntity && isTextType && tui.util.hasEncodableString(value)) {
            value = tui.util.encodeHTMLEntity(value);
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
            columnModel = this.columnModel.getColumnModel(columnName),
            resultOptionList, editOptionList, typeExpected, valueList;

        if (tui.util.isExisty(tui.util.pick(columnModel, 'editOption', 'list'))) {
            resultOptionList = this.getRelationResult(['optionListChange'])[columnName];
            editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                valueList = _.map(valueList, function(val) {
                    return util.convertValueType(val, typeExpected);
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
     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
     * @param {object} publicChanged 비교할 객체
     * @return {boolean} 중복이면 true, 아니면 false
     */
    isDuplicatedPublicChanged: function(publicChanged) {
        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
            return true;
        }
        clearTimeout(this._timeoutIdForChanged);
        this._timeoutIdForChanged = setTimeout(_.bind(function() {
            this._timeoutIdForChanged = null;
        }, this), 10);
        this._lastPublicChanged = publicChanged;

        return false;
    },

    /**
     * 복사 기능을 사용할 때 화면에 보여지는 데이터를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {String} 화면에 보여지는 데이터로 가공된 문자열
     */
    getVisibleText: function(columnName) {
        var columnModel = this.columnModel,
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
                if (tui.util.isExisty(tui.util.pick(model, 'editOption', 'list', 0, 'value'))) {
                    value = this._getListTypeVisibleText(columnName);
                } else {
                    throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                }
            } else if (_.isFunction(model.formatter)) {
                //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                value = util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
            }
        }
        value = !tui.util.isUndefined(value) ? value.toString() : value;
        return value;
    },

    /**
     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
     *
     * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisabled', 'isEditable'])
     * @return {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
     */
    getRelationResult: function(callbackNameList) {
        var rowData = this.attributes,
            relationListMap = this.columnModel.get('relationListMap'),
            relationResult = {},
            rowState = this.getRowState(),
            callback, attribute, targetColumnList, value;

        callbackNameList = (callbackNameList && callbackNameList.length) ?
            callbackNameList : ['optionListChange', 'isDisabled', 'isEditable'];

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
}, {
    privateProperties: PRIVATE_PROPERTIES
});

module.exports = Row;
