'use strict';

var $ = require('jquery');
var _ = require('underscore');

var DomEventBus = require('event/domEventBus');
var ColumnModel = require('model/data/columnModel');
var HeaderView = require('view/layout/header');
var Model = require('base/model');
var classNameConst = require('common/classNameConst');
var constMap = require('common/constMap');
var frameConst = constMap.frame;
var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

function create(whichSide, columns) {
    var columnModel = new ColumnModel({
        columns: columns || [
            {name: 'c1'},
            {name: 'c2'}
        ]
    });
    var coordColumnModel = new Model();
    coordColumnModel.getWidths = _.noop;

    return new HeaderView({
        whichSide: whichSide || frameConst.R,
        columnModel: columnModel,
        dataModel: new Model(),
        renderModel: new Model(),
        focusModel: new Model(),
        selectionModel: new Model(),
        coordColumnModel: coordColumnModel,
        domEventBus: DomEventBus.create(),
        viewFactory: {
            createHeaderResizeHandle: function() {
                return {
                    el: '<div class="resizeHandle"></div>',
                    render: function() {
                        return this;
                    }
                };
            }
        }
    });
}

describe('Header', function() {
    describe('render', function() {
        var header;

        beforeEach(function() {
            header = create();
            header.coordColumnModel.getWidths = function() {
                return [50, 60];
            };
        });

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

        describe('_getColumnData()', function() {
            it('columns와 widths를 반환하는지 확인한다.', function() {
                var columnData = header._getColumnData();
                expect(columnData.widths.length).toBeGreaterThan(0);
                expect(columnData.columns.length).toBeGreaterThan(0);
            });
        });

        it('When "resizable" is true, resize handle should be rendered as a child.', function() {
            header.coordColumnModel.set('resizable', true);
            header.render();
            expect(header.$el.find('.resizeHandle').length).toBe(1);
        });
    });

    describe('_getHeaderMainCheckbox', function() {
        var header;

        beforeEach(function() {
            header = create(frameConst.L);
            header.coordColumnModel.getWidths = function() {
                return [10];
            };
        });

        it('header에 checkbox가 랜더링 되었을 때, checkbox를 잘 가져오는지 확인한다.', function() {
            header.columnModel.set('rowHeaders', ['checkbox']);
            header.render();
            expect(header._getHeaderMainCheckbox().length).toBe(1);
        });

        it('header에 checkbox 가 랜더링 되지 않았을 때', function() {
            header.columnModel.set('rowHeaders', ['radio']);
            header.render();
            expect(header._getHeaderMainCheckbox().length).toBe(0);
        });
    });

    describe('sortable 관련 테스트', function() {
        var header;
        beforeEach(function() {
            header = create(frameConst.R, [
                {
                    title: 'c1',
                    name: 'c1',
                    sortable: true
                },
                {
                    title: 'c2',
                    name: 'c2',
                    sortable: true
                },
                {
                    title: 'c3',
                    name: 'c3'
                }
            ]);
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

            header.domEventBus.on('click:headerSort', clickSpy);
            header._onClick(eventMock);

            expect(clickSpy).toHaveBeenCalled();
        });

        it('dataModel의 sortChanged 이벤트 발생시 정렬 버튼이 갱신된다.', function() {
            var $btns = header.$el.find('.' + classNameConst.BTN_SORT);
            var eventData = {
                columnName: 'c1',
                ascending: true
            };

            header.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).toHaveClass(classNameConst.BTN_SORT_UP);

            eventData.columnName = 'c2';
            header.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).not.toHaveClass(classNameConst.BTN_SORT_UP);
            expect($btns.eq(1)).toHaveClass(classNameConst.BTN_SORT_UP);

            eventData.ascending = false;
            header.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(1)).not.toHaveClass(classNameConst.BTN_SORT_UP);
            expect($btns.eq(1)).toHaveClass(classNameConst.BTN_SORT_DOWN);
        });
    });

    describe('complexHeaderColumns 관련 메서드 테스트', function() {
        var columnData, header;
        var complexHeaderColumns = [
            {
                name: 'merge1',
                title: 'c1-c2',
                childNames: ['c1', 'c2']
            },
            {
                name: 'merge2',
                title: 'c1-c2-c3',
                childNames: ['merge1', 'c3']
            },
            {
                name: 'merge3',
                title: 'c1-c2-c3-c4',
                childNames: ['merge2', 'c4']
            }
        ];
        var columns = [
            {
                title: 'c1',
                name: 'c1',
                width: 30
            },
            {
                title: 'c2',
                name: 'c2',
                width: 40
            },
            {
                title: 'c3',
                name: 'c3',
                width: 45
            },
            {
                title: 'c4',
                name: 'c4',
                width: 20
            }
        ];

        beforeEach(function() {
            header = create();
            header.columnModel.set({
                columns: columns,
                complexHeaderColumns: complexHeaderColumns
            });
            columnData = header._getColumnData();
        });

        describe('_getColumnHierarchyList()', function() {
            it('Merge된 컬럼의 Hierarchy 데이터를 생성한다', function() {
                var hList = header._getColumnHierarchyList();
                var column1 = hList[0];
                var column3 = hList[2];

                expect(column1.length).toBe(4);
                expect(column1[0]).toEqual(complexHeaderColumns[2]);
                expect(column1[1]).toEqual(complexHeaderColumns[1]);
                expect(column1[2]).toEqual(complexHeaderColumns[0]);
                expect(column1[3]).toEqual(columnData.columns[0]);

                expect(column3.length).toBe(3);
                expect(column3[0]).toEqual(complexHeaderColumns[2]);
                expect(column3[1]).toEqual(complexHeaderColumns[1]);
                expect(column3[2]).toEqual(columnData.columns[2]);
            });
        });

        describe('_getHierarchyMaxRowCount()', function() {
            it('계층구조를 마크업으로 표현할때 생성해야할 최대 행 수를 반환한다.', function() {
                var hierarchyList = header._getColumnHierarchyList();
                var maxRow = header._getHierarchyMaxRowCount(hierarchyList);

                expect(maxRow).toEqual(4);
                header.columnModel.set('complexHeaderColumns', [
                    {
                        name: 'merge1',
                        title: 'c1-c2',
                        childNames: ['c1', 'c2']
                    }
                ]);
                hierarchyList = header._getColumnHierarchyList();
                maxRow = header._getHierarchyMaxRowCount(hierarchyList);
                expect(maxRow).toEqual(2);
            });
        });
    });

    describe('_syncCheckedState()', function() {
        var $checkbox, header;

        beforeEach(function() {
            header = create(frameConst.L);
            header.columnModel.set({
                rowHeaders: ['checkbox']
            });
            header.render();
            $checkbox = header._getHeaderMainCheckbox();
        });

        it('if available count is 0, uncheck and disable checkbox', function() {
            header.dataModel.getCheckedState = _.constant({
                available: 0
            });
            header._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(false);
            expect($checkbox.prop('disabled')).toBe(true);
        });

        it('if checked count is less than available count, uncheck and enable checkbox', function() {
            header.dataModel.getCheckedState = _.constant({
                available: 2,
                checked: 1
            });
            header._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(false);
            expect($checkbox.prop('disabled')).toBe(false);
        });

        it('if checked count is equal to available count, check and enable checkbox', function() {
            header.dataModel.getCheckedState = _.constant({
                available: 2,
                checked: 2
            });
            header._syncCheckedState();

            expect($checkbox.prop('checked')).toBe(true);
            expect($checkbox.prop('disabled')).toBe(false);
        });
    });

    describe('when check button is clicked, trigger click:headerCheck event on domEventBus', function() {
        var $input, clickEvent, clickSpy, header;

        beforeEach(function() {
            header = create(frameConst.L);
            header.columnModel.set('rowHeaders', ['checkbox']);
            header.render();

            $input = header._getHeaderMainCheckbox();
            clickEvent = {target: $input.get(0)};
            clickSpy = jasmine.createSpy('clickSpy');
            header.domEventBus.on('click:headerCheck', clickSpy);
        });

        describe('with checked status (true)', function() {
            it('trigger click:headerCheck event', function() {
                $input.prop('checked', true);
                header._onClick(clickEvent);

                expect(clickSpy.calls.first().args[0].checked).toBe(true);
            });

            it('with checked status (false)', function() {
                $input.prop('checked', false);
                header._onClick(clickEvent);

                expect(clickSpy.calls.first().args[0].checked).toBe(false);
            });
        });
    });

    describe('_onMouseDown', function() {
        var header, eventMock, tableHeader;

        beforeEach(function() {
            header = create();
            tableHeader = $('<th height="50" colspan="1" rowspan="1">c1</th>').attr(ATTR_COLUMN_NAME, 'c1')[0];
            eventMock = {
                target: tableHeader
            };
        });

        it('trigger dratstart:header on domEventBus', function() {
            var eventSpy = jasmine.createSpy('eventSpy');

            header.domEventBus.on('dragstart:header', eventSpy);
            header._onMouseDown(eventMock);

            expect(eventSpy.calls.first().args[0]).toEqual(jasmine.objectContaining({
                columnName: 'c1'
            }));
        });
    });

    describe('[selected]', function() {
        var header;

        function isHeaderSelected(name) {
            return header.$el.find('th[' + ATTR_COLUMN_NAME + '=' + name + ']')
                .is('.' + classNameConst.CELL_SELECTED);
        }

        beforeEach(function() {
            header = create(frameConst.R, [
                {name: 'c1'},
                {name: 'c2'},
                {name: 'c3'}
            ]);
        });

        describe('if focused column has changed', function() {
            beforeEach(function() {
                header.selectionModel.hasSelection = _.constant(false);
                header.focusModel.has = _.constant(true);
                header.render();
            });

            it('add selected class to the matching header', function() {
                header.focusModel.set('columnName', 'c1');

                expect(isHeaderSelected('c1')).toBe(true);
            });

            it('remove selected class from the previously focused header', function() {
                header.focusModel.set('columnName', 'c1');
                header.focusModel.set('columnName', 'c2');

                expect(isHeaderSelected('c1')).toBe(false);
            });
        });

        describe('if column range of the selection has changed', function() {
            beforeEach(function() {
                header.selectionModel.hasSelection = _.constant(true);
                header.render();
            });

            it('add selected class to the matching header', function() {
                header.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 1]
                });
                expect(isHeaderSelected('c1')).toBe(true);
                expect(isHeaderSelected('c2')).toBe(true);
                expect(isHeaderSelected('c3')).toBe(false);
            });

            it('remove selected class from the header in the previous range', function() {
                header.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 1]
                });
                header.selectionModel.set('range', {
                    row: [0, 0],
                    column: [1, 2]
                });
                expect(isHeaderSelected('c1')).toBe(false);
                expect(isHeaderSelected('c2')).toBe(true);
                expect(isHeaderSelected('c2')).toBe(true);
            });

            it('add selected class to the merged header which contains selected headers', function() {
                header.columnModel.set('complexHeaderColumns', [
                    {
                        name: 'c1-c2',
                        childNames: ['c1', 'c2']
                    },
                    {
                        name: 'c1-c2-c3',
                        childNames: ['c1-c2', 'c3']
                    }
                ]);
                header.render();
                header.selectionModel.set('range', {
                    row: [0, 0],
                    column: [0, 2]
                });

                expect(isHeaderSelected('c1-c2')).toBe(true);
                expect(isHeaderSelected('c1-c2-c3')).toBe(true);
            });
        });
    });
});
