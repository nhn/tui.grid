'use strict';

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
    var dataModel,
        columnModel,
        grid = {
            publicInstance: 'publicInstance'
        };

    beforeEach(function() {
        columnModel = grid.columnModel = new Data.ColumnModel();
        columnModel.set('columnModelList', columnModelList);
        dataModel = new Data.RowList([], {
            grid: grid
        });
        dataModel.set([
        {
            _extraData: {
                rowSpan: {c1: 3}
            },
            c1: '0-1',
            c2: '0-2',
            c3: '0-3'
        }, {
            _extraData: {
                rowSpan: {c3: 2}
            },
            c2: '1-2',
            c3: '1-3'
        }, {
            c2: '2-2'
        }, {
            c2: '3-2',
            c3: '3-3'
        }], {parse: true});
    });

    describe('removeRow()', function() {
        it('rowSpan에 포함된 row를 삭제하면 mainRow의 count를 1감소시킨다.', function() {
            dataModel.removeRow(2);

            expect(dataModel.get(0).getRowSpanData().c1.count).toBe(2);
            expect(dataModel.get(1).getRowSpanData().c3.count).toBe(1);
        });

        it('rowSpan이 지정된 row를 삭제하면 포함된 row들의 값을 제거하고, count를 1씩 증가시켜주고, mainKey를 새로 지정한다.', function() {
            dataModel.removeRow(0);

            // rowKey:1 이 mainRow가 됨
            expect(dataModel.get(1).getRowSpanData().c1.count).toBe(2);
            expect(dataModel.get(1).getRowSpanData().c1.isMainRow).toBe(true);
            expect(dataModel.get(2).get('c1')).toBe('');

            expect(dataModel.get(2).getRowSpanData().c1.count).toBe(-1);
            expect(dataModel.get(2).get('c1')).toBe('');
        });
    });

    // xdescribe('append()', function() {
    //     it('rowSpan 데이터가 존재하는 인덱스에 추가되는 경우, 기존의 rowSpan에 추가해준다.', function() {
    //         dataModel.append({
    //             c1: 'new-1',
    //             c2: 'new-2',
    //             c3: 'new-3'
    //         }, 1);
    //
    //         expect(dataModel.at(0).getRowSpanData().c1.count).toBe(4);
    //         expect(dataModel.at(1).getRowSpanData().c1.count).toBe(-1);
    //         expect(dataModel.at(2).getRowSpanData().c1.count).toBe(-2);
    //         expect(dataModel.at(3).getRowSpanData().c1.count).toBe(-3);
    //     });
    // });
});
