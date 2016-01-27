'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');
var Renderer = require('model/renderer');
var Model = require('base/model');

describe('model.renderer', function() {
    var columnModel, dataModel, renderModel, dimensionModel;

    function createRenderModel(attrs) {
        return new Renderer(attrs, {
            columnModel: columnModel,
            dataModel: dataModel,
            dimensionModel: dimensionModel
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
    });

    describe('if showDummyRows:true', function() {
        beforeEach(function() {
            columnModel.set('columnModelList', [
                {columnName: 'c1'},
                {columnName: 'c2'}
            ]);
            dataModel.reset([
                {c1: '0-1', c2: '0-2'},
                {c1: '1-1', c2: '1-2'}
            ], {parse: true});
            renderModel = createRenderModel({
                showDummyRows: true
            });
        });

        describe('when refresh', function() {
            it('create dummy rows to fit rowCount to displayRowCount', function() {
                dimensionModel.set('displayRowCount', 5, {silent: true});
                renderModel.refresh();

                _.each(['lside', 'rside'], function(attrName) {
                    var rowList = renderModel.get(attrName),
                        dummyRows = rowList.slice(2);

                    expect(rowList.length).toBe(5);
                    _.each(dummyRows, function(row) {
                        expect(row.get('rowKey')).toBeUndefined();
                    });
                });
            });

            it('set dummyRowCount to length of dummy rows', function() {
                dimensionModel.set('displayRowCount', 5, {silent: true});
                renderModel.refresh();

                expect(renderModel.get('dummyRowCount')).toBe(3);
            });

            it('if actual rowCount is less then displayRowCount, dummyRowCount is 0', function() {
                dimensionModel.set('displayRowCount', 2, {silent: true});
                renderModel.refresh();
                expect(renderModel.get('dummyRowCount')).toBe(0);

                dimensionModel.set('displayRowCount', 1, {silent: true});
                renderModel.refresh();
                expect(renderModel.get('dummyRowCount')).toBe(0);
            });
        });

        describe('when displayRowCount changed', function() {
            it('reset dummy rows', function() {
                dimensionModel.set('displayRowCount', 5, {silent: true});
                renderModel.refresh();
                dimensionModel.set('displayRowCount', 4);

                _.each(['lside', 'rside'], function(attrName) {
                    var rowList = renderModel.get(attrName),
                        dummyRows = rowList.slice(2);

                    expect(rowList.length).toBe(4);
                    _.each(dummyRows, function(row) {
                        expect(row.get('rowKey')).toBeUndefined();
                    });
                });
                expect(renderModel.get('dummyRowCount')).toBe(2);
            });
        });
    });
});
