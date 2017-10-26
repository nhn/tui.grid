/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var View = require('../../base/view');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;
var summaryPositionConst = constMap.summaryPosition;

/**
 * Base class for frame view.
 * @module view/layout/frame
 * @extends module:base/view
 * @param {Object} options Options
 *      @param {String} [options.whichSide=R] R for Right side, L for Left side
 * @ignore
 */
var Frame = View.extend(/** @lends module:view/layout/frame.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        _.assign(this, {
            viewFactory: options.viewFactory,
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            whichSide: options.whichSide || frameConst.R
        });

        this.listenTo(this.renderModel, 'columnModelChanged', this.render);
    },

    /**
     * Render
     * @returns {module:view/layout/frame} This object
     */
    render: function() {
        this.$el.empty();
        this._destroyChildren();

        this.beforeRender();

        this._addChildren(this._createChildren());
        this.$el.append(this._renderChildren());
        this.afterRender();

        return this;
    },

    /**
     * To be called at the beginning of the 'render' method.
     * @abstract
     */
    beforeRender: function() {},

    /**
     * To be called at the end of the 'render' method.
     * @abstract
     */
    afterRender: function() {},

    /**
     * Create children view to append on frame element
     * @returns {array} View elements
     * @private
     */
    _createChildren: function() {
        var factory = this.viewFactory;
        var summaryPosition = this.dimensionModel.get('summaryPosition');
        var header = factory.createHeader(this.whichSide);
        var body = factory.createBody(this.whichSide);
        var summary = factory.createSummary(this.whichSide, summaryPosition);
        var children;

        if (summaryPosition === summaryPositionConst.TOP) {
            children = [header, summary, body];
        } else if (summaryPosition === summaryPositionConst.BOTTOM) {
            children = [header, body, summary];
        } else {
            children = [header, body];
        }

        return children;
    }
});

module.exports = Frame;
