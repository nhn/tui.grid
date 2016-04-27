'use strict';

var ruleGen = require('theme/ruleGenerator');
var classNameConst = require('common/classNameConst');

fdescribe('theme.ruleGenerator', function() {
    it('grid', function() {
        var actual = ruleGen.grid({
            background: 'red',
            border: 'blue'
        });
        var expected =
            '.' + classNameConst.BORDER_LINE + '{background-color:blue}\n' +
            '.' + classNameConst.TOOLBAR + '{border-color:blue}\n';

        expect(actual).toBe(expected);
    });


    it('selection', function() {
        var actual = ruleGen.selection({
            background: 'red',
            border: 'blue'
        });
        var expected =
            '.' + classNameConst.LAYER_SELECTION + '{background-color:red}\n' +
            '.' + classNameConst.LAYER_SELECTION + '{border-color:blue}\n';

        expect(actual).toBe(expected);
    });

    // it('focusLayer', function() {
    //     var actual = ruleGen.focusLayer('red');
    //     var expected = '.' + classNameConst.LAYER_FOCUS + '{background-color:red}';
    //
    //     expect(actual).toBe(expected);
    // });

    // it('tableBorder', function() {
    //
    // });
});
