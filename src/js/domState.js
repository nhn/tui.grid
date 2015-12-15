'use strict';

var DomState = tui.util.defineClass({
    /**
     * @constructs
     * @param {jQuery} $el - jQuery object of the container element.
     */
    init: function($el) {
        this.$el = $el;
    },

    /**
     * Returns the Element of the table-cell identified by rowKey and columnName
     * @param {(Number|String)} rowKey - Row key
     * @param {String} columnName - Column name
     * @return {jQuery} Cell(TD) element
     */
    getElement: function(rowKey, columnName, isLside) {
        return this.$el.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
    },

    /**
     * Returns the offset of Container element
     * @return {{top: Number, left: Number} Offset object
     */
    getOffset: function() {
        return this.$el.offset();
    },

    /**
     * Returns the width of the container element
     * @returns {Number} Width of the container element
     */
    getWidth: function() {
        return this.$el.width();
    },

    /**
     * Returns whether there's child element having focus.
     * @returns {boolean} True if there's child element having focus
     */
    hasFocusedElement: function() {
        return !!this.$el.find(':focus').length;
    }
});

module.exports = DomState;
