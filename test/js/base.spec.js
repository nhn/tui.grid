'use strict';

var Model = require('base/model');
var Collection = require('base/collection');
var View = require('base/view');

describe('core.base', function() {
    var Class;

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

    Class = {};
    Class.Model = Model.extend({});
    Class.Collection = Collection.extend({
        model: Class.Model
    });
    Class.View = View.extend({});

    describe('Model.Base', function() {
        it('setOwnProperties()는 주어진 객체의 프라퍼티를 this로 복사한다.', function() {
            var model = new Class.Model();
            testForSetOwnProperties(model);
        });
    });

    describe('Collection.Base', function() {
        var collection;

        it('Collection 생성하면 length는 0이다.', function() {
            collection = new Class.Collection([], {});
            expect(collection.length).toBe(0);
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
            view = new Class.View();
        });

        it('setOwnProperties()는 주어진 객체의 프라퍼티를 this로 복사한다.', function() {
            testForSetOwnProperties(view);
        });

        it('_addChildren()는 자식 view _children에 저장한다.', function() {
            var childView1 = new Class.View(),
                childView2 = new Class.View();

            view._addChildren([childView1, childView2]);
            expect(view._children[0]).toEqual(childView1);
            expect(view._children[1]).toEqual(childView2);
            expect(view._children.length).toBe(2);
        });

        it('_destroyChildren()는 등록된 자식 view들을 제거한다.', function() {
            var childView1 = new Class.View(),
                childView2 = new Class.View(),
                grandChildView1 = new Class.View(),
                grandChildView2 = new Class.View(),
                grandChildView3 = new Class.View();

            view._addChildren([childView1, childView2]);
            childView1._addChildren([grandChildView1, grandChildView2, grandChildView3]);

            view._destroyChildren();
            expect(view._children.length).toBe(0);
            expect(childView1._children.length).toBe(0);
            expect(childView2._children.length).toBe(0);
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
