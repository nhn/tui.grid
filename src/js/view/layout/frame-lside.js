/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');
var classNameConst = require('../../common/classNameConst');

/**
 * Left Side Frame
 * @module view/layout/frame-lside
 * @extends module:view/layout/frame
 */
var LsideFrame = Frame.extend(/**@lends module:view/layout/frame-lside.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    },

    className: classNameConst.LSIDE_AREA,

    /**
     * Event handler for 'changeColumnWidth' event on module:model/dimension
     * @override
     * @private
     */
    _onColumnWidthChanged: function() {
        this.$el.css({
            width: this.dimensionModel.get('lsideWidth')
        });
    },

    /**
     * To be called at the beginning of the 'render' method.
     * @override
     */
    beforeRender: function() {
        this.$el.css({
            display: 'block',
            width: this.dimensionModel.get('lsideWidth')
        });
    },

    /**
     * To be called at the end of the 'render' method.
     * @override
     */
    afterRender: function() {
        var dimensionModel = this.dimensionModel;
        var $leftBottom, footerHeight;

        if (!dimensionModel.get('scrollX')) {
            return;
        }

        $leftBottom = $('<div>').addClass(classNameConst.SCROLLBAR_LEFT_BOTTOM);
        footerHeight = dimensionModel.get('footerHeight');

        if (footerHeight) {
            // $leftBottom.css('bottom', footerHeight);
        }
        this.$el.append($leftBottom);
    }
});

module.exports = LsideFrame;
