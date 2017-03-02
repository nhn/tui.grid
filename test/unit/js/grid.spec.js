'use strict';

var _ = require('underscore');

describe('grid', function() {
    function createGrid(columnNames, options) {
        var columns = [];
        _.each(columnNames, function(columnName) {
            columns.push({
                name: columnName
            });
        });
        options = _.extend({
            el: $('<div>'),
            columns: columns
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
            grid.setData([
                {}, {}, {}, {}
            ]);
        });

        it('getCheckedRows', function() {
            var checkedRows;

            grid.check(1);
            grid.check(3);
            checkedRows = grid.getCheckedRows();

            expect(checkedRows.length).toBe(2);
            expect(checkedRows[0].rowKey).toBe(1);
            expect(checkedRows[1].rowKey).toBe(3);
        });

        it('getCheckedRowKeys', function() {
            var checkedRowKeys;

            grid.check(1);
            grid.check(3);
            checkedRowKeys = grid.getCheckedRowKeys();

            expect(checkedRowKeys.length).toBe(2);
            expect(checkedRowKeys[0]).toBe(1);
            expect(checkedRowKeys[1]).toBe(3);
        });

        it('removeCheckedRows', function() {
            var rows;

            grid.check(0);
            grid.check(2);
            grid.removeCheckedRows();
            rows = grid.getRows();

            expect(rows.length).toBe(2);
            expect(rows[0].rowKey).toBe(1);
            expect(rows[1].rowKey).toBe(3);
        });
    });

    describe('setFooterColumnContent', function() {
        it('should call columnModel.setFooterContent', function() {
            var grid = createGrid(null, {
                footer: {
                    columnContent: {}
                }
            });
            var columnModel = grid.modelManager.columnModel;
            spyOn(columnModel, 'setFooterContent');

            grid.setFooterColumnContent('c1', 'contents');

            expect(columnModel.setFooterContent).toHaveBeenCalledWith('c1', 'contents');
        });
    });
});
