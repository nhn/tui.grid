/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/
'use strict';

var ruleGen = require('./ruleGenerator');

module.exports = {
    build: function(options) {
        var rules = [];
        var colorset = options.colorset;

        // common
        rules.push(ruleGen.grid(colorset.grid));
        rules.push(ruleGen.scrollbar(colorset.scrollbar));
        rules.push(ruleGen.input(colorset.input));

        // header
        rules.push(ruleGen.header(colorset.header.normal));
        rules.push(ruleGen.headerSelected(colorset.header.selected));

        // body
        rules.push(ruleGen.body(colorset.body.normal));
        rules.push(ruleGen.bodyFocused(colorset.body.focused));
        rules.push(ruleGen.bodyRequired(colorset.body.required));
        rules.push(ruleGen.bodyDisabled(colorset.body.disabled));
        rules.push(ruleGen.bodyEditable(colorset.body.editable));
        rules.push(ruleGen.bodyDummy(colorset.body.dummy));
        rules.push(ruleGen.bodyInvalid(colorset.body.invalid));

        // selection
        rules.push(ruleGen.selection(colorset.selection));

        // toolbar
        rules.push(ruleGen.toolbar(colorset.toolbar));

        return rules.join('');
    }
};
