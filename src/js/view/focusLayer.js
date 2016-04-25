/**
 * @fileoverview Class for the layer view that represents the currently focused cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;
var classNameConst = require('../common/classNameConst');

/**
 * Class for the layer view that represents the currently focused cell
 * @module view/focusLayer
 * @extends module:base/view
 */
var FocusLayer = View.extend(/**@lends module:view/focusLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.focusModel = options.focusModel;
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.whichSide = options.whichSide;

        this.borderEl = {
            $top: $('<div>'),
            $left: $('<div>'),
            $right: $('<div>'),
            $bottom: $('<div>')
        };

        this.listenTo(this.dimensionModel, 'change:width', this._onChangeWidth);
        this.listenTo(this.focusModel, 'blur', this._onBlur);
        this.listenTo(this.focusModel, 'focus', this._onFocus);
    },

    className: classNameConst.LAYER_FOCUS,

    _onChangeWidth: function() {
        var focusModel = this.focusModel;

        if (this.$el.is(':visible')) {
            this._refreshBorderLayout(focusModel.get('rowKey'), focusModel.get('columnName'));
        }
    },

    /**
     * Event handler for 'blur' event on the module:model/focus
     * @private
     */
    _onBlur: function() {
        this.$el.hide();
    },

    /**
     * Event handler for 'focus' event on module:model/focus
     * @param {Number} rowKey - target row key
     * @param {String} columnName - target column name
     * @private
     */
    _onFocus: function(rowKey, columnName) {
        var targetSide = this.columnModel.isLside(columnName) ? 'L' : 'R';

        if (targetSide === this.whichSide) {
            this._refreshBorderLayout(rowKey, columnName);
            this.$el.show();
        }
    },


    /**
     * Resets the position and the dimension of the layer.
     * @param {Number} rowKey - row key
     * @param {String} columnName - column name
     * @private
     */
    _refreshBorderLayout: function(rowKey, columnName) {
        var pos = this.dimensionModel.getCellPosition(rowKey, columnName);
        var width = pos.right - pos.left;
        var height = pos.bottom - pos.top;

        this.borderEl.$left.css({
            top: pos.top,
            left: pos.left,
            width: CELL_BORDER_WIDTH,
            height: height + CELL_BORDER_WIDTH
        });

        this.borderEl.$top.css({
            top: pos.top === 0 ? CELL_BORDER_WIDTH : pos.top,
            left: pos.left,
            width: width + CELL_BORDER_WIDTH,
            height: CELL_BORDER_WIDTH
        });

        this.borderEl.$right.css({
            top: pos.top,
            left: pos.left + width,
            width: CELL_BORDER_WIDTH,
            height: height + CELL_BORDER_WIDTH
        });

        this.borderEl.$bottom.css({
            top: pos.top + height,
            left: pos.left,
            width: width + CELL_BORDER_WIDTH,
            height: CELL_BORDER_WIDTH
        });
    },

    /**
     * Render
     * @returns {Object} this instance
     */
    render: function() {
        var $el = this.$el;

        _.each(this.borderEl, function($border) {
            $el.append($border);
        });
        $el.hide();

        return this;
    }
});

module.exports = FocusLayer;
