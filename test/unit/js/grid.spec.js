'use strict';

var _ = require('underscore');

var Grid = require('grid');
var snippet = require('tui-code-snippet');

describe('grid', function() {
    function createGrid(columnNames, options) {
        var columns = [];
        _.each(columnNames, function(columnName) {
            columns.push({
                name: columnName
            });
        });
        options = _.extend({
            el: jasmine.getFixtures().set('<div></div>'),
            columns: columns
        }, options);

        return new Grid(options);
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
            grid = createGrid(['c1'], {
                rowHeaders: ['checkbox']
            });
            grid.setData([
                {}, {}, {}, {}
            ]);
            Grid.setLanguage('en');
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

    describe('setBodyHeight', function() {
        it('if bodyHeight is auto, fixedHeight should be false', function() {
            var grid = createGrid();
            var dimensionModel = grid.modelManager.dimensionModel;

            grid.setBodyHeight('auto');

            expect(dimensionModel.get('fixedHeight')).toBe(false);
            expect(dimensionModel.get('bodyHeight')).toBe('auto');
        });

        it('if bodyHeight is number, fixedHeight should be true', function() {
            var grid = createGrid();
            var dimensionModel = grid.modelManager.dimensionModel;

            grid.setBodyHeight(100);

            expect(dimensionModel.get('fixedHeight')).toBe(true);
            expect(dimensionModel.get('bodyHeight')).toBe(100);
        });
    });

    describe('setSummaryColumnContent', function() {
        it('should call summaryModel.setColumnContent', function() {
            var grid = createGrid(null, {
                summary: {
                    columnContent: {}
                }
            });
            var summaryModel = grid.modelManager.summaryModel;
            spyOn(summaryModel, 'setColumnContent');

            grid.setSummaryColumnContent('c1', 'contents');

            expect(summaryModel.setColumnContent).toHaveBeenCalledWith('c1', 'contents', true);
        });
    });

    describe('Using "keyColumnName" option', function() {
        var grid, spy, coordRowModel;

        beforeEach(function() {
            spy = jasmine.createSpy();
            grid = createGrid(['c1', 'c2'], {
                keyColumnName: 'c2'
            });
            coordRowModel = grid.modelManager.coordRowModel;
            spyOn(coordRowModel, 'getHeightAt').and.returnValue(1);
            grid.on('dblclick', spy);
        });

        it('and key column\'s value is number, event object has "rowKey" of number type.', function() {
            grid.setData([{
                c1: 100,
                c2: 200
            }]);

            grid.container._onDblClick({
                target: grid.getElement(200, 'c2')
            });

            expect(spy.calls.argsFor(0)[0].rowKey).toBe(200);
        });

        it('and value of key column is string having number, event object has "rowKey" of number type.', function() {
            grid.setData([{
                c1: '100',
                c2: '200'
            }]);

            grid.container._onDblClick({
                target: grid.getElement('200', 'c2')
            });

            expect(spy.calls.argsFor(0)[0].rowKey).toBe(200);
        });

        it('and key column\'s value is string, event object has "rowKey" of string type.', function() {
            grid.setData([{
                c1: 'a',
                c2: 'b'
            }]);

            grid.container._onDblClick({
                target: grid.getElement('b', 'c2')
            });

            expect(spy.calls.argsFor(0)[0].rowKey).toBe('b');
        });
    });

    describe('Using "data" option', function() {
        var data, grid;

        beforeEach(function() {
            data = [
                {c1: 'test'},
                {c2: 'test2'}
            ];
            grid = createGrid(['c1'], {
                data: data
            });
        });

        it('the rows are created and each cell set to data.', function() {
            expect(grid.getRowCount()).toBe(data.length);
            expect(grid.getRow(0).c1).toEqual(data[0].c1);
            expect(grid.getRow(1).c1).toEqual(data[1].c1);
        });
    });

    describe('Using "usageStatistics" option', function() {
        beforeEach(function() {
            spyOn(snippet, 'sendHostname');
        });

        it('when the value set to true by default, the hostname is send to server.', function() {
            createGrid(['c1']);

            expect(snippet.sendHostname).toHaveBeenCalled();
        });

        it('when the value set to false, the hostname is not send to server.', function() {
            createGrid(['c1'], {
                usageStatistics: false
            });

            expect(snippet.sendHostname).not.toHaveBeenCalled();
        });
    });

    describe('tree grid', function() {
        var grid;

        beforeEach(function() {
            grid = createGrid('c1', {
                treeColumnOptions: {
                    name: 'c1'
                }
            });
            grid.setData([{
                c1: 'r1', // 0
                _children: [{
                    c1: 'r2' // 1
                }, {
                    c1: 'r3' // 2
                }]
            }, {
                c1: 'r4', // 3
                _children: [{
                    c1: 'r5' // 4
                }, {
                    c1: 'r6', // 5
                    _children: [{
                        c1: 'r7' // 6
                    }],
                    _extraData: {
                        treeState: 'COLLAPSE'
                    }
                }]
            }]);
        });

        it('expand should trigger expanded event', function() {
            var spy = jasmine.createSpy('expanded');
            grid.on('expanded', spy);

            grid.expand(0);

            expect(spy).toHaveBeenCalled();
        });

        it('expandAll should trigger expandedAll event', function() {
            var spy = jasmine.createSpy('expandedAll');
            grid.on('expandedAll', spy);

            grid.expandAll();

            expect(spy).toHaveBeenCalled();
        });

        it('collapse should trigger collapsed event', function() {
            var spy = jasmine.createSpy('collapsed');
            grid.on('collapsed', spy);

            grid.collapse(0);

            expect(spy).toHaveBeenCalled();
        });

        it('collapseAll should trigger collapsedAll event', function() {
            var spy = jasmine.createSpy('collapsedAll');
            grid.on('collapsedAll', spy);

            grid.collapseAll();

            expect(spy).toHaveBeenCalled();
        });

        it('getAncestors should return the ancestor of the row which has the given row key', function() {
            expect(grid.getAncestors(6).length).toEqual(2);
            expect(grid.getAncestors(6)[0].get('rowKey')).toEqual(3);
            expect(grid.getAncestors(6)[1].get('rowKey')).toEqual(5);
        });

        it('getDescendants should return the descendants of the row which has the given row key', function() {
            expect(grid.getDescendants(3).length).toBe(3);
            expect(grid.getDescendants(3)[0].get('rowKey')).toEqual(4);
            expect(grid.getDescendants(3)[1].get('rowKey')).toEqual(5);
            expect(grid.getDescendants(3)[2].get('rowKey')).toEqual(6);
        });

        it('getParent should return the parent of the row which has the given row key', function() {
            expect(grid.getParent(6).get('rowKey')).toBe(5);
        });

        it('getChildren should return the children of the row which has the given row key', function() {
            expect(grid.getChildren(3).length).toBe(2);
            expect(grid.getChildren(3)[0].get('rowKey')).toEqual(4);
            expect(grid.getChildren(3)[1].get('rowKey')).toEqual(5);
        });

        it('getDepth should return the depth of the row which has the given row key', function() {
            expect(grid.getDepth(6)).toBe(3);
        });
    });
});
