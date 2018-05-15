'use strict';

var TreeRow = require('model/data/treeRow');
var ColumnModel = require('model/data/columnModel');

describe('TreeRow', function() {
    var treeRow, result;

    beforeEach(function() {
        treeRow = new TreeRow({
            c1: '0-1',
            c2: '0-2',
            _extraData: {
            }
        }, {
            parse: true,
            collection: {
                columnModel: new ColumnModel({
                    columns: [
                        {name: 'c1'},
                        {name: 'c2'}
                    ]
                })
            }
        });
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
});
