'use strict';

describe('model.renderer', function() {
    var columnModelList = [
        {columnName: 'c1'},
        {columnName: 'c2'},
        {columnName: 'c3'}
    ];
    var sampleRow = {
        _extraData: {
            rowSpan: {
                c1: 3
            }
        },
        c1: '1',
        c2: '2',
        c3: '3'
    };

    var rowList = [],
        columnModelInstance,
        dataModelInstance,
        renderInstance,
        dimensionModelInstance,
        grid = {};

    (function setSampleRows() {
        var i;
        for (i = 0; i < 100; i += 1) {
            rowList.push($.extend({}, sampleRow));
        }
    })();

    columnModelInstance = grid.columnModel = new Data.ColumnModel({});
    columnModelInstance.set('columnModelList', columnModelList);
    dataModelInstance = grid.dataModel = new Data.RowList([], {
        grid: grid
    });
    dimensionModelInstance = grid.dimensionModel = new Model.Dimension({
        grid: grid,
        offsetLeft: 100,
        offsetTop: 200,
        width: 500,
        height: 500,
        headerHeight: 150,
        rowHeight: 10,
        displayRowCount: 20,
        scrollX: true,
        scrollBarSize: 17,
        bodyHeight: 100,
        minimumColumnWidth: 20
    });

    dimensionModelInstance.set('bodyHeight',
        Util.getHeight(dimensionModelInstance.get('displayRowCount'), dimensionModelInstance.get('rowHeight')));

    beforeEach(function() {
        dataModelInstance.set(rowList, {parse: true});
        renderInstance = new Model.Renderer.Smart({
            grid: grid
        });
        renderInstance.refresh();
    });

    describe('_setRenderingRange()', function() {
        it('scrollTop 변경에 따라 값을 설정한다.', function() {
            function getDiff(start, end) {
                return end - start;
            }
            renderInstance._setRenderingRange(0);
            expect(renderInstance.get('top')).toBe(0);
            expect(renderInstance.get('startIndex')).toBe(0);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(40);

            renderInstance._setRenderingRange(100);
            expect(renderInstance.get('top')).toBe(0);
            expect(renderInstance.get('startIndex')).toBe(0);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(40);

            renderInstance._setRenderingRange(200);
            expect(renderInstance.get('top')).toBe(77);
            expect(renderInstance.get('startIndex')).toBe(7);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);

            renderInstance._setRenderingRange(300);
            expect(renderInstance.get('top')).toBe(176);
            expect(renderInstance.get('startIndex')).toBe(16);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);

            renderInstance._setRenderingRange(400);
            expect(renderInstance.get('top')).toBe(275);
            expect(renderInstance.get('startIndex')).toBe(25);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);
        });
    });

    describe('_isRenderable()', function() {
        it('scrollTop 변경에 따라 rendering 해야할지 여부를 판단하여 반환한다.', function () {
            renderInstance._setRenderingRange(0);
            expect(renderInstance._isRenderable(0)).toBe(false);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(200);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(false);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(400);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(true);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(false);
            expect(renderInstance._isRenderable(400)).toBe(false);
            expect(renderInstance._isRenderable(500)).toBe(true);
        });
    });

    describe('_onChange()', function() {
        it('bodyHeight', function () {
            renderInstance._setRenderingRange(0);
            expect(renderInstance._isRenderable(0)).toBe(false);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(200);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(false);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(400);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(true);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(false);
            expect(renderInstance._isRenderable(400)).toBe(false);
            expect(renderInstance._isRenderable(500)).toBe(true);
        });
    });
});
