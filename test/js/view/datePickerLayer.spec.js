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
                option: compOption
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
        expect(layer.calendar).toEqual(jasmine.any(tui.component.Calendar));
        expect(layer.datePicker).toEqual(jasmine.any(tui.component.DatePicker));
    });

    describe('datePicker:', function() {
        it('wrapper element should be a child of the layer element', function() {
            var $wrapper = layer.datePicker._$wrapperElement;

            expect($wrapper.parent()[0]).toBe(layer.$el[0]);
        });

        it('should call close() when \'update\' event occur', function() {
            var datePicker = layer.datePicker;
            spyOn(datePicker, 'close');

            datePicker.fire('update');

            expect(datePicker.close).toHaveBeenCalled();
        });
    });

    describe('when \'focusIn\' event occur on the text-painter ', function() {
        describe('and editType is \'text\' and component name is \'datePicker\', ', function() {
            it('set component options to datePicker instance', function() {
                var setDateFormSpy = spyOn(layer.datePicker, 'setDateForm');
                var setRangesSpy = spyOn(layer.datePicker, 'setRanges');
                var options = {
                    dateForm: 'yyyy-mm-dd',
                    selectableRanges: [
                         [{year: 2015, month: 11, date: 17}, {year: 2016, month: 2, date: 15}]
                    ]
                };
                layer.columnModel = createColumnModelStub('text', 'datePicker', options);

                layer.textPainter.trigger('focusIn', $('<input>'), {});

                expect(setDateFormSpy).toHaveBeenCalledWith(options.dateForm);
                expect(setRangesSpy).toHaveBeenCalledWith(options.selectableRanges);
            });

            it('change input element and set date to today', function() {
                var setDateSpy = spyOn(layer.datePicker, 'setDate');
                var setElementSpy = spyOn(layer.datePicker, 'setElement');
                var $input = $('<input>');
                var today = new Date();
                var year = today.getFullYear();
                var month = today.getMonth() + 1;
                var date = today.getDate();

                layer.columnModel = createColumnModelStub('text', 'datePicker');

                layer.textPainter.trigger('focusIn', $input, {});

                expect(setDateSpy).toHaveBeenCalledWith(year, month, date);
                expect(setElementSpy).toHaveBeenCalledWith($input);
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
