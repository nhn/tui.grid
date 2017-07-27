'use strict';

var $ = require('jquery');

var DomState = require('domState');
var ModelManager = require('model/manager');
var PainterManager = require('painter/manager');
var ViewFactory = require('view/factory');
var RowListView = require('view/rowList');
var frameConst = require('common/constMap').frame;

var ATTR_COLUMN_NAME = require('common/constMap').attrName.COLUMN_NAME;

describe('view.layout.body', function() {
    var modelManager, painterManager, bodyTable;

    beforeEach(function() {
        var domState = new DomState($('<div />'));
        var viewFactory;

        modelManager = new ModelManager({
            columns: [
                {name: 'c1'},
                {name: 'c2'}
            ]
        }, domState);
        spyOn(modelManager.coordColumnModel, 'getWidths').and.returnValue([30, 40]);
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
            expect(bodyTable.whichSide).toBe(frameConst.R);
        });
    });

    describe('render()', function() {
        it('table, tbody를 생성한다.', function() {
            bodyTable.render();
            expect(bodyTable.$el).toContainElement('table>tbody');
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var $colgroup, $cols;

            bodyTable.render();

            $colgroup = bodyTable.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(2);

            expect($cols.eq(0).width()).toBe(31);
            expect($cols.eq(0).attr(ATTR_COLUMN_NAME)).toBe('c1');
            expect($cols.eq(1).width()).toBe(41);
            expect($cols.eq(1).attr(ATTR_COLUMN_NAME)).toBe('c2');
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
            var $cols;

            bodyTable.render();
            $cols = bodyTable.$el.find('col');

            $cols.eq(0).width(10);
            expect($cols.eq(0).width()).toBe(10);

            modelManager.coordColumnModel.trigger('columnWidthChanged');
            expect($cols.eq(0).width()).toBe(31);
        });
    });

    describe('when dummyRowCount (in renderModel) changed', function() {
        it('to greater than 0, set overflow to hidden ', function() {
            bodyTable.renderModel.set('dummyRowCount', 5);
            expect(bodyTable.$el.css('overflow')).toBe('hidden');
        });

        it('to 0, remove overflow and height value of css', function() {
            bodyTable.renderModel.set('dummyRowCount', 1, {silent: true});
            bodyTable.renderModel.set('dummyRowCount', 0);
            expect(bodyTable.$el.css('overflow')).toBe('visible');
        });
    });

    describe('when bodyHeight (in dimensionModel) changed', function() {
        it('if dummyRowCount is greater than 0, set bodyHeight based on dimension state', function() {
            bodyTable.renderModel.set('dummyRowCount', 5, {silent: true});
            bodyTable.dimensionModel.set('bodyHeight', 100);

            expect(bodyTable.$el.height()).toBe(100 - bodyTable.dimensionModel.getScrollXHeight());
        });

        it('if dummyRowCount is 0, remove height value of css', function() {
            bodyTable.renderModel.set('dummyRowCount', 0, {silent: true});
            bodyTable.dimensionModel.set('bodyHeight', 100);

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
        var textSpy = jasmine.createSpy('attachEventHandlers');
        var normalSpy = jasmine.createSpy('attachEventHandlers');

        beforeEach(function() {
            painterManager.cellPainters = {
                text: {
                    attachEventHandlers: textSpy
                },
                normal: {
                    attachEventHandlers: normalSpy
                }
            };
        });

        it('Attach all event handlers in the rowPainter and cellPainters', function() {
            bodyTable._attachAllTableEventHandlers();
            expect(textSpy).toHaveBeenCalledWith(bodyTable.$el, '');
            expect(normalSpy).toHaveBeenCalledWith(bodyTable.$el, '');
        });
    });
});
