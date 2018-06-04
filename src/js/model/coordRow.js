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
            this.listenTo(this.dataModel, 'add remove reset sort', this.syncWithDataModel)
                .listenTo(this.dataModel, 'expanded', this._onExpanded)
                .listenTo(this.dataModel, 'collapsed', this._onCollapsed);
        }
    },

    /**
     * Event handler for 'expanded' event on dataModel using tree
     * @param {Array.<number|string>} rowKeys - array of row key
     * @private
     */
    _onExpanded: function(rowKeys) {
        var defHeight = this.dimensionModel.get('rowHeight');

        _.each(rowKeys, function(rowKey) {
            var index = this.dataModel.indexOfRowKey(rowKey);
            var row = this.dataModel.at(index);

            this.rowHeights[index] = row.getHeight() || defHeight;
        }, this);

        this.rowOffsets = this._resetOffsets(this.rowHeights);

        this._setTotalRowHeight();
    },

    /**
     * Event handler for 'collapsed' event on dataModel using tree
     * @param {Array.<number|string>} rowKeys - array of row key
     * @private
     */
    _onCollapsed: function(rowKeys) {
        _.each(rowKeys, function(rowKey) {
            var index = this.dataModel.indexOfRowKey(rowKey);

            this.rowHeights[index] = 0;
        }, this);

        this.rowOffsets = this._resetOffsets(this.rowHeights);

        this._setTotalRowHeight();
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
        var height;

        this.dataModel.each(function(row, index) {
            height = row.getHeight() || defHeight;

            if (!this.dataModel.isVisibleRow(row.get('rowKey'))) {
                height = 0;
            }

            rowHeights[index] = height;
        }, this);

        return rowHeights;
    },

    /**
     * Refresh coordinate data with extraData.height
     */
    syncWithDataModel: function() {
        this._reset(this._getHeightFromData());
    },

    /**
     * Reset the list of offset via the list of each row's height
     * @param {Array.<number>} rowHeights - array of row height
     * @returns {Array.<number>} array of row offest
     * @private
     */
    _resetOffsets: function(rowHeights) {
        var rowOffsets = [];
        var prevIdx = 0;
        var prevHeight, rowOffset;

        _.each(rowHeights, function(height, index) {
            if (height) {
                prevHeight = index ? rowHeights[prevIdx] : rowHeights[0];
                rowOffset = index ? (prevHeight + rowOffsets[prevIdx] + CELL_BORDER_WIDTH) : 0;
                prevIdx = index;
            } else {
                rowOffset = -1;
            }

            rowOffsets[index] = rowOffset;
        });

        return rowOffsets;
    },

    /**
     * Set the height value of total row height via heights and offsets
     * @private
     */
    _setTotalRowHeight: function() {
        var totalRowHeight = 0;
        var rowHeights = this.rowHeights;
        var rowOffsets = this.rowOffsets;

        if (rowHeights.length) {
            totalRowHeight = _.last(rowOffsets) + _.last(rowHeights) + CELL_BORDER_WIDTH;
        }

        this.dimensionModel.set('totalRowHeight', totalRowHeight);
    },

    /**
     * Initialize the values of rowHeights and rowOffsets
     * @param {Array.<number>} rowHeights - array of row height
     * @private
     */
    _reset: function(rowHeights) {
        this.rowHeights = rowHeights;
        this.rowOffsets = this._resetOffsets(rowHeights);

        this._setTotalRowHeight();

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
        var visibleRowsCnt = 0;

        position += CELL_BORDER_WIDTH * 2;

        while (rowOffsets[idx] - CELL_BORDER_WIDTH <= position) {
            if (rowOffsets[idx] > -1) {
                visibleRowsCnt = 0;
            } else {
                visibleRowsCnt += 1;
            }

            idx += 1;
        }

        return idx - visibleRowsCnt - 1;
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
