'use strict';

var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');

describe('Data.RowList - rowSpan', function() {
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
    var rowList,
        columnModel,
        grid = {
            publicInstance: 'publicInstance'
        };

    beforeEach(function() {
        columnModel = grid.columnModel = new ColumnModelData();
        columnModel.set('columnModelList', columnModelList);
        rowList = new RowListData([], {
            grid: grid
        });
        rowList.set([
        {
            _extraData: {
                rowSpan: {c1: 3}
            },
            c1: '0-1',
            c2: '0-2',
            c3: '0-3'
        }, {
            _extraData: {
                rowSpan: {c3: 3}
            },
            c2: '1-2',
            c3: '1-3'
        }, {
            c2: '2-2'
        }, {
            c1: '3-1',
            c2: '3-2'
        }], {parse: true});
    });

    describe('removeRow()', function() {
        it('rowSpan에 포함된 row를 삭제하면 mainRow의 count를 1감소시킨다.', function() {
            rowList.removeRow(2);

            expect(rowList.get(2)).toBeUndefined();
            expect(rowList.get(0).getRowSpanData().c1.count).toBe(2);
            expect(rowList.get(1).getRowSpanData().c3.count).toBe(2);
        });

        it('rowSpan이 지정된 row를 삭제하면 포함된 row들의 값을 제거하고, count를 1씩 증가시켜주고, mainKey를 새로 지정한다.', function() {
            rowList.removeRow(0);

            expect(rowList.get(0)).toBeUndefined();

            // rowKey:1 이 mainRow가 됨
            expect(rowList.get(1).getRowSpanData().c1.count).toBe(2);
            expect(rowList.get(1).getRowSpanData().c1.isMainRow).toBe(true);
            expect(rowList.get(2).get('c1')).toBe('');

            expect(rowList.get(2).getRowSpanData().c1.count).toBe(-1);
            expect(rowList.get(2).get('c1')).toBe('');
        });

        it('rowSpan의 count가 1로 지정되어 있으면 rowSpan처리를 하지 않고 무시한다.', function() {
            rowList.lastRowKey = -1;
            rowList.reset([{
                _extraData: {
                    rowSpan: {c1: 1}
                },
                c1: '0-1',
                c2: '0-2',
                c3: '0-3'
            }, {
                c1: '1-1',
                c2: '1-2',
                c3: '1-3'
            }], {parse: true});

            rowList.removeRow(0);
            
            expect(rowList.get(0)).toBeUndefined();
            expect(rowList.get(1).get('c1')).toBe('1-1');
            expect(rowList.get(1).get('c2')).toBe('1-2');
            expect(rowList.get(1).get('c3')).toBe('1-3');
        });
    });

    describe('append()', function() {
        it('rowSpan에 포함된 row의 위치에 추가되면 기존 rowSpan에 합쳐진다.', function() {
            rowList.append({}, {
                at: 1
            });
            expect(rowList.at(0).getRowSpanData().c1.count).toBe(4);
            expect(rowList.at(1).getRowSpanData().c1.count).toBe(-1);
            expect(rowList.at(2).getRowSpanData().c1.count).toBe(-2);
            expect(rowList.at(3).getRowSpanData().c1.count).toBe(-3);
        });

        it('두개 이상의 컬럼에 rowSpan이 적용되어 있을때도 모두 적용된다.', function() {
            rowList.append({}, {
                at: 2
            });
            expect(rowList.at(0).getRowSpanData().c1.count).toBe(4);
            expect(rowList.at(2).getRowSpanData().c1.count).toBe(-2);
            expect(rowList.at(3).getRowSpanData().c1.count).toBe(-3);

            expect(rowList.at(1).getRowSpanData().c3.count).toBe(4);
            expect(rowList.at(2).getRowSpanData().c3.count).toBe(-1);
            expect(rowList.at(3).getRowSpanData().c3.count).toBe(-2);
            expect(rowList.at(4).getRowSpanData().c3.count).toBe(-3);
        });

        it('rowSpanPrev값이 true인 경우 이전 행에 rowSpan 정보가 있으면 확장해서 합친다.', function() {
            rowList.append({}, {
                at: 3,
                rowSpanPrev: true
            });
            expect(rowList.at(1).getRowSpanData().c3.count).toBe(4);
            expect(rowList.at(3).getRowSpanData().c3.count).toBe(-2);
            expect(rowList.at(4).getRowSpanData().c3.count).toBe(-3);
        });
    });
});
