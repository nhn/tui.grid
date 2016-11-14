/**
 * @fileoverview Manage coordinates of rows
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var Model = require('../base/model');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

var CoordRow = Model.extend(/**@lends module:model/coordRow.prototype */{
    /**
     * @constructs
     * @param {object} options - options
     */
    initialize: function(options) {
        this.dataModel = options.dataModel;
        this.dimensionModel = options.dimensionModel;

        this.rowHeights = null;
        this.rowOffsets = null;

        this._reset();
        this.listenTo(this.dataModel, 'add remove reset', this._reset);
    },

    /**
     * Initialize the valuve of rowHeights and rowOffsets
     * @private
     */
    _reset: function() {
        var defHeight = this.dimensionModel.get('rowHeight');
        var rowHeights = [];
        var rowOffsets = [];
        var totalRowHeight = 0;

        this.dataModel.each(function(row, index) {
            var height = row.getHeight() || defHeight;
            var prevOffset = index ? (rowOffsets[index - 1] + CELL_BORDER_WIDTH) : 0;
            var prevHeight = index ? rowHeights[index - 1] : 0;

            rowHeights[index] = height;
            rowOffsets[index] = prevOffset + prevHeight;
        });

        this.rowHeights = rowHeights;
        this.rowOffsets = rowOffsets;

        if (this.dataModel.length) {
            totalRowHeight = _.last(rowOffsets) + _.last(rowHeights) + CELL_BORDER_WIDTH;
        }
        this.dimensionModel.set('totalRowHeight', totalRowHeight);
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

        while (rowOffsets[idx] <= position + CELL_BORDER_WIDTH) {
            idx += 1;
        }

        return idx - 1;
    }
});

module.exports = CoordRow;
