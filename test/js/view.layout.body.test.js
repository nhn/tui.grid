/* global setFixtures */

'use strict';

var DomState = require('../../src/js/domState');
var ModelManager = require('../../src/js/model/manager');
var PainterManager = require('../../src/js/painter/manager');
var ViewFactory = require('../../src/js/view/factory');
var SelectionLayerView = require('../../src/js/view/selectionLayer');
var BodyTableView = require('../../src/js/view/layout/bodyTable');

describe('view.layout.body', function() {
    var modelManager, body;

    beforeEach(function() {
        var domState = new DomState($('<div />')),
            painterManager, viewFactory;

        modelManager = new ModelManager({
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
            spyOn(modelManager.dataModel, 'indexOfRowKey').and.returnValue(2);
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
            modelManager.columnModel.set('selectType', 'radio');
            modelManager.dataModel.check = jasmine.createSpy('check');
            modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

            body._onMouseDown(eventMock);

            expect(modelManager.dataModel.check).toHaveBeenCalledWith(2);
        });

        it('if click the meta("_number") column, adjust indexes', function() {
            eventMock.target = null;
            spyOn(modelManager.dimensionModel, 'getIndexFromMousePosition').and.returnValue({
                column: 0,
                row: 2
            });
            spyOn(modelManager.columnModel, 'getVisibleColumnModelList').and.callFake(function(whichSide, withMeta) {
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
            selectionModel = modelManager.selectionModel;
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
                selectionModel = modelManager.selectionModel;
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
                modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

                expect(modelManager.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is an input element, it should focus the target cell and end the selection', function() {
                selectionModel = modelManager.selectionModel;
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
                modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(pageX, pageY, shiftKey, indexObj, isInput);

                expect(modelManager.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is not an input element, it should update SelectionModel', function() {
                var rowIndex = 2,
                    columnIndex = 1;

                selectionModel = modelManager.selectionModel;
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
                selectionModel = modelManager.selectionModel;
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
                selectionModel = modelManager.selectionModel;
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
            spyOn(modelManager.selectionModel, '_isAutoScrollable').and.returnValue(false);
            spyOn(modelManager.selectionModel, '_setScrolling').and.stub();
        });

        describe('selection이 없을경우', function() {
            it('움직인 거리가 10보다 클 경우 selection 을 시작한다.', function() {
                modelManager.focusModel.indexOf = jasmine.createSpy().and.returnValue({
                    row: 0,
                    column: 0
                });
                body._onMouseMove({
                    pageX: 20,
                    pageY: 20
                });
                expect(modelManager.selectionModel.hasSelection()).toBe(true);
            });

            it('움직인 거리가 10보다 작을 경우 selection 시작하지 않는다.', function() {
                body._onMouseMove({
                    pageX: 15,
                    pageY: 15
                });
                expect(modelManager.selectionModel.hasSelection()).toBe(false);
            });
        });

        describe('selection이 있는 경우', function() {
            beforeEach(function() {
                modelManager.selectionModel.start(0, 0);
            });

            it('기존의 셀렉션을 확장한다', function() {
                spyOn(modelManager.selectionModel, 'updateByMousePosition');
                body._onMouseMove({
                    pageX: 15,
                    pageY: 15
                });

                expect(modelManager.selectionModel.updateByMousePosition).toHaveBeenCalledWith(15, 15);
            });
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
            body.whichSide = 'L';
            body.render();
            expect(body.$el.css('overflow-x')).toBe('hidden');
            expect(body.$el.css('overflow-y')).not.toBe('hidden');

            body.whichSide = 'R';
            body.render();
            expect(body.$el.css('overflow-y')).toBe('hidden');
        });

        it('dimensionModel의 bodyHeight값에 따라 height를 설정한다.', function() {
            modelManager.dimensionModel.set('bodyHeight', 200);
            body.render();
            expect($(body.el).height()).toBe(200);
        });

        it('selectionLayer와 bodyTable이 생성되었는지 확인한다.', function() {
            body.render();

            expect(body._children.length).toBe(2);
            _.each(body._children, function(childView) {
                expect(childView instanceof SelectionLayerView || childView instanceof BodyTableView).toBe(true);
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
