/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/

'use strict';

var $ = require('jquery');
var util = require('../common/util');
var styleGen = require('./styleGenerator');
var themeNameConst = require('../common/constMap').themeName;

var STYLE_ELEMENT_ID = 'tui-grid-theme-style';

var presetOptions = {};
presetOptions[themeNameConst.DEFAULT] = require('./preset/default');
presetOptions[themeNameConst.STRIPED] = require('./preset/striped');
presetOptions[themeNameConst.CLEAN] = require('./preset/clean');

/**
 * build css string with given options.
 * @param {Object} options - options
 * @returns {String}
 * @ignore
 */
function buildCssString(options) {
    var styles = [
        styleGen.grid(options.grid),
        styleGen.scrollbar(options.scrollbar),
        styleGen.heightResizeHandle(options.heightResizeHandle),
        styleGen.pagination(options.pagination),
        styleGen.selection(options.selection)
    ];
    var cell = options.cell;

    if (cell) {
        styles = styles.concat([
            styleGen.cell(cell.normal),
            styleGen.cellDummy(cell.dummy),
            styleGen.cellEditable(cell.editable),
            styleGen.cellHead(cell.head),
            styleGen.cellOddRow(cell.oddRow),
            styleGen.cellEvenRow(cell.evenRow),
            styleGen.cellRequired(cell.required),
            styleGen.cellDisabled(cell.disabled),
            styleGen.cellInvalid(cell.invalid),
            styleGen.cellCurrentRow(cell.currentRow),
            styleGen.cellSelectedHead(cell.selectedHead),
            styleGen.cellFocused(cell.focused),
            styleGen.cellFocusedInactive(cell.focusedInactive)
        ]);
    }

    return styles.join('');
}

/**
 * Set document style with given options.
 * @param {Object} options - options
 * @ignore
 */
function setDocumentStyle(options) {
    var cssString = buildCssString(options);

    $('#' + STYLE_ELEMENT_ID).remove();
    util.appendStyleElement(STYLE_ELEMENT_ID, cssString);
}

module.exports = {
    /**
     * Creates a style element using theme options identified by given name,
     * and appends it to the document.
     * @param {String} themeName - preset theme name
     * @param {Object} extOptions - if exist, extend preset theme options with it.
     */
    apply: function(themeName, extOptions) {
        var options = presetOptions[themeName];

        if (!options) {
            options = presetOptions[themeNameConst.DEFAULT];
        }
        options = $.extend(true, {}, options, extOptions);
        setDocumentStyle(options);
    },

    /**
     * Returns whether the style of a theme is applied.
     * @returns {Boolean}
     */
    isApplied: function() {
        return $('#' + STYLE_ELEMENT_ID).length === 1;
    }
};
