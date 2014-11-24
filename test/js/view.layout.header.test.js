describe('view.layout.header', function() {
    function getKeyEvent(keyName, $target) {
        return {
            keyCode: grid.keyMap[keyName],
            which: grid.keyMap[keyName],
            target: $target.get(0)
        };
    }
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        },{
            title: 'columnName2',
            columnName: 'columnName2',
            width: 200,
            editOption: {
                type: 'text'
            }
        },
        {
            title: 'columnName3',
            columnName: 'columnName3',
            width: 300,
            editOption: {
                type: 'text-convertible'
            }
        },
        {
            title: 'columnName4',
            columnName: 'columnName4',
            width: 400,
            editOption: {
                type: 'select',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName5',
            columnName: 'columnName5',
            width: 500,
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName6',
            columnName: 'columnName6',
            width: 600,
            editOption: {
                type: 'radio',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            width: 700,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isDisabled: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        },
        {
            title: 'columnName8',
            columnName: 'columnName8',
            width: 800,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isEditable: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        }
    ];
    var rowList = [
        {
            '_extraData': {
                'rowSpan': {
                    'columnName1': 3
                }
            },
            'columnName1': 'normal',
            'columnName2': 1,
            'columnName3': 1,
            'columnName4': 1,
            'columnName5': 'text',
            'columnName6': 'text-convertible',
            'columnName7': false,
            'columnName8': true
        },{
            '_extraData': {
                'className': {
                    'row': ['rowClass'],
                    'column': {
                        'columnName1': ['normalClass']
                    }
                }
            },
            'columnName1': 'normal',
            'columnName2': 1,
            'columnName3': 1,
            'columnName4': 1,
            'columnName5': 'text',
            'columnName6': 'text-convertible',
            'columnName7': false,
            'columnName8': true
        },{
            'columnName1': 'normal',
            'columnName2': 1,
            'columnName3': 1,
            'columnName4': 1,
            'columnName5': 'text',
            'columnName6': 'text-convertible',
            'columnName7': false,
            'columnName8': true
        }
    ];

    var grid = {
        options: {
            selectType: 'checkbox',
            columnMerge: []
        },
        focusAt: function() {},
        hideGridLayer: function() {},
        showGridLayer: function() {},
        check: function() {},
        option: function(name) {
            return this.options[name];
        },
        focus: function() {},
        /**
         * Selection View Instance Mimic
         */
        selection: {
            createLayer: function() {
                return {
                    render: function() {
                        return {
                            el: $('<div class="selection_layer">')
                        };
                    },
                    destroy: function() {},
                    destroyChildren: function() {}
                };
            },
            getIndexFromMousePosition: function() {},
            updateSelection: function() {},
            endSelection: function() {},
            attachMouseEvent: function() {},
            disable: function() {},
            enable: function() {}
        },
        getElement: function(rowKey, columnName) {
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
            return $empty.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
        },
        setValue: function() {},
        focusIn: function() {},
        focusClipboard: function() {},
        keyMap: {
            'TAB': 9,
            'ENTER': 13,
            'CTRL': 17,
            'ESC': 27,
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'CHAR_A': 65,
            'CHAR_C': 67,
            'CHAR_F': 70,
            'CHAR_R': 82,
            'CHAR_V': 86,
            'LEFT_WINDOW_KEY': 91,
            'F5': 116,
            'BACKSPACE': 8,
            'SPACE': 32,
            'PAGE_UP': 33,
            'PAGE_DOWN': 34,
            'HOME': 36,
            'END': 35,
            'DEL': 46,
            'UNDEFINED': 229
        },
        keyName: {
            9: 'TAB',
            13: 'ENTER',
            17: 'CTRL',
            27: 'ESC',
            37: 'LEFT_ARROW',
            38: 'UP_ARROW',
            39: 'RIGHT_ARROW',
            40: 'DOWN_ARROW',
            65: 'CHAR_A',
            67: 'CHAR_C',
            70: 'CHAR_F',
            82: 'CHAR_R',
            86: 'CHAR_V',
            91: 'LEFT_WINDOW_KEY',
            116: 'F5',
            8: 'BACKSPACE',
            32: 'SPACE',
            33: 'PAGE_UP',
            34: 'PAGE_DOWN',
            36: 'HOME',
            35: 'END',
            46: 'DEL',
            229: 'UNDEFINED'
        },
        focusModel: null,
        dataModel: null,
        columnModel: null,
        renderModel: null
    };
    grid.columnModel = new Data.ColumnModel({
        hasNumberColumn: true,
        selectType: 'checkbox',
        columnModelList: columnModelList
    });
    grid.dataModel = new Data.RowList([], {
        grid: grid,
        parse: true
    });
    grid.dimensionModel = new Model.Dimension({
        grid: grid,
        offsetLeft: 100,
        offsetTop: 200,
        width: 500,
        height: 500,
        headerHeight: 150,
        rowHeight: 10,
        displayRowCount: 20,
        scrollX: true,
        scrollBarSize: 17,
        bodyHeight: 100,
        minimumColumnWidth: 20
    });
    grid.renderModel = new Model.Renderer.Smart({
        grid: grid
    });
    grid.focusModel = new Model.Focus({
        grid: grid
    });
    grid.cellFactory = new View.CellFactory({
        grid: grid
    });

    var defaultOption,
        header,
        $empty;

    beforeEach(function() {
        grid.columnModel.set({
            columnFixIndex: 0,
            hasNumberColumn: true,
            selectType: 'checkbox',
            columnModelList: columnModelList
        });
        defaultOption = $.extend(true, {}, grid.options);

        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        grid.$el = $empty;
        grid.dataModel.set(rowList, {parse: true});
        grid.renderModel.refresh();
    });

    afterEach(function() {
        grid.options = defaultOption;
        grid.columnModel.set('selectType', grid.option('selectType'));
    });

    describe('header 테스트', function() {
        var header;
        beforeEach(function() {
            header && header.destroy();
            header = new View.Layout.Header({
                grid: grid,
                whichSide: 'R'
            });
        });
        afterEach(function() {
            header && header.destroy();
        });
        describe('_getColGroupMarkup', function() {
            var $colList;
            beforeEach(function() {
                $empty.html(header._getColGroupMarkup());
                $colList = $empty.find('col');
            });
            it('col 엘리먼트를 기대한 개수만큼 잘 생성했는지 확인한다.', function() {
                expect($colList.length).toBe(10);
            });
            it('col 엘리먼트에 columnName 이 잘 할당되었는지 확인한다.', function() {
                expect($colList.eq(2).attr('columnname')).toBe('columnName1');
                expect($colList.eq(3).attr('columnname')).toBe('columnName2');
                expect($colList.eq(4).attr('columnname')).toBe('columnName3');
                expect($colList.eq(5).attr('columnname')).toBe('columnName4');
                expect($colList.eq(6).attr('columnname')).toBe('columnName5');
                expect($colList.eq(7).attr('columnname')).toBe('columnName6');
                expect($colList.eq(8).attr('columnname')).toBe('columnName7');
                expect($colList.eq(9).attr('columnname')).toBe('columnName8');
            });

            it('width 를 잘 생성했는지 확인한다.', function() {
                //0, 1 은 _number, _button 이므로 제외하고 테스트한다.
                expect($colList.eq(2).width()).toBe(100);
                expect($colList.eq(3).width()).toBe(200);
                expect($colList.eq(4).width()).toBe(300);
                expect($colList.eq(5).width()).toBe(400);
                expect($colList.eq(6).width()).toBe(500);
                expect($colList.eq(7).width()).toBe(600);
                expect($colList.eq(8).width()).toBe(700);
                expect($colList.eq(9).width()).toBe(800);
            });
        });
        describe('_getColumnData', function() {
            it('columnModelList 와 columnWidthList 를 반환하는지 확인한다.', function() {
                var columnData = header._getColumnData();
                expect(columnData.widthList.length).toBeGreaterThan(0);
                expect(columnData.modelList.length).toBeGreaterThan(0);
            });
        });
        describe('columnMerge 관련 메서드 테스트', function() {
            var columnData,
                columnMergeList;
            beforeEach(function() {
                columnMergeList = [
                    {
                        'columnName' : 'mergeColumn1',
                        'title' : '1 + 2',
                        'columnNameList' : ['columnName1', 'columnName2']
                    },
                    {
                        'columnName' : 'mergeColumn2',
                        'title' : '1 + 2 + 3',
                        'columnNameList' : ['mergeColumn1', 'columnName3']
                    },
                    {
                        'columnName' : 'mergeColumn3',
                        'title' : '1 + 2 + 3 + 4 + 5',
                        'columnNameList' : ['mergeColumn2', 'columnName4', 'columnName5']
                    }
                ];
                columnData = header._getColumnData();
                grid.options['columnMerge'] = columnMergeList;
            });
            afterEach(function() {
                grid.options['columnMerge'] = [];
            });
            describe('_getColumnHierarchy', function() {
                it('columnHierarchy 데이터를 를 잘 생성하는지 확인한다.', function() {
                    //0, 1 은 _number, _button 컬럼이므로 2부터 테스트한다.
                    var column1 = header._getColumnHierarchy(columnData.modelList[2]),
                        column2 = header._getColumnHierarchy(columnData.modelList[3]),
                        column3 = header._getColumnHierarchy(columnData.modelList[4]),
                        column4 = header._getColumnHierarchy(columnData.modelList[5]),
                        column5 = header._getColumnHierarchy(columnData.modelList[6]),
                        column6 = header._getColumnHierarchy(columnData.modelList[7]);

                    expect(column1[0]).toEqual(columnData.modelList[2]);
                    expect(column1[1]).toEqual(columnMergeList[0]);
                    expect(column1[2]).toEqual(columnMergeList[1]);
                    expect(column1[3]).toEqual(columnMergeList[2]);

                    expect(column2[0]).toEqual(columnData.modelList[3]);
                    expect(column2[1]).toEqual(columnMergeList[0]);
                    expect(column2[2]).toEqual(columnMergeList[1]);
                    expect(column2[3]).toEqual(columnMergeList[2]);

                    expect(column3[0]).toEqual(columnData.modelList[4]);
                    expect(column3[1]).toEqual(columnMergeList[1]);
                    expect(column3[2]).toEqual(columnMergeList[2]);
                    expect(column3[3]).not.toBeDefined();

                    expect(column4[0]).toEqual(columnData.modelList[5]);
                    expect(column4[1]).toEqual(columnMergeList[2]);
                    expect(column4[2]).not.toBeDefined();

                    expect(column5[0]).toEqual(columnData.modelList[6]);
                    expect(column5[1]).toEqual(columnMergeList[2]);
                    expect(column5[2]).not.toBeDefined();

                    expect(column6[0]).toEqual(columnData.modelList[7]);
                    expect(column6[1]).not.toBeDefined();
                });
            });
            describe('_getColumnHierarchyList', function() {
                it('columnHierarchy 데이터 리스트를 를 잘 생성하는지 확인한다.', function() {
                    //0, 1 은 _number, _button 컬럼이므로 2부터 테스트한다.
                    var hierarchyList = header._getColumnHierarchyList(),
                        column1 = header._getColumnHierarchy(columnData.modelList[2]).reverse(),
                        column2 = header._getColumnHierarchy(columnData.modelList[3]).reverse(),
                        column3 = header._getColumnHierarchy(columnData.modelList[4]).reverse(),
                        column4 = header._getColumnHierarchy(columnData.modelList[5]).reverse(),
                        column5 = header._getColumnHierarchy(columnData.modelList[6]).reverse(),
                        column6 = header._getColumnHierarchy(columnData.modelList[7]).reverse();

                    expect(hierarchyList[2]).toEqual(column1);
                    expect(hierarchyList[3]).toEqual(column2);
                    expect(hierarchyList[4]).toEqual(column3);
                    expect(hierarchyList[5]).toEqual(column4);
                    expect(hierarchyList[6]).toEqual(column5);
                    expect(hierarchyList[7]).toEqual(column6);
                });
            });
            describe('_getHierarchyMaxRowCount', function() {
                it('계층구조를 마크업으로 표현할때 생성해야할 최대 행 수를 반환한다.', function() {
                    //0, 1 은 _number, _button 컬럼이므로 2부터 테스트한다.
                    var hierarchyList = header._getColumnHierarchyList(),
                        maxRow = header._getHierarchyMaxRowCount(hierarchyList);

                    expect(maxRow).toEqual(4);
                    grid.options.columnMerge = [
                        {
                            'columnName' : 'mergeColumn1',
                            'title' : '1 + 2',
                            'columnNameList' : ['columnName1', 'columnName2']
                        },
                        {
                            'columnName' : 'mergeColumn2',
                            'title' : '1 + 2 + 3',
                            'columnNameList' : ['mergeColumn1', 'columnName3']
                        },
                        {
                            'columnName' : 'mergeColumn3',
                            'title' : '1 + 2 + 3 + 4 + 5',
                            'columnNameList' : ['mergeColumn2', 'columnName4', 'columnName5']
                        },
                        {
                            'columnName' : 'mergeColumn4',
                            'title' : '1 + 2 + 3 + 4 + 5 + 6',
                            'columnNameList' : ['mergeColumn3', 'columnName6']
                        },
                        {
                            'columnName' : 'mergeColumn6',
                            'title' : '7 + 8',
                            'columnNameList' : ['columnName7', 'columnName8']
                        }
                    ];
                    hierarchyList = header._getColumnHierarchyList();
                    maxRow = header._getHierarchyMaxRowCount(hierarchyList);
                    expect(maxRow).toEqual(5);
                });
            });
            describe('_getTableBodyMarkup', function() {
                it('현재 설정된 계층구조대로 랜더링 하는지 확인한다.', function() {
                    $empty.html(header._getTableBodyMarkup());
                    expect($empty.find('tr').length).toBe(4);
                });
            });
        });
        describe('render', function() {
            it('랜더링을 정상적으로 하는지 확인한다.', function() {
                grid.dimensionModel.set('headerHeight', 50);
                $empty.html(header.render().el);
                expect($empty.find('table').length).toEqual(1);
                expect($empty.find('colgroup').length).toEqual(1);
                expect($empty.find('tbody').length).toEqual(1);
                expect($empty.find('tr').length).toEqual(1);
                expect($empty.find('.header').height()).toEqual(50);

            });
            it('resize 핸들러를 랜더링 하는지 확인한다.', function() {
                $empty.html(header.render().el);
                expect($empty.find('.resize_handle_container').length).toBe(1);
            });
            it('columnMerge 가 설정되어 있을때 랜더링을 정상적으로 하는지 확인한다.', function() {
                var columnMergeList = [
                    {
                        'columnName' : 'mergeColumn1',
                        'title' : '1 + 2',
                        'columnNameList' : ['columnName1', 'columnName2']
                    },
                    {
                        'columnName' : 'mergeColumn2',
                        'title' : '1 + 2 + 3',
                        'columnNameList' : ['mergeColumn1', 'columnName3']
                    },
                    {
                        'columnName' : 'mergeColumn3',
                        'title' : '1 + 2 + 3 + 4 + 5',
                        'columnNameList' : ['mergeColumn2', 'columnName4', 'columnName5']
                    }
                ];
                grid.options['columnMerge'] = columnMergeList;
                grid.dimensionModel.set('headerHeight', 50);
                $empty.html(header.render().el);
                expect($empty.find('table').length).toEqual(1);
                expect($empty.find('colgroup').length).toEqual(1);
                expect($empty.find('tbody').length).toEqual(1);
                expect($empty.find('tr').length).toEqual(4);
                expect($empty.find('.header').height()).toEqual(50);
            });
        });
        describe('_onColumnWidthChanged', function() {
            it('columnWidthList 에 설정된 대로 col 들을 설정하는지 확인한다.', function() {
                $empty.html(header.render().el);
                var columnWidthList = header._getColumnData().widthList,
                    $colList = $empty.find('col');
                _.each(columnWidthList, function(width, i) {
                    expect($colList.eq(i).width()).toEqual(width);
                });
            });
        });
        describe('_getHeaderMainCheckbox', function() {
            it('header 에 checkbox 가 랜더링 되었을 때, checkbox 를 잘 가져오는지 확인한다.', function() {
                grid.options['selectType'] = 'checkbox';
                $empty.html(header.render().el);
                var $input = header._getHeaderMainCheckbox();
                expect($input.length).toBe(1);
            });
            it('header 에 checkbox 가 랜더링 되지 않았을 때', function() {
                grid.options['selectType'] = 'radio';
                grid.columnModel.set('selectType', 'radio');
                $empty.html(header.render().el);
                var $input = header._getHeaderMainCheckbox();
                expect($input.length).toBe(0);
            });
        });
        describe('_syncCheckState', function() {
            it('각 행의 button 이 true 로 설정되어 있는지 확인하고, header 의 checked 상태를 갱신한다.', function() {
                $empty.html(header.render().el);
                var $input = header._getHeaderMainCheckbox();
                header._syncCheckState();
                expect($input.prop('checked')).toBe(false);
                grid.dataModel.forEach(function(row) {
                    row.set('_button', true);
                });
                header._syncCheckState();
                expect($input.prop('checked')).toBe(true);
            });

            it('각 행의 button 이 disable 되어있다면, disable 상태를 고려하여 checkbox 상태를 갱신한다.', function() {
                $empty.html(header.render().el);
                var $input = header._getHeaderMainCheckbox();
                header._syncCheckState();
                expect($input.prop('checked')).toBe(false);
                grid.dataModel.forEach(function(row) {
                    grid.dataModel.setRowState(row.get('rowKey'), 'DISABLED');
                });
                header._syncCheckState();
                expect($input.prop('checked')).toBe(true);
            });
        });
        describe('_onCheckCountChange', function() {
            beforeEach(function() {
                jasmine.clock().install();
            });
            afterEach(function() {
                jasmine.clock().uninstall();
            });
            it('timeout 을 이용하여 _syncCheckState 를 한번만 호출하는지 확인한다.', function() {
                grid.options['selectType'] = 'checkbox';
                header._syncCheckState = jasmine.createSpy('_syncCheckState');
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();
                header._onCheckCountChange();

                jasmine.clock().tick(10);
                expect(header._syncCheckState.calls.count()).toBe(1);
            });
            it('selectType 이 checkbox 가 아니라면 호출하지 않는다.', function() {
                grid.options['selectType'] = 'radio';
                header._syncCheckState = jasmine.createSpy('_syncCheckState');
                header._onCheckCountChange();

                jasmine.clock().tick(10);
                expect(header._syncCheckState).not.toHaveBeenCalled();
            });
        });
        describe('_onClick', function() {
            beforeEach(function() {
                grid.checkAll = jasmine.createSpy('checkAll');
                grid.uncheckAll = jasmine.createSpy('uncheckAll');
            });
            describe('selectType 이 checkbox 일 때', function() {
                var $input,
                    clickEvent;
                beforeEach(function() {
                    grid.options.selectType = 'checkbox';
                    $empty.html(header.render().el);
                    $input = header._getHeaderMainCheckbox();
                    clickEvent = {target: $input.get(0)};
                });
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

    describe('header-resizeHandler 테스트', function() {
        var handler;
        beforeEach(function() {
            handler && handler.destroy();
            handler = new View.Layout.Header.ResizeHandler({
                grid: grid,
                whichSide: 'R'
            });
        });
        afterEach(function() {
            handler._stopResizing();
            handler && handler.destroy();
        });
        describe('_getColumnData', function() {
            it('columnModelList 와 columnWidthList 를 반환하는지 확인한다.', function() {
                var columnData = handler._getColumnData();
                expect(columnData.widthList.length).toBeGreaterThan(0);
                expect(columnData.modelList.length).toBeGreaterThan(0);
            });
        });
        describe('_getResizeHandlerMarkup', function() {
            var $handlerList;
            beforeEach(function() {
                $empty.html(handler._getResizeHandlerMarkup());
                $handlerList = $empty.find('div');
            });
            it('resize handler div 리스트를 잘 생성하는지 확인한다.', function() {
                expect($handlerList.eq(0).attr('columnName')).toBe('_number');
                expect($handlerList.eq(1).attr('columnName')).toBe('_button');
                expect($handlerList.eq(2).attr('columnName')).toBe('columnName1');
                expect($handlerList.eq(3).attr('columnName')).toBe('columnName2');
                expect($handlerList.eq(4).attr('columnName')).toBe('columnName3');
                expect($handlerList.eq(5).attr('columnName')).toBe('columnName4');
                expect($handlerList.eq(6).attr('columnName')).toBe('columnName5');
                expect($handlerList.eq(7).attr('columnName')).toBe('columnName6');
                expect($handlerList.eq(8).attr('columnName')).toBe('columnName7');
                expect($handlerList.eq(9).attr('columnName')).toBe('columnName8');
                expect($handlerList.eq(10).length).toBe(0);
            });
            it('마지막 resize handler 에 resize_handle_last css 클래스가 할당되는지 확인한다.', function() {
                expect($handlerList.eq(0).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(1).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(2).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(3).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(4).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(5).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(6).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(7).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(8).hasClass('resize_handle_last')).toBe(false);
                expect($handlerList.eq(9).hasClass('resize_handle_last')).toBe(true);
            });
        });
        describe('_getColumnIndex', function() {
            beforeEach(function() {
                grid.columnModel.set('columnFixIndex', 4);
            });
            afterEach(function() {
                grid.columnModel.set('columnFixIndex', 0);
            });
            it('L side 일때 columnFix index 를 고려하여 실제 columnIndex 를 계산한다.', function() {
                handler.whichSide = 'L';
                expect(handler._getColumnIndex(0)).toBe(0);
                expect(handler._getColumnIndex(1)).toBe(1);
                expect(handler._getColumnIndex(2)).toBe(2);
                expect(handler._getColumnIndex(3)).toBe(3);
            });
            it('R side 일때 columnFix index 를 고려하여 실제 columnIndex 를 계산한다.', function() {
                handler.whichSide = 'R';
                expect(handler._getColumnIndex(0)).toBe(4);
                expect(handler._getColumnIndex(1)).toBe(5);
                expect(handler._getColumnIndex(2)).toBe(6);
                expect(handler._getColumnIndex(3)).toBe(7);
            });
        });
        describe('_refreshHandlerPosition', function() {
            var $handlerList;
            beforeEach(function() {
                $empty.html(handler._getResizeHandlerMarkup());
                $handlerList = $empty.find('.resize_handle');
                handler.$el = $empty;
                handler._refreshHandlerPosition();
            });
            it('columnWidthList 에 맞추어 div 포지션을 잘 세팅하는지 확인한다.', function() {
                expect($handlerList.eq(0).css('left')).toEqual('58px');
                expect($handlerList.eq(1).css('left')).toEqual('109px');
                expect($handlerList.eq(2).css('left')).toEqual('210px');
                expect($handlerList.eq(3).css('left')).toEqual('411px');
                expect($handlerList.eq(4).css('left')).toEqual('712px');
                expect($handlerList.eq(5).css('left')).toEqual('1113px');
                expect($handlerList.eq(6).css('left')).toEqual('1614px');
                expect($handlerList.eq(7).css('left')).toEqual('2215px');
                expect($handlerList.eq(8).css('left')).toEqual('2916px');
                expect($handlerList.eq(9).css('left')).toEqual('3717px');
            });

        });
        describe('render', function() {
            beforeEach(function() {
                $empty.html(handler.render().el);
                grid.dimensionModel.set('headerHeight', 50);
            });
            it('핸들러가 rendering 이 잘 되었는지 확인한다.', function() {
                expect($empty.find('.resize_handle_container').length).toBe(1);
                expect($empty.find('.resize_handle_container').css('marginTop')).toBe('-50px');
                expect($empty.find('.resize_handle_container').height()).toBe(50);
            });
        });
        describe('_startResizing, _stopResizing', function() {
            var $handlerList,
                mouseEvent;
            beforeEach(function() {
                $empty.html(handler.render().el);
                $handlerList = $empty.find('.resize_handle');
                mouseEvent = {
                    target: $handlerList.eq(0).get(0)
                };
            });
            describe('_startResizing', function() {
                beforeEach(function() {
                    handler._startResizing(mouseEvent);
                });
                it('_startResizing 시 데이터가 잘 설정되었는지 확인한다.', function() {
                    expect(handler.isResizing).toBe(true);
                    expect(handler.$target.is($handlerList.eq(0))).toBe(true);
                    expect(handler.initialLeft).toBe(58);
                    expect(handler.initialOffsetLeft).toBe(8);
                    expect(handler.initialWidth).toBe(60);
                });
            });
            describe('_stopResizing', function() {
                it('_stopResizing 시 데이터가 잘 초기화 되었는지 확인한다.', function() {
                    handler._stopResizing();
                    expect(handler.isResizing).toBe(false);
                    expect(handler.$target).toBeNull();
                    expect(handler.initialLeft).toBe(0);
                    expect(handler.initialOffsetLeft).toBe(0);
                    expect(handler.initialWidth).toBe(0);
                });
            });

        });
        describe('_onMouseDown, _onMouseUp', function() {
            var $handlerList,
                mouseEvent;
            beforeEach(function() {
                $empty.html(handler.render().el);
                $handlerList = $empty.find('.resize_handle');
                mouseEvent = {
                    target: $handlerList.eq(0).get(0)
                };
            });
            it('_onMouseDown 이 호출되면 startResizing 이 호출되는지 확인한다.', function() {
                handler._startResizing = jasmine.createSpy('_startResizing');
                handler._onMouseDown();
                expect(handler._startResizing).toHaveBeenCalled();
            });
            it('_onMouseUp 이 호출되면 _stopResizing 이 호출되는지 확인한다.', function() {
                handler._stopResizing = jasmine.createSpy('_stopResizing');
                handler._onMouseUp();
                expect(handler._stopResizing).toHaveBeenCalled();
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
        describe('_onMouseMove', function() {
            var $handlerList,
                mouseEvent,
                $target;
            beforeEach(function() {
                $empty.html(handler.render().el);
                $handlerList = $empty.find('.resize_handle');
                $target = $handlerList.eq(0);
                mouseEvent = {
                    target: $target.get(0),
                    preventDefault: function() {}
                };
            });
            it('_onMouseMove 가 호출되면 핸들러의 left 를 마우스 위치만큼 조정하고 columnwidth 값을 설정한다.', function() {
                mouseEvent.pageX = 300;
                handler._onMouseDown(mouseEvent);
                handler._onMouseMove(mouseEvent);
                expect($target.css('left')).toBe('292px');
                expect(grid.dimensionModel.get('columnWidthList')[0]).toBe(294);
            });
        });
    });
});