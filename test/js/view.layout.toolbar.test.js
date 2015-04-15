describe('view.frame.toolbar', function() {
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
        },
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true}
    ];


    var grid = {
        options: {
            selectType: 'checkbox',
            columnMerge: [],
            toolbar: {
                hasControlPanel: false,
                hasResizeHandler: false,
                hasPagination: false
            }
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
        headerHeight: 50,
        rowHeight: 10,
        displayRowCount: 20,
        scrollX: true,
        scrollBarSize: 17,
        bodyHeight: 200,
        toolbarHeight: 50,
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
    describe('Toolbar instance 를 테스트한다.', function() {
        var toolbar;
        beforeEach(function() {
            toolbar = new View.Layout.Toolbar({
                grid: grid
            });
        });
        afterEach(function() {
            toolbar && toolbar.destroy();
        });
        describe('render 옵션에 따라 랜더링을 잘 하는지 확인한다.', function() {
            describe('hasControlPanel', function() {
                it('hasControlPanel = false 일 때', function() {
                    grid.options.toolbar.hasControlPanel = false;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.btn_setup').length).toBe(0);
                });
                it('hasControlPanel = true 일 때', function() {
                    grid.options.toolbar.hasControlPanel = true;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.btn_setup').length).toBe(1);
                });
            });
            describe('hasResizeHandler', function() {
                it('hasResizeHandler = false 일 때', function() {
                    grid.options.toolbar.hasResizeHandler = false;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.height_resize_bar').length).toBe(0);
                });
                it('hasResizeHandler = true 일 때', function() {
                    grid.options.toolbar.hasResizeHandler = true;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.height_resize_bar').length).toBe(1);
                });
            });
            describe('hasPagination', function() {
                it('hasPagination = false 일 때', function() {
                    grid.options.toolbar.hasPagination = false;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.pagination').length).toBe(0);
                });
                it('hasPagination = true 일 때', function() {
                    grid.options.toolbar.hasPagination = true;
                    $empty.html(toolbar.render().el);
                    expect($empty.find('.pagination').length).toBe(1);
                });
            });
        });
    });
    describe('Resize Handler instance 를 테스트한다.', function() {
        var resize,
            mouseEvent;
        beforeEach(function() {
            mouseEvent = {
                pageX: 100,
                pageY: 20,
                target: $('<div>'),
                preventDefault: function() {}
            };
            resize = new View.Layout.Toolbar.ResizeHandler({
                grid: grid
            });
        });
        afterEach(function() {
            resize && resize.destroy();
        });
        describe('_onMouseDown', function() {
            beforeEach(function() {
                resize._attachMouseEvent = jasmine.createSpy('_attachMouseEvent');
                grid.updateLayoutData = jasmine.createSpy('updateLayoutData');
                resize._onMouseDown(mouseEvent);
            });
            it('mouseDown 이벤트가 발생하면 updateLayoutData 와 _attachMouseEvent 를 수행한다.', function() {
                expect(resize._attachMouseEvent).toHaveBeenCalled();
                expect(grid.updateLayoutData).toHaveBeenCalled();
            });
            it('body 엘리먼트의 커서 css 스타일을 row-resize 로 변경한다..', function() {
                expect($(document.body).css('cursor')).toEqual('row-resize');
            });
        });
        describe('_onMouseUp', function() {
            beforeEach(function() {
                resize._attachMouseEvent = function() {};
                resize._detachMouseEvent = jasmine.createSpy('_detachMouseEvent');
                resize._onMouseDown(mouseEvent);
                resize._onMouseUp();
            });
            it('mouseDown 이벤트가 발생하면 updateLayoutData 와 _attachMouseEvent 를 수행한다.', function() {
                expect(resize._detachMouseEvent).toHaveBeenCalled();
            });
            it('body 엘리먼트의 커서 css 스타일을 row-resize 로 변경한다..', function() {
                expect($(document.body).css('cursor')).toEqual('default');
            });
        });
        describe('_onMouseMove. ', function() {
            it('min 이하로 높이가 줄어들지 않는다..', function(done) {
                mouseEvent.pageY = 300;
                resize._onMouseMove(mouseEvent);
                setTimeout(function () {
                    expect(grid.dimensionModel.get('bodyHeight')).toBe(27);
                    done();
                }, 10);
            });
            it('resize 가 잘 된다', function(done) {
                mouseEvent.pageY = 400;
                resize._onMouseMove(mouseEvent);
                setTimeout(function () {
                    expect(grid.dimensionModel.get('bodyHeight')).toBe(100);
                    done();
                }, 10);
            });
        });
    });
    describe('Pagination instance 를 테스트한다.', function() {
        var pagination,
            PaginationClass;

        beforeEach(function() {
            PaginationClass = ne && ne.component && ne.component.Pagination
            pagination = new View.Layout.Toolbar.Pagination({
                grid: grid
            });
        });
        afterEach(function() {
            pagination && pagination.destroy();
        });
        it('Pagination Instance 를 잘 생성하는지 확인한다.', function() {
            pagination._setPaginationInstance();
            expect(pagination.instance instanceof PaginationClass).toBe(true);
        });
        it('이미 pagination instance 를 생성다면 pagination 을 생성하지 않는다.', function() {
            pagination.instance = new PaginationClass({
                itemCount: 1,
                itemPerPage: 1
            }, pagination.$el);

            ne.component.Pagination = jasmine.createSpy('pagination');
            pagination._setPaginationInstance();
            expect(ne.component.Pagination).not.toHaveBeenCalled();
        });
    });
});
