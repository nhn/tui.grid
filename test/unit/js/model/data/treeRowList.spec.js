'use strict';

var $ = require('jquery');
var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var TreeRowList = require('model/data/treeRowList');

var columns = [{
    title: 'text',
    name: 'text'
}];
var originalTreeData = [{
    text: 'a',
    _children: [{
        text: 'a-a',
    }, {
        text: 'a-b',
    }, {
        text: 'a-c',
        _children: [{
            text: 'a-c-a'
        }]
    }]
}, {
    text: 'b'
}, {
    text: 'c'
}];

describe('data.treeModel', function() {
    var treeRowList, treeData;

    beforeEach(function() {
        var columnModel = new ColumnModelData();
        columnModel.set('columns', columns);
        treeData = $.extend(true, [], originalTreeData);
        treeRowList = new TreeRowList([], {
            columnModel: columnModel
        });
    });

    describe('_flattenRow', function() {
        it('should flatten nested tree data to plain grid data sorted by pre-order', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow);

            expect(flattenedRow.length).toBe(7);
            expect(flattenedRow[0].text).toBe('a');
            expect(flattenedRow[1].text).toBe('a-a');
            expect(flattenedRow[2].text).toBe('a-b');
            expect(flattenedRow[3].text).toBe('a-c');
            expect(flattenedRow[4].text).toBe('a-c-a');
            expect(flattenedRow[5].text).toBe('b');
            expect(flattenedRow[6].text).toBe('c');
        });

        it('should set parentRowKey', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow);

            expect(flattenedRow[0]._treeData.parentRowKey).toBeFalsy();
            expect(flattenedRow[1]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[2]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[3]._treeData.parentRowKey).toBe(flattenedRow[0].rowKey);
            expect(flattenedRow[4]._treeData.parentRowKey).toBe(flattenedRow[3].rowKey);
            expect(flattenedRow[5]._treeData.parentRowKey).toBeFalsy();
            expect(flattenedRow[6]._treeData.parentRowKey).toBeFalsy();
        });

        it('should set depth', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow);

            expect(flattenedRow[0]._treeData.depth).toBe(0);
            expect(flattenedRow[1]._treeData.depth).toBe(1);
            expect(flattenedRow[2]._treeData.depth).toBe(1);
            expect(flattenedRow[3]._treeData.depth).toBe(1);
            expect(flattenedRow[4]._treeData.depth).toBe(2);
            expect(flattenedRow[5]._treeData.depth).toBe(0);
            expect(flattenedRow[6]._treeData.depth).toBe(0);
        });

        it('should set childrenRowKeys', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow);

            expect(flattenedRow[0]._treeData.childrenRowKeys[0]).toBe(flattenedRow[1].rowKey);
            expect(flattenedRow[0]._treeData.childrenRowKeys[1]).toBe(flattenedRow[2].rowKey);
            expect(flattenedRow[0]._treeData.childrenRowKeys[2]).toBe(flattenedRow[3].rowKey);
            expect(flattenedRow[3]._treeData.childrenRowKeys[0]).toBe(flattenedRow[4].rowKey);
        });

        it('should set first/last sibling', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow);

            expect(flattenedRow[0]._treeData.firstSibling).toBe(true);
            expect(flattenedRow[0]._treeData.lastSibling).toBe(false);
            expect(flattenedRow[1]._treeData.firstSibling).toBe(true);
            expect(flattenedRow[1]._treeData.lastSibling).toBe(false);
            expect(flattenedRow[2]._treeData.firstSibling).toBe(false);
            expect(flattenedRow[2]._treeData.lastSibling).toBe(false);
            expect(flattenedRow[3]._treeData.firstSibling).toBe(false);
            expect(flattenedRow[3]._treeData.lastSibling).toBe(true);
            expect(flattenedRow[4]._treeData.firstSibling).toBe(true);
            expect(flattenedRow[4]._treeData.lastSibling).toBe(true);
            expect(flattenedRow[5]._treeData.firstSibling).toBe(false);
            expect(flattenedRow[5]._treeData.lastSibling).toBe(false);
            expect(flattenedRow[6]._treeData.firstSibling).toBe(false);
            expect(flattenedRow[6]._treeData.lastSibling).toBe(true);
        });
    });
});
