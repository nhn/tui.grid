/**
 * @fileoverview Left Side Frame 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');
var VirtualScrollBar = require('./virtualScrollBar');

/**
 * right side 프레임 클래스
 * @constructor View.Layout.Frame.Rside
 */
var RsideFrame = Frame.extend(/**@lends RsideFrame.prototype */{
    className: 'rside_area',
    /**
     * 초기화 함수
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'R'
        });
    },
    /**
     * 컬럼 width 값이 변경되었을때 이벤트 핸들러
     * @private
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
     * 랜더링하기 전 수행되는 메서드
     * @private
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
     * 랜더링 후 수행되는 메서드
     * @private
     */
    afterRender: function() {
        var scrollbar, $space, height;

        if (!this.grid.option('scrollY')) {
            return;
        }
        $space = $('<div></div>');
        height = this.grid.dimensionModel.get('headerHeight') - 2;  //높이에서 상 하단 border 값 2를 뺀다.

        $space.css({
            height: height + 'px'
        }).addClass('space');

        this.$el.append($space);

        if (!this.grid.option('notUseSmartRendering')) {
            scrollbar = this.createView(VirtualScrollBar, {
                grid: this.grid
            });
            this.$el.append(scrollbar.render().el);
        }
    }
});

module.exports = RsideFrame;
