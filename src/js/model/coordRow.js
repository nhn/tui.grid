/**
 * @fileoverview Coordinate Row
 * @author NHN Ent. FE Development Team
 */
'use strict';

// var _ = require('underscore');
var Model = require('../base/model');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

var CoordRow = Model.extend(/**@lends module:model/coordRow.prototype */{
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

        this.dataModel.each(function(row, index) {
            var height = row.getHeight() || defHeight;
            rowHeights[index] = height;
            rowOffsets[index] = CELL_BORDER_WIDTH
                + (rowOffsets[index - 1] || 0) + (rowHeights[index - 1] || 0);
        });

        this.rowHeights = rowHeights;
        this.rowOffsets = rowOffsets;

        this.dimensionModel.set('totalRowHeight', _.last(rowOffsets) + _.last(rowHeights));
    },

    /**
     * Returns the height of the row at the given index
     * @param {number} index - row index
     * @returns {number}
     */
    getHeight: function(index) {
        return this.rowHeights[index];
    },

    /**
     * Returns the offset of the row at the given index
     * @param {number} index - row index
     * @returns {number}
     */
    getOffset: function(index) {
        return this.rowOffsets[index];
    }
});

module.exports = CoordRow;
