/**
 * @fileoverview Row Model for Rendering (View Model)
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Model = require('../base/model');
var util = require('../common/util');

/**
 * Row Model
 * @module model/row
 * @param  {object} attributes - Attributes
 * @param  {object} options - Options
 * @extends module:base/model
 * @ignore
 */
var Row = Model.extend(/** @lends module:model/row.prototype */{
    initialize: function(attributes, options) {
        var rowKey = attributes && attributes.rowKey;
        var dataModel = options.dataModel;
        var rowData = dataModel.get(rowKey);

        this.dataModel = dataModel;
        this.columnModel = options.columnModel;
        this.focusModel = options.focusModel;

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
        var columnModels = this.columnModel.getVisibleColumns(null, true);

        return _.pluck(columnModels, 'name');
    },

    /**
     * Event handler for 'disabledChanged' event on dataModel
     */
    _onDataModelDisabledChanged: function() {
        var columnNames = this._getColumnNameList();

        _.each(columnNames, function(columnName) {
            this.setCell(columnName, {
                disabled: this.rowData.isDisabled(columnName),
                className: this._getClassNameString(columnName)
            });
        }, this);
    },

    /**
     * Sets the 'disabled', 'editable', 'className' property of each cell data.
     * @private
     */
    _setRowExtraData: function() {
        _.each(this._getColumnNameList(), function(columnName) {
            var cellData = this.get(columnName);
            var cellState;

            if (!snippet.isUndefined(cellData) && cellData.isMainRow) {
                cellState = this.rowData.getCellState(columnName);

                this.setCell(columnName, {
                    disabled: cellState.disabled,
                    editable: cellState.editable,
                    className: this._getClassNameString(columnName)
                });
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
        return this._formatData(data, options.dataModel, options.columnModel, options.focusModel);
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
        var rowKey = data.rowKey;
        var rowHeight = data.height;
        var columnData, row;

        if (_.isUndefined(rowKey)) {
            return data;
        }

        row = dataModel.get(rowKey);
        columnData = _.omit(data, 'rowKey', '_extraData', 'height', 'rowNum');

        _.each(columnData, function(value, columnName) {
            var rowSpanData = this._getRowSpanData(columnName, data, dataModel.isRowSpanEnable());
            var cellState = row.getCellState(columnName);
            var isTextType = columnModel.isTextType(columnName);
            var column = columnModel.getColumnModel(columnName);

            data[columnName] = {
                rowKey: rowKey,
                height: rowHeight,
                columnName: columnName,
                rowSpan: rowSpanData.count,
                isMainRow: rowSpanData.isMainRow,
                mainRowKey: rowSpanData.mainRowKey,
                editable: cellState.editable,
                disabled: cellState.disabled,
                editing: focusModel.isEditingCell(rowKey, columnName),
                whiteSpace: column.whiteSpace || 'nowrap',
                valign: column.valign,
                listItems: snippet.pick(column, 'editOptions', 'listItems'),
                className: this._getClassNameString(columnName, row, focusModel),
                columnModel: column,
                changed: [] // changed property names
            };
            _.assign(data[columnName], this._getValueAttrs(value, row, column, isTextType));
        }, this);

        return data;
    },

    /**
     * Returns the class name string of the a cell.
     * @param {String} columnName - column name
     * @param {module:model/data/row} [row] - data model of a row
     * @param {module:model/focus} [focusModel] - focus model
     * @returns {String}
     */
    _getClassNameString: function(columnName, row, focusModel) {
        var classNames;

        if (!row) {
            row = this.dataModel.get(this.get('rowKey'));
            if (!row) {
                return '';
            }
        }
        if (!focusModel) {
            focusModel = this.focusModel;
        }
        classNames = row.getClassNameList(columnName);

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
        var prefix = snippet.pick(column, 'editOptions', 'prefix');
        var postfix = snippet.pick(column, 'editOptions', 'postfix');
        var converter = snippet.pick(column, 'editOptions', 'converter');
        var rowAttrs = row.toJSON();

        return {
            value: this._getValueToDisplay(value, column, isTextType),
            formattedValue: this._getFormattedValue(value, rowAttrs, column),
            prefix: this._getExtraContent(prefix, value, rowAttrs),
            postfix: this._getExtraContent(postfix, value, rowAttrs),
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
        var result;

        if (_.isFunction(column.formatter)) {
            result = column.formatter(value, rowAttrs, column);
        } else {
            result = value;
        }

        if (_.isNumber(result)) {
            result = String(result);
        } else if (!result) {
            result = '';
        }

        return result;
    },

    /**
     * Returns the value of the 'prefix' or 'postfix'.
     * @param {(String|Function)} content - content
     * @param {String} cellValue - cell value
     * @param {Object} rowAttrs - All attributes of the row
     * @returns {string}
     * @private
     */
    _getExtraContent: function(content, cellValue, rowAttrs) {
        var result = '';

        if (_.isFunction(content)) {
            result = content(cellValue, rowAttrs);
        } else if (snippet.isExisty(content)) {
            result = content;
        }

        return result;
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
        var convertedHTML = null;

        if (_.isFunction(converter)) {
            convertedHTML = converter(cellValue, rowAttrs);
        }
        if (convertedHTML === false) {
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
        var isExisty = snippet.isExisty;
        var useHtmlEntity = column.useHtmlEntity;
        var defaultValue = column.defaultValue;

        if (!isExisty(value)) {
            value = isExisty(defaultValue) ? defaultValue : '';
        }

        if (isTextType && useHtmlEntity && snippet.hasEncodableString(value)) {
            value = snippet.encodeHTMLEntity(value);
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
        var rowSpanData = snippet.pick(data, '_extraData', 'rowSpanData', columnName);

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
     * Updates the className attribute of the cell identified by a given column name.
     * @param {String} columnName - column name
     */
    updateClassName: function(columnName) {
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
        var isValueChanged = false;
        var changed = [];
        var rowIndex, rowKey, data;

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
                silent: this._shouldSetSilently(data, isValueChanged)
            });
            if (isValueChanged) {
                rowIndex = this.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    },

    /**
     * Returns whether the 'set' method should be called silently.
     * @param {Object} cellData - cell data
     * @param {Boolean} valueChanged - true if value changed
     * @returns {Boolean}
     * @private
     */
    _shouldSetSilently: function(cellData, valueChanged) {
        var valueChangedOnEditing = cellData.editing && valueChanged;
        var useViewMode = snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
        var editingChangedToTrue = _.contains(cellData.changed, 'editing') && cellData.editing;

        // Silent Cases
        // 1: If values have been changed while the editing is true,
        //    prevent the related cell-view from changing its value-state until editing is finished.
        // 2: If useViewMode is true and editing is changing to true,
        //    prevent the related cell-view from changing its state to enable editing,
        //    as the editing-layer will be used for editing instead.
        return valueChangedOnEditing || (useViewMode && editingChangedToTrue);
    }
});

module.exports = Row;
