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
        switch (gridEvent.command) {
            case 'copy':
                this.set('text', this._getClipboardText());
                break;
            case 'paste':
                this._pasteClipboardTextToGrid(gridEvent.text);
                break;
            default:
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
        var startIdx, data;

        if (selectionModel.hasSelection()) {
            startIdx = selectionModel.getStartIndex();
        } else {
            startIdx = focusModel.indexOf();
        }
        data = this._parseClipboardText(text);

        dataModel.paste(data, startIdx);
    },

    /**
     * Parse the clipboard text for pasting to dataModel
     * @param {String} text - text
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _parseClipboardText: function(text) {
        var result = text.split('\n');
        var len = result.length;
        var i = 0;

        for (; i < len; i += 1) {
            result[i] = result[i].split('\t');
        }

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
        var useFormattedValue = !!tui.util.pick(this.copyOption, 'useFormattedValue');
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
