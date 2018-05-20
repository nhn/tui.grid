'use strict';

var $ = require('jquery');

var ColumnModelData = require('model/data/columnModel');
var TreeRowList = require('model/data/treeRowList');

var columns = [{
    title: 'text',
    name: 'text'
}];
var originalTreeData = [{
    text: 'a', // 0
    _children: [{
        text: 'a-a' // 1
    }, {
        text: 'a-b' // 2
    }, {
        text: 'a-c', // 3
        _children: [{
            text: 'a-c-a' //4
        }]
    }]
}, {
    text: 'b' // 5
}, {
    text: 'c', // 6
    _children: [{
        text: 'c-a' // 7
    }]
}];

describe('data.treeModel', function() {
    var treeRowList, treeData, rootRow;

    beforeEach(function() {
        var columnModel = new ColumnModelData();
        columnModel.set('columns', columns);
        treeData = $.extend(true, [], originalTreeData);
        treeRowList = new TreeRowList([], {
            columnModel: columnModel
        });
        rootRow = {_treeData: {}};
    });

    describe('_flattenRow', function() {
        it('should flatten nested tree data to plain grid data sorted by pre-order', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow, [rootRow]);

            expect(flattenedRow.length).toBe(8);
            expect(flattenedRow[0].text).toBe('a');
            expect(flattenedRow[1].text).toBe('a-a');
            expect(flattenedRow[2].text).toBe('a-b');
            expect(flattenedRow[3].text).toBe('a-c');
            expect(flattenedRow[4].text).toBe('a-c-a');
            expect(flattenedRow[5].text).toBe('b');
            expect(flattenedRow[6].text).toBe('c');
            expect(flattenedRow[7].text).toBe('c-a');
        });

        it('should set parentRowKey', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow, [rootRow]);

            expect(flattenedRow[0]._treeData.parentRowKey).toBeFalsy();
            expect(flattenedRow[1]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[2]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[3]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[4]._treeData.parentRowKey).toBe(flattenedRow[3].rowKey);
            expect(flattenedRow[5]._treeData.parentRowKey).toBeFalsy();
            expect(flattenedRow[6]._treeData.parentRowKey).toBeFalsy();
            expect(flattenedRow[7]._treeData.parentRowKey).toBe(flattenedRow[6].rowKey);
        });

        it('should set childrenRowKeys', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow, [rootRow]);

            expect(flattenedRow[0]._treeData.childrenRowKeys[0]).toBe(flattenedRow[1].rowKey);
            expect(flattenedRow[0]._treeData.childrenRowKeys[1]).toBe(flattenedRow[2].rowKey);
            expect(flattenedRow[0]._treeData.childrenRowKeys[2]).toBe(flattenedRow[3].rowKey);
            expect(flattenedRow[3]._treeData.childrenRowKeys[0]).toBe(flattenedRow[4].rowKey);
            expect(flattenedRow[6]._treeData.childrenRowKeys[0]).toBe(flattenedRow[7].rowKey);
        });

        it('should set hasNextSibling', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow, [rootRow]);

            expect(flattenedRow[0]._treeData.hasNextSibling).toEqual([true]);
            expect(flattenedRow[1]._treeData.hasNextSibling).toEqual([true, true]);
            expect(flattenedRow[2]._treeData.hasNextSibling).toEqual([true, true]);
            expect(flattenedRow[3]._treeData.hasNextSibling).toEqual([true, false]);
            expect(flattenedRow[4]._treeData.hasNextSibling).toEqual([true, false, false]);
            expect(flattenedRow[5]._treeData.hasNextSibling).toEqual([true]);
            expect(flattenedRow[6]._treeData.hasNextSibling).toEqual([false]);
            expect(flattenedRow[7]._treeData.hasNextSibling).toEqual([false, false]);
        });
    });

    describe('getTopMostRowKeys', function() {
        beforeEach(function(done) {
            treeRowList.setData(treeData, true, done);
        });

        it('should return all top most rows', function() {
            expect(treeRowList.getTopMostRowKeys()).toEqual([0, 5, 6]);
        });
    });

    describe('getTreeChildrenRowKeys', function() {
        beforeEach(function(done) {
            treeRowList.setData(treeData, true, done);
        });

        it('should return array of row keys of given row key', function() {
            var childrenRowKeys = treeRowList.getTreeChildrenRowKeys(0);

            expect(childrenRowKeys.length).toBe(3);
            expect(childrenRowKeys).toEqual([1, 2, 3]);
        });
    });

    describe('getTreeDescendentRowKeys', function() {
        beforeEach(function(done) {
            treeRowList.setData(treeData, true, done);
        });

        it('should return array of row keys of all of given row key', function() {
            var descendentRowKeys = treeRowList.getTreeDescendentRowKeys(0);
            expect(descendentRowKeys.length).toBe(4);

            descendentRowKeys = treeRowList.getTreeDescendentRowKeys(1);
            expect(descendentRowKeys.length).toBe(0);

            descendentRowKeys = treeRowList.getTreeDescendentRowKeys(2);
            expect(descendentRowKeys.length).toBe(0);

            descendentRowKeys = treeRowList.getTreeDescendentRowKeys(3);
            expect(descendentRowKeys.length).toBe(1);

            descendentRowKeys = treeRowList.getTreeDescendentRowKeys(6);
            expect(descendentRowKeys.length).toBe(1);
        });
    });

    describe('treeExpand', function() {
        beforeEach(function(done) {
            treeRowList.setData(treeData, true, done);
        });

        it('should set expand value of itself', function() {
            treeRowList.treeExpand(0);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(5).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(false);
        });

        it('should return children row keys of given row', function() {
            var childrenRowKeys = treeRowList.treeExpand(0);

            expect(childrenRowKeys).toEqual([1, 2, 3]);
        });

        it('should set expand value of descendant parents and itself', function() {
            treeRowList.treeExpand(0, true);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(5).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(false);
        });

        it('should return descendent row keys of given row', function() {
            var childrenRowKeys = treeRowList.treeExpand(0, true);

            expect(childrenRowKeys).toEqual([1, 2, 3, 4]);
        });

        it('should trigger expanded event', function() {
            var spy = jasmine.createSpy('expanded');
            treeRowList.on('expanded', spy);

            treeRowList.treeExpand(0);

            expect(spy).toHaveBeenCalled();
        });

        it('should not trigger expanded event if silent option enabled', function() {
            var spy = jasmine.createSpy('expanded');
            treeRowList.on('expanded', spy);

            treeRowList.treeExpand(0, false, true);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('treeExpandAll', function() {
        beforeEach(function(done) {
            treeRowList.setData(treeData, true, done);
        });

        it('should set expand value for all rows which have a child or children', function() {
            treeRowList.treeExpandAll();

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(true);
        });

        it('should not trigger expanded event', function() {
            var spy = jasmine.createSpy('expanded');
            treeRowList.on('expanded', spy);

            treeRowList.treeExpandAll();

            expect(spy).toHaveBeenCalled();
        });
    });
});
