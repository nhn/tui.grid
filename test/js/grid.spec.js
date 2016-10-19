'use strict';

describe('grid', function() {
    function createGrid(columnNames, options) {
        var columnModelList = [];
        _.each(columnNames, function(columnName) {
            columnModelList.push({
                columnName: columnName
            });
        });
        options = _.extend({
            el: $('<div>'),
            columnModelList: columnModelList
        }, options);

        return new tui.Grid(options);
    }

    describe('dataModel delegations', function() {
        var grid, dataModel;

        beforeEach(function() {
            grid = createGrid();
            dataModel = grid.modelManager.dataModel;
        });

        it('disable -> dataModel.setDisable(true)', function() {
            spyOn(dataModel, 'setDisabled');
            grid.disable();
            expect(dataModel.setDisabled).toHaveBeenCalledWith(true);
        });

        it('enable -> dataModel.setDisable(false)', function() {
            spyOn(dataModel, 'setDisabled');
            grid.enable();
            expect(dataModel.setDisabled).toHaveBeenCalledWith(false);
        });

        it('getRowAt -> dataModel.getRowDataAt', function() {
            spyOn(dataModel, 'getRowDataAt');
            grid.getRowAt(0, true);
            expect(dataModel.getRowDataAt).toHaveBeenCalledWith(0, true);
        });
    });

    describe('checked rows', function() {
        var grid;

        beforeEach(function() {
            grid = createGrid(['c1'], {selectType: 'checkbox'});
            grid.setRowList([
                {}, {}, {}, {}
            ]);
        });

        it('getCheckedRowList', function() {
            var checkedRows;

            grid.check(1);
            grid.check(3);
            checkedRows = grid.getCheckedRowList();

            expect(checkedRows.length).toBe(2);
            expect(checkedRows[0].rowKey).toBe(1);
            expect(checkedRows[1].rowKey).toBe(3);
        });

        it('getCheckedRowKeyList', function() {
            var checkedRowKeys;

            grid.check(1);
            grid.check(3);
            checkedRowKeys = grid.getCheckedRowKeyList();

            expect(checkedRowKeys.length).toBe(2);
            expect(checkedRowKeys[0]).toBe(1);
            expect(checkedRowKeys[1]).toBe(3);
        });

        it('removeCheckedRows', function() {
            var rowList;

            grid.check(0);
            grid.check(2);
            grid.removeCheckedRows();
            rowList = grid.getRowList();

            expect(rowList.length).toBe(2);
            expect(rowList[0].rowKey).toBe(1);
            expect(rowList[1].rowKey).toBe(3);
        });
    });

    describe('setFooterSummaryValue', function() {
        it('should call summary.setValue', function() {
            var grid = createGrid(null, {
                footer: {
                    columnSummary: {}
                }
            });
            var summary = grid.modelManager.summaryModel;
            spyOn(summary, 'setValue');

            grid.setFooterSummaryValue('c1', 'sum', 100);

            expect(summary.setValue).toHaveBeenCalledWith('c1', 'sum', 100);
        });
    });
});
