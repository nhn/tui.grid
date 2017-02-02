'use strict';

var Clipboard = require('model/clipboard');
var Model = require('base/model');

describe('grid paste test', function() {
    var clipboard;

    beforeEach(function() {
        var focusModel = new Model();
        var selectionModel = new Model();

        clipboard = new Clipboard(null, {
            focusModel: focusModel,
            selectionModel: selectionModel
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
