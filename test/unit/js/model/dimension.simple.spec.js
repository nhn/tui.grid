'use strict';

var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');

function create(attrs) {
    var columnModel = new ColumnModelData();
    var dataModel = new RowListData([], {
        columnModel: columnModel
    });

    return new Dimension(attrs, {
        columnModel: columnModel,
        dataModel: dataModel
    });
}

describe('model.dimension', function() {
    describe('refreshLayout', function() {
        var OFFSET_TOP = 10;
        var OFFSET_LEFT = 11;
        var WIDTH = 20;
        var PARENT_HEIGHT = 30;
        var dimension;

        beforeEach(function() {
            dimension = create();
            dimension.domState = {
                getOffset: _.constant({
                    top: OFFSET_TOP,
                    left: OFFSET_LEFT
                }),
                getWidth: _.constant(WIDTH),
                getParentHeight: _.constant(PARENT_HEIGHT)
            };
        });

        it('reset values with current dom state', function() {
            dimension.refreshLayout();

            dimension.get('width', WIDTH);
            dimension.get('offsetTop', OFFSET_TOP);
            dimension.get('offsetLeft', OFFSET_LEFT);
        });

        it('fit to parent height if fitToParentHeight options is true', function() {
            dimension.set('fitToParentHeight', true);
            spyOn(dimension, 'setHeight');
            dimension.refreshLayout();

            expect(dimension.setHeight).toHaveBeenCalledWith(PARENT_HEIGHT);
        });
    });

    describe('_getMinLeftSideWidth()', function() {
        it('Returns min-width of left-side frame', function() {
            var dimension = create({
                minimumColumnWidth: 20
            });

            dimension.columnModel.set({
                rowHeaders: ['rowNum'],
                columns: [
                    {name: 'c1'},
                    {name: 'c2'},
                    {name: 'c3'}
                ],
                frozenCount: 3
            });
            expect(dimension._getMinLeftSideWidth()).toEqual(85);
        });

        it('return 0 if fixed column does not exist', function() {
            var dimension = create({
                minimumColumnWidth: 20
            });

            dimension.columnModel.set({
                hasNumberColumn: false,
                frozenCount: 0
            });
            expect(dimension._getMinLeftSideWidth()).toEqual(0);
        });
    });

    describe('getMaxLeftSideWidth()', function() {
        it('Returns max-width of left-side frame', function() {
            var dimension = create({
                width: 100,
                minimumColumnWidth: 20
            });
            dimension.columnModel.set({
                columns: [
                    {name: 'c1'},
                    {name: 'c2'},
                    {name: 'c3'}
                ],
                frozenCount: 3
            });

            expect(dimension.getMaxLeftSideWidth()).toEqual(90);
        });
    });

    describe('getScrollXHeight()', function() {
        it('Should return 0 when the "scrollX" attr is false', function() {
            var dimension = create({
                scrollX: false
            });

            expect(dimension.getScrollXHeight()).toEqual(0);
        });

        it('Should return scrollbar size when the "scrollX" attr is true', function() {
            var dimension = create({
                scrollX: true,
                scrollbarSize: 17
            });

            expect(dimension.getScrollXHeight()).toEqual(17);
        });
    });

    describe('getScrollYWidth()', function() {
        it('Should return 0 when the "scrollY" attr is false', function() {
            var dimension = create({
                scrollY: false
            });

            expect(dimension.getScrollYWidth()).toEqual(0);
        });

        it('Should return scrollbar size when the "scrollY" attr is true', function() {
            var dimension = create({
                scrollY: true,
                scrollbarSize: 17
            });

            expect(dimension.getScrollYWidth()).toEqual(17);
        });
    });

    describe('getOverflowFromMousePosition()', function() {
        var dimension;
        var bodyOffsetX, bodyOffsetY;
        var limitX, limitY;

        beforeEach(function() {
            dimension = create({
                lsideWidth: 0,
                rsideWidth: 100,
                offsetLeft: 10,
                offsetTop: 10,
                headerHeight: 0,
                bodyHeight: 100,
                scrollX: false,
                scrollY: false
            });
            dimension.domState = {
                getOffset: _.constant({
                    top: 10,
                    left: 10
                })
            };
            bodyOffsetX = 10;
            bodyOffsetY = dimension.getBodyOffsetTop();
            limitX = 110;
            limitY = bodyOffsetY + 100;
        });

        it('should return -1 when the position is negative', function() {
            var expected = {
                x: -1,
                y: -1
            };
            expect(dimension.getOverflowFromMousePosition(0, 0)).toEqual(expected);
            expect(dimension.getOverflowFromMousePosition(bodyOffsetX - 1, bodyOffsetY - 1)).toEqual(expected);
        });

        it('should return 0 when the position is in container', function() {
            var expected = {
                x: 0,
                y: 0
            };
            expect(dimension.getOverflowFromMousePosition(bodyOffsetX, bodyOffsetY)).toEqual(expected);
            expect(dimension.getOverflowFromMousePosition(limitX, limitY)).toEqual(expected);
        });

        it('should return 1 when the position is over the container size', function() {
            var expected = {
                x: 1,
                y: 1
            };
            expect(dimension.getOverflowFromMousePosition(limitX + 1, limitY + 1)).toEqual(expected);
        });
    });

    describe('fixedHeight value', function() {
        var dimension;

        beforeEach(function() {
            dimension = create({
                bodyHeight: 100,
                fixedHeight: false
            });
        });

        it('when changed from "auto" to a fixed value.', function() {
            dimension.set('bodyHeight', '300');
            expect(dimension.get('fixedHeight')).toEqual(true);
        });

        it('when not changed from "auto" to a fixed value.', function() {
            dimension.set({
                totalRowHeight: true,
                bodyHeight: '300'
            });
            expect(dimension.get('fixedHeight')).toEqual(false);
        });
    });
});
