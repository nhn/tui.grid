'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');
var util = require('common/util');

describe('model.dimension', function() {
    var defaultAttrs, columnModel, dataModel;

    beforeEach(function() {
        columnModel = new ColumnModelData();
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
        defaultAttrs = {
            width: 500,
            height: 500,
            headerHeight: 100,
            rowHeight: 30,
            scrollX: false,
            scrollY: false,
            displayRowCount: 20
        };
    });

    function createDimension() {
        return new Dimension(defaultAttrs, {
            columnModel: columnModel,
            dataModel: dataModel
        });
    }

    describe('set displayRowCount', function() {
        it('change the bodyHeight', function() {
            var dimension = createDimension(),
                displayRowCount = 10,
                expectedBodyHeight = util.getHeight(displayRowCount, dimension.get('rowHeight'));

            dimension.set('displayRowCount', displayRowCount);
            expect(dimension.get('bodyHeight')).toBe(expectedBodyHeight);
        });
    });

    describe('set bodyHeight', function() {
        it('change the displayRowCount', function() {
            var dimension = createDimension(),
                bodyHeight = 65,
                expectedCount = util.getDisplayRowCount(bodyHeight, dimension.get('rowHeight'));

            dimension.set('bodyHeight', bodyHeight);
            expect(dimension.get('displayRowCount')).toBe(expectedCount);
        });
    });

    describe('_distributeExtraWidthEqually()', function() {
        var testFn = Dimension.prototype._distributeExtraWidthEqually;

        it('[20, 20, 20], extra: 30', function() {
            var widths = [20, 20, 20],
                extraWidth = 30;

            expect(testFn(widths, extraWidth, [0, 1, 2])).toEqual([30, 30, 30]);
            expect(testFn(widths, extraWidth, [0, 1])).toEqual([35, 35, 20]);
            expect(testFn(widths, extraWidth, [2])).toEqual([20, 20, 50]);
        });

        it('[20, 20, 20], extra: -30', function() {
            var widths = [20, 20, 20],
                extraWidth = -30;

            expect(testFn(widths, extraWidth, [0, 1, 2])).toEqual([10, 10, 10]);
            expect(testFn(widths, extraWidth, [0, 1])).toEqual([5, 5, 20]);
        });

        it('[20, 30, 40], extra: 40', function() {
            var widths = [20, 30, 40],
                extraWidth = 40,
                columnIndexes = [0, 1, 2];

            expect(testFn(widths, extraWidth, columnIndexes)).toEqual([33, 43, 54]);
        });
    });

    describe('_fillEmptyColumnWidth() - total:500', function() {
        var dimension;

        beforeEach(function() {
            var attrs = _.extend(defaultAttrs, {
                width: 506, // total 500
                minimumColumnWidth: 50
            });
            dimension = new Dimension(attrs, {
                columnModel: columnModel,
                dataModel: dataModel
            });
        });

        it('[100, 100, 0, 0, 0]', function() {
            var input = [100, 100, 0, 0, 0],
                output = [100, 100, 100, 100, 99];

            expect(dimension._fillEmptyColumnWidth(input)).toEqual(output);
        });

        it('[200, 200, 0, 0, 0]', function() {
            var input = [200, 200, 0, 0, 0],
                output = [200, 200, 33, 33, 33];

            expect(dimension._fillEmptyColumnWidth(input)).toEqual(output);
        });
    });

    describe('_adjustColumnWidthList()', function() {
        var dimension;

        describe('available:500, minWidth:50', function() {
            beforeEach(function() {
                var attrs = _.extend(defaultAttrs, {
                    width: 506,
                    minimumColumnWidth: 50
                });
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
            });

            it('50(fixed), 50(fixed), 100, 100, 100', function() {
                var input = [50, 50, 100, 100, 100],
                    output = [50, 50, 133, 133, 133];

                dimension._columnWidthFixedFlags = [true, true, false, false, false];
                expect(dimension._adjustColumnWidthList(input)).toEqual(output);
            });

            it('50, 50, 50, 50, 50 (fixed all)', function() {
                var input = [50, 50, 50, 50, 50],
                    output = [50, 50, 50, 50, 299];

                dimension._columnWidthFixedFlags = [true, true, true, true, true];
                expect(dimension._adjustColumnWidthList(input)).toEqual(output);
            });
        });

        describe('available:300, minWidth:50 (fitToReducedTotal:true)', function() {
            beforeEach(function() {
                var attrs = _.extend(defaultAttrs, {
                    width: 306,
                    minimumColumnWidth: 50
                });
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                dimension._minColumnWidthList = [50, 50, 50, 50, 50];
                dimension._columnWidthFixedFlags = [false, false, false, false, false];
            });

            it('100, 100, 100, 50, 50', function() {
                var input = [100, 100, 100, 100, 100],
                    output = [60, 60, 60, 60, 59];

                expect(dimension._adjustColumnWidthList(input, true)).toEqual(output);
            });

            it('100, 100, 70, 70, 70', function() {
                var input = [100, 100, 70, 70, 70],
                    output = [75, 74, 50, 50, 50];

                expect(dimension._adjustColumnWidthList(input, true)).toEqual(output);
            });

            it('50, 50, 50, 50, 50', function() {
                var input = [50, 50, 50, 50, 50],
                    output = [50, 50, 50, 50, 50];

                dimension.set('width', 206);
                expect(_.isEqual(dimension._adjustColumnWidthList(input, true), output)).toBe(true);
            });

            it('100(fixed), 100(fixed), 100(fixed), 100, 100', function() {
                var input = [100, 100, 100, 100, 100],
                    output = [100, 100, 100, 50, 50];

                dimension._columnWidthFixedFlags = [true, true, true, false, false];
                expect(_.isEqual(dimension._adjustColumnWidthList(input, true), output)).toBe(true);
            });
        });
    });

    describe('_initColumnWidthVariables()', function() {
        var dimension, attrs;

        describe('totalWidth:500, minWidth:50', function() {
            beforeEach(function() {
                attrs = _.extend(defaultAttrs, {
                    width: 506,
                    minimumColumnWidth: 50
                });
                columnModel.set('hasNumberColumn', false);
            });

            it('100, 100, 100, 0, 0', function() {
                columnModel.set('columnModelList', [
                    {columnName: 'c1', width: 100},
                    {columnName: 'c2', width: 100},
                    {columnName: 'c3', width: 100},
                    {columnName: 'c4'},
                    {columnName: 'c5'}
                ]);
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                expect(dimension.get('columnWidthList')).toEqual([100, 100, 100, 100, 100]);
            });

            // total minimum width of empty column is bigger than remain width.
            it('150, 150, 150, 0, 0', function() {
                columnModel.set('columnModelList', [
                    {columnName: 'c1', width: 150},
                    {columnName: 'c2', width: 150},
                    {columnName: 'c3', width: 150},
                    {columnName: 'c4'},
                    {columnName: 'c5'}
                ]);
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                expect(dimension.get('columnWidthList')).toEqual([150, 150, 150, 50, 50]);
            });

            it('30, 30, 30, 100, 100', function() {
                columnModel.set('columnModelList', [
                    {columnName: 'c1', width: 30},
                    {columnName: 'c2', width: 30},
                    {columnName: 'c3', width: 30},
                    {columnName: 'c4', width: 100},
                    {columnName: 'c5', width: 100}
                ]);
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                expect(dimension.get('columnWidthList')).toEqual([80, 80, 80, 130, 130]);
            });

            it('50(fixed), 50(fixed), 50(fixed), 100, 100', function() {
                columnModel.set('columnModelList', [
                    {columnName: 'c1', width: 50, isFixedWidth: true},
                    {columnName: 'c2', width: 50, isFixedWidth: true},
                    {columnName: 'c3', width: 50, isFixedWidth: true},
                    {columnName: 'c4', width: 100},
                    {columnName: 'c5', width: 100}
                ]);
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                expect(dimension.get('columnWidthList')).toEqual([50, 50, 50, 175, 175]);
            });

            it('50(fixed), 50(fixed), 50(fixed), 50(fixed), 50(fixed)', function() {
                columnModel.set('columnModelList', [
                    {columnName: 'c1', width: 50, isFixedWidth: true},
                    {columnName: 'c2', width: 50, isFixedWidth: true},
                    {columnName: 'c3', width: 50, isFixedWidth: true},
                    {columnName: 'c4', width: 50, isFixedWidth: true},
                    {columnName: 'c5', width: 50, isFixedWidth: true}
                ]);
                dimension = new Dimension(attrs, {
                    columnModel: columnModel,
                    dataModel: dataModel
                });
                expect(dimension.get('columnWidthList')).toEqual([50, 50, 50, 50, 300]);
            });
        });
    });

    describe('refreshLayout', function() {
        var OFFSET_TOP = 10,
            OFFSET_LEFT = 11,
            WIDTH = 20,
            PARENT_HEIGHT = 30;

        var dimension;

        beforeEach(function() {
            dimension = new Dimension(null, {
                columnModel: columnModel,
                dataModel: dataModel,
                domState: {
                    getOffset: _.constant({
                        top: OFFSET_TOP,
                        left: OFFSET_LEFT
                    }),
                    getWidth: _.constant(WIDTH),
                    getParentHeight: _.constant(PARENT_HEIGHT)
                }
            });
        });

        it('reset values with current dom state', function() {
            dimension.refreshLayout();

            dimension.get('width', WIDTH);
            dimension.get('offsetTop', OFFSET_TOP);
            dimension.get('offsetLeft', OFFSET_LEFT);
        });

        it('fit to parent height if fitToParentHeight options is true', function() {
            dimension.set('fitToParentHeight', true);
            spyOn(dimension, '_setHeight');
            dimension.refreshLayout();

            expect(dimension._setHeight).toHaveBeenCalledWith(PARENT_HEIGHT);
        });
    });

    describe('setWidth()', function() {
        var dimension, attrs;

        describe('totalWidth:500, minWidth:50, ', function() {
            beforeEach(function() {
                attrs = _.extend(defaultAttrs, {
                    width: 506,
                    minimumColumnWidth: 50
                });
                columnModel.set('hasNumberColumn', false);
            });

            describe('100(auto), 100(auto), 100(auto), 100(auto), 100(auto)', function() {
                beforeEach(function() {
                    columnModel.set('columnModelList', [
                        {columnName: 'c1'},
                        {columnName: 'c2'},
                        {columnName: 'c3'},
                        {columnName: 'c4'},
                        {columnName: 'c5'}
                    ]);
                    dimension = new Dimension(attrs, {
                        columnModel: columnModel,
                        dataModel: dataModel
                    });
                });

                it('set first width to 150', function() {
                    dimension.setColumnWidth(0, 150);
                    expect(dimension.get('columnWidthList')).toEqual([150, 100, 100, 100, 100]);
                });

                it('set first width to 150', function() {
                    dimension.setColumnWidth(0, 50);
                    expect(dimension.get('columnWidthList')).toEqual([50, 113, 113, 113, 111]);
                });

                it('set first width to 30', function() {
                    dimension.setColumnWidth(0, 30);
                    expect(dimension.get('columnWidthList')).toEqual([50, 113, 113, 113, 111]);
                });
            });

            describe('100(fixed), 100(fixed), 100, 100(auto) 100(auto)', function() {
                beforeEach(function() {
                    columnModel.set('columnModelList', [
                        {columnName: 'c1', width: 100, isFixedWidth: true},
                        {columnName: 'c2', width: 100, isFixedWidth: true},
                        {columnName: 'c3', width: 100},
                        {columnName: 'c4', width: 100},
                        {columnName: 'c5'}
                    ]);
                    dimension = new Dimension(attrs, {
                        columnModel: columnModel,
                        dataModel: dataModel
                    });
                });

                it('set first width(fixed) to 150', function() {
                    dimension.setColumnWidth(0, 150);
                    expect(dimension.get('columnWidthList')).toEqual([100, 100, 100, 100, 100]);
                });

                it('set third width(min:100) to 50', function() {
                    dimension.setColumnWidth(2, 50);
                    expect(dimension.get('columnWidthList')).toEqual([100, 100, 100, 100, 100]);
                });

                it('set third width(min:100) to 150', function() {
                    dimension.setColumnWidth(2, 150);
                    expect(dimension.get('columnWidthList')).toEqual([100, 100, 150, 100, 100]);
                });

                it('set last width(auto) to 50', function() {
                    dimension.setColumnWidth(4, 50);
                    expect(dimension.get('columnWidthList')).toEqual([100, 100, 125, 125, 50]);
                });
            });
        });
    });
});
