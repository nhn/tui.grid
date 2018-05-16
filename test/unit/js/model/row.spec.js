'use strict';

var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var FocusModel = require('model/focus');
var TreeRowList = require('model/data/treeRowList');
var RowModel = require('model/row');

var columns = [{
    title: 'text',
    name: 'text'
}];
var originalTreeData = [{
    text: 'a',
    _children: [{
        text: 'a-a'
    }, {
        text: 'a-b'
    }, {
        text: 'a-c',
        _children: [{
            text: 'a-c-a'
        }],
        _extraData: {
            treeState: 'COLLAPSE'
        }
    }]
}, {
    text: 'b'
}, {
    text: 'c'
}];

describe('model.row', function() {
    describe('_getFormattedValue:', function() {
        var func = RowModel.prototype._getFormattedValue;

        it('if type is string, return as is', function() {
            expect(func('0', {}, {})).toBe('0');
            expect(func('hello', {}, {})).toBe('hello');
        });

        it('if type is number, return string-converted value', function() {
            expect(func(0, {}, {})).toBe('0');
            expect(func(1000, {}, {})).toBe('1000');
        });

        it('if type is false value, return empty string', function() {
            expect(func(null, {}, {})).toBe('');
            expect(func(false, {}, {})).toBe('');
            expect(func(undefined, {}, {})).toBe(''); // eslint-disable-line no-undefined
        });

        it('if column has formatter, execute the function and return the result', function() {
            var attrs = {};
            var column = {
                formatter: jasmine.createSpy('formatter').and.returnValue('hello')
            };
            var result = func(1, attrs, column);

            expect(result).toBe('hello');
            expect(column.formatter).toHaveBeenCalledWith(1, attrs, column);
        });
    });

    describe('tree functions', function() {
        var rowModel, treeRow, rowModelOptions;

        beforeEach(function(done) {
            var focusModel, treeRowList;
            var columnModel = new ColumnModelData();
            var treeData = $.extend(true, [], originalTreeData);

            columnModel.set('columns', columns);
            treeRowList = new TreeRowList([], {
                columnModel: columnModel
            });
            treeRowList.setData(treeData, true, function() {
                treeRow = treeRowList.get(0);
                rowModelOptions = {
                    dataModel: treeRowList,
                    columnModel: columnModel,
                    focusModel: focusModel
                };
                focusModel = new FocusModel(null, _.extend({
                    columnModel: columnModel,
                    dataModel: treeRowList
                }, {}));
                rowModel = new RowModel(
                    {rowKey: 0},
                    rowModelOptions
                );

                done();
            });
        });

        describe('setTreeExpanded', function() {
            it('should set tree expanded state', function() {
                rowModel.setTreeExpanded(true);
                expect(treeRow.getTreeExpanded()).toBe(true);

                rowModel.setTreeExpanded(false);
                expect(treeRow.getTreeExpanded()).toBe(false);
            });
        });

        describe('getTreeExpanded', function() {
            it('should get tree expended state', function() {
                treeRow.setTreeExpanded(true);
                expect(rowModel.getTreeExpanded()).toBe(true);

                treeRow.setTreeExpanded(false);
                expect(rowModel.getTreeExpanded()).toBe(false);
            });
        });

        describe('getTreeDepth', function() {
            it('should return tree depth', function() {
                expect(rowModel.getTreeDepth()).toBe(1);

                rowModel = new RowModel(
                    {rowKey: 1},
                    rowModelOptions
                );
                expect(rowModel.getTreeDepth()).toBe(2);

                rowModel = new RowModel(
                    {rowKey: 4},
                    rowModelOptions
                );
                expect(rowModel.getTreeDepth()).toBe(3);
            });
        });

        describe('getTreeChildren', function() {
            it('should return whether it has tree children', function() {
                expect(rowModel.hasTreeChildren()).toBe(true);

                rowModel = new RowModel(
                    {rowKey: 1},
                    rowModelOptions
                );
                expect(rowModel.hasTreeChildren()).toBe(false);
            });
        });

        describe('hasTreeSibling', function() {
            it('should return an array whether the ancestor has sibling', function() {
                expect(rowModel.hasTreeNextSibling()).toEqual([true]);

                rowModel = new RowModel(
                    {rowKey: 1},
                    rowModelOptions
                );
                expect(rowModel.hasTreeNextSibling()).toEqual([true, true]);

                rowModel = new RowModel(
                    {rowKey: 4},
                    rowModelOptions
                );
                expect(rowModel.hasTreeNextSibling()).toEqual([true, false, false]);
            });
        });

        describe('getTreeParentRowKey', function() {
            it('should return it\'s parent row key', function() {
                expect(rowModel.getTreeParentRowKey()).toBeFalsy();

                rowModel = new RowModel(
                    {rowKey: 4},
                    rowModelOptions
                );
                expect(rowModel.getTreeParentRowKey()).toBe(3);
            });
        });

        describe('isTreeShow', function() {
            it('should return true if no ancestor is collapsed', function() {
                expect(rowModel.isTreeShow()).toBe(true);

                rowModel = new RowModel(
                    {rowKey: 4},
                    rowModelOptions
                );
                expect(rowModel.isTreeShow()).toBe(false);
            });
        });

        describe('getTreeDescendentRowKeys', function() {
            it('should return all of it\'s descendant', function() {
                expect(rowModel.getTreeDescendentRowKeys()).toEqual([1, 2, 3, 4]);
            });
        });
    });
});
