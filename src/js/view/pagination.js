/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');

var HTML_BTNS =
    '<a href="#" class="' + classNameConst.PAGINATION_PRE_END + '" title="First page">First</a>' +
    '<a href="#" class="' + classNameConst.PAGINATION_PRE + '" title="Previous page">Prev</a> ' +
    '<a href="#" class="' + classNameConst.PAGINATION_NEXT + '" title="Next page">Next</a>' +
    '<a href="#" class="' + classNameConst.PAGINATION_NEXT_END + '" title="Last page">Last</a>' +
    '<span class="' + classNameConst.PAGINATION_PRE_END_OFF + '">First Off</span>' +
    '<span class="' + classNameConst.PAGINATION_PRE_OFF + '">Prev Off</span>' +
    '<span class="' + classNameConst.PAGINATION_NEXT_OFF + '">Next Off</span>' +
    '<span class="' + classNameConst.PAGINATION_NEXT_END_OFF + '">Last Off</span>';

var defaultOptions = {
    classPrefix: classNameConst.PREFIX,
    itemCount: 1,
    pagePerPageList: 5,
    isCenterAlign: true,
    moveUnit: 'page'
};

/**
 * Class for the pagination in the toolbar
 * @module view/pagination
 * @extends module:base/view
 */
var Pagination = View.extend(/**@lends module:view/pagination.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.componentHolder = options.componentHolder;
        this.on('appended', this._onAppended);
    },

    className: classNameConst.PAGINATION,

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this._destroyChildren();
        this.$el.empty().html(HTML_BTNS);

        this.componentHolder.setInstance('pagination', this._createComponent());
        return this;
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
        var btnOptions = {
            $preOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_OFF),
            $pre_endOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_END_OFF), // eslint-disable-line
            $nextOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_OFF),
            $lastOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_END_OFF)
        };

        if (customOptions === true) {
            customOptions = {};
        }

        if (!customOptions.itemPerPage) {
            customOptions.itemPerPage = this.dimensionModel.get('displayRowCount');
        }

        return _.assign({}, defaultOptions, btnOptions, customOptions);
    },

    /**
     * Create new tui.component.Pagination instance
     * @returns {tui.component.Pagination}
     * @private
     */
    _createComponent: function() {
        var ComponentClass = tui.util.pick(tui, 'component', 'Pagination');

        if (!ComponentClass) {
            throw new Error('Cannot find component \'tui.component.Pagination\'');
        }
        return new ComponentClass(this._createOptionObject(), this.$el);
    }
});

module.exports = Pagination;
