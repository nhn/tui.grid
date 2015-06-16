'use strict';

describe('view.selection', function() {
    var grid,
        $empty;

    jasmine.getFixtures().fixturesPath = 'base/';
    loadFixtures('test/fixtures/empty.html');
    $empty = $('#empty');

    beforeEach(function() {
        grid = new Core({
            el: $empty,
            columnModelList: [
                {
                    title: 'c1',
                    columnName: 'c1',
                    width: 100
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    width: 150,
                    editOption: {
                        type: 'text'
                    }
                }, {
                    title: 'c3',
                    columnName: 'c3',
                    editOption: {
                        type: 'select',
                        list: [
                            {text: 'opt1', value: 1},
                            {text: 'opt2', value: 2},
                            {text: 'opt3', value: 3},
                            {text: 'opt4', value: 4}
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
            }, {
                _extraData: {
                    rowState: 'DISABLED'
                },
                c1: '1-1',
                c2: '1-2',
                c3: 2
            }, {
                c1: '2-1',
                c2: '2-2',
                c3: 3
            }
        ]);
    });

    afterEach(function() {
        grid.destroy();
    });

    describe('selection test', function() {
        var selection;

        beforeEach(function() {
            selection = grid.selection;
        });
        afterEach(function() {
            selection.destroy();
        });

        it('enable', function() {
            selection.enable();
            expect(selection.isEnable).toBe(true);
        });

        it('disable', function() {
            selection.endSelection = jasmine.createSpy('endSelection');

            selection.disable();
            expect(selection.isEnable).toBe(false);
            expect(selection.endSelection).toHaveBeenCalled();
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

        describe('_adjustScroll', function() {

        });

        describe('_getDistance', function() {
            it('피타고라스의 정리를 이용해 거리를 잘 구하는지 확인한다.', function() {
                var distance;

                selection.pageX = 10;
                selection.pageY = 10;
                distance = selection._getDistance({
                    pageX: 12,
                    pageY: 12
                });
                expect(distance).toBe(Math.round(Math.sqrt(8)));
            });
        });

        describe('_onMouseUp', function() {
            it('detachMouseEvent 를 호출하는지 확인한다.', function() {
                selection.detachMouseEvent = jasmine.createSpy('detachMouseEvent');
                selection._onMouseUp();
                expect(selection.detachMouseEvent).toHaveBeenCalled();
            });
        });

        describe('getSelectionToString', function() {
            it('현재 selection 범위에 대해  string 으로 반환한다.', function() {
                selection.startSelection(0, 2);
                selection.updateSelection(2, 3);
                expect(selection.getSelectionToString()).toEqual('' +
                '0-2	opt1\n' +
                '1-2	opt2\n' +
                '2-2	opt3'
                );
                selection.endSelection();
            });
        });

        describe('selectAll', function() {
            it('전체 영역을 선택한다', function() {
                selection.selectAll();
                expect(selection.getRange()).toEqual({row: [0, 2], column: [0, 3] });
            });
        });

        describe('_adjustScroll', function() {
            it('', function() {
                grid.renderModel.set({
                    maxScrollLeft: 10
                });
                expect(grid.renderModel.get('scrollLeft')).toEqual(0);
                selection._adjustScroll(1, 0);
                expect(grid.renderModel.get('scrollLeft')).toEqual(10);
                selection._adjustScroll(-1, 0);
                expect(grid.renderModel.get('scrollLeft')).toEqual(0)
            });
        });

        describe('getIndexFromMousePosition()', function() {
            // TODO: 구현
        });

        describe('_onMouseMove', function() {
            afterEach(function() {
                clearInterval(selection.intervalIdForAutoScroll);
            });

            describe('selection 이 있을경우', function() {
                beforeEach(function() {
                    selection.startSelection(0, 0);
                    selection.updateSelection(1, 1);
                });

                it('mousePosition 위치만큼 selection 을 넓힌다.', function() {
                    expect(selection.getRange()).toEqual({row: [0, 1], column: [0, 1]});
                    selection.getIndexFromMousePosition = function(pageX, pageY) {
                        return {
                            row: pageX,
                            column: pageY
                        };
                    };
                    selection._onMouseMove({
                        pageX: 2,
                        pageY: 2
                    });
                    expect(selection.getRange()).toEqual({row: [0, 2], column: [0, 2]});
                });
            });

            describe('selection 이 없을경우', function() {
                it('움직인 거리가 10보다 클 경우 selection 을 시작한다.', function() {
                    selection._getDistance = function() {
                        return 11;
                    };
                    selection._onMouseMove({
                        pageX: 100,
                        pageY: 200
                    });
                    expect(selection.hasSelection()).toBe(true);
                });

                it('움직인 거리가 10보다 작을 경우 selection 시작하지 않는다..', function() {
                    selection._getDistance = function () {
                        return 8;
                    };
                    selection._onMouseMove({
                        pageX: 100,
                        pageY: 200
                    });
                    expect(selection.hasSelection()).toBe(false);
                });
            });
        });
    });
});
