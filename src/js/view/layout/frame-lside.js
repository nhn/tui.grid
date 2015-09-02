/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * left side 프레임 클래스
 * @constructor View.Layout.Frame.Lside
 */
var LsideFrame = Frame.extend(/**@lends View.Layout.Frame.Lside.prototype */{
    className: 'lside_area',
    /**
     * 초기화 메서드
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    },
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
