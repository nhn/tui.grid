'use strict';

var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');

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
        var grid = {};

        columnModel = grid.columnModel = new ColumnModelData();
        columnModel.set('columnModelList', columnModelList);
        rowList = new RowListData([], {
            grid: grid
        });
        rowList.set([
        {
            c1: '0-1',
            c2: '0-2'
        }, {
            c1: '1-1',
            c2: '1-2'
        }], {parse: true});
    });

    describe('getRowData()', function() {
        it('주어진 rowKey에 해당하는 행의 데이터를 object로 반환한다.', function() {
            var rowData = rowList.getRowData(0);
            expect(rowData).toEqual(rowList.get(0).toJSON());
        });

        it('두번째 파라미터가 true이면 json문자열 형태로 반환한다.', function() {
            var rowData = rowList.getRowData(0),
                rowDataJSON = rowList.getRowData(0, true);

            expect($.toJSON(rowData)).toEqual(rowDataJSON);
        });
    });

    describe('getRowDataAt()', function() {
        it('주어진 index에 해당하는 행의 데이터를 object로 반환한다.', function() {
            var rowData = rowList.getRowDataAt(0);
            expect(rowData).toEqual(rowList.at(0).toJSON());
        });

        it('두번째 파라미터가 true이면 json문자열 형태로 반환한다.', function() {
            expect($.toJSON(rowList.getRowDataAt(0))).toBe(rowList.getRowDataAt(0, true));
        });
    });

    describe('getValue(), setValue()', function() {
        it('getValue 는 값을 잘 가져온다.', function() {
            expect(rowList.getValue(0, 'c1')).toBe('0-1');
        });

        it('setValue 이후 getValue 의 isOriginal 을 true 로 설정시 original 데이터를 반환한다.', function() {
            rowList.setOriginalRowList();
            rowList.setValue(0, 'c1', 'New0-1');
            expect(rowList.getValue(0, 'c1')).toBe('New0-1');
            expect(rowList.getValue(0, 'c1', true)).toBe('0-1');
        });
    })

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
});
