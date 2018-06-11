'use strict';

var $ = require('jquery');

var CoordRow = require('model/coordRow');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var Model = require('base/model');
var DomState = require('domState');

var CELL_BORDER_WIDTH = require('common/constMap').dimension.CELL_BORDER_WIDTH;
var ROW_DEF_HEIGHT = 10;

function create(fixedRowHeight) {
    var columnModel = new ColumnModel();
    var dataModel = new DataModel([], {
        columnModel: columnModel
    });
    var dimensionMock = new Model();
    var coordRowModel;

    dimensionMock.set({
        fixedRowHeight: fixedRowHeight,
        rowHeight: ROW_DEF_HEIGHT
    });
    coordRowModel = new CoordRow(null, {
        domState: new DomState($('<div>')),
        dataModel: dataModel,
        dimensionModel: dimensionMock
    });

    return coordRowModel;
}

describe('CoordRow', function() {
    describe('If the fixedRowHeight:true, syncWithDataModel() should be called', function() {
        var coordRow, syncSpy;

        beforeEach(function() {
            syncSpy = spyOn(CoordRow.prototype, 'syncWithDataModel');
            coordRow = create(true);
        });

        it('when data is reset', function() {
            coordRow.dataModel.setData([{}, {}]);

            expect(syncSpy).toHaveBeenCalled();
        });

        it('when a row is added to dataModel', function() {
            coordRow.dataModel.appendRow({});

            expect(syncSpy).toHaveBeenCalled();
        });

        it('when a row is removed', function() {
            coordRow.dataModel.setData([{}, {}]);
            syncSpy.calls.reset();

            coordRow.dataModel.removeRow(1);

            expect(syncSpy).toHaveBeenCalled();
        });
    });

    describe('syncWithDataModel() should data', function() {
        it('with dimension.rowHeight if extraData.height is undefined', function() {
            var coordRow = create();

            coordRow.dataModel.setData([{}, {}]);
            coordRow.syncWithDataModel();

            expect(coordRow.getHeight(0)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getOffset(0)).toBe(0);
            expect(coordRow.getHeight(1)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getOffset(1)).toBe(ROW_DEF_HEIGHT + CELL_BORDER_WIDTH);
            expect(coordRow.dimensionModel.get('totalRowHeight')).toBe((ROW_DEF_HEIGHT + CELL_BORDER_WIDTH) * 2);
        });

        it('with extraData.height if exist', function() {
            var coordRow = create();

            coordRow.dataModel.setData([
                {
                    _extraData: {
                        height: 15
                    }
                },
                {
                    _extraData: {
                        height: 20
                    }
                }
            ]);
            coordRow.syncWithDataModel();

            expect(coordRow.getHeight(0)).toBe(15);
            expect(coordRow.getHeight(1)).toBe(20);
            expect(coordRow.getOffset(0)).toBe(0);
            expect(coordRow.getOffset(1)).toBe(15 + CELL_BORDER_WIDTH);
            expect(coordRow.dimensionModel.get('totalRowHeight')).toBe(15 + 20 + (2 * CELL_BORDER_WIDTH));
        });
    });

    describe('syncWithDom', function() {
        it('should reset rowHeights with max height of DOM and data', function() {
            var coordRow = create();
            var domState = coordRow.domState;

            coordRow.dataModel.setData([{
                _extraData: {
                    height: 50
                }
            }, {}, {}]);

            spyOn(domState, 'getRowHeights').and.returnValue([20, 30, 40]);
            coordRow.syncWithDom();

            expect(coordRow.getHeightAt(0)).toBe(50);
            expect(coordRow.getHeightAt(1)).toBe(30);
            expect(coordRow.getHeightAt(2)).toBe(40);
        });

        it('should not reset rowHeights if dimensionModel.fixedRowHeight is true', function() {
            var coordRow = create();
            var domState = coordRow.domState;

            coordRow.dataModel.setData([{}, {}]);
            coordRow.dimensionModel.set('fixedRowHeight', true);
            spyOn(domState, 'getRowHeights').and.returnValue([20, 30]);
            coordRow.syncWithDom();

            expect(coordRow.getHeightAt(0)).toBeUndefined();
            expect(coordRow.getHeightAt(1)).toBeUndefined();
        });
    });

    describe('offset value to move by row height', function() {
        var coordRow, result;

        beforeEach(function() {
            coordRow = create();

            coordRow.dataModel.setData([
                {
                    _extraData: {
                        height: 10 // rowKey: 0
                    }
                },
                {
                    _extraData: {
                        height: 0 // rowKey: 1
                    }
                },
                {
                    _extraData: {
                        height: 0 // rowKey: 2
                    }
                },
                {
                    _extraData: {
                        height: 10 // rowKey: 3
                    }
                },
                {
                    _extraData: {
                        height: 10 // rowKey: 4
                    }
                },
                {
                    _extraData: {
                        height: 0 // rowKey: 5
                    }
                }
            ]);
            coordRow.syncWithDataModel();
        });

        describe('getPreviousOffset()', function() {
            it('if the next row has a height based on the current row, ' +
                'the previous offset value is decremented by one.', function() {
                result = coordRow.getPreviousOffset(4);
                expect(result).toBe(-1);
            });

            it('gets the offset value of the nearest row from the current row, ' +
                'where the row height is not 0.', function() {
                result = coordRow.getPreviousOffset(3);
                expect(result).toBe(-3);
            });
        });

        describe('getNextOffset()', function() {
            it('if the next row has a height based on the current row, ' +
                'the next offset value is incremented by one.', function() {
                result = coordRow.getNextOffset(3);
                expect(result).toBe(1);
            });

            it('gets the offset value of the nearest row from the current row, ' +
                'where the row height is not 0.', function() {
                result = coordRow.getNextOffset(0);
                expect(result).toBe(3);
            });
        });
    });
});
