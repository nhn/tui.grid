'use strict';

var Controller = tui.util.defineClass({
    /**
     * @constructs
     */
    init: function(container) {
        this.container = container;
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
    }
});

module.exports = Controller;
