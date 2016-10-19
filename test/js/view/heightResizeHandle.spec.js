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
                offsetTop: 100
            });
            dimensionModel.setSize = jasmine.createSpy('setSize');
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('call dimensionModel.setSize with (offsetY - mouseOffsetY - gridOffsetY)', function() {
            mouseEvent.pageY = 300;
            resize.mouseOffsetY = 100;

            resize._onMouseMove(mouseEvent);
            jasmine.clock().tick(0);

            expect(dimensionModel.setSize).toHaveBeenCalledWith(null, 100);
        });
    });
});
