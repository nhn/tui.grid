'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Summary = require('model/summary');
//
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

    describe('getValue()', function() {
        describe('with initial data: ', function() {
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
                        c1: ['sum', 'avg', 'min', 'max', 'count']
                    }
                });

                expect(summary.getValue('c1', 'sum')).toBe(10);
                expect(summary.getValue('c1', 'avg')).toBe(2.5);
                expect(summary.getValue('c1', 'min')).toBe(1);
                expect(summary.getValue('c1', 'max')).toBe(4);
                expect(summary.getValue('c1', 'count')).toBe(4);
            });
        });
    });
});
