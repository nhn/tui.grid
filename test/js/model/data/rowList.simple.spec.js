'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var classNameConst = require('common/classNameConst');

describe('Data.RowList - simple', function() {
    var columnModelList = [
        {
            columnName: 'c1',
            title: 'c1',
            editOption: {
                type: 'text'
            }
        }, {
            columnName: 'c2',
            title: 'c2',
            editOption: {
                type: 'text'
            }
        }
    ];
    var rowList, columnModel;

    beforeEach(function() {
        columnModel = new ColumnModelData();
        columnModel.set('columnModelList', columnModelList);
        rowList = new RowListData([], {
            columnModel: columnModel
        });
        rowList.setRowList([
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
        it('rowState의 isDisabled 속성을 변경한다.', function() {
            var row = rowList.get(0);
            expect(row.getRowState().isDisabled).toBe(false);

            rowList.disableRow(0);
            expect(row.getRowState().isDisabled).toBe(true);

            rowList.enableRow(0);
            expect(row.getRowState().isDisabled).toBe(false);
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

        it('sets isDisabled', function() {
            rowList.isDisabled = false;
            rowList.setDisabled(true);
            expect(rowList.isDisabled).toBe(true);

            rowList.setDisabled(false);
            expect(rowList.isDisabled).toBe(false);
        });

        it('if isDisabled is changed, trigger disabledChanged event', function() {
            rowList.isDisabled = false;
            rowList.setDisabled(true);
            expect(triggered).toBe(true);
        });

        it('if isDisabled is not changed, does not trigger disabledChanged event', function() {
            rowList.isDisabled = true;
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
            expect(rowList.get(0).getRowState().isDisabledCheck).toBe(true);
        });
    });

    describe('enableCheck()', function() {
        it('enableCheck 되는지 확인한다.', function() {
            rowList.disableCheck(0);
            rowList.enableCheck(0);
            expect(rowList.get(0).getRowState().isDisabledCheck).toBe(false);
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
            expect(rowList.getValue(1, 'c1')).toBe('1-1'); //disabled
        });

        it('isCheckCellState를 false 로 넘겼을 경우 열에 대한 데이터 모두를 상태에 관계없이 변경한다.', function() {
            rowList.setColumnValues('c1', 'changed', false);
            expect(rowList.getValue(0, 'c1')).toBe('changed');
            expect(rowList.getValue(1, 'c1')).toBe('changed');
        });
    });

    describe('isChanged()', function() {
        it('변경사항이 없을때 false 를 반환한다.', function() {
            expect(rowList.isChanged()).toBe(false);
        });

        it('데이터가 append 추가되었을때 변경사항을 감지한다.', function() {
            rowList.append({
                c1: '2-1',
                c2: '2-2'
            });
            expect(rowList.isChanged()).toBe(true);
        });

        it('데이터가 remove 되었을때 변경사항을 감지한다.', function() {
            rowList.removeRow(1);
            expect(rowList.isChanged()).toBe(true);
        });

        it('데이터가 변경 되었을때 변경사항을 감지한다.', function() {
            rowList.setValue(0, 'c1', 'New0-1');
            expect(rowList.isChanged()).toBe(true);
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
            expect(rowList.isChanged()).toBe(true);
            rowList.restore();
            expect(rowList.isChanged()).toBe(false);
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
            columnModel.set('columnModelList', [
                {
                    columnName: 'c1',
                    editOption: {
                        type: 'text'
                    }
                },
                {
                    columnName: 'c2',
                    editOption: {
                        type: 'normal'
                    }
                }
            ]);
            rowList.setRowList([
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

    describe('validate()', function() {
        beforeEach(function() {
            columnModel.getColumnModel('c1').isRequired = true;
            columnModel.getColumnModel('c2').isRequired = true;
            rowList.setRowList([
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
});
