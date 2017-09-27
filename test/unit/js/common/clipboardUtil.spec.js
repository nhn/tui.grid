'use strict';

var $ = require('jquery');

var util = require('common/clipboardUtil');

jasmine.getFixtures().fixturesPath = 'base/';

describe('common/clipboardUtil', function() {
    var customLFSubChar = util.CUSTOM_LF_SUBCHAR;
    var customCRSubChar = util.CUSTOM_CR_SUBCHAR;
    var input, output;

    describe('convertTableToData', function() {
        beforeEach(function() {
            jasmine.getFixtures().fixturesPath = 'base/';
            loadFixtures('test/unit/fixtures/clipboard.html');
        });

        it('Table have unmerged cell.', function() {
            input = $('#excel-data')[0];
            output = util.convertTableToData(input);

            expect(output).toEqual([
                ['cell1', 'cell2'],
                ['cell3', 'cell4']
            ]);
        });

        it('Table have rowspan cell.', function() {
            input = $('#rowspan-excel-data')[0];
            output = util.convertTableToData(input);

            expect(output).toEqual([
                ['cell1', 'cell2'],
                [' ', 'cell4']
            ]);
        });

        it('Table have colspan cell.', function() {
            input = $('#colspan-excel-data')[0];
            output = util.convertTableToData(input);

            expect(output).toEqual([
                ['cell1', ' '],
                ['cell3', 'cell4']
            ]);
        });

        it('Table have rowspan, columspan cells.', function() {
            input = $('#complex-excel-data')[0];
            output = util.convertTableToData(input);

            expect(output).toEqual([
                ['cell1', 'cell2', 'cell3'],
                ['cell4', ' ', 'cell6'],
                ['cell7', ' ', ' ']
            ]);
        });
    });

    describe('convertTextToData', function() {
        it('when the text include plain characters.', function() {
            input = 'cell1\tcell2\ncell3\tcell4';
            output = util.convertTextToData(input);

            expect(output).toEqual([
                ['cell1', 'cell2'],
                ['cell3', 'cell4']
            ]);
        });

        it('when the text include double quotes.', function() {
            input = '"cell1"\tcell2\ncell"3"\tcell4';
            output = util.convertTextToData(input);

            expect(output).toEqual([
                ['"cell1"', 'cell2'],
                ['cell"3"', 'cell4']
            ]);
        });

        it('when the text include double quotes and newline characters.', function() {
            input = 'cell1\t"cell2"\n"cell\n3"\t"cell\n""4"""';
            output = util.convertTextToData(input);

            expect(output).toEqual([
                ['cell1', '"cell2"'],
                ['cell\n3', 'cell\n"4"']
            ]);
        });
    });

    describe('addDoubleQuotes', function() {
        it('when the text include newline characters, ' +
            'the double quotes are added one by one.', function() {
            input = 'test \n\n "add" ""test"" test';
            output = util.addDoubleQuotes(input);

            expect(output).toBe('"test \n\n ""add"" """"test"""" test"');
        });

        it('when the text don\'t include newline characters, ' +
            'the double quotes are not added.', function() {
            input = 'test """add test" test';
            output = util.addDoubleQuotes(input);

            expect(output).toBe(input);
        });
    });

    describe('removeDoubleQuotes', function() {
        it('when the text include substitution characters, ' +
            'the double quotes are removed one by one.', function() {
            input = '"test' + customLFSubChar + '""test""' + customLFSubChar + '"';
            output = util.removeDoubleQuotes(input);

            expect(output).toBe('test' + customLFSubChar + '"test"' + customLFSubChar);
        });

        it('when the text don\'t include substitution characters, ' +
            'the double quotes are not removed.', function() {
            input = '"test """test"" test"';
            output = util.removeDoubleQuotes(input);

            expect(output).toBe(input);
        });
    });

    describe('replaceNewlineToSubchar', function() {
        it('when the text include double quotes and LF characters, ' +
            'LF characters in double quotes are replaced by substitution characters.', function() {
            input = '"test\n""te""st"\ntest';
            output = util.replaceNewlineToSubchar(input);

            expect(output).toBe('"test' + customLFSubChar + '""te""st"\ntest');
        });

        it('when the text include double quotes and CR+LF characters, ' +
            'CR+LF characters in double quotes are replaced by substitution characters.', function() {
            input = '"test\r\n""te""st"\r\ntest';
            output = util.replaceNewlineToSubchar(input);

            expect(output).toBe('"test' + customCRSubChar + customLFSubChar + '""te""st"\r\ntest');
        });

        it('when the text include double quotes and don\'t include newline characters, ' +
            'the text is not replaced.', function() {
            input = '"test test"\ntest';
            output = util.replaceNewlineToSubchar(input);

            expect(output).toBe(input);
        });
    });
});
