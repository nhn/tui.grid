/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

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

    tagName: 'div',

    className: 'tui-grid-pagination',

    template: _.template(
        '<a href="#" class="tui-grid-pre-end" title="First page">First</a>' +
        '<a href="#" class="tui-grid-pre" title="Previous page">Prev</a> ' +
        '<a href="#" class="tui-grid-next" title="Next page">Next</a>' +
        '<a href="#" class="tui-grid-next-end" title="Last page">Last</a>' +
        '<span class="tui-grid-pre-end-off">First Off</span>' +
        '<span class="tui-grid-pre-off">Prev Off</span>' +
        '<span class="tui-grid-next-off">Next Off</span>' +
        '<span class="tui-grid-next-end-off">Last Off</span>'
    ),

    /**
     * pagination 을 rendering 한다.
     * @returns {View.Layout.Toolbar.Pagination} This object
     */
    render: function() {
        this._destroyChildren();
        this.$el.empty().html(this.template());
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
                itemCount: 1,
                itemPerPage: 1,
                pagePerPageList: 5,
                isCenterAlign: true,
                moveUnit: 'page',
                $preOff: this.$el.find('.tui-grid-pre-off'),
                $pre_endOff: this.$el.find('.tui-grid-pre-end-off'), // eslint-disable-line camelcase
                $nextOff: this.$el.find('.tui-grid-next-off'),
                $lastOff: this.$el.find('.tui-grid-next-end-off')
            }, this.$el);
        }
        this.toolbarModel.set('pagination', pagination);
    }
});

module.exports = Pagination;
