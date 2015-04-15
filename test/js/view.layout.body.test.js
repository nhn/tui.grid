describe('view.layout.body', function() {
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

    var body,
        $empty;

    beforeEach(function() {
        jasmine.clock().install();
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        body && body.destroy();

        grid.dataModel.set(rowList, {parse: true});
        grid.renderModel.refresh();

        body = new View.Layout.Body({
            grid: grid,
            whichSide: 'R'
        });
    });
    afterEach(function() {
        jasmine.clock().uninstall();
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
});