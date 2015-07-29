'use strict';

describe('model.dimension', function() {
    var dimension,
        grid = {},
        defaultConfig;

    beforeEach(function() {
        grid.columnModel = new Data.ColumnModel();
        grid.dataModel = new Data.RowList([], {
            grid: grid
        });
        defaultConfig = {
            grid: grid,
            width: 500,
            height: 500,
            headerHeight: 100,
            rowHeight: 30,
            scrollX: false,
            scrollY: false,
            displayRowCount: 20
        };
    });

    describe('_calculateColumnWidthList()', function() {
        describe('when total width is smaller than dimension width', function() {
            beforeEach(function() {
                var config = _.extend(defaultConfig, {
                    width: 506,
                    minimumColumnWidth: 50
                });
                dimension = new Model.Dimension(config);
            });

            it('100, 100, 100, 0, 0', function() {
                var input = [100, 100, 100, 0, 0],
                    output = [100, 100, 100, 100, 100];

                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('120, 130, 150, 0, 0', function() {
                var input = [120, 130, 150, 0, 0],
                    output = [120, 130, 150, 50, 50];

                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('50, 50, 100, 0, 0', function() {
                var input = [50, 50, 100, 0, 0],
                    output = [50, 50, 100, 150, 150];

                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('50(fixed), 50(fixed), 100, 0, 0', function() {
                var input = [50, 50, 100, 0, 0],
                    output = [50, 50, 100, 150, 150];

                dimension.set('columnWidthFixedFlags', [true, true, false, false, false]);
                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('50(fixed), 50(fixed), 100, 100, 100', function() {
                var input = [50, 50, 100, 100, 100],
                    output = [50, 50, 133, 133, 134];

                dimension.set('columnWidthFixedFlags', [true, true, false, false, false]);
                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('0, 0, 0, 0, 60(fixed)', function() {
                var input = [0, 0, 0, 0, 60],
                    output = [110, 110, 110, 110, 60];

                dimension.set('columnWidthFixedFlags', [false, false, false, false, true]);
                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('50, 50, 50, 50, 50 (fixed all)', function() {
                var input = [50, 50, 50, 50, 50],
                    output = [50, 50, 50, 50, 300];

                dimension.set('columnWidthFixedFlags', [true, true, true, true, true]);
                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });
        });

        describe('when total width is bigger than dimension width', function() {
            beforeEach(function() {
                var config = _.extend(defaultConfig, {
                    width: 306,
                    minimumColumnWidth: 50
                });
                dimension = new Model.Dimension(config);
            });

            it('150, 150, 0, 0, 0', function() {
                var input = [150, 150, 0, 0, 0],
                    output = [150, 150, 50, 50, 50];

                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });

            it('100, 100, 100, 0, 0', function() {
                var input = [100, 100, 100, 0, 0],
                    output = [100, 100, 100, 50, 50];

                expect(dimension._calculateColumnWidthList(input)).toEqual(output);
            });
        });
    });
});
