'use strict';

var DatePickerLayer = require('view/datePickerLayer');
var classNameConst = require('common/classNameConst');

function createDatePickerLayer() {
    return new DatePickerLayer({
        textPainter: _.assign({}, Backbone.Events),
        domState: {
            getOffset: _.constant({
                top: 0,
                left: 0
            })
        }
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

describe('[DatePickerLayer] ', function() {
    var layer;

    beforeEach(function() {
        layer = createDatePickerLayer();
        layer.render();
    });

    it('element has a LAYER_DATE_PICKER class name', function() {
        expect(layer.$el).toHaveClass(classNameConst.LAYER_DATE_PICKER);
    });

    it('creates calendar and datepicker instance when initializing', function() {
        expect(layer.datePicker).toEqual(jasmine.any(tui.component.Datepicker));
    });

    describe('when \'focusIn\' event occur on the text-painter ', function() {
        describe('and editType is \'text\' and component name is \'datePicker\', ', function() {
            it('set component options to datePicker instance', function() {
                var setInputSpy = spyOn(layer.datePicker, 'setInput');
                var setRangesSpy = spyOn(layer.datePicker, 'setRanges');
                var setDateSpy = spyOn(layer.datePicker, 'setDate');
                var options = {
                    date: new Date(2015, 10, 20),
                    format: 'yyyy-MM-dd',
                    selectableRanges: [
                         [new Date(2015, 10, 27), new Date(2016, 1, 15)]
                    ]
                };
                var $input = $('<input>');
                layer.columnModel = createColumnModelStub('text', 'datePicker', options);

                layer.textPainter.trigger('focusIn', $input, {});

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
                var setDateSpy = spyOn(layer.datePicker, 'setDate');
                var today = new Date();

                jasmine.clock().install();
                jasmine.clock().mockDate(today);

                layer.columnModel = createColumnModelStub('text', 'datePicker');
                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(setDateSpy.calls.argsFor(0)[0].getTime()).toBe(today.getTime());
                jasmine.clock().uninstall();
            });

            it('change input element and set date as value of element', function() {
                var setElementSpy = spyOn(layer.datePicker, 'setInput');
                var $input = $('<input>');

                layer.columnModel = createColumnModelStub('text', 'datePicker');
                layer.textPainter.trigger('focusIn', $input, {});

                expect(setElementSpy).toHaveBeenCalledWith($input, {
                    format: 'yyyy-MM-dd',
                    syncFromInput: true
                });
            });

            it('datePicker should be opened and visible', function() {
                var spyOpen = spyOn(layer.datePicker, 'open').and.callThrough();
                layer.columnModel = createColumnModelStub('text', 'datePicker');

                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(layer.$el.css('display')).toBe('block');
                expect(spyOpen).toHaveBeenCalled();
            });
        });

        describe('and editType is not \'text\'', function() {
            it('datePicker should not be opened and the layer should be hidden', function() {
                var spyOpen = spyOn(layer.datePicker, 'open');
                layer.columnModel = createColumnModelStub('select', 'datePicker');

                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(layer.$el).toBeHidden();
                expect(spyOpen).not.toHaveBeenCalled();
            });
        });

        describe('and component name is not \'datePicker\'', function() {
            it('datePicker should not be opened and the layer should be hidden', function() {
                var spyOpen = spyOn(layer.datePicker, 'open');
                layer.columnModel = createColumnModelStub('text', 'autocomplete');

                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(layer.$el).toBeHidden();
                expect(spyOpen).not.toHaveBeenCalled();
            });
        });
    });

    describe('when \'focusOut\' event occur on the text painter, ', function() {
        it('close datePicker', function() {
            var spyClose = spyOn(layer.datePicker, 'close');

            layer.textPainter.trigger('focusOut');

            expect(spyClose).toHaveBeenCalled();
        });

        it('the element should be hidden', function() {
            layer.$el.show();
            layer.textPainter.trigger('focusOut');

            expect(layer.$el).toBeHidden();
        });
    });
});
