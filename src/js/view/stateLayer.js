/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var View = require('../base/view');
var stateConst = require('../common/constMap').renderState;
var classNameConst = require('../common/classNameConst');
var i18n = require('../common/i18n');
var TABLE_BORDER_WIDTH = require('../common/constMap').dimension.TABLE_BORDER_WIDTH;

/**
 * Layer class that represents the state of rendering phase.
 * @module view/stateLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var StateLayer = View.extend(/** @lends module:view/stateLayer.prototype */{
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
                return i18n.get('display.loadingData');
            case stateConst.EMPTY:
                return i18n.get('display.noData');
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
        var scrollXHeight = dimensionModel.getScrollXHeight();
        var scrollYWidth = dimensionModel.getScrollYWidth();

        this.$el.css({
            top: headerHeight - TABLE_BORDER_WIDTH,
            height: bodyHeight - scrollXHeight - TABLE_BORDER_WIDTH,
            left: 0,
            right: scrollYWidth
        });
    }
});

module.exports = StateLayer;
