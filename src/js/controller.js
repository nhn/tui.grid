'use strict';

var Controller = tui.util.defineClass({
    /**
     * @constructs
     */
    init: function(container) {
        this.container = container;
    },

    /**
     * Grid Layer 를 모두 감춘다.
     */
    hideGridLayer: function() {
        _.each(this.container.children.layer, function(view) {
            view.hide();
        }, this);
    },

    /**
     * name 에 해당하는 Grid Layer를 보여준다.
     * @param {String} name ready|empty|loading 중 하나를 설정한다.
     */
    showGridLayer: function(name) {
        this.hideGridLayer();
        if (this.container.children.layer[name]) {
            this.container.children.layer[name].show();
        }
    },

    /**
     * pagination instance 를 반환한다.
     * @return {instance} pagination 인스턴스
     */
    getPaginationInstance: function() {
        var paginationView = this.container.children.toolbar.pagination;
        if (paginationView) {
            return paginationView.instance;
        }
    },

    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        if (tui.util.isExisty(tui.util.pick(this, 'container', 'children', 'clipboard'))) {
            this.container.children.clipboard.focus();
        }
    },

    /**
     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @return {jQuery} 해당 jQuery Element
     */
    getElement: function(rowKey, columnName, isLside) {
        var $frame = isLside ? this.container.children.lside.$el : this.container.children.rside.$el;
        return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
    },

    setWidth: function(width) {
        this.container.$el.width(width);
    },

    getOffset: function() {
        return this.container.$el.offset();
    },

    getWidth: function() {
        return this.container.$el.width();
    },

    hasFocusedElement: function() {
        return !!this.container.$el.find(':focus').length;
    },

    showExcelButton: function() {
        this.container.children.toolbar.controlPanel.$btnExcel.show();
    },

    showExcelAllButton: function() {
        this.container.children.toolbar.controlPanel.$btnExcelAll.show();
    }
});

module.exports = Controller;
