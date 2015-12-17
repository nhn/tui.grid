'use strict';

var Core = require('../../src/js/core');
var DomState = require('../../src/js/domState');

describe('grid.normal.test', function() {
    var grid, timeoutDelay = 0;

    afterEach(function() {
        grid.destroy();
        grid = null;
    });

    beforeEach(function() {
        grid = createCore();
    });

    function createCore() {
        var $el = setFixtures('<div />'),
            domState = new DomState($el);

        var core = new Core({
            el: $el,
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
        }, domState);
        core.setRowList([
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

        return core;
    }

    it('setRowList()를 실행하면 dataModel이 설정된다.', function() {
        expect(grid.dataModel.length).toBe(3);
    });

    describe('getColumnValues()', function() {
        it('인자로 들어온 열에 대한 데이터를 배열로 반환한다.', function() {
            var values = grid.dataModel.getColumnValues('c2');
            expect(values.length).toBe(3);
            expect(values[0]).toBe('0-2');
            expect(values[1]).toBe('1-2');
            expect(values[2]).toBe('2-2');
        });

        it('인자로 들어온 열에 대한 데이터를 json 스트링으로 반환한다.', function() {
            var values = grid.dataModel.getColumnValues('c1'),
                valuesJSON = grid.dataModel.getColumnValues('c1', true);

            expect($.toJSON(values)).toBe(valuesJSON);
        });
    });

    // todo: core 에서 제거해야 할 듯
    // describe('getelement()', function() {
    //     beforeeach(function(done) {
    //         settimeout(function() {
    //             done();
    //         }, timeoutdelay);
    //     });
    //
    //     it('rowkey 와 columnname 에 해당하는 element 를 반환한다.', function() {
    //         var $el;
    //         $el = grid.getelement(0, 'c1');
    //         expect($el.closest('td').attr('columnname')).tobe('c1');
    //         expect($el.closest('tr').attr('key')).tobe('0');
    //     });
    // });

    describe('focusModel 위임 함수', function() {
        it('select()', function() {
            spyOn(grid.focusModel, 'select');
            grid.select(1);
            expect(grid.focusModel.select).toHaveBeenCalledWith(1);
        });

        it('unselect()', function() {
            spyOn(grid.focusModel, 'unselect');
            grid.unselect();
            expect(grid.focusModel.unselect).toHaveBeenCalled();
        });

        it('focus()', function() {
            spyOn(grid.focusModel, 'focus');
            grid.focus(0, 'c1', true);
            expect(grid.focusModel.focus).toHaveBeenCalledWith(0, 'c1', true);
        });

        it('blur()', function() {
            spyOn(grid.focusModel, 'blur');
            grid.blur();
            expect(grid.focusModel.blur).toHaveBeenCalled();
        });

        it('focusAt()', function() {
            spyOn(grid.focusModel, 'focus');
            grid.focusAt(0, 0, true);
            expect(grid.focusModel.focus).toHaveBeenCalledWith(0, 'c1', true);
        });
    });

    describe('getSelectedRowKey()', function() {
        it('select 된 rowKey 를 반환한다.', function() {
            grid.select(1);
            expect(grid.getSelectedRowKey()).toBe(1);
            grid.unselect();
            expect(grid.getSelectedRowKey()).toBeNull();
        });
    });

    describe('focusIn()', function() {
        var instance;

        it('editable한 column일 경우 cellInstance의 focusIn을 호출한다.', function() {
            instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('c1'));
            spyOn(instance, 'focusIn');
            grid.focusIn(0, 'c1');
            expect(instance.focusIn).toHaveBeenCalled();
        });

        it('editable하지 않을경우 focusClipboard를 호출한다.', function() {
            spyOn(grid, 'focusClipboard');
            instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('c1'));
            spyOn(instance, 'focusIn');
            grid.focusIn(1, 'c3');
            expect(instance.focusIn).not.toHaveBeenCalled();
            expect(grid.focusClipboard).toHaveBeenCalled();
        });
    });

    // c1, c2는 editable column, 렌더링 이후에 (setTimeout(fn, 0)) 확인 가능.:
    describe('focusInAt()', function() {
        it('주어진 인덱스에 해당하는 셀의 키와 컬럼명으로 focus()를 호출한다.', function() {
            spyOn(grid, 'focus');
            grid.focusInAt(0, 2, true);
            expect(grid.focus).toHaveBeenCalledWith(0, 'c3', true);
        });
    });

    describe('clear()', function() {
        it('등록된 행 데이터를 모두 삭제한다.', function() {
            grid.clear();
            expect(grid.dataModel.length).toBe(0);
        });
    });

    // describe('removeCheckedRows()', function() {
    //     it('체크된 행들을 삭제한다.', function() {
    //         grid.dataModel.check(1);
    //         grid.dataModel.check(2);
    //         grid.removeCheckedRows();
    //
    //         expect(grid.dataModel.getRowData(1)).toBeNull();
    //         expect(grid.dataModel.getRowData(2)).toBeNull();
    //         expect(grid.dataModel.length).toBe(1);
    //     });
    //
    //     describe('true를 파라미터로 넘기면 confirm메시지를 출력한다.', function() {
    //         beforeEach(function() {
    //             spyOn(window, 'confirm').and.callFake(function() {
    //                 return true;
    //             });
    //         });
    //
    //         it('삭제될 행이 있을 때에만 confirm메시지를 출력한다.', function() {
    //             grid.removeCheckedRows(true);
    //             expect(window.confirm).not.toHaveBeenCalled();
    //
    //             grid.dataModel.check(1);
    //             grid.removeCheckedRows(true);
    //             expect(window.confirm).toHaveBeenCalled();
    //         });
    //
    //         it('confirm이 true를 반환하면 삭제된다.', function() {
    //             expect(grid.dataModel.getRowData(1)).not.toBeNull();
    //             grid.dataModel.check(1);
    //             grid.removeCheckedRows(true);
    //             expect(grid.dataModel.getRowData(1)).toBeNull();
    //         });
    //
    //         it('confirm이 false를 반환하면 삭제되지 않는다.', function() {
    //             window.confirm.and.callFake(function() {
    //                 return false;
    //             });
    //             expect(grid.dataModel.getRowData(1)).not.toBeNull();
    //             grid.dataModel.check(1);
    //             grid.removeCheckedRows(true);
    //             expect(grid.dataModel.getRowData(1)).not.toBeNull();
    //         });
    //     });
    // });

    // describe('check된 행 관련', function() {
    //     beforeEach(function() {
    //         grid.dataModel.check(0);
    //         grid.dataModel.check(2);
    //     });
    //
    //     describe('getCheckedRowKeyList()', function() {
    //         it('check된 행의 rowKey 목록을 반환한다.', function() {
    //             expect(grid.getCheckedRowKeyList()).toEqual([0, 2]);
    //         });
    //
    //         it('check된 행의 rowKey 목록을 json 문자열로 반환한다.', function() {
    //             expect(grid.getCheckedRowKeyList(true)).toBe($.toJSON([0, 2]));
    //         });
    //     });
    //
    //     describe('getCheckedRowList()', function() {
    //         it('check된 행의 목록을 반환한다.', function() {
    //             var rowList = grid.getCheckedRowList();
    //             expect(rowList[0].rowKey).toBe(0);
    //             expect(rowList[1].rowKey).toBe(2);
    //             expect(rowList.length).toBe(2);
    //         });
    //
    //         it('check된 행의 목록을 json 문자열로 반환한다.', function() {
    //             expect(grid.getCheckedRowList(true)).toBe($.toJSON(grid.getCheckedRowList()));
    //         });
    //     });
    // });

    describe('getColumnModelList()', function() {
        it('columnModel의 columnModelList 값을 반환한다.', function() {
            spyOn(grid.columnModel, 'get');
            grid.getColumnModelList();
            expect(grid.columnModel.get).toHaveBeenCalledWith('dataColumnModelList');
        });
    });

    describe('getModifiedRowList()', function() {
        it('dataModel.getModifiedRowList()를 호출한다.', function() {
            var options = {
                isOnlyChecked: false,
                isOnlyRowKeyList: true
            };
            spyOn(grid.dataModel, 'getModifiedRowList');
            grid.getModifiedRowList(options);
            expect(grid.dataModel.getModifiedRowList).toHaveBeenCalledWith(options);
        });
    });

    describe('isChanged()', function() {
        it('변경사항이 없을때 false 를 반환한다.', function() {
            expect(grid.isChanged()).toBe(false);
        });

        it('데이터가 append 추가되었을때 변경사항을 감지한다.', function() {
            grid.dataModel.append({
                c1: '3-1',
                c2: '3-2',
                c3: '3-3'
            });
            expect(grid.isChanged()).toBe(true);
        });

        it('데이터가 prepend 추가되었을때 변경사항을 감지한다.', function() {
            grid.dataModel.prepend({
                c1: '3-1',
                c2: '3-2',
                c3: '3-3'
            });
            expect(grid.isChanged()).toBe(true);
        });

        it('데이터가 remove 되었을때 변경사항을 감지한다.', function() {
            grid.dataModel.removeRow(2);
            expect(grid.isChanged()).toBe(true);
        });

        it('데이터가 변경 되었을때 변경사항을 감지한다.', function() {
            grid.dataModel.setValue(0, 'c1', 'New0-1');
            expect(grid.isChanged()).toBe(true);
        });
    });

    describe('restore()', function() {
        beforeEach(function() {
            grid.dataModel.append({
                c1: '3-1',
                c2: '3-2',
                c3: '3-3'
            });
            grid.dataModel.prepend({
                c1: '4-1',
                c2: '4-2',
                c3: '4-3'
            });
            grid.dataModel.removeRow(2);
            grid.dataModel.setValue(0, 'c1', 'New0-1');
        });

        it('변경후 restore 하면 원상태로 돌아오는지 확인한다.', function() {
            expect(grid.isChanged()).toBe(true);
            grid.restore();
            expect(grid.isChanged()).toBe(false);
        });
    });

    describe('isEditable()', function() {
        it('주어진 rowKey에 해당하는 행의 isEditable()을 컬럼명과 함께 호출한다.', function() {
            var row = grid.dataModel.get(1);
            spyOn(row, 'isEditable');
            grid.isEditable(1, 'c2');
            expect(row.isEditable).toHaveBeenCalledWith('c2');
        });

        it('인자가 없으면 현재 focus된 행의 isEditable()을 컬럼명과 함께 호출한다.', function() {
            var row = grid.dataModel.get(0);
            grid.focus(0, 'c1');
            spyOn(row, 'isEditable');
            grid.isEditable();
            expect(row.isEditable).toHaveBeenCalledWith('c1');
        });
    });

    describe('isDisabled()', function() {
        it('주어진 rowKey에 해당하는 행의 isDisabled()을 컬럼명과 함께 호출한다.', function() {
            var row = grid.dataModel.get(1);
            spyOn(row, 'isDisabled');
            grid.isDisabled(1, 'c2');
            expect(row.isDisabled).toHaveBeenCalledWith('c2');
        });

        it('인자가 없으면 현재 focus된 행의 isDisabled()를 컬럼명과 함께 호출한다.', function() {
            var row = grid.dataModel.get(0);
            grid.focus(0, 'c1');
            spyOn(row, 'isDisabled');
            grid.isDisabled();
            expect(row.isDisabled).toHaveBeenCalledWith('c1');
        });
    });

    describe('getCellState()', function() {
        it('주어진 rowKey에 해당하는 행의 row.getCellState()을 호출한다.', function() {
            var row = grid.dataModel.get(1);
            spyOn(row, 'getCellState');
            grid.getCellState(1, 'c2');
            expect(row.getCellState).toHaveBeenCalledWith('c2');
        });

        it('인자가 없으면 현재 focus된 위치의 row.getCellState()을 호출한다.', function() {
            var row = grid.dataModel.get(0);
            grid.focus(0, 'c1');
            spyOn(row, 'getCellState');
            grid.getCellState();
            expect(row.getCellState).toHaveBeenCalledWith('c1');
        });
    });

    describe('del()', function() {
        it('editable 하고, disabled 하지 않은 cell만 삭제한다.', function() {
            grid.del(0, 'c1');
            grid.del(0, 'c3');
            expect(grid.dataModel.getValue(0, 'c1')).toBe('');
            expect(grid.dataModel.getValue(0, 'c3')).toBe('0-3');

            grid.del(1, 'c1');
            grid.del(1, 'c2');
            expect(grid.dataModel.getValue(1, 'c1')).toBe('1-1');
            expect(grid.dataModel.getValue(1, 'c2')).toBe('1-2');
        });
    });
});
