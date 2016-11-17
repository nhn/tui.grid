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

        this.listenTo(this.dataModel, 'add remove reset sort', this._onChangeData);
    },

    /**
     * Reset coordinate data with real DOM height of cells
     */
    syncWithDom: function() {
        var rowHeights;

        if (this.dimensionModel.get('isFixedRowHeight')) {
            return;
        }

        rowHeights = this.domState.getRowHeights();
        this._reset(rowHeights);
        this.trigger('syncWithDom');
    },

    /**
     * Event handler to be called when dataModel is changed
     * @private
     */
    _onChangeData: function() {
        var defHeight = this.dimensionModel.get('rowHeight');
        var rowHeights = [];

        this.dataModel.each(function(row, index) {
            rowHeights[index] = (row.getHeight() || defHeight);
        });

        this._reset(rowHeights);
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

        position += CELL_BORDER_WIDTH;
        while (rowOffsets[idx] <= position) {
            idx += 1;
        }

        return idx - 1;
    }
});

module.exports = CoordRow;
