/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var renderStateMap = require('../common/constMap').renderState;
var DELAY_FOR_SHOWING_LAYER = 200;

/**
 * Layer class that represents the state of rendering phase.
 * @module view/stateLayer
 * @extends module:base/view
 */
var StateLayer = View.extend(/**@lends module:view/stateLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.timeoutIdForDelay = null;

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
     * @returns {object} This object
     */
    render: function() {
        var renderState = this.renderModel.get('state'),
            self = this;

        if (this.timeoutIdForDelay !== null) {
            clearTimeout(this.timeoutIdForDelay);
            this.timeoutIdForDelay = null;
        }

        switch (renderState) {
            case renderStateMap.DONE:
                this.$el.hide();
                break;
            case renderStateMap.EMPTY:
                this._showLayer(renderState);
                break;
            case renderStateMap.LOADING:
                this.timeoutIdForDelay = setTimeout(function() {
                    self._showLayer(renderState);
                }, DELAY_FOR_SHOWING_LAYER);
                break;
            default:
                // do nothing
        }

        return this;
    },

    /**
     * Shows the state layer.
     * @param {string} renderState - Render state {@link module:common/constMap#renderState}
     * @private
     */
    _showLayer: function(renderState) {
        var layerHtml = this.template({
            text: this._getMessage(renderState),
            isLoading: (renderState === renderStateMap.LOADING)
        });

        this.$el.html(layerHtml).show();
        this._refreshLayout();
    },

    /**
     * Returns the message based on the renderState value
     * @param  {string} renderState - Renderer.state value
     * @returns {string} - Message
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
