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

var MESSAGE_LOADING = '요청을 처리 중입니다.';
var MESSAGE_EMPTY = '데이터가 존재하지 않습니다.';

/**
 * Layer class that represents the state of rendering phase.
 * @module view/stateLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var StateLayer = View.extend(/**@lends module:view/stateLayer.prototype */{
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;

        this.listenTo(this.dimensionModel, 'change', this._refreshLayout);
        this.listenTo(this.renderModel, 'change:state', this.render);
    },

    className: classNameConst.LAYER_STATE,

    template: _.template(
        '<div class="' + classNameConst.LAYER_STATE_CONTENT + '">' +
        '    <p><%= text %></p>' +
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
                return MESSAGE_LOADING;
            case stateConst.EMPTY:
                return (this.renderModel.get('emptyMessage') || MESSAGE_EMPTY);
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
        var headerHeight = dimensionModel.get('headerHeight');
        var bodyHeight = dimensionModel.get('bodyHeight');
        var toolbarHeight = dimensionModel.get('toolbarHeight');
        var scrollXHeight = dimensionModel.getScrollXHeight();
        var scrollYWidth = dimensionModel.getScrollYWidth();

        this.$el.css({
            top: headerHeight + toolbarHeight - TABLE_BORDER_WIDTH,
            height: bodyHeight - scrollXHeight - TABLE_BORDER_WIDTH,
            left: 0,
            right: scrollYWidth
        });
    }
});

StateLayer.MESSAGE_LOADING = MESSAGE_LOADING;
StateLayer.MESSAGE_EMPTY = MESSAGE_EMPTY;

module.exports = StateLayer;
