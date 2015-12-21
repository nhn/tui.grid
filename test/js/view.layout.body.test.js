/* global setFixtures */

'use strict';

var Model = require('../../src/js/base/model');
var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var Dimension = require('../../src/js/model/dimension');
var DomState = require('../../src/js/domState');
var Renderer = require('../../src/js/model/renderer');
var Selection = require('../../src/js/model/selection');
var CellFactory = require('../../src/js/view/cellFactory');
var LayoutBody = require('../../src/js/view/layout/body');
var LayoutBodyTable = require('../../src/js/view/layout/bodyTable');
var SelectionLayer = require('../../src/js/view/selectionLayer');

describe('view.layout.body', function() {
    var grid, body;

    function createGridMock() {
        var $el = setFixtures('<div />');
        var mock = {
            $el: $el,
            dataModel: new Collection(),
            columnModel: new ColumnModelData({
                columnModelList: [
                    {
                        title: 'c1',
                        columnName: 'c1',
                        width: 30
                    },
                    {
                        title: 'c2',
                        columnName: 'c2',
                        width: 40
                    }
                ]
            }),
            focusModel: new Model(),
            domState: new DomState($el)
        };
        mock.dataModel.isRowSpanEnable = function() {
            return true;
        };
        mock.dataModel.indexOfRowKey= function() {
            return -1;
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
            grid: grid
        });

        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        body = new LayoutBody({
            grid: grid
        });
    });

    afterEach(function() {
        body.destroy();
    });

    describe('initialize', function() {
        it('whichSide is default R', function() {
            expect(body.whichSide).toBe('R');
        });
    });

    describe('_getMouseMoveDistance', function() {
        it('피타고라스의 정리를 이용해 거리를 잘 구하는지 확인한다.', function() {
            var distance;

            body.mouseDownX = 10;
            body.mouseDownY = 10;
            distance = body._getMouseMoveDistance(12, 12);
            expect(distance).toBe(Math.round(Math.sqrt(8)));
        });
    });

    describe('_onMouseDown', function() {
        var $tr, eventMock;

        beforeEach(function() {
            $tr = $(
                '<tr key="2" style="height: 30px;">' +
                    '<td columnname="c1" class="editable" edit-type="text-convertible" align="left">2-1</td>' +
                    '<td columnname="c2" class="editable" edit-type="text-convertible" align="left">2-2</td>' +
                '</tr>'
            );

            eventMock = {
                pageX: 0,
                pageY: 0,
                shiftKey: false,
                target: $tr.find('td')[1]
            };
            spyOn(grid.dataModel, 'indexOfRowKey').and.returnValue(2);
        });

        it('should call "_controlStartAction" with expected params', function() {
            spyOn(body, '_controlStartAction');

            body._onMouseDown(eventMock);

            expect(body._controlStartAction).toHaveBeenCalledWith(0, 0, false, {
                columnName: 'c2',
                column: 1,
                row: 2
            }, false)
        });

        it('if the grid has a selectType-radio option, check the row', function() {
            grid.columnModel.set('selectType', 'radio');
            grid.dataModel.check = jasmine.createSpy('check');
            grid.focusModel.focusAt = jasmine.createSpy('focusAt');

            body._onMouseDown(eventMock);

            expect(grid.dataModel.check).toHaveBeenCalledWith(2);
        });

        it('if click the meta("_number") column, adjust indexes', function() {
            eventMock.target = null;
            spyOn(grid.dimensionModel, 'getIndexFromMousePosition').and.returnValue({
                column: 0,
                row: 2
            });
            spyOn(grid.columnModel, 'getVisibleColumnModelList').and.callFake(function(whichSide, withMeta) {
                var returnValue = [
                    {
                        columnName: 'c1'
                    },
                    {
                        columnName: 'c2'
                    }
                ];
                if (withMeta) {
                    returnValue.unshift({
                        columnName: '_number'
                    });
                }
                return returnValue;
            });
            spyOn(body, '_controlStartAction');

            body._onMouseDown(eventMock);

            expect(body._controlStartAction).toHaveBeenCalledWith(0, 0, false, {
                columnName: '_number',
                column: -1,
                row: 2
            }, false)
        });
    });

    describe('_controlStartAction', function() {
        var selectionModel,
            pageX, pageY, shiftKey,
            isInput, indexObj;

        it('if selectionModel is disabled, should interrupt action', function() {
            selectionModel = grid.selectionModel;
            pageX = 0;
            pageY = 0;
            shiftKey = false;
            isInput = false;
            indexObj = {
                row: 2,
                column: 1,
                columnName: 'c2'
            };
            spyOn(body, '_attachDragEvents');
            selectionModel.disable();

            body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

            expect(body._attachDragEvents).not.toHaveBeenCalled();
            selectionModel.enable();
        });

        describe('when target is not meta column', function() {
            it('without shiftKey, it should focus the target cell and end the selection', function() {
                selectionModel = grid.selectionModel;
                pageX = 0;
                pageY = 0;
                shiftKey = false;
                isInput = false;
                indexObj = {
                    row: 2,
                    column: 1,
                    columnName: 'c2'
                };
                spyOn(selectionModel, 'end');
                grid.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

                expect(grid.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is an input element, it should focus the target cell and end the selection', function() {
                selectionModel = grid.selectionModel;
                pageX = 0;
                pageY = 0;
                shiftKey = true;
                isInput = true;
                indexObj = {
                    row: 2,
                    column: 1,
                    columnName: 'c2'
                };
                spyOn(selectionModel, 'end');
                grid.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

                expect(grid.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is not an input element, it should update SelectionModel', function() {
                var rowIndex = 2,
                    columnIndex = 1;

                selectionModel = grid.selectionModel;
                pageX = 0;
                pageY = 0;
                shiftKey = true;
                isInput = false;
                indexObj = {
                    row: rowIndex,
                    column: columnIndex,
                    columnName: 'c2'
                };
                spyOn(selectionModel, 'update');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

                expect(selectionModel.update).toHaveBeenCalledWith(rowIndex, columnIndex);
            });
        });

        describe('target is the "_number" column', function() {
            it('without shiftKey, it should select a row', function() {
                selectionModel = grid.selectionModel;
                pageX = 0;
                pageY = 0;
                shiftKey = false;
                isInput = false;
                indexObj = {
                    row: 2,
                    column: 1,
                    columnName: '_number'
                };
                spyOn(selectionModel, 'selectRow');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);
                expect(selectionModel.selectRow).toHaveBeenCalledWith(indexObj.row);
            });

            it('with shiftKey, it should update selection with row state', function() {
                selectionModel = grid.selectionModel;
                pageX = 0;
                pageY = 0;
                shiftKey = true;
                isInput = false;
                indexObj = {
                    row: 2,
                    column: 1,
                    columnName: '_number'
                };
                spyOn(selectionModel, 'update');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);
                expect(selectionModel.update).toHaveBeenCalledWith(indexObj.row, 0, 'row');
            });
        });

        it('target is the meta column and not the "_number" column', function() {
            pageX = 0;
            pageY = 0;
            shiftKey = false;
            isInput = false;
            indexObj = {
                row: 2,
                column: 1,
                columnName: '_button'
            };
            spyOn(body, '_detachDragEvents');

            body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);
            expect(body._detachDragEvents).toHaveBeenCalled();
        });
    });

    describe('_onMouseMove', function() {
        beforeEach(function() {
            body.mouseDownX = 10;
            body.mouseDownY = 10;
            spyOn(grid.selectionModel, '_isAutoScrollable').and.returnValue(false);
            spyOn(grid.selectionModel, '_setScrolling').and.stub();
        });

        describe('selection이 없을경우', function() {
            it('움직인 거리가 10보다 클 경우 selection 을 시작한다.', function() {
                grid.focusModel.indexOf = jasmine.createSpy().and.returnValue({
                    row: 0,
                    column: 0
                });
                body._onMouseMove({
                    pageX: 20,
                    pageY: 20
                });
                expect(grid.selectionModel.hasSelection()).toBe(true);
            });

            it('움직인 거리가 10보다 작을 경우 selection 시작하지 않는다.', function() {
                body._onMouseMove({
                    pageX: 15,
                    pageY: 15
                });
                expect(grid.selectionModel.hasSelection()).toBe(false);
            });
        });

        describe('selection이 있는 경우', function() {
            beforeEach(function() {
                grid.selectionModel.start(0, 0);
            });

            it('기존의 셀렉션을 확장한다', function() {
                spyOn(grid.selectionModel, 'updateByMousePosition');
                body._onMouseMove({
                    pageX: 15,
                    pageY: 15
                });

                expect(grid.selectionModel.updateByMousePosition).toHaveBeenCalledWith(15, 15);
            });
        });
    });

    describe('render()', function() {
        it('whichSide값과 grid.dimensionModel의 scrollX, scrollY값에 따라 el의 overflow 속성을 설정한다.', function() {
            body.$el.css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            grid.dimensionModel.set({
                scrollX: true,
                scrollY: true
            });
            body.render();
            expect(body.$el.css('overflow-x')).toBe('visible');
            expect(body.$el.css('overflow-y')).toBe('visible');

            grid.dimensionModel.set({
                scrollX: false,
                scrollY: false
            });
            body.whichSide = 'L';
            body.render();
            expect(body.$el.css('overflow-x')).toBe('hidden');
            expect(body.$el.css('overflow-y')).not.toBe('hidden');

            body.whichSide = 'R';
            body.render();
            expect(body.$el.css('overflow-y')).toBe('hidden');
        });

        it('dimensionModel의 bodyHeight값에 따라 height를 설정한다.', function() {
            grid.dimensionModel.set('bodyHeight', 200);
            body.render();
            expect($(body.el).height()).toBe(200);
        });

        it('selectionLayer와 bodyTable이 생성되었는지 확인한다.', function() {
            body.render();

            expect(body._viewList.length).toBe(2);
            _.each(body._viewList, function(childView) {
                expect(childView instanceof SelectionLayer || childView instanceof LayoutBodyTable).toBe(true);
                expect(body.$container).toContainElement(childView.el);
            });
        });
    });

    describe('grid.dimensionModel의 change:bodyHeight 이벤트 발생시', function() {
        it('el의 height를 dimensionModel의 bodyHeight 값으로 설정한다.', function() {
            grid.dimensionModel.set('bodyHeight', 70);
            expect(body.$el.height()).toBe(70);

            grid.dimensionModel.set('bodyHeight', 80);
            expect(body.$el.height()).toBe(80);
        });
    });
});
