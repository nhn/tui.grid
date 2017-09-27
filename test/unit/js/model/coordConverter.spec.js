'use strict';

var $ = require('jquery');
var _ = require('underscore');

var DomState = require('domState');
var DataModel = require('model/data/rowList');
var ColumnModel = require('model/data/columnModel');
var DimensionModel = require('model/dimension');
var CoordRowModel = require('model/coordRow');
var CoordColumnModel = require('model/coordColumn');
var CoordConverter = require('model/coordConverter');
var Model = require('base/model');

var dimensionConstMap = require('common/constMap').dimension;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;
var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;

function create(data, domStateOffset) {
    var columnModel = new ColumnModel({
        rowHeaders: [
            {
                type: 'rowNum',
                width: 10
            }
        ],
        columns: [
            {
                name: 'c1',
                width: 30
            },
            {
                name: 'c2',
                width: 30
            },
            {
                name: 'c3',
                width: 30
            }
        ]
    });
    var dataModel = new DataModel(null, {
        columnModel: columnModel
    });

    var dimensionModel = new DimensionModel({
        rowHeight: 30,
        headerHeight: 0,
        scrollX: false,
        scrollY: false,
        minimumColumnWidth: 10
    }, {
        columnModel: columnModel,
        dataModel: dataModel,
        domState: {
            getOffset: _.constant(domStateOffset)
        }
    });

    var coordRowModel = new CoordRowModel(null, {
        domState: new DomState($('<div>')),
        dataModel: dataModel,
        dimensionModel: dimensionModel
    });
    var coordColumnModel = new CoordColumnModel(null, {
        columnModel: columnModel,
        dimensionModel: dimensionModel
    });

    dataModel.setData(data);

    return new CoordConverter(null, {
        dataModel: dataModel,
        columnModel: columnModel,
        dimensionModel: dimensionModel,
        coordRowModel: coordRowModel,
        coordColumnModel: coordColumnModel,
        focusModel: new Model(),
        renderModel: new Model({
            scrollLeft: 0,
            scrollTop: 0
        })
    });
}

describe('CoordConverter', function() {
    describe('getIndexFromMousePosition()', function() {
        it('Returns indexs of cell based on mouse position', function() {
            var domStateOffset = {
                top: 0,
                left: 0
            };
            var converter = create([{}, {}, {}], domStateOffset);

            expect(converter.getIndexFromMousePosition(50, 50, true)).toEqual({
                row: 1,
                column: 2
            });

            expect(converter.getIndexFromMousePosition(50, 50, false)).toEqual({
                row: 1,
                column: 1
            });
        });
    });

    describe('getCellPosition()', function() {
        it('Returns position (bounding rect) of given cell', function() {
            var converter = create([{}, {}, {}]);

            expect(converter.getCellPosition(0, 'c1')).toEqual({
                top: 0,
                bottom: 30 + CELL_BORDER_WIDTH,
                left: 0,
                right: 30 + CELL_BORDER_WIDTH
            });

            expect(converter.getCellPosition(1, 'c1')).toEqual({
                top: 30 + CELL_BORDER_WIDTH,
                bottom: (30 + CELL_BORDER_WIDTH) * 2,
                left: 0,
                right: 30 + CELL_BORDER_WIDTH
            });

            expect(converter.getCellPosition(1, 'c2')).toEqual({
                top: 30 + CELL_BORDER_WIDTH,
                bottom: (30 + CELL_BORDER_WIDTH) * 2,
                left: 30 + CELL_BORDER_WIDTH,
                right: 60 + (CELL_BORDER_WIDTH * 2)
            });
        });

        it('Returns correct position of rowSpanned cell', function() {
            var converter = create([{
                _extraData: {
                    rowSpan: {c1: 2}
                }
            }, {}, {}]);
            var mergedCellPos = {
                top: 0,
                bottom: (30 + CELL_BORDER_WIDTH) * 2,
                left: 0,
                right: 30 + CELL_BORDER_WIDTH
            };

            expect(converter.getCellPosition(0, 'c1')).toEqual(mergedCellPos);
            expect(converter.getCellPosition(1, 'c1')).toEqual(mergedCellPos);
        });
    });

    describe('getScrollPosition', function() {
        it('Returns scroll position of given cell', function() {
            var converter = create([{}, {}, {}]);

            converter.dimensionModel.set({
                bodyHeight: 50,
                width: 50
            });
            converter.columnModel.set('rowHeaders', []);

            expect(converter.getScrollPosition(0, 'c1')).toEqual({});
            expect(converter.getScrollPosition(1, 'c1')).toEqual({
                scrollTop: ((30 + CELL_BORDER_WIDTH) * 2) - 50
            });
            expect(converter.getScrollPosition(2, 'c2')).toEqual({
                scrollTop: ((30 + CELL_BORDER_WIDTH) * 3) - 50,
                scrollLeft: ((30 + CELL_BORDER_WIDTH) * 2) - 50 + TABLE_BORDER_WIDTH
            });
        });
    });
});
