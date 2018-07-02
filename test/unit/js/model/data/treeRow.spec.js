'use strict';

var TreeRow = require('model/data/treeRow');
var ColumnModel = require('model/data/columnModel');

describe('TreeRow', function() {
    var treeRow, result, rowData, parentData;

    beforeEach(function() {
        rowData = {
            c1: '0-1',
            c2: '0-2',
            _extraData: {
            },
            _treeData: {
                childrenRowKeys: [1, 2, 3],
                hasNextSibling: [true, false, true]
            }
        };
        parentData = {
            parse: true,
            collection: {
                columnModel: new ColumnModel({
                    columns: [
                        {name: 'c1'},
                        {name: 'c2'}
                    ]
                })
            }
        };

        treeRow = new TreeRow(rowData, parentData);
    });

    describe('getTreeExpanded', function() {
        it('should return false by default', function() {
            result = treeRow.getTreeExpanded();
            expect(result).toBe(false);
        });

        it('should return false if extraData.treeState is not EXPAND', function() {
            treeRow.extraDataManager.setTreeState('COLLAPSE');
            result = treeRow.getTreeExpanded();
            expect(result).toBe(false);
        });

        it('should return true if extraData.treeState is EXPAND', function() {
            treeRow.extraDataManager.setTreeState('EXPAND');
            result = treeRow.getTreeExpanded();
            expect(result).toBe(true);
        });
    });

    describe('setTreeExpanded', function() {
        it('should set extraData.treeState "COLLAPSE" if given param is false', function() {
            treeRow.setTreeExpanded(false);
            result = treeRow.extraDataManager.getTreeState();
            expect(result).toBe(TreeRow.treeState.COLLAPSE);
        });

        it('should set extraData.treeState "EXPAND" if given param is true', function() {
            treeRow.setTreeExpanded(true);
            result = treeRow.extraDataManager.getTreeState();
            expect(result).toBe(TreeRow.treeState.EXPAND);
        });

        it('should trigger extraDataChanged event', function() {
            var spy = jasmine.createSpy();
            treeRow.listenTo(treeRow, 'extraDataChanged', spy);

            treeRow.setTreeExpanded(true);

            expect(spy).toHaveBeenCalled();
        });
    });

    it('getTreeDepth should return it\'s depth', function() {
        rowData._treeData.hasNextSibling = [false];
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.getTreeDepth()).toBe(1);

        rowData._treeData.hasNextSibling = [false, false, false];
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.getTreeDepth()).toBe(3);
    });

    describe('hasTreeChildren', function() {
        it('should return whether it has children or not', function() {
            delete rowData._treeData.childrenRowKeys;
            treeRow = new TreeRow(rowData, parentData);
            expect(treeRow.hasTreeChildren()).toBe(false);

            rowData._treeData.childrenRowKeys = [1, 2];
            treeRow = new TreeRow(rowData, parentData);
            expect(treeRow.hasTreeChildren()).toBe(true);
        });

        it('should return even if it has an empty array', function() {
            rowData._treeData.childrenRowKeys = [];
            treeRow = new TreeRow(rowData, parentData);
            expect(treeRow.hasTreeChildren()).toBe(false);
        });
    });

    it('getTreeChildrenRowKeys should return it\'s children', function() {
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.getTreeChildrenRowKeys()).toEqual([1, 2, 3]);
    });

    it('setTreeChildrenRowKeys should set children tree data', function() {
        treeRow = new TreeRow(rowData, parentData);

        treeRow.setTreeChildrenRowKeys([1]);

        expect(treeRow._getTreeData().childrenRowKeys).toEqual([1]);
    });

    it('hasTreeNextSibling should return whether it has one or more siblings and it\'s ancestors', function() {
        rowData._treeData.hasNextSibling = [false];
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.hasTreeNextSibling()).toEqual([false]);

        rowData._treeData.hasNextSibling = [true, false];
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.hasTreeNextSibling()).toEqual([true, false]);
    });

    it('getTreeParentRowKey should return it\'s parent row key', function() {
        expect(treeRow.getTreeParentRowKey()).toBeFalsy();

        rowData._treeData.parentRowKey = 0;
        treeRow = new TreeRow(rowData, parentData);
        expect(treeRow.getTreeParentRowKey()).toBe(0);
    });
});
