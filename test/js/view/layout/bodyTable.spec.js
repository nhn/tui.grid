'use strict';

var DomState = require('domState');
var ModelManager = require('model/manager');
var PainterManager = require('painter/manager');
var ViewFactory = require('view/factory');
var RowListView = require('view/rowList');
var BodyTableView = require('view/layout/bodyTable');

describe('view.layout.body', function() {
    var modelManager, painterManager, bodyTable;

    beforeEach(function() {
        var domState = new DomState($('<div />')),
            viewFactory;

        modelManager = new ModelManager({
            columnModelList: [
                {columnName: 'c1'},
                {columnName: 'c2'}
            ]
        }, domState);
        spyOn(modelManager.dimensionModel, 'getColumnWidthList').and.returnValue([30, 40]);
        painterManager = new PainterManager({
            modelManager: modelManager
        });
        viewFactory = new ViewFactory({
            modelManager: modelManager,
            painterManager: painterManager
        });
        bodyTable = viewFactory.createBodyTable();
    });

    afterEach(function() {
        bodyTable.destroy();
    });

    describe('initialize', function() {
        it('whichSide is default R', function() {
            expect(bodyTable.whichSide).toBe('R');
        });
    });

    describe('render()', function() {
        it('table, tbody를 생성한다.', function() {
            bodyTable.render();
            expect(bodyTable.$el).toContainElement('table>tbody');
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var extraWidth = BodyTableView.EXTRA_WIDTH,
                $colgroup, $cols;

            bodyTable.render();

            $colgroup = bodyTable.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(2);

            expect($cols.eq(0).width()).toBe(30 - extraWidth);
            expect($cols.eq(0).attr('columnname')).toBe('c1');
            expect($cols.eq(1).width()).toBe(40 - extraWidth);
            expect($cols.eq(1).attr('columnname')).toBe('c2');
        });

        it('View.RowList를 생성하고, render를 실행한다.', function() {
            var rowListView;

            spyOn(RowListView.prototype, 'render').and.callThrough();
            bodyTable.render();

            rowListView = bodyTable._children[0];
            expect(rowListView instanceof RowListView).toBe(true);
            expect(RowListView.prototype.render).toHaveBeenCalled();
            expect(bodyTable.$el).toContainElement(rowListView.el);
        });
    });

    describe('dimensionModel의 columnWidthChanged 이벤트 발생시', function() {
        it('각 col요소의 넓이를 재설정한다.', function() {
            var extraWidth = BodyTableView.EXTRA_WIDTH,
                $cols;

            bodyTable.render();
            $cols = bodyTable.$el.find('col');

            $cols.eq(0).width(10);
            expect($cols.eq(0).width()).toBe(10);

            modelManager.dimensionModel.trigger('columnWidthChanged');
            expect($cols.eq(0).width()).toBe(30 - extraWidth);
        });
    });

    describe('when dummyRowCount (in renderModel) changed', function() {
        it('to greater than 0, set overflow to hidden and height to body height without scrollbarX height', function() {
            var expectedHeight = bodyTable.dimensionModel.get('bodyHeight') -
                bodyTable.dimensionModel.getScrollXHeight();

            bodyTable.renderModel.set('dummyRowCount', 5);
            expect(bodyTable.$el.css('overflow')).toBe('hidden');
            expect(bodyTable.$el.height()).toBe(expectedHeight);
        });

        it('to 0, remove overflow and height value of css', function() {
            bodyTable.renderModel.set('dummyRowCount', 0);
            expect(bodyTable.$el.css('overflow')).toBe('');
            expect(bodyTable.$el.height()).toBe(0);
        });
    });

    describe('when bodyHeight (in dimensionModel) changed', function() {
        it('set overflow and height if dummyRowCount (in renderModel) is greater than 0', function() {
            bodyTable.renderModel.set('dummyRowCount', 5, {silent: true});
            bodyTable.dimensionModel.set('bodyHeight', 100);

            expect(bodyTable.$el.css('overflow')).toBe('hidden');
            expect(bodyTable.$el.height()).toBe(100 - bodyTable.dimensionModel.getScrollXHeight());
        });

        it('remove overflow and height value of css', function() {
            bodyTable.renderModel.set('dummyRowCount', 0, {silent: true});
            bodyTable.dimensionModel.set('bodyHeight', 100);

            expect(bodyTable.$el.css('overflow')).toBe('');
            expect(bodyTable.$el.height()).toBe(0);
        });
    });

    describe('redrawTable()', function() {
        var tbodyHtml = '<tr><td>1-1</td><td>1-2</td></tr>',
            expectedHtml;

        beforeEach(function() {
            bodyTable.render();
            expectedHtml = $('<tbody />').append(tbodyHtml).html(); // 브라우저별로 생성된 innerHTML이 다를경우를 위한 처리
        });

        it('주어진 tbody의 innerHTML로 table 요소를 다시 생성한다.', function() {
            var $table = bodyTable.$el.find('table'),
                $newTable;

            bodyTable.redrawTable(tbodyHtml);
            $newTable = bodyTable.$el.find('table');

            expect($table[0]).not.toBe($newTable[0]);
            expect($newTable.find('tbody').html()).toBe(expectedHtml);
        });

        it('생성된 table의 tbody를 반환한다.', function() {
            var $tbody = bodyTable.redrawTable(tbodyHtml);
            expect($tbody[0]).toBe(bodyTable.$el.find('tbody')[0]);
        });
    });

    describe('_attachAllTableEventHandlers()', function() {
        beforeEach(function() {
            painterManager.rowPainter = {
                getEventHandlerInfo: function() {
                    return {
                        focus: {
                            selector: 'input',
                            handler: 'focusHandler'
                        }
                    }
                }
            };
            painterManager.cellPainters = {
                text: {
                    getEventHandlerInfo: function() {
                        return {
                            blur: {
                                selector: 'span',
                                handler: 'blurHandler'
                            }
                        }
                    }
                },
                normal: {
                    getEventHandlerInfo: function() {
                        return {
                            change: {
                                selector: 'textarea',
                                handler: 'changeHandler'
                            }
                        }
                    }
                }
            }
            spyOn(bodyTable.$el, 'on');
        });

        it('Attach all event handlers in the rowPainter and cellPainters', function() {
            bodyTable._attachAllTableEventHandlers();
            expect(bodyTable.$el.on.calls.count()).toBe(3);
            expect(bodyTable.$el.on).toHaveBeenCalledWith('focus', 'tr input', 'focusHandler');
            expect(bodyTable.$el.on).toHaveBeenCalledWith('blur', 'td[edit-type=text] span', 'blurHandler');
            expect(bodyTable.$el.on).toHaveBeenCalledWith('change', 'td[edit-type=normal] textarea', 'changeHandler');
        });
    });
});
