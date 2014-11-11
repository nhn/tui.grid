'use strict';

describe('core.base', function() {
    var $empty, Class;
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        Class = {};
        Class.Model = Model.Base.extend({});
        Class.Collection = Collection.Base.extend({
            model: Class.Model
        });
        Class.View = View.Base.extend({});
        Class.ViewPainter = View.Base.Painter.extend({});
    });


    describe('Model.Base', function() {
        it('setOwnProperties() 의 동작을 확인한다.', function() {
            var model = new Class.Model();
            model.setOwnProperties({
                value1: 1,
                value2: 2,
                value3: 3
            });
            expect(model.value1).toBe(1);
            expect(model.value2).toBe(2);
            expect(model.value3).toBe(3);
            expect(model.value4).not.toBeDefined();

            expect(model.hasOwnProperty('value1')).toBe(true);
            expect(model.hasOwnProperty('value2')).toBe(true);
            expect(model.hasOwnProperty('value3')).toBe(true);
            expect(model.hasOwnProperty('value4')).toBe(false);
        });
    });

    describe('Collection.Base', function() {
        it('Collection 생성 시 length 가 0 인지 확인한다.', function() {
            var collection = new Class.Collection([], {
                grid: 'grid'
            });
            console.log(collection.toJSON());
            expect(collection.length).toBe(0);
            expect(collection.grid).toBe('grid');
        });
    });
});
