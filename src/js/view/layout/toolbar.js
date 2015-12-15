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
 *  @module view/layout/toolbar
 */
var Toolbar = View.extend(/**@lends module:view/layout/toolbar.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
    },

    tagName: 'div',

    className: 'toolbar',

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar} this object
     */
    render: function() {
        var toolbarModel = this.grid.toolbarModel,
            resizeHandler, controlPanel, pagination;

        this.destroyChildren();
        this.$el.empty();

        if (toolbarModel.get('hasControlPanel')) {
            controlPanel = this.createView(ControlPanel, {
                grid: this.grid
            });
            this.$el.append(controlPanel.render().el);
        }

        if (toolbarModel.get('hasResizeHandler')) {
            resizeHandler = this.createView(ResizeHandler, {
                grid: this.grid
            });
            this.$el.append(resizeHandler.render().el);
        }

        if (toolbarModel.get('hasPagination')) {
            pagination = this.createView(Pagination, {
                grid: this.grid
            });
            this.$el.append(pagination.render().el);
        }

        this._refreshHeight();
        return this;
    },

    /**
     * Reset toolbar-height based on the dimension->toolbarHeight.
     * @return {[type]} [description]
     */
    _refreshHeight: function() {
        var height = this.grid.dimensionModel.get('toolbarHeight');

        this.$el.height(height);
        this.$el.toggle(!!height);
    }
});

module.exports = Toolbar;
