'use strict';

var Model = require('base/model');
var HeightResizeHandleView = require('view/heightResizeHandle');

describe('view.heightResizeHandler', function() {
    var resize, mouseEvent, dimensionModel;

    beforeEach(function() {
        mouseEvent = {
            pageX: 100,
            pageY: 20,
            target: $('<div>'),
            preventDefault: function() {}
        };
        dimensionModel = new Model();
        dimensionModel.getScrollXHeight = function() {
            return this.get('scrollBarSize');
        };
        resize = new HeightResizeHandleView({
            dimensionModel: dimensionModel
        });
    });

    afterEach(function() {
        resize.destroy();
    });

    // TODO: 내부 구현을 테스트하지 말 것
    describe('_onMouseDown', function() {
        beforeEach(function() {
            spyOn(resize, '_attachMouseEvent');
            resize._onMouseDown(mouseEvent);
        });

        it('mouseDown 이벤트가 발생하면 dimensionModel.refreshLayout과 _attachMouseEvent 를 수행한다.', function() {
            expect(resize._attachMouseEvent).toHaveBeenCalled();
        });

        it('body 엘리먼트의 커서 css 스타일을 row-resize 로 변경한다..', function() {
            expect($(document.body).css('cursor')).toEqual('row-resize');
        });
    });

    describe('_onMouseUp', function() {
        beforeEach(function() {
            resize._attachMouseEvent = function() {};
            spyOn(resize, '_detachMouseEvent');
            resize._onMouseDown(mouseEvent);
            resize._onMouseUp();
        });

        it('mouseDown 이벤트가 발생하면 _dettachMouseEvent를 수행한다.', function() {
            expect(resize._detachMouseEvent).toHaveBeenCalled();
        });

        it('body 엘리먼트의 커서 css 스타일을 row-resize로 변경한다.', function() {
            expect($(document.body).css('cursor')).toEqual('default');
        });
    });

    describe('_onMouseMove', function() {
        beforeEach(function() {
            dimensionModel.set({
                offsetTop: 0,
                height: 500,
                headerHeight: 50,
                rowHeight: 10,
                scrollBarSize: 20,
                toolbarHeight: 50,
                bodyHeight: 200
            });
        });

        it('bodyHeight를 header와 toolbar를 제외한 높이로 조정한다.', function(done) {
            mouseEvent.pageY = 300;
            resize._onMouseMove(mouseEvent);
            setTimeout(function() {
                expect(dimensionModel.get('bodyHeight')).toBe(200);
                done();
            }, 10);
        });

        it('scrollbarSize와 rowHeight를 더한 값 이하로 높이가 줄어들지 않는다.', function(done) {
            mouseEvent.pageY = 100;
            resize._onMouseMove(mouseEvent);
            setTimeout(function() {
                expect(dimensionModel.get('bodyHeight')).toBe(30);
                done();
            }, 10);
        });
    });
});
