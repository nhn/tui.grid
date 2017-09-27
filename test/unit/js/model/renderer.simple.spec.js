'use strict';

var $ = require('jquery');
var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');
var CoordRowModel = require('model/coordRow');
var CoordColumnModel = require('model/coordColumn');
var Focus = require('model/focus');
var Renderer = require('model/renderer');
var DomState = require('domState');
var CELL_BORDER_WIDTH = require('common/constMap').dimension.CELL_BORDER_WIDTH;

describe('model.renderer', function() {
    var columnModel, dataModel, renderModel, focusModel;
    var coordRowModel, coordColumnModel, dimensionModel;

    function createRenderModel(attrs) {
        return new Renderer(attrs, {
            columnModel: columnModel,
            dataModel: dataModel,
            focusModel: focusModel,
            dimensionModel: dimensionModel,
            coordRowModel: coordRowModel,
            coordColumnModel: coordColumnModel
        });
    }

    beforeEach(function() {
        columnModel = new ColumnModelData();
        dataModel = new RowListData(null, {
            columnModel: columnModel
        });
        dimensionModel = new Dimension(null, {
            dataModel: dataModel,
            columnModel: columnModel
        });
        coordRowModel = new CoordRowModel(null, {
            dataModel: dataModel,
            dimensionModel: dimensionModel
        });
        coordColumnModel = new CoordColumnModel(null, {
            columnModel: columnModel,
            dimensionModel: dimensionModel
        });
        dimensionModel.coordRowModel = coordRowModel;
        focusModel = new Focus(null, {
            domState: new DomState($('<div />')),
            columnModel: columnModel,
            dataModel: dataModel,
            dimensionModel: dimensionModel
        });
    });

    describe('refresh', function() {
        beforeEach(function() {
            renderModel = createRenderModel();
            dataModel.reset([
                {}, {}, {}
            ], {parse: true});
        });

        it('executes all relation', function() {
            spyOn(renderModel, '_executeRelation');
            renderModel.refresh();

            expect(renderModel._executeRelation.calls.count()).toBe(3);
            expect(renderModel._executeRelation).toHaveBeenCalledWith(0);
            expect(renderModel._executeRelation).toHaveBeenCalledWith(1);
            expect(renderModel._executeRelation).toHaveBeenCalledWith(2);
        });
    });

    describe('if showDummyRows:true', function() {
        beforeEach(function() {
            columnModel.set('columns', [
                {name: 'c1'},
                {name: 'c2'}
            ]);
            dimensionModel.set({
                rowHeight: 10 - CELL_BORDER_WIDTH,
                scrollX: false
            });
            dataModel.reset([
                {
                    c1: '0-1',
                    c2: '0-2'
                },
                {
                    c1: '1-1',
                    c2: '1-2'
                }
            ], {parse: true});
            renderModel = createRenderModel({
                showDummyRows: true
            });
        });

        it('and bodyHeight is changed, dummyRowCount should be reset', function() {
            dimensionModel.set('bodyHeight', 30);
            expect(renderModel.get('dummyRowCount')).toBe(1);

            dimensionModel.set('bodyHeight', 40);
            expect(renderModel.get('dummyRowCount')).toBe(2);
        });

        it('and dummyRowCount is change, rowList should be filled with dummy rows', function() {
            var dummyRowCount = 3;
            renderModel.set('dummyRowCount', dummyRowCount);

            _.each(['lside', 'rside'], function(attrName) {
                var rowList = renderModel.get(attrName);
                var dummyRows = rowList.slice(2);

                expect(rowList.length).toBe(dummyRowCount);
                _.each(dummyRows, function(row) {
                    expect(row.get('rowKey')).toBeUndefined();
                });
            });
        });
    });
});
