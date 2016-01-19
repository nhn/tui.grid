/**
 * @fileoverview RowList 클래스파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../common/util');

/**
 * Row Model
 * @module model/row
 */
var Row = Model.extend(/**@lends module:model/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     * @param  {object} attributes - Attributes
     * @param  {object} options - Options
     */
    initialize: function(attributes, options) {
        var rowKey = attributes && attributes['rowKey'],
            rowListData = this.collection.dataModel,
            rowData = rowListData.get(rowKey);

        if (rowData) {
            this.listenTo(rowData, 'change restore', this._onDataModelChange);
            this.listenTo(rowData, 'extraDataChanged', this._setRowExtraData);
            this.listenTo(rowListData, 'disabledChanged', this._onDataModelDisabledChanged);

            this.rowData = rowData;
        }
    },

    idAttribute: 'rowKey',

    /**
     * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
     * @param {Object} model    변경이 발생한 row 모델
     * @private
     */
    _onDataModelChange: function(model) {
        _.each(model.changed, function(value, columnName) {
            this.setCell(columnName, {
                value: value
            });
        }, this);
    },

    /**
     * Returns an array of visible column names.
     * @return {Array.<String>} Visible column names
     * @private
     */
    _getColumnNameList: function() {
        var columnModels = this.collection.columnModel.getVisibleColumnModelList(null, true);
        return _.pluck(columnModels, 'columnName');
    },

    /**
     * Returns whether the state of specified column is disabled.
     * @param  {String} columnName - Column name
     * @param  {{isEditable: boolean, isDisabled: boolean}} rowState - Row state
     * @return {Boolean} - True if disabled
     * @private
     */
    _isDisabled: function(columnName, rowState) {
        var isDisabled = this.collection.dataModel.isDisabled;

        if (!isDisabled) {
            isDisabled = (columnName === '_button') ? rowState.isDisabledCheck : rowState.isDisabled;
        }
        return isDisabled;
    },

    /**
     * Event handler for 'disabledChanged' event on dataModel
     */
    _onDataModelDisabledChanged: function() {
        var columnNames = this._getColumnNameList(),
            rowState = this.rowData.getRowState();

        _.each(columnNames, function(columnName) {
            this.setCell(columnName, {
                isDisabled: this._isDisabled(columnName, rowState)
            });
        }, this);
    },

    /**
     * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
     * @private
     */
    _setRowExtraData: function() {
        var dataModel = this.collection.dataModel,
            columnNames = this._getColumnNameList(),
            rowState = this.rowData.getRowState(),
            param;

        if (tui.util.isUndefined(this.collection)) {
            return;
        }

        _.each(columnNames, function(columnName) {
            var cellData = this.get(columnName),
                rowModel = this,
                isEditable, isDisabled;

            if (!tui.util.isUndefined(cellData)) {
                isEditable = this.rowData.isEditable(columnName);
                isDisabled = this._isDisabled(columnName, rowState);
                if (dataModel.isRowSpanEnable() && !cellData['isMainRow']) {
                    rowModel = this.collection.get(cellData['mainRowKey']);
                }
                if (rowModel) {
                    param = {
                        isDisabled: isDisabled,
                        isEditable: isEditable,
                        className: this.rowData.getClassNameList(columnName).join(' ')
                    };
                    rowModel.setCell(columnName, param);
                }
            }
        }, this);
    },

    /**
     * Backbone 이 model 생성 시 내부적으로 parse 를 호출하여 데이터를 형식에 맞게 가공한다.
     * @param {Array} data  원본 데이터
     * @override
     * @return {Array}  형식에 맞게 가공된 데이터
     */
    parse: function(data, options) {
        return this._formatData(data, options.collection.dataModel);
    },

    /**
     * 데이터를 View 에서 사용할 수 있도록 가공한다.
     * @param {Array} data  원본 데이터
     * @return {Array}  가공된 데이터
     * @private
     */
    _formatData: function(data, dataModel) {
        var rowKey = data['rowKey'],
            row = dataModel.get(rowKey),
            rowState = row.getRowState();

        _.each(data, function(value, columnName) {
            var rowSpanData;

            if (columnName !== 'rowKey' && columnName !== '_extraData') {
                if (dataModel.isRowSpanEnable() &&
                    data['_extraData'] && data['_extraData']['rowSpanData'] &&
                    data['_extraData']['rowSpanData'][columnName]) {
                    rowSpanData = data['_extraData']['rowSpanData'][columnName];
                } else {
                    rowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };
                }
                data[columnName] = {
                    rowKey: rowKey,
                    columnName: columnName,
                    value: value,
                    //Rendering properties
                    rowSpan: rowSpanData.count,
                    isMainRow: rowSpanData.isMainRow,
                    mainRowKey: rowSpanData.mainRowKey,
                    //Change attribute properties
                    isEditable: row.isEditable(columnName),
                    isDisabled: this._isDisabled(columnName, rowState),
                    optionList: [],
                    className: row.getClassNameList(columnName).join(' '),

                    changed: []    //변경된 프로퍼티 목록들
                };
            }
        }, this);
        return data;
    },

    /**
     * Cell 의 값을 변경한다.
     * - 참조형 데이터 타입이기 때문에 change 이벤트 발생을 위해 이 method 를 사용하여 값 변경을 수행한다.
     * @param {String} columnName   컬럼명
     * @param {{key: value}} param  key:value 로 이루어진 셀에서 변경할 프로퍼티 목록
     */
    setCell: function(columnName, param) {
        var isValueChanged = false,
            changed = [],
            rowIndex, rowKey, data;

        if (!this.get(columnName)) {
            return;
        }

        rowKey = this.get('rowKey');
        data = _.clone(this.get(columnName));

        _.each(param, function(changeValue, name) {
            if (!util.isEqual(data[name], changeValue)) {
                isValueChanged = (name === 'value') ? true : isValueChanged;
                data[name] = changeValue;
                changed.push(name);
            }
        }, this);

        if (changed.length) {
            data['changed'] = changed;
            this.set(columnName, data);
            if (isValueChanged) {
                //value 가 변경되었을 경우 relation 을 수행한다.
                rowIndex = this.collection.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    }
});

module.exports = Row;
