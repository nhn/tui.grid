'use strict';

var $ = require('jquery');
var _ = require('underscore');

var ModelManager = require('model/manager');
var DomState = require('domState');
var Frame = require('view/layout/frame');
var FrameRside = require('view/layout/frame-rside');
var FrameLside = require('view/layout/frame-lside');
var classNameConst = require('common/classNameConst');
var frameConst = require('common/constMap').frame;

describe('Frame', function() {
    var modelManager, frame;
    var headerMock, bodyMock, summaryMock;
    var viewFactoryMock;

    headerMock = {
        el: $('<div />'),
        render: function() {
            return this;
        }
    };
    bodyMock = {
        el: $('<div />'),
        render: function() {
            return this;
        }
    };
    summaryMock = {
        el: $('<div />'),
        render: function() {
            return this;
        }
    };
    viewFactoryMock = {
        createHeader: function() {
            return headerMock;
        },
        createBody: function() {
            return bodyMock;
        },
        createSummary: function() {
            return summaryMock;
        }
    };

    function createFrame(FrameClass, whichSide) {
        return new FrameClass({
            whichSide: whichSide,
            dimensionModel: modelManager.dimensionModel,
            renderModel: modelManager.renderModel,
            viewFactory: viewFactoryMock
        });
    }

    beforeEach(function() {
        var domState = new DomState($('<div />'));
        modelManager = new ModelManager({}, domState);
    });

    describe('initialize', function() {
        beforeEach(function() {
            spyOn(Frame.prototype, 'render');

            frame = createFrame(Frame);
        });

        it('renderModel:columnModelChanged 이벤트 발생시 render()를 호출한다.', function() {
            modelManager.renderModel.trigger('columnModelChanged');
            expect(frame.render).toHaveBeenCalled();
        });
    });

    describe('render', function() {
        beforeEach(function() {
            frame = createFrame(Frame);
            spyOn(frame, 'beforeRender');
            spyOn(frame, 'afterRender');
            spyOn(frame, '_destroyChildren');
            frame.render();
        });

        it('beforeRender(), afterRender(), _destroyChildren()이 실행된다.', function() {
            expect(frame.beforeRender).toHaveBeenCalled();
            expect(frame.afterRender).toHaveBeenCalled();
            expect(frame._destroyChildren).toHaveBeenCalled();
        });

        it('header와 body를 생성하고 각각의 el을 this.el의 자식으로 추가한다.', function() {
            _.contains(frame._children, headerMock);
            _.contains(frame._children, bodyMock);

            expect(headerMock.el.parent().is(frame.el)).toBe(true);
            expect(headerMock.el.parent().is(frame.el)).toBe(true);
        });
    });

    describe('Lside', function() {
        beforeEach(function() {
            frame = createFrame(FrameLside);
        });

        it('whichSide의 값은 무조건 L이다.', function() {
            frame = createFrame(FrameLside, frameConst.R);
            expect(frame.whichSide).toBe(frameConst.L);
        });

        describe('_onColumnWidthChanged', function() {
            it('dimensionModel에 정의된 값으로 el의 넓이를 변경한다.', function() {
                frame.$el.width(10);
                modelManager.dimensionModel.set('lsideWidth', 100);

                expect(frame.$el.width()).toBe(100);
            });
        });

        describe('beforeRender()', function() {
            it('el의 display속성을 block으로, 넓이를 dimensionModel에 정의된 값으로 설정한다.', function() {
                frame.$el.css({
                    display: 'inline',
                    width: '10px'
                });

                modelManager.dimensionModel.set('lsideWidth', 100);
                frame.beforeRender();
                expect(frame.$el.width()).toBe(100);
                expect(frame.$el.css('display')).toBe('block');
            });
        });
    });

    describe('Rside', function() {
        it('whichSide의 값은 무조건 R이다.', function() {
            frame = createFrame(FrameRside, frameConst.L);
            expect(frame.whichSide).toBe(frameConst.R);
        });

        describe('beforeRender()', function() {
            it('dimensionModel에 정의된 값을 참조하여 el의 css속성을 설정한다.', function() {
                frame = createFrame(FrameRside);
                frame.$el.css({
                    display: 'inline',
                    width: '10px',
                    marginLeft: '10px'
                });

                modelManager.dimensionModel.set('lsideWidth', 100);
                modelManager.dimensionModel.set('rsideWidth', 200);

                frame.beforeRender();

                expect(frame.$el.css('display')).toBe('block');
                expect(frame.$el.css('marginLeft')).toBe('99px');
                expect(frame.$el.width()).toBe(201);
            });
        });

        describe('afterRender()', function() {
            describe('dimensionModel.scrollY가 true이면', function() {
                beforeEach(function() {
                    modelManager.dimensionModel.set({
                        headerHeight: 30,
                        bodyHeight: 200,
                        scrollY: true
                    });
                    frame = createFrame(FrameRside);
                });

                it('div.header_space를 생성하여 el의 자식으로 추가하고 css속성을 설정한다.', function() {
                    var $space;
                    frame.afterRender();
                    $space = frame.$el.find('.' + classNameConst.SCROLLBAR_HEAD);
                    expect($space.length).toBe(1);
                    expect($space.height()).toBe(28);
                });

                it('div.scrollbar_border생성하여 el의 자식으로 추가하고 css속성을 설정한다.', function() {
                    var scrollHeight = modelManager.dimensionModel.get('bodyHeight') -
                        modelManager.dimensionModel.getScrollXHeight();
                    frame.afterRender();
                    frame.$scrollBorder.is('.' + classNameConst.SCROLLBAR_BORDER);
                    expect(frame.$scrollBorder.length).toBe(1);
                    expect(frame.$scrollBorder.height()).toBe(scrollHeight);
                });
            });
        });
    });

    describe('create children view', function() {
        it('if position of summary is not set, two children views are created.', function() {
            modelManager.dimensionModel.set({
                summaryHeight: 30,
                scrollY: true
            });
            frame = createFrame(Frame);
            frame.render();

            expect(frame.$el.children().length).toBe(2);
        });

        it('if position of summary is set, three children views are created.', function() {
            modelManager.dimensionModel.set({
                summaryHeight: 30,
                summaryPosition: 'top',
                scrollY: true
            });
            frame = createFrame(Frame);
            frame.render();

            expect(frame.$el.children().length).toBe(3);
        });
    });
});
