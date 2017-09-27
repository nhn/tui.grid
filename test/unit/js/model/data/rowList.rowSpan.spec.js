'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');

describe('Data.RowList - rowSpan', function() {
    var rowList, columnModel;

    beforeEach(function() {
        columnModel = new ColumnModelData({
            columns: [
                {
                    name: 'c1',
                    title: 'c1',
                    editOptions: {
                        type: 'text'
                    }
                },
                {
                    name: 'c2',
                    title: 'c2',
                    editOptions: {
                        type: 'text'
                    }
                }
            ]
        });
        rowList = new RowListData([], {
            columnModel: columnModel
        });
        rowList.set([{
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

    describe('getRowSpanData()', function() {
        it('rowList.getRowSpanData()는 해당 row의 getRowSpanData()를 호출한다.', function() {
            var row = rowList.get(0);
            spyOn(row, 'getRowSpanData');
            rowList.getRowSpanData(0, 'c1');

            expect(row.getRowSpanData).toHaveBeenCalledWith('c1');
        });

        it('columnName 인자가 존재할 경우 항상 같은 형태의 데이터를 리턴한다.', function() {
            var row = rowList.get(0);

            function test(data) {
                expect(data.count).toBeDefined();
                expect(data.isMainRow).toBeDefined();
                expect(data.mainRowKey).toBeDefined();
            }

            test(row.getRowSpanData('c1'));
            test(row.getRowSpanData('c2'));
            test(row.getRowSpanData('c3'));
        });

        describe('sort가 되지 않았을 경우', function() {
            it('columnName 파라미터가 설정되었을 경우 정상적 동작 확인한다.', function() {
                var mainRow = rowList.get(0);

                expect(mainRow.getRowSpanData('c1')).toEqual({
                    count: 3,
                    isMainRow: true,
                    mainRowKey: 0
                });
                expect(rowList.get(1).getRowSpanData('c1')).toEqual({
                    count: -1,
                    isMainRow: false,
                    mainRowKey: 0
                });
                expect(rowList.get(2).getRowSpanData('c2')).toEqual({
                    count: 0,
                    isMainRow: true,
                    mainRowKey: 2
                });
            });

            it('columnName 파라미터가 설정되지 않은 경우 row에 해당하는 데이터를 MAP 형태로 반환한다.', function() {
                expect(rowList.get(0).getRowSpanData()).toEqual({
                    c1: {
                        count: 3,
                        isMainRow: true,
                        mainRowKey: 0
                    }
                });
                expect(rowList.get(1).getRowSpanData()).toEqual({
                    c1: {
                        count: -1,
                        isMainRow: false,
                        mainRowKey: 0
                    },
                    c3: {
                        count: 3,
                        isMainRow: true,
                        mainRowKey: 1
                    }
                });
            });
        });

        describe('sort 가 되었을 경우 rowSpan 데이터를 무시하고 Empty 값을 반환한다.', function() {
            beforeEach(function() {
                rowList.sortByField('c1');
            });

            it('with columnName parameter', function() {
                expect(rowList.get(0).getRowSpanData('c1')).toEqual({
                    count: 0,
                    isMainRow: true,
                    mainRowKey: 0
                });
                expect(rowList.get(1).getRowSpanData('c1')).toEqual({
                    count: 0,
                    isMainRow: true,
                    mainRowKey: 1
                });
            });

            it('without columnName parameter', function() {
                expect(rowList.get(0).getRowSpanData()).toBeNull();
                expect(rowList.get(1).getRowSpanData()).toBeNull();
            });
        });
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
