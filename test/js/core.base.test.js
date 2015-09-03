'use strict';

var Model = require('../../src/js/base/model');
var Collection = require('../../src/js/base/collection');
var View = require('../../src/js/base/view');

describe('core.base', function() {
    var grid,
        $empty,
        Class;

    function testForSetOwnProperties(object) {
        object.setOwnProperties({
            value1: 1,
            value2: 2,
            value3: 3
        });
        expect(object.value1).toBe(1);
        expect(object.value2).toBe(2);
        expect(object.value3).toBe(3);
        expect(object.value4).not.toBeDefined();

        expect(object.hasOwnProperty('value1')).toBe(true);
        expect(object.hasOwnProperty('value2')).toBe(true);
        expect(object.hasOwnProperty('value3')).toBe(true);
        expect(object.hasOwnProperty('value4')).toBe(false);
    }

    jasmine.getFixtures().fixturesPath = 'base/';
    loadFixtures('test/fixtures/empty.html');
    $empty = $('#empty');
    Class = {};
    Class.Model = Model.extend({});
    Class.Collection = Collection.extend({
        model: Class.Model
    });
    Class.View = View.extend({});

    beforeEach(function() {
        $empty.empty();
        grid = {};
    });

    describe('Model.Base', function() {
        it('Model 생성 시 인자에 grid 프로퍼티를 넘기면 내부 프로퍼티로 저장한다.', function() {
            var model = new Class.Model({
                grid: grid
            });
            expect(model.hasOwnProperty('grid')).toBe(true);
            expect(model.grid).toBe(grid);
        });

        it('setOwnProperties()는 주어진 객체의 프라퍼티를 this로 복사한다.', function() {
            var model = new Class.Model();
            testForSetOwnProperties(model);
        });
    });

    describe('Collection.Base', function() {
        var collection;

        it('Collection 생성하면 length는 0이다.', function() {
            collection = new Class.Collection([], {
                grid: grid
            });
            expect(collection.length).toBe(0);
        });

        it('Collection 생성 시 두번째 인자에 grid 프로퍼티를 넘기면 프라퍼티로 저장한다.', function() {
            collection = new Class.Collection([], {
                grid: grid
            });
            expect(collection.hasOwnProperty('grid')).toBe(true);
            expect(collection.grid).toBe(grid);
        });

        it('setOwnProperties()는 주어진 객체의 프라퍼티를 this로 복사한다.', function() {
            collection = new Class.Collection();
            testForSetOwnProperties(collection);
        });

        it('clear()은 콜렉션 내 모델을 초기화 한다.', function() {
            collection = new Class.Collection([0, 1, 2]);
            expect(collection.length).toBe(3);

            collection.clear();

            expect(collection.at(0)).not.toBeDefined();
            expect(collection.length).toBe(0);
        });
    });


    describe('View.Base', function() {
        var view;
        beforeEach(function() {
            view = new Class.View({
                grid: grid
            });
        });

        it('View 생성 시 주어진 grid를 프라퍼티로 저장한다.', function() {
            expect(view.hasOwnProperty('grid')).toBe(true);
            expect(view.grid).toBe(grid);
        });

        it('setOwnProperties()는 주어진 객체의 프라퍼티를 this로 복사한다.', function() {
            testForSetOwnProperties(view);
        });

        it('createView()는 자식 view를 생성하고 _viewList 에 저장한다.', function() {
            var childView1 = view.createView(Class.View, {grid: grid}),
                childView2 = view.createView(Class.View, {grid: grid});

            expect(view._viewList[0]).toEqual(childView1);
            expect(view._viewList[1]).toEqual(childView2);
            expect(view._viewList.length).toBe(2);
        });

        it('addView()는 자식 view를 등록한다.', function() {
            var childView1 = new Class.View({grid: grid}),
                childView2 = new Class.View({grid: grid});

            view.addView(childView1);
            view.addView(childView2);

            expect(view._viewList[0]).toBe(childView1);
            expect(view._viewList[1]).toBe(childView2);
            expect(view._viewList.length).toBe(2);
        });

        it('destroyChildren()는 등록된 자식 view들을 제거한다.', function() {
            var childView1 = view.createView(Class.View, {grid: grid}),
                childView2 = view.createView(Class.View, {grid: grid}),
                grandChildView1 = childView1.createView(Class.View, {grid: grid}),
                grandChildView2 = childView1.createView(Class.View, {grid: grid}),
                grandChildView3 = childView1.createView(Class.View, {grid: grid});

            view.destroyChildren();
            expect(view._viewList.length).toBe(0);
            expect(childView1._viewList.length).toBe(0);
            expect(childView2._viewList.length).toBe(0);
            expect(grandChildView1._viewList.length).toBe(0);
            expect(grandChildView2._viewList.length).toBe(0);
            expect(grandChildView3._viewList.length).toBe(0);
        });

        it('createEventData()는 EventData 객체를 생성해서 반환한다.', function() {
            var sampleData = {
                prop1: 1,
                prop2: 2
            }, eventData;

            eventData = view.createEventData(sampleData);
            expect(eventData.prop1).toBe(sampleData.prop1);
            expect(eventData.prop2).toBe(sampleData.prop2);

            expect(eventData.isStopped()).toBe(false);
            eventData.stop();
            expect(eventData.isStopped()).toBe(true);
        });

        it('error()는 에러 객체를 생성한다.', function() {
            var message = 'error message',
                error = view.error(message);

            expect(error instanceof Error).toBe(true);
            expect(error.hasOwnProperty('name')).toBe(true);
            expect(error.message).toBe(message);
        });
    });
});
