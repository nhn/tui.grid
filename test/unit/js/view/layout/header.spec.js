'use strict';

var ModelManager = require('model/manager');
var DomState = require('domState');
var DomEventBus = require('event/domEventBus');
var ViewFactory = require('view/factory');

var classNameConst = require('common/classNameConst');
var constMap = require('common/constMap');
var frameConst = constMap.frame;
var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

describe('Header', function() {
    var modelManager, viewFactory, domEventBus, header;

    beforeEach(function() {
        domEventBus = DomEventBus.create();
        modelManager = new ModelManager(null, new DomState($('<div>'), domEventBus));
        viewFactory = new ViewFactory({
            domEventBus: domEventBus,
            modelManager: modelManager
        });
        modelManager.columnModel.set('columnModelList', [
            {
                columnName: 'c1',
                width: 50
            },
            {
                columnName: 'c2',
                width: 60
            }
        ]);
        header = viewFactory.createHeader(frameConst.R);
    });

    describe('render', function() {
        it('el 하위의 HTML 요소를 생성한다.', function() {
            header.render();

            expect(header.$el.find('table').length).toEqual(1);
            expect(header.$el.find('colgroup').length).toEqual(1);
            expect(header.$el.find('tbody').length).toEqual(1);
            expect(header.$el.find('tr').length).toEqual(1);
        });

        it('height of $el should be headerHeight', function() {
            header.headerHeight = 20;
            header.render();

            expect(header.$el.height()).toEqual(19);
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var $colgroup, $cols;

            header.render();

            $colgroup = header.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(2);
            expect($cols.eq(0).width()).toBe(51);
            expect($cols.eq(0).attr(ATTR_COLUMN_NAME)).toBe('c1');
            expect($cols.eq(1).width()).toBe(61);
            expect($cols.eq(1).attr(ATTR_COLUMN_NAME)).toBe('c2');
        });

        describe('_getHeaderMainCheckbox', function() {
            var lHeader;

            beforeEach(function() {
                lHeader = viewFactory.createHeader(frameConst.L);
            });

            it('header에 checkbox가 랜더링 되었을 때, checkbox를 잘 가져오는지 확인한다.', function() {
                lHeader.columnModel.set('selectType', 'checkbox');
                lHeader.render();
                expect(lHeader._getHeaderMainCheckbox().length).toBe(1);
            });

            it('header에 checkbox 가 랜더링 되지 않았을 때', function() {
                lHeader.columnModel.set('selectType', 'radio');
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
            modelManager.columnModel.set('columnModelList', [
                {
                    title: 'c1',
                    columnName: 'c1',
                    isSortable: true
                },
                {
                    title: 'c2',
                    columnName: 'c2',
                    isSortable: true
                },
                {
                    title: 'c3',
                    columnName: 'c3'
                }
            ]);
            header = viewFactory.createHeader();
            header.render();
        });

        it('true인 경우 버튼이 생성된다.', function() {
            var $btns = header.$el.find('.' + classNameConst.BTN_SORT);

            expect($btns.length).toBe(2);
            expect($btns.eq(0).parent().attr(ATTR_COLUMN_NAME)).toBe('c1');
            expect($btns.eq(1).parent().attr(ATTR_COLUMN_NAME)).toBe('c2');
        });

        it('trigger click:headerSort when click sort button', function() {
            var clickSpy = jasmine.createSpy('clickSpy');
            var eventMock = {
                target: header.$el.find('.' + classNameConst.BTN_SORT)[0]
            };

            domEventBus.on('click:headerSort', clickSpy);
            header._onClick(eventMock);

            expect(clickSpy).toHaveBeenCalled();
        });

        it('dataModel의 sortChanged 이벤트 발생시 정렬 버튼이 갱신된다.', function() {
            var $btns = header.$el.find('.' + classNameConst.BTN_SORT),
                eventData = {
                    columnName: 'c1',
                    isAscending: true
                };

            modelManager.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).toHaveClass(classNameConst.BTN_SORT_UP);

            eventData.columnName = 'c2';
            modelManager.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).not.toHaveClass(classNameConst.BTN_SORT_UP);
            expect($btns.eq(1)).toHaveClass(classNameConst.BTN_SORT_UP);

            eventData.isAscending = false;
            modelManager.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(1)).not.toHaveClass(classNameConst.BTN_SORT_UP);
            expect($btns.eq(1)).toHaveClass(classNameConst.BTN_SORT_DOWN);
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
                },
                {
                    title: 'c2',
                    columnName: 'c2',
                    width: 40
                },
                {
                    title: 'c3',
                    columnName: 'c3',
                    width: 45
                },
                {
                    title: 'c4',
                    columnName: 'c4',
                    width: 20
                }
            ];

        beforeEach(function() {
            modelManager.columnModel.set({
                columnModelList: columnModelList,
                columnMerge: columnMergeList
            });
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
                modelManager.columnModel.set('columnMerge', [
                    {
                        columnName: 'merge1',
                        title: 'c1-c2',
                        columnNameList: ['c1', 'c2']
                    }
                ]);
                hierarchyList = header._getColumnHierarchyList();
                maxRow = header._getHierarchyMaxRowCount(hierarchyList);
                expect(maxRow).toEqual(2);
            });
        });
    });

    describe('_syncCheckedState()', function() {
        var $checkbox, lHeader;

        beforeEach(function() {
            modelManager.columnModel.set('selectType', 'checkbox');
            lHeader = viewFactory.createHeader(frameConst.L);
            lHeader.render();
            $checkbox = lHeader._getHeaderMainCheckbox();
        });

        it('if available count is 0, uncheck and disable checkbox', function() {
            lHeader.dataModel.getCheckedState = _.constant({
                available: 0
            });
            lHeader._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(false);
            expect($checkbox.prop('disabled')).toBe(true);
        });

        it('if checked count is less than available count, uncheck and enable checkbox', function() {
            lHeader.dataModel.getCheckedState = _.constant({
                available: 2,
                checked: 1
            });
            lHeader._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(false);
            expect($checkbox.prop('disabled')).toBe(false);
        });

        it('if checked count is equal to available count, check and enable checkbox', function() {
            lHeader.dataModel.getCheckedState = _.constant({
                available: 2,
                checked: 2
            });
            lHeader._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(true);
            expect($checkbox.prop('disabled')).toBe(false);
        });
    });

    describe('when check button is clicked, trigger click:headerCheck event on domEventBus', function() {
        var $input, clickEvent, clickSpy, lHeader;

        beforeEach(function() {
            lHeader = viewFactory.createHeader(frameConst.L);
            modelManager.columnModel.set('selectType', 'checkbox');
            lHeader.render();

            $input = lHeader._getHeaderMainCheckbox();
            clickEvent = {target: $input.get(0)};
            clickSpy = jasmine.createSpy('clickSpy');
            domEventBus.on('click:headerCheck', clickSpy);
        });

        describe('with checked status (true)', function() {
            it('trigger click:headerCheck event', function() {
                $input.prop('checked', true);
                lHeader._onClick(clickEvent);

                expect(clickSpy.calls.first().args[0].checked).toBe(true);
            });

            it('with checked status (false)', function() {
                $input.prop('checked', false);
                lHeader._onClick(clickEvent);

                expect(clickSpy.calls.first().args[0].checked).toBe(false);
            });
        });
    });

    describe('_onMouseDown', function() {
        var eventMock, tableHeader;

        beforeEach(function() {
            tableHeader = $('<th height="50" colspan="1" rowspan="1">c1</th>').attr(ATTR_COLUMN_NAME, 'c1')[0];
            eventMock = {
                target: tableHeader
            };
        });

        it('trigger mousedown:header on domEventBus', function() {
            var eventSpy = jasmine.createSpy('eventSpy');

            domEventBus.on('dragstart:header', eventSpy);
            header._onMouseDown(eventMock);

            expect(eventSpy.calls.first().args[0]).toEqual(jasmine.objectContaining({
                columnName: 'c1'
            }));
        });
    });

    describe('[selected]', function() {
        function isHeaderSelected(columnName) {
            return header.$el.find('th[' + ATTR_COLUMN_NAME + '=' + columnName + ']')
                .is('.' + classNameConst.CELL_SELECTED);
        }

        beforeEach(function() {
            modelManager.columnModel.set('columnModelList', [
                {columnName: 'c1'},
                {columnName: 'c2'},
                {columnName: 'c3'}
            ]);
            modelManager.dataModel.setRowList([
                {c1: 1}
            ]);
            modelManager.focusModel.set('rowKey', 0);
            header.render();
        });

        describe('if focused column has changed', function() {
            it('add selected class to the matching header', function() {
                modelManager.focusModel.set('columnName', 'c1');

                expect(isHeaderSelected('c1')).toBe(true);
            });

            it('remove selected class from the previously focused header', function() {
                modelManager.focusModel.set('columnName', 'c1');
                modelManager.focusModel.set('columnName', 'c2');

                expect(isHeaderSelected('c1')).toBe(false);
            });
        });

        describe('if column range of the selection has changed', function() {
            it('add selected class to the matching header', function() {
                modelManager.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 1]
                });
                expect(isHeaderSelected('c1')).toBe(true);
                expect(isHeaderSelected('c2')).toBe(true);
                expect(isHeaderSelected('c3')).toBe(false);
            });

            it('remove selected class from the header in the previous range', function() {
                modelManager.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 1]
                });
                modelManager.selectionModel.set('range', {
                    row: [0, 0],
                    column: [1, 2]
                });
                expect(isHeaderSelected('c1')).toBe(false);
                expect(isHeaderSelected('c2')).toBe(true);
                expect(isHeaderSelected('c2')).toBe(true);
            });

            it('add selected class to the merged header which contains selected headers', function() {
                modelManager.columnModel.set('columnMerge', [
                    {
                        columnName: 'c1-c2',
                        columnNameList: ['c1', 'c2']
                    },
                    {
                        columnName: 'c1-c2-c3',
                        columnNameList: ['c1-c2', 'c3']
                    }
                ]);
                header.render();
                modelManager.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 2]
                });

                expect(isHeaderSelected('c1-c2')).toBe(true);
                expect(isHeaderSelected('c1-c2-c3')).toBe(true);
            });
        });
    });
});
