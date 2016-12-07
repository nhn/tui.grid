'use strict';

var DomState = require('domState');
var ModelManager = require('model/manager');
var PainterManager = require('painter/manager');
var ViewFactory = require('view/factory');
var SelectionLayerView = require('view/selectionLayer');
var FocusLayerView = require('view/focusLayer');
var BodyTableView = require('view/layout/bodyTable');
var constMap = require('common/constMap');
var attrNameMap = constMap.attrName;
var selTypeConst = constMap.selectionType;
var frameConst = require('common/constMap').frame;

describe('view.layout.body', function() {
    var modelManager, body;

    beforeEach(function() {
        var domState = new DomState($('<div />'));
        var painterManager, viewFactory;

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
            expect(body.whichSide).toBe(frameConst.R);
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
            var $tds;

            $tr = $(
                '<tr style="height: 30px;">' +
                    '<td class="editable" align="left">2-1</td>' +
                    '<td class="editable" align="left">2-2</td>' +
                '</tr>'
            );
            $tr.attr(attrNameMap.ROW_KEY, '2');
            $tds = $tr.find('td').attr(attrNameMap.EDIT_TYPE, 'text');
            $tds.eq(0).attr(attrNameMap.COLUMN_NAME, 'c1');
            $tds.eq(1).attr(attrNameMap.COLUMN_NAME, 'c2');

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

            expect(body._controlStartAction).toHaveBeenCalledWith({
                pageX: 0,
                pageY: 0,
                shiftKey: false
            }, {
                column: 1,
                row: 2
            }, 'c2', false);
        });

        it('if the grid has a selectType-radio option, check the row', function() {
            modelManager.columnModel.set('selectType', 'radio');
            modelManager.dataModel.check = jasmine.createSpy('check');
            modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

            body._onMouseDown(eventMock);

            expect(modelManager.dataModel.check).toHaveBeenCalledWith('2');
        });
    });

    describe('_controlStartAction', function() {
        var selectionModel,
            inputData,
            isInput, indexObj, columnName;

        it('if selectionModel is disabled, should interrupt action', function() {
            selectionModel = modelManager.selectionModel;
            inputData = {
                pageX: 0,
                pageY: 0,
                shiftKey: false
            };
            isInput = false;
            columnName = 'c2';
            indexObj = {
                row: 2,
                column: 1
            };
            spyOn(body, '_attachDragEvents');
            selectionModel.disable();

            body._controlStartAction(inputData, indexObj, columnName, isInput);

            expect(body._attachDragEvents).not.toHaveBeenCalled();
            selectionModel.enable();
        });

        describe('when target is not meta column', function() {
            it('without shiftKey, it should focus the target cell and end the selection', function() {
                selectionModel = modelManager.selectionModel;
                inputData = {
                    pageX: 0,
                    pageY: 0,
                    shiftKey: false
                };
                isInput = false;
                columnName = 'c2';
                indexObj = {
                    row: 2,
                    column: 1
                };
                spyOn(selectionModel, 'end');
                modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(inputData, indexObj, columnName, isInput);

                expect(modelManager.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is an input element, ' +
                'it should focus the target cell and end the selection', function() {
                selectionModel = modelManager.selectionModel;
                inputData = {
                    pageX: 0,
                    pageY: 0,
                    shiftKey: false
                };
                isInput = true;
                columnName = 'c2';
                indexObj = {
                    row: 2,
                    column: 1
                };
                spyOn(selectionModel, 'end');
                modelManager.focusModel.focusAt = jasmine.createSpy('focusAt');

                body._controlStartAction(inputData, indexObj, columnName, isInput);

                expect(modelManager.focusModel.focusAt).toHaveBeenCalledWith(indexObj.row, indexObj.column);
                expect(selectionModel.end).toHaveBeenCalled();
            });

            it('with shiftKey and target is not an input element, it should update SelectionModel', function() {
                var rowIndex = 2,
                    columnIndex = 1;

                selectionModel = modelManager.selectionModel;
                inputData = {
                    pageX: 0,
                    pageY: 0,
                    shiftKey: true
                };
                isInput = false;
                columnName = 'c2';
                indexObj = {
                    row: rowIndex,
                    column: columnIndex
                };
                spyOn(selectionModel, 'update');

                body._controlStartAction(inputData, indexObj, columnName, isInput);

                expect(selectionModel.update).toHaveBeenCalledWith(rowIndex, columnIndex);
            });
        });

        describe('target is the "_number" column', function() {
            it('without shiftKey, it should select a row', function() {
                selectionModel = modelManager.selectionModel;
                inputData = {
                    pageX: 0,
                    pageY: 0,
                    shiftKey: false
                };
                isInput = false;
                columnName = '_number';
                indexObj = {
                    row: 2,
                    column: 1
                };
                spyOn(selectionModel, 'selectRow');

                body._controlStartAction(inputData, indexObj, columnName, isInput);
                expect(selectionModel.selectRow).toHaveBeenCalledWith(indexObj.row);
            });

            it('with shiftKey, it should update selection with row state', function() {
                selectionModel = modelManager.selectionModel;
                inputData = {
                    pageX: 0,
                    pageY: 0,
                    shiftKey: true
                };
                isInput = false;
                columnName = '_number';
                indexObj = {
                    row: 2,
                    column: 1
                };
                spyOn(selectionModel, 'update');

                body._controlStartAction(inputData, indexObj, columnName, isInput);
                expect(selectionModel.update).toHaveBeenCalledWith(indexObj.row, 0, selTypeConst.ROW);
            });
        });

        it('target is the meta column and not the "_number" column', function() {
            inputData = {
                pageX: 0,
                pageY: 0,
                shiftKey: false
            };
            isInput = false;
            columnName = '_button';
            indexObj = {
                row: 2,
                column: 1
            };
            spyOn(body, '_attachDragEvents');

            body._controlStartAction(inputData, indexObj, columnName, isInput);
            expect(body._attachDragEvents).not.toHaveBeenCalled();
        });
    });

    describe('_onMouseMove', function() {
        beforeEach(function() {
            body.mouseDownX = 10;
            body.mouseDownY = 10;
            spyOn(modelManager.selectionModel, '_isAutoScrollable').and.returnValue(false);
            spyOn(modelManager.selectionModel, '_setScrolling').and.stub();
            spyOn(modelManager.selectionModel, 'updateByMousePosition');
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
                expect(modelManager.selectionModel.updateByMousePosition).toHaveBeenCalledWith(20, 20);
            });

            it('움직인 거리가 10보다 작을 경우 selection 시작하지 않는다.', function() {
                body._onMouseMove({
                    pageX: 15,
                    pageY: 15
                });
                expect(modelManager.selectionModel.updateByMousePosition).not.toHaveBeenCalled();
            });
        });

        describe('selection이 있는 경우', function() {
            beforeEach(function() {
                modelManager.selectionModel.start(0, 0);
            });

            it('기존의 셀렉션을 확장한다', function() {
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
