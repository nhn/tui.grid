'use strict';

var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var LayoutHeader = require('../../src/js/view/layout/header');
var Selection = require('../../src/js/model/selection');

describe('Header', function() {
    var grid, header;

    function createGridMock() {
        var mock = {
            options: {},
            option: function(name) {
                return this.options[name];
            },
            sort: function() {},
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
            focusAt: function() {}
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
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        header = new LayoutHeader({
            grid: grid
        });
    });

    describe('render', function() {
        it('el 하위의 HTML 요소를 생성한다.', function() {
            header.render();

            expect(header.$el.find('table').length).toEqual(1);
            expect(header.$el.find('colgroup').length).toEqual(1);
            expect(header.$el.find('tbody').length).toEqual(1);
            expect(header.$el.find('tr').length).toEqual(1);
        });

        it('el의 높이를 dimensionModel의 headerHeight값으로 설정한다.', function() {
            grid.dimensionModel.set('headerHeight', 20);
            header.render();

            expect(header.$el.height()).toEqual(20);
        });

        it('grid.option의 scrollX, scrollY값에 따라 el의 overflow 속성을 설정한다.', function() {
            header.$el.css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            grid.options.scrollX = true;
            grid.options.scrollY = true;
            header.render();
            expect(header.$el.css('overflow-x')).toBe('visible');
            expect(header.$el.css('overflow-y')).toBe('visible');

            grid.options.scrollX = false;
            grid.options.scrollY = false;
            header.render();
            expect(header.$el.css('overflow-x')).toBe('hidden');
            expect(header.$el.css('overflow-y')).toBe('hidden');
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var $colgroup, $cols;

            header.render();

            $colgroup = header.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(2);
            expect($cols.eq(0).width()).toBe(30);
            expect($cols.eq(0).attr('columnname')).toBe('c1');
            expect($cols.eq(1).width()).toBe(40);
            expect($cols.eq(1).attr('columnname')).toBe('c2');
        });

        // TODO: TC 구현
        // it('resize 핸들러를 랜더링 하는지 확인한다.', function() {
        //     var resizeHandlerEl = $('<div />')[0];
        //     spyOn(LayoutHeader, 'ResizeHandler').and.callFake(function() {
        //         this.render = function() {
        //             this.el = resizeHandlerEl;
        //             return this;
        //         };
        //     });
        //
        //     header.render();
        //     expect($(resizeHandlerEl).parent().is(header.$el)).toBe(true);
        // });

        describe('_getHeaderMainCheckbox', function() {
            var lHeader;
            beforeEach(function() {
                lHeader = new LayoutHeader({
                    grid: grid,
                    whichSide: 'L'
                });
            });

            it('header에 checkbox가 랜더링 되었을 때, checkbox를 잘 가져오는지 확인한다.', function() {
                grid.columnModel.set('selectType', 'checkbox');
                lHeader.render();
                expect(lHeader._getHeaderMainCheckbox().length).toBe(1);
            });

            it('header에 checkbox 가 랜더링 되지 않았을 때', function() {
                grid.columnModel.set('selectType', 'radio');
                lHeader.render();
                expect(lHeader._getHeaderMainCheckbox().length).toBe(0);
            });
        });

        describe('_getColumnData()', function() {
            it('columnModelList와 columnWidthList를 반환하는지 확인한다.', function() {
                var columnData = header._getColumnData();
                expect(columnData.widthList.length).toBeGreaterThan(0);
                expect(columnData.modelList.length).toBeGreaterThan(0);
            });
        });
    });

    describe('isSortable 관련 테스트', function() {
        beforeEach(function() {
            grid.columnModel.set('columnModelList', [
                {
                    title: 'c1',
                    columnName: 'c1',
                    isSortable: true
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    isSortable: true
                }, {
                    title: 'c3',
                    columnName: 'c3'
                }
            ]);
            header = new LayoutHeader({
                grid: grid
            });
            header.render();
        });

        it('true인 경우 버튼이 생성된다.', function() {
            var $btns = header.$el.find('a.btn_sorting');

            expect($btns.length).toBe(2);
            expect($btns.eq(0).parent().attr('columnname')).toBe('c1');
            expect($btns.eq(1).parent().attr('columnname')).toBe('c2');
        });

        it('버튼을 클릭하면 grid.sort()를 실행한다.', function() {
            var $btn = header.$el.find('a.btn_sorting');
            spyOn(grid, 'sort');
            $btn.trigger('click');
            expect(grid.sort).toHaveBeenCalled();
        });

        it('dataModel의 sortChanged 이벤트 발생시 정렬 버튼이 갱신된다.', function() {
            var $btns = header.$el.find('a.btn_sorting'),
                eventData = {
                    columnName: 'c1',
                    isAscending: true
                };

            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).toHaveClass('sorting_up');

            eventData.columnName = 'c2';
            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).not.toHaveClass('sorting_up');
            expect($btns.eq(1)).toHaveClass('sorting_up');

            eventData.isAscending = false;
            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(1)).not.toHaveClass('sorting_up');
            expect($btns.eq(1)).toHaveClass('sorting_down');
        });
    });

    describe('columnMerge 관련 메서드 테스트', function() {
        var columnData,
            columnMergeList = [
                {
                    columnName: 'merge1',
                    title: 'c1-c2',
                    columnNameList: ['c1', 'c2']
                },
                {
                    columnName: 'merge2',
                    title: 'c1-c2-c3',
                    columnNameList: ['merge1', 'c3']
                },
                {
                    columnName: 'merge3',
                    title: 'c1-c2-c3-c4',
                    columnNameList: ['merge2', 'c4']
                }
            ],
            columnModelList = [
                {
                    title: 'c1',
                    columnName: 'c1',
                    width: 30
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    width: 40
                }, {
                    title: 'c3',
                    columnName: 'c3',
                    width: 45
                }, {
                    title: 'c4',
                    columnName: 'c4',
                    width: 20
                }
            ];

        beforeEach(function() {
            grid.columnModel.set('columnModelList', columnModelList);
            grid.options.columnMerge = columnMergeList;
            columnData = header._getColumnData();
        });

        describe('_getColumnHierarchyList()', function() {
            it('Merge된 컬럼의 Hierarchy 데이터를 생성한다', function() {
                var hList = header._getColumnHierarchyList(),
                    column1 = hList[0],
                    column3 = hList[2];

                expect(column1.length).toBe(4);
                expect(column1[0]).toEqual(columnMergeList[2]);
                expect(column1[1]).toEqual(columnMergeList[1]);
                expect(column1[2]).toEqual(columnMergeList[0]);
                expect(column1[3]).toEqual(columnData.modelList[0]);

                expect(column3.length).toBe(3);
                expect(column3[0]).toEqual(columnMergeList[2]);
                expect(column3[1]).toEqual(columnMergeList[1]);
                expect(column3[2]).toEqual(columnData.modelList[2]);
            });
        });

        describe('_getHierarchyMaxRowCount()', function() {
            it('계층구조를 마크업으로 표현할때 생성해야할 최대 행 수를 반환한다.', function() {
                var hierarchyList = header._getColumnHierarchyList(),
                    maxRow = header._getHierarchyMaxRowCount(hierarchyList);

                expect(maxRow).toEqual(4);

                grid.options.columnMerge = [
                    {
                        columnName: 'merge1',
                        title: 'c1-c2',
                        columnNameList: ['c1', 'c2']
                    }
                ];
                hierarchyList = header._getColumnHierarchyList();
                maxRow = header._getHierarchyMaxRowCount(hierarchyList);
                expect(maxRow).toEqual(2);
            });
        });
    });

    describe('_syncCheckState()', function() {
        var lHeader;
        beforeEach(function() {
            lHeader = new LayoutHeader({
                grid: grid,
                whichSide: 'L'
            });
            grid.options.selectType = 'checkbox';
            grid.columnModel.set('selectType', 'checkbox');
            grid.dataModel = new RowListData([
                {
                    c1: '0-1',
                    c2: '0-2'
                },
                {
                    c1: '1-1',
                    c2: '1-2'
                }
            ], {
                grid: grid,
                parse: true
            });
            lHeader.render();
        });

        it('각 행의 button이 true로 설정되어 있는지 확인하고, header의 checked 상태를 갱신한다.', function() {
            var $input = lHeader._getHeaderMainCheckbox();

            lHeader._syncCheckState();
            expect($input.prop('checked')).toBe(false);

            grid.dataModel.forEach(function(row) {
                row.set('_button', true);
            });
            lHeader._syncCheckState();
            expect($input.prop('checked')).toBe(true);
        });

        it('각 행의 button이 disable 되어 있다면, disable 상태를 고려하여 checkbox 상태를 갱신한다.', function() {
            var $input = lHeader._getHeaderMainCheckbox();

            grid.dataModel.forEach(function(row) {
                row.setRowState('DISABLED');
            });
            lHeader._syncCheckState();
            expect($input.prop('checked')).toBe(true);
        });
    });

    describe('_onCheckCountChange()', function() {
        var lHeader;
        beforeEach(function() {
            lHeader = new LayoutHeader({
                grid: grid,
                whichSide: 'L'
            });
        });

        it('timeout 을 이용하여 _syncCheckState 를 한번만 호출하는지 확인한다.', function(done) {
            grid.options.selectType = 'checkbox';
            lHeader._syncCheckState = jasmine.createSpy('_syncCheckState');
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();
            lHeader._onCheckCountChange();

            setTimeout(function() {
                expect(lHeader._syncCheckState.calls.count()).toBe(1);
                done();
            }, 10);
        });

        it('selectType 이 checkbox 가 아니라면 호출하지 않는다.', function(done) {
            grid.options.selectType = 'radio';
            lHeader._syncCheckState = jasmine.createSpy('_syncCheckState');
            lHeader._onCheckCountChange();

            setTimeout(function() {
                expect(lHeader._syncCheckState).not.toHaveBeenCalled();
                done();
            }, 10);
        });
    });

    describe('_onClick', function() {
        var $input, clickEvent, lHeader;

        beforeEach(function() {
            lHeader = new LayoutHeader({
                grid: grid,
                whichSide: 'L'
            });
            grid.columnModel.set('selectType', 'checkbox');
            lHeader.render();

            $input = lHeader._getHeaderMainCheckbox();
            clickEvent = {target: $input.get(0)};
            grid.checkAll = jasmine.createSpy('checkAll');
            grid.uncheckAll = jasmine.createSpy('uncheckAll');
        });

        describe('selectType 이 checkbox 일 때', function() {
            it('체크한 상태라면 전체 행을 check 하기 위해 checkAll 을 호출한다.', function() {
                $input.prop('checked', true);
                lHeader._onClick(clickEvent);
                expect(grid.checkAll).toHaveBeenCalled();
                expect(grid.uncheckAll).not.toHaveBeenCalled();
            });

            it('체크 해제된 상태라면 전체 행을 check 하기 위해 uncheckAll 을 호출한다.', function() {
                $input.prop('checked', false);
                lHeader._onClick(clickEvent);
                expect(grid.checkAll).not.toHaveBeenCalled();
                expect(grid.uncheckAll).toHaveBeenCalled();
            });
        });
    });

    it('_hasMetaColumn', function() {
        var columnNames = ['c1', 'c2'];

        expect(header._hasMetaColumn(columnNames)).toBe(false);

        columnNames.unshift('_number');
        expect(header._hasMetaColumn(columnNames)).toBe(true);
    });

    describe('_onMouseDown', function() {
        var eventMock, tableHeader,
            columnNames, pageX, pageY, shiftKey;

        beforeAll(function() {
            tableHeader = $('<th columnname="c1" height="50" colspan="1" rowspan="1">c1</th>')[0];
        });

        beforeEach(function() {
            columnNames = ['c1'];
            pageX = 0;
            pageY = 0;
            shiftKey = false;

            eventMock = {
                pageX: pageX,
                pageY: pageY,
                shiftKey: shiftKey,
                target: tableHeader
            };
            spyOn(grid.columnModel, 'getUnitColumnNamesIfMerged').and.returnValue(columnNames);
            spyOn(header, '_controlStartAction');
        });

        it('if selectionModel is disabled, should be interrupted', function() {
            grid.selectionModel.disable();
            spyOn(header, '_hasMetaColumn').and.returnValue(false);

            header._onMouseDown(eventMock);
            expect(header._controlStartAction).not.toHaveBeenCalled();
        });

        it('if meta column selected, should be interrupted', function() {
            // new spy
            grid.columnModel.getUnitColumnNamesIfMerged = jasmine.createSpy().and.returnValue([
                '_number'
            ]);

            header._onMouseDown(eventMock);
            expect(header._controlStartAction).not.toHaveBeenCalled();
        });

        it('should call "_controlStartAction" with expected params', function() {
            header._onMouseDown(eventMock);
            expect(header._controlStartAction).toHaveBeenCalledWith(columnNames, pageX, pageY, shiftKey);
        });
    });

    describe('_controlStartAction', function() {
        var selectionModel,
            columns, columnNames,
            pageX, pageY, shiftKey;

        beforeEach(function() {
            selectionModel = grid.selectionModel;
            columns = {
                'c1': 1,
                'c2': 2,
                'c3': 3
            };
            columnNames = ['c2'];
            pageX = 0;
            pageY = 0;
            shiftKey = false;
            spyOn(selectionModel, 'selectColumn');
            spyOn(selectionModel, 'update');
            spyOn(grid.columnModel, 'indexOfColumnName').and.callFake(function(name) {
                return columns[name] || -1;
            });
            spyOn(header, '_attachDragEvents');
        });

        it('should attach drag events', function() {
            header._controlStartAction(columnNames, pageX, pageY, shiftKey);

            expect(header._attachDragEvents).toHaveBeenCalled();
        });

        describe('without shiftKey', function() {
            it('should set a minimum range of selection from column names', function() {
                spyOn(selectionModel, 'setMinimumColumnRange').and.callThrough();
                columnNames.push('c1', 'c3');
                header._controlStartAction(columnNames, pageX, pageY, shiftKey);

                expect(selectionModel.setMinimumColumnRange).toHaveBeenCalledWith([1, 3]);
            });

            it('should select a column - 1', function() {
                header._controlStartAction(columnNames, pageX, pageY, shiftKey);

                expect(selectionModel.selectColumn).toHaveBeenCalledWith(2);
                expect(selectionModel.update).toHaveBeenCalledWith(0, 2);
            });

            it('should select columns - 2', function() {
                columnNames.push('c1', 'c3');
                header._controlStartAction(columnNames, pageX, pageY, shiftKey);

                expect(selectionModel.selectColumn).toHaveBeenCalledWith(1);
                expect(selectionModel.update).toHaveBeenCalledWith(0, 3);
            });
        });

        describe('with shiftKey', function() {
            beforeEach(function() {
                columnNames = ['c1', 'c2', 'c3'];
                shiftKey = true;
                spyOn(selectionModel, 'extendColumnSelection');
            });

            it('should start(update) column selection with extend', function() {
                header._controlStartAction(columnNames, pageX, pageY, shiftKey);
                expect(selectionModel.update).toHaveBeenCalledWith(0, 3, 'column');
                expect(selectionModel.extendColumnSelection).toHaveBeenCalledWith([1, 2, 3], pageX, pageY);
            });

            // For more detailed test,
            //  the test case requires the real grid core and real models.
        });
    });
});
