/**
 * @fileoverview 툴바영역 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 *  툴바 영역
 *  @module view/layout/toolbar
 */
var Toolbar = View.extend(/**@lends module:view/layout/toolbar.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.toolbarModel = options.toolbarModel;
        this.dimensionModel = options.dimensionModel;
        this.viewFactory = options.viewFactory;
    },

    tagName: 'div',

    className: 'toolbar',

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar} this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel,
            resizeHandler, controlPanel, pagination;

        this._destroyChildren();

        if (toolbarModel.get('hasControlPanel')) {
            this._addChildren(this.viewFactory.createToolbarControlPanel());
        }

        if (toolbarModel.get('hasResizeHandler')) {
            this._addChildren(this.viewFactory.createToolbarResizeHandler());
        }

        if (toolbarModel.get('hasPagination')) {
            this._addChildren(this.viewFactory.createToolbarPagination());
        }

        this.$el.empty().append(this._renderChildren());
        this._refreshHeight();
        
        return this;
    },

    /**
     * Reset toolbar-height based on the model/dimension->toolbarHeight.
     */
    _refreshHeight: function() {
        var height = this.dimensionModel.get('toolbarHeight');

        this.$el.height(height);
        this.$el.toggle(!!height);
    }
});

module.exports = Toolbar;
