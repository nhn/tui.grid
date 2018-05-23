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

    describe('setSummaryColumnContent', function() {
        it('should call columnModel.setSummaryContent', function() {
            var grid = createGrid(null, {
                summary: {
                    columnContent: {}
                }
            });
            var columnModel = grid.modelManager.columnModel;
            spyOn(columnModel, 'setSummaryContent');

            grid.setSummaryColumnContent('c1', 'contents');

            expect(columnModel.setSummaryContent).toHaveBeenCalledWith('c1', 'contents');
        });
    });

    it('"findRows" should find rows by conditions.', function() {
        var grid = createGrid(['c1', 'c2', 'c3']);
        var rowList, foundRowList;

        grid.setData([{
            c1: 'a',
            c2: 'b',
            c3: 'c'
        }, {
            c1: 'b',
            c2: 'b',
            c3: 'c'
        }, {
            c1: 'a',
            c2: 'c',
            c3: 'b'
        }]);

        rowList = grid.getRows();
        foundRowList = grid.findRows({
            c2: 'b',
            c3: 'c'
        });

        expect(foundRowList.length).toBe(2);
        expect(foundRowList[0]).toEqual(rowList[0]);
        expect(foundRowList[1]).toEqual(rowList[1]);
    });

    describe('Using "keyColumnName" option', function() {
        var grid, spy;

        beforeEach(function() {
            spy = jasmine.createSpy();
            grid = createGrid(['c1', 'c2'], {
                keyColumnName: 'c2'
            });
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
            spyOn(snippet, 'imagePing');
        });

        it('when the value set to true by default, the hostname is send to server.', function() {
            createGrid(['c1']);

            expect(snippet.imagePing).toHaveBeenCalled();
        });

        it('when the value set to false, the hostname is not send to server.', function() {
            createGrid(['c1'], {
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });

    describe('tree grid', function() {
        var grid;

        beforeEach(function(done) {
            grid = createGrid('c1', {
                treeColumnOptions: {
                    name: 'c1'
                }
            });
            grid.setData([{
                c1: 'r1',
                _children: [{
                    c1: 'r2'
                }, {
                    c1: 'r3'
                }]
            }, {
                c1: 'r4',
                _children: [{
                    c1: 'r5'
                }, {
                    c1: 'r6',
                    _children: [{
                        c1: 'r7'
                    }],
                    _extraData: {
                        treeState: 'COLLAPSE'
                    }
                }]
            }], done);
        });

        describe('expand', function() {
            it('should return children row keys of given row', function() {
                var childrenRowKeys = grid.expand(3);

                expect(childrenRowKeys).toEqual([4, 5]);
            });

            it('should return descendent row keys of given row', function() {
                var childrenRowKeys = grid.expand(3, true);

                expect(childrenRowKeys).toEqual([4, 5, 6]);
            });

            it('should trigger expanded event', function() {
                var spy = jasmine.createSpy('expanded');
                grid.on('expanded', spy);

                grid.expand(0);

                expect(spy).toHaveBeenCalled();
            });
        });

        describe('expandAll', function() {
            it('should trigger expanded event', function() {
                var spy = jasmine.createSpy('expanded');
                grid.on('expanded', spy);

                grid.expandAll();

                expect(spy).toHaveBeenCalled();
            });
        });

        describe('collapse', function() {
            it('should return children row keys of given row', function() {
                var childrenRowKeys = grid.collapse(3);

                expect(childrenRowKeys).toEqual([4, 5]);
            });

            it('should return descendent row keys of given row', function() {
                var childrenRowKeys = grid.collapse(3, true);

                expect(childrenRowKeys).toEqual([4, 5, 6]);
            });

            it('should trigger collapsed event', function() {
                var spy = jasmine.createSpy('collapsed');
                grid.on('collapsed', spy);

                grid.collapse(0);

                expect(spy).toHaveBeenCalled();
            });
        });

        describe('collapseAll', function() {
            it('should trigger collapsed event', function() {
                var spy = jasmine.createSpy('collapsed');
                grid.on('collapsed', spy);

                grid.collapseAll();

                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
