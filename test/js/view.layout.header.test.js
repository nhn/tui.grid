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
            'normal': 'normal',
            'checkbox': 1,
            'radio': 1,
            'select': 1,
            'text': 'text',
            'text-convertible': 'text-convertible',
            'isDisabled': false,
            'isEditable': true
        },{
            '_extraData': {
                'className': {
                    'row': ['rowClass'],
                    'column': {
                        'columnName1': ['normalClass']
                    }
                }
            },
            'normal': 'normal',
            'checkbox': 1,
            'radio': 1,
            'select': 1,
            'text': 'text',
            'text-convertible': 'text-convertible',
            'isDisabled': false,
            'isEditable': true
        },{
            'normal': 'normal',
            'checkbox': 1,
            'radio': 1,
            'select': 1,
            'text': 'text',
            'text-convertible': 'text-convertible',
            'isDisabled': false,
            'isEditable': true
        }
    ];
    var grid = {
        focusAt: function() {},
        hideGridLayer: function() {},
        showGridLayer: function() {},
        check: function() {},
        option: function() {},
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
                }
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

    var header,
        $empty;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        header && body.destroy();

        grid.dataModel.set(rowList, {parse: true});
        grid.renderModel.refresh();

        header = new View.Layout.Body({
            grid: grid,
            whichSide: 'R'
        });
    });
    afterEach(function() {
        body && body.destroy();
        $empty.empty();
    });
    describe('_getColGroupMarkup', function() {
        var $colList;
        beforeEach(function() {
            $empty.html(body._getColGroupMarkup());
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
    describe('render', function() {
        beforeEach(function() {
            $empty.html(body.render().el);
        });
        it('table_container 엘리먼트가 잘 생성되었는지 확인한다.', function() {
            expect($empty.find('.table_container').length).toBe(1);
        });
        it('table-row 가 기대 개수만큼 생성되었는지 확인한다.', function() {
            expect($empty.find('tr').length).toBe(3);
        });
        it('table-data-cell 이 기대 개수만큼 생성되었는지 확인한다.', function() {
            /*
             10 * 3 에 rowSpan=3 인 cell 이 한개 이므로 10 * 3 - 2 = 28
             */
            expect($empty.find('td').length).toBe(28);
        });
        it('selection layer 가 생성되었는지 확인한다.', function() {
            expect($empty.find('.selection_layer').length).toBe(1);
        });
    });
    describe('_setTopPosition', function() {
        var $container;
        beforeEach(function() {
            $empty.html(body.render().el);
            $container = $empty.find('.table_container');
        });
        it('_setTopPosition 의 parameter 값 만큼 top 값이 조정되는지 확인한다.', function() {
            body._setTopPosition(10);
            expect($container.css('top')).toEqual('10px');
            body._setTopPosition(20);
            expect($container.css('top')).toEqual('20px');
            body._setTopPosition(30);
            expect($container.css('top')).toEqual('30px');
            body._setTopPosition(200);
            expect($container.css('top')).toEqual('200px');
        });
    });
    describe('_onBodyHeightChange', function() {
        beforeEach(function() {
            $empty.html(body.render().el);
        });
        it('dimension model 의 bodyHeight 가 변경된 경우 body 의 height 을 변경하는지 확인한다.', function() {
            body._onBodyHeightChange(null, 100);
            expect(body.$el.height()).toBe(100);
            body._onBodyHeightChange(null, 200);
            expect(body.$el.height()).toBe(200);
        });
    });
    describe('_onColumnWidthChanged', function() {
        var $colList;
        beforeEach(function() {
            $empty.html(body.render().el);
            $colList = $empty.find('col');
        });
        it('columnWidthList 가 변경되었을 때, col 태그의 값을 변경된 값에 맞게 변경하는지 확인한다.', function() {
            grid.dimensionModel.setColumnWidth(0, 150);
            grid.dimensionModel.setColumnWidth(1, 150);
            grid.dimensionModel.setColumnWidth(2, 150);
            grid.dimensionModel.setColumnWidth(3, 150);
            grid.dimensionModel.setColumnWidth(4, 150);
            grid.dimensionModel.setColumnWidth(5, 150);

            expect($colList.eq(0).width()).toBe(150);
            expect($colList.eq(1).width()).toBe(150);
            expect($colList.eq(2).width()).toBe(150);
            expect($colList.eq(3).width()).toBe(150);
            expect($colList.eq(4).width()).toBe(150);
            expect($colList.eq(5).width()).toBe(150);
        });
    });
    describe('_onMouseDown', function() {
        var selection = grid.selection;
        beforeEach(function() {
            $empty.html(body.render().el);
        });
        describe('mousedown 만 발생한 경우', function() {
            it('selection 의 endSelection 과 attachMouseEvent 가 호출되었는지 확인한다.', function() {
                selection.endSelection = jasmine.createSpy('endSelection');
                selection.attachMouseEvent = jasmine.createSpy('attachMouseEvent');
                body._onMouseDown({
                    pageX: 100,
                    pageY: 10
                });
                expect(selection.endSelection).toHaveBeenCalled();
                expect(selection.attachMouseEvent).toHaveBeenCalledWith(100, 10);
            });

        });
        describe('shift key 가 입력된 상태로 mousedown 이 발생한 경우', function() {
            beforeEach(function() {
                grid.focusModel.focus(1, 'columnName2');
                selection.startSelection = jasmine.createSpy('startSelection');
                selection.attachMouseEvent = jasmine.createSpy('attachMouseEvent');
                selection.getIndexFromMousePosition = function() {
                    return{
                        row: 0,
                        column: 0
                    };
                };
                selection.updateSelection = jasmine.createSpy('updateSelection');
                selection.hasSelection = function() {return false;};
                grid.focusAt = jasmine.createSpy('focusAt');
            });

            it('', function() {
                selection.hasSelection = function() {return true;};
                body._onMouseDown({
                    shiftKey: true,
                    pageX: 100,
                    pageY: 10
                });
                expect(selection.startSelection).not.toHaveBeenCalled();
                expect(selection.attachMouseEvent).toHaveBeenCalledWith(100, 10);
                expect(selection.updateSelection).toHaveBeenCalledWith(0, 0);
                expect(grid.focusAt).toHaveBeenCalledWith(0, 0);
            });
            it('selection 의 hasSelection 이 false 일 때, startSelection 을 호출하는지 확인한다.', function() {
                selection.hasSelection = function() {return false;};
                body._onMouseDown({
                    shiftKey: true,
                    pageX: 100,
                    pageY: 10
                });
                expect(selection.startSelection).toHaveBeenCalledWith(1, 3);

            });
        });
    });
    describe('_onScroll', function() {

        describe('_onScroll 이벤트 핸들러가 수행되면 renderModel 의 scrollTop, scrollLeft 를 변경하는지 확인한다.', function() {
            it('R Side 일때는 scrollLeft 값도 변경한다.', function() {
                body.whichSide = 'R';
                body._onScroll({
                    target: {
                        scrollTop: 10,
                        scrollLeft: 20
                    }
                });
                expect(grid.renderModel.get('scrollTop')).toBe(10);
                expect(grid.renderModel.get('scrollLeft')).toBe(20);
            });
            it('L Side 일때는 scrollLeft 값이 변경되지 않는다.', function() {
                body.whichSide = 'L';
                body._onScroll({
                    target: {
                        scrollTop: 100,
                        scrollLeft: 200
                    }
                });
                expect(grid.renderModel.get('scrollTop')).toBe(100);
                expect(grid.renderModel.get('scrollLeft')).not.toBe(200);
            });
        });

    });
});