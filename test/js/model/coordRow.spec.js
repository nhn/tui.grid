'use strict';

var CoordRow = require('model/coordRow');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var Model = require('base/model');
var DomState = require('domState');

var CELL_BORDER_WIDTH = require('common/constMap').dimension.CELL_BORDER_WIDTH;
var ROW_DEF_HEIGHT = 10;

function create(data) {
    var columnModel = new ColumnModel();
    var dataModel = new DataModel([], {
        columnModel: columnModel
    });
    var dimensionMock = new Model();
    var coordRowModel;

    dimensionMock.set({
        rowHeight: ROW_DEF_HEIGHT
    });
    coordRowModel = new CoordRow({
        domState: new DomState($('<div>')),
        dataModel: dataModel,
        dimensionModel: dimensionMock
    });
    dataModel.setRowList(data);

    return coordRowModel;
}

describe('CoordRow', function() {
    describe('initialize', function() {
        it('without height data', function() {
            var coordRow = create([{}, {}]);

            expect(coordRow.getHeight(0)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getHeight(1)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getOffset(0)).toBe(0);
            expect(coordRow.getOffset(1)).toBe(ROW_DEF_HEIGHT + CELL_BORDER_WIDTH);
        });

        it('with height data', function() {
            var coordRow = create([
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

            expect(coordRow.getHeight(0)).toBe(15);
            expect(coordRow.getHeight(1)).toBe(20);
            expect(coordRow.getOffset(0)).toBe(0);
            expect(coordRow.getOffset(1)).toBe(15 + CELL_BORDER_WIDTH);
        });

        it('should set totalRowHeight of DimensionModel', function() {
            var coordRow = create([{}, {}]);
            var totalHeight = (ROW_DEF_HEIGHT + CELL_BORDER_WIDTH) * 2;

            expect(coordRow.dimensionModel.get('totalRowHeight')).toBe(totalHeight);
        });
    });

    describe('height and offset data should be reset', function() {
        it('when a row is added to dataModel', function() {
            var coordRow = create([{}]);

            coordRow.dataModel.append({});

            expect(coordRow.getHeight(1)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getOffset(1)).toBe(ROW_DEF_HEIGHT + CELL_BORDER_WIDTH);
            expect(coordRow.dimensionModel.get('totalRowHeight')).toBe((ROW_DEF_HEIGHT + CELL_BORDER_WIDTH) * 2);
        });

        it('when a row is removed', function() {
            var coordRow = create([{}, {}]);

            coordRow.dataModel.removeRow(1);

            expect(coordRow.getHeight(1)).toBeUndefined();
            expect(coordRow.getOffset(1)).toBeUndefined();
        });

        it('when data is reset', function() {
            var coordRow = create([]);

            coordRow.dataModel.setRowList([{}]);

            expect(coordRow.getHeight(0)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getOffset(0)).toBe(0);
        });
    });

    describe('syncWithDom', function() {
        it('should reset rowHeights with max height of DOM and data', function() {
            var coordRow = create([{
                _extraData: {
                    height: 50
                }
            }, {}, {}]);
            var domState = coordRow.domState;

            spyOn(domState, 'getRowHeights').and.returnValue([20, 30, 40]);
            coordRow.syncWithDom();

            expect(coordRow.getHeightAt(0)).toBe(50);
            expect(coordRow.getHeightAt(1)).toBe(30);
            expect(coordRow.getHeightAt(2)).toBe(40);
        });

        it('should not reset rowHeights if dimensionModel.isFixedRowHeight is true', function() {
            var coordRow = create([{}, {}]);
            var domState = coordRow.domState;

            coordRow.dimensionModel.set('isFixedRowHeight', true);
            spyOn(domState, 'getRowHeights').and.returnValue([20, 30]);
            coordRow.syncWithDom();

            expect(coordRow.getHeightAt(0)).toBe(ROW_DEF_HEIGHT);
            expect(coordRow.getHeightAt(1)).toBe(ROW_DEF_HEIGHT);
        });

        it('should trigger syncWithDom event', function() {
            var coordRow = create([{}]);
            var callbackSpy = jasmine.createSpy('callback');

            coordRow.on('syncWithDom', callbackSpy);
            coordRow.syncWithDom();

            expect(callbackSpy).toHaveBeenCalled();
        });
    });
});
