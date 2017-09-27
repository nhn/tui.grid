'use strict';

var _ = require('underscore');
var ColumnModel = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Dimension = require('model/dimension');
var CoordColumn = require('model/coordColumn');
var frameConst = require('common/constMap').frame;

function createDimension(columnModel, attrs) {
    var defaultAttrs = {
        width: 500,
        height: 500,
        headerHeight: 100,
        rowHeight: 30,
        scrollX: false,
        scrollY: false
    };

    return new Dimension(_.extend(defaultAttrs, attrs), {
        columnModel: columnModel,
        dataModel: new RowListData([], {
            columnModel: columnModel
        })
    });
}

function createCoordColumn(columnModelAttrs, dimensionAttrs) {
    var columnModel = new ColumnModel(columnModelAttrs);
    var dimensionModel = createDimension(columnModel, dimensionAttrs);

    return new CoordColumn(null, {
        columnModel: columnModel,
        dimensionModel: dimensionModel
    });
}

describe('CoordColumn', function() {
    describe('_distributeExtraWidthEqually()', function() {
        var testFn = CoordColumn.prototype._distributeExtraWidthEqually;

        it('[20, 20, 20], extra: 30', function() {
            var widths = [20, 20, 20];
            var extraWidth = 30;

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

    describe('_fillEmptyWidth() - total:500', function() {
        var coordColumn;

        beforeEach(function() {
            coordColumn = createCoordColumn(null, {
                width: 506, // total 500
                minimumColumnWidth: 50
            });
        });

        it('[100, 100, 0, 0, 0]', function() {
            var input = [100, 100, 0, 0, 0],
                output = [100, 100, 100, 100, 100];

            expect(coordColumn._fillEmptyWidth(input)).toEqual(output);
        });

        it('[200, 200, 0, 0, 0]', function() {
            var input = [200, 200, 0, 0, 0],
                output = [200, 200, 33, 33, 34];

            expect(coordColumn._fillEmptyWidth(input)).toEqual(output);
        });
    });

    describe('_adjustWidths()', function() {
        var coordColumn;

        describe('available:500, minWidth:50', function() {
            beforeEach(function() {
                coordColumn = createCoordColumn(null, {
                    width: 506,
                    minimumColumnWidth: 50
                });
            });

            it('50(fixed), 50(fixed), 100, 100, 100', function() {
                var input = [50, 50, 100, 100, 100],
                    output = [50, 50, 133, 133, 134];

                coordColumn._fixedWidthFlags = [true, true, false, false, false];
                expect(coordColumn._adjustWidths(input)).toEqual(output);
            });

            it('50, 50, 50, 50, 50 (fixed all)', function() {
                var input = [50, 50, 50, 50, 50],
                    output = [50, 50, 50, 50, 50];

                coordColumn._fixedWidthFlags = [true, true, true, true, true];
                expect(coordColumn._adjustWidths(input)).toEqual(output);
            });
        });

        describe('available:300, minWidth:50 (fitToReducedTotal:true)', function() {
            beforeEach(function() {
                coordColumn = createCoordColumn(null, {
                    width: 306,
                    minimumColumnWidth: 50
                });
                coordColumn._minWidths = [50, 50, 50, 50, 50];
                coordColumn._fixedWidthFlags = [false, false, false, false, false];
            });

            it('100, 100, 100, 50, 50', function() {
                var input = [100, 100, 100, 100, 100];
                var output = [60, 60, 60, 60, 60];

                expect(coordColumn._adjustWidths(input, true)).toEqual(output);
            });

            it('100, 100, 70, 70, 70', function() {
                var input = [100, 100, 70, 70, 70];
                var output = [75, 75, 50, 50, 50];

                expect(coordColumn._adjustWidths(input, true)).toEqual(output);
            });

            it('50, 50, 50, 50, 50', function() {
                var input = [50, 50, 50, 50, 50];
                var output = [50, 50, 50, 50, 50];

                coordColumn.dimensionModel.set('width', 206);
                expect(coordColumn._adjustWidths(input, true)).toEqual(output);
            });

            it('100(fixed), 100(fixed), 100(fixed), 100, 100', function() {
                var input = [100, 100, 100, 100, 100],
                    output = [100, 100, 100, 50, 50];

                coordColumn._fixedWidthFlags = [true, true, true, false, false];
                expect(_.isEqual(coordColumn._adjustWidths(input, true), output)).toBe(true);
            });
        });
    });

    describe('_initColumnWidthVariables()', function() {
        var dimensionAttrs = {
            width: 506, // border fixel is 6
            minimumColumnWidth: 50
        };

        describe('totalWidth:500, minWidth:50', function() {
            it('All columns are not fixed.', function() {
                var columnAttrs = {
                    columns: [
                        {name: 'c1'},
                        {name: 'c2'},
                        {name: 'c3'},
                        {name: 'c4'},
                        {name: 'c5'}
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([100, 100, 100, 100, 100]);
            });

            // Each minimum width of "auto" column is smaller than default mininum width.
            it('150, 150, 150, "auto", "auto"', function() {
                var columnAttrs = {
                    columns: [
                        {
                            name: 'c1',
                            width: 150
                        },
                        {
                            name: 'c2',
                            width: 150
                        },
                        {
                            name: 'c3',
                            width: 150
                        },
                        {
                            name: 'c4'
                        },
                        {
                            name: 'c5'
                        }
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([150, 150, 150, 50, 50]);
            });

            // Each minimum width of "auto" column is larger than default mininum width.
            it('30, 30, 30, "auto", "auto"', function() {
                var columnAttrs = {
                    columns: [
                        {
                            name: 'c1',
                            width: 80
                        },
                        {
                            name: 'c2',
                            width: 80
                        },
                        {
                            name: 'c3',
                            width: 80
                        },
                        {
                            name: 'c4'
                        },
                        {
                            name: 'c5'
                        }
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([80, 80, 80, 130, 130]);
            });

            it('All columns are fixed with 50px.', function() {
                var columnAttrs = {
                    columns: [
                        {
                            name: 'c1',
                            width: 50
                        },
                        {
                            name: 'c2',
                            width: 50
                        },
                        {
                            name: 'c3',
                            width: 50
                        },
                        {
                            name: 'c4',
                            width: 50
                        },
                        {
                            name: 'c5',
                            width: 50
                        }
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([50, 50, 50, 50, 50]);
            });

            it('When minimum width set, width of each "auto" column is expaneded by minimum width.', function() {
                var columnAttrs = {
                    columns: [
                        {
                            name: 'c1',
                            minWidth: 150
                        },
                        {
                            name: 'c2',
                            minWidth: 150
                        },
                        {
                            name: 'c3',
                            minWidth: 150
                        },
                        {
                            name: 'c4'
                        },
                        {
                            name: 'c5'
                        }
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([150, 150, 150, 50, 50]);
            });

            it('When width set with minimum width and minimum width is larger than width, ' +
                'width is replaced by minimum width.', function() {
                var columnAttrs = {
                    columns: [
                        {
                            name: 'c1',
                            width: 100,
                            minWidth: 10
                        },
                        {
                            name: 'c2',
                            width: 10,
                            minWidth: 100
                        },
                        {
                            name: 'c3'},
                        {
                            name: 'c4'},
                        {
                            name: 'c5'}
                    ],
                    hasNumberColumn: false
                };
                var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);
                expect(coordColumn.get('widths')).toEqual([100, 100, 100, 100, 100]);
            });
        });
    });

    describe('setColumnWidth()', function() {
        it('changes width of given column and set variables', function() {
            var columnAttrs = {
                columns: [
                    {
                        name: 'c1',
                        width: 50
                    },
                    {
                        name: 'c2',
                        width: 50
                    },
                    {
                        name: 'c3',
                        width: 50
                    }
                ],
                hasNumberColumn: false
            };
            var dimensionAttrs = {
                width: 154,
                minimumColumnWidth: 10
            };
            var coordColumn = createCoordColumn(columnAttrs, dimensionAttrs);

            coordColumn.setColumnWidth(0, 60);

            expect(coordColumn.get('widths')).toEqual([60, 50, 50]);
        });
    });

    describe('getWidths()', function() {
        it('ColumnFixCount 를 기반으로 Left side 와 Right Side 를 잘 반환하는지 확인한다.', function() {
            var columnAttrs = {
                columns: [
                    {name: 'c1'},
                    {name: 'c2'},
                    {name: 'c3'},
                    {name: 'c4'},
                    {name: 'c5'}
                ],
                hasNumberColumn: false,
                frozenCount: 2
            };
            var coordColumn = createCoordColumn(columnAttrs);

            coordColumn.set({
                widths: [10, 20, 30, 40, 50]
            });

            expect(coordColumn.getWidths()).toEqual([10, 20, 30, 40, 50]);
            expect(coordColumn.getWidths(frameConst.L)).toEqual([10, 20]);
            expect(coordColumn.getWidths(frameConst.R)).toEqual([30, 40, 50]);

            coordColumn.columnModel.set({
                frozenCount: 4
            });
            coordColumn.set({
                widths: [10, 20, 30, 40, 50]
            });
            expect(coordColumn.getWidths(frameConst.L)).toEqual([10, 20, 30, 40]);
            expect(coordColumn.getWidths(frameConst.R)).toEqual([50]);
        });
    });

    describe('_adjustLeftSideWidths()', function() {
        var coordColumn, widths;

        beforeEach(function() {
            coordColumn = createCoordColumn(null, {
                minimumColumnWidth: 10
            });
            widths = [100, 80, 60, 40, 30, 20, 10];
        });

        it('Adjust width of columns  to given total width', function() {
            expect(coordColumn._adjustLeftSideWidths(widths, 300)).toEqual([100, 80, 60, 22, 10, 10, 10]);
        });

        it('Each column should be equal or greater than the minimumColumnWidth', function() {
            expect(coordColumn._adjustLeftSideWidths(widths, 50)).toEqual([10, 10, 10, 10, 10, 10, 10]);
        });
    });

    describe('getFrameWidth()', function() {
        var coordColumn;

        beforeEach(function() {
            coordColumn = createCoordColumn({
                rowHeaders: ['rowNum'],
                columns: [
                    {name: 'c1'},
                    {name: 'c2'},
                    {name: 'c3'}
                ],
                frozenCount: 2
            });
            coordColumn.set('widths', [10, 20, 30, 40, 50]);
        });

        it('Returns width of whole columns if called without arguments', function() {
            expect(coordColumn.getFrameWidth()).toEqual(157);
        });

        it('Returns width of left-side columns if argument is L', function() {
            expect(coordColumn.getFrameWidth(frameConst.L)).toEqual(64);
        });

        it('Returns width of right-side columns if argument is R', function() {
            expect(coordColumn.getFrameWidth(frameConst.R)).toEqual(93);
        });
    });
});
