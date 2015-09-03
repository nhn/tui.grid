'use strict';

var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var LayoutToolbar = require('../../src/js/view/layout/toolbar');
var ResizeHandler = require('../../src/js/view/layout/toolbar/resizeHandler');
var Pagination = require('../../src/js/view/layout/toolbar/pagination');

describe('view.frame.toolbar', function() {
    var grid;

    function createGridMock() {
        var mock = {
            options: {
                toolbar: {}
            },
            option: function(name) {
                return this.options[name];
            },
            updateLayoutData: function() {},
            dataModel: new Collection(),
            columnModel: new ColumnModelData()
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [
            {
                title: 'c1',
                columnName: 'c1',
                width: 30
            }, {
                title: 'c2',
                columnName: 'c2',
                width: 40
            }
        ]);
    });

    describe('Toolbar instance 를 테스트한다.', function() {
        var toolbar;

        beforeEach(function() {
            toolbar = new LayoutToolbar({
                grid: grid
            });
        });

        afterEach(function() {
            toolbar.destroy();
        });

        describe('render 옵션에 따라 랜더링을 잘 하는지 확인한다.', function() {
            var options;

            beforeEach(function() {
                options = grid.options.toolbar;
            });

            describe('hasControlPanel', function() {
                it('hasControlPanel = false 일 때', function() {
                    options.hasControlPanel = false;
                    toolbar.render();
                    expect(toolbar.$el.find('.btn_setup')).not.toExist();
                });

                it('hasControlPanel = true 일 때', function() {
                    options.hasControlPanel = true;
                    toolbar.render();
                    expect(toolbar.$el.find('.btn_setup')).toExist();
                });
            });

            describe('hasResizeHandler', function() {
                it('hasResizeHandler = false 일 때', function() {
                    options.hasResizeHandler = false;
                    toolbar.render();
                    expect(toolbar.$el.find('.height_resize_bar')).not.toExist();
                });
                it('hasResizeHandler = true 일 때', function() {
                    options.hasResizeHandler = true;
                    toolbar.render();
                    expect(toolbar.$el.find('.height_resize_bar')).toExist();
                });
            });

            describe('hasPagination', function() {
                it('hasPagination = false 일 때', function() {
                    options.hasPagination = false;
                    toolbar.render();
                    expect(toolbar.$el.find('.pagination')).not.toExist();
                });
                it('hasPagination = true 일 때', function() {
                    options.hasPagination = true;
                    toolbar.render();
                    expect(toolbar.$el.find('.pagination')).toExist();
                });
            });
        });
    });

    describe('LayoutToolbar.ResizeHandler', function() {
        var resize,
            mouseEvent;

        beforeEach(function() {
            mouseEvent = {
                pageX: 100,
                pageY: 20,
                target: $('<div>'),
                preventDefault: function() {}
            };
            resize = new ResizeHandler({
                grid: grid
            });
        });

        afterEach(function() {
            resize.destroy();
        });

        // TODO: 내부 구현을 테스트하지 말 것
        describe('_onMouseDown', function() {
            beforeEach(function() {
                spyOn(resize, '_attachMouseEvent');
                spyOn(grid, 'updateLayoutData');
                resize._onMouseDown(mouseEvent);
            });

            it('mouseDown 이벤트가 발생하면 updateLayoutData 와 _attachMouseEvent 를 수행한다.', function() {
                expect(resize._attachMouseEvent).toHaveBeenCalled();
                expect(grid.updateLayoutData).toHaveBeenCalled();
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
                grid.dimensionModel.set({
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
                setTimeout(function () {
                    expect(grid.dimensionModel.get('bodyHeight')).toBe(200);
                    done();
                }, 10);
            });

            it('scrollbarSize와 rowHeight를 더한 값 이하로 높이가 줄어들지 않는다.', function(done) {
                mouseEvent.pageY = 100;
                resize._onMouseMove(mouseEvent);
                setTimeout(function () {
                    expect(grid.dimensionModel.get('bodyHeight')).toBe(30);
                    done();
                }, 10);
            });
        });
    });

    describe('LayoutToolbar.Pagination', function() {
        var pagination;

        beforeEach(function() {
            pagination = new Pagination({
                grid: grid
            });
            pagination.render();
        });

        afterEach(function() {
            pagination.destroy();
        });

        it('Pagination Instance를 잘 생성하는지 확인한다.', function() {
            expect(pagination.instance instanceof ne.component.Pagination).toBe(true);
        });

        it('이미 pagination instance가 존재하면 instance를 다시 생성하지 않는다', function() {
            var instance = pagination.instance;

            pagination.render();
            expect(pagination.instance).toBe(instance);
        });
    });
});
