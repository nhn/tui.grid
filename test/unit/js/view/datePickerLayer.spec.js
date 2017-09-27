'use strict';

var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');

var DatePicker = require('tui-date-picker');

var DatePickerLayer = require('view/datePickerLayer');
var classNameConst = require('common/classNameConst');
var ColumnModel = require('model/data/columnModel');

function createDatePickerLayer(columnModelData) {
    return new DatePickerLayer({
        textPainter: _.assign({
            blockFocusingOut: function() {},
            unblockFocusingOut: function() {}
        }, Backbone.Events),
        domState: {
            getOffset: _.constant({
                top: 0,
                left: 0
            })
        },
        columnModel: new ColumnModel(columnModelData)
    });
}

function createColumnModelStub(editType, compName, compOption) {
    return {
        getColumnModel: _.constant({
            component: {
                name: compName,
                options: compOption
            }
        }),
        getEditType: _.constant(editType)
    };
}

function createFocusModelStub(rowKey, columnName) {
    return {
        which: _.constant({
            rowKey: rowKey,
            columnName: columnName
        })
    };
}

describe('[DatePickerLayer] ', function() {
    var layer;
    var columnModelData;

    beforeEach(function() {
        columnModelData = {
            columns: [
                {
                    name: 'c1',
                    component: {
                        name: 'datePicker'
                    }
                }
            ]
        };
        layer = createDatePickerLayer(columnModelData);
        layer.render();
    });

    it('element has a LAYER_DATE_PICKER class name', function() {
        expect(layer.$el).toHaveClass(classNameConst.LAYER_DATE_PICKER);
    });

    it('creates datepickers instance when initializing', function() {
        expect(layer.datePickerMap.c1).toEqual(jasmine.any(DatePicker));
    });

    describe('when \'focusIn\' event occur on the text-painter ', function() {
        describe('and editType is \'text\' and component name is \'datePicker\', ', function() {
            it('set component options to datePicker instance', function() {
                var datePicker = layer.datePickerMap.c1;
                var setInputSpy = spyOn(datePicker, 'setInput');
                var setRangesSpy = spyOn(datePicker, 'setRanges');
                var setDateSpy = spyOn(datePicker, 'setDate');
                var options = {
                    date: new Date(2015, 10, 20),
                    format: 'yyyy-MM-dd',
                    selectableRanges: [[
                        new Date(2015, 10, 27),
                        new Date(2016, 1, 15)
                    ]]
                };
                var $input = $('<input>');

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('text', 'datePicker', options);
                layer.textPainter.trigger('focusIn', $input, {
                    columnName: 'c1'
                });

                expect(setInputSpy).toHaveBeenCalledWith(
                    $input,
                    {
                        format: options.format,
                        syncFromInput: true
                    }
                );
                expect(setRangesSpy).toHaveBeenCalledWith(options.selectableRanges);
                expect(setDateSpy).toHaveBeenCalledWith(options.date);
            });

            it('set date with current time if option.date is not specified', function() {
                var setDateSpy = spyOn(layer.datePickerMap.c1, 'setDate');
                var today = new Date();

                jasmine.clock().install();
                jasmine.clock().mockDate(today);

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('text', 'datePicker');
                layer.textPainter.trigger('focusIn', $('<input>'), {
                    columnName: 'c1'
                });

                expect(setDateSpy.calls.argsFor(0)[0].getTime()).toBe(today.getTime());
                jasmine.clock().uninstall();
            });

            it('change input element and set date as value of element', function() {
                var setElementSpy = spyOn(layer.datePickerMap.c1, 'setInput');
                var $input = $('<input>');

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('text', 'datePicker');
                layer.textPainter.trigger('focusIn', $input, {
                    columnName: 'c1'
                });

                expect(setElementSpy).toHaveBeenCalledWith($input, {
                    format: 'yyyy-MM-dd',
                    syncFromInput: true
                });
            });

            it('datePicker should be opened and visible', function() {
                var spyOpen = spyOn(layer.datePickerMap.c1, 'open').and.callThrough();

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('text', 'datePicker');
                layer.textPainter.trigger('focusIn', $('<input>'), {
                    columnName: 'c1'
                });

                expect(layer.$el.css('display')).toBe('block');
                expect(spyOpen).toHaveBeenCalled();
            });
        });

        describe('and editType is not \'text\'', function() {
            it('datePicker should not be opened and the layer should be hidden', function() {
                var spyOpen = spyOn(layer.datePickerMap.c1, 'open');

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('select', 'datePicker');
                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(layer.$el).toBeHidden();
                expect(spyOpen).not.toHaveBeenCalled();
            });
        });

        describe('and component name is not \'datePicker\'', function() {
            it('datePicker should not be opened and the layer should be hidden', function() {
                var spyOpen = spyOn(layer.datePickerMap.c1, 'open');

                layer.focusModel = createFocusModelStub(0, 'c1');
                layer.columnModel = createColumnModelStub('text', 'autocomplete');
                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(layer.$el).toBeHidden();
                expect(spyOpen).not.toHaveBeenCalled();
            });
        });
    });
});
