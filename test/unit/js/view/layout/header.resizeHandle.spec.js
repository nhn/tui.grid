'use strict';

var $ = require('jquery');

var Collection = require('base/collection');
var ColumnModel = require('model/data/columnModel');
var DimensionModel = require('model/dimension');
var ResizeHandle = require('view/layout/resizeHandle');
var CoordColumnModel = require('model/coordColumn');
var DomState = require('domState');

var classNameConst = require('common/classNameConst');
var ATTR_COLUMN_NAME = require('common/constMap').attrName.COLUMN_NAME;
var frameConst = require('common/constMap').frame;

describe('ResizeHandle', function() {
    var columnModel, dimensionModel, coordColumnModel, handler, $handles;

    function createResizeHandle(whichSide, frozenBorder) {
        columnModel = new ColumnModel({
            rowHeaders: ['rowNum'],
            columns: [
                {
                    title: 'c1',
                    name: 'c1',
                    width: 30
                }, {
                    title: 'c2',
                    name: 'c2',
                    width: 40
                }
            ]
        });
        dimensionModel = new DimensionModel(null, {
            columnModel: columnModel,
            dataModel: new Collection(),
            domState: new DomState()
        });
        coordColumnModel = new CoordColumnModel(null, {
            dimensionModel: dimensionModel,
            columnModel: columnModel
        });

        return new ResizeHandle({
            columnModel: columnModel,
            dimensionModel: dimensionModel,
            coordColumnModel: coordColumnModel,
            whichSide: whichSide,
            handleHeights: [],
            frozenBorder: frozenBorder
        });
    }

    beforeEach(function() {
        handler = createResizeHandle('R');
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
            expect($handles.eq(0).attr(ATTR_COLUMN_NAME)).toBe('c1');
            expect($handles.eq(1).attr(ATTR_COLUMN_NAME)).toBe('c2');
            expect($handles.length).toBe(2);
        });

        it('마지막 resize handler 에 resize_handle_last css 클래스가 할당되는지 확인한다.', function() {
            expect($handles.filter('.' + classNameConst.COLUMN_RESIZE_HANDLE_LAST).is(':last-child')).toBe(true);
        });

        it('height와 margin을 headerHeight값으로 설정한다.', function() {
            handler.dimensionModel.set('headerHeight', 50);
            handler.render();
            expect(handler.$el.css('marginTop')).toBe('-50px');
            expect(handler.$el.height()).toBe(50);
        });

        it('If the resize handle acts as a frozen border, the class name is added.', function() {
            handler = createResizeHandle('L', true);
            handler.dimensionModel.set('frozenBorderWidth', 10);
            handler.render();
            expect(handler.$el.hasClass(classNameConst.FROZEN_BORDER_TOP)).toBe(true);
        });
    });

    describe('_getHandlerColumnIndex', function() {
        beforeEach(function() {
            columnModel.set('frozenCount', 2);
        });

        afterEach(function() {
            columnModel.set('frozenCount', 0);
        });

        it('R side 일때 frozenCount 고려하여 실제 columnIndex 를 계산한다.', function() {
            handler.whichSide = frameConst.R;
            expect(handler._getHandlerColumnIndex(0)).toBe(3);
            expect(handler._getHandlerColumnIndex(1)).toBe(4);
            expect(handler._getHandlerColumnIndex(2)).toBe(5);
        });

        it('L side 일때 frozenCount 고려하여 실제 columnIndex 를 계산한다.', function() {
            handler.whichSide = frameConst.L;
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
            $handles = handler.$el.children('.' + classNameConst.COLUMN_RESIZE_HANDLE).each(function() {
                $(this).css('position', 'absolute');
            });
        });

        it('columnWidths에 맞추어 div 포지션을 잘 세팅하는지 확인한다.', function() {
            handler._refreshHandlerPosition();
            expect($handles.eq(0).css('left')).toEqual('28px');
            expect($handles.eq(1).css('left')).toEqual('69px');
        });
    });
});
