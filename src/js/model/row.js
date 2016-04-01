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
            dataModel = this.collection.dataModel,
            rowData = dataModel.get(rowKey);

        this.dataModel = dataModel;
        this.columnModel = this.collection.columnModel;
        this.focusModel = this.collection.focusModel;

        if (rowData) {
            this.listenTo(rowData, 'change', this._onDataModelChange);
            this.listenTo(rowData, 'restore', this._onDataModelRestore);
            this.listenTo(rowData, 'extraDataChanged', this._setRowExtraData);
            this.listenTo(dataModel, 'disabledChanged', this._onDataModelDisabledChanged);
            this.rowData = rowData;
        }
    },

    idAttribute: 'rowKey',

    /**
     * Event handler for 'change' event on module:data/row
     * @param {Object} rowData - RowData model on which event occurred
     * @private
     */
    _onDataModelChange: function(rowData) {
        _.each(rowData.changed, function(value, columnName) {
            var column, isTextType;

            if (this.has(columnName)) {
                column = this.columnModel.getColumnModel(columnName);
                isTextType = this.columnModel.isTextType(columnName);
                console.log('setCell', value, columnName);

                this.setCell(columnName, this._getValueAttrs(value, rowData, column, isTextType));
            }
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
                isDisabled: this.rowData.isDisabled(columnName),
                className: this._getClassNameString(columnName)
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
            var cellData = this.get(columnName),
                rowModel = this, // eslint-disable-line consistent-this
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
                        className: this._getClassNameString(columnName)
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
     * @param {Object} options - Options
     * @returns {Array} - Converted data.
     * @override
     */
    parse: function(data, options) {
        var collection = options.collection;

        return this._formatData(data, collection.dataModel, collection.columnModel, collection.focusModel);
    },

    /**
     * Convert the original data to the rendering data.
     * @param {Array} data - Original data
     * @param {module:model/data/rowList} dataModel - Data model
     * @param {module:model/data/columnModel} columnModel - Column model
     * @param {module:model/data/focusModel} focusModel - focus model
     * @param {Number} rowHeight - The height of a row
     * @returns {Array} - Converted data
     * @private
     */
    _formatData: function(data, dataModel, columnModel, focusModel) {
        var rowKey = data.rowKey,
            columnData, row;

        if (_.isUndefined(rowKey)) {
            return data;
        }

        row = dataModel.get(rowKey);
        columnData = _.omit(data, 'rowKey', '_extraData', 'height');

        _.each(columnData, function(value, columnName) {
            var rowSpanData = this._getRowSpanData(columnName, data, dataModel.isRowSpanEnable()),
                cellState = row.getCellState(columnName),
                isTextType = columnModel.isTextType(columnName),
                column = columnModel.getColumnModel(columnName);

            data[columnName] = {
                rowKey: rowKey,
                columnName: columnName,
                rowSpan: rowSpanData.count,
                isMainRow: rowSpanData.isMainRow,
                mainRowKey: rowSpanData.mainRowKey,
                isEditable: cellState.isEditable,
                isDisabled: cellState.isDisabled,
                isEditing: focusModel.isEditingCell(rowKey, columnName),
                isFocused: focusModel.isCurrentCell(rowKey, columnName),
                className: this._getClassNameString(columnName, row, focusModel),
                columnModel: column,
                changed: [] //changed property names
            };
            _.assign(data[columnName], this._getValueAttrs(value, row, column, isTextType));
        }, this);

        return data;
    },

    _getClassNameString: function(columnName, row, focusModel) {
        var classNames;

        if (!row) {
            row = this.dataModel.get(this.get('rowKey'));
        }
        if (!focusModel) {
            focusModel = this.focusModel;
        }
        classNames = row.getClassNameList(columnName);

        if (focusModel.isCurrentCell(row.get('rowKey'), columnName)) {
            classNames.push('focused');
        }

        return classNames.join(' ');
    },

    /**
     * Returns the values of the attributes related to the cell value.
     * @param {String|Number} value - Value
     * @param {module:model/data/row} row - Row data model
     * @param {Object} column - Column model object
     * @param {Boolean} isTextType - True if the cell is the text-type
     * @returns {Object}
     * @private
     */
    _getValueAttrs: function(value, row, column, isTextType) {
        var beforeContent = tui.util.pick(column, 'editOption', 'beforeContent'),
            afterContent = tui.util.pick(column, 'editOption', 'afterContent'),
            converter = tui.util.pick(column, 'editOption', 'converter'),
            rowAttrs = row.toJSON();

        return {
            value: this._getValueToDisplay(value, column, isTextType),
            formattedValue: this._getFormattedValue(value, rowAttrs, column),
            beforeContent: this._getExtraContent(beforeContent, value, rowAttrs),
            afterContent: this._getExtraContent(afterContent, value, rowAttrs),
            convertedHTML: this._getConvertedHTML(converter, value, rowAttrs)
        };
    },

    /**
     * If the column has a 'formatter' function, exeucute it and returns the result.
     * @param {String} value - value to display
     * @param {Object} rowAttrs - All attributes of the row
     * @param {Object} column - Column info
     * @returns {String}
     * @private
     */
    _getFormattedValue: function(value, rowAttrs, column) {
        if (_.isFunction(column.formatter)) {
            return column.formatter(value, rowAttrs, column);
        }
        return value;
    },

    /**
     * Returns the value of the 'beforeContent' or 'afterContent'.
     * @param {(String|Function)} content - content
     * @param {String} cellValue - cell value
     * @param {Object} rowAttrs - All attributes of the row
     * @returns {string}
     * @private
     */
    _getExtraContent: function(content, cellValue, rowAttrs) {
        if (_.isFunction(content)) {
            return content(cellValue, rowAttrs);
        }
        if (tui.util.isExisty(content)) {
            return content;
        }
        return '';
    },

    /**
     * If the 'converter' function exist, execute it and returns the result.
     * @param {Function} converter - converter
     * @param {String} cellValue - cell value
     * @param {Object} rowAttrs - All attributes of the row
     * @returns {(String|Null)} - HTML string or Null
     * @private
     */
    _getConvertedHTML: function(converter, cellValue, rowAttrs) {
        var convertedHTML;

        if (_.isFunction(converter)) {
            convertedHTML = converter(cellValue, rowAttrs);
        }
        if (tui.util.isFalsy(convertedHTML)) {
            convertedHTML = null;
        }
        return convertedHTML;
    },

    /**
     * Returns the value to display
     * @param {String|Number} value - value
     * @param {String} column - column name
     * @param {Boolean} isTextType - True if the cell is the text-typee
     * @returns {String}
     * @private
     */
    _getValueToDisplay: function(value, column, isTextType) {
        var isExisty = tui.util.isExisty,
            notUseHtmlEntity = column.notUseHtmlEntity,
            defaultValue = column.defaultValue;

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

    refreshClassName: function(columnName) {
        this.setCell(columnName, {
            className: this._getClassNameString(columnName)
        });
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

        if (!this.has(columnName)) {
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
            this.set(columnName, data, {
                silent: isValueChanged && data.isEditing
            });
            if (isValueChanged && !data.isEditing) {
                rowIndex = this.collection.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    }
});

module.exports = Row;
