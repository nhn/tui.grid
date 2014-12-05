/**
 * @fileoverview Layer Loading
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 로딩 레이어
 * @constructor View.Layer.Loading
 */
View.Layer.Loading = View.Layer.Base.extend(/**@lends View.Layer.Loading.prototype */{
    className: 'loading_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});
