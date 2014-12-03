/**
 * @fileoverview Layer Ready
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 초기화 레이어
 * @memberof View.Layer
 * @constructor View.Layer.Ready
 */
View.Layer.Ready = View.Layer.Base.extend(/**@lends View.Layer.Ready.prototype */{
    className: 'initializing_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    }
});
