/**
 * @fileoverview 툴바영역 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var ControlPanel = require('./toolbar/controlPanel');
var Pagination = require('./toolbar/pagination');
var ResizeHandler = require('./toolbar/resizeHandler');

/**
 *  툴바 영역
 *  @constructor View.Layout.Toolbar
 */
var Toolbar = View.extend(/**@lends Toolbar.prototype */{
    tagName: 'div',
    className: 'toolbar',
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            controlPanel: null,
            resizeHandler: null,
            pagination: null
        });
    },

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar} this object
     */
    render: function() {
        var option = this.grid.option('toolbar'),
            resizeHandler, controlPanel, pagination;

        this.destroyChildren();
        this.$el.empty();

        if (option && option.hasControlPanel) {
            controlPanel = this.createView(ControlPanel, {
                grid: this.grid
            });
            this.$el.append(controlPanel.render().el);
        }

        if (option && option.hasResizeHandler) {
            resizeHandler = this.createView(ResizeHandler, {
                grid: this.grid
            });
            this.$el.append(resizeHandler.render().el);
        }

        if (option && option.hasPagination) {
            pagination = this.createView(Pagination, {
                grid: this.grid
            });
            this.$el.append(pagination.render().el);
        }
        this.setOwnProperties({
            controlPanel: controlPanel,
            resizeHandler: resizeHandler,
            pagination: pagination
        });

        if (!controlPanel && !resizeHandler && !pagination) {
            this.$el.height(0);
        } else {
            this.$el.show();
        }
        return this;
    }
});

module.exports = Toolbar;
