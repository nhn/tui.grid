/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/
'use strict';

var classNameConst = require('../common/classNameConst');

var headCellSelector = '.' + classNameConst.CONTAINER + ' th';
var bodyCellSelector = '.' + classNameConst.CONTAINER + ' td';
var metaCellSelector = bodyCellSelector + '.' + classNameConst.CELL_META_COLUMN;

/**
 * create css rule string and returns it
 * @param {String} selector - css selector
 * @param {String} property - css property
 * @param {String} value - css value
 * @returns {String}
 */
function rule(selector) {
    var styles = [];

    function addStyle(property, value) {
        if (value) {
            styles.push(property + ':' + value);
        }
    }

    return {
        add: function(property, value) {
            addStyle(property, value);
            return this;
        },

        border: function(value) {
            addStyle('border-color', value);
            return this;
        },

        bg: function(value) {
            addStyle('background-color', value);
            return this;
        },

        text: function(value) {
            addStyle('color', value);
            return this;
        },

        toString: function() {
            var selectorString = _.isArray(selector) ? selector.join(',') : selector;
            var styleString = styles.join(';');

            return selectorString + '{' + styleString + '}\n';
        }
    };
}


function bodyCellRuleString(className, colorset) {
    return rule(bodyCellSelector + '.' + className)
        .bg(colorset.background)
        .text(colorset.text)
        .toString();
}

function normalRuleString(selector, colorset) {
    return rule(selector)
        .bg(colorset.background)
        .border(colorset.border)
        .text(colorset.text)
        .toString();
}

function webkitScrollbarRuleString(selector, colorset) {
    var scrollbar = rule(selector + ' ::-webkit-scrollbar')
        .bg(colorset.background).toString();
    var thumb = rule(selector + ' ::-webkit-scrollbar-thumb')
        .bg(colorset.thumb).toString();
    var thumbHover = rule(selector + ' ::-webkit-scrollbar-thumb:hover')
        .bg(colorset.active).toString();

    return scrollbar + thumb + thumbHover;
}

function ieScrollbarRuleString(selector, colorset) {
    var ieRule = rule(selector);

    _.each([
        'scrollbar-3dlight-color',
        'scrollbar-darkshadow-color',
        'scrollbar-track-color',
        'scrollbar-shadow-color'
    ], function(prop) {
        ieRule.add(prop, colorset.background);
    });
    _.each([
        'scrollbar-face-color',
        'scrollbar-highlight-color'
    ], function(prop) {
        ieRule.add(prop, colorset.thumb);
    });
    ieRule.add('scrollbar-arrow-color', colorset.active);

    return ieRule.toString();
}

module.exports = {
    grid: function(colorset) {
        var container = normalRuleString('.' + classNameConst.CONTAINER, colorset);
        var line = rule('.' + classNameConst.BORDER_LINE)
            .bg(colorset.border).toString();
        var headerSpace = rule('.' + classNameConst.HEADER_SPACE)
            .border(colorset.border).toString();
        var scrollbarBorder = rule('.' + classNameConst.SCROLLBAR_BORDER)
            .bg(colorset.border).toString();

        return line + headerSpace + scrollbarBorder + container;
    },

    header: function(colorset) {
        var selectors = [
            headCellSelector,
            metaCellSelector,
            metaCellSelector + '.' + classNameConst.CELL_DUMMY
        ];

        return normalRuleString(selectors, colorset);
    },

    headerSelected: function(colorset) {
        var selectors = [
            headCellSelector + '.' + classNameConst.CELL_SELECTED,
            metaCellSelector + '.' + classNameConst.CELL_SELECTED
        ];

        return rule(selectors)
            .bg(colorset.background)
            .text(colorset.text)
            .toString();
    },

    body: function(colorset) {
        return normalRuleString(bodyCellSelector, colorset);
    },

    bodyFocused: function(colorset) {
        var focusLayer = rule('.' + classNameConst.LAYER_FOCUS + ' div')
            .bg(colorset.border).toString();
        var editingLayer = rule('.' + classNameConst.LAYER_EDITING)
            .border(colorset.border).toString();

        return focusLayer + editingLayer;
    },

    bodyEditable: function(colorset) {
        return bodyCellRuleString(classNameConst.CELL_EDITABLE, colorset);
    },

    bodyRequired: function(colorset) {
        return bodyCellRuleString(classNameConst.CELL_REQUIRED, colorset);
    },

    bodyDisabled: function(colorset) {
        return bodyCellRuleString(classNameConst.CELL_DISABLED, colorset);
    },

    bodyDummy: function(colorset) {
        return bodyCellRuleString(classNameConst.CELL_DUMMY, colorset);
    },

    bodyInvalid: function(colorset) {
        return bodyCellRuleString(classNameConst.CELL_INVALID, colorset);
    },

    selection: function(colorset) {
        return rule('.' + classNameConst.LAYER_SELECTION)
            .bg(colorset.background)
            .border(colorset.border)
            .toString();
    },

    input: function(colorset) {
        return normalRuleString('.' + classNameConst.CELL_CONTENT + ' input', colorset);
    },

    toolbar: function(colorset) {
        var toolbar = rule('.' + classNameConst.TOOLBAR)
            .border(colorset.border).bg(colorset.background).toString();
        var resizeHandle = rule('.' + classNameConst.TOOLBAR_RESIZE_HANDLE)
            .border(colorset.border).toString();

        return toolbar + resizeHandle;
    },

    scrollbar: function(colorset) {
        var corner = rule('.' + classNameConst.SCROLLBAR_CORNER)
            .bg(colorset.background).toString();
        var overlay = rule('.' + classNameConst.SCROLLBAR_OVERLAY)
            .bg(colorset.background).toString();
        var headerSpace = rule('.' + classNameConst.HEADER_SPACE)
            .bg(colorset.background).toString();
        var containerWebkit = webkitScrollbarRuleString('.' + classNameConst.CONTAINER, colorset);
        var containerIE = ieScrollbarRuleString('.' + classNameConst.CONTAINER, colorset);

        return corner + overlay + headerSpace + containerWebkit + containerIE;
    }
};
