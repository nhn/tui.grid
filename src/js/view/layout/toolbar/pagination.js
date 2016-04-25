/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');
var classNameConst = require('../../../common/classNameConst');

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
        this.toolbarModel = options.toolbarModel;
    },

    className: classNameConst.PAGINATION,

    htmlString: (
        '<a href="#" class="' + classNameConst.PAGINATION_PRE_END + '" title="First page">First</a>' +
        '<a href="#" class="' + classNameConst.PAGINATION_PRE + '" title="Previous page">Prev</a> ' +
        '<a href="#" class="' + classNameConst.PAGINATION_NEXT + '" title="Next page">Next</a>' +
        '<a href="#" class="' + classNameConst.PAGINATION_NEXT_END + '" title="Last page">Last</a>' +
        '<span class="' + classNameConst.PAGINATION_PRE_END_OFF + '">First Off</span>' +
        '<span class="' + classNameConst.PAGINATION_PRE_OFF + '">Prev Off</span>' +
        '<span class="' + classNameConst.PAGINATION_NEXT_OFF + '">Next Off</span>' +
        '<span class="' + classNameConst.PAGINATION_NEXT_END_OFF + '">Last Off</span>'
    ),

    /**
     * pagination 을 rendering 한다.
     * @returns {View.Layout.Toolbar.Pagination} This object
     */
    render: function() {
        this._destroyChildren();
        this.$el.empty().html(this.htmlString);
        this._setPaginationInstance();

        return this;
    },

    /**
     * pagination instance 를 설정한다.
     * @private
     */
    _setPaginationInstance: function() {
        var PaginationClass = tui && tui.component && tui.component.Pagination,
            pagination = this.toolbarModel.get('pagination');

        if (!pagination && PaginationClass) {
            pagination = new PaginationClass({
                classPrefix: classNameConst.PREFIX,
                itemCount: 1,
                itemPerPage: 1,
                pagePerPageList: 5,
                isCenterAlign: true,
                moveUnit: 'page',
                $preOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_OFF),
                $pre_endOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_END_OFF), // eslint-disable-line
                $nextOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_OFF),
                $lastOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_END_OFF)
            }, this.$el);
        }
        this.toolbarModel.set('pagination', pagination);
    }
});

module.exports = Pagination;
