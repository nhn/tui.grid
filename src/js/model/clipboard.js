/**
 * @fileoverview Clipboard Model
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
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
var Clipboard = Model.extend(/** @lends module:model/clipboard.prototype*/{
    initialize: function(attr, options) {
        Model.prototype.initialize.apply(this, arguments);

        _.assign(this, {
            columnModel: options.columnModel,
            dataModel: options.dataModel,
            selectionModel: options.selectionModel,
            renderModel: options.renderModel,
            focusModel: options.focusModel,
            copyOptions: options.copyOptions,
            domEventBus: options.domEventBus
        });

        this.listenTo(options.domEventBus, 'key:clipboard', this._onKeyClipboard);
    },

    defaults: {
        /**
         * String value to be stored in the system clipboard
         * @type {String}
         */
        text: null
    },

    /**
     * Set clipboard text to trigger event
     */
    setClipboardText: function() {
        this.set('text', this._getClipboardText());
    },

    /**
     * Paste the text from clipboard to Grid
     * @param {array} data - clipboard data
     */
    pasteClipboardDataToGrid: function(data) {
        var selectionModel = this.selectionModel;
        var focusModel = this.focusModel;
        var dataModel = this.dataModel;
        var selRange, selRowLen, selColLen;
        var startIdx;

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
     * Event handler for key:clipboard event on the domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onKeyClipboard: function(gridEvent) {
        var command = gridEvent.command;

        if (command === 'copy') {
            this.setClipboardText();
        }
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
     * Returns the text to be stored in the clipboard
     * @returns {String}
     * @private
     */
    _getClipboardText: function() {
        var selectionModel = this.selectionModel;
        var focused = this.focusModel.which();
        var text;

        if (selectionModel.hasSelection()) {
            text = selectionModel.getValuesToString();
        } else {
            text = selectionModel.getValueToString(focused.rowKey, focused.columnName);
        }

        return text;
    }
});

module.exports = Clipboard;
