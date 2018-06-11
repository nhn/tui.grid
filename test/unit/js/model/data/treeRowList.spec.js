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
        text: 'a-b', // 2
        _children: true
    }, {
        text: 'a-c', // 3
        _children: [{
            text: 'a-c-a' // 4
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
        rootRow = {_treeData: {hasNextSibling: []}};
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

        it('should set childrenRowKeys for _children true value', function() {
            var flattenedRow = [];
            treeRowList._flattenRow(treeData, flattenedRow, [rootRow]);

            expect(flattenedRow[2]._treeData.childrenRowKeys).toEqual([]);
        });
    });

    describe('getTopMostRowKeys', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return all top most rows', function() {
            expect(treeRowList.getTopMostRowKeys()).toEqual([0, 5, 6]);
        });
    });

    describe('getTreeChildrenRowKeys', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return array of row keys of given row key', function() {
            var childrenRowKeys = treeRowList.getTreeChildrenRowKeys(0);

            expect(childrenRowKeys.length).toBe(3);
            expect(childrenRowKeys).toEqual([1, 2, 3]);
        });
    });

    describe('getTreeDescendantRowKeys', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return array of row keys of all of given row key', function() {
            var descendantRowKeys = treeRowList.getTreeDescendantRowKeys(0);
            expect(descendantRowKeys.length).toBe(4);

            descendantRowKeys = treeRowList.getTreeDescendantRowKeys(1);
            expect(descendantRowKeys.length).toBe(0);

            descendantRowKeys = treeRowList.getTreeDescendantRowKeys(2);
            expect(descendantRowKeys.length).toBe(0);

            descendantRowKeys = treeRowList.getTreeDescendantRowKeys(3);
            expect(descendantRowKeys.length).toBe(1);

            descendantRowKeys = treeRowList.getTreeDescendantRowKeys(6);
            expect(descendantRowKeys.length).toBe(1);
        });
    });

    describe('treeExpand', function() {
        beforeEach(function() {
            treeData[2]._extraData = {
                treeState: 'COLLAPSE'
            };
            treeRowList.setData(treeData, true);
        });

        it('should set expand value of itself', function() {
            treeRowList.treeExpand(0);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(5).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(false);
        });

        it('should return descendants to show row keys of given row', function() {
            treeRowList.get(0).setTreeExpanded(true);
            treeRowList.get(3).setTreeExpanded(false);
            expect(treeRowList.treeExpand(3)).toEqual([4]);

            treeRowList.get(0).setTreeExpanded(false);
            treeRowList.get(3).setTreeExpanded(false);
            expect(treeRowList.treeExpand(0)).toEqual([1, 2, 3]);

            treeRowList.get(0).setTreeExpanded(false);
            treeRowList.get(3).setTreeExpanded(true);
            expect(treeRowList.treeExpand(0)).toEqual([1, 2, 3, 4]);
        });

        it('should set expand value of descendant parents and itself', function() {
            treeRowList.treeExpand(0, true);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(5).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(false);
        });

        it('should return descendant row keys of given row', function() {
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
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should set expand value for all rows which have a child or children', function() {
            treeRowList.treeExpandAll();

            expect(treeRowList.get(0).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(true);
        });

        it('should trigger expandedAll event', function() {
            var spy = jasmine.createSpy('expandedAll');
            treeRowList.on('expandedAll', spy);

            treeRowList.treeExpandAll();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('treeCollapse', function() {
        beforeEach(function() {
            treeData[0]._extraData = {
                treeState: 'EXPAND'
            };
            treeData[0]._children[2]._extraData = {
                treeState: 'EXPAND'
            };
            treeData[2]._extraData = {
                treeState: 'EXPAND'
            };
            treeRowList.setData(treeData, true);
        });

        it('should set collapse value of itself', function() {
            treeRowList.treeCollapse(0);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(true);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(true);
        });

        it('should return descendants to hide row keys of given row', function() {
            treeRowList.get(0).setTreeExpanded(true);
            treeRowList.get(3).setTreeExpanded(true);
            expect(treeRowList.treeCollapse(3)).toEqual([4]);

            treeRowList.get(0).setTreeExpanded(true);
            treeRowList.get(3).setTreeExpanded(false);
            expect(treeRowList.treeCollapse(0)).toEqual([1, 2, 3]);

            treeRowList.get(0).setTreeExpanded(true);
            treeRowList.get(3).setTreeExpanded(true);
            expect(treeRowList.treeCollapse(0)).toEqual([1, 2, 3, 4]);
        });

        it('should set collapse value of descendant parents and itself', function() {
            treeRowList.treeCollapse(0, true);

            expect(treeRowList.get(0).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(true);
        });

        it('should return descendant row keys of given row', function() {
            var childrenRowKeys = treeRowList.treeCollapse(0, true);

            expect(childrenRowKeys).toEqual([1, 2, 3, 4]);
        });

        it('should trigger collapsed event', function() {
            var spy = jasmine.createSpy('collapsed');
            treeRowList.on('collapsed', spy);

            treeRowList.treeCollapse(0);

            expect(spy).toHaveBeenCalled();
        });

        it('should not trigger collapsed event if silent option enabled', function() {
            var spy = jasmine.createSpy('collapsed');
            treeRowList.on('collapsed', spy);

            treeRowList.treeCollapse(0, false, true);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('treeCollapseAll', function() {
        beforeEach(function() {
            treeData[0]._extraData = {
                treeState: 'EXPAND'
            };
            treeData[0]._children[2]._extraData = {
                treeState: 'EXPAND'
            };
            treeData[2]._extraData = {
                treeState: 'EXPAND'
            };
            treeRowList.setData(treeData, true);
        });

        it('should set collapse value for all rows which have a child or children', function() {
            treeRowList.treeCollapseAll();

            expect(treeRowList.get(0).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(3).getTreeExpanded()).toBe(false);
            expect(treeRowList.get(6).getTreeExpanded()).toBe(false);
        });

        it('should trigger collapsedAll event', function() {
            var spy = jasmine.createSpy('collapsedAll');
            treeRowList.on('collapsedAll', spy);

            treeRowList.treeCollapseAll();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('_indexOfParentRowKeyAndOffset', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return it\'s index from given parent row key and offset', function() {
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, 0)).toBe(0);
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, -100)).toBe(0);
            expect(treeRowList._indexOfParentRowKeyAndOffset(null, 0)).toBe(0);
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, 1)).toBe(5);
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, 2)).toBe(6);
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, 3)).toBe(8);
            expect(treeRowList._indexOfParentRowKeyAndOffset(-1, 100)).toBe(8);

            expect(treeRowList._indexOfParentRowKeyAndOffset(0, 0)).toBe(1);
            expect(treeRowList._indexOfParentRowKeyAndOffset(0, 1)).toBe(2);
            expect(treeRowList._indexOfParentRowKeyAndOffset(0, 2)).toBe(3);
            expect(treeRowList._indexOfParentRowKeyAndOffset(0, 3)).toBe(5);

            expect(treeRowList._indexOfParentRowKeyAndOffset(1, 0)).toBe(2);
            expect(treeRowList._indexOfParentRowKeyAndOffset(2, 0)).toBe(3);

            expect(treeRowList._indexOfParentRowKeyAndOffset(3, 0)).toBe(4);
            expect(treeRowList._indexOfParentRowKeyAndOffset(3, 1)).toBe(5);

            expect(treeRowList._indexOfParentRowKeyAndOffset(5, 0)).toBe(6);

            expect(treeRowList._indexOfParentRowKeyAndOffset(6, 0)).toBe(7);

            expect(treeRowList._indexOfParentRowKeyAndOffset(7, 0)).toBe(8);
        });
    });

    describe('getTreeSiblingRowKeys', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return row keys of sibling and of itself', function() {
            expect(treeRowList.getTreeSiblingRowKeys(0)).toEqual([0, 5, 6]);
            expect(treeRowList.getTreeSiblingRowKeys(5)).toEqual([0, 5, 6]);
            expect(treeRowList.getTreeSiblingRowKeys(6)).toEqual([0, 5, 6]);

            expect(treeRowList.getTreeSiblingRowKeys(1)).toEqual([1, 2, 3]);
            expect(treeRowList.getTreeSiblingRowKeys(2)).toEqual([1, 2, 3]);
            expect(treeRowList.getTreeSiblingRowKeys(3)).toEqual([1, 2, 3]);
        });
    });

    describe('getTreePrevSiblingRowKey', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return previous sibling row key', function() {
            expect(treeRowList.getTreePrevSiblingRowKey(0)).toBe(null);
            expect(treeRowList.getTreePrevSiblingRowKey(5)).toBe(0);
            expect(treeRowList.getTreePrevSiblingRowKey(6)).toBe(5);
        });
    });

    describe('getTreeNextSiblingRowKey', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return next sibling row key', function() {
            expect(treeRowList.getTreeNextSiblingRowKey(0)).toBe(5);
            expect(treeRowList.getTreeNextSiblingRowKey(5)).toBe(6);
            expect(treeRowList.getTreeNextSiblingRowKey(6)).toBe(null);
        });
    });

    describe('_syncHasTreeSiblingData', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should sync hasSibling of previous sibling for depth 1', function() {
            treeRowList.get(0).hasTreeNextSibling()[0] = false;
            treeRowList.get(5).hasTreeNextSibling()[0] = false;

            treeRowList._syncHasTreeNextSiblingData(5);

            expect(treeRowList.get(0).hasTreeNextSibling()).toEqual([true]);
            expect(treeRowList.get(5).hasTreeNextSibling()).toEqual([true]);
        });

        it('should sync hasSibling of previous sibling for depth 2', function() {
            treeRowList.get(1).hasTreeNextSibling()[1] = false;
            treeRowList.get(2).hasTreeNextSibling()[1] = false;

            treeRowList._syncHasTreeNextSiblingData(2);

            expect(treeRowList.get(1).hasTreeNextSibling()).toEqual([true, true]);
            expect(treeRowList.get(2).hasTreeNextSibling()).toEqual([true, true]);
        });
    });

    describe('appendRow', function() {
        var appendData, appendOptions;

        beforeEach(function() {
            appendData = {
                text: 'n',
                _children: [{
                    text: 'n-a'
                }, {
                    text: 'n-b'
                }]
            };
            appendOptions = {
                parentRowKey: 0,
                offset: 3
            };

            treeRowList.setData(treeData, true);
        });

        it('should add to model list', function() {
            var result = treeRowList.appendRow(appendData, appendOptions);

            // length
            expect(treeRowList.length).toBe(11);
            // parent
            expect(result[0].getTreeParentRowKey()).toBe(0);
            expect(result[1].getTreeParentRowKey()).toBe(result[0].get('rowKey'));
            expect(result[2].getTreeParentRowKey()).toBe(result[0].get('rowKey'));
            // children
            expect(treeRowList.get(0).getTreeChildrenRowKeys()).toContain(result[0].get('rowKey'));
            expect(result[0].getTreeChildrenRowKeys()).toContain(result[1].get('rowKey'));
            expect(result[0].getTreeChildrenRowKeys()).toContain(result[2].get('rowKey'));
            expect(result[1].getTreeChildrenRowKeys().length).toBe(0);
            expect(result[2].getTreeChildrenRowKeys().length).toBe(0);
            // sibling
            expect(treeRowList.get(3).hasTreeNextSibling()).toEqual([true, true]);
            expect(result[0].hasTreeNextSibling()).toEqual([true, false]);
            expect(result[1].hasTreeNextSibling()).toEqual([true, false, true]);
            expect(result[2].hasTreeNextSibling()).toEqual([true, false, false]);
        });

        it('should add to model list as a top most row', function() {
            var result;

            appendOptions.parentRowKey = null;

            result = treeRowList.appendRow(appendData, appendOptions);

            // length
            expect(treeRowList.length).toBe(11);
            // parent
            expect(result[0].getTreeParentRowKey()).not.toBeDefined();
            expect(result[1].getTreeParentRowKey()).toBe(result[0].get('rowKey'));
            expect(result[2].getTreeParentRowKey()).toBe(result[0].get('rowKey'));
            // children
            expect(treeRowList.getTopMostRowKeys()).toContain(result[0].get('rowKey'));
            expect(result[0].getTreeChildrenRowKeys()).toContain(result[1].get('rowKey'));
            expect(result[0].getTreeChildrenRowKeys()).toContain(result[2].get('rowKey'));
            expect(result[1].getTreeChildrenRowKeys().length).toBe(0);
            expect(result[2].getTreeChildrenRowKeys().length).toBe(0);
            // sibling
            expect(treeRowList.get(6).hasTreeNextSibling()).toEqual([true]);
            expect(result[0].hasTreeNextSibling()).toEqual([false]);
            expect(result[1].hasTreeNextSibling()).toEqual([false, true]);
            expect(result[2].hasTreeNextSibling()).toEqual([false, false]);
        });

        it('should trigger add event', function() {
            var spy = jasmine.createSpy('add');
            treeRowList.on('add', spy);

            treeRowList.appendRow(appendData, appendOptions);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('prepend', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should insert the given data to the top', function() {
            treeRowList.prependRow({
                text: 'n',
                _children: [{
                    text: 'n-a'
                }, {
                    text: 'n-b'
                }]
            });

            expect(treeRowList.at(0).get('text')).toBe('n');
            expect(treeRowList.at(1).get('text')).toBe('n-a');
            expect(treeRowList.at(2).get('text')).toBe('n-b');
            expect(treeRowList.at(3).get('text')).toBe('a');
        });
    });

    describe('remove', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should remove a child', function() {
            treeRowList.removeRow(7);

            expect(treeRowList.length).toBe(7);
            expect(treeRowList.get(7)).not.toBeDefined();
            expect(treeRowList.get(6).getTreeChildrenRowKeys().length).toBe(0);
        });

        it('should remove a child and it\'s descendant', function() {
            treeRowList.removeRow(6);

            expect(treeRowList.length).toBe(6);
            expect(treeRowList.get(6)).not.toBeDefined();
            expect(treeRowList.get(7)).not.toBeDefined();
            expect(treeRowList.getTopMostRowKeys()).toEqual([0, 5]);
            expect(treeRowList.get(5).hasTreeNextSibling()).toEqual([false]);
        });

        it('should change parent\'s hasChildren state', function() {
            treeRowList.removeRow(4);

            expect(treeRowList.get(3).hasTreeChildren()).toBe(false);
        });
    });

    describe('getParent', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return the parent of the row which has the given row key', function() {
            expect(treeRowList.getTreeParent(0)).not.toBeDefined();
            expect(treeRowList.getTreeParent(1).get('rowKey')).toBe(0);
            expect(treeRowList.getTreeParent(2).get('rowKey')).toBe(0);
            expect(treeRowList.getTreeParent(3).get('rowKey')).toBe(0);
            expect(treeRowList.getTreeParent(4).get('rowKey')).toBe(3);
            expect(treeRowList.getTreeParent(5)).not.toBeDefined();
            expect(treeRowList.getTreeParent(6)).not.toBeDefined();
            expect(treeRowList.getTreeParent(7).get('rowKey')).toBe(6);
        });
    });

    describe('getTreeAncestors', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return the ancestors of the row which has the given row key', function() {
            expect(treeRowList.getTreeAncestors(0).length).toBe(0);
            expect(treeRowList.getTreeAncestors(1)[0].get('rowKey')).toBe(0);
            expect(treeRowList.getTreeAncestors(2)[0].get('rowKey')).toBe(0);
            expect(treeRowList.getTreeAncestors(3)[0].get('rowKey')).toBe(0);
            expect(treeRowList.getTreeAncestors(4)[0].get('rowKey')).toBe(0);
            expect(treeRowList.getTreeAncestors(4)[1].get('rowKey')).toBe(3);
            expect(treeRowList.getTreeAncestors(5).length).toBe(0);
            expect(treeRowList.getTreeAncestors(6).length).toBe(0);
            expect(treeRowList.getTreeAncestors(7)[0].get('rowKey')).toBe(6);
        });
    });

    describe('getTreeChildren', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return the children of the row which has the given row key', function() {
            expect(treeRowList.getTreeChildren(0).length).toBe(3);
            expect(treeRowList.getTreeChildren(0)[0].get('rowKey')).toBe(1);
            expect(treeRowList.getTreeChildren(0)[1].get('rowKey')).toBe(2);
            expect(treeRowList.getTreeChildren(0)[2].get('rowKey')).toBe(3);
            expect(treeRowList.getTreeChildren(1).length).toBe(0);
            expect(treeRowList.getTreeChildren(2).length).toBe(0);
            expect(treeRowList.getTreeChildren(3).length).toBe(1);
            expect(treeRowList.getTreeChildren(3)[0].get('rowKey')).toBe(4);
            expect(treeRowList.getTreeChildren(4).length).toBe(0);
            expect(treeRowList.getTreeChildren(5).length).toBe(0);
            expect(treeRowList.getTreeChildren(6).length).toBe(1);
            expect(treeRowList.getTreeChildren(6)[0].get('rowKey')).toBe(7);
            expect(treeRowList.getTreeChildren(7).length).toBe(0);
        });
    });

    describe('getTreeDescendants', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return the descendants of the row which has the given row key', function() {
            expect(treeRowList.getTreeDescendants(0).length).toBe(4);
            expect(treeRowList.getTreeDescendants(1).length).toBe(0);
            expect(treeRowList.getTreeDescendants(2).length).toBe(0);
            expect(treeRowList.getTreeDescendants(3).length).toBe(1);
            expect(treeRowList.getTreeDescendants(4).length).toBe(0);
            expect(treeRowList.getTreeDescendants(5).length).toBe(0);
            expect(treeRowList.getTreeDescendants(6).length).toBe(1);
            expect(treeRowList.getTreeDescendants(7).length).toBe(0);
        });
    });

    describe('getTreeDepth', function() {
        beforeEach(function() {
            treeRowList.setData(treeData, true);
        });

        it('should return the depth of the row which has the given row key', function() {
            expect(treeRowList.getTreeDepth(0)).toBe(1);
            expect(treeRowList.getTreeDepth(1)).toBe(2);
            expect(treeRowList.getTreeDepth(2)).toBe(2);
            expect(treeRowList.getTreeDepth(3)).toBe(2);
            expect(treeRowList.getTreeDepth(4)).toBe(3);
            expect(treeRowList.getTreeDepth(5)).toBe(1);
            expect(treeRowList.getTreeDepth(6)).toBe(1);
            expect(treeRowList.getTreeDepth(7)).toBe(2);
        });
    });

    describe('isTreeVisible', function() {
        beforeEach(function() {
            treeData = [{
                text: 'a', // 0
                _extraData: {
                    treeState: 'EXPAND'
                },
                _children: [{
                    text: 'a-a' // 1
                }, {
                    text: 'a-b' // 2
                }, {
                    text: 'a-c', // 3
                    _extraData: {
                        treeState: 'EXPAND'
                    },
                    _children: [{
                        text: 'a-c-a' // 4
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
            treeRowList.setData(treeData, true);
        });

        it('should return true if no ancestor is collapsed', function() {
            expect(treeRowList.isTreeVisible(0)).toBe(true);
            expect(treeRowList.isTreeVisible(3)).toBe(true);
            expect(treeRowList.isTreeVisible(4)).toBe(true);
        });

        it('should return false if one of ancestor is collapsed', function() {
            treeRowList.get(0).setTreeExpanded(false);
            expect(treeRowList.isTreeVisible(0)).toBe(true);
            expect(treeRowList.isTreeVisible(3)).toBe(false);
            expect(treeRowList.isTreeVisible(4)).toBe(false);

            treeRowList.get(0).setTreeExpanded(true);
            treeRowList.get(3).setTreeExpanded(false);
            expect(treeRowList.isTreeVisible(0)).toBe(true);
            expect(treeRowList.isTreeVisible(3)).toBe(true);
            expect(treeRowList.isTreeVisible(4)).toBe(false);
        });
    });

    describe('check/uncheck', function() {
        beforeEach(function() {
            treeData = [{
                text: 'a', // 0
                _extraData: {
                    treeState: 'EXPAND'
                },
                _children: [{
                    text: 'a-a' // 1
                }, {
                    text: 'a-b' // 2
                }, {
                    text: 'a-c', // 3
                    _extraData: {
                        treeState: 'EXPAND'
                    },
                    _children: [{
                        text: 'a-c-a' // 4
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
            treeRowList.setData(treeData, true);
        });
    });

    describe('check/uncheck - ', function() {
        beforeEach(function() {
            treeData = [{
                text: 'a', // 0
                _children: [{
                    text: 'a-a' // 1
                }, {
                    text: 'a-b' // 2
                }, {
                    text: 'a-c', // 3
                    _children: [{
                        text: 'a-c-a' // 4
                    }]
                }]
            }, {
                text: 'b' // 5
            }, {
                text: 'c', // 6
                _children: [{
                    text: 'c-a' // 7
                }, {
                    text: 'c-b' // 8
                }]
            }];

            treeRowList.setData(treeData, true);
        });

        it('if the current checked row is a parent row, all descendant rows are checked.', function() {
            treeRowList.check(0);

            expect(treeRowList.get(1).get('_button')).toBe(true);
            expect(treeRowList.get(2).get('_button')).toBe(true);
            expect(treeRowList.get(3).get('_button')).toBe(true);
            expect(treeRowList.get(4).get('_button')).toBe(true);
        });

        it('if the current unchecked row is a parent row, all descendant rows are unchecked.', function() {
            treeRowList.check(0);
            treeRowList.uncheck(0);

            expect(treeRowList.get(1).get('_button')).toBe(false);
            expect(treeRowList.get(2).get('_button')).toBe(false);
            expect(treeRowList.get(3).get('_button')).toBe(false);
            expect(treeRowList.get(4).get('_button')).toBe(false);
        });

        it('if all children rows are checked, the parent row is checked.', function() {
            treeRowList.check(7);
            expect(treeRowList.get(6).get('_button')).toBe(false);

            treeRowList.check(8);
            expect(treeRowList.get(6).get('_button')).toBe(true);
        });

        it('if one child row is unchecked, the parent row is also unchecked.', function() {
            treeRowList.check(6);
            expect(treeRowList.get(6).get('_button')).toBe(true);

            treeRowList.uncheck(7);
            expect(treeRowList.get(6).get('_button')).toBe(false);
        });
    });

    describe('check/uncheck when the cascading option is not used - ', function() {
        beforeEach(function() {
            treeData = [{
                text: 'a', // 0
                _children: [{
                    text: 'a-a' // 1
                }, {
                    text: 'a-b' // 2
                }]
            }];

            treeRowList.columnModel.set('treeColumnOptions', {
                useCascadingCheckbox: false
            });
            treeRowList.setData(treeData, true);
        });

        it('the children rows are not checked even if the parent is checked.', function() {
            treeRowList.check(0);

            expect(treeRowList.get(1).get('_button')).toBe(false);
            expect(treeRowList.get(2).get('_button')).toBe(false);
        });

        it('the children rows are not unchecked even if the parent is unchecked.', function() {
            treeRowList.check(0);
            treeRowList.check(1);
            treeRowList.check(2);
            treeRowList.uncheck(0);

            expect(treeRowList.get(1).get('_button')).toBe(true);
            expect(treeRowList.get(2).get('_button')).toBe(true);
        });

        it('if all children rows are checked, the parent row is not checked.', function() {
            treeRowList.check(1);
            treeRowList.check(2);
            expect(treeRowList.get(0).get('_button')).toBe(false);
        });
    });
});
