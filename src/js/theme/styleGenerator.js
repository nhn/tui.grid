/**
* @fileoverview css style generator
* @author NHN Ent. FE Development Team
*/
'use strict';

var builder = require('./cssRuleBuilder');
var classNameConst = require('../common/classNameConst');

/**
 * Shortcut for the builder.createClassRule() method.
 */
var classRule = _.bind(builder.createClassRule, builder);

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

/**
 * Creates a rule string for background and border colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 */
function bgBorderRuleString(className, options) {
    return classRule(className)
        .bg(options.background)
        .border(options.border)
        .build();
}

module.exports = {
    /**
     * Generates a css string for the grid.
     * @param {Object} options - options
     * @returns {String}
     */
    grid: function(options) {
        var containerRule = classRule(classNameConst.CONTAINER)
            .bg(options.background)
            .text(options.text);
        var contentAreaRule = classRule(classNameConst.CONTENT_AREA).border(options.border);
        var tableRule = classRule(classNameConst.TABLE).border(options.border);
        var headRule = classRule(classNameConst.HEAD_AREA).border(options.border);
        var borderLineRule = classRule(classNameConst.BORDER_LINE).bg(options.border);
        var scrollHeadRule = classRule(classNameConst.SCROLLBAR_HEAD).border(options.border);
        var scrollBorderRule = classRule(classNameConst.SCROLLBAR_BORDER).bg(options.border);

        return builder.buildAll([
            containerRule,
            contentAreaRule,
            tableRule,
            headRule,
            borderLineRule,
            scrollHeadRule,
            scrollBorderRule
        ]);
    },

    /**
     * Generates a css string for scrollbars.
     * @param {Object} options - options
     * @returns {String}
     */
    scrollbar: function(options) {
        var webkitScrollbarRules = builder.createWebkitScrollbarRules('.' + classNameConst.CONTAINER, options);
        var ieScrollbarRule = builder.createIEScrollbarRule('.' + classNameConst.CONTAINER, options);
        var rightBottomRule = classRule(classNameConst.SCROLLBAR_RIGHT_BOTTOM).bg(options.background);
        var leftBottomRule = classRule(classNameConst.SCROLLBAR_LEFT_BOTTOM).bg(options.background);
        var scrollHeadRule = classRule(classNameConst.SCROLLBAR_HEAD).bg(options.background);

        return builder.buildAll(webkitScrollbarRules.concat([
            ieScrollbarRule,
            rightBottomRule,
            leftBottomRule,
            scrollHeadRule
        ]));
    },

    /**
     * Generates a css string for a toolbar.
     * @param {Object} options - options
     * @returns {String}
     */
    toolbar: function(options) {
        return bgBorderRuleString(classNameConst.TOOLBAR, options);
    },

    /**
     * Generates a css string for a resize-handle.
     * @param {Object} options - options
     * @returns {String}
     */
    heightResizeHandle: function(options) {
        return bgBorderRuleString(classNameConst.HEIGHT_RESIZE_HANDLE, options);
    },

    /**
     * Generates a css string for a pagination.
     * @param {Object} options - options
     * @returns {String}
     */
    pagination: function(options) {
        return bgBorderRuleString(classNameConst.PAGINATION, options);
    },

    /**
     * Generates a css string for selection layers.
     * @param {Object} options - options
     * @returns {String}
     */
    selection: function(options) {
        return bgBorderRuleString(classNameConst.LAYER_SELECTION, options);
    },

    /**
     * Generates a css string for table cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cell: function(options) {
        var cellRule = classRule(classNameConst.CELL)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text);

        return cellRule.build();
    },

    /*
     * Generates a css string for head cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellHead: function(options) {
        var headRule = classRule(classNameConst.CELL_HEAD)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text);

        return headRule.build();
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
     * Generates a css string for the cells in odd rows.
     * @param {Object} options - options
     * @returns {String}
     */
    cellOddRow: function(options) {
        return classRule(classNameConst.CELL_ROW_ODD)
            .bg(options.background)
            .build();
    },

    /**
     * Generates a css string for selected head cells.
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
     * Generates a css string for focused cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellFocused: function(options) {
        var focusLayerRule = classRule(classNameConst.LAYER_FOCUS_BORDER).bg(options.border);
        var editingLayerRule = classRule(classNameConst.LAYER_EDITING).border(options.border);

        return builder.buildAll([focusLayerRule, editingLayerRule]);
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
