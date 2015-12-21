/* global setFixtures */

'use strict';

var Model = require('../../src/js/base/model');
var Collection = require('../../src/js/base/collection');

var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Frame = require('../../src/js/view/layout/frame');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var Selection = require('../../src/js/model/selection');
var CellFactory = require('../../src/js/view/cellFactory');
var FrameRside = require('../../src/js/view/layout/frame-rside');
var FrameLside = require('../../src/js/view/layout/frame-lside');
var LayoutHeader = require('../../src/js/view/layout/header');
var LayoutBody = require('../../src/js/view/layout/body');

describe('Frame', function() {
    var grid, frame;

    function createGridMock() {
        var mock = {
            $el: setFixtures('<div></div>'),
            columnModel: new ColumnModelData(),
            dataModel: new Collection(),
            focusModel: new Model()
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        mock.selectionModel = new Selection({
            grid: mock
        });
        mock.cellFactory = new CellFactory({
            grid: mock
        });
        mock.dataModel = new RowListData([], {
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
    });

    describe('initialize', function() {
        beforeEach(function() {
            spyOn(Frame.prototype, 'render');
            spyOn(Frame.prototype, '_onColumnWidthChanged');

            frame = new Frame({
                grid: grid
            });
        });

        it('grid.renderModel:columnModelChanged 이벤트 발생시 render()를 호출한다.', function() {
            grid.renderModel.trigger('columnModelChanged');
            expect(frame.render).toHaveBeenCalled();
        });

        it('grid.dimensionModel:columnWidthChanged 이벤트 발생시 _onColumnWidthChanged()를 호출한다.', function() {
            grid.dimensionModel.trigger('columnWidthChanged');
            expect(frame._onColumnWidthChanged).toHaveBeenCalled();
        });

        it('option으로 whichSide를 지정할 수 있다. 기본값은 R이다', function() {
            expect(frame.whichSide).toBe('R');
            frame = new Frame({
                grid: grid,
                whichSide: 'L'
            });
            expect(frame.whichSide).toBe('L');
        });
    });

    describe('render', function() {
        beforeEach(function() {
            spyOn(frame, 'beforeRender');
            spyOn(frame, 'afterRender');
            spyOn(frame, 'destroyChildren');
            frame.render();
        });

        it('beforeRender(), afterRender(), destroyChildren()이 실행된다.', function() {
            expect(frame.beforeRender).toHaveBeenCalled();
            expect(frame.afterRender).toHaveBeenCalled();
            expect(frame.destroyChildren).toHaveBeenCalled();
        });

        it('header와 body를 생성하고 각각의 el을 this.el의 자식으로 추가한다.', function() {
            expect(frame.header instanceof LayoutHeader).toBe(true);
            expect(frame.body instanceof LayoutBody).toBe(true);

            expect($(frame.header.el).parent().is(frame.$el)).toBe(true);
            expect($(frame.body.el).parent().is(frame.$el)).toBe(true);
        });
    });

    describe('Lside', function() {
        beforeEach(function() {
            frame = new FrameLside({
                grid: grid
            });
        });

        it('whichSide의 값은 무조건 L이다.', function() {
            frame = new FrameLside({
                grid: grid,
                whichSide: 'R'
            });
            expect(frame.whichSide).toBe('L');
        });

        describe('_onColumnWidthChanged', function() {
            it('dimensionModel에 정의된 값으로 el의 넓이를 변경한다.', function() {
                frame.$el.width(10);
                grid.dimensionModel.set('lsideWidth', 100);
                frame._onColumnWidthChanged();

                expect(frame.$el.width()).toBe(100);
            });
        });

        describe('beforeRender()', function() {
            it('el의 display속성을 block으로, 넓이를 dimensionModel에 정의된 값으로 설정한다.', function() {
                frame.$el.css({
                    display: 'inline',
                    width: '10px'
                });

                grid.dimensionModel.set('lsideWidth', 100);
                frame.beforeRender();
                expect(frame.$el.width()).toBe(100);
                expect(frame.$el.css('display')).toBe('block');
            });
        });
    });

    describe('Rside', function() {
        it('whichSide의 값은 무조건 R이다.', function() {
            frame = new FrameRside({
                grid: grid,
                whichSide: 'L'
            });
            expect(frame.whichSide).toBe('R');
        });

        describe('beforeRender()', function() {
            it('grid.dimensionModel에 정의된 값을 참조하여 el의 css속성을 설정한다.', function() {
                frame = new FrameRside({
                    grid: grid
                });
                frame.$el.css({
                    display: 'inline',
                    width: '10px',
                    marginLeft: '10px'
                });

                grid.dimensionModel.set('lsideWidth', 100);
                grid.dimensionModel.set('rsideWidth', 200);

                frame.beforeRender();

                expect(frame.$el.css('display')).toBe('block');
                expect(frame.$el.css('marginLeft')).toBe('100px');
                expect(frame.$el.width()).toBe(200);
            });
        });

        describe('afterRender()', function() {
            describe('grid.dimensionModel.scrollY가 true이면', function() {
                beforeEach(function() {
                    grid.dimensionModel.set({
                        headerHeight: 30,
                        bodyHeight: 200,
                        scrollY: true
                    });
                    frame = new FrameRside({
                        grid: grid
                    });
                });

                it('div.header_space를 생성하여 el의 자식으로 추가하고 css속성을 설정한다.', function() {
                    var $space;
                    frame.afterRender();
                    $space = frame.$el.find('div.header_space');
                    expect($space.length).toBe(1);
                    expect($space.height()).toBe(28);
                });

                it('div.scrollbar_border생성하여 el의 자식으로 추가하고 css속성을 설정한다.', function() {
                    var scrollHeight = grid.dimensionModel.get('bodyHeight') - grid.dimensionModel.getScrollXHeight();
                    frame.afterRender();
                    frame.$scrollBorder.is('div.scrollbar_border');
                    expect(frame.$scrollBorder.length).toBe(1);
                    expect(frame.$scrollBorder.height()).toBe(scrollHeight);
                });
            });
        });
    });
});
