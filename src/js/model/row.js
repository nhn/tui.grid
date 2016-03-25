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
 * @extends module:base/model
 */
var Row = Model.extend(/**@lends module:model/row.prototype */{
    /**
     * @constructs
     * @param  {object} attributes - Attributes
     * @param  {object} options - Options
     */
    initialize: function(attributes) {
        var rowKey = attributes && attributes.rowKey,
            rowListData = this.collection.dataModel,
            rowData = rowListData.get(rowKey);

        if (rowData) {
            this.listenTo(rowData, 'change', this._onDataModelChange);
            this.listenTo(rowData, 'restore', this._onDataModelRestore);
            this.listenTo(rowData, 'extraDataChanged', this._setRowExtraData);
            this.listenTo(rowListData, 'disabledChanged', this._onDataModelDisabledChanged);

            this.rowData = rowData;
        }
    },

    idAttribute: 'rowKey',

    /**
     * Event handler for 'change' event on module:data/row
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
     * Event handler for 'restore' event on module:data/row
     * @param {String} columnName - columnName
     * @private
     */
    _onDataModelRestore: function(columnName) {
        var cellData = this.get(columnName);
        if (cellData) {
            this.trigger('restore', cellData);
        }
    },

    /**
     * Returns an array of visible column names.
     * @returns {Array.<String>} Visible column names
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
     * @returns {Boolean} - True if disabled
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
        var columnNames = this._getColumnNameList();

        _.each(columnNames, function(columnName) {
            this.setCell(columnName, {
                isDisabled: this.rowData.isDisabled(columnName)
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
            param;

        if (tui.util.isUndefined(this.collection)) {
            return;
        }

        _.each(columnNames, function(columnName) {
            /*eslint-disable consistent-this */
            var cellData = this.get(columnName),
                rowModel = this,
                cellState;

            if (!tui.util.isUndefined(cellData)) {
                cellState = this.rowData.getCellState(columnName);
                if (dataModel.isRowSpanEnable() && !cellData.isMainRow) {
                    rowModel = this.collection.get(cellData.mainRowKey);
                }
                if (rowModel) {
                    param = {
                        isDisabled: cellState.isDisabled,
                        isEditable: cellState.isEditable,
                        className: this.rowData.getClassNameList(columnName).join(' ')
                    };
                    rowModel.setCell(columnName, param);
                }
            }
            /*eslint-enable consistent-this */
        }, this);
    },

    /**
     * Overrides Backbone.Model.parse
     * (this method is called before initialize method)
     * @param {Array} data - Original data
     * @param {Object} options - Options
     * @returns {Array} - Converted data.
     * @override
     */
    parse: function(data, options) {
        var collection = options.collection;

        return this._formatData(data, collection.dataModel, collection.columnModel);
    },

    /**
     * Convert the original data to rendering data.
     * @param {Array} data - Original data
     * @param {module:model/data/rowList} dataModel - Data model
     * @param {module:model/data/columnModel} columnModel - Column model
     * @param {Number} rowHeight - The height of a row
     * @returns {Array} - Converted data
     * @private
     */
    _formatData: function(data, dataModel, columnModel) {
        var rowKey = data.rowKey,
            columnData, row;

        if (_.isUndefined(rowKey)) {
            return data;
        }
        row = dataModel.get(rowKey);
        columnData = _.omit(data, 'rowKey', '_extraData', 'height');

        _.each(columnData, function(value, columnName) {
            var rowSpanData = this._getRowSpanData(columnName, data, dataModel.isRowSpanEnable()),
                cellState = row.getCellState(columnName);

            data[columnName] = {
                rowKey: rowKey,
                columnName: columnName,
                value: this._getValueToDisplay(columnModel, columnName, value),
                rowSpan: rowSpanData.count,
                isMainRow: rowSpanData.isMainRow,
                mainRowKey: rowSpanData.mainRowKey,
                isEditable: cellState.isEditable,
                isDisabled: cellState.isDisabled,
                className: row.getClassNameList(columnName).join(' '),
                optionList: [], // for list type column (select, checkbox, radio)
                changed: [] //changed property names
            };
        }, this);
        return data;
    },

    /**
     * Returns the value to display
     * @param {module:model/data/columnModel} columnModel - column model
     * @param {String} columnName - column name
     * @param {String|Number} value - value
     * @returns {String}
     * @private
     */
    _getValueToDisplay: function(columnModel, columnName, value) {
        var isExisty = tui.util.isExisty,
            isTextType = columnModel.isTextType(columnName),
            cellColumnModel = columnModel.getColumnModel(columnName),
            notUseHtmlEntity = cellColumnModel.notUseHtmlEntity,
            defaultValue = cellColumnModel.defaultValue;

        if (!isExisty(value)) {
            value = isExisty(defaultValue) ? defaultValue : '';
        }

        if (isTextType && !notUseHtmlEntity && tui.util.hasEncodableString(value)) {
            value = tui.util.encodeHTMLEntity(value);
        }

        return value;
    },

    /**
     * Returns the rowspan data.
     * @param {String} columnName - column name
     * @param {Object} data - data
     * @param {Boolean} isRowSpanEnable - Whether the rowspan enable
     * @returns {Object} rowSpanData
     * @private
     */
    _getRowSpanData: function(columnName, data, isRowSpanEnable) {
        var rowSpanData = tui.util.pick(data, '_extraData', 'rowSpanData', columnName);

        if (!isRowSpanEnable || !rowSpanData) {
            rowSpanData = {
                mainRowKey: data.rowKey,
                count: 0,
                isMainRow: true
            };
        }
        return rowSpanData;
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
            data.changed = changed;
            this.set(columnName, data);
            if (isValueChanged) {
                rowIndex = this.collection.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    }
});

module.exports = Row;
