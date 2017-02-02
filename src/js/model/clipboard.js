/**
 * @fileoverview Clipboard Model
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var _ = require('underscore');
var Model = require('../base/model');

/**
 * Clipboard Model
 * @module model/clipboard
 * @extends module:base/model
 * @param {Object} attr - Attributes
 * @param {Object} options - Options
 * @ignore
 */
var Clipboard = Model.extend(/**@lends module:model/clipboard.prototype*/{
    initialize: function(attr, options) {
        Model.prototype.initialize.apply(this, arguments);

        _.assign(this, {
            dataModel: options.dataModel,
            selectionModel: options.selectionModel,
            renderModel: options.renderModel,
            focusModel: options.focusModel,
            copyOption: options.copyOption
        });

        if (options.domEventBus) {
            this.listenTo(options.domEventBus, 'key:clipboard', this._onKeyClipboard);
        }
    },

    defaults: {
        /**
         * String value to be stored in the system clipboard
         * @type {String}
         */
        text: null
    },

    /**
     * Event handler for key:clipboard event on the domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onKeyClipboard: function(gridEvent) {
        var command = gridEvent.command;

        if (command === 'copy') {
            this.set('text', this._getClipboardText());
        } else if (command === 'paste') {
            this._pasteClipboardTextToGrid(gridEvent.text);
        }
    },

    /**
     * Paste the text from clipboard to Grid
     * @param {String} text - clipboard text
     * @private
     */
    _pasteClipboardTextToGrid: function(text) {
        var selectionModel = this.selectionModel;
        var focusModel = this.focusModel;
        var dataModel = this.dataModel;
        var selRange, selRowLen, selColLen;
        var startIdx, data;

        data = this._parseClipboardText(text);

        if (selectionModel.hasSelection()) {
            selRange = selectionModel.get('range');
            selRowLen = selRange.row[1] - selRange.row[0] + 1;
            selColLen = selRange.column[1] - selRange.column[0] + 1;
            data = this._duplicateData(data, selRowLen, selColLen);
            startIdx = selectionModel.getStartIndex();
        } else {
            startIdx = focusModel.indexOf();
        }

        dataModel.paste(data, startIdx);
    },

    /**
     * Duplicate given data based on the selection range
     * @param {Array.<Array.<string>>} data - 2D array of string values
     * @param {number} selRowLen - row length of selection range
     * @param {number} selColLen - column length of selection range
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _duplicateData: function(data, selRowLen, selColLen) {
        var dataRowLen = data.length;
        var dataColLen = data[0].length;
        var rowDupCount = Math.floor(selRowLen / dataRowLen) - 1;
        var colDupCount = Math.floor(selColLen / dataColLen) - 1;
        var result = $.extend(true, [], data);

        // duplicate rows
        _.times(rowDupCount, function() {
            _.forEach(data, function(row) {
                result.push(row.slice(0));
            });
        });

        // duplicate columns
        _.forEach(result, function(row) {
            var rowData = row.slice(0);

            _.times(colDupCount, function() {
                [].push.apply(row, rowData);
            });
        });

        return result;
    },

    /**
     * Parse the clipboard text for pasting to dataModel
     * @param {String} text - text
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _parseClipboardText: function(text) {
        return _.map(text.split('\n'), function(row) {
            return row.split('\t');
        });
    },

    /**
     * Returns the text to be stored in the clipboard
     * @returns {String}
     * @private
     */
    _getClipboardText: function() {
        var selectionModel = this.selectionModel;
        var focused = this.focusModel.which();
        var useFormattedValue = _.result(this.copyOption, 'useFormattedValue', false);
        var text;

        if (selectionModel.hasSelection()) {
            text = selectionModel.getValuesToString(useFormattedValue);
        } else if (useFormattedValue) {
            text = this.renderModel.getCellData(focused.rowKey, focused.columnName).formattedValue;
        } else {
            text = this.dataModel.get(focused.rowKey).getValueString(focused.columnName);
        }

        return text;
    }
});

module.exports = Clipboard;
