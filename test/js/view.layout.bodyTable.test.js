/* global setFixtures */

'use strict';

var Model = require('../../src/js/base/model');
var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var Selection = require('../../src/js/model/selection');
var CellFactory = require('../../src/js/view/cellFactory');
var LayoutBodyTable = require('../../src/js/view/layout/bodyTable');
var RowListView = require('../../src/js/view/rowList');

describe('view.layout.body', function() {
    var grid, bodyTable;

    function createGridMock() {
        var mock = {
            $el: setFixtures('<div></div>'),
            options: {},
            option: function(name) {
                return this.options[name];
            },
            showGridLayer: function() {},
            dataModel: new Collection(),
            columnModel: new ColumnModelData({
                columnModelList: [
                    {
                        title: 'c1',
                        columnName: 'c1',
                        width: 30
                    }, {
                        title: 'c2',
                        columnName: 'c2',
                        width: 40
                    }
                ]
            }),
            focusModel: new Model()
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        mock.cellFactory = new CellFactory({
            grid: grid
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        bodyTable = new LayoutBodyTable({
            grid: grid
        });
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
            var extraWidth = LayoutBodyTable.EXTRA_WIDTH,
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

            rowListView = bodyTable._viewList[0];
            expect(rowListView instanceof RowListView).toBe(true);
            expect(RowListView.prototype.render).toHaveBeenCalled();
            expect(bodyTable.$el).toContainElement(rowListView.el);
        });
    });

    describe('grid.dimensionModel의 columnWidthChanged 이벤트 발생시', function() {
        it('각 col요소의 넓이를 재설정한다.', function() {
            var extraWidth = LayoutBodyTable.EXTRA_WIDTH,
                $cols;

            bodyTable.render();
            $cols = bodyTable.$el.find('col');

            $cols.eq(0).width(10);
            expect($cols.eq(0).width()).toBe(10);

            grid.dimensionModel.trigger('columnWidthChanged');
            expect($cols.eq(0).width()).toBe(30 - extraWidth);
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

    describe('attachTableEventHandler()', function() {
        var $cell1, $cell2, clickSpy, focusSpy;

        beforeEach(function() {
            $cell1 = $('<td edit-type="type1"><input /></td>');
            $cell2 = $('<td edit-type="type2" />');
            clickSpy = jasmine.createSpy('onClick');
            focusSpy = jasmine.createSpy('onFocus');
            bodyTable.render();
            grid.$el.append(bodyTable.$el);
            bodyTable.$el.off();

            bodyTable.$el.find('tbody')
                .append($('<tr />').append($cell1))
                .append($('<tr />').append($cell2));

            bodyTable.attachTableEventHandler('td[edit-type=type1]', {
                click: {
                    selector: 'input',
                    handler: clickSpy
                },
                focus: {
                    selector: '',
                    handler: focusSpy
                }
            });
        });

        it('selector로 지정한 셀에서의 이벤트만 Delegation 한다.', function() {
            $cell1.trigger('click');
            expect(clickSpy).not.toHaveBeenCalled();

            $cell2.trigger('click');
            expect(clickSpy).not.toHaveBeenCalled();

            $cell1.find('input').trigger('click');
            expect(clickSpy).toHaveBeenCalled();
        });

        it('지정된 이벤트만 Delegation 한다.', function() {
            $cell1.find('input').trigger('click');
            expect(focusSpy).not.toHaveBeenCalled();

            $cell1.trigger('focus');
            expect(focusSpy).toHaveBeenCalled();
        });
    });
});
