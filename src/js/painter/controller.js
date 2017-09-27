/**
 * @fileoverview Controller class to handle actions from the painters
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var util = require('../common/util');

/**
 * Controller class to handle actions from the painters
 * @module painter/controller
 * @param {Object} options - options
 * @ignore
 */
var PainterController = snippet.defineClass(/** @lends module:painter/controller.prototype */{
    init: function(options) {
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.selectionModel = options.selectionModel;
    },

    /**
     * Starts editing a cell identified by a given address, and returns the result.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {Boolean} force - if set to true, finish current editing before start.
     * @returns {Boolean} true if succeeded, false otherwise
     */
    startEditing: function(address, force) {
        var result;

        if (force) {
            this.focusModel.finishEditing();
        }

        result = this.focusModel.startEditing(address.rowKey, address.columnName);

        if (result) {
            this.selectionModel.end();
        }

        return result;
    },

    /**
     * Check if given column has 'maxLength' property and returns the substring limited by maxLength.
     * @param {string} columnName - columnName
     * @param {string} value - value
     * @returns {string}
     * @private
     */
    _checkMaxLength: function(columnName, value) {
        var column = this.columnModel.getColumnModel(columnName);
        var maxLength = snippet.pick(column, 'editOptions', 'maxLength');

        if (maxLength > 0 && value.length > maxLength) {
            return value.substring(0, maxLength);
        }

        return value;
    },

    /**
     * Ends editing a cell identified by a given address, and returns the result.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {Boolean} shouldBlur - if set to true, make the current input lose focus.
     * @param {String} [value] - if exists, set the value of the data model to this value.
     * @returns {Boolean} - true if succeeded, false otherwise
     */
    finishEditing: function(address, shouldBlur, value) {
        var focusModel = this.focusModel;
        var row, currentValue;

        if (!focusModel.isEditingCell(address.rowKey, address.columnName)) {
            return false;
        }

        this.selectionModel.enable();

        if (!_.isUndefined(value)) {
            row = this.dataModel.get(address.rowKey);
            currentValue = row.get(address.columnName);

            if (!(util.isBlank(value) && util.isBlank(currentValue))) {
                this.setValue(address, this._checkMaxLength(address.columnName, value));
            }
        }
        focusModel.finishEditing();

        if (shouldBlur) {
            focusModel.focusClipboard();
        } else {
            _.defer(function() {
                focusModel.refreshState();
            });
        }

        return true;
    },

    /**
     * Moves focus to the next cell, and starts editing the cell.
     * @param {Boolean} reverse - if set to true, find the previous cell instead of next cell
     */
    focusInToNextCell: function(reverse) {
        var focusModel = this.focusModel;
        var address = reverse ? focusModel.prevAddress() : focusModel.nextAddress();

        focusModel.focusIn(address.rowKey, address.columnName, true);
    },

    /**
     * Moves focus to the first cell of the given row, and starts editing the cell.
     * @param {number} rowKey - rowKey
     */
    focusInToRow: function(rowKey) {
        var focusModel = this.focusModel;
        focusModel.focusIn(rowKey, focusModel.firstColumnName(), true);
    },

    /**
     * Executes the custom handler (defined by user) of the input events.
     * @param {Event} event - DOM Event object
     * @param {{rowKey:String, columnName:String}} address - cell address
     */
    executeCustomInputEventHandler: function(event, address) {
        var columnModel = this.columnModel.getColumnModel(address.columnName);
        var eventType, editOptions, handler;

        if (!columnModel) {
            return;
        }

        eventType = event.type;
        editOptions = columnModel.editOptions || {};
        handler = editOptions[getEventHandlerName(eventType)];

        if (_.isFunction(handler)) {
            handler.call(event.target, event, address);
        }
    },

    /**
     * Sets the value of the given cell.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {(Number|String|Boolean)} value - value
     */
    setValue: function(address, value) {
        var columnModel = this.columnModel.getColumnModel(address.columnName);

        if (_.isString(value)) {
            value = $.trim(value);
        }
        if (columnModel.dataType === 'number') {
            value = convertToNumber(value);
        }
        if (columnModel.name === '_button') {
            if (value) {
                this.dataModel.check(address.rowKey);
            } else {
                this.dataModel.uncheck(address.rowKey);
            }
        } else {
            this.dataModel.setValue(address.rowKey, address.columnName, value);
        }
    },

    /**
     * Sets the value of the given cell, if the given column is not using view-mode.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {(Number|String|Boolean)} value - value
     */
    setValueIfNotUsingViewMode: function(address, value) {
        var columnModel = this.columnModel.getColumnModel(address.columnName);

        if (!snippet.pick(columnModel, 'editOptions', 'useViewMode')) {
            this.setValue(address, value);
        }
    }
});

/**
 * Converts given value to a number type and returns it.
 * If the value is not a number type, returns the original value.
 * @param {*} value - value
 * @returns {*}
 */
function convertToNumber(value) {
    if (_.isString(value)) {
        value = value.replace(/,/g, '');
    }

    if (_.isNumber(value) || isNaN(value) || util.isBlank(value)) {
        return value;
    }

    return Number(value);
}

/**
 * Returns a property name of a custom event handler matched to the given eventType
 * @param {string} eventType - event type
 * @returns {string}
 */
function getEventHandlerName(eventType) {
    switch (eventType) {
        case 'focusin':
            return 'onFocus';
        case 'focusout':
            return 'onBlur';
        case 'keydown':
            return 'onKeyDown';
        default:
            return '';
    }
}

module.exports = PainterController;
