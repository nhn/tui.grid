/**
 * @fileoverview Pagination for the Toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * 툴바의 Pagination 영역
 * @constructor View.Layout.Toolbar.Pagination
 */
var Pagination = View.extend(/**@lends Base.prototype */{
    tagName: 'div',
    className: 'pagination',
    template: _.template('' +
        '<a href="#" class="pre_end">맨앞</a>' +
        '<a href="#" class="pre">이전</a> ' +
        '<a href="#" class="next">다음</a>' +
        '<a href="#" class="next_end">맨뒤</a>'
    ),
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            instance: null
        });
    },

    /**
     * pagination 을 rendering 한다.
     * @return {View.Layout.Toolbar.Pagination} This object
     */
    render: function() {
        this.destroyChildren();
        this.$el.empty().html(this.template());
        this._setPaginationInstance();
        return this;
    },
    /**
     * pagination instance 를 설정한다.
     * @private
     */
    _setPaginationInstance: function() {
        var PaginationClass = ne && ne.component && ne.component.Pagination,
            pagination = this.instance;
        if (!pagination && PaginationClass) {
            pagination = new PaginationClass({
                itemCount: 1,
                itemPerPage: 1
            }, this.$el);
        }
        this.setOwnProperties({
            instance: pagination
        });
    }
});

module.exports = Pagination;
