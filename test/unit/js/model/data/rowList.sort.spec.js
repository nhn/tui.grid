'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');

describe('data.rowList', function() {
    var dataModel, columnModel;

    beforeEach(function() {
        columnModel = new ColumnModelData({
            columns: [
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
            ]
        });

        dataModel = new RowListData([], {
            columnModel: columnModel
        });
    });

    describe('sortOptions.useClient', function() {
        it('defualt 값은 true이다.', function() {
            expect(dataModel.sortOptions.useClient).toBe(true);
        });

        it('생성시 useClientSort 값을 넘기면 값이 설정된다.', function() {
            dataModel = new RowListData([], {
                columnModel: columnModel,
                useClientSort: false
            });
            expect(dataModel.sortOptions.useClient).toBe(false);
        });

        it('false 이면 comparator를 rowKey로 지정한다.', function() {
            dataModel = new RowListData([], {
                columnModel: columnModel,
                useClientSort: false
            });
            expect(dataModel.comparator).toBeNull();
        });
    });

    describe('setSortOptionValues()', function() {
        var options, spyHandler;

        beforeEach(function() {
            options = dataModel.sortOptions;
            spyHandler = jasmine.createSpy();
        });

        it('sortOptions 값을 변경한다.', function() {
            dataModel.setSortOptionValues('c1', false);

            expect(options.columnName).toBe('c1');
            expect(options.ascending).toBe(false);
        });

        it('columnName값이 없으면 rowKey, ascending값이 없으면 true가 설정된다.', function() {
            dataModel.setSortOptionValues('c1', false);
            dataModel.setSortOptionValues();

            expect(options.columnName).toBe('rowKey');
            expect(options.ascending).toBe(true);
        });

        it('변경된 값이 있으면 sortChanged 이벤트를 발생시키며, 파라미터 값들을 객체로 묶어 넘겨준다.', function() {
            dataModel.on('sortChanged', spyHandler);
            dataModel.setSortOptionValues('c1', false, true);

            expect(spyHandler).toHaveBeenCalledWith({
                columnName: 'c1',
                ascending: false,
                requireFetch: true
            });
        });

        it('변경된 값이 없으면 sortChanged 이벤트를 발생시키지 않는다.', function() {
            dataModel.on('sortChanged', spyHandler);

            expect(spyHandler).not.toHaveBeenCalled();
        });
    });

    describe('sortByField()', function() {
        beforeEach(function() {
            dataModel.set([
                {
                    c1: 'c',
                    c2: 2
                }, {
                    c1: 'b',
                    c2: -1
                }, {
                    c1: 'a',
                    c2: 3
                }
            ], {parse: true});
        });

        it('c1을 기준으로 오름차순 정렬하면 2, 1, 0 순서가 된다.', function() {
            dataModel.sortByField('c1', true);

            expect(dataModel.at(0).get('rowKey')).toBe(2);
            expect(dataModel.at(1).get('rowKey')).toBe(1);
            expect(dataModel.at(2).get('rowKey')).toBe(0);
        });

        it('c2을 기준으로 내림차순 정렬하면 2, 0, 1 순서가 된다.', function() {
            dataModel.sortByField('c2', false);

            expect(dataModel.at(0).get('rowKey')).toBe(2);
            expect(dataModel.at(1).get('rowKey')).toBe(0);
            expect(dataModel.at(2).get('rowKey')).toBe(1);
        });

        it('null is the least value for String types', function() {
            dataModel.setValue(0, 'c1', null);
            dataModel.sortByField('c1', true);

            expect(dataModel.at(0).get('rowKey')).toBe(0);
            expect(dataModel.at(1).get('rowKey')).toBe(2);
            expect(dataModel.at(2).get('rowKey')).toBe(1);
        });

        it('null is the is the least for Number types', function() {
            dataModel.setValue(0, 'c2', null);
            dataModel.sortByField('c2', true);

            expect(dataModel.at(0).get('rowKey')).toBe(0);
            expect(dataModel.at(1).get('rowKey')).toBe(1);
            expect(dataModel.at(2).get('rowKey')).toBe(2);
        });

        it('기존 컬럼과 같을 경우 isAsecnding값이 없으면 기존의 ascending 값을 반대로 설정한다.', function() {
            dataModel.sortByField('c1', true);
            dataModel.sortByField('c1');

            expect(dataModel.at(0).get('rowKey')).toBe(0);
            expect(dataModel.at(1).get('rowKey')).toBe(1);
            expect(dataModel.at(2).get('rowKey')).toBe(2);
        });

        it('sortOptions.useClient 값이 false 이면 sort를 실행하지 않는다', function() {
            spyOn(dataModel, 'sort');
            dataModel.sortOptions.useClient = false;
            dataModel.sortByField('c1', true);

            expect(dataModel.sort).not.toHaveBeenCalled();
        });
    });
});
