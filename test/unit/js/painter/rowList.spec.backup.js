'use strict';

var _ = require('underscore');
var $ = require('jquery');

var ModelManager = require('model/manager');
var RowListModel = require('model/rowList');
var RowListView = require('view/rowList');
var PainterManager = require('painter/manager');
var DomState = require('domState');
var SmartRenderModel = require('model/renderer-smart');
var frameConst = require('common/constMap').frame;

describe('View.RowList', function() {
    var grid, rowListView, $container, $tableContainer;

    function redrawTable(html) {
        $tableContainer[0].innerHTML = '<table><tbody>' + html + '</tbody></table>';

        return $tableContainer.find('tbody');
    }

    function createRowListView(whichSide) {
        return new RowListView({
            whichSide: whichSide,
            el: setFixtures('<table><tbody></tbody></table>').find('tbody'),
            renderModel: grid.renderModel,
            focusModel: grid.focusModel,
            dataModel: grid.dataModel,
            columnModel: grid.columnModel,
            selectionModel: grid.selectionModel,
            painterManager: new PainterManager({
                modelManager: grid
            }),
            bodyTableView: {
                resetTablePosition: function() {},
                attachTableEventHandler: function() {},
                redrawTable: redrawTable
            }
        });
    }

    beforeEach(function() {
        $container = setFixtures('<div />');
        grid = new ModelManager(null, new DomState($container));
        grid.columnModel.set('columns', [{
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
                list: [{
                    text: 's1',
                    value: 's1'
                }, {
                    text: 's2',
                    vlaue: 's2'
                }]
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
        $tableContainer = $('<div/>').appendTo($container);
        redrawTable('');

        rowListView = createRowListView(frameConst.L);
        rowListView.render();
    });

    describe('View.Painter.Row', function() {
        var rowPainter;

        beforeEach(function() {
            rowPainter = rowListView.painterManager.getRowPainter();
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
        var $trs;

        function init(sampleData) {
            grid.renderModel = new SmartRenderModel(null, {
                columnModel: grid.columnModel,
                dataModel: grid.dataModel,
                dimensionModel: grid.dimensionModel
            });
            grid.dataModel.lastRowKey = -1;
            grid.dataModel.reset(sampleData, {parse: true});
        }

        function setCollectionRange(from, to) {
            var collection;

            grid.renderModel.refresh();
            collection = grid.renderModel.getCollection(frameConst.L);
            rowListView.collection = new RowListModel(collection.slice(from, to), {
                dataModel: grid.dataModel,
                columnModel: grid.columnModel
            });
            rowListView.render();
            $trs = rowListView.$el.children('tr');
        }

        describe('rowKey 순으로 정렬되어 있을 때', function() {
            var sampleData = (function() {
                var i, data = [];
                for (i = 0; i < 50; i += 1) {
                    data.push({c1: i});
                }

                return data;
            })();

            beforeEach(function() {
                grid.columnModel.set('columns', [{columnName: 'c1'}]);
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
            })();

            beforeEach(function() {
                grid.columnModel.set('columns', [{columnName: 'c1'}]);
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
                    data.push({
                        c1: i,
                        c2: 15 - i
                    });
                }

                return data;
            })();

            beforeEach(function() {
                grid.columnModel.set('columns', [
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
                $tableContainer.append(rowListView.$el);
            });

            it('rendering 된 엘리먼트 중 해당하는 엘리먼트에 focus, blur 디자인 클래스를 적용한다.', function() {
                var $firstCell = rowListView.$el.find('tr:first').find('td').eq(0);

                rowListView._onFocus(0, 'c1');
                expect($firstCell).toHaveClass('focused');

                rowListView._onBlur(0, 'c1');
                expect($firstCell).not.toHaveClass('focused');
            });
        });

        describe('render', function() {
            it('dataModel의 rowList가 변경될 경우, 데이터 내용에 맞게 rendering 한다.', function() {
                var trList = rowListView.$el.find('tr'),
                    tdList = rowListView.$el.find('td');

                expect(trList.length).toBe(2);
                expect(tdList.length).toBe(6);
            });
        });

        describe('if the instance is left-side', function() {
            var $trs;

            function isMetaCellsSelected(rowKey) {
                var $metaCells = $trs.filter('[data-row-key=' + rowKey + ']').find('td.meta_column');

                return $metaCells.not('.selected').length === 0;
            }

            beforeEach(function() {
                rowListView = createRowListView(frameConst.L);
                rowListView.render();
                $trs = rowListView.$el.find('tr');
            });

            describe('and focused row is set', function() {
                it('add "selected" class to the meta cells of focused row', function() {
                    rowListView.focusModel.set('rowKey', 0);

                    expect(isMetaCellsSelected(0)).toBe(true);
                });
            });

            describe('and focused row has changed', function() {
                it('reset "selected" class to the meta cells of focused row', function() {
                    rowListView.focusModel.set('rowKey', 0, {silent: true});
                    rowListView.focusModel.set('rowKey', 1);

                    expect(isMetaCellsSelected(0)).toBe(false);
                    expect(isMetaCellsSelected(1)).toBe(true);
                });
            });

            describe('and the row-range of selection has changed', function() {
                it('add "selected" class to the meta cells in the range', function() {
                    rowListView.selectionModel.set('range', {
                        row: [0, 1],
                        column: [0, 0]
                    });

                    expect(isMetaCellsSelected(0)).toBe(true);
                    expect(isMetaCellsSelected(1)).toBe(true);
                });

                it('remove "selected" class from the meta cells in the privious range', function() {
                    rowListView.selectionModel.set('range', {
                        row: [0, 1],
                        column: [0, 0]
                    });
                    rowListView.selectionModel.set('range', {
                        row: [1, 1],
                        column: [0, 0]
                    });
                    expect(isMetaCellsSelected(0)).toBe(false);
                });

                it('refresh "selected" class from the meta cells ', function() {
                    rowListView.focusModel.set('rowKey', 1);
                    rowListView.selectionModel.set('range', {
                        row: [0, 0],
                        column: [0, 0]
                    });
                    expect(isMetaCellsSelected(1)).toBe(false);
                });
            });
        });
    });
});
