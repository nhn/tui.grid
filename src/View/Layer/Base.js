/**
 * @fileoverview Layer Base
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
/**
 * 레이어 기반 클래스
 * @constructor View.Layer.Base
 */
View.Layer.Base = View.Base.extend(/**@lends View.Layer.Base.prototype */{
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
    /**
     * 랜더링 한다.
     * @param {String} text
     * @return {View.Layer.Base}
     */
    render: function(text) {
        this.$el.html(this.template({
            text: text || this.text
        })).css('display', 'none');
        return this;
    },
    /**
     * Layer를 노출한다.
     * @param {String} text
     */
    show: function(text) {
        this.render(text).$el.css('display', 'block')
            .css('zIndex', 1);
        this._resize();
    },
    /**
     * Layer 를 감춘다.
     */
    hide: function() {
        this.$el.css('display', 'none');
    },
    /**
     * 그리드의 크기에 맞추어 resize 한다.
     * @private
     */
    _resize: function() {
        if (this.$el.css('display') === 'block') {
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight');
            this.$el.css('marginTop', headerHeight + 'px')
                .css('height', bodyHeight + 'px');
        }
    }
});
