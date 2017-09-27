'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Summary = require('model/summary');
var typeConst = require('common/constMap').summaryType;

function create(data, autoColumnNames) {
    var columnModel = new ColumnModelData({
        columns: [
            {
                name: 'c1',
                editOptions: {
                    type: 'text'
                }
            },
            {
                name: 'c2',
                editOptions: {
                    type: 'text'
                }
            }
        ]
    });
    var dataModel = new RowListData([], {
        columnModel: columnModel
    });
    dataModel.setData(data);

    return new Summary(null, {
        dataModel: dataModel,
        columnModel: columnModel,
        autoColumnNames: autoColumnNames
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
            var summary = create(data, ['c1']);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(10);
            expect(summary.getValue('c1', typeConst.AVG)).toBe(2.5);
            expect(summary.getValue('c1', typeConst.MIN)).toBe(1);
            expect(summary.getValue('c1', typeConst.MAX)).toBe(4);
            expect(summary.getValue('c1', typeConst.CNT)).toBe(4);
        });

        it('Treat every NaN value as a number 0', function() {
            var summary = create([
                {c1: 1},
                {c2: '1'}, // change to number 1
                {
                    c1: null,
                    c2: 'hoho'
                },
                {
                    c1: null,
                    c2: false
                }
            ], [
                'c1', 'c2'
            ]);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(1);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(1);
        });
    });

    describe('Should update summary values when dataModel is changed - ', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {
                    c1: 1,
                    c2: 1
                },
                {
                    c1: 2,
                    c2: 2
                }
            ], ['c1', 'c2']);
        });

        it('Add', function() {
            summary.dataModel.append({
                c1: 3,
                c2: 3
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(6);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(6);
        });

        it('Remove', function() {
            summary.dataModel.removeRow(1);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(1);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(1);
        });

        it('Update', function() {
            summary.dataModel.setValue(1, 'c1', 3);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(4);
        });

        it('Reset', function() {
            summary.dataModel.setData([
                {
                    c1: 3,
                    c2: 4
                },
                {
                    c1: 3,
                    c2: 4
                }
            ]);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(6);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(8);
        });

        it('Delete Range', function() {
            summary.dataModel.delRange({
                row: [0, 0],
                column: [0, 0]
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(2);
        });
    });

    describe('If a column name is not in the autoColumnNames', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {c1: 1},
                {c2: 1}
            ], ['c1']);
        });

        it('initial value should not be calculated', function() {
            expect(summary.getValue('c2', typeConst.SUM)).toBe(null);
        });

        it('change events on dataModel should be ignored', function() {
            summary.dataModel.setValue(1, 'c2', 3);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(null);
        });
    });

    describe('When summary map is changed, change event should be triggered ', function() {
        var changeSpy, summary;

        beforeEach(function() {
            changeSpy = jasmine.createSpy();
            summary = create([
                {
                    c1: 1,
                    c2: 1
                },
                {
                    c1: 2,
                    c2: 2
                }
            ], ['c1', 'c2']);

            summary.on('change', changeSpy);
        });

        it('for each column', function() {
            summary.dataModel.append({
                c1: 3,
                c2: 3
            });

            expect(changeSpy).toHaveBeenCalledWith('c1', summary.getValue('c1'));
            expect(changeSpy).toHaveBeenCalledWith('c2', summary.getValue('c2'));
        });

        it('only for changed column', function() {
            summary.dataModel.setValue(0, 'c1', 0);

            expect(changeSpy.calls.count()).toBe(1);
            expect(changeSpy.calls.argsFor(0)[0]).toBe('c1');
        });
    });
});
