'use strict';
describe('API 테스트', function() {
    function getGrid(){
        var grid = new ne.Grid({
            el: $('#grid'),
            columnModelList: columnModelList[0],
            selectType: 'checkbox',
            columnFixIndex: 5,
            rowHeight: 30,
            displayRowCount: 10,
            headerHeight: 50,
            minimumColumnWidth: 20
        });
        return grid;
    }
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        jasmine.getStyleFixtures().fixturesPath = 'base/';

        loadStyleFixtures('css/common.css');
        loadStyleFixtures('css/Grid.css');
        loadFixtures('test/fixtures/single_net.html');


//        console.log('grid', grid);
//        console.log('net', net);
    });
    afterEach(function() {

    });

    it('public 메서드 getValue 는 실제 dataModel 에 정의된 값과 동일한 값을 리턴한다.', function() {
        var grid = getGrid(),
            dataModel = grid.core.dataModel,
            columnModel = grid.core.columnModel,
            rowKeyList = dataModel.pluck('rowKey'),
            columnList = columnModel.get('columnModelList');
        _.each(rowKeyList, function(rowKey) {
            _.each(columnList, function(column) {
                expect(grid.getValue(rowKey, column['columnName'])).toEqual(grid.core.dataModel.get(rowKey).get(column['columnName']));
            }, this);
        }, this);
    });

});

