/**
 * @fileoverview Row Model for Rendering (View Model)
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
     * Event handler for 'change restore' event on rowData model
     * @param {Object} model - RowData model on which event occurred
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
     * @param  {{isDisabledCheck: Boolean, isDisabled: Boolean, isChecked: Boolean}} rowState - Row state
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
     * Sets the 'isDisabled', 'isEditable', 'className' property of each cell data.
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
     * Overrides Backbone.Model.parse
     * (this method is called before initialize method)
     * @param {Array} data - Original data
     * @return {Array} - Converted data.
     * @override
     */
    parse: function(data, options) {
        return this._formatData(data, options.collection.dataModel);
    },

    /**
     * Convert the original data to rendering data.
     * @param {Array} data - Original data
     * @return {Array} - Converted data
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
                    rowSpan: rowSpanData.count,
                    isMainRow: rowSpanData.isMainRow,
                    mainRowKey: rowSpanData.mainRowKey,
                    isEditable: row.isEditable(columnName),
                    isDisabled: this._isDisabled(columnName, rowState),
                    className: row.getClassNameList(columnName).join(' '),
                    optionList: [], // for list type column (select, checkbox, radio)
                    changed: [] //changed property names
                };
            }
        }, this);
        return data;
    },

    /**
     * Sets the cell data.
     * (Each cell data is reference type, so do not change the cell data directly and
     *  use this method to trigger change event)
     * @param {String} columnName - Column name
     * @param {Object} param - Key-Value pair of the data to change
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
