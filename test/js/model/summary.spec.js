'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Summary = require('model/summary');
var typeConst = require('common/constMap').summaryType;

fdescribe('model/summary', function() {
    var columnModel, dataModel, summary;

    beforeEach(function() {
        columnModel = new ColumnModelData({
            columnModelList: [
                {columnName: 'c1'},
                {columnName: 'c2'}
            ]
        });
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
    });

    describe('getValue() with initial data: ', function() {
        beforeEach(function() {
            dataModel.set([
                {c1: 1},
                {c1: 2},
                {c1: 3},
                {c1: 4}
            ]);
        });

        it('sum/avg/count/min/max', function() {
            summary = new Summary(null, {
                dataModel: dataModel,
                columnSummaries: {
                    c1: [
                        typeConst.SUM,
                        typeConst.MIN,
                        typeConst.MAX,
                        typeConst.CNT,
                        typeConst.AVG
                    ]
                }
            });

            expect(summary.getValue('c1', 'sum')).toBe(10);
            expect(summary.getValue('c1', 'avg')).toBe(2.5);
            expect(summary.getValue('c1', 'min')).toBe(1);
            expect(summary.getValue('c1', 'max')).toBe(4);
            expect(summary.getValue('c1', 'cnt')).toBe(4);
        });

        it('If the type is not specified, return null', function() {
            summary = new Summary(null, {
                dataModel: dataModel,
                columnSummaries: {
                    c1: [typeConst.CNT]
                }
            });

            expect(summary.getValue('c1', 'sum')).toBeNull();
            expect(summary.getValue('c1', 'avg')).toBeNull();
            expect(summary.getValue('c1', 'min')).toBeNull();
            expect(summary.getValue('c1', 'max')).toBeNull();
            expect(summary.getValue('c1', 'cnt')).not.toBeNull();
        });

        it('Treat every falsy value as a number 0', function() {
            dataModel.set([
                {c1: 1},
                {c2: 1},
                {c1: null, c2: ''},
                {c1: null, c2: false}
            ]);

            summary = new Summary(null, {
                dataModel: dataModel,
                columnSummaries: {
                    c1: [typeConst.SUM],
                    c2: [typeConst.SUM]
                }
            });

            expect(summary.getValue('c1', 'sum')).toBe(1);
            expect(summary.getValue('c2', 'sum')).toBe(1);
        });
    });
});
