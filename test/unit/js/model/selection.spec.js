'use strict';

var _ = require('underscore');
var Model = require('base/model');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var SelectionModel = require('model/selection');

function create(rowList) {
    var columnModel = new ColumnModel({
        columns: [
            {name: 'c1'},
            {name: 'c2'},
            {name: 'c3'},
            {name: 'c4'}
        ]
    });
    var dataModel = new DataModel(null, {
        columnModel: columnModel
    });

    if (!rowList) {
        rowList = [
            {
                c1: '0-1',
                c2: '0-2',
                c3: '0-3',
                c4: '0-4'
            },
            {
                c1: '1-1',
                c2: '1-2',
                c3: '1-3',
                c4: '1-4'
            },
            {
                c1: '2-1',
                c2: '2-2',
                c3: '2-3',
                c4: '2-4'
            }
        ];
    }

    dataModel.setData(rowList);

    return new SelectionModel({
        selectionUnit: 'cell'
    }, {
        columnModel: columnModel,
        dataModel: dataModel,
        renderModel: new Model()
    });
}

describe('model/selection', function() {
    it('enable', function() {
        var selection = create();
        selection.enable();

        expect(selection.isEnabled()).toBe(true);
    });

    it('disable', function() {
        var selection = create();

        spyOn(selection, 'end');
        selection.disable();

        expect(selection.isEnabled()).toBe(false);
        expect(selection.end).toHaveBeenCalled();
    });

    it('should not call start and update if disabled', function() {
        var selection = create();

        spyOn(selection, '_resetRangeAttribute');
        selection.disable();

        selection.start(0, 0);
        expect(selection._resetRangeAttribute).not.toHaveBeenCalled();

        selection.update(1, 1);
        expect(selection._resetRangeAttribute).not.toHaveBeenCalled();
    });

    it('isAutoScrollable : mouse move 이벤트 발생시 scroll 해야하는 영역에 pointer 가 위치하는지 확인한다.', function() {
        var selection = create();

        expect(selection._isAutoScrollable(1, 1)).toBe(true);
        expect(selection._isAutoScrollable(1, 0)).toBe(true);
        expect(selection._isAutoScrollable(0, 1)).toBe(true);
        expect(selection._isAutoScrollable(-1, 1)).toBe(true);
        expect(selection._isAutoScrollable(-1, 0)).toBe(true);
        expect(selection._isAutoScrollable(0, -1)).toBe(true);
        expect(selection._isAutoScrollable(-1, -1)).toBe(true);
        expect(selection._isAutoScrollable(0, 0)).toBe(false);
    });

    describe('getValuesToString', function() {
        var selection;

        beforeEach(function() {
            selection = create();
            selection.renderModel.getCellData = _.constant({});
        });

        it('현재 selection 범위에 대해  string 으로 반환한다.', function() {
            selection.start(0, 1);
            selection.update(2, 2);

            expect(selection.getValuesToString()).toEqual(
                '0-2\t0-3\n' +
                '1-2\t1-3\n' +
                '2-2\t2-3'
            );
        });

        it('if copyOptions.useFormattedValue is true, use formatted value', function() {
            selection.start(0, 1);
            selection.update(2, 2);
            selection.columnModel.set('copyOptions', {
                useFormattedValue: true
            });
            selection.renderModel = {
                getCellData: function(rowKey, columnName) {
                    var value = selection.dataModel.getValue(rowKey, columnName);

                    return {
                        formattedValue: '*' + value + '*'
                    };
                }
            };

            expect(selection.getValuesToString()).toEqual(
                '*0-2*\t*0-3*\n' +
                '*1-2*\t*1-3*\n' +
                '*2-2*\t*2-3*'
            );
        });

        it('if copyOptions.useFormattedValue is false, use the original value.', function() {
            selection.start(0, 1);
            selection.update(2, 2);
            selection.columnModel.set('copyOptions', {
                useFormattedValue: false
            });
            selection.renderModel = {
                getCellData: function(rowKey, columnName) {
                    var value = selection.dataModel.getValue(rowKey, columnName);

                    return {
                        formattedValue: '*' + value + '*'
                    };
                }
            };

            expect(selection.getValuesToString()).toEqual(
                '0-2\t0-3\n' +
                '1-2\t1-3\n' +
                '2-2\t2-3'
            );
        });

        it('if copyOptions.customValue set value, returns the custom value.', function() {
            selection.start(0, 1);
            selection.update(2, 2);
            selection.columnModel.set('copyOptions', {
                customValue: 'test'
            });
            selection.renderModel = {
                getCellData: function() {
                    return {
                        customValue: selection.columnModel.get('copyOptions').customValue
                    };
                }
            };

            expect(selection.getValuesToString()).toEqual(
                'test\ttest\n' +
                'test\ttest\n' +
                'test\ttest'
            );
        });

        it('if copyOptions.customValue and copyOptions.useFormattedValue options are used together, ' +
          'returns the custom value.', function() {
            selection.start(0, 1);
            selection.update(2, 2);
            selection.columnModel.set('copyOptions', {
                useFormattedValue: true,
                customValue: 'test'
            });
            selection.renderModel = {
                getCellData: function(rowKey, columnName) {
                    var value = selection.dataModel.getValue(rowKey, columnName);

                    return {
                        formattedValue: '*' + value + '*',
                        customValue: selection.columnModel.get('copyOptions').customValue
                    };
                }
            };

            expect(selection.getValuesToString()).toEqual(
                'test\ttest\n' +
                'test\ttest\n' +
                'test\ttest'
            );
        });
    });

    it('selectAll should set ranges for the entire cell except meta data', function() {
        var selection = create();

        selection.selectAll();
        expect(selection.get('range')).toEqual({
            row: [0, 2],
            column: [0, 3]
        });
    });

    describe('_adjustScroll', function() {
        var selection;

        beforeEach(function() {
            selection = create();
            selection.renderModel = new Model({
                scrollLeft: 0,
                scrollTop: 0,
                maxScrollLeft: 20,
                maxScrollTop: 20
            });
            selection.scrollPixelScale = 10;
        });

        it('첫번째 파라미터가 음수/양수이냐에 따라 scrollLeft 값을 scrollPixelScale 값만큼 증가/감소시킨다.', function() {
            selection._adjustScroll(1, 0);
            expect(selection.renderModel.get('scrollLeft')).toEqual(10);

            selection._adjustScroll(-1, 0);
            expect(selection.renderModel.get('scrollLeft')).toEqual(0);
        });

        it('두번째 파라미터가 음수/양수이냐에 따라 scrollTop 값을 scrollPixelScale 값만큼 증가/감소시킨다.', function() {
            selection._adjustScroll(0, 1);
            expect(selection.renderModel.get('scrollTop')).toEqual(10);

            selection._adjustScroll(0, -1);
            expect(selection.renderModel.get('scrollTop')).toEqual(0);
        });

        it('변경된 값은 0보다 커야 한다.', function() {
            selection._adjustScroll(-1, -1);
            expect(selection.renderModel.get('scrollLeft')).toEqual(0);
            expect(selection.renderModel.get('scrollTop')).toEqual(0);
        });

        it('변경된 값은 maxScrollTop, maxScrollLeft 보다 작아야 한다.', function() {
            selection.renderModel.set({
                maxScrollLeft: 5,
                maxScrollTop: 5
            });
            selection._adjustScroll(1, 1);
            expect(selection.renderModel.get('scrollLeft')).toEqual(5);
            expect(selection.renderModel.get('scrollTop')).toEqual(5);
        });
    });

    describe('_getRowSpannedIndex', function() {
        var selection;

        beforeEach(function() {
            selection = create([
                {
                    _extraData: {
                        rowSpan: {
                            c1: 2
                        }
                    },
                    c1: '1',
                    c2: '2',
                    c3: '3'
                },
                {
                    c2: '2',
                    c3: '3'
                },
                {
                    _extraData: {
                        rowSpan: {
                            c2: 2
                        }
                    },
                    c1: '1',
                    c2: '2',
                    c3: '3'
                },
                {
                    c1: '1',
                    c3: '3'
                }
            ]);
        });

        it('rowSpan이 없으면 그대로 반환한다.', function() {
            expect(selection._getRowSpannedIndex({
                row: [0, 1],
                column: [1, 2]
            })).toEqual({
                row: [0, 1],
                column: [1, 2]
            });
        });

        it('rowSpan이 있으면 적용된 셀렉션을 반환한다 - case1', function() {
            expect(selection._getRowSpannedIndex({
                row: [0, 0],
                column: [0, 1]
            })).toEqual({
                row: [0, 1],
                column: [0, 1]
            });
        });

        it('rowSpan이 있으면 적용된 셀렉션을 반환한다 - case2', function() {
            expect(selection._getRowSpannedIndex({
                row: [1, 2],
                column: [0, 2]
            })).toEqual({
                row: [0, 3],
                column: [0, 2]
            });
        });
    });

    describe('_extendColumnSelection', function() {
        var selection;

        beforeEach(function() {
            selection = create();

            selection.focusModel = {
                focusAt: _.noop
            };
            selection.dimensionModel = {
                getOverflowFromMousePosition: _.constant({
                    x: 0,
                    y: 0
                })
            };

            selection.selectColumn(2);
            selection.update(0, 3);
        });

        describe('when called with columnIndexes[0, 1]', function() {
            beforeEach(function() {
                selection.coordConverterModel = {
                    getIndexFromMousePosition: _.noop
                };
            });

            it('with minimumColumnRange, should extend column selection to [0, 3].', function() {
                spyOn(selection, '_resetRangeAttribute');
                selection.minimumColumnRange = [2, 3];
                selection._extendColumnSelection([0, 1], null, null);

                expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                    row: [0, 2],
                    column: [0, 3]
                });
            });

            it('without minimumColumnRange, should extend column selection to [1, 2].', function() {
                spyOn(selection, '_resetRangeAttribute');
                selection.minimumColumnRange = null;
                selection._extendColumnSelection([0, 1], null, null);

                expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                    row: [0, 2],
                    column: [0, 2]
                });
            });
        });

        describe('when called without columnIndexes(=null or undefined) and with cell index', function() {
            beforeEach(function() {
                selection.coordConverterModel = {
                    getIndexFromMousePosition: _.constant({
                        row: 0,
                        column: 1
                    })
                };
            });

            it('with minimumColumnRange, should extend column selection to [1, 3]', function() {
                spyOn(selection, '_resetRangeAttribute');
                selection.minimumColumnRange = [2, 3];
                selection._extendColumnSelection(null, null, null);

                expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                    row: [0, 2],
                    column: [1, 3]
                });
            });

            it('without minimumColumnRange, should extend column selection to [1, 2]', function() {
                spyOn(selection, '_resetRangeAttribute');
                selection.minimumColumnRange = null;
                selection._extendColumnSelection(null, null, null);

                expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                    row: [0, 2],
                    column: [1, 2]
                });
            });
        });
    });

    describe('start selection', function() {
        var selection;

        beforeEach(function() {
            selection = create();
            selection.focusModel = {
                focusAt: jasmine.createSpy()
            };
        });

        it('selectRow(rowKey)', function() {
            var columnModel = selection.columnModel;
            var range;

            selection.selectRow(0);
            range = selection.get('range');

            expect(range).toEqual({
                row: [0, 0],
                column: [0, columnModel.getVisibleColumns().length - 1]
            });
            expect(selection.focusModel.focusAt).toHaveBeenCalledWith(0, 0);
        });

        it('selectColumn(columnIdx)', function() {
            var dataModel = selection.dataModel;
            var range;

            selection.selectColumn(2);
            range = selection.get('range');

            expect(range).toEqual({
                row: [0, dataModel.length - 1],
                column: [2, 2]
            });

            expect(selection.focusModel.focusAt).toHaveBeenCalledWith(0, 2);
        });

        it('selectAll()', function() {
            var dataModel = selection.dataModel;
            var columnModel = selection.columnModel;
            var range;

            selection.selectAll();
            range = selection.get('range');

            expect(range).toEqual({
                row: [0, dataModel.length - 1],
                column: [0, columnModel.getVisibleColumns().length - 1]
            });
        });
    });
});
