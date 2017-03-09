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

    it('"findRows" should find rows by conditions.', function() {
        var grid = createGrid(['c1', 'c2', 'c3']);
        var rowList, foundRowList;

        grid.setRowList([
            {c1: 'a', c2: 'b', c3: 'c'},
            {c1: 'b', c2: 'b', c3: 'c'},
            {c1: 'a', c2: 'c', c3: 'b'}
        ]);

        rowList = grid.getRowList();
        foundRowList = grid.findRows({c2: 'b', c3: 'c'});

        expect(foundRowList.length).toBe(2);
        expect(foundRowList[0]).toEqual(rowList[0]);
        expect(foundRowList[1]).toEqual(rowList[1]);
    });

    describe('Using "keyColumnName" option', function() {
        var grid;

        beforeEach(function() {
            grid = createGrid(['c1', 'c2'], {
                keyColumnName: 'c2'
            });
        });

        it('and key column\'s value is string type, event object has "rowKey" of string type.', function() {
            grid.setRowList([{c1: 100, c2: 200}]);

            spyOn(grid.container, 'trigger');

            grid.container._onClick({
                target: grid.getElement(200, 'c2')
            });

            expect(grid.container.trigger.calls.argsFor(0)[1].rowKey).toBe(200);
        });

        it('and key column\'s value is string type, event object has "rowKey" of string type.', function() {
            grid.setRowList([{c1: 'a', c2: 'b'}]);

            spyOn(grid.container, 'trigger');

            grid.container._onClick({
                target: grid.getElement('b', 'c2')
            });

            expect(grid.container.trigger.calls.argsFor(0)[1].rowKey).toBe('b');
        });
    });
});
