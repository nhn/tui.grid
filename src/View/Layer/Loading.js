/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Loading = View.Layer.Base.extend({
    className: 'loading_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});
