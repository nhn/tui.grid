'use strict';

var styleGen = require('theme/styleGenerator');
var builder = require('theme/cssRuleBuilder');
var classNameConst = require('common/classNameConst');

describe('theme/styleGenerator: ', function() {
    describe('outline()', function() {
        var borderTop, borderBottom;
        var expectedRules;

        beforeEach(function() {
            borderTop = '.' + classNameConst.BORDER_TOP;
            borderBottom = '.' + classNameConst.NO_SCROLL_X + ' .' + classNameConst.BORDER_BOTTOM;

            expectedRules = [
                borderTop + '{background-color:green}',
                borderBottom + '{background-color:green}'
            ];
        });

        it('generates a css string for the top-bottom outline by default.', function() {
            var options = {
                border: 'green'
            };
            var expected = expectedRules.join('');

            expect(styleGen.outline(options)).toBe(expected);
        });

        it('generates a css string for the outline having vertical lines.', function() {
            var borderLeft = '.' + classNameConst.BORDER_LEFT;
            var borderRight = '.' + classNameConst.NO_SCROLL_Y + ' .' + classNameConst.BORDER_RIGHT;
            var options = {
                border: 'green',
                showVerticalBorder: true
            };
            var expected = expectedRules.concat([
                borderLeft + '{background-color:green}',
                borderRight + '{background-color:green}'
            ]).join('');

            expect(styleGen.outline(options)).toBe(expected);
        });
    });

    it('scrollbar() generates a css string for scrollbars', function() {
        var options = {
            border: 'yellow',
            background: 'white',
            emptySpace: 'red',
            thumb: 'blue',
            active: 'green'
        };
        var xInnerBorder = '.' + classNameConst.BORDER_BOTTOM;
        var xOuterBorder = '.' + classNameConst.CONTENT_AREA;
        var yInnerBorder = '.' + classNameConst.SCROLLBAR_Y_INNER_BORDER;
        var yOuterBorder = '.' + classNameConst.SCROLLBAR_Y_OUTER_BORDER;
        var spaceRightTop = '.' + classNameConst.SCROLLBAR_RIGHT_TOP;
        var spaceRightBottom = '.' + classNameConst.SCROLLBAR_RIGHT_BOTTOM;
        var spaceLeftBottom = '.' + classNameConst.SCROLLBAR_LEFT_BOTTOM;
        var frozenBorder = '.' + classNameConst.SCROLLBAR_FROZEN_BORDER;

        var expected = [
            builder.buildAll(builder.createWebkitScrollbarRules('.' + classNameConst.CONTAINER, options)),
            builder.createIEScrollbarRule('.' + classNameConst.CONTAINER, options).build(),
            xInnerBorder + '{background-color:yellow}',
            xOuterBorder + '{border-color:yellow}',
            yInnerBorder + '{background-color:yellow}',
            yOuterBorder + '{background-color:yellow}',
            spaceRightTop + '{background-color:red;border-color:yellow}',
            spaceRightBottom + '{background-color:red;border-color:yellow}',
            spaceLeftBottom + '{background-color:red;border-color:yellow}',
            frozenBorder + '{background-color:red;border-color:yellow}'
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
                '.' + classNameConst.CELL + '{background-color:white;border-color:green;color:blue}';

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
        it('generates a css string for cells of head area.', function() {
            var options = {
                background: 'white',
                border: 'green',
                text: 'blue'
            };
            var expected =
              '.' + classNameConst.CELL_HEAD + '{background-color:white;border-color:green;color:blue}';

            expect(styleGen.cellHead(options)).toBe(expected);
        });

        it('if showVerticalBorder option exists, add border vertical width values' +
            'and tables in lside show right vertical border.', function() {
            var tableSelector = '.' + classNameConst.SHOW_LSIDE_AREA +
                ' .' + classNameConst.LSIDE_AREA +
                ' .' + classNameConst.HEAD_AREA +
                ' .' + classNameConst.TABLE;
            var expectedForTrue = [
                tableSelector + '{border-right-style:solid}',
                '.' + classNameConst.CELL_HEAD + '{border-left-width:1px;border-right-width:1px}'
            ].join('');
            var expectedForFalse = [
                tableSelector + '{border-right-style:hidden}',
                '.' + classNameConst.CELL_HEAD + '{border-left-width:0;border-right-width:0}'
            ].join('');

            expect(styleGen.cellHead({showVerticalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellHead({showVerticalBorder: false})).toBe(expectedForFalse);
        });

        it('if showHorizontalBorder option exists, add border-top, border-bottom width values.', function() {
            var expectedForTrue = '.' + classNameConst.CELL_HEAD + '{border-top-width:1px;border-bottom-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL_HEAD + '{border-top-width:0;border-bottom-width:0}';

            expect(styleGen.cellHead({showHorizontalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellHead({showHorizontalBorder: false})).toBe(expectedForFalse);
        });
    });

    describe('cellRowHead()', function() {
        it('generates a css string for cells of row head cell of body area.', function() {
            var options = {
                background: 'white',
                border: 'green',
                text: 'blue'
            };
            var expected =
              '.' + classNameConst.CELL_ROW_HEAD + '{background-color:white;border-color:green;color:blue}';

            expect(styleGen.cellRowHead(options)).toBe(expected);
        });

        it('if showVerticalBorder option exists, add border vertical width values ' +
            'and tables in lside show right vertical border.', function() {
            var tableSelector = '.' + classNameConst.SHOW_LSIDE_AREA +
                ' .' + classNameConst.LSIDE_AREA +
                ' .' + classNameConst.BODY_AREA +
                ' .' + classNameConst.TABLE;
            var expectedForTrue = [
                tableSelector + '{border-right-style:solid}',
                '.' + classNameConst.CELL_ROW_HEAD + '{border-left-width:1px;border-right-width:1px}'
            ].join('');
            var expectedForFalse = [
                tableSelector + '{border-right-style:hidden}',
                '.' + classNameConst.CELL_ROW_HEAD + '{border-left-width:0;border-right-width:0}'
            ].join('');

            expect(styleGen.cellRowHead({showVerticalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellRowHead({showVerticalBorder: false})).toBe(expectedForFalse);
        });

        it('if showHorizontalBorder option exists, add border-top, border-bottom width values', function() {
            var expectedForTrue = '.' + classNameConst.CELL_ROW_HEAD + '{border-top-width:1px;border-bottom-width:1px}';
            var expectedForFalse = '.' + classNameConst.CELL_ROW_HEAD + '{border-top-width:0;border-bottom-width:0}';

            expect(styleGen.cellRowHead({showHorizontalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellRowHead({showHorizontalBorder: false})).toBe(expectedForFalse);
        });
    });

    describe('cellSummary()', function() {
        it('generates a css string for cells in summary area.', function() {
            var options = {
                background: 'white',
                border: 'green',
                text: 'blue'
            };
            var expected =
                '.' + classNameConst.CELL_SUMMARY + '{background-color:white;border-color:green;color:blue}';

            expect(styleGen.cellSummary(options)).toBe(expected);
        });

        it('if showVerticalBorder option exists, add border vertical width values ' +
          'and tables in lside show right vertical border.', function() {
            var tableSelector = '.' + classNameConst.SHOW_LSIDE_AREA +
                ' .' + classNameConst.LSIDE_AREA +
                ' .' + classNameConst.SUMMARY_AREA +
                ' .' + classNameConst.TABLE;
            var expectedForTrue = [
                tableSelector + '{border-right-style:solid}',
                '.' + classNameConst.CELL_SUMMARY + '{border-left-width:1px;border-right-width:1px}'
            ].join('');
            var expectedForFalse = [
                tableSelector + '{border-right-style:hidden}',
                '.' + classNameConst.CELL_SUMMARY + '{border-left-width:0;border-right-width:0}'
            ].join('');

            expect(styleGen.cellSummary({showVerticalBorder: true})).toBe(expectedForTrue);
            expect(styleGen.cellSummary({showVerticalBorder: false})).toBe(expectedForFalse);
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

    it('cellSelectedHead() generates a css string for selected head cells.', function() {
        var options = {
            background: 'white',
            text: 'blue'
        };
        var expected = '.' + classNameConst.CELL_HEAD + '.' + classNameConst.CELL_SELECTED +
              '{background-color:white;color:blue}';

        expect(styleGen.cellSelectedHead(options)).toBe(expected);
    });

    it('cellSelectedRowHead() generates a css string for selected rowHead cells.', function() {
        var options = {
            background: 'white',
            text: 'blue'
        };
        var expected = '.' + classNameConst.CELL_ROW_HEAD + '.' + classNameConst.CELL_SELECTED +
              '{background-color:white;color:blue}';

        expect(styleGen.cellSelectedRowHead(options)).toBe(expected);
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
