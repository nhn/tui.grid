'use strict';

var Collection = require('base/collection');
var ColumnModel = require('model/data/columnModel');
var DimensionModel = require('model/dimension');
var ResizeHandler = require('view/layout/resizeHandler');
var DomState = require('domState');

describe('ResizeHandler', function() {
    var columnModel, dimensionModel, handler, $handles;

    function initialize() {
        columnModel = new ColumnModel({
            columnModelList: [
                {
                    title: 'c1',
                    columnName: 'c1',
                    width: 30
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    width: 40
                }
            ]
        });
        dimensionModel = new DimensionModel({}, {
            columnModel: columnModel,
            dataModel: new Collection(),
            domState: new DomState()
        });
    }

    beforeEach(function() {
        initialize();
        handler = new ResizeHandler({
            columnModel: columnModel,
            dimensionModel: dimensionModel,
            whichSide: 'R'
        });
    });

    afterEach(function() {
        handler.destroy();
    });


    describe('render()', function() {
        beforeEach(function() {
            handler.render();
            $handles = handler.$el.children('div');
        });

        it('resize handler div 리스트를 잘 생성하는지 확인한다.', function() {
            expect($handles.eq(0).attr('data-column-name')).toBe('c1');
            expect($handles.eq(1).attr('data-column-name')).toBe('c2');
            expect($handles.length).toBe(2);
        });

        it('마지막 resize handler 에 resize_handle_last css 클래스가 할당되는지 확인한다.', function() {
            expect($handles.filter('.resize_handle_last').is(':last-child')).toBe(true);
        });

        it('height와 margin을 headerHeight값으로 설정한다.', function() {
            dimensionModel.set('headerHeight', 50);
            handler.render();
            expect(handler.$el.css('marginTop')).toBe('-50px');
            expect(handler.$el.height()).toBe(50);
        });
    });

    describe('_getHandlerColumnIndex', function() {
        beforeEach(function() {
            columnModel.set('columnFixCount', 2);
        });

        afterEach(function() {
            columnModel.set('columnFixCount', 0);
        });

        it('R side 일때 columnFixCount를 고려하여 실제 columnIndex 를 계산한다.', function() {
            handler.whichSide = 'R';
            expect(handler._getHandlerColumnIndex(0)).toBe(3);
            expect(handler._getHandlerColumnIndex(1)).toBe(4);
            expect(handler._getHandlerColumnIndex(2)).toBe(5);
        });

        it('L side 일때 columnFixCount를 고려하여 실제 columnIndex 를 계산한다.', function() {
            handler.whichSide = 'L';
            expect(handler._getHandlerColumnIndex(0)).toBe(0);
            expect(handler._getHandlerColumnIndex(1)).toBe(1);
            expect(handler._getHandlerColumnIndex(2)).toBe(2);
            expect(handler._getHandlerColumnIndex(3)).toBe(3);
            expect(handler._getHandlerColumnIndex(4)).toBe(4);
        });
    });

    describe('_refreshHandlerPosition', function() {
        beforeEach(function() {
            handler.render();
            $handles = handler.$el.children('div.resize_handle').each(function() {
                $(this).css('position', 'absolute');
            });
        });

        it('columnWidthList 에 맞추어 div 포지션을 잘 세팅하는지 확인한다.', function() {
            handler._refreshHandlerPosition();
            expect($handles.eq(0).css('left')).toEqual('28px');
            expect($handles.eq(1).css('left')).toEqual('69px');
        });
    });

    // TODO: 내부 구현을 테스트하지 말 것
    describe('Mouse Event', function() {
        var mouseEvent;

        beforeEach(function() {
            handler.render();
            $handles = handler.$el.find('.resize_handle');
            mouseEvent = {
                target: $handles.eq(0).css('position', 'absolute').get(0),
                preventDefault: function() {}
            };
        });

        describe('onMouseDown', function() {
            it('마우스 이동을 위해 현재 위치의 데이터를 저장한다.', function() {
                handler._onMouseDown(mouseEvent);

                expect(handler.isResizing).toBe(true);
                expect(handler.$target.is($handles.eq(0))).toBe(true);
                expect(handler.initialLeft).toBe(28);
                expect(handler.initialOffsetLeft).toBe(0);
                expect(handler.initialWidth).toBe(30);
            });
        });

        describe('onMouseUp', function() {
            it('onMouseDown에서 저장한 데이터를 초기화한다. ', function() {
                handler._onMouseUp(mouseEvent);

                expect(handler.isResizing).toBe(false);
                expect(handler.$target).toBeNull();
                expect(handler.initialLeft).toBe(0);
                expect(handler.initialOffsetLeft).toBe(0);
                expect(handler.initialWidth).toBe(0);
            });
        });

        describe('_onMouseMove', function() {
            it('_onMouseMove가 호출되면 핸들러의 left를 마우스 위치만큼 조정하고 columnwidth 값을 설정한다.', function() {
                var $target = $handles.eq(0);

                mouseEvent.pageX = 300;
                handler._onMouseDown(mouseEvent);
                handler._onMouseMove(mouseEvent);
                expect($target.css('left')).toBe('300px');
                expect(dimensionModel.get('columnWidthList')[1]).toBe(302);
            });
        });

        describe('_calculateWidth', function() {
            beforeEach(function() {
                handler.initialOffsetLeft = 10;
                handler.initialLeft = 300;
                handler.initialWidth = 300;
            });
            it('마우스 위치인 pageX 로부터 width 를 계산한다.', function() {
                expect(handler._calculateWidth(200)).toBe(190);
                expect(handler._calculateWidth(500)).toBe(490);
                expect(handler._calculateWidth(11)).toBe(1);
            });
        });
    });
});
