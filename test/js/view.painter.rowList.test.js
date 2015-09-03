/* global setFixtures */

'use strict';

var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var Focus = require('../../src/js/model/focus');
var CellFactory = require('../../src/js/view/cellFactory');
var RowListModel = require('../../src/js/model/rowList');
var RowListView = require('../../src/js/view/rowList');

describe('View.RowList', function() {
    var grid, rowListView, $tableContainer;

    function createGridMock() {
        var mock = {
            $el: setFixtures('<div />'),
            hideGridLayer: function () {},
            focusClipboard: function() {},
            columnModel: new ColumnModelData(),
            getElement: function(rowKey, columnName) {
                rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
                return this.$el.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
            }
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.dataModel = new RowListData([], {
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        mock.focusModel = new Focus({
            grid: mock
        });
        mock.cellFactory = new CellFactory({
            grid: mock
        });
        return mock;
    }

    function redrawTable(html) {
        $tableContainer[0].innerHTML = '<table><tbody>' + html + '</tbody></table>';
        return $tableContainer.find('tbody');
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [{
            columnName: 'c1',
            editOption: {
                type: 'normal'
            }
        }, {
            columnName: 'c2',
            editOption: {
                type: 'text'
            }
        }, {
            columnName: 'c3',
            editOption: {
                type: 'select',
                list: [
                    {text: 's1', value: 's1'},
                    {text: 's2', vlaue: 's2'}
                ]
            }
        }]);
        grid.dataModel.set([
            {
                c1: '0-1',
                c2: '0-2',
                c3: 's1'
            }, {
                c1: '1-1',
                c2: '1-2',
                c3: 's2'
            }
        ], {parse: true});

        grid.renderModel.refresh();
        $tableContainer = $('<div />').appendTo(grid.$el);
        redrawTable('');

        rowListView = new RowListView({
            whichSide: 'R',
            grid: grid,
            el: setFixtures('<table><tbody></tbody></table>').find('tbody'),
            collection: grid.renderModel.getCollection('R'),
            bodyView: {
                attachTableEventHandler: function() {},
                redrawTable: redrawTable
            }
        });
        rowListView.render();
    });

    afterEach(function() {
        rowListView.destroy();
    });

    describe('View.Painter.Row', function() {
        var rowPainter;

        beforeEach(function() {
            rowPainter = rowListView.rowPainter;
        });

        describe('_getEditType', function() {
            it('_number 일 경우 isEditable 과 관계없이 무조건 _number 을 리턴한다.', function() {
                expect(rowPainter._getEditType('_number', {isEditable: false})).toEqual('_number');
                expect(rowPainter._getEditType('_number', {isEditable: true})).toEqual('_number');
            });

            it('isEditable이 false 이고 _number가 아닐 경우 무조건 normal을 리턴한다.', function() {
                expect(rowPainter._getEditType('c1', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('c2', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('c3', {isEditable: false})).toEqual('normal');
            });

            it('그 외의 경우 정확한 editType 을 반환한다.', function() {
                expect(rowPainter._getEditType('c1', {isEditable: true})).toEqual('normal');
                expect(rowPainter._getEditType('c2', {isEditable: true})).toEqual('text');
                expect(rowPainter._getEditType('c3', {isEditable: true})).toEqual('select');
            });
        });
    });

    describe('SmartRender 사용시 RowList.render()', function() {
        var smartRenderer, $trs;

        function init(sampleData) {
            smartRenderer = new Renderer({
                grid: grid
            });
            grid.dataModel.lastRowKey = -1;
            grid.dataModel.reset(sampleData, {parse: true});
        }

        function setCollectionRange(from, to) {
            var collection;

            smartRenderer.refresh();
            collection = smartRenderer.getCollection('R');
            rowListView.collection = new RowListModel(collection.slice(from, to), {grid: grid});
            rowListView.render();
            $trs = rowListView.$el.children('tr');
        }

        describe('rowKey 순으로 정렬되어 있을 때', function() {
            var sampleData = (function() {
                var i, data = [];
                for (i = 0; i < 100; i += 1) {
                    data.push({c1: i});
                }
                return data;
            }());

            beforeEach(function() {
                grid.columnModel.set('columnModelList', [{columnName: 'c1'}]);
                init(sampleData);
            });

            it('초기 데이터 할당', function() {
                setCollectionRange(0, 10);

                expect($trs.length).toBe(10);
                expect($trs.first().attr('key')).toBe('0');
                expect($trs.last().attr('key')).toBe('9');
            });

            it('first와 last 모두 증가할 때 (스크롤 내릴 때)', function() {
                setCollectionRange(0, 10);
                setCollectionRange(5, 16);

                expect($trs.length).toBe(11);
                expect($trs.first().attr('key')).toBe('5');
                expect($trs.last().attr('key')).toBe('15');
            });

            it('first와 last 모두 감소할 때 (스크롤 올릴 때)', function() {
                setCollectionRange(20, 30);
                setCollectionRange(15, 22);

                expect($trs.length).toBe(7);
                expect($trs.first().attr('key')).toBe('15');
                expect($trs.last().attr('key')).toBe('21');
            });

            it('first는 변함없고 last가 증가할 때(사이즈가 변경될 때)', function() {
                setCollectionRange(0, 10);
                setCollectionRange(0, 20);

                expect($trs.length).toBe(20);
                expect($trs.first().attr('key')).toBe('0');
                expect($trs.last().attr('key')).toBe('19');
            });

            it('first는 변함없고 last가 감소할 때(사이즈가 줄어들 때)', function() {
                setCollectionRange(10, 20);
                setCollectionRange(10, 15);

                expect($trs.length).toBe(5);
                expect($trs.first().attr('key')).toBe('10');
                expect($trs.last().attr('key')).toBe('14');
            });
        });

        describe('keyColumnName이 지정되어 있고 일정하게 증가하지 않을 때', function() {
            var sampleData = (function() {
                var data = [];
                _.each([1, 3, 5, 6, 9, 10, 12, 13, 18, 20], function(num) {
                    data.push({c1: num});
                });
                return data;
            }());

            beforeEach(function() {
                grid.columnModel.set('columnModelList', [{columnName: 'c1'}]);
                grid.columnModel.set('keyColumnName', 'c1');
                init(sampleData);
            });

            it('초기 데이터 할당', function() {
                setCollectionRange(0, 5);

                expect($trs.length).toBe(5);
                expect($trs.first().attr('key')).toBe('1');
                expect($trs.last().attr('key')).toBe('9');
            });

            it('first와 last 모두 증가할 때 (스크롤 내릴 때)', function() {
                setCollectionRange(0, 5);
                setCollectionRange(3, 9);

                expect($trs.length).toBe(6);
                expect($trs.first().attr('key')).toBe('6');
                expect($trs.last().attr('key')).toBe('18');
            });
        });

        describe('정렬이 변경될 때', function() {
            var sampleData = (function() {
                var i, data = [];
                for (i = 0; i < 15; i += 1) {
                    data.push({c1: i, c2: 15 - i});
                }
                return data;
            }());

            beforeEach(function() {
                grid.columnModel.set('columnModelList', [
                    {columnName: 'c1'},
                    {columnName: 'c2'}
                ]);
                grid.columnModel.set('keyColumnName', 'c1');
                init(sampleData);
            });

            it('정렬 기준 컬럼이 변경될 때', function() {
                setCollectionRange(0, 10);
                grid.dataModel.sortByField('c2', true);
                setCollectionRange(0, 10);

                expect($trs.length).toBe(10);
                expect($trs.first().attr('key')).toBe('14');
                expect($trs.last().attr('key')).toBe('5');
            });

            it('정렬방향이 변경될 때', function() {
                grid.dataModel.sortByField('c2', true);
                setCollectionRange(0, 10);
                grid.dataModel.sortByField('c2', false);
                setCollectionRange(0, 10);

                expect($trs.length).toBe(10);
                expect($trs.first().attr('key')).toBe('0');
                expect($trs.last().attr('key')).toBe('9');
            });
        });
    });

    describe('RowList', function() {
        describe('_getRowElement', function() {
            it('현재 rendering된 엘리먼트 중, rowKey에 해당하는 엘리먼트를 반환한다.', function() {
                expect(rowListView._getRowElement(0).length).toEqual(1);
                expect(rowListView._getRowElement(0).attr('key')).toEqual('0');
                expect(rowListView._getRowElement(1).length).toEqual(1);
                expect(rowListView._getRowElement(1).attr('key')).toEqual('1');
                expect(rowListView._getRowElement(2).length).toEqual(0);
            });
        });

        describe('_onFocus, _onBlur', function() {
            beforeEach(function() {
                grid.$el.append(rowListView.$el);
            });

            it('rendering 된 엘리먼트 중 해당하는 엘리먼트에 focus, blur 디자인 클래스를 적용한다.', function() {
                var $firstCell = rowListView.$el.find('tr:first').find('td').eq(1); // 0번째는 _button임

                rowListView._onFocus(0, 'c1');
                expect($firstCell).toHaveClass('focused');

                rowListView._onBlur(0, 'c1');
                expect($firstCell).not.toHaveClass('focused');
            });
        });

        describe('_onSelect, _onUnselect', function() {
            var $firstRowCells;

            beforeEach(function() {
                $firstRowCells = rowListView.$el.find('tr:first').find('td');
            });

            it('_onSelect 호출시 _setCssSelect 를 true 로 호출한다.', function() {
                rowListView._onSelect(0);
                $firstRowCells.each(function() {
                    expect(this).toHaveClass('selected');
                });
            });

            it('_onUnselect 호출시 _setCssSelect 를 false 로 호출한다.', function() {
                rowListView._onUnselect(0);
                $firstRowCells.each(function() {
                    expect(this).not.toHaveClass('selected');
                });
            });
        });

        describe('_showLayer', function() {
            it('row의 length가 0일 경우 grid.showGridLayer를 호출한다.', function() {
                grid.showGridLayer = jasmine.createSpy('showGridLayer');
                grid.dataModel.set([], {parse: true});
                rowListView._showLayer();
                expect(grid.showGridLayer).toHaveBeenCalledWith('empty');
            });

            it('row의 length가 0이 아닐경우 grid.hideGridLayer를 호출한다.', function() {
                grid.hideGridLayer = jasmine.createSpy('hideGridLayer');
                rowListView._showLayer();
                expect(grid.hideGridLayer).toHaveBeenCalled();
            });
        });

        describe('render', function() {
            it('dataModel의 rowList가 변경될 경우, 데이터 내용에 맞게 rendering 한다.', function() {
                var trList = rowListView.$el.find('tr'),
                    tdList = rowListView.$el.find('td');

                expect(trList.length).toBe(2);
                expect(tdList.length).toBe(8);
            });
        });

        describe('_createRowPainter', function() {
            beforeEach(function() {
                rowListView.destroyChildren();
                rowListView.rowPainter = null;
            });

            it('rowPainter 인스턴스를 생성한다..', function() {
                expect(rowListView.rowPainter).toBeNull();
                rowListView._createRowPainter();
                expect(rowListView.rowPainter).not.toBeNull();
            });
        });
    });
});
