'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var GridEvent = require('event/gridEvent');

var classNameConst = require('common/classNameConst');

describe('Data.RowList - simple', function() {
    var columns = [
        {
            name: 'c1',
            title: 'c1',
            editOptions: {
                type: 'text'
            }
        }, {
            name: 'c2',
            title: 'c2',
            editOptions: {
                type: 'text'
            }
        }
    ];
    var rowList, columnModel;

    beforeEach(function() {
        columnModel = new ColumnModelData();
        columnModel.set({
            rowHeaders: ['checkbox'],
            columns: columns
        });
        rowList = new RowListData([], {
            columnModel: columnModel
        });
        rowList.setData([
            {
                c1: '0-1',
                c2: '0-2'
            },
            {
                c1: '1-1',
                c2: '1-2'
            }
        ]);
    });

    describe('getRowData()', function() {
        it('주어진 rowKey에 해당하는 행의 데이터를 object로 반환한다.', function() {
            var rowData = rowList.getRowData(0);
            expect(rowData).toEqual(rowList.get(0).toJSON());
        });

        it('두번째 파라미터가 true이면 json문자열 형태로 반환한다.', function() {
            var rowData = rowList.getRowData(0);
            var rowDataJSON = rowList.getRowData(0, true);

            expect(JSON.stringify(rowData)).toEqual(rowDataJSON);
        });
    });

    describe('getRowDataAt()', function() {
        it('주어진 index에 해당하는 행의 데이터를 object로 반환한다.', function() {
            var rowData = rowList.getRowDataAt(0);
            expect(rowData).toEqual(rowList.at(0).toJSON());
        });

        it('두번째 파라미터가 true이면 json문자열 형태로 반환한다.', function() {
            expect(JSON.stringify(rowList.getRowDataAt(0))).toBe(rowList.getRowDataAt(0, true));
        });
    });

    describe('getValue(), setValue()', function() {
        it('getValue 는 값을 잘 가져온다.', function() {
            expect(rowList.getValue(0, 'c1')).toBe('0-1');
        });

        it('setValue 이후 getValue 의 isOriginal 을 true 로 설정시 original 데이터를 반환한다.', function() {
            rowList.setValue(0, 'c1', 'New0-1');
            expect(rowList.getValue(0, 'c1')).toBe('New0-1');
            expect(rowList.getValue(0, 'c1', true)).toBe('0-1');
        });
    });

    describe('disableRow(), enableRow()', function() {
        it('rowState의 disabled 속성을 변경한다.', function() {
            var row = rowList.get(0);
            expect(row.getRowState().disabled).toBe(false);

            rowList.disableRow(0);
            expect(row.getRowState().disabled).toBe(true);

            rowList.enableRow(0);
            expect(row.getRowState().disabled).toBe(false);
        });
    });

    describe('setDisabled()', function() {
        var triggered;

        beforeEach(function() {
            triggered = false;
            rowList.on('disabledChanged', function() {
                triggered = true;
            });
        });

        it('sets disabled', function() {
            rowList.disabled = false;
            rowList.setDisabled(true);
            expect(rowList.disabled).toBe(true);

            rowList.setDisabled(false);
            expect(rowList.disabled).toBe(false);
        });

        it('if disabled is changed, trigger disabledChanged event', function() {
            rowList.disabled = false;
            rowList.setDisabled(true);
            expect(triggered).toBe(true);
        });

        it('if disabled is not changed, does not trigger disabledChanged event', function() {
            rowList.disabled = true;
            rowList.setDisabled(true);
            expect(triggered).toBe(false);
        });
    });

    describe('checkAll()', function() {
        it('disabled 상태를 제외한 모든 행의 _button컬럼을 true로 설정한다.', function() {
            rowList.disableRow(0);
            rowList.checkAll();
            expect(rowList.get(0).get('_button')).toBe(false);
            expect(rowList.get(1).get('_button')).toBe(true);
        });
    });

    describe('uncheckAll()', function() {
        it('모든 행의 _button컬럼을 false로 설정한다. ', function() {
            rowList.checkAll();
            rowList.uncheckAll();
            rowList.forEach(function(row) {
                expect(row.get('_button')).toBe(false);
            }, this);
        });
    });

    describe('disableCheck()', function() {
        it('disableCheck 되는지 확인한다.', function() {
            rowList.disableCheck(0);
            expect(rowList.get(0).getRowState().disabledCheck).toBe(true);
        });
    });

    describe('enableCheck()', function() {
        it('enableCheck 되는지 확인한다.', function() {
            rowList.disableCheck(0);
            rowList.enableCheck(0);
            expect(rowList.get(0).getRowState().disabledCheck).toBe(false);
        });
    });

    describe('getColumnValues()', function() {
        it('인자로 들어온 열에 대한 데이터를 배열로 반환한다.', function() {
            var values = rowList.getColumnValues('c2');
            expect(values.length).toBe(2);
            expect(values[0]).toBe('0-2');
            expect(values[1]).toBe('1-2');
        });

        it('인자로 들어온 열에 대한 데이터를 json 스트링으로 반환한다.', function() {
            var values = rowList.getColumnValues('c1');
            var valuesJSON = rowList.getColumnValues('c1', true);

            expect(JSON.stringify(values)).toBe(valuesJSON);
        });
    });

    describe('setColumnValues()', function() {
        it('인자로 들어온 열에 대한 데이터를 전부 변경한다.', function() {
            rowList.disableRow(1);
            rowList.setColumnValues('c1', 'changed');
            expect(rowList.getValue(0, 'c1')).toBe('changed');
            expect(rowList.getValue(1, 'c1')).toBe('1-1'); // disabled
        });

        it('isCheckCellState를 false 로 넘겼을 경우 열에 대한 데이터 모두를 상태에 관계없이 변경한다.', function() {
            rowList.setColumnValues('c1', 'changed', false);
            expect(rowList.getValue(0, 'c1')).toBe('changed');
            expect(rowList.getValue(1, 'c1')).toBe('changed');
        });
    });

    describe('isModified()', function() {
        it('변경사항이 없을때 false 를 반환한다.', function() {
            expect(rowList.isModified()).toBe(false);
        });

        it('데이터가 append 추가되었을때 변경사항을 감지한다.', function() {
            rowList.append({
                c1: '2-1',
                c2: '2-2'
            });
            expect(rowList.isModified()).toBe(true);
        });

        it('데이터가 remove 되었을때 변경사항을 감지한다.', function() {
            rowList.removeRow(1);
            expect(rowList.isModified()).toBe(true);
        });

        it('데이터가 변경 되었을때 변경사항을 감지한다.', function() {
            rowList.setValue(0, 'c1', 'New0-1');
            expect(rowList.isModified()).toBe(true);
        });
    });

    describe('restore()', function() {
        beforeEach(function() {
            rowList.append({
                c1: '2-1',
                c2: '2-2'
            });
            rowList.removeRow(1);
            rowList.setValue(0, 'c1', 'New0-1');
        });

        it('변경후 restore 하면 원상태로 돌아오는지 확인한다.', function() {
            expect(rowList.isModified()).toBe(true);
            rowList.restore();
            expect(rowList.isModified()).toBe(false);
        });
    });

    describe('clear()', function() {
        it('등록된 행 데이터를 모두 삭제한다.', function() {
            rowList.clear();
            expect(rowList.length).toBe(0);
        });
    });

    describe('del()', function() {
        beforeEach(function() {
            columnModel.set('columns', [
                {
                    name: 'c1',
                    editOptions: {
                        type: 'text'
                    }
                },
                {
                    name: 'c2'
                }
            ]);
            rowList.setData([
                {
                    c1: '0-1',
                    c2: '0-2'
                }
            ]);
        });

        it('editable한 cell만 삭제한다.', function() {
            rowList.del(0, 'c1');
            rowList.del(0, 'c2');
            expect(rowList.getValue(0, 'c1')).toBe('');
            expect(rowList.getValue(0, 'c2')).toBe('0-2');
        });

        it('disabled된 row는 삭제되지 않는다', function() {
            rowList.disableRow(0);
            rowList.del(0, 'c1');
            rowList.del(0, 'c2');
            expect(rowList.getValue(0, 'c1')).toBe('0-1');
            expect(rowList.getValue(0, 'c2')).toBe('0-2');
        });
    });

    describe('delRange()', function() {
        it('should call del() for each cell silently', function() {
            spyOn(rowList, 'del');

            rowList.delRange({
                row: [0, 1],
                column: [0, 1]
            });

            expect(rowList.del).toHaveBeenCalledWith(0, 'c1', true);
            expect(rowList.del).toHaveBeenCalledWith(0, 'c2', true);
            expect(rowList.del).toHaveBeenCalledWith(1, 'c1', true);
            expect(rowList.del).toHaveBeenCalledWith(1, 'c2', true);
        });

        it('should call validateCell() for each cell', function() {
            var row1 = rowList.at(0);
            var row2 = rowList.at(1);

            spyOn(row1, 'validateCell');
            spyOn(row2, 'validateCell');

            rowList.delRange({
                row: [0, 1],
                column: [0, 1]
            });

            expect(row1.validateCell).toHaveBeenCalledWith('c1', true);
            expect(row1.validateCell).toHaveBeenCalledWith('c2', true);
            expect(row2.validateCell).toHaveBeenCalledWith('c1', true);
            expect(row2.validateCell).toHaveBeenCalledWith('c2', true);
        });

        it('should trigger "deleteRange" event', function() {
            var callback = jasmine.createSpy();

            rowList.on('deleteRange', callback);
            rowList.delRange({
                row: [0, 1],
                column: [0, 1]
            });

            expect(callback).toHaveBeenCalledWith(new GridEvent(null, {
                rowKeys: [0, 1],
                columnNames: ['c1', 'c2']
            }));
        });
    });

    describe('validate()', function() {
        beforeEach(function() {
            columnModel.getColumnModel('c1').validation = {
                required: true
            };
            columnModel.getColumnModel('c2').validation = {
                required: true
            };
            rowList.setData([
                {
                    c1: '0-1',
                    c2: ''
                },
                {
                    c1: '1-1',
                    c2: '1-2'
                },
                {
                    c1: '',
                    c2: '2-2'
                }
            ]);
        });

        it('Returns an array which contains invalid rows', function() {
            var expected = [{
                rowKey: 0,
                errors: [{
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }]
            }, {
                rowKey: 2,
                errors: [{
                    columnName: 'c1',
                    errorCode: 'REQUIRED'
                }]
            }];

            expect(rowList.validate()).toEqual(expected);
        });

        it('Add \'invalid\' class to the invlaid cells', function() {
            rowList.validate();
            expect(rowList.at(0).getClassNameList('c2')).toContain(classNameConst.CELL_INVALID);
            expect(rowList.at(2).getClassNameList('c1')).toContain(classNameConst.CELL_INVALID);
        });
    });

    describe('getCheckedState()', function() {
        beforeEach(function() {
            columnModel.set('selectType', 'checkbox');
        });

        describe('Returns the count of check-available rows and checked rows: ', function() {
            it('when all rows are checked', function() {
                rowList.checkAll();
                expect(rowList.getCheckedState()).toEqual({
                    available: 2,
                    checked: 2
                });
            });

            it('when only one row is checked', function() {
                rowList.check(0);
                expect(rowList.getCheckedState()).toEqual({
                    available: 2,
                    checked: 1
                });
            });

            it('when a row is disabled', function() {
                rowList.disableRow(0);
                expect(rowList.getCheckedState()).toEqual({
                    available: 1,
                    checked: 0
                });
            });

            it('when a row is disabled and all rows are checked', function() {
                rowList.checkAll();
                rowList.disableRow(0);
                expect(rowList.getCheckedState()).toEqual({
                    available: 1,
                    checked: 1
                });
            });

            it('when all rows are disabled and checked', function() {
                rowList.checkAll();
                rowList.setDisabled(true);
                expect(rowList.getCheckedState()).toEqual({
                    available: 0,
                    checked: 0
                });
            });
        });
    });

    describe('When checkbox is changed in row,', function() {
        var rowKey = 0;
        var row, mock;

        beforeEach(function() {
            row = rowList.get(rowKey);
        });

        it('"check" event is fired with rowKey.', function() {
            mock = jasmine.createSpy('check event handler');

            row.on('check', mock);
            rowList.setValue(rowKey, '_button', true);

            expect(mock).toHaveBeenCalledWith({rowKey: rowKey});
        });

        it('"uncheck" event is fired with rowKey.', function() {
            mock = jasmine.createSpy('uncheck event handler');

            row.on('uncheck', mock);
            rowList.setValue(rowKey, '_button', true);
            rowList.setValue(rowKey, '_button', false);

            expect(mock).toHaveBeenCalledWith({rowKey: rowKey});
        });
    });
});
