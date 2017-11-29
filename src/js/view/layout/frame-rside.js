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
var summaryPositionConst = constMap.summaryPosition;

var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

/**
 * right side frame class
 * @module view/layout/frame-rside
 * @extends module:view/layout/frame
 * @ignore
 */
var RsideFrame = Frame.extend(/** @lends module:view/layout/frame-rside.prototype */{
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

        // If the left side exists and the division border should not be doubled,
        // left side should cover the right side by border-width to hide the left border of the right side.
        if (marginLeft > 0 && !dimensionModel.isDivisionBorderDoubled()) {
            width += CELL_BORDER_WIDTH;
            marginLeft -= CELL_BORDER_WIDTH;
        }

        this.$el.css({
            width: width,
            marginLeft: marginLeft
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
        var headerHeight = dimensionModel.get('headerHeight');
        var summaryHeight = dimensionModel.get('summaryHeight');
        var summaryPosition = dimensionModel.get('summaryPosition');

        if (dimensionModel.hasFrozenBorder()) {
            this._setFrozenBorder(headerHeight, scrollX);
        }

        if (!scrollY) {
            return;
        }

        this._setScrollbar(headerHeight, summaryHeight, summaryPosition, scrollX);

        if (summaryHeight) {
            this._applyStyleToSummary(headerHeight, summaryHeight, summaryPosition, scrollX);
        }

        this._resetScrollBorderHeight();
    },

    /**
     * Create scrollbar area and set styles
     * @param {number} headerHeight - Height of the header area
     * @param {number} summaryHeight - Height of summary area by setting "summary" option
     * @param {string} summaryPosition - Position of summary area ('top' or 'bottom')
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @private
     */
    _setScrollbar: function(headerHeight, summaryHeight, summaryPosition, scrollX) {
        var $space, $scrollBorder;

        // Empty DIV for hiding scrollbar in the header area
        $space = $('<div />').addClass(classNameConst.SCROLLBAR_HEAD);

        // Empty DIV for showing a left-border of vertical scrollbar in the body area
        $scrollBorder = $('<div />').addClass(classNameConst.SCROLLBAR_BORDER);

        if (summaryPosition === summaryPositionConst.TOP) {
            headerHeight += summaryHeight;
        }

        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
        $scrollBorder.css('top', headerHeight + 'px');

        this.$el.append($space, $scrollBorder);

        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
        //  casues to be stuck in the same position in Chrome)
        if (scrollX) {
            this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_RIGHT_BOTTOM));
        }

        this.$scrollBorder = $scrollBorder;
    },

    /**
     * Create frozen border and set styles
     * @param {number} headerHeight - Height of the header area
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @private
     */
    _setFrozenBorder: function(headerHeight, scrollX) {
        var frozenBorderWidth = this.dimensionModel.get('frozenBorderWidth');
        var resizeHandleView = this.viewFactory.createHeaderResizeHandle(frameConst.L, [headerHeight], true);
        var $el = this.$el;

        $el.append(resizeHandleView.render().$el);

        $el.find('.' + classNameConst.HEAD_AREA).css('border-left-width', frozenBorderWidth);
        $el.find('.' + classNameConst.BODY_AREA).css('border-left-width', frozenBorderWidth);
        $el.find('.' + classNameConst.SUMMARY_AREA).css('border-left-width', frozenBorderWidth);

        // If you don't initialize the table left-border to 0,
        // the left-border moves when the right side area is scrolled.
        $el.find('.' + classNameConst.TABLE).css('border-left-width', 0);

        if (scrollX) {
            $el.append($('<div>')
                .addClass(classNameConst.FROZEN_BORDER_BOTTOM)
                .css('width', frozenBorderWidth)
            );
        }
    },

    /**
     * Apply style to summary area on right-side frame
     * @param {number} headerHeight - Height of header area
     * @param {number} summaryHeight - Height of summary area by setting "summary" option
     * @param {string} summaryPosition - Position of summary area ('top' or 'bottom')
     * @param {boolean} scrollX - Whether the grid has x-scroll or not
     * @private
     */
    _applyStyleToSummary: function(headerHeight, summaryHeight, summaryPosition, scrollX) {
        var styles = {};
        var subClassName;

        if (summaryPosition === summaryPositionConst.TOP) {
            styles.top = headerHeight;
            subClassName = classNameConst.SUMMARY_AREA_RIGHT_TOP;
        } else {
            styles.bottom = scrollX ? this.dimensionModel.getScrollXHeight() : 0;
            subClassName = classNameConst.SUMMARY_AREA_RIGHT_BOTTOM;
        }

        styles.height = summaryHeight;

        this.$el.append($('<div>')
            .addClass(classNameConst.SUMMARY_AREA_RIGHT)
            .addClass(subClassName)
            .css(styles)
        );
    }
});

module.exports = RsideFrame;
