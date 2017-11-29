/**
 * @fileoverview Manage coordinates of rows
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');

var util = require('../common/util');
var Model = require('../base/model');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

/**
 * @module model/coordRow
 * @param {Object} attrs - Attributes
 * @param {Object} options - Options
 * @extends module:base/model
 * @ignore
 */
var CoordRow = Model.extend(/** @lends module:model/coordRow.prototype */{
    initialize: function(attrs, options) {
        this.dataModel = options.dataModel;
        this.dimensionModel = options.dimensionModel;
        this.domState = options.domState;

        /**
         * Height of each rows
         * @type {Array}
         */
        this.rowHeights = [];

        /**
         * Offset of each rows
         * @type {Array}
         */
        this.rowOffsets = [];

        // Sync height and offest data when dataModel is changed only if the fixedRowHeight is true.
        // If the fixedRowHeight is false, as the height of each row should be synced with DOM,
        // syncWithDom() method is called instead at the end of rendering process.
        if (this.dimensionModel.get('fixedRowHeight')) {
            this.listenTo(this.dataModel, 'add remove reset sort', this.syncWithDataModel);
        }
    },

    /**
     * Refresh coordinate data with real DOM height of cells
     */
    syncWithDom: function() {
        var domRowHeights, dataRowHeights, rowHeights;
        var i, len;

        if (this.dimensionModel.get('fixedRowHeight')) {
            return;
        }

        domRowHeights = this.domState.getRowHeights();
        dataRowHeights = this._getHeightFromData();
        rowHeights = [];

        for (i = 0, len = dataRowHeights.length; i < len; i += 1) {
            rowHeights[i] = Math.max(domRowHeights[i], dataRowHeights[i]);
        }

        this._reset(rowHeights);
    },

    /**
     * Returns the height of rows from dataModel as an array
     * @returns {Array.<number>}
     * @private
     */
    _getHeightFromData: function() {
        var defHeight = this.dimensionModel.get('rowHeight');
        var rowHeights = [];

        this.dataModel.each(function(row, index) {
            rowHeights[index] = (row.getHeight() || defHeight);
        });

        return rowHeights;
    },

    /**
     * Refresh coordinate data with extraData.height
     */
    syncWithDataModel: function() {
        this._reset(this._getHeightFromData());
    },

    /**
     * Initialize the values of rowHeights and rowOffsets
     * @param {Array.<number>} rowHeights - array of row height
     * @private
     */
    _reset: function(rowHeights) {
        var rowOffsets = [];
        var totalRowHeight = 0;

        _.each(rowHeights, function(height, index) {
            var prevOffset = index ? (rowOffsets[index - 1] + CELL_BORDER_WIDTH) : 0;
            var prevHeight = index ? rowHeights[index - 1] : 0;

            rowOffsets[index] = prevOffset + prevHeight;
        });

        this.rowHeights = rowHeights;
        this.rowOffsets = rowOffsets;

        if (rowHeights.length) {
            totalRowHeight = _.last(rowOffsets) + _.last(rowHeights) + CELL_BORDER_WIDTH;
        }
        this.dimensionModel.set('totalRowHeight', totalRowHeight);
        this.trigger('reset');
    },

    /**
     * Returns the height of the row of given index
     * @param {number} index - row index
     * @returns {number}
     */
    getHeightAt: function(index) {
        return this.rowHeights[index];
    },

    /**
     * Returns the offset of the row of given index
     * @param {number} index - row index
     * @returns {number}
     */
    getOffsetAt: function(index) {
        return this.rowOffsets[index];
    },

    /**
     * Returns the height of the row of the given rowKey
     * @param {number} rowKey - rowKey
     * @returns {number}
     */
    getHeight: function(rowKey) {
        var index = this.dataModel.indexOfRowKey(rowKey);

        return this.getHeightAt(index);
    },

    /**
     * Returns the offset of the row of the given rowKey
     * @param {number} rowKey - rowKey
     * @returns {number}
     */
    getOffset: function(rowKey) {
        var index = this.dataModel.indexOfRowKey(rowKey);

        return this.getOffsetAt(index);
    },

    /**
     * Returns the index of the row which contains given position
     * @param {number} position - target position
     * @returns {number}
     */
    indexOf: function(position) {
        var rowOffsets = this.rowOffsets;
        var idx = 0;

        position += CELL_BORDER_WIDTH * 2;

        while (rowOffsets[idx] - CELL_BORDER_WIDTH <= position) {
            idx += 1;
        }

        return idx - 1;
    },

    /**
     * Returns the row index moved by body height from given row.
     * @param {number} rowIdx - current row index
     * @param {Boolean} isDownDir - true: down, false: up
     * @returns {number}
     */
    getPageMovedIndex: function(rowIdx, isDownDir) {
        var curOffset = this.getOffsetAt(rowIdx);
        var distance = this.dimensionModel.get('bodyHeight');
        var movedIdx;

        if (!isDownDir) {
            distance = -distance;
        }
        movedIdx = this.indexOf(curOffset + distance);

        return util.clamp(movedIdx, 0, this.dataModel.length - 1);
    }
});

module.exports = CoordRow;
