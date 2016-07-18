'use strict';

var RowModel = require('model/row');

describe('model.row', function() {
    describe('_getFormattedValue:', function() {
        var func = RowModel.prototype._getFormattedValue;

        it('if type is string, return as is', function() {
            expect(func('0', {}, {})).toBe('0');
            expect(func('hello', {}, {})).toBe('hello');
        });

        it('if type is number, return string-converted value', function() {
            expect(func(0, {}, {})).toBe('0');
            expect(func(1000, {}, {})).toBe('1000');
        });

        it('if type is false value, return empty string', function() {
            expect(func(null, {}, {})).toBe('');
            expect(func(false, {}, {})).toBe('');
            expect(func(undefined, {}, {})).toBe(''); // eslint-disable-line no-undefined
        });

        it('if column has formatter, execute the function and return the result', function() {
            var attrs = {};
            var column = {
                formatter: jasmine.createSpy('formatter').and.returnValue('hello')
            };
            var result = func(1, attrs, column);

            expect(result).toBe('hello');
            expect(column.formatter).toHaveBeenCalledWith(1, attrs, column);
        });
    });
});
