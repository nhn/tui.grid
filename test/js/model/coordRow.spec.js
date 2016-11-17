'use strict';

var CoordRow = require('model/coordRow');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var Model = require('base/model');

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
});
