/**
 * @fileoverview Class for the pagination
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var TuiPaginaton = require('tui-pagination');

var View = require('../base/view');
var defaultOptions = {
    totalItems: 1,
    itemsPerPage: 10,
    visiblePages: 5,
    centerAlign: true
};
var TUI_PAGINATION_CLASSNAME = 'tui-pagination';

/**
 * Class for the pagination
 * @module view/pagination
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Pagination = View.extend(/** @lends module:view/pagination.prototype */{
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.componentHolder = options.componentHolder;

        this._stopEventPropagation();

        this.on('appended', this._onAppended);
    },

    className: TUI_PAGINATION_CLASSNAME,

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this._destroyChildren();
        this.componentHolder.setInstance('pagination', this._createComponent());

        return this;
    },

    /**
     * Stop propagation of mouse down event
     * @private
     */
    _stopEventPropagation: function() {
        this.$el.mousedown(function(ev) {
            ev.stopPropagation();
        });
    },

    /**
     * Event handler for 'appended' event
     * @private
     */
    _onAppended: function() {
        this.dimensionModel.set('paginationHeight', this.$el.outerHeight());
    },

    /**
     * Create an option object for creating a tui.component.Pagination component.
     * @returns {Object}
     */
    _createOptionObject: function() {
        var customOptions = this.componentHolder.getOptions('pagination');

        if (customOptions === true) {
            customOptions = {};
        }

        return _.assign({}, defaultOptions, customOptions);
    },

    /**
     * Create new tui.component.Pagination instance
     * @returns {tui.component.Pagination}
     * @private
     */
    _createComponent: function() {
        var ComponentClass = TuiPaginaton;

        if (!ComponentClass) {
            throw new Error('Cannot find component \'tui.component.Pagination\'');
        }

        return new ComponentClass(this.$el, this._createOptionObject());
    }
});

module.exports = Pagination;
