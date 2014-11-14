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
    });


    describe('Model.Base', function() {
        it('Model 생성 시 인자에 grid 프로퍼티를 넘기면 내부 프로퍼티로 저장한다.', function() {
            var model = new Class.Model({
                grid: 'grid'
            });
            expect(model.hasOwnProperty('grid')).toBe(true);
            expect(model.grid).toBe('grid');
        });
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
        var collection;

        it('Collection 생성 시 length 가 0 인지 확인한다.', function() {
            collection = new Class.Collection([], {
                grid: 'grid'
            });
            expect(collection.length).toBe(0);

        });
        it('Collection 생성 시 두번째 인자에 grid 프로퍼티를 넘기면 내부 프로퍼티로 저장한다.', function() {
            collection = new Class.Collection([], {
                grid: 'grid'
            });
            expect(collection.hasOwnProperty('grid')).toBe(true);
            expect(collection.grid).toBe('grid');
        });
        it('setOwnProperties() 의 동작을 확인한다.', function() {
            var collection = new Class.Collection();
            collection.setOwnProperties({
                value1: 1,
                value2: 2,
                value3: 3
            });
            expect(collection.value1).toBe(1);
            expect(collection.value2).toBe(2);
            expect(collection.value3).toBe(3);
            expect(collection.value4).not.toBeDefined();

            expect(collection.hasOwnProperty('value1')).toBe(true);
            expect(collection.hasOwnProperty('value2')).toBe(true);
            expect(collection.hasOwnProperty('value3')).toBe(true);
            expect(collection.hasOwnProperty('value4')).toBe(false);
        });
        it('clear() 은 콜렉션 내 모델을 초기화 한다.', function() {
            var firstModel,
                dummy = [
                    {'value1': 0, 'value2': 0},
                    {'value1': 1, 'value2': 1},
                    {'value1': 2, 'value2': 2},
                    {'value1': 3, 'value2': 3},
                    {'value1': 4, 'value2': 4}
            ];

            collection = new Class.Collection(dummy);

            expect(collection.at(4)).toBeDefined();
            expect(collection.length).toBe(5);

            collection.clear();

            expect(collection.at(0)).not.toBeDefined();
            expect(collection.length).toBe(0);
        });
    });


    describe('View.Base', function() {
        var view;

        it('View 생성 시 자동 생성하는 내부 프로퍼티를 확인한다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            expect(view.hasOwnProperty('__viewList')).toBe(true);
            expect(view.hasOwnProperty('grid')).toBe(true);
            expect(view.grid).toEqual('grid');
        });

        it('setOwnProperties() 의 동작을 확인한다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            view.setOwnProperties({
                value1: 1,
                value2: 2,
                value3: 3
            });
            expect(view.value1).toBe(1);
            expect(view.value2).toBe(2);
            expect(view.value3).toBe(3);
            expect(view.value4).not.toBeDefined();

            expect(view.hasOwnProperty('value1')).toBe(true);
            expect(view.hasOwnProperty('value2')).toBe(true);
            expect(view.hasOwnProperty('value3')).toBe(true);
            expect(view.hasOwnProperty('value4')).toBe(false);
        });
        it('createView() 로 자식 view 를 생성하고 __viewList 에 저장한다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            var childView1 = view.createView(Class.View, {grid: 'grid'}),
                childView2 = view.createView(Class.View, {grid: 'grid'});

            expect(view.__viewList[0]).toEqual(childView1);
            expect(view.__viewList[1]).toEqual(childView2);
            expect(view.__viewList.length).toBe(2);
        });
        it('addView() 로 자식 view 로 등록할 수 있다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            var childView1 = new Class.View({grid: 'grid'}),
                childView2 = new Class.View({grid: 'grid'});

            view.addView(childView1);
            view.addView(childView2);

            expect(view.__viewList[0]).toEqual(childView1);
            expect(view.__viewList[1]).toEqual(childView2);
            expect(view.__viewList.length).toBe(2);
        });
        it('destroyChild() 로 등록된 자식 view 들을 제거한다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            var childView1 = view.createView(Class.View, {grid: 'grid'}),
                childView2 = view.createView(Class.View, {grid: 'grid'}),
                grandChildView1 = childView1.createView(Class.View, {grid: 'grid'}),
                grandChildView2 = childView1.createView(Class.View, {grid: 'grid'}),
                grandChildView3 = childView1.createView(Class.View, {grid: 'grid'});

            view.destroyChildren();
            expect(view.__viewList.length).toBe(0);
            expect(childView1.__viewList.length).toBe(0);
            expect(childView2.__viewList.length).toBe(0);
            expect(grandChildView1.__viewList.length).toBe(0);
            expect(grandChildView2.__viewList.length).toBe(0);
            expect(grandChildView3.__viewList.length).toBe(0);
        });
        it('createEventData() 로 EventData 객체를 생성할 수 있다.', function() {
            view = new Class.View({
                grid: 'grid'
            });

            var sampleData = {
                prop1: 1,
                prop2: 2
            }, eventData;

            eventData = view.createEventData(sampleData);
            expect(eventData.prop1).toBe(sampleData.prop1);
            expect(eventData.prop2).toBe(sampleData.prop2);

            expect(eventData.hasOwnProperty('stop')).toBe(true);
            expect(typeof eventData.stop).toBe('function');

            expect(eventData.hasOwnProperty('isStopped')).toBe(true);
            expect(typeof eventData.isStopped).toBe('function');

            expect(eventData.hasOwnProperty('_isStoped')).toBe(true);
            expect(eventData._isStoped).toBe(false);
        });
        it('error() 로 에러 객체를 생성할 수 있다.', function() {
            view = new Class.View({
                grid: 'grid'
            });
            var message = 'errorMessage',
                error = view.error(message);

            expect(error instanceof Error).toBe(true);
            expect(error.hasOwnProperty('name')).toBe(true);
            expect(error.hasOwnProperty('message')).toBe(true);
            expect(error.message).toEqual(message);
        });
    });
    describe('View.Base.Painter', function() {
        var painter,
            PainterClass = View.Base.Painter.extend({
                initialize: function() {
                    View.Base.Painter.prototype.initialize.apply(this, arguments);
                    this.clickCount = 0;
                    this.focusCount = 0;
                },
                eventHandler: {
                    'click p': '_onClick',
                    'focus input': '_onFocus'
                },
                getHtml: function() {
                    return '<p>test html<input type="text"></p>';
                },
                _onClick: function() {
                    ++this.clickCount;
                },
                _onFocus: function() {
                    ++this.focusCount;
                }
            });

        it('Painter 에서 eventHandler 를 파싱하여 생성하는 _eventHandler 오브젝트를 확인한다.', function() {
            painter = new PainterClass();
            var expectHandlerObj = {
                click: {
                    selector: 'p',
                    handler: painter._eventHandler['click']['handler']
                },
                focus: {
                    selector: 'input',
                    handler: painter._eventHandler['focus']['handler']
                }
            };
            expect(painter._eventHandler).toEqual(expectHandlerObj);
        });
        it('Painter 의 _attachHandler 의 동작을 확인한다.', function() {
            painter = new PainterClass({test: true});

            $empty.html(painter.getHtml());
            painter._attachHandler($empty);

            $empty.find('p').trigger('click');
            $empty.find('input').focus();

            expect(painter.clickCount).toEqual(1);
            expect(painter.focusCount).toEqual(1);

            //다음 테스트를 위해 이벤트를 해제한다.
            painter._detachHandler($empty);
        });
        it('Painter 의 _detachHandler 의 동작을 확인한다.', function() {
            painter = new PainterClass({test: true});

            $empty.html(painter.getHtml());
            painter._attachHandler($empty);

            $empty.find('p').trigger('click');
            $empty.find('input').focus();

            painter._detachHandler($empty);

            $empty.find('p').trigger('click');
            $empty.find('input').focus();
            expect(painter.clickCount).toEqual(1);
            expect(painter.focusCount).toEqual(1);
        });
    });
});
