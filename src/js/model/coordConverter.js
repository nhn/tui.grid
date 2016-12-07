/**
 * @fileoverview Converts coordinates to index of rows and columns
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var Model = require('../base/model');

/**
 * @module model/coordConverter
 * @param {Object} options - Options
 * @extends module:base/model
 * @ignore
 */
var CoordConverter = Model.extend(/**@lends module:model/coordConverter.prototype */{
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.coordRowModel = options.coordRowModel;
        this.coordColumnModel = options.coordColumnModel;
    },

    /**
     * Get cell index from mouse position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @param {boolean} [withMeta] - Whether the meta columns go with this calculation
     * @returns {{row: number, column: number}} Cell index
     */
    getIndexFromMousePosition: function(pageX, pageY, withMeta) {
        var position = this.dimensionModel.getPositionFromBodyArea(pageX, pageY);
        var posWithScroll = this._getScrolledPosition(position);

        return {
            row: this.coordRowModel.indexOf(posWithScroll.y),
            column: this.coordColumnModel.indexOf(posWithScroll.x, withMeta)
        };
    },

    /**
     * Returns the scrolled position in addition to given position
     * @param {{x: number, y: number}} position - position
     * @returns {{x: number, y: number}}
     * @private
     */
    _getScrolledPosition: function(position) {
        var renderModel = this.renderModel;
        var isRside = position.x > this.dimensionModel.get('lsideWidth');
        var scrollLeft = isRside ? renderModel.get('scrollLeft') : 0;
        var scrollTop = renderModel.get('scrollTop');

        return {
            x: position.x + scrollLeft,
            y: position.y + scrollTop
        };
    }
});

module.exports = CoordConverter;
