'use strict';
describe('API 테스트', function() {
    function getGrid(){
        var url = 'http://fetech.nhnent.com/svnrun/fetech/prototype/trunk/grid/test/php/';
        var grid = new ne.Grid({
            el: $('#grid'),
            columnModelList: columnModelList[0],
            selectType: 'checkbox',
            columnFixIndex: 5,
            rowHeight: 30,
            displayRowCount: 10,
            headerHeight: 50,
            minimumColumnWidth: 20
        }).on('onResponse', function(data) {

        }).on('onSuccessResponse', function(data) {

        }).use('Net', {
            el: $('#form'),
            perPage: 100,
            api: {
                'readData': url + 'dummy_request.php',
                'createData': url + 'createData.php',
                'updateData': url + 'updateData.php',
                'deleteData': url + 'deleteData.php',
                'modifyData': url + 'modifyData.php',
                'downloadData': url + 'downloadData.php',
                'downloadAllData': url + 'downloadAllData.php'
            }
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

    it('createData', function() {
        var grid = getGrid(),
            net = grid.getAddOn('Net');

        grid.prependRow();
        grid.prependRow();
        grid.setValue(0, 'columnName1', 'changed');
        grid.setValue(1, 'columnName1', 'changed');
        expect(!!net).toEqual(true);
    });
});

