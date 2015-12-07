'use strict';

var Core = require('../../src/js/core');

describe('view.clipboard', function() {
    var grid,
        $empty,
        timeoutDelay = 0;

    function getKeyEvent(keyName, $target) {
        $target = $target || $('<div>');
        return {
            keyCode: grid.keyMap[keyName],
            which: grid.keyMap[keyName],
            target: $target.get(0),
            preventDefault: function() {}
        };
    }

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
                    editOption: {
                        type: 'text'
                    }
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    editOption: {
                        type: 'text'
                    }
                }, {
                    title: 'c3',
                    columnName: 'c3'
                }
            ],
            selectType: 'checkbox'
        });
        grid.setRowList([
            {
                c1: '0-1',
                c2: '0-2',
                c3: '0-3'
            }, {
                _extraData: {
                    rowState: 'DISABLED'
                },
                c1: '1-1',
                c2: '1-2',
                c3: '1-3'
            }, {
                c1: '2-1',
                c2: '2-2',
                c3: '2-3'
            }
        ]);
    });

    afterEach(function() {
        grid.destroy();
    });

    describe('clipboard test', function() {
        var clipboard;
        beforeEach(function() {
            clipboard = grid.view.clipboard;
        });
        describe('_onKeyDown', function() {
            var keyEvent;
            beforeEach(function() {
                clipboard._keyInWithShiftAndCtrl = jasmine.createSpy('_keyInWithShiftAndCtrl');
                clipboard._keyInWithShift = jasmine.createSpy('_keyInWithShift');
                clipboard._keyInWithCtrl = jasmine.createSpy('_keyInWithCtrl');
                clipboard._keyIn = jasmine.createSpy('_keyIn');
            });

            it('상황에 따라 알맞은 메서드를 호출하는지 확인한다.', function() {
                keyEvent = getKeyEvent('ENTER');
                keyEvent.shiftKey = true;
                keyEvent.metaKey = true;
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyInWithShiftAndCtrl).toHaveBeenCalled();

                clipboard._unlock();
                keyEvent = getKeyEvent('ENTER');
                keyEvent.shiftKey = true;
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyInWithShift).toHaveBeenCalled();

                clipboard._unlock();
                keyEvent = getKeyEvent('ENTER');
                keyEvent.ctrlKey = true;
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyInWithCtrl).toHaveBeenCalled();

                clipboard._unlock();
                keyEvent = getKeyEvent('ENTER');
                keyEvent.metaKey = true;
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyInWithCtrl).toHaveBeenCalled();

                clipboard._unlock();
                keyEvent = getKeyEvent('ENTER');
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyIn).toHaveBeenCalled();
            });

            it('lock 이 걸리면 호출되지 않는지 확인한다..', function() {
                clipboard._lock();
                keyEvent = getKeyEvent('ENTER');
                clipboard._onKeyDown(keyEvent);
                expect(clipboard._keyIn).not.toHaveBeenCalled();
            });
        });

        describe('_keyIn', function() {
            var keyEvent;

            beforeEach(function() {
                grid.focus(0, 'c1');
                grid.focus = jasmine.createSpy('focus');
                grid.focusIn = jasmine.createSpy('focusIn');
                clipboard._onEnterSpace = jasmine.createSpy('_onEnterSpace');
                clipboard._del = jasmine.createSpy('_del');
            });

            it('focusIn 를 호출하는 키는 focusIn 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('TAB');
                clipboard._keyIn(keyEvent);
                expect(grid.focusIn.calls.count()).toBe(1);
            });

            it('_del 를 호출하는 키는 _del 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('DEL');
                clipboard._keyIn(keyEvent);
                expect(clipboard._del.calls.count()).toBe(1);
            });

            it('_onEnterSpace 를 호출하는 키는 _onEnterSpace 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('ENTER');
                clipboard._keyIn(keyEvent);
                expect(clipboard._onEnterSpace.calls.count()).toBe(1);

                clipboard._unlock();
                keyEvent = getKeyEvent('SPACE');
                clipboard._keyIn(keyEvent);
                expect(clipboard._onEnterSpace.calls.count()).toBe(2);
            });

            it('focus 를 호출하는 키는 focus를 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('UP_ARROW');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(1);

                clipboard._unlock();
                keyEvent = getKeyEvent('DOWN_ARROW');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(2);

                clipboard._unlock();
                keyEvent = getKeyEvent('LEFT_ARROW');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(3);

                clipboard._unlock();
                keyEvent = getKeyEvent('RIGHT_ARROW');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(4);

                clipboard._unlock();
                keyEvent = getKeyEvent('PAGE_DOWN');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(5);

                clipboard._unlock();
                keyEvent = getKeyEvent('PAGE_UP');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(6);

                clipboard._unlock();
                keyEvent = getKeyEvent('HOME');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(7);

                clipboard._unlock();
                keyEvent = getKeyEvent('END');
                clipboard._keyIn(keyEvent);
                expect(grid.focus.calls.count()).toBe(8);
            });
        });

        describe('_getIndexBeforeMove', function() {
            it('In defect of selection range, It will return focused index', function() {
                var index;

                grid.focusAt(0, 0);
                index = clipboard._getIndexBeforeMove();
                expect(index).toEqual({
                    row: 0,
                    column: 0
                });
            });

            it('In selection range, It will return selection index', function() {
                var index;
                grid.focusAt(0, 0);
                grid.selectionModel.update(1, 1, 'cell');
                index = clipboard._getIndexBeforeMove();

                expect(index).toEqual({
                    row: 1,
                    column: 1
                });
            });
        });

        describe('_keyInWithShift', function() {
            var keyEvent;

            beforeEach(function() {
                grid.focusAt(1, 1);
                grid.focusIn = jasmine.createSpy('focusIn');
                clipboard._updateSelectionByKeyIn = jasmine.createSpy('_updateSelectionByKeyIn');
            });

            it('focusIn 를 호출하는 키는 focusIn 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('TAB');
                clipboard._keyInWithShift(keyEvent);
                expect(grid.focusIn.calls.count()).toBe(1);
            });

            describe('_updateSelectionByKeyIn 를 호출하는 키는 _updateSelectionByKeyIn를 올바르게 호출하는지 확인한다.', function() {
                it('ARROW keys', function() {
                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('UP_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(0, 1);

                    clipboard._updateSelectionByKeyIn.calls.reset();

                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('DOWN_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(2, 1);

                    clipboard._updateSelectionByKeyIn.calls.reset();

                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('LEFT_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(1, 0);

                    clipboard._updateSelectionByKeyIn.calls.reset();

                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('RIGHT_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(1, 2);
                });

                it('PAGE-UP/DOWN', function() {
                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('PAGE_DOWN');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(2, 1);

                    clipboard._updateSelectionByKeyIn.calls.reset();

                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('PAGE_UP');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(0, 1);
                });

                it('HOME/END', function() {
                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('HOME');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(1, 0);

                    clipboard._updateSelectionByKeyIn.calls.reset();

                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('END');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).toHaveBeenCalledWith(1, 2);
                });

                it('ENTER', function() {
                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('ENTER');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).not.toHaveBeenCalled();
                });

                it('unknown keys', function() {
                    grid.focusAt(1, 1);
                    keyEvent = getKeyEvent('unknown');
                    clipboard._keyInWithShift(keyEvent);
                    expect(clipboard._updateSelectionByKeyIn).not.toHaveBeenCalled();
                });
            });

            describe('with scrolling', function() {
                beforeEach(function() {
                    spyOn(grid.focusModel, 'getScrollPosition').and.returnValue({
                        scrollLeft: 1,
                        scrollTop: 1
                    });
                    spyOn(grid.renderModel, 'set');
                });

                afterEach(function() {
                    grid.focusModel.getScrollPosition.calls.reset();
                    grid.renderModel.set.calls.reset();
                });

                it('if selection state is "column", should set a scrollPosition to render model without scrollTop', function() {
                    var scrollPosition = {
                        asymmetricMatch: function(actual) {
                            return actual && actual.scrollLeft && !actual.scrollTop
                        }
                    };
                    grid.focusAt(1, 1);
                    grid.selectionModel.setState('column');

                    keyEvent = getKeyEvent('DOWN_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(grid.renderModel.set).toHaveBeenCalledWith(scrollPosition);
                });

                it('if selection state is "row", should set a scrollPosition to render model without scrollLeft', function() {
                    var scrollPosition = {
                        asymmetricMatch: function(actual) {
                            return actual && actual.scrollTop && !actual.scrollLeft
                        }
                    };
                    grid.focusAt(1, 1);
                    grid.selectionModel.setState('row');

                    keyEvent = getKeyEvent('DOWN_ARROW');
                    clipboard._keyInWithShift(keyEvent);
                    expect(grid.renderModel.set).toHaveBeenCalledWith(scrollPosition);
                });
            });
        });

        describe('_keyInWithCtrl', function() {
            var keyEvent;

            beforeEach(function() {
                grid.focus(0, 'columnName1');
                grid.focus = jasmine.createSpy('focus');
                grid.selectionModel.selectAll = jasmine.createSpy('selectAll');
                clipboard._copyToClipboard = jasmine.createSpy('_copyToClipboard');
            });

            it('selectAll 를 호출하는 키는 selectAll 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('CHAR_C');
                clipboard._keyInWithCtrl(keyEvent);
                expect(clipboard._copyToClipboard.calls.count()).toBe(1);
            });

            it('selectAll 를 호출하는 키는 selectAll 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('CHAR_A');
                clipboard._keyInWithCtrl(keyEvent);
                expect(grid.selectionModel.selectAll.calls.count()).toBe(1);
            });

            it('focus 를 호출하는 키는 focus 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('HOME');
                clipboard._keyInWithCtrl(keyEvent);
                expect(grid.focus.calls.count()).toBe(1);

                clipboard._unlock();
                keyEvent = getKeyEvent('END');
                clipboard._keyInWithCtrl(keyEvent);
                expect(grid.focus.calls.count()).toBe(2);
            });
        });

        describe('_keyInWithShiftAndCtrl', function() {
            var keyEvent;

            beforeEach(function() {
                grid.focus(0, 'columnName1');
                clipboard._updateSelectionByKeyIn = jasmine.createSpy('_updateSelectionByKeyIn');
            });

            it('focus를 호출하는 키는 focus 호출하는지 확인한다.', function() {
                clipboard._unlock();
                keyEvent = getKeyEvent('HOME');
                clipboard._keyInWithShiftAndCtrl(keyEvent);
                expect(clipboard._updateSelectionByKeyIn.calls.count()).toBe(1);

                clipboard._unlock();
                keyEvent = getKeyEvent('END');
                clipboard._keyInWithShiftAndCtrl(keyEvent);
                expect(clipboard._updateSelectionByKeyIn.calls.count()).toBe(2);
            });
        });

        describe('_del', function() {
            beforeEach(function() {
                grid.focus(0, 'columnName1');
                grid.del = jasmine.createSpy('del');
            });

            it('selection 이 선택되어 있다면 grid의 del 을 선택된 만큼 삭제하는지 확인한다.', function() {
                grid.selectionModel.start(0, 0);
                grid.selectionModel.update(2, 2);

                clipboard._del();
                expect(grid.del.calls.count()).toEqual(9);
            });

            it('아니라면 한번 호출한 것을 확인한다.', function() {
                clipboard._del();
                expect(grid.del.calls.count()).toEqual(1);
            });
        });

        describe('_updateSelectionByKeyIn', function() {
            beforeEach(function() {
                grid.focus(0, 'c1');
                grid.del = jasmine.createSpy('del');
            });

            it('Check focused index is remaining during selection', function() {
                grid.selectionModel.start(0, 0, 'cell');
                grid.selectionModel.update(3, 3);
                expect(grid.focusModel.which()).toEqual({rowKey: 0, columnName: 'c1'});
            });

            it('getRange()의 값이 변경되는지 확인한다.', function() {
                grid.selectionModel.start(0, 0, 'cell');
                clipboard._updateSelectionByKeyIn(2, 1);
                expect(grid.selectionModel.get('range')).toEqual({row: [0, 2], column: [0, 1]});
            });

            it('selection이 선택되어 있지 않으면 selection start을 호출한다', function() {
                spyOn(grid.selectionModel, 'start').and.callFake(function() {
                    grid.selectionModel.inputRange = {
                        row: [2, 2],
                        column: [1, 1]
                    }
                });
                clipboard._updateSelectionByKeyIn(2, 1);
                expect(grid.selectionModel.start).toHaveBeenCalledWith(0, 0, undefined);
            });
        });

        describe('_getClipboardString', function() {
            beforeEach(function() {
                grid.focus(0, 'c1');
            });

            it('selection 이 선택되어 있다면 grid.selection.getValuesToString 을 호출한다', function() {
                grid.selectionModel.start(0, 0);
                grid.selectionModel.update(2, 2);
                grid.selectionModel.getValuesToString = jasmine.createSpy('getValuesToString');
                clipboard._getClipboardString();
                expect(grid.selectionModel.getValuesToString).toHaveBeenCalled();
            });

            it('아니라면 현재 focus된 컬럼의 내용만 리턴한다.', function() {
                var str = clipboard._getClipboardString();
                expect(str).toBe('0-1');
            });
        });

        describe('_onEnterSpace', function() {
            beforeEach(function(done) {
                setTimeout(function() {
                    done();
                }, timeoutDelay);
            });

            it('아니라면 focusIn 을 호출한다..', function() {
                grid.focusIn = jasmine.createSpy('focusIn');
                clipboard._onEnterSpace(0, 'c1');
                expect(grid.focusIn).toHaveBeenCalled();
            });
        });

        describe('_onBlur', function() {
            it('Call deffered function of the grid.refreshFocusState()', function() {
                jasmine.clock().install();

                spyOn(grid, 'refreshFocusState')
                clipboard._onBlur();

                expect(grid.refreshFocusState).not.toHaveBeenCalled();
                jasmine.clock().tick(1);
                expect(grid.refreshFocusState).toHaveBeenCalled();

                jasmine.clock().uninstall();
            });
        });

        describe('focus', function() {
            it('Focus on the $el and call grid.refreshFocusState()', function() {
                var focused = false;

                spyOn(grid, 'refreshFocusState');
                clipboard.$el.focus(function() {
                    focused = true;
                });

                clipboard.focus();
                expect(grid.refreshFocusState).toHaveBeenCalled();
                expect(focused).toBe(true);
            });
        });
    });
});
