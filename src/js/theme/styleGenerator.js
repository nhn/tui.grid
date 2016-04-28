/**
* @fileoverview css style generator
* @author NHN Ent. FE Development Team
*/
'use strict';

var builder = require('./cssRuleBuilder');
var classNameConst = require('../common/classNameConst');

/**
 * Shortcut to create a Builder instance with a class name selector.
 * @param {String} className - class name
 * @returns {Builder}
 */
function classRule(className) {
    return builder.create('.' + className);
}

/**
 * Creates a normal rule string.
 * @param {String} className - class name
 * @param {Object} options - options
 * @returns {String}
 */
function normalRuleString(className, options) {
    return classRule(className)
        .bg(options.background)
        .border(options.border)
        .text(options.text)
        .build();
}

/**
 * Creates a rule string for background and text colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 */
function bgTextRuleString(className, options) {
    return classRule(className)
        .bg(options.background)
        .text(options.text)
        .build();
}

module.exports = {
    /**
     * Generates a css string for the grid.
     * @param {Object} options - options
     * @returns {String}
     */
    grid: function(options) {
        var container = normalRuleString(classNameConst.CONTAINER, options);
        var table = classRule(classNameConst.TABLE)
            .border(options.border)
            .build();

        var line = classRule(classNameConst.BORDER_LINE)
            .bg(options.border)
            .build();

        var scrollHead = classRule(classNameConst.SCROLLBAR_HEAD)
            .border(options.border)
            .build();

        var scrollBorder = classRule(classNameConst.SCROLLBAR_BORDER)
            .bg(options.border)
            .build();

        return container + table + line + scrollHead + scrollBorder;
    },

    /**
     * Generates a css string for scrollbars.
     * @param {Object} options - options
     * @returns {String}
     */
    scrollbar: function(options) {
        var containerWebkit = builder.webkitScrollbarRuleString('.' + classNameConst.CONTAINER, options);
        var containerIE = builder.ieScrollbarRuleString('.' + classNameConst.CONTAINER, options);
        var scrollRB = classRule(classNameConst.SCROLLBAR_RIGHT_BOTTOM)
            .bg(options.background)
            .build();

        var scrollLB = classRule(classNameConst.SCROLLBAR_LEFT_BOTTOM)
            .bg(options.background)
            .build();

        var scrollHead = classRule(classNameConst.SCROLLBAR_HEAD)
            .bg(options.background)
            .build();

        return containerWebkit + containerIE + scrollRB + scrollLB + scrollHead;
    },

    /**
     * Generates a css string for a toolbar.
     * @param {Object} options - options
     * @returns {String}
     */
    toolbar: function(options) {
        var toolbar = classRule(classNameConst.TOOLBAR)
            .border(options.border)
            .bg(options.background)
            .build();

        var resizeHandle = classRule(classNameConst.HEIGHT_RESIZE_HANDLE)
            .border(options.border)
            .build();

        return toolbar + resizeHandle;
    },

    /**
     * Generates a css string for a sclection layer.
     * @param {Object} options - options
     * @returns {String}
     */
    selection: function(options) {
        return classRule(classNameConst.LAYER_SELECTION)
            .bg(options.background)
            .border(options.border)
            .build();
    },

    /**
     * Generates a css string for a sclection layer.
     * @param {Object} options - options
     * @returns {String}
     */
    cell: function(options) {
        var cell = classRule(classNameConst.CELL)
            .bg(options.background)
            .border(options.border)
            .text(options.text);

        if (_.isBoolean(options.showVerticalBorder) || _.isBoolean(options.showHorizontalBorder)) {
            cell.borderWidth(options.showVerticalBorder, options.showHorizontalBorder);
        }

        return cell.build();
    },

    /**
     * Generates a css string for the cells in even rows.
     * @param {Object} options - options
     * @returns {String}
     */
    cellEvenRow: function(options) {
        return classRule(classNameConst.CELL_ROW_EVEN)
            .bg(options.background)
            .build();
    },

    /**
     * Generates a css string for a sclection layer.
     * @param {Object} options - options
     * @returns {String}
     */
    cellHead: function(options) {
        var head = classRule(classNameConst.CELL_HEAD)
            .bg(options.background)
            .border(options.border)
            .text(options.text);

        if (_.isBoolean(options.showVerticalBorder) || _.isBoolean(options.showHorizontalBorder)) {
            head.borderWidth(options.showVerticalBorder, options.showHorizontalBorder);
        }

        return head.build();
    },

    /**
     * Generates a css string for a sclection layer.
     * @param {Object} options - options
     * @returns {String}
     */
    cellSelectedHead: function(options) {
        return builder.create('.' + classNameConst.CELL_HEAD + '.' + classNameConst.CELL_SELECTED)
            .bg(options.background)
            .text(options.text)
            .build();
    },

    /**
     * Generates a css string for a focused cell.
     * @param {Object} options - options
     * @returns {String}
     */
    cellFocused: function(options) {
        var focusLayer = classRule(classNameConst.LAYER_FOCUS_BORDER)
            .bg(options.border)
            .build();

        var editingLayer = classRule(classNameConst.LAYER_EDITING)
            .border(options.border)
            .build();

        return focusLayer + editingLayer;
    },

    /**
     * Generates a css string for editable cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellEditable: function(options) {
        return bgTextRuleString(classNameConst.CELL_EDITABLE, options);
    },

    /**
     * Generates a css string for required cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellRequired: function(options) {
        return bgTextRuleString(classNameConst.CELL_REQUIRED, options);
    },

    /**
     * Generates a css string for disabled cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellDisabled: function(options) {
        return bgTextRuleString(classNameConst.CELL_DISABLED, options);
    },

    /**
     * Generates a css string for dummy cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellDummy: function(options) {
        return bgTextRuleString(classNameConst.CELL_DUMMY, options);
    },

    /**
     * Generates a css string for invalid cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellInvalid: function(options) {
        return bgTextRuleString(classNameConst.CELL_INVALID, options);
    },

    /**
     * Generates a css string for cells in a current row.
     * @param {Object} options - options
     * @returns {String}
     */
    cellCurrentRow: function(options) {
        return bgTextRuleString(classNameConst.CELL_CURRENT_ROW, options);
    }
};
