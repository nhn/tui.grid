/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the pagination in the toolbar
 * @module view/layout/toolbar/pagination
 */
var Pagination = View.extend(/**@lends module:view/layout/toolbar/pagination.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function(options) {
        this.toolbarModel = options.toolbarModel;
    },

    tagName: 'div',

    className: 'grid_pagination',

    template: _.template('' +
        '<a href="#" class="pre_end">맨앞</a>' +
        '<span href="#" class="pre_end_off">맨앞</span>' +
        '<a href="#" class="pre">이전</a> ' +
        '<span href="#" class="pre_off">이전</span>' +
        '<a href="#" class="next">다음</a>' +
        '<span href="#" class="next_off">다음</span>' +
        '<a href="#" class="next_end">맨뒤</a>' +
        '<span href="#" class="next_end_off">맨뒤</span>'
    ),

    /**
     * pagination 을 rendering 한다.
     * @return {View.Layout.Toolbar.Pagination} This object
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
                $preOff: this.$el.find('.pre_off'),
                $pre_endOff: this.$el.find('.pre_end_off'),
                $nextOff: this.$el.find('.next_off'),
                $lastOff: this.$el.find('.next_end_off')
            }, this.$el);
        }
        this.toolbarModel.set('pagination', pagination);
    }
});

module.exports = Pagination;
