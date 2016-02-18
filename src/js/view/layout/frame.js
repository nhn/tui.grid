/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * Base class for frame view.
 * @module view/layout/frame
 * @extends module:base/view
 */
var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
    /**
     * @constructs
     * @param {Object} options Options
     *      @param {String} [options.whichSide='R'] 'R' for Right side, 'L' for Left side
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            viewFactory: options.viewFactory,
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.renderModel, 'columnModelChanged', this.render, this)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
    },

    tagName: 'div',

    className: 'lside_area',

    /**
     * Render
     * @returns {module:view/layout/frame} This object
     */
    render: function() {
        var factory = this.viewFactory;

        this.$el.empty();
        this._destroyChildren();

        this.beforeRender();
        this._addChildren([
            factory.createHeader(this.whichSide),
            factory.createBody(this.whichSide)
        ]);
        this.$el.append(this._renderChildren());
        this.afterRender();

        return this;
    },

    /**
     * Event handler for 'columnWidthChanged' event on module:module/dimension
     * @abstract
     * @private
     */
    _onColumnWidthChanged: function() {},

    /**
     * To be called at the beginning of the 'render' method.
     * @abstract
     */
    beforeRender: function() {},

    /**
     * To be called at the end of the 'render' method.
     * @abstract
     */
    afterRender: function() {}
});

module.exports = Frame;
