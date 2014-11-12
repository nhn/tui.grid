/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Base = View.Base.extend({
    initialize: function(attributes) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '기본 텍스트'
        });
        this.listenTo(this.grid.dimensionModel, 'change', this._resize, this);
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>'),
    render: function(text) {
        this.$el.html(this.template({
            text: text || this.text
        })).css('display', 'none');
        return this;
    },

    show: function(text) {
        this.render(text).$el.css('display', 'block')
            .css('zIndex', 1);
        this._resize();
    },
    hide: function() {
        this.$el.css('display', 'none');
    },
    _resize: function() {
        if (this.$el.css('display') === 'block') {
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight');
            this.$el.css('marginTop', headerHeight + 'px')
                .css('height', bodyHeight + 'px');
        }
    }
});