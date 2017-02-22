'use strict';

var Model = require('base/model');
var Collection = require('base/collection');
var View = require('base/view');

describe('core.base', function() {
    var Class;

    Class = {};
    Class.Model = Model.extend({});
    Class.Collection = Collection.extend({
        model: Class.Model
    });
    Class.View = View.extend({});

    describe('Collection.Base', function() {
        var collection;

        it('Collection 생성하면 length는 0이다.', function() {
            collection = new Class.Collection([], {});
            expect(collection.length).toBe(0);
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
    });
});
