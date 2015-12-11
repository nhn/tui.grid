'use strict';

var Core = require('../../src/js/core');

describe('model/selection', function() {
    var grid, selection;

    beforeEach(function() {
        grid = new Core({
            el: setFixtures('<div />'),
            columnModelList: [
                {
                    title: 'c1',
                    columnName: 'c1',
                    width: 100
                },
                {
                    title: 'c2',
                    columnName: 'c2',
                    width: 150,
                    editOption: {
                        type: 'text'
                    }
                },
                {
                    title: 'c3',
                    columnName: 'c3',
                    editOption: {
                        type: 'select',
                        list: [
                            {
                                text: 'opt1',
                                value: 1
                            },
                            {
                                text: 'opt2',
                                value: 2
                            },
                            {
                                text: 'opt3',
                                value: 3
                            },
                            {
                                text: 'opt4',
                                value: 4
                            }
                        ]
                    }
                }
            ]
        });
        grid.setRowList([
            {
                c1: '0-1',
                c2: '0-2',
                c3: 1
            },
            {
                _extraData: {
                    rowState: 'DISABLED'
                },
                c1: '1-1',
                c2: '1-2',
                c3: 2
            },
            {
                c1: '2-1',
                c2: '2-2',
                c3: 3
            }
        ]);

        selection = grid.selectionModel;
    });

    afterEach(function() {
        grid.destroy();
    });

    describe('selection test', function() {
        it('enable', function() {
            selection.enable();

            expect(selection.isEnabled()).toBe(true);
        });

        it('disable', function() {
            spyOn(selection, 'end');
            selection.disable();

            expect(selection.isEnabled()).toBe(false);
            expect(selection.end).toHaveBeenCalled();

            selection.enable();
        });

        it('should not call start and update if disabled', function() {
            spyOn(selection, '_resetRangeAttribute');
            selection.disable();

            selection.start(0, 0);
            expect(selection._resetRangeAttribute).not.toHaveBeenCalled();

            selection.update(1, 1);
            expect(selection._resetRangeAttribute).not.toHaveBeenCalled();

            selection.enable();
        });

        describe('_isAutoScrollable()', function() {
            it('mouse move 이벤트 발생시 scroll 해야하는 영역에 pointer 가 위치하는지 확인한다.', function() {
                expect(selection._isAutoScrollable(1, 1)).toBe(true);
                expect(selection._isAutoScrollable(1, 0)).toBe(true);
                expect(selection._isAutoScrollable(0, 1)).toBe(true);
                expect(selection._isAutoScrollable(-1, 1)).toBe(true);
                expect(selection._isAutoScrollable(-1, 0)).toBe(true);
                expect(selection._isAutoScrollable(0, -1)).toBe(true);
                expect(selection._isAutoScrollable(-1, -1)).toBe(true);
                expect(selection._isAutoScrollable(0, 0)).toBe(false);
            });
        });

        describe('getValuesToString', function() {
            it('현재 selection 범위에 대해  string 으로 반환한다.', function() {
                selection.start(0, 1);
                selection.update(2, 2);
                expect(selection.getValuesToString()).toEqual('' +
                '0-2\topt1\n' +
                '1-2\topt2\n' +
                '2-2\topt3'
                );
                selection.end();
            });
        });

        describe('selectAll', function() {
            it('전체 영역을 선택한다. 메타컬럼은 range에서 제외된다.', function() {
                selection.selectAll();
                expect(selection.get('range')).toEqual({row: [0, 2], column: [0, 2]});
            });
        });

        describe('_adjustScroll', function() {
            beforeEach(function() {
                grid.renderModel.set({
                    maxScrollLeft: 20,
                    maxScrollTop: 20
                });
                selection.scrollPixelScale = 10;
            });

            it('첫번째 파라미터가 음수/양수이냐에 따라 scrollLeft 값을 scrollPixelScale 값만큼 증가/감소시킨다.', function() {
                selection._adjustScroll(1, 0);
                expect(grid.renderModel.get('scrollLeft')).toEqual(10);

                selection._adjustScroll(-1, 0);
                expect(grid.renderModel.get('scrollLeft')).toEqual(0);
            });

            it('두번째 파라미터가 음수/양수이냐에 따라 scrollTop 값을 scrollPixelScale 값만큼 증가/감소시킨다.', function() {
                selection._adjustScroll(0, 1);
                expect(grid.renderModel.get('scrollTop')).toEqual(10);

                selection._adjustScroll(0, -1);
                expect(grid.renderModel.get('scrollTop')).toEqual(0);
            });

            it('변경된 값은 0보다 커야 한다.', function() {
                selection._adjustScroll(-1, -1);
                expect(grid.renderModel.get('scrollLeft')).toEqual(0);
                expect(grid.renderModel.get('scrollTop')).toEqual(0);
            });

            it('변경된 값은 maxScrollTop, maxScrollLeft 보다 작아야 한다.', function() {
                grid.renderModel.set({
                    maxScrollLeft: 5,
                    maxScrollTop: 5
                });
                selection._adjustScroll(1, 1);
                expect(grid.renderModel.get('scrollLeft')).toEqual(5);
                expect(grid.renderModel.get('scrollTop')).toEqual(5);
            });
        });

        describe('_getRowSpannedIndex', function() {
            beforeEach(function() {
                grid.setRowList([
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

        describe('updateByMousePosition()', function() {
            beforeEach(function() {
                spyOn(grid.dimensionModel, 'getIndexFromMousePosition').and.returnValue({
                    row: 2,
                    column: 2
                });
                spyOn(grid.dimensionModel, 'getOverflowFromMousePosition').and.returnValue({
                    x: 0,
                    y: 0
                });
            });
            it('it should call the "setScrolling" method.', function() {
                spyOn(selection, '_setScrolling');

                selection.updateByMousePosition(2, 2);
                expect(selection._setScrolling).toHaveBeenCalled();
            });

            it('mousePosition 위치만큼 selection 을 넓힌다.', function() {
                selection.start(0, 0);
                selection.update(1, 1);

                selection.updateByMousePosition(2, 2);
                expect(selection.get('range')).toEqual({
                    row: [0, 2],
                    column: [0, 2]
                });
            });
        });

        describe('extendColumnSelection', function() {
            beforeEach(function() {
                selection.selectColumn(2);
                selection.update(0, 3);
                spyOn(grid.dimensionModel, 'getOverflowFromMousePosition').and.returnValue({
                    x: 0,
                    y: 0
                });
            });

            describe('when called with columnIndexes[0, 1]', function() {
                beforeEach(function() {
                    spyOn(grid.dimensionModel, 'getIndexFromMousePosition').and.stub();
                });
                it('with minimumColumnRange, should extend column selection to [0, 3].', function() {
                    spyOn(selection, '_resetRangeAttribute');
                    selection.setMinimumColumnRange([2, 3]);
                    selection.extendColumnSelection([0, 1], null, null);

                    expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                        row: [0, 0],
                        column: [0, 3]
                    });
                });

                it('without minimumColumnRange, should extend column selection to [1, 2].', function() {
                    spyOn(selection, '_resetRangeAttribute');
                    selection.unsetMinimumColumnRange();
                    selection.extendColumnSelection([0, 1], null, null);

                    expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                        row: [0, 0],
                        column: [0, 2]
                    });
                });
            });

            describe('when called without columnIndexes(=null or undefined) and with cell index', function() {
                it('with minimumColumnRange, should extend column selection to [1, 3]', function() {
                    spyOn(selection, '_resetRangeAttribute');
                    spyOn(grid.dimensionModel, 'getIndexFromMousePosition').and.returnValue({
                        row: 0,
                        column: 1
                    });
                    selection.setMinimumColumnRange([2, 3]);
                    selection.extendColumnSelection(undefined, null, null);

                    expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                        row: [0, 0],
                        column: [1, 3]
                    });
                });

                it('without minimumColumnRange, should extend column selection to [1, 2]', function() {
                    spyOn(selection, '_resetRangeAttribute');
                    spyOn(grid.dimensionModel, 'getIndexFromMousePosition').and.returnValue({
                        row: 0,
                        column: 1
                    });
                    selection.unsetMinimumColumnRange();
                    selection.extendColumnSelection(undefined, null, null);

                    expect(selection._resetRangeAttribute).toHaveBeenCalledWith({
                        row: [0, 0],
                        column: [1, 2]
                    });
                });
            });
        });

        describe('start selection', function() {
            it('selectRow(rowKey)', function() {
                var columnModel = grid.columnModel,
                    focused,
                    range;

                selection.selectRow(0);
                range = selection.get('range');
                focused = grid.focusModel.indexOf();

                expect(range).toEqual({
                    row: [0, 0],
                    column: [0, columnModel.getVisibleColumnModelList().length - 1]
                });
                expect(focused).toEqual({
                    row: 0,
                    column: 0
                });
            });

            it('selectColumn(columnIdx)', function() {
                var dataModel = grid.dataModel,
                    focused,
                    range;

                selection.selectColumn(2);
                range = selection.get('range');
                focused = grid.focusModel.indexOf();

                expect(range).toEqual({
                    row: [0, dataModel.length - 1],
                    column: [2, 2]
                });
                expect(focused).toEqual({
                    row: 0,
                    column: 2
                });
            });

            it('selectAll()', function() {
                var dataModel = grid.dataModel,
                    columnModel = grid.columnModel,
                    range;

                selection.selectAll();
                range = selection.get('range');

                expect(range).toEqual({
                    row: [0, dataModel.length - 1],
                    column: [0, columnModel.getVisibleColumnModelList().length - 1]
                });
            });
        });
    });
});
