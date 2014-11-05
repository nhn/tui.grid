View.Layer.Ready = View.Layer.Base.extend({
    className: 'initializing_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    }
});
