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
        core.dataModel.setRowList([
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

    // describe('focusIn()', function() {
    //     var instance;
    //
    //     it('editable한 column일 경우 cellInstance의 focusIn을 호출한다.', function() {
    //         instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('c1'));
    //         spyOn(instance, 'focusIn');
    //         grid.focusIn(0, 'c1');
    //         expect(instance.focusIn).toHaveBeenCalled();
    //     });
    //
    //     it('editable하지 않을경우 focusClipboard를 호출한다.', function() {
    //         spyOn(grid, 'focusClipboard');
    //         instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('c1'));
    //         spyOn(instance, 'focusIn');
    //         grid.focusIn(1, 'c3');
    //         expect(instance.focusIn).not.toHaveBeenCalled();
    //         expect(grid.focusClipboard).toHaveBeenCalled();
    //     });
    // });

    // c1, c2는 editable column, 렌더링 이후에 (setTimeout(fn, 0)) 확인 가능.:
    // describe('focusInAt()', function() {
    //     it('주어진 인덱스에 해당하는 셀의 키와 컬럼명으로 focus()를 호출한다.', function() {
    //         spyOn(grid, 'focus');
    //         grid.focusInAt(0, 2, true);
    //         expect(grid.focus).toHaveBeenCalledWith(0, 'c3', true);
    //     });
    // });


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
});
