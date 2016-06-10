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

var defaultOption = {
    classPrefix: classNameConst.PREFIX,
    itemCount: 1,
    itemPerPage: 1,
    pagePerPageList: 5,
    isCenterAlign: true,
    moveUnit: 'page'
};

/**
 * Class for the pagination in the toolbar
 * @module view/layout/toolbar/pagination
 * @extends module:base/view
 */
var Pagination = View.extend(/**@lends module:view/layout/toolbar/pagination.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.toolbarModel = options.modelManager;
    },

    className: classNameConst.PAGINATION,

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this._destroyChildren();
        this.$el.empty().html(HTML_BTNS);

        // if (!this.toolbarModel.has('paginationComponent')) {
            // this.toolbarModel.set('paginationComponent', this._createComponent());
        // }
        this._createComponent();
        return this;
    },

    /**
     * Create an option object for creating a tui.component.Pagination component.
     * @returns {Object}
     */
    _createOptionObject: function() {
        // var customOption = this.toolbarModel.get('pagination');
        var customOption = {};
        var btnOption = {
            $preOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_OFF),
            $pre_endOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_END_OFF), // eslint-disable-line
            $nextOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_OFF),
            $lastOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_END_OFF)
        };

        if (customOption === true) {
            customOption = {};
        }

        return _.assign({}, defaultOption, btnOption, customOption);
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
