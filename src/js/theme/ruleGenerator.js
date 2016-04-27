/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/
'use strict';

var classNameConst = require('../common/classNameConst');

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
            return selector + '{' + styles.join(';') + '}\n';
        }
    };
}

function classRule(className) {
    return rule('.' + className);
}

function cellClassRuleString(className, colorset) {
    return rule('.' + classNameConst.CELL + '.' + className)
        .bg(colorset.background)
        .text(colorset.text)
        .toString();
}

function normalClassRuleString(className, colorset) {
    return classRule(className)
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
    var bgProps = [
        'scrollbar-3dlight-color',
        'scrollbar-darkshadow-color',
        'scrollbar-track-color',
        'scrollbar-shadow-color'
    ];
    var thumbProps = [
        'scrollbar-face-color',
        'scrollbar-highlight-color'
    ];
    var ieRule = rule(selector);

    _.each(bgProps, function(prop) {
        ieRule.add(prop, colorset.background);
    });
    _.each(thumbProps, function(prop) {
        ieRule.add(prop, colorset.thumb);
    });
    ieRule.add('scrollbar-arrow-color', colorset.active);

    return ieRule.toString();
}

module.exports = {
    grid: function(colorset) {
        var container = normalClassRuleString(classNameConst.CONTAINER, colorset);
        var line = classRule(classNameConst.BORDER_LINE)
            .bg(colorset.border)
            .toString();

        var scrollHead = classRule(classNameConst.SCROLLBAR_HEAD)
            .border(colorset.border)
            .toString();

        var scrollBorder = classRule(classNameConst.SCROLLBAR_BORDER)
            .bg(colorset.border)
            .toString();

        return container + line + scrollHead + scrollBorder;
    },

    header: function(colorset) {
        return normalClassRuleString(classNameConst.CELL_HEAD, colorset);
    },

    headerSelected: function(colorset) {
        return rule('.' + classNameConst.CELL_HEAD + '.' + classNameConst.CELL_SELECTED)
            .bg(colorset.background)
            .text(colorset.text)
            .toString();
    },

    body: function(colorset) {
        return normalClassRuleString(classNameConst.CELL, colorset);
    },

    bodyFocused: function(colorset) {
        var focusLayer = classRule(classNameConst.LAYER_FOCUS_BORDER)
            .bg(colorset.border)
            .toString();

        var editingLayer = classRule(classNameConst.LAYER_EDITING)
            .border(colorset.border)
            .toString();

        return focusLayer + editingLayer;
    },

    bodyEditable: function(colorset) {
        return cellClassRuleString(classNameConst.CELL_EDITABLE, colorset);
    },

    bodyRequired: function(colorset) {
        return cellClassRuleString(classNameConst.CELL_REQUIRED, colorset);
    },

    bodyDisabled: function(colorset) {
        return cellClassRuleString(classNameConst.CELL_DISABLED, colorset);
    },

    bodyDummy: function(colorset) {
        return cellClassRuleString(classNameConst.CELL_DUMMY, colorset);
    },

    bodyInvalid: function(colorset) {
        return cellClassRuleString(classNameConst.CELL_INVALID, colorset);
    },

    selection: function(colorset) {
        return classRule(classNameConst.LAYER_SELECTION)
            .bg(colorset.background)
            .border(colorset.border)
            .toString();
    },

    toolbar: function(colorset) {
        var toolbar = classRule(classNameConst.TOOLBAR)
            .border(colorset.border)
            .bg(colorset.background)
            .toString();

        var resizeHandle = classRule(classNameConst.HEIGHT_RESIZE_HANDLE)
            .border(colorset.border)
            .toString();

        return toolbar + resizeHandle;
    },

    scrollbar: function(colorset) {
        var containerWebkit = webkitScrollbarRuleString('.' + classNameConst.CONTAINER, colorset);
        var containerIE = ieScrollbarRuleString('.' + classNameConst.CONTAINER, colorset);
        var scrollRB = classRule(classNameConst.SCROLLBAR_RIGHT_BOTTOM)
            .bg(colorset.background)
            .toString();

        var scrollLB = classRule(classNameConst.SCROLLBAR_LEFT_BOTTOM)
            .bg(colorset.background)
            .toString();

        var scrollHead = classRule(classNameConst.SCROLLBAR_HEAD)
            .bg(colorset.background)
            .toString();

        return containerWebkit + containerIE + scrollRB + scrollLB + scrollHead;
    }
};
