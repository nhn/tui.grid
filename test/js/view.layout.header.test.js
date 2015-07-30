'use strict';

describe('View.Layout.Header', function() {
    var grid;

    function createGridMock() {
        var mock = {
            options: {},
            option: function(name) {
                return this.options[name];
            },
            sort: function() {},
            dataModel: new Collection.Base(),
            columnModel: new Data.ColumnModel()
        };
        mock.dimensionModel = new Model.Dimension({
            grid: mock
        });
        mock.renderModel = new Model.Renderer({
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [
            {
                title: 'c1',
                columnName: 'c1',
                width: 30
            }, {
                title: 'c2',
                columnName: 'c2',
                width: 40
            }
        ]);
    });

    describe('Header', function() {
        var header;

        beforeEach(function() {
            header = new View.Layout.Header({
                grid: grid
            });
        });

        afterEach(function() {
            // header.destroy();
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
                expect($cols.length).toBe(3);
                expect($cols.eq(1).width()).toBe(30);
                expect($cols.eq(1).attr('columnname')).toBe('c1');
                expect($cols.eq(2).width()).toBe(40);
                expect($cols.eq(2).attr('columnname')).toBe('c2');
            });

            it('resize 핸들러를 랜더링 하는지 확인한다.', function() {
                var resizeHandlerEl = $('<div />')[0];
                spyOn(View.Layout.Header, 'ResizeHandler').and.callFake(function() {
                    this.render = function() {
                        this.el = resizeHandlerEl;
                        return this;
                    };
                });

                header.render();
                expect($(resizeHandlerEl).parent().is(header.$el)).toBe(true);
            });

            describe('_getHeaderMainCheckbox', function() {
                it('header에 checkbox가 랜더링 되었을 때, checkbox를 잘 가져오는지 확인한다.', function() {
                    grid.columnModel.set('selectType', 'checkbox');
                    header.render();
                    expect(header._getHeaderMainCheckbox().length).toBe(1);
                });

                it('header에 checkbox 가 랜더링 되지 않았을 때', function() {
                    grid.columnModel.set('selectType', 'radio');
                    header.render();
                    expect(header._getHeaderMainCheckbox().length).toBe(0);
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
                header = new View.Layout.Header({
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
                        column1 = hList[1],
                        column3 = hList[3];

                    expect(column1.length).toBe(4);
                    expect(column1[0]).toEqual(columnMergeList[2]);
                    expect(column1[1]).toEqual(columnMergeList[1]);
                    expect(column1[2]).toEqual(columnMergeList[0]);
                    expect(column1[3]).toEqual(columnData.modelList[1]);

                    expect(column3.length).toBe(3);
                    expect(column3[0]).toEqual(columnMergeList[2]);
                    expect(column3[1]).toEqual(columnMergeList[1]);
                    expect(column3[2]).toEqual(columnData.modelList[3]);
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
            beforeEach(function() {
                grid.options.selectType = 'checkbox';
                grid.columnModel.set('selectType', 'checkbox');
                grid.dataModel = new Data.RowList([
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
                header.render();
            });

            it('각 행의 button이 true로 설정되어 있는지 확인하고, header의 checked 상태를 갱신한다.', function() {
                var $input = header._getHeaderMainCheckbox();

                header._syncCheckState();
                expect($input.prop('checked')).toBe(false);

                grid.dataModel.forEach(function(row) {
                    row.set('_button', true);
                });
                header._syncCheckState();
                expect($input.prop('checked')).toBe(true);
            });

            it('각 행의 button이 disable 되어 있다면, disable 상태를 고려하여 checkbox 상태를 갱신한다.', function() {
                var $input = header._getHeaderMainCheckbox();

                grid.dataModel.forEach(function(row) {
                    row.setRowState('DISABLED');
                });
                header._syncCheckState();
                expect($input.prop('checked')).toBe(true);
            });
        });

        describe('_onCheckCountChange()', function() {
            it('timeout 을 이용하여 _syncCheckState 를 한번만 호출하는지 확인한다.', function(done) {
                grid.options.selectType = 'checkbox';
                header._syncCheckState = jasmine.createSpy('_syncCheckState');
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();

                setTimeout(function() {
                    expect(header._syncCheckState.calls.count()).toBe(1);
                    done();
                }, 10);
            });

            it('selectType 이 checkbox 가 아니라면 호출하지 않는다.', function(done) {
                grid.options.selectType = 'radio';
                header._syncCheckState = jasmine.createSpy('_syncCheckState');
                header._onCheckCountChange();

                setTimeout(function() {
                    expect(header._syncCheckState).not.toHaveBeenCalled();
                    done();
                }, 10);
            });
        });

        describe('_onClick', function() {
            var $input, clickEvent;

            beforeEach(function() {
                grid.columnModel.set('selectType', 'checkbox');
                header.render();

                $input = header._getHeaderMainCheckbox();
                clickEvent = {target: $input.get(0)};
                grid.checkAll = jasmine.createSpy('checkAll');
                grid.uncheckAll = jasmine.createSpy('uncheckAll');
            });

            describe('selectType 이 checkbox 일 때', function() {
                it('체크한 상태라면 전체 행을 check 하기 위해 checkAll 을 호출한다.', function() {
                    $input.prop('checked', true);
                    header._onClick(clickEvent);
                    expect(grid.checkAll).toHaveBeenCalled();
                    expect(grid.uncheckAll).not.toHaveBeenCalled();
                });

                it('체크 해제된 상태라면 전체 행을 check 하기 위해 uncheckAll 을 호출한다.', function() {
                    $input.prop('checked', false);
                    header._onClick(clickEvent);
                    expect(grid.checkAll).not.toHaveBeenCalled();
                    expect(grid.uncheckAll).toHaveBeenCalled();
                });
            });
        });
    });


    describe('ResizeHandler', function() {
        var handler, $handles;

        beforeEach(function() {
            handler = new View.Layout.Header.ResizeHandler({
                grid: grid,
                whichSide: 'R'
            });
        });

        afterEach(function() {
            handler.destroy();
        });

        describe('render()', function() {
            beforeEach(function() {
                handler.render();
                $handles = handler.$el.children('div');
            });

            it('resize handler div 리스트를 잘 생성하는지 확인한다.', function() {
                expect($handles.eq(0).attr('columnName')).toBe('_number');
                expect($handles.eq(1).attr('columnName')).toBe('c1');
                expect($handles.eq(2).attr('columnName')).toBe('c2');
                expect($handles.length).toBe(3);
            });

            it('마지막 resize handler 에 resize_handle_last css 클래스가 할당되는지 확인한다.', function() {
                expect($handles.filter('.resize_handle_last').is(':last-child')).toBe(true);
            });

            it('height와 margin을 headerHeight값으로 설정한다.', function() {
                grid.dimensionModel.set('headerHeight', 50);
                handler.render();
                expect(handler.$el.css('marginTop')).toBe('-50px');
                expect(handler.$el.height()).toBe(50);
            });
        });

        describe('_getHandlerColumnIndex', function() {
            beforeEach(function() {
                grid.columnModel.set('columnFixIndex', 4);
            });

            afterEach(function() {
                grid.columnModel.set('columnFixIndex', 0);
            });

            it('L side 일때 columnFix index 를 고려하여 실제 columnIndex 를 계산한다.', function() {
                handler.whichSide = 'L';
                expect(handler._getHandlerColumnIndex(0)).toBe(0);
                expect(handler._getHandlerColumnIndex(1)).toBe(1);
                expect(handler._getHandlerColumnIndex(2)).toBe(2);
                expect(handler._getHandlerColumnIndex(3)).toBe(3);
            });

            it('R side 일때 columnFix index 를 고려하여 실제 columnIndex 를 계산한다.', function() {
                handler.whichSide = 'R';
                expect(handler._getHandlerColumnIndex(0)).toBe(4);
                expect(handler._getHandlerColumnIndex(1)).toBe(5);
                expect(handler._getHandlerColumnIndex(2)).toBe(6);
                expect(handler._getHandlerColumnIndex(3)).toBe(7);
            });
        });

        describe('_refreshHandlerPosition', function() {
            beforeEach(function() {
                handler.render();
                $handles = handler.$el.children('div.resize_handle').each(function() {
                    $(this).css('position', 'absolute');
                });
            });

            it('columnWidthList 에 맞추어 div 포지션을 잘 세팅하는지 확인한다.', function() {
                handler._refreshHandlerPosition();
                expect($handles.eq(0).css('left')).toEqual('58px');
                expect($handles.eq(1).css('left')).toEqual('89px');
                expect($handles.eq(2).css('left')).toEqual('130px');
            });
        });

        // TODO: 내부 구현을 테스트하지 말 것
        describe('Mouse Event', function() {
            var mouseEvent;

            beforeEach(function() {
                handler.render();
                $handles = handler.$el.find('.resize_handle');
                mouseEvent = {
                    target: $handles.eq(0).css('position', 'absolute').get(0),
                    preventDefault: function() {}
                };
            });

            describe('onMouseDown', function() {
                it('마우스 이동을 위해 현재 위치의 데이터를 저장한다.', function() {
                    handler._onMouseDown(mouseEvent);

                    expect(handler.isResizing).toBe(true);
                    expect(handler.$target.is($handles.eq(0))).toBe(true);
                    expect(handler.initialLeft).toBe(58);
                    expect(handler.initialOffsetLeft).toBe(0);
                    expect(handler.initialWidth).toBe(60);
                });
            });

            describe('onMouseUp', function() {
                it('onMouseDown에서 저장한 데이터를 초기화한다. ', function() {
                    handler._onMouseUp(mouseEvent);

                    expect(handler.isResizing).toBe(false);
                    expect(handler.$target).toBeNull();
                    expect(handler.initialLeft).toBe(0);
                    expect(handler.initialOffsetLeft).toBe(0);
                    expect(handler.initialWidth).toBe(0);
                });
            });

            describe('_onMouseMove', function() {
                it('_onMouseMove가 호출되면 핸들러의 left를 마우스 위치만큼 조정하고 columnwidth 값을 설정한다.', function() {
                    var $target = $handles.eq(0);

                    mouseEvent.pageX = 300;
                    handler._onMouseDown(mouseEvent);
                    handler._onMouseMove(mouseEvent);
                    expect($target.css('left')).toBe('300px');
                    expect(grid.dimensionModel.get('columnWidthList')[0]).toBe(302);
                });
            });

            describe('_calculateWidth', function() {
                beforeEach(function() {
                    handler.initialOffsetLeft = 10;
                    handler.initialLeft = 300;
                    handler.initialWidth = 300;
                });
                it('마우스 위치인 pageX 로부터 width 를 계산한다.', function() {
                    expect(handler._calculateWidth(200)).toBe(190);
                    expect(handler._calculateWidth(500)).toBe(490);
                    expect(handler._calculateWidth(11)).toBe(1);
                });
            });
        });
    });
});
