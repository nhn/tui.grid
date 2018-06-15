/**
* @fileoverview css style generator
* @author NHN Ent. FE Development Team
*/

'use strict';

var _ = require('underscore');

var builder = require('./cssRuleBuilder');
var classNameConst = require('../common/classNameConst');

/**
 * Shortcut for the builder.createClassRule() method.
 * @ignore
 */
var classRule = _.bind(builder.createClassRule, builder);

/**
 * Shortcut for the builder.createClassComposeRule() method.
 * @ignore
 */
var classComposeRule = _.bind(builder.createClassComposeRule, builder);

/**
 * Creates a rule string for background and text colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 * @ignore
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
 * @ignore
 */
function bgBorderRuleString(className, options) {
    return classRule(className)
        .bg(options.background)
        .border(options.border)
        .build();
}

module.exports = {
    /**
     * Generates a css string for grid outline.
     * @param {Object} options - options
     * @returns {String}
     */
    outline: function(options) {
        var borderTopRule = classRule(classNameConst.BORDER_TOP).bg(options.border);
        var borderBottomRule = classComposeRule(' .', [
            classNameConst.NO_SCROLL_X,
            classNameConst.BORDER_BOTTOM
        ]).bg(options.border);
        var rules = [
            borderTopRule,
            borderBottomRule
        ];
        var borderLeftRule, borderRightRule;

        if (options.showVerticalBorder) {
            borderLeftRule = classRule(classNameConst.BORDER_LEFT).bg(options.border);
            borderRightRule = classComposeRule(' .', [
                classNameConst.NO_SCROLL_Y,
                classNameConst.BORDER_RIGHT
            ]).bg(options.border);

            rules = rules.concat([borderLeftRule, borderRightRule]);
        }

        return builder.buildAll(rules);
    },

    /**
     * Generates a css string for border of frozen columns.
     * @param {Object} options - options
     * @returns {String}
     */
    frozenBorder: function(options) {
        return classRule(classNameConst.FROZEN_BORDER)
            .bg(options.border)
            .build();
    },

    /**
     * Generates a css string for scrollbars.
     * @param {Object} options - options
     * @returns {String}
     */
    scrollbar: function(options) {
        var webkitScrollbarRules = builder.createWebkitScrollbarRules('.' + classNameConst.CONTAINER, options);
        var ieScrollbarRule = builder.createIEScrollbarRule('.' + classNameConst.CONTAINER, options);
        var xInnerBorderRule = classRule(classNameConst.BORDER_BOTTOM).bg(options.border);
        var xOuterBorderRule = classRule(classNameConst.CONTENT_AREA).border(options.border);
        var yInnerBorderRule = classRule(classNameConst.SCROLLBAR_Y_INNER_BORDER).bg(options.border);
        var yOuterBorderRule = classRule(classNameConst.SCROLLBAR_Y_OUTER_BORDER).bg(options.border);
        var spaceRightTopRule = classRule(classNameConst.SCROLLBAR_RIGHT_TOP)
            .bg(options.emptySpace)
            .border(options.border);
        var spaceRightBottomRule = classRule(classNameConst.SCROLLBAR_RIGHT_BOTTOM)
            .bg(options.emptySpace)
            .border(options.border);
        var spaceLeftBottomRule = classRule(classNameConst.SCROLLBAR_LEFT_BOTTOM)
            .bg(options.emptySpace)
            .border(options.border);
        var frozenBorderRule = classRule(classNameConst.SCROLLBAR_FROZEN_BORDER)
            .bg(options.emptySpace)
            .border(options.border);

        return builder.buildAll(webkitScrollbarRules.concat([
            ieScrollbarRule,
            xInnerBorderRule,
            xOuterBorderRule,
            yInnerBorderRule,
            yOuterBorderRule,
            spaceRightTopRule,
            spaceRightBottomRule,
            spaceLeftBottomRule,
            frozenBorderRule
        ]));
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
     * Generates a css string for head area.
     * @param {Object} options - options
     * @returns {String}
     */
    headArea: function(options) {
        return classRule(classNameConst.HEAD_AREA)
            .bg(options.background)
            .border(options.border)
            .build();
    },

    /**
     * Generates a css string for body area.
     * @param {Object} options - options
     * @returns {String}
     */
    bodyArea: function(options) {
        return classRule(classNameConst.BODY_AREA)
            .bg(options.background)
            .build();
    },

    /**
     * Generates a css string for summary area.
     * @param {Object} options - options
     * @returns {String}
     */
    summaryArea: function(options) {
        var contentAreaRule = classRule(classNameConst.SUMMARY_AREA)
            .bg(options.background)
            .border(options.border);
        var bodyAreaRule = classComposeRule(' .', [
            classNameConst.HAS_SUMMARY_TOP,
            classNameConst.BODY_AREA
        ]).border(options.border);

        return builder.buildAll([
            contentAreaRule,
            bodyAreaRule
        ]);
    },

    /**
     * Generates a css string for table cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cell: function(options) {
        return classRule(classNameConst.CELL)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text)
            .build();
    },

    /*
     * Generates a css string for head cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellHead: function(options) {
        var tableRule = classComposeRule(' .', [
            classNameConst.SHOW_LSIDE_AREA,
            classNameConst.LSIDE_AREA,
            classNameConst.HEAD_AREA,
            classNameConst.TABLE
        ]).verticalBorderStyle(options, 'right');
        var cellRule = classRule(classNameConst.CELL_HEAD)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text);

        return builder.buildAll([
            tableRule,
            cellRule
        ]);
    },

    /*
     * Generates a css string for row's head cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellRowHead: function(options) {
        var tableRule = classComposeRule(' .', [
            classNameConst.SHOW_LSIDE_AREA,
            classNameConst.LSIDE_AREA,
            classNameConst.BODY_AREA,
            classNameConst.TABLE
        ]).verticalBorderStyle(options, 'right');
        var cellRule = classRule(classNameConst.CELL_ROW_HEAD)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text);

        return builder.buildAll([
            tableRule,
            cellRule
        ]);
    },

    /*
     * Generates a css string for summary cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellSummary: function(options) {
        var tableRule = classComposeRule(' .', [
            classNameConst.SHOW_LSIDE_AREA,
            classNameConst.LSIDE_AREA,
            classNameConst.SUMMARY_AREA,
            classNameConst.TABLE
        ]).verticalBorderStyle(options, 'right');
        var cellRule = classRule(classNameConst.CELL_SUMMARY)
            .bg(options.background)
            .border(options.border)
            .borderWidth(options)
            .text(options.text);

        return builder.buildAll([
            tableRule,
            cellRule
        ]);
    },

    /**
     * Generates a css string for the cells in even rows.
     * @param {Object} options - options
     * @returns {String}
     */
    cellEvenRow: function(options) {
        return classComposeRule('>', [
            classNameConst.ROW_EVEN,
            'td'
        ]).bg(options.background)
            .build();
    },

    /**
     * Generates a css string for the cells in odd rows.
     * @param {Object} options - options
     * @returns {String}
     */
    cellOddRow: function(options) {
        return classComposeRule('>', [
            classNameConst.ROW_ODD,
            'td'
        ]).bg(options.background).build();
    },

    /**
     * Generates a css string for selected head cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellSelectedHead: function(options) {
        return classComposeRule('.', [
            classNameConst.CELL_HEAD,
            classNameConst.CELL_SELECTED
        ]).bg(options.background)
            .text(options.text)
            .build();
    },

    /**
     * Generates a css string for selected row head cells.
     * @param {Object} options - options
     * @returns {String}
     */
    cellSelectedRowHead: function(options) {
        return classComposeRule('.', [
            classNameConst.CELL_ROW_HEAD,
            classNameConst.CELL_SELECTED
        ]).bg(options.background)
            .text(options.text)
            .build();
    },

    /**
     * Generates a css string for focused cell.
     * @param {Object} options - options
     * @returns {String}
     */
    cellFocused: function(options) {
        var focusLayerRule = classRule(classNameConst.LAYER_FOCUS_BORDER).bg(options.border);
        var editingLayerRule = classRule(classNameConst.LAYER_EDITING).border(options.border);

        return builder.buildAll([focusLayerRule, editingLayerRule]);
    },

    /**
     * Generates a css string for focus inactive cell.
     * @param {Object} options - options
     * @returns {String}
     */
    cellFocusedInactive: function(options) {
        return classComposeRule(' .', [
            classNameConst.LAYER_FOCUS_DEACTIVE,
            classNameConst.LAYER_FOCUS_BORDER
        ]).bg(options.border).build();
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
