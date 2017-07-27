'use strict';

var $ = require('jquery');
var _ = require('underscore');

var DomState = require('domState');
var ModelManager = require('model/manager');
var PainterManager = require('painter/manager');
var ViewFactory = require('view/factory');
var SelectionLayerView = require('view/selectionLayer');
var FocusLayerView = require('view/focusLayer');
var BodyTableView = require('view/layout/bodyTable');
var frameConst = require('common/constMap').frame;

describe('view.layout.body', function() {
    var modelManager, body;

    beforeEach(function() {
        var domState = new DomState($('<div />'));
        var painterManager, viewFactory;

        modelManager = new ModelManager({
            columns: [
                {
                    title: 'c1',
                    name: 'c1',
                    width: 30
                },
                {
                    title: 'c2',
                    name: 'c2',
                    width: 40
                }
            ]
        }, domState);
        painterManager = new PainterManager({
            modelManager: modelManager
        });
        viewFactory = new ViewFactory({
            modelManager: modelManager,
            painterManager: painterManager
        });
        body = viewFactory.createBody();
    });

    afterEach(function() {
        body.destroy();
    });

    describe('initialize', function() {
        it('whichSide is default R', function() {
            expect(body.whichSide).toBe(frameConst.R);
        });
    });

    describe('_getMouseMoveDistance', function() {
        it('Calculates the distance between start position and current position', function() {
            var start = {
                pageX: 10,
                pageY: 10
            };
            var current = {
                pageX: 12,
                pageY: 12
            };
            var distance = body._getMouseMoveDistance(start, current);

            expect(distance).toBe(Math.round(Math.sqrt(8)));
        });
    });

    describe('render()', function() {
        it('whichSide값과 modelManager.dimensionModel의 scrollX, scrollY값에 따라 el의 overflow 속성을 설정한다.', function() {
            body.$el.css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            modelManager.dimensionModel.set({
                scrollX: true,
                scrollY: true
            });
            body.render();
            expect(body.$el.css('overflow-x')).toBe('visible');
            expect(body.$el.css('overflow-y')).toBe('visible');

            modelManager.dimensionModel.set({
                scrollX: false,
                scrollY: false
            });
            body.whichSide = frameConst.L;
            body.render();
            expect(body.$el.css('overflow-x')).toBe('hidden');
            expect(body.$el.css('overflow-y')).not.toBe('hidden');

            body.whichSide = frameConst.R;
            body.render();
            expect(body.$el.css('overflow-y')).toBe('hidden');
        });

        it('dimensionModel의 bodyHeight값에 따라 height를 설정한다.', function() {
            modelManager.dimensionModel.set('bodyHeight', 200);
            body.render();
            expect($(body.el).height()).toBe(200);
        });

        it('has 3 child view, BodyTable, SelectionLzyer, FocusLayer', function() {
            body.render();

            expect(body._children.length).toBe(3);

            expect(body._children[0] instanceof BodyTableView).toBe(true);
            expect(body._children[1] instanceof SelectionLayerView).toBe(true);
            expect(body._children[2] instanceof FocusLayerView).toBe(true);

            _.each(body._children, function(childView) {
                expect(body.$container).toContainElement(childView.el);
            });
        });
    });

    describe('modelManager.dimensionModel의 change:bodyHeight 이벤트 발생시', function() {
        it('el의 height를 dimensionModel의 bodyHeight 값으로 설정한다.', function() {
            modelManager.dimensionModel.set('bodyHeight', 70);
            expect(body.$el.height()).toBe(70);

            modelManager.dimensionModel.set('bodyHeight', 80);
            expect(body.$el.height()).toBe(80);
        });
    });
});
