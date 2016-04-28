/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/
'use strict';

var util = require('../common/util');
var styleGen = require('./styleGenerator');
var presetDefault = require('./preset/default');
var presetBlue = require('./preset/blue');

var STYLE_ELEMENT_ID = 'tui-grid-theme-style';
var themeMap = {
    'default': presetDefault,
    'blue': presetBlue
};

/**
 * build css string with given options.
 * @param {Object} options - options
 * @returns {String}
 */
function buildCssString(options) {
    var styles = [
        styleGen.grid(options.grid),
        styleGen.scrollbar(options.scrollbar),
        styleGen.toolbar(options.toolbar),
        styleGen.selection(options.selection)
    ];
    var cell = options.cell;

    if (cell) {
        styles = styles.concat([
            styleGen.cell(cell.normal),
            styleGen.cellHead(cell.head),
            styleGen.cellDummy(cell.dummy),
            styleGen.cellRequired(cell.required),
            styleGen.cellEditable(cell.editable),
            styleGen.cellDisabled(cell.disabled),
            styleGen.cellInvalid(cell.invalid),
            styleGen.cellCurrentRow(cell.currentRow),
            styleGen.cellSelectedHead(cell.selectedHead),
            styleGen.cellFocused(cell.focused)
        ]);
    }

    return styles.join('');
}

/**
 * Set document style with given options.
 * @param {Object} options - options
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
     * @param {String} name - target theme name
     */
    use: function(name) {
        var options = themeMap[name];

        if (!options) {
            options = presetDefault;
        }
        setDocumentStyle(options);
    }
};
