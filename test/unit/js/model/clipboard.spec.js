'use strict';

var _ = require('underscore');

var Clipboard = require('model/clipboard');
var Model = require('base/model');
var DomEventBus = require('event/domEventBus');

describe('grid paste test', function() {
    var clipboard;

    function triggerCopyEvent() {
        clipboard.domEventBus.trigger('key:clipboard', {command: 'copy'});
    }

    function triggerPasteEvent(text) {
        clipboard.domEventBus.trigger('key:clipboard', {
            command: 'paste',
            text: text
        });
    }

    beforeEach(function() {
        clipboard = new Clipboard(null, {
            dataModel: new Model(),
            focusModel: new Model(),
            selectionModel: new Model(),
            renderModel: new Model(),
            domEventBus: DomEventBus.create()
        });
    });

    describe('key:clipboard event with copy command', function() {
        var SAMPLE_TEXT = 'sample text';

        describe('if selection exists, set text attribute to values of selected cells', function() {
            beforeEach(function() {
                clipboard.focusModel.which = _.constant({});
                clipboard.selectionModel.hasSelection = _.constant(true);
                clipboard.selectionModel.getValuesToString =
                    jasmine.createSpy('getValuesToString').and.returnValue(SAMPLE_TEXT);
            });

            it('with fommatedValue', function() {
                clipboard.copyOption = {useFormattedValue: true};
                triggerCopyEvent('copy');

                expect(clipboard.selectionModel.getValuesToString).toHaveBeenCalledWith(true);
                expect(clipboard.get('text')).toBe(SAMPLE_TEXT);
            });

            it('with original value', function() {
                triggerCopyEvent('copy');

                expect(clipboard.selectionModel.getValuesToString).toHaveBeenCalledWith(false);
                expect(clipboard.get('text')).toBe(SAMPLE_TEXT);
            });
        });

        describe('if selection does not exists, set text attribute to value of focused cell', function() {
            var rowDataMock;

            beforeEach(function() {
                rowDataMock = {
                    getValueString: jasmine.createSpy('getValueString').and.returnValue(SAMPLE_TEXT)
                };
                clipboard.dataModel.get = jasmine.createSpy('get').and.returnValue(rowDataMock);
                clipboard.renderModel.getCellData =
                    jasmine.createSpy('getCellData').and.returnValue({formattedValue: SAMPLE_TEXT});

                clipboard.selectionModel.hasSelection = _.constant(false);
                clipboard.focusModel.which = _.constant({
                    rowKey: 0,
                    columnName: 'c1'
                });
            });

            it('with fommatedValue', function() {
                clipboard.copyOption = {useFormattedValue: true};
                triggerCopyEvent('copy');

                expect(clipboard.renderModel.getCellData).toHaveBeenCalledWith(0, 'c1');
                expect(clipboard.get('text')).toBe(SAMPLE_TEXT);
            });

            it('with original value', function() {
                triggerCopyEvent('copy');

                expect(clipboard.dataModel.get).toHaveBeenCalledWith(0);
                expect(rowDataMock.getValueString).toHaveBeenCalledWith('c1');
                expect(clipboard.get('text')).toBe(SAMPLE_TEXT);
            });
        });
    });

    describe('key:clipboard event with paste command', function() {
        var clipboardText = 'a\tb\tc\nd\te\tf';
        var data = [['a', 'b', 'c'], ['d', 'e', 'f']];
        var startIndex = {
            row: 0,
            column: 0
        };

        beforeEach(function() {
            clipboard.dataModel.paste = jasmine.createSpy('paste');
        });

        it('if selection exists, duplicate data and paste from start position of selection range', function() {
            spyOn(clipboard, '_duplicateData').and.callFake(_.identity);
            clipboard.selectionModel.hasSelection = _.constant(true);
            clipboard.selectionModel.getStartIndex = _.constant(startIndex);
            clipboard.selectionModel.set('range', {
                row: [0, 2],
                column: [0, 2]
            });

            triggerPasteEvent(clipboardText);

            expect(clipboard._duplicateData).toHaveBeenCalledWith(data, 3, 3);
            expect(clipboard.dataModel.paste).toHaveBeenCalledWith(data, startIndex);
        });

        it('if selection does not exist, paste data from focused position', function() {
            clipboard.selectionModel.hasSelection = _.constant(false);
            clipboard.focusModel.indexOf = _.constant(startIndex);

            triggerPasteEvent(clipboardText);

            expect(clipboard.dataModel.paste).toHaveBeenCalledWith(data, startIndex);
        });
    });

    describe('_duplicateData', function() {
        describe('should duplicate data', function() {
            it('when length of selection row range is multiple of data row length', function() {
                var data = [[1, 2], [3, 4]];
                var result = clipboard._duplicateData(data, 5, 2);

                expect(result).toEqual([[1, 2], [3, 4], [1, 2], [3, 4]]);
            });

            it('when length of selection column range is multiple of data column length', function() {
                var data = [[1, 2], [3, 4]];
                var result = clipboard._duplicateData(data, 2, 5);

                expect(result).toEqual([[1, 2, 1, 2], [3, 4, 3, 4]]);
            });

            it('when length of selection range is multiple of data length', function() {
                var data = [[1, 2], [3, 4]];
                var result = clipboard._duplicateData(data, 5, 5);

                expect(result).toEqual([[1, 2, 1, 2], [3, 4, 3, 4], [1, 2, 1, 2], [3, 4, 3, 4]]);
            });
        });

        describe('should return same data', function() {
            it('if the length of selection range is not multiple of data length', function() {
                var data = [[1, 2], [3, 4]];
                var result = clipboard._duplicateData(data, 3, 3);

                expect(result).toEqual([[1, 2], [3, 4]]);
            });

            it('if the length of selection range is smaller than data length', function() {
                var data = [[1, 2], [3, 4]];
                var result = clipboard._duplicateData(data, 1, 1);

                expect(result).toEqual([[1, 2], [3, 4]]);
            });
        });
    });
});
