/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var frameConst = require('../../common/constMap').frame;

/**
 * Base class for frame view.
 * @module view/layout/frame
 * @extends module:base/view
 * @param {Object} options Options
 *      @param {String} [options.whichSide=R] R for Right side, L for Left side
 * @ignore
 */
var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
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
        var factory = this.viewFactory;

        this.$el.empty();
        this._destroyChildren();

        this.beforeRender();
        this._addChildren([
            factory.createHeader(this.whichSide),
            factory.createBody(this.whichSide),
            factory.createFooter(this.whichSide)
        ]);
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
    afterRender: function() {}
});

module.exports = Frame;
