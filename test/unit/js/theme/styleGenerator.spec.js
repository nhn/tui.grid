'use strict';

var styleGen = require('theme/styleGenerator');
var builder = require('theme/cssRuleBuilder');
var classNameConst = require('common/classNameConst');

describe('theme/styleGenerator: ', function() {
    it('grid() generates a css string for the grid', function() {
        var options = {
            background: 'white',
            border: 'green',
            text: 'blue'
        };
        var expected = [
            '.' + classNameConst.CONTAINER + '{background-color:white;color:blue}',
            '.' + classNameConst.CONTENT_AREA + '{border-color:green}',
            '.' + classNameConst.TABLE + '{border-color:green}',
            '.' + classNameConst.HEAD_AREA + '{border-color:green}',
            '.' + classNameConst.SUMMARY_AREA + '{border-color:green}',
            '.' + classNameConst.BORDER_LINE + '{background-color:green}',
            '.' + classNameConst.SCROLLBAR_HEAD + '{border-color:green}',
            '.' + classNameConst.SCROLLBAR_BORDER + '{background-color:green}',
            '.' + classNameConst.SUMMARY_AREA_RIGHT + '{border-color:green}'
        ].join('');

        expect(styleGen.grid(options)).toBe(expected);
    });

    it('scrollbar() generates a css string for scrollbars', function() {
        var options = {
            background: 'white',
            thumb: 'blue',
            active: 'green'
        };

        var expected = [
            builder.buildAll(builder.createWebkitScrollbarRules('.' + classNameConst.CONTAINER, options)),
            builder.createIEScrollbarRule('.' + classNameConst.CONTAINER, options).build(),
            '.' + classNameConst.SCROLLBAR_RIGHT_BOTTOM + '{background-color:white}',
            '.' + classNameConst.SCROLLBAR_LEFT_BOTTOM + '{background-color:white}',
            '.' + classNameConst.SCROLLBAR_HEAD + '{background-color:white}',
            '.' + classNameConst.SUMMARY_AREA_RIGHT + '{background-color:white}',
            '.' + classNameConst.BODY_AREA + '{background-color:white}',
            '.' + classNameConst.FROZEN_BORDER_BOTTOM + '{background-color:white}'
        ].join('');

        expect(styleGen.scrollbar(options)).toBe(expected);
    });

    it('selection() generates a css string for a selection layer', function() {
        var options = {
            background: 'white',
            border: 'green',
            text: 'blue'
        };
        var expected = '.' + classNameConst.LAYER_SELECTION + '{background-color:white;border-color:green}';

        expect(styleGen.selection(options)).toBe(expected);
    });

    describe('cell()', function() {
        it('generates a css string for table cells', function() {
            var options = {
                background: 'white',
                border: 'green',
                text: 'blue'
            };
            var expected =
                '.' + classNameConst.CELL + '{background-color:white;border-color:green;color:blue}' +
                '.' + classNameConst.BODY_AREA + '{border-color:green}';

            expect(styleGen.cell(options)).toBe(expected);
        });

        it('if showVerticalBorder option exists, add border-left, border-right width values', function() {
            var expectedForTrue = '.' + classNameConst.CELL + '{border-left-width:1px;border-right-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL + '{border-left-width:0;border-right-width:0}';

            expect(styleGen.cell({showVerticalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cell({showVerticalBorder: false})).toBe(expectedForFalse);
        });

        it('if showHorizontalBorder option exists, add border-top, border-bottom width values', function() {
            var expectedForTrue = '.' + classNameConst.CELL + '{border-top-width:1px;border-bottom-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL + '{border-top-width:0;border-bottom-width:0}';

            expect(styleGen.cell({showHorizontalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cell({showHorizontalBorder: false})).toBe(expectedForFalse);
        });
    });

    describe('cellHead()', function() {
        it('generates a css string for head cells', function() {
            var options = {
                background: 'white',
                border: 'green',
                text: 'blue'
            };
            var expected =
              '.' + classNameConst.CELL_HEAD + '{background-color:white;border-color:green;color:blue}' +
              '.' + classNameConst.HEAD_AREA + '{background-color:white;border-color:green}' +
              '.' + classNameConst.SUMMARY_AREA + '{background-color:white}';

            expect(styleGen.cellHead(options)).toBe(expected);
        });

        it('if showVerticalBorder option exists, add border vertical width values', function() {
            var expectedForTrue = '.' + classNameConst.CELL_HEAD + '{border-left-width:1px;border-right-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL_HEAD + '{border-left-width:0;border-right-width:0}';

            expect(styleGen.cellHead({showVerticalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellHead({showVerticalBorder: false})).toBe(expectedForFalse);
        });

        it('if showHorizontalBorder option exists, add border-top, border-bottom width values', function() {
            var expectedForTrue = '.' + classNameConst.CELL_HEAD + '{border-top-width:1px;border-bottom-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL_HEAD + '{border-top-width:0;border-bottom-width:0}';

            expect(styleGen.cellHead({showHorizontalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellHead({showHorizontalBorder: false})).toBe(expectedForFalse);
        });
    });

    it('cellOddRow() generates a css string for the cells in even rows.', function() {
        var options = {
            background: 'blue'
        };
        var expected = '.' + classNameConst.ROW_ODD + '>td{background-color:blue}';

        expect(styleGen.cellOddRow(options)).toBe(expected);
    });

    it('cellEvenRow() generates a css string for the cells in even rows.', function() {
        var options = {
            background: 'blue'
        };
        var expected = '.' + classNameConst.ROW_EVEN + '>td{background-color:blue}';

        expect(styleGen.cellEvenRow(options)).toBe(expected);
    });

    it('cellSelectedHead() generates a css string for selected head cells', function() {
        var options = {
            background: 'white',
            text: 'blue'
        };
        var expected = '.' + classNameConst.CELL_HEAD + '.' + classNameConst.CELL_SELECTED +
            '{background-color:white;color:blue}';

        expect(styleGen.cellSelectedHead(options)).toBe(expected);
    });

    it('cellFocused() generates a css string for focused cells', function() {
        var options = {
            border: 'green'
        };
        var expected = [
            '.' + classNameConst.LAYER_FOCUS_BORDER + '{background-color:green}',
            '.' + classNameConst.LAYER_EDITING + '{border-color:green}'
        ].join('');

        expect(styleGen.cellFocused(options)).toBe(expected);
    });

    it('cellFocusedInactive() generates a css string for deactived focus cells', function() {
        var options = {
            border: 'gray'
        };
        var expected = '.' + classNameConst.LAYER_FOCUS_DEACTIVE +
                        ' .' + classNameConst.LAYER_FOCUS_BORDER +
                        '{background-color:gray}';

        expect(styleGen.cellFocusedInactive(options)).toBe(expected);
    });

    it('cellEditable() generates a css string for editable cells', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_EDITABLE + '{background-color:white;color:red}';

        expect(styleGen.cellEditable(options)).toBe(expected);
    });

    it('cellRequired() generates a css string for required cells', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_REQUIRED + '{background-color:white;color:red}';

        expect(styleGen.cellRequired(options)).toBe(expected);
    });

    it('cellDisabled() generates a css string for disabled cells', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_DISABLED + '{background-color:white;color:red}';

        expect(styleGen.cellDisabled(options)).toBe(expected);
    });

    it('cellDummy() generates a css string for dummy cells', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_DUMMY + '{background-color:white;color:red}';

        expect(styleGen.cellDummy(options)).toBe(expected);
    });

    it('cellInvalid() generates a css string for invalid cells', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_INVALID + '{background-color:white;color:red}';

        expect(styleGen.cellInvalid(options)).toBe(expected);
    });

    it('cellCurrentRow() generates a css string for cells in a current row', function() {
        var options = {
            background: 'white',
            text: 'red'
        };
        var expected = '.' + classNameConst.CELL_CURRENT_ROW + '{background-color:white;color:red}';

        expect(styleGen.cellCurrentRow(options)).toBe(expected);
    });
});
