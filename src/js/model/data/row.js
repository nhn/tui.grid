/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var snippet = require('tui-code-snippet');

var Model = require('../../base/model');
var ExtraDataManager = require('./extraDataManager');
var GridEvent = require('../../event/gridEvent');

var util = require('../../common/util');
var clipboardUtil = require('../../common/clipboardUtil');
var classNameConst = require('../../common/classNameConst');

// Propertie names that indicate meta data
var PRIVATE_PROPERTIES = [
    '_button',
    '_number',
    '_extraData'
];

// Error code for validtaion
var VALID_ERR_REQUIRED = 'REQUIRED';
var VALID_ERR_TYPE_NUMBER = 'TYPE_NUMBER';

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module model/data/row
 * @extends module:base/model
 * @ignore
 */
var Row = Model.extend(/** @lends module:model/data/row.prototype */{
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.extraDataManager = new ExtraDataManager(this.get('_extraData'));

        this.columnModel = this.collection.columnModel;
        this.validateMap = {};
        this.on('change', this._onChange, this);
    },

    idAttribute: 'rowKey',

    /**
     * Overrides Backbone's set method for executing onBeforeChange before firing change event.
     * @override
     * @param {(Object|string)} key - Model's attribute(s)
     * @param {*} value - Model's value or options when type of key paramater is object
     * @param {?Object} options - The value of key or the options object
     */
    set: function(key, value, options) {
        var isObject = _.isObject(key);
        var changedColumns;

        // When the "key" parameter's type is object,
        // the "options" parameter is replaced by the "value" parameter.
        if (isObject) {
            options = value;
        }

        // When calling set method on initialize, the value of columnModel is undefined.
        if (this.columnModel && !(options && options.silent)) {
            if (isObject) {
                changedColumns = key;
            } else {
                changedColumns = {};
                changedColumns[key] = value;
            }

            _.each(changedColumns, function(columnValue, columnName) {
                if (!this._executeOnBeforeChange(columnName, columnValue)) {
                    delete changedColumns[columnName];
                }
            }, this);

            Backbone.Model.prototype.set.call(this, changedColumns, options);
        } else {
            Backbone.Model.prototype.set.apply(this, arguments);
        }
    },

    /**
     * Overrides Backbone's parse method for extraData not to be null.
     * @override
     * @param  {Object} data - initial data
     * @returns {Object} - parsed data
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
     * @private
     */
    _triggerExtraDataChangeEvent: function() {
        this.trigger('extraDataChanged', this.get('_extraData'));
    },

    /**
     * Event handler for change event in _button (=checkbox)
     * @param {boolean} checked - Checked state
     * @private
     */
    _triggerCheckboxChangeEvent: function(checked) {
        var eventObj = {
            rowKey: this.get('rowKey')
        };

        if (checked) {
            /**
             * Occurs when a checkbox in row header is checked
             * @event Grid#check
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the checked row
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('check', eventObj);
        } else {
            /**
             * Occurs when a checkbox in row header is unchecked
             * @event Grid#uncheck
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the unchecked row
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('uncheck', eventObj);
        }
    },

    /**
     * Event handler for 'change' event.
     * Executes callback functions, sync rowspan data, and validate data.
     * @private
     */
    _onChange: function() {
        var publicChanged = _.omit(this.changed, PRIVATE_PROPERTIES);

        if (_.has(this.changed, '_button')) {
            this._triggerCheckboxChangeEvent(this.changed._button);
        }

        if (this.isDuplicatedPublicChanged(publicChanged)) {
            return;
        }

        _.each(publicChanged, function(value, columnName) {
            var columnModel = this.columnModel.getColumnModel(columnName);

            if (!columnModel) {
                return;
            }

            this.collection.syncRowSpannedData(this, columnName, value);
            this._executeOnAfterChange(columnName);
            this.validateCell(columnName, true);
        }, this);
    },

    /**
     * Validate the cell data of given columnName and returns the error code.
     * @param  {Object} columnName - Column name
     * @returns {String} Error code
     * @private
     */
    _validateCellData: function(columnName) {
        var validation = this.columnModel.getColumnModel(columnName).validation;
        var errorCode = '';
        var value;

        if (validation) {
            value = this.get(columnName);

            if (validation.required && util.isBlank(value)) {
                errorCode = VALID_ERR_REQUIRED;
            } else if (validation.dataType === 'number' && !_.isNumber(value)) {
                errorCode = VALID_ERR_TYPE_NUMBER;
            }
        }

        return errorCode;
    },

    /**
     * Validate a cell of given columnName.
     * If the data is invalid, add 'invalid' class name to the cell.
     * @param {String} columnName - Target column name
     * @param {Boolean} isDataChanged - True if data is changed (called by onChange handler)
     * @returns {String} - Error code
     */
    validateCell: function(columnName, isDataChanged) {
        var errorCode;

        if (!isDataChanged && (columnName in this.validateMap)) {
            return this.validateMap[columnName];
        }

        errorCode = this._validateCellData(columnName);
        if (errorCode) {
            this.addCellClassName(columnName, classNameConst.CELL_INVALID);
        } else {
            this.removeCellClassName(columnName, classNameConst.CELL_INVALID);
        }
        this.validateMap[columnName] = errorCode;

        return errorCode;
    },

    /**
     * Create the GridEvent object when executing changeCallback defined on columnModel
     * @param {String} columnName - Column name
     * @param {?String} columnValue - Column value
     * @returns {GridEvent} Event object to be passed to changeCallback
     * @private
     */
    _createChangeCallbackEvent: function(columnName, columnValue) {
        return new GridEvent(null, {
            rowKey: this.get('rowKey'),
            columnName: columnName,
            value: columnValue,
            instance: this.collection.publicObject
        });
    },

    /**
     * Executes the onChangeBefore callback function.
     * @param {String} columnName - Column name
     * @param {String} columnValue - Column value
     * @returns {boolean}
     * @private
     */
    _executeOnBeforeChange: function(columnName, columnValue) {
        var columnModel = this.columnModel.getColumnModel(columnName);
        var changed = (this.get(columnName) !== columnValue);
        var gridEvent;

        if (changed && columnModel && columnModel.onBeforeChange) {
            gridEvent = this._createChangeCallbackEvent(columnName, columnValue);
            columnModel.onBeforeChange(gridEvent);

            return !gridEvent.isStopped();
        }

        return true;
    },

    /**
     * Execuetes the onAfterChange callback function.
     * @param {String} columnName - Column name
     * @returns {boolean}
     * @private
     */
    _executeOnAfterChange: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName);
        var columnValue = this.get(columnName);
        var gridEvent;

        if (columnModel.onAfterChange) {
            gridEvent = this._createChangeCallbackEvent(columnName, columnValue);
            columnModel.onAfterChange(gridEvent);

            return !gridEvent.isStopped();
        }

        return true;
    },

    /**
     * Returns the Array of private property names
     * @returns {array} An array of private property names
     */
    getPrivateProperties: function() {
        return PRIVATE_PROPERTIES;
    },

    /**
     * Returns the object that contains rowState info.
     * @returns {{disabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
     */
    getRowState: function() {
        return this.extraDataManager.getRowState();
    },

    /* eslint-disable complexity */
    /**
     * Returns an array of all className, related with given columnName.
     * @param {String} columnName - Column name
     * @returns {Array.<String>} - An array of classNames
     */
    getClassNameList: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName);
        var isMetaColumn = util.isMetaColumn(columnName);
        var classNameList = this.extraDataManager.getClassNameList(columnName);
        var cellState = this.getCellState(columnName);

        if (columnModel.className) {
            classNameList.push(columnModel.className);
        }
        if (columnModel.ellipsis) {
            classNameList.push(classNameConst.CELL_ELLIPSIS);
        }
        if (columnModel.validation && columnModel.validation.required) {
            classNameList.push(classNameConst.CELL_REQUIRED);
        }
        if (isMetaColumn) {
            classNameList.push(classNameConst.CELL_HEAD);
        } else if (cellState.editable) {
            classNameList.push(classNameConst.CELL_EDITABLE);
        }
        if (cellState.disabled) {
            classNameList.push(classNameConst.CELL_DISABLED);
        }

        return this._makeUniqueStringArray(classNameList);
    },
    /* eslint-enable complexity */

    /**
     * Returns a new array, which splits all comma-separated strings in the targetList and removes duplicated item.
     * @param  {Array} targetArray - Target array
     * @returns {Array} - New array
     */
    _makeUniqueStringArray: function(targetArray) {
        var singleStringArray = _.uniq(targetArray.join(' ').split(' '));

        return _.without(singleStringArray, '');
    },

    /**
     * Returns the state of the cell identified by a given column name.
     * @param {String} columnName - column name
     * @returns {{editable: boolean, disabled: boolean}}
     */
    getCellState: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            columnModel = this.columnModel,
            disabled = this.collection.disabled,
            editable = true,
            editType = columnModel.getEditType(columnName),
            rowState, relationResult;

        relationResult = this.executeRelationCallbacksAll(['disabled', 'editable'])[columnName];
        rowState = this.getRowState();

        if (!disabled) {
            if (columnName === '_button') {
                disabled = rowState.disabledCheck;
            } else {
                disabled = rowState.disabled;
            }
            disabled = disabled || !!(relationResult && relationResult.disabled);
        }

        if (_.contains(notEditableTypeList, editType)) {
            editable = false;
        } else {
            editable = !(relationResult && relationResult.editable === false);
        }

        return {
            editable: editable,
            disabled: disabled
        };
    },

    /**
     * Returns whether the cell identified by a given column name is editable.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isEditable: function(columnName) {
        var cellState = this.getCellState(columnName);

        return !cellState.disabled && cellState.editable;
    },

    /**
     * Returns whether the cell identified by a given column name is disabled.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isDisabled: function(columnName) {
        var cellState = this.getCellState(columnName);

        return cellState.disabled;
    },

    /**
     * getRowSpanData
     * rowSpan 설정값을 반환한다.
     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
     */
    getRowSpanData: function(columnName) {
        var isRowSpanEnable = this.collection.isRowSpanEnable(),
            rowKey = this.get('rowKey');

        return this.extraDataManager.getRowSpanData(columnName, rowKey, isRowSpanEnable);
    },

    /**
     * Returns the _extraData.height
     * @returns {number}
     */
    getHeight: function() {
        return this.extraDataManager.getHeight();
    },

    /**
     * Sets the height of the row
     * @param {number} height - height
     */
    setHeight: function(height) {
        this.extraDataManager.setHeight(height);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowSpanData를 설정한다.
     * @param {string} columnName - 컬럼명
     * @param {Object} data - rowSpan 정보를 가진 객체
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
     * rowKey에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {String} className 지정할 디자인 클래스명
     */
    addClassName: function(className) {
        this.extraDataManager.addClassName(className);
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
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        this.extraDataManager.removeClassName(className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
     * List type 의 경우 데이터 값과 editOptions.listItems 의 text 값이 다르기 때문에
     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
     *
     * @param {string} columnName - Column name
     * @param {boolean} useText - Whether returns concatenated text or values
     * @returns {string} Concatenated text or values of "listItems" option
     * @private
     */
    _getStringOfListItems: function(columnName, useText) {
        var value = this.get(columnName);
        var columnModel = this.columnModel.getColumnModel(columnName);
        var resultListItems, editOptionList, typeExpected, valueList, hasListItems;

        if (snippet.isExisty(snippet.pick(columnModel, 'editOptions', 'listItems'))) {
            resultListItems = this.executeRelationCallbacksAll(['listItems'])[columnName];
            hasListItems = resultListItems && resultListItems.listItems;
            editOptionList = hasListItems ? resultListItems.listItems : columnModel.editOptions.listItems;

            typeExpected = typeof editOptionList[0].value;
            valueList = util.toString(value).split(',');

            if (typeExpected !== typeof valueList[0]) {
                valueList = _.map(valueList, function(val) {
                    return util.convertValueType(val, typeExpected);
                });
            }

            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                var str = (item && (useText ? item.text : item.value)) || '';

                valueList[index] = str;
            }, this);

            return valueList.join(',');
        }

        return '';
    },

    /**
     * Returns whether the given edit type is list type.
     * @param {String} editType - edit type
     * @returns {Boolean}
     * @private
     */
    _isListType: function(editType) {
        return _.contains(['select', 'radio', 'checkbox'], editType);
    },

    /**
     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
     * @param {Object} publicChanged 비교할 객체
     * @returns {boolean} 중복이면 true, 아니면 false
     */
    isDuplicatedPublicChanged: function(publicChanged) {
        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
            return true;
        }
        clearTimeout(this._timeoutIdForChanged);
        this._timeoutIdForChanged = setTimeout(_.bind(function() {
            this._timeoutIdForChanged = null;
        }, this), 10); // eslint-disable-line no-magic-numbers
        this._lastPublicChanged = publicChanged;

        return false;
    },

    /**
     * Returns the text string to be used when copying the cell value to clipboard.
     * @param {string} columnName - column name
     * @returns {string}
     */
    getValueString: function(columnName) {
        var columnModel = this.columnModel;
        var copyText = columnModel.copyVisibleTextOfEditingColumn(columnName);
        var editType = columnModel.getEditType(columnName);
        var column = columnModel.getColumnModel(columnName);
        var value = this.get(columnName);

        if (this._isListType(editType)) {
            if (snippet.isExisty(snippet.pick(column, 'editOptions', 'listItems', 0, 'value'))) {
                value = this._getStringOfListItems(columnName, copyText);
            } else {
                throw new Error('Check "' + columnName +
                    '"\'s editOptions.listItems property out in your ColumnModel.');
            }
        } else if (editType === 'password') {
            value = '';
        }

        value = util.toString(value);

        // When the value is indcluding newline text,
        // adding one more quotation mark and putting quotation marks on both sides.
        value = clipboardUtil.addDoubleQuotes(value);

        return value;
    },

    /**
     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
     * @param {Array} attrNames 반환값의 결과를 확인할 대상 callbackList.
     *        (default : ['listItems', 'disabled', 'editable'])
     * @returns {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
     */
    executeRelationCallbacksAll: function(attrNames) {
        var rowData = this.attributes;
        var relationsMap = this.columnModel.get('relationsMap');
        var result = {};

        if (_.isEmpty(attrNames)) {
            attrNames = ['listItems', 'disabled', 'editable'];
        }

        _.each(relationsMap, function(relations, columnName) {
            var value = rowData[columnName];

            _.each(relations, function(relation) {
                this._executeRelationCallback(relation, attrNames, value, rowData, result);
            }, this);
        }, this);

        return result;
    },

    /**
     * Executes relation callback
     * @param {Object} relation - relation object
     *   @param {array} relation.targetNames - target column list
     *   @param {function} [relation.disabled] - callback function for disabled attribute
     *   @param {function} [relation.editable] - callback function for disabled attribute
     *   @param {function} [relation.listItems] - callback function for changing option list
     * @param {array} attrNames - an array of callback names
     * @param {(string|number)} value - cell value
     * @param {Object} rowData - all value of the row
     * @param {Object} result - object to store the result of callback functions
     * @private
     */
    _executeRelationCallback: function(relation, attrNames, value, rowData, result) {
        var rowState = this.getRowState();
        var targetNames = relation.targetNames;

        _.each(attrNames, function(attrName) {
            var callback;

            if (!rowState.disabled || attrName !== 'disabled') {
                callback = relation[attrName];
                if (typeof callback === 'function') {
                    _.each(targetNames, function(targetName) {
                        result[targetName] = result[targetName] || {};
                        result[targetName][attrName] = callback(value, rowData);
                    }, this);
                }
            }
        }, this);
    }
}, {
    privateProperties: PRIVATE_PROPERTIES
});

module.exports = Row;
