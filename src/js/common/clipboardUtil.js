/**
 * @fileoverview Utilities for clipboard data
 * @author NHN Ent. Fe Development Team
 */

'use strict';

var _ = require('underscore');

var CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
var CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
var CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
var CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
var LF = '\n';
var CR = '\r';

var clipboardUtil;

/**
 * Set to the data matrix as colspan & rowspan range
 * @param {string} value - Text from getting td element
 * @param {array} data - Data matrix to set value
 * @param {array} colspanRange - colspan range (ex: [start,Index endIndex])
 * @param {array} rowspanRange - rowspan range (ex: [start,Index endIndex])
 * @private
 */
function setDataInSpanRange(value, data, colspanRange, rowspanRange) {
    var startColspan = colspanRange[0];
    var endColspan = colspanRange[1];
    var startRowspan = rowspanRange[0];
    var endRowspan = rowspanRange[1];
    var cIndex, rIndex;

    for (rIndex = startRowspan; rIndex < endRowspan; rIndex += 1) {
        for (cIndex = startColspan; cIndex < endColspan; cIndex += 1) {
            data[rIndex][cIndex] = ((startRowspan === rIndex) &&
                                    (startColspan === cIndex)) ? value : ' ';
        }
    }
}

/**
 * @module clipboardUtil
 * @ignore
 */
clipboardUtil = {
    /**
     * Convert cell data of table to clipboard data
     * @param {HTMLElement} table - Table element
     * @returns {array} clipboard data (2*2 matrix)
     */
    convertTableToData: function(table) {
        var data = [];
        var rows = table.rows;
        var index = 0;
        var length = rows.length;
        var columnIndex, colspanRange, rowspanRange;

        // Step 1: Init the data matrix
        for (; index < length; index += 1) {
            data[index] = [];
        }

        // Step 2: Traverse the table
        _.each(rows, function(tr, rowIndex) {
            columnIndex = 0;

            _.each(tr.cells, function(td) {
                while (data[rowIndex][columnIndex]) {
                    columnIndex += 1;
                }

                colspanRange = [columnIndex, columnIndex + (td.colSpan || 1)];
                rowspanRange = [rowIndex, rowIndex + (td.rowSpan || 1)];

                // Step 3: Set the value of td element to the data matrix as colspan and rowspan ranges
                setDataInSpanRange(td.innerText, data, colspanRange, rowspanRange);

                columnIndex = colspanRange[1];
            });
        });

        return data;
    },

    /**
     * Convert plain text to clipboard data
     * @param {string} text - Copied plain text
     * @returns {array} clipboard data (2*2 matrix)
     */
    convertTextToData: function(text) {
        // Each newline cell data is wrapping double quotes in the text and
        // newline characters should be replaced with substitution characters temporarily
        // before spliting the text by newline characters.
        text = clipboardUtil.replaceNewlineToSubchar(text);

        return _.map(text.split(/\r?\n/), function(row) {
            return _.map(row.split('\t'), function(column) {
                column = clipboardUtil.removeDoubleQuotes(column);

                return column.replace(CUSTOM_LF_REGEXP, LF)
                    .replace(CUSTOM_CR_REGEXP, CR);
            });
        });
    },

    /**
     * Add double quotes on text when including newline characters
     * @param {string} text - Original text
     * @returns {string} Replaced text
     */
    addDoubleQuotes: function(text) {
        if (text.match(/\r?\n/g)) {
            text = '"' + text.replace(/"/g, '""') + '"';
        }

        return text;
    },

    /**
     * Remove double quetes on text when including substitution characters
     * @param {string} text - Original text
     * @returns {string} Replaced text
     */
    removeDoubleQuotes: function(text) {
        if (text.match(CUSTOM_LF_REGEXP)) {
            text = text.substring(1, text.length - 1)
                .replace(/""/g, '"');
        }

        return text;
    },

    /**
     * Replace newline characters to substitution characters
     * @param {string} text - Original text
     * @returns {string} Replaced text
     */
    replaceNewlineToSubchar: function(text) {
        return text.replace(/"([^"]|"")*"/g, function(value) {
            return value.replace(LF, CUSTOM_LF_SUBCHAR)
                .replace(CR, CUSTOM_CR_SUBCHAR);
        });
    }
};

clipboardUtil.CUSTOM_LF_SUBCHAR = CUSTOM_LF_SUBCHAR;
clipboardUtil.CUSTOM_CR_SUBCHAR = CUSTOM_CR_SUBCHAR;

module.exports = clipboardUtil;
