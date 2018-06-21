/**
 * @fileoverview Right Side Frame
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var Frame = require('./frame');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;
var dimensionConst = constMap.dimension;
var summaryPositionConst = constMap.summaryPosition;

var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

var RsideFrame;

/**
 * Create div element to use on right-side area
 * @param {string} className - class name to add on element
 * @param {object} styles - style object to set css
 * @returns {jQuery} created div element
 * @ignore
 */
function createDiv(className, styles) {
    var $element = $('<div />').addClass(className);

    if (styles) {
        $element.css(styles);
    }

    return $element;
}

/**
 * right side frame class
 * @module view/layout/frame-rside
 * @extends module:view/layout/frame
 * @ignore
 */
RsideFrame = Frame.extend(/** @lends module:view/layout/frame-rside.prototype */{
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);

        _.assign(this, {
            whichSide: frameConst.R,
            $scrollBorder: null
        });
        this.listenTo(this.dimensionModel, 'change:lsideWidth change:rsideWidth', this._onFrameWidthChanged);
        this.listenTo(this.dimensionModel, 'change:bodyHeight change:headerHeight',
            this._resetScrollBorderHeight);
    },

    className: classNameConst.RSIDE_AREA,

    /**
     * Event handler for 'change:rsideWidth' event on dimensionModel
     * @private
     * @override
     */
    _onFrameWidthChanged: function() {
        this._refreshLayout();
    },

    /**
     * Refresh layout
     * @private
     */
    _refreshLayout: function() {
        var dimensionModel = this.dimensionModel;
        var width = dimensionModel.get('rsideWidth');
        var marginLeft = dimensionModel.get('lsideWidth');
        var frozenBorderWidth = dimensionModel.get('frozenBorderWidth');

        // If the left side exists and the division border should not be doubled,
        // left side should cover the right side by border-width to hide the left border of the right side.
        if (marginLeft > 0 && !dimensionModel.isDivisionBorderDoubled()) {
            width += CELL_BORDER_WIDTH;
            marginLeft -= CELL_BORDER_WIDTH;
        }

        this.$el.css({
            width: width,
            marginLeft: marginLeft + frozenBorderWidth
        });
    },

    /**
     * Resets the height of a vertical scroll-bar border
     * @private
     */
    _resetScrollBorderHeight: function() {
        var dimensionModel, height;

        if (this.$scrollBorder) {
            dimensionModel = this.dimensionModel;
            height = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();
            this.$scrollBorder.height(height);
        }
    },

    /**
     * To be called at the beginning of the 'render' method.
     * @override
     */
    beforeRender: function() {
        this.$el.css('display', 'block');
        this._refreshLayout();
    },

    /**
     * To be called at the end of the 'render' method.
     * @override
     */
    afterRender: function() {
        var dimensionModel = this.dimensionModel;
        var scrollX = dimensionModel.get('scrollX');
        var scrollY = dimensionModel.get('scrollY');
        var spaceHeights = this._getSpaceHeights(scrollX, scrollY);

        this._setScrollbar(scrollX, scrollY, spaceHeights);

        if (dimensionModel.get('frozenBorderWidth')) {
            this._setFrozenBorder(scrollX);
        }

        this._resetScrollBorderHeight();
    },

    /**
     * Get height values of top, bottom space on scroll area
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @param {boolean} scrollY - Whether the grid has y-scroll or not
     * @returns {object} Heighs value
     * @private
     */
    _getSpaceHeights: function(scrollX, scrollY) {
        var dimensionModel = this.dimensionModel;
        var summaryHeight = dimensionModel.get('summaryHeight');
        var summaryPosition = dimensionModel.get('summaryPosition');
        var topHeight = dimensionModel.get('headerHeight');
        var bottomHeight = scrollX ? dimensionConst.SCROLLBAR_WIDTH : 0;

        if (scrollY && summaryHeight) {
            if (summaryPosition === summaryPositionConst.TOP) {
                topHeight += summaryHeight + dimensionConst.TABLE_BORDER_WIDTH;
            } else {
                bottomHeight += summaryHeight;
            }
        }

        return {
            top: topHeight,
            bottom: bottomHeight
        };
    },

    /**
     * Create scrollbar area and set styles
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @param {boolean} scrollY - Whether the grid has y-scroll or not
     * @param {object} spaceHeights - Height values of top, bottom space on scroll area
     * @private
     */
    _setScrollbar: function(scrollX, scrollY, spaceHeights) {
        var $yInnerBorder, $yOuterBorder, $spaceRightTop, $spaceRightBottom, $frozenBorder;

        if (scrollX) {
            $frozenBorder = createDiv(classNameConst.SCROLLBAR_FROZEN_BORDER, {
                height: dimensionConst.SCROLLBAR_WIDTH
            });
        }

        if (scrollY) {
            // subtract 2px for border-width (top and bottom)
            $spaceRightTop = createDiv(classNameConst.SCROLLBAR_RIGHT_TOP, {
                height: spaceHeights.top - 2
            });
            $yInnerBorder = createDiv(classNameConst.SCROLLBAR_Y_INNER_BORDER, {
                top: spaceHeights.top
            });
            $yOuterBorder = createDiv(classNameConst.SCROLLBAR_Y_OUTER_BORDER);
        }

        if (scrollX || scrollY) {
            $spaceRightBottom = createDiv(classNameConst.SCROLLBAR_RIGHT_BOTTOM, {
                height: spaceHeights.bottom
            });
        }

        this.$el.append(
            $yInnerBorder,
            $yOuterBorder,
            $spaceRightTop,
            $spaceRightBottom,
            $frozenBorder
        );

        this.$scrollBorder = $yInnerBorder;
    },

    /**
     * Create frozen border and set styles
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @private
     */
    _setFrozenBorder: function() {
        var dimensionModel = this.dimensionModel;
        var headerHeight = dimensionModel.get('headerHeight');
        var frozenBorderWidth = dimensionModel.get('frozenBorderWidth');
        var resizeHandleView = this.viewFactory.createHeaderResizeHandle(frameConst.L, [headerHeight], true);
        var $resizeHanlder = resizeHandleView.render().$el;
        var $frozenBorder = createDiv(classNameConst.FROZEN_BORDER, {
            marginLeft: -frozenBorderWidth,
            width: frozenBorderWidth
        });

        this.$el.append($resizeHanlder, $frozenBorder)
            .find('.' + classNameConst.SCROLLBAR_FROZEN_BORDER)
            .css({
                marginLeft: -(frozenBorderWidth + CELL_BORDER_WIDTH),
                width: frozenBorderWidth
            });
    }
});

module.exports = RsideFrame;
