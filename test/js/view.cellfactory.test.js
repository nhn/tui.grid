'use strict';

var CellFactory = require('../../src/js/view/cellFactory');

describe('view.cellfactory', function() {
    var cellFactory,
        $empty;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');

        cellFactory = new CellFactory({
            grid: {}
        });
    });

    describe('initialize', function() {
        it('instance를 잘 생성하는지 확인한다.', function() {
            expect(cellFactory.instances).toBeDefined();
        });
    });

    describe('getInstance', function() {
        it('editType에 따라 적절한 instance를 반환하는지 확인한다.', function() {
            expect(cellFactory.getInstance('normal')).toEqual(cellFactory.instances.normal);
            expect(cellFactory.getInstance('text')).toEqual(cellFactory.instances.text);
            expect(cellFactory.getInstance('text-convertible')).toEqual(cellFactory.instances['text-convertible']);
            expect(cellFactory.getInstance('radio')).toEqual(cellFactory.instances.button);
            expect(cellFactory.getInstance('checkbox')).toEqual(cellFactory.instances.button);
            expect(cellFactory.getInstance('select')).toEqual(cellFactory.instances.select);
            expect(cellFactory.getInstance('undefined')).toEqual(cellFactory.instances.normal);
        });
    });
});
