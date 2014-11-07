'use strict';
describe('dataModel 테스트', function() {
    function getGrid(){

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

