/**
 * @fileoverview Class for the layer view that represents the currently focused cell
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var View = require('../base/view');
var constMap = require('../common/constMap');
var classNameConst = require('../common/classNameConst');

var frameConst = constMap.frame;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
var HTML_BORDER_DIV = '<div class="' + classNameConst.LAYER_FOCUS_BORDER + '"></div>';
var BLUR_CLASS_NAME = classNameConst.LAYER_FOCUS_DEACTIVE;

/**
 * Class for the layer view that represents the currently focused cell
 * @module view/focusLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var FocusLayer = View.extend(/** @lends module:view/focusLayer.prototype */{
    initialize: function(options) {
        this.focusModel = options.focusModel;
        this.columnModel = options.columnModel;
        this.coordRowModel = options.coordRowModel;
        this.coordColumnModel = options.coordColumnModel;
        this.coordConverterModel = options.coordConverterModel;
        this.whichSide = options.whichSide;

        this.borderEl = {
            $top: $(HTML_BORDER_DIV),
            $left: $(HTML_BORDER_DIV),
            $right: $(HTML_BORDER_DIV),
            $bottom: $(HTML_BORDER_DIV)
        };

        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._refreshCurrentLayout);
        this.listenTo(this.coordRowModel, 'reset', this._refreshCurrentLayout);
        this.listenTo(this.focusModel, 'blur', this._onBlur);
        this.listenTo(this.focusModel, 'focus', this._onFocus);
        this.listenTo(this.focusModel, 'change:active', this._onChangeActiveState);
    },

    className: classNameConst.LAYER_FOCUS,

    /**
     * Refresh the layout of current layer
     * @private
     */
    _refreshCurrentLayout: function() {
        var focusModel = this.focusModel;

        if (this.$el.css('display') !== 'none') {
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
        var targetSide = this.columnModel.isLside(columnName) ? frameConst.L : frameConst.R;

        if (targetSide === this.whichSide) {
            this._refreshBorderLayout(rowKey, columnName);
            this.$el.show();
        }
    },

    /**
     * Event handler for 'change:active' event on module:model/focus
     * @param {object} model - Focus model
     * @private
     */
    _onChangeActiveState: function(model) {
        if (!model.changed.active) {
            this.$el.addClass(BLUR_CLASS_NAME);
        } else {
            this.$el.removeClass(BLUR_CLASS_NAME);
        }
    },

    /**
     * Resets the position and the dimension of the layer.
     * @param {Number} rowKey - row key
     * @param {String} columnName - column name
     * @private
     */
    _refreshBorderLayout: function(rowKey, columnName) {
        var pos = this.coordConverterModel.getCellPosition(rowKey, columnName);
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
