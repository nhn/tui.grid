'use strict';

var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var DimensionModel = require('model/dimension');
var ToolbarModel = require('model/toolbar');
var ToolbarView = require('view/layout/toolbar');
var ResizeHandlerView = require('view/layout/toolbar/resizeHandler');
var PaginationView = require('view/layout/toolbar/pagination');
var DomState = require('domState');

describe('view.frame.toolbar', function() {
    var dataModel, columnModel, toolbarModel, dimensionModel, viewFactoryMock;

    function initialize() {
        var factoryMethodMock = function() {
            return {
                el: $('<div />'),
                render: function() {return this},
                destroy: function() {}
            }
        };

        columnModel = new ColumnModel();
        dataModel = new DataModel(null, {
            columnModel: columnModel
        });
        toolbarModel = new ToolbarModel();
        dimensionModel = new DimensionModel(null, {
            domState: new DomState($('<div />')),
            columnModel: columnModel,
            dataModel: dataModel
        });
        viewFactoryMock = {
            createToolbarControlPanel: factoryMethodMock,
            createToolbarPagination: factoryMethodMock,
            createToolbarResizeHandler: factoryMethodMock
        };
    }

    beforeEach(function() {
        initialize();
    });

    describe('Toolbar instance 를 테스트한다.', function() {
        var toolbarView;

        beforeEach(function() {
            toolbarView = new ToolbarView({
                toolbarModel: toolbarModel,
                dimensionModel: dimensionModel,
                viewFactory: viewFactoryMock
            });
        });

        afterEach(function() {
            toolbarView.destroy();
        });

        describe('render 옵션에 따라 랜더링을 잘 하는지 확인한다.', function() {
            describe('hasControlPanel', function() {
                beforeEach(function() {
                    spyOn(viewFactoryMock, 'createToolbarControlPanel').and.callThrough();
                });

                it('hasControlPanel = false 일 때', function() {
                    toolbarModel.set('hasControlPanel', false);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarControlPanel).not.toHaveBeenCalled();
                });

                it('hasControlPanel = true 일 때', function() {
                    toolbarModel.set('hasControlPanel', true);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarControlPanel).toHaveBeenCalled();
                });
            });

            describe('hasResizeHandler', function() {
                beforeEach(function() {
                    spyOn(viewFactoryMock, 'createToolbarResizeHandler').and.callThrough();
                });

                it('hasResizeHandler = false 일 때', function() {
                    toolbarModel.set('hasResizeHandler', false);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarResizeHandler).not.toHaveBeenCalled();
                });
                it('hasResizeHandler = true 일 때', function() {
                    toolbarModel.set('hasResizeHandler', true);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarResizeHandler).toHaveBeenCalled();
                });
            });

            describe('hasPagination', function() {
                beforeEach(function() {
                    spyOn(viewFactoryMock, 'createToolbarPagination').and.callThrough();
                });

                it('hasPagination = false 일 때', function() {
                    toolbarModel.set('hasPagination', false);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarPagination).not.toHaveBeenCalled();
                });
                it('hasPagination = true 일 때', function() {
                    toolbarModel.set('hasPagination', true);
                    toolbarView.render();
                    expect(viewFactoryMock.createToolbarPagination).toHaveBeenCalled();
                });
            });
        });
    });

    describe('LayoutToolbar.ResizeHandler', function() {
        var resize, mouseEvent;

        beforeEach(function() {
            mouseEvent = {
                pageX: 100,
                pageY: 20,
                target: $('<div>'),
                preventDefault: function() {}
            };
            resize = new ResizeHandlerView({
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

    describe('LayoutToolbar.Pagination', function() {
        var pagination;

        beforeEach(function() {
            pagination = new PaginationView({
                toolbarModel: toolbarModel
            });
            pagination.render();
        });

        afterEach(function() {
            pagination.destroy();
        });

        it('Pagination Instance를 잘 생성하는지 확인한다.', function() {
            expect(toolbarModel.get('pagination') instanceof tui.component.Pagination).toBe(true);
        });

        it('이미 pagination instance가 존재하면 instance를 다시 생성하지 않는다', function() {
            var instance = pagination.instance;

            pagination.render();
            expect(pagination.instance).toBe(instance);
        });
    });
});
