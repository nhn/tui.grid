/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var renderStateMap = require('../common/constMap').renderState;

/**
 * Layer class that represents the state of rendering phase.
 * @module view/stateLayer
 */
var StateLayer = View.extend(/**@lends module:view/stateLayer.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;

        this.listenTo(this.dimensionModel, 'change', this._refreshLayout);
        this.listenTo(this.renderModel, 'change:state', this.render);
    },

    className: 'state_layer',

    template: _.template(
        '<div class="layer_content">' +
        '    <%= text %>' +
        '    <% if (isLoading) { %>' +
        '    <div class="loading_img"></div>' +
        '    <% } %>' +
        '</div>'
    ),

    /**
     * Render
     * @return {object} This object
     */
    render: function() {
        var renderState = this.renderModel.get('state');

        if (renderState === renderStateMap.DONE) {
            this.$el.hide();
        } else {
            this.$el.html(this.template({
                text: this._getMessage(renderState),
                isLoading: (renderState === renderStateMap.LOADING)
            })).show();
            this._refreshLayout();
        }
        return this;
    },

    /**
     * Returns the message based on the renderState value
     * @param  {string} renderState - Renderer.state value
     * @return {string} - Message
     */
    _getMessage: function(renderState) {
        switch (renderState) {
            case renderStateMap.LOADING:
                return '요청을 처리 중입니다.';
            case renderStateMap.EMPTY:
                return (this.renderModel.get('emptyMessage') || '데이터가 존재하지 않습니다.');
            default:
                return null;
        }
    },

    /**
     * Sets the marginTop and height value.
     * @private
     */
    _refreshLayout: function() {
        var dimensionModel = this.dimensionModel;

        this.$el.css({
            marginTop: dimensionModel.get('headerHeight'),
            height: dimensionModel.get('bodyHeight') + dimensionModel.get('toolbarHeight')
        });
    }
});

module.exports = StateLayer;
