/* global setFixtures */

'use strict';

var Model = require('../../src/js/base/model');
var Collection = require('../../src/js/base/collection');

var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Frame = require('../../src/js/view/layout/frame');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var Selection = require('../../src/js/view/selection');
var CellFactory = require('../../src/js/view/cellFactory');
var FrameRside = require('../../src/js/view/layout/frame-rside');
var FrameLside = require('../../src/js/view/layout/frame-lside');
var LayoutHeader = require('../../src/js/view/layout/header');
var LayoutBody = require('../../src/js/view/layout/body');
var VirtualScrollBar = require('../../src/js/view/layout/virtualScrollBar');

describe('Frame', function() {
    var grid, frame;

    function createGridMock() {
        var mock = {
            $el: setFixtures('<div></div>'),
            options: {},
            option: function(name) {
                return this.options[name];
            },
            showGridLayer: function() {},
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
        mock.selection = new Selection({
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
        beforeEach(function() {
            frame = new FrameRside({
                grid: grid
            });
        });

        it('whichSide의 값은 무조건 R이다.', function() {
            frame = new FrameRside({
                grid: grid,
                whichSide: 'L'
            });
            expect(frame.whichSide).toBe('R');
        });

        describe('beforeRender()', function() {
            it('grid.dimensionModel에 정의된 값을 참조하여 el의 css속성을 설정한다.', function() {
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
            describe('grid.option.scrollY가 true이면', function() {
                beforeEach(function() {
                    grid.options.scrollY = true;
                    grid.dimensionModel.set('headerHeight', 30);
                });

                it('div.space를 생성하여 el의 자식으로 추가하고 css속성을 설정한다.', function() {
                    var $space;
                    frame.afterRender();
                    $space = frame.$el.find('div.space');
                    expect($space.length).toBe(1);
                    expect($space.height()).toBe(28);
                });

                // describe('grid.option.notUseSmartRendering', function() {
                //     var barEl;
                //
                //     beforeEach(function() {
                //         barEl = $('<div />')[0];
                //         spyOn(FrameRside, 'VirtualScrollBar').and.callFake(function() {
                //             this.render = function() {
                //                 this.el = barEl;
                //                 return this;
                //             };
                //         });
                //     });
                //
                //     it('true가 아니면 VirtualScrollbar를 생성한다.', function() {
                //         frame.afterRender();
                //         expect($(barEl).parent().is(frame.$el)).toBe(true);
                //     });
                //
                //     it('true이면 VirtualScrollbar를 생성하지 않는다', function() {
                //         grid.options.notUseSmartRendering = true;
                //         expect(FrameRside.VirtualScrollBar).not.toHaveBeenCalled();
                //     });
                // });
            });
        });
    });

    describe('Rside.VirtualScrollBar', function() {
        var scrollbar;

        beforeEach(function() {
            scrollbar = new VirtualScrollBar({
                grid: grid
            });
        });

        afterEach(function() {
            scrollbar.destroy();
        });

        describe('_onMouseDown', function() {
            beforeEach(function() {
                spyOn(scrollbar, '_onMouseUp');
            });

            it('document에 mouseUp 이벤트 핸들러를 설정한다.', function() {
                scrollbar._onMouseDown();
                $(document).trigger('mouseup');
                expect(scrollbar._onMouseUp).toHaveBeenCalled();
            });

            it('hasFocus 프로퍼티가 적절히 변경되었는지 확인한다.', function() {
                scrollbar.hasFocus = false;
                scrollbar._onMouseDown();
                expect(scrollbar.hasFocus).toBe(true);
            });
        });

        describe('_onMouseUp', function() {
            beforeEach(function() {
                spyOn(scrollbar, '_onMouseUp').and.callThrough();
            });

            it('document에 걸린 mouseUp 이벤트 핸들러를 제거한다.', function() {
                scrollbar._onMouseUp();
                $(document).trigger('mouseup');
                expect(scrollbar._onMouseUp.calls.count()).toBe(1);
            });

            it('hasFocus 프로퍼티가 적절히 변경되었는지 확인한다.', function() {
                scrollbar.hasFocus = true;
                scrollbar._onMouseUp();
                expect(scrollbar.hasFocus).toBe(false);
            });
        });

        describe('_onScrollTopChange', function() {
            beforeEach(function() {
                jasmine.getFixtures().set($('<div id="wrapper" />'));
            });

            it('grid.renderModel의 change:scrollTop 이벤트 발생시 호출된다.', function() {
                spyOn(VirtualScrollBar.prototype, '_onScrollTopChange');
                scrollbar.destroy();
                scrollbar = new VirtualScrollBar({
                    grid: grid
                });
                $('#wrapper').append(scrollbar.el);
                grid.renderModel.set('scrollTop', 40);
                expect(scrollbar._onScrollTopChange).toHaveBeenCalled();
            });

            it('엘리먼트에서 표현하지 못하는 scrollTop 값이면 정상 값으로 정정한다.', function() {
                $('#wrapper').append(scrollbar.el);
                scrollbar._onScrollTopChange({}, 40);
                expect(grid.renderModel.get('scrollTop')).toBe(0);
            });
        });

        describe('_onDimensionChange', function() {
            beforeEach(function() {
                spyOn(scrollbar, 'render');
            });

            it('dimension모델의 headerHeight 혹은 bodyHeight이 변경되면 render가 호출된다.', function() {
                grid.dimensionModel.set('headerHeight', 40);
                expect(scrollbar.render.calls.count()).toBe(1);
                grid.dimensionModel.set('bodyHeight', 40);
                expect(scrollbar.render.calls.count()).toBe(2);
                grid.dimensionModel.set('toolbarHeight', 40);
                expect(scrollbar.render.calls.count()).toBe(2); // 호출 안됨
            });
        });

        describe('render()', function() {
            beforeEach(function() {
                grid.dimensionModel.set({
                    bodyHeight: 100,
                    headerHeight: 20
                }, {silent: true});
            });

            it('grid.dimensionModel의 값을 참조하여 el의 css속성을 설정한다.', function() {
                scrollbar.render();

                expect(scrollbar.$el.height()).toBe(100);
                expect(scrollbar.$el.css('top')).toBe('20px');
                expect(scrollbar.$el.css('display')).toBe('block');
            });

            it('div.content를 생성하여 자식으로 추가한다.', function() {
                scrollbar.render();

                expect(scrollbar.$el.find('div.content').length).toBe(1);
            });

            it('grid.options.scrollX가 true이면 scrollBarSize만큼 height를 감소시킨다.', function() {
                grid.options.scrollX = true;
                grid.scrollBarSize = 10;

                scrollbar.render();

                expect(scrollbar.$el.height()).toBe(90);
            });
        });
    });
});
