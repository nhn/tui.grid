/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * left side 프레임 클래스
 * @module view/layout/frame-lside
 */
var LsideFrame = Frame.extend(/**@lends module:view/layout/frame-lside.prototype */{
    /**
     * @constructs
     * @extends module:view/layout/frame
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    },

    className: 'lside_area',

    /**
     * columnWidth 변경시 호출될 이벤트 핸들러
     * @private
     */
    _onColumnWidthChanged: function() {
        var width = this.grid.dimensionModel.get('lsideWidth');
        this.$el.css({
            width: width + 'px'
        });
    },
    /**
     * 랜더링하기 전 수행되는 메서드
     */
    beforeRender: function() {
        var width = this.grid.dimensionModel.get('lsideWidth');
        this.$el.css({
            display: 'block',
            width: width + 'px'
        });
    }
});

module.exports = LsideFrame;
