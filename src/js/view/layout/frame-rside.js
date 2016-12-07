/**
 * @fileoverview Right Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

/**
 * right side frame class
 * @module view/layout/frame-rside
 * @extends module:view/layout/frame
 * @ignore
 */
var RsideFrame = Frame.extend(/**@lends module:view/layout/frame-rside.prototype */{
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
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
        var headerHeight, footerHeight;
        var $space, $scrollBorder;

        if (!dimensionModel.get('scrollY')) {
            return;
        }
        headerHeight = dimensionModel.get('headerHeight');
        footerHeight = dimensionModel.get('footerHeight');

        // Empty DIV for hiding scrollbar in the header area
        $space = $('<div />').addClass(classNameConst.SCROLLBAR_HEAD);

        // Empty DIV for showing a left-border of vertical scrollbar in the body area
        $scrollBorder = $('<div />').addClass(classNameConst.SCROLLBAR_BORDER);

        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
        $scrollBorder.css('top', headerHeight + 'px');

        this.$el.append($space, $scrollBorder);

        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
        //  casues to be stuck in the same position in Chrome)
        if (dimensionModel.get('scrollX')) {
            this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_RIGHT_BOTTOM));
        }

        // Empty DIV for filling gray color in the right side of the footer.
        if (footerHeight && dimensionModel.get('scrollY')) {
            this.$el.append($('<div>')
                .addClass(classNameConst.FOOT_AREA_RIGHT)
                .css('height', footerHeight - CELL_BORDER_WIDTH)
            );
        }

        this.$scrollBorder = $scrollBorder;
        this._resetScrollBorderHeight();
    }
});

module.exports = RsideFrame;
