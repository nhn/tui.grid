/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Empty = View.Layer.Base.extend({
    className: 'no_row_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '데이터가 존재하지 않습니다.'
        });
    },
    template: _.template('<%=text%>')
});
