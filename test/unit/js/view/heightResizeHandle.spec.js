'use strict';

var Model = require('base/model');
var HeightResizeHandleView = require('view/heightResizeHandle');

xdescribe('view.heightResizeHandler', function() {
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
