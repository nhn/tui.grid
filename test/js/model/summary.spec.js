'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Summary = require('model/summary');
var typeConst = require('common/constMap').summaryType;

function create(data, summaryTypeMap, useAutoCalculation) {
    var columnModel = new ColumnModelData({
        columnModelList: [
            {
                columnName: 'c1',
                editOption: {
                    type: 'text'
                }
            },
            {
                columnName: 'c2',
                editOption: {
                    type: 'text'
                }
            }
        ]
    });
    var dataModel = new RowListData([], {
        columnModel: columnModel
    });
    dataModel.setRowList(data);

    return new Summary(null, {
        dataModel: dataModel,
        columnModel: columnModel,
        summaryTypeMap: summaryTypeMap,
        useAutoCalculation: useAutoCalculation
    });
}

describe('model/summary', function() {
    describe('getValue() with initial data: ', function() {
        var data = [
            {c1: 1},
            {c1: 2},
            {c1: 3},
            {c1: 4}
        ];

        it('sum/avg/count/min/max', function() {
            var summary = create(data, {
                c1: [
                    typeConst.SUM,
                    typeConst.MIN,
                    typeConst.MAX,
                    typeConst.CNT,
                    typeConst.AVG
                ]
            });

            expect(summary.getValue('c1', 'sum')).toBe(10);
            expect(summary.getValue('c1', 'avg')).toBe(2.5);
            expect(summary.getValue('c1', 'min')).toBe(1);
            expect(summary.getValue('c1', 'max')).toBe(4);
            expect(summary.getValue('c1', 'cnt')).toBe(4);
        });

        it('If the type is not specified, return null', function() {
            var summary = create(data, {
                c1: [typeConst.CNT]
            });

            expect(summary.getValue('c1', 'sum')).toBeNull();
            expect(summary.getValue('c1', 'avg')).toBeNull();
            expect(summary.getValue('c1', 'min')).toBeNull();
            expect(summary.getValue('c1', 'max')).toBeNull();
            expect(summary.getValue('c1', 'cnt')).not.toBeNull();
        });

        it('Treat every NaN value as a number 0', function() {
            var summary = create([
                {c1: 1},
                {c2: '1'}, // change to number 1
                {c1: null, c2: 'hoho'},
                {c1: null, c2: false}
            ], {
                c1: [typeConst.SUM],
                c2: [typeConst.SUM]
            });

            expect(summary.getValue('c1', 'sum')).toBe(1);
            expect(summary.getValue('c2', 'sum')).toBe(1);
        });
    });

    describe('Should update summary values when dataModel is changed - ', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {c1: 1, c2: 1},
                {c1: 2, c2: 2}
            ], {
                c1: [typeConst.SUM],
                c2: [typeConst.SUM]
            });
        });

        it('Add', function() {
            summary.dataModel.append({c1: 3, c2: 3});

            expect(summary.getValue('c1', 'sum')).toBe(6);
            expect(summary.getValue('c2', 'sum')).toBe(6);
        });

        it('Remove', function() {
            summary.dataModel.removeRow(1);

            expect(summary.getValue('c1', 'sum')).toBe(1);
            expect(summary.getValue('c2', 'sum')).toBe(1);
        });

        it('Update', function() {
            summary.dataModel.setValue(1, 'c1', 3);

            expect(summary.getValue('c1', 'sum')).toBe(4);
        });

        it('Reset', function() {
            summary.dataModel.setRowList([
                {c1: 3, c2: 4},
                {c1: 3, c2: 4}
            ]);

            expect(summary.getValue('c1', 'sum')).toBe(6);
            expect(summary.getValue('c2', 'sum')).toBe(8);
        });

        it('Delete Range', function() {
            summary.dataModel.delRange({
                row: [0, 0],
                column: [0, 0]
            });

            expect(summary.getValue('c1', 'sum')).toBe(2);
        });
    });

    describe('If useAutoCalculation is false', function() {
        var summary;

        beforeEach(function() {
            summary = create([{c1: 1}], {c1: [typeConst.SUM]}, false);
        });

        it('initial value should not be calculated', function() {
            expect(summary.getValue('c1', 'sum')).toBe(null);
        });

        it('change events on dataModel should be ignored', function() {
            summary.dataModel.setValue(1, 'c1', 3);
            expect(summary.getValue('c1', 'sum')).toBe(null);
        });
    });

    describe('When summary map is chnaged change event should be triggered ', function() {
        var changeSpy, summary;

        beforeEach(function() {
            changeSpy = jasmine.createSpy();
            summary = create([
                {c1: 1, c2: 1},
                {c1: 2, c2: 2}
            ], {
                c1: [typeConst.SUM],
                c2: [typeConst.SUM]
            });
            summary.on('change', changeSpy);
        });

        it('for each column', function() {
            summary.dataModel.append({c1: 3, c2: 3});

            expect(changeSpy).toHaveBeenCalledWith('c1', {sum: 6});
            expect(changeSpy).toHaveBeenCalledWith('c2', {sum: 6});
        });

        it('only for changed column', function() {
            summary.dataModel.setValue(0, 'c1', 0);

            expect(changeSpy.calls.count()).toBe(1);
            expect(changeSpy.calls.argsFor(0)[0]).toBe('c1');
        });
    });

    describe('setValue()', function() {
        it('set summary value', function() {
            var summary = create([], {
                c1: [typeConst.SUM]
            });

            summary.setValue('c1', 'sum', 100);

            expect(summary.getValue('c1', 'sum')).toBe(100);
        });

        it('set summary map if the summaryType is not specified', function() {
            var summary = create([], {
                c1: [typeConst.SUM]
            });

            summary.setValue('c1', {
                sum: 100
            });

            expect(summary.getValue('c1', 'sum')).toBe(100);
        });

        it('set value for only registered type', function() {
            var summary = create([], {
                c1: [typeConst.SUM, typeConst.AVG]
            });

            summary.setValue('c1', 'min', 100);

            expect(summary.getValue('c1', 'min')).toBeNull();

            summary.setValue('c1', {
                sum: 100,
                min: 100,
                max: 100
            });

            expect(summary.getValue('c1', 'sum')).toBe(100);
            expect(summary.getValue('c1', 'min')).toBeNull();
            expect(summary.getValue('c1', 'max')).toBeNull();
        });
    });
});
