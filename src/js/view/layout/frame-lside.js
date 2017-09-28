/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var Frame = require('./frame');
var classNameConst = require('../../common/classNameConst');
var frameConst = require('../../common/constMap').frame;

/**
 * Left Side Frame
 * @module view/layout/frame-lside
 * @extends module:view/layout/frame
 * @ignore
 */
var LsideFrame = Frame.extend(/** @lends module:view/layout/frame-lside.prototype */{
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        _.assign(this, {
            whichSide: frameConst.L
        });

        this.listenTo(this.dimensionModel, 'change:lsideWidth', this._onFrameWidthChanged);
    },

    className: classNameConst.LSIDE_AREA,

    /**
     * Event handler for 'change:lsideWidth' event on module:model/dimension
     * @private
     */
    _onFrameWidthChanged: function() {
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
        if (!this.dimensionModel.get('scrollX')) {
            return;
        }

        this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_LEFT_BOTTOM));
    }
});

module.exports = LsideFrame;
