/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var stateConst = require('../common/constMap').renderState;
var classNameConst = require('../common/classNameConst');
var TABLE_BORDER_WIDTH = require('../common/constMap').dimension.TABLE_BORDER_WIDTH;

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

    className: classNameConst.LAYER_STATE,

    template: _.template(
        '<div class="' + classNameConst.LAYER_STATE_CONTENT + '">' +
        '    <%= text %>' +
        '    <% if (isLoading) { %>' +
        '    <div class="' + classNameConst.LAYER_STATE_LOADING + '"></div>' +
        '    <% } %>' +
        '</div>'
    ),

    /**
     * Render
     * @returns {object} This object
     */
    render: function() {
        var renderState = this.renderModel.get('state');

        if (renderState === stateConst.DONE) {
            this.$el.hide();
        } else {
            this._showLayer(renderState);
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
            isLoading: (renderState === stateConst.LOADING)
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
            case stateConst.LOADING:
                return '요청을 처리 중입니다.';
            case stateConst.EMPTY:
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
        var headerHeight = this.dimensionModel.get('headerHeight');
        var toolbarHeight = this.dimensionModel.get('toolbarHeight');

        this.$el.css('top', headerHeight + toolbarHeight - TABLE_BORDER_WIDTH);
    }
});

module.exports = StateLayer;
