/**
 * @fileoverview Layer Empty
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 데이터 없음 레이어
 * @memberof View.Layer
 * @constructor View.Layer.Empty
 */
View.Layer.Empty = View.Layer.Base.extend(/**@lends View.Layer.Empty.prototype */{
    className: 'no_row_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '데이터가 존재하지 않습니다.'
        });
    },
    template: _.template('<%=text%>')
});
