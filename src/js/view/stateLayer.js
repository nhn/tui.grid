/**
 * @fileoverview Base class for layers
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

var message = {
    LOADING: '요청을 처리 중입니다.',
    EMPTY: '데이터가 존재하지 않습니다.'
};

/**
 * Base class for layers
 * @module view/layer
 */
var StateLayer = View.extend(/**@lends module:view/layer.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);

        this.listenTo(this.grid.dimensionModel, 'change', this._resize);
        this.listenTo(this.grid.renderModel, 'change:state', this.render);
    },

    className: 'state_layer',

    template: _.template(
        '<div>' +
        '    <%= text %>' +
        '    <% if (isLoading) { %>' +
        '    <div class="loading_img"></div>' +
        '    <% } %>' +
        '</div>'
    ),

    /**
     * 랜더링 한다.
     * @param {String} text 레이어에 노출할 text
     * @return {View.Layer.Base} this object
     */
    render: function(text) {
        var renderState = this.grid.renderModel.get('state');

        if (renderState === 'DONE') {
            this.$el.hide();
        } else {
            this.$el.html(this.template({
                text: message[renderState],
                isLoading: (renderState === 'LOADING')
            })).show();
            this._resize();
        }
        return this;
    },

    /**
     * 그리드의 크기에 맞추어 resize 한다.
     * @private
     */
    _resize: function() {
        var dimensionModel = this.grid.dimensionModel;

        this.$el.css({
            marginTop: dimensionModel.get('headerHeight'),
            height: dimensionModel.get('bodyHeight')
        });
    }
});

module.exports = StateLayer;
