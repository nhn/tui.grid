'use strict';

var PainterController = require('painter/controller');
var DataModel = require('model/data/rowList');
var ColumnModel = require('model/data/columnModel');

function create() {
    var columnModel = new ColumnModel();
    var dataModel = new DataModel(null, {
        columnModel: columnModel
    });

    return new PainterController({
        columnModel: columnModel,
        dataModel: dataModel
    });
}

describe('painter/controller', function() {
    describe('setValueIfNotUsingViewMode', function() {
        it('should call setValue if useViewMode:false', function() {
            var controller = create();
            var address = {
                rowKey: 0,
                columnName: 'c1'
            };

            controller.columnModel.set('columns', [{
                name: 'c1',
                editOptions: {
                    useViewMode: false
                }
            }]);
            spyOn(controller, 'setValue');

            controller.setValueIfNotUsingViewMode(address, 'hi');

            expect(controller.setValue).toHaveBeenCalledWith(address, 'hi');
        });

        it('should not call setValue if useViewMode:true', function() {
            var controller = create();
            var address = {
                rowKey: 0,
                columnName: 'c1'
            };

            controller.columnModel.set('columns', [{
                name: 'c1',
                editOptions: {
                    useViewMode: true
                }
            }]);
            spyOn(controller, 'setValue');

            controller.setValueIfNotUsingViewMode(address, 'hi');

            expect(controller.setValue).not.toHaveBeenCalled();
        });
    });

    describe('setValue()', function() {
        it('string value should be trimmed', function() {
            var controller = create();
            controller.columnModel.set('columns', [{
                name: 'c1'
            }]);
            spyOn(controller.dataModel, 'setValue');
            controller.setValue({
                rowKey: 0,
                columnName: 'c1'
            }, '   hi   ');

            expect(controller.dataModel.setValue).toHaveBeenCalledWith(0, 'c1', 'hi');
        });

        describe('for the number type: ', function() {
            var controller;

            beforeEach(function() {
                controller = create();
                controller.columnModel.set('columns', [{
                    name: 'c1',
                    dataType: 'number'
                }]);
            });

            it('value should be converted to number type', function() {
                spyOn(controller.dataModel, 'setValue');
                controller.setValue({
                    rowKey: 0,
                    columnName: 'c1'
                }, '1234');

                expect(controller.dataModel.setValue).toHaveBeenCalledWith(0, 'c1', 1234);
            });

            it('comma(,) contained in the value should be ignored', function() {
                spyOn(controller.dataModel, 'setValue');
                controller.setValue({
                    rowKey: 0,
                    columnName: 'c1'
                }, '123,456');

                expect(controller.dataModel.setValue).toHaveBeenCalledWith(0, 'c1', 123456);
            });

            it('if value cannot be converted to number, use original value', function() {
                spyOn(controller.dataModel, 'setValue');
                controller.setValue({
                    rowKey: 0,
                    columnName: 'c1'
                }, 'asdf');

                expect(controller.dataModel.setValue).toHaveBeenCalledWith(0, 'c1', 'asdf');
            });
        });
    });
});
