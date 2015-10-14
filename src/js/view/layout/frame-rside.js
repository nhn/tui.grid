/**
 * @fileoverview Right Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * right side frame class
 * @module view/layout/frame-rside
 */
var RsideFrame = Frame.extend(/**@lends module:view/layout/frame-rside.prototype */{
    /**
     * @constructs
     * @extends module:view/layout/frame
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'R',
            $scrollBorder: null
        });
        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight change:headerHeight',
            this._resetScrollBorderHeight);
    },

    className: 'rside_area',

    /**
     * Event handler for 'columnWidthChanged' event on dimensionModel
     * @private
     * @override
     */
    _onColumnWidthChanged: function() {
        var dimensionModel = this.grid.dimensionModel,
            marginLeft = dimensionModel.get('lsideWidth'),
            width = dimensionModel.get('rsideWidth');

        this.$el.css({
            width: width + 'px',
            marginLeft: marginLeft + 'px'
        });
    },

    /**
     * Resets the height of a vertical scroll-bar border
     */
    _resetScrollBorderHeight: function() {
        var dimensionModel = this.grid.dimensionModel,
            height = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();

        this.$scrollBorder.height(height);
    },

    /**
     * To be called before rendering.
     */
    beforeRender: function() {
        var dimensionModel = this.grid.dimensionModel,
            marginLeft = dimensionModel.get('lsideWidth'),
            width = dimensionModel.get('rsideWidth');

        this.$el.css({
            display: 'block',
            width: width + 'px',
            marginLeft: marginLeft + 'px'
        });
    },

    /**
     * To be called after rendering.
     */
    afterRender: function() {
        var dimensionModel = this.grid.dimensionModel,
            $space, $scrollBorder, headerHeight, bodyHeight;

        if (!this.grid.option('scrollY')) {
            return;
        }
        headerHeight = dimensionModel.get('headerHeight');
        bodyHeight = dimensionModel.get('bodyHeight');

        // Empty div for hiding scrollbar area in header
        $space = $('<div />').addClass('header_space');
        // Empty div for showing a border of vertical scrollbar area in body
        $scrollBorder = $('<div />').addClass('scrollbar_border');

        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
        $scrollBorder.css('top', headerHeight + 'px');

        this.$el.append($space).append($scrollBorder);
        this.$scrollBorder = $scrollBorder;

        this._resetScrollBorderHeight();
    }
});

module.exports = RsideFrame;
