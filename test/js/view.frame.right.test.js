'use strict';

/* global Data, Model, View */
describe('view.frame.right', function() {
    var defaultOption,
        $empty;

    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        }, {
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
                    isDisabled: function(value) {
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
                    isEditable: function(value) {
                        return !!value;
                    }
                }
            ]
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
        headerHeight: 50,
        rowHeight: 10,
        displayRowCount: 20,
        scrollX: true,
        scrollBarSize: 17,
        bodyHeight: 200,
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
        grid.renderModel.refresh();
    });

    afterEach(function() {
        grid.options = defaultOption;
        grid.columnModel.set('selectType', grid.option('selectType'));
    });

    describe('R Side frame 을 점검한다.', function() {
        var frame;

        beforeEach(function() {
            frame = new View.Layout.Frame.Rside({
                grid: grid
            });
        });

        describe('render', function() {
            beforeEach(function() {
                grid.options.scrollY = true;
            });

            describe('virtualScrollbar 상태를 확인한다.', function() {
                it('notUseSmartRendering 이 true 일때 virtualScrollbar 를 생성하지 않는다.', function() {
                    grid.options.notUseSmartRendering = true;
                    $empty.html(frame.render().el);
                    expect($empty.find('virtual_scrollbar').length).toBe(0);
                });
                it('scrollbar 의 상태를 확인한다.', function() {
                    grid.options.notUseSmartRendering = false;

                    $empty.html(frame.render().el);
                    expect($empty.find('.virtual_scrollbar').length).toBe(1);
                });
            });

            describe('_onColumnWidthChanged', function() {
                it('width 가 변경되면 dimensionModel 에 정의된 값으로 변경한다.', function() {
                    grid.columnModel.set('columnFixIndex', 0);

                    $empty.html(frame.render().el);
                    expect(frame.$el.width()).not.toBe(286);

                    grid.columnModel.set('columnFixIndex', 3);
                    expect(frame.$el.width()).toBe(286);
                });
            });
        });
    });

    describe('Virtual Scrollbar 를 확인한다.', function() {
        var scrollbar;
        beforeEach(function() {
            scrollbar = new View.Layout.Frame.Rside.VirtualScrollBar({
                grid: grid
            });
        });

        afterEach(function() {
            scrollbar && scrollbar.destroy();
        });

        describe('_onMouseUp, _onMouseDown', function() {
            beforeEach(function() {
                $empty.html(scrollbar.render().el);
            });

            describe('_onMouseDown', function() {
                beforeEach(function() {
                    scrollbar._onMouseUp = jasmine.createSpy('_onMouseUp');
                    scrollbar._onMouseDown();
                });

                it('document 에 mouseUp 이벤트 핸들러를 걸었는지 확인한다.', function() {
                    $(document).trigger('mouseup');
                    expect(scrollbar._onMouseUp).toHaveBeenCalled();
                });

                it('hasFocus 프로퍼티가 적절히 변경되었는지 확인한다.', function() {
                    expect(scrollbar.hasFocus).toBe(true);
                });
            });

            describe('_onMouseUp', function() {
                beforeEach(function() {
                    scrollbar._onMouseDown();
                });
                
                it('hasFocus 프로퍼티가 적절히 변경되었는지 확인한다.', function() {
                    expect(scrollbar.hasFocus).toBe(true);
                    scrollbar._onMouseUp();
                    expect(scrollbar.hasFocus).toBe(false);
                });
            });
        });

        describe('_onScrollTopChange', function() {
            beforeEach(function() {
                $empty.html(scrollbar.render().el);
            });

            it('scrollTop 값이 변경되어 onScrollTopChange 가 호출되었을때, 엘리먼트에서 표현하지 못하는 scrollTop 값이면 정상 값으로 정정한다.', function() {
                scrollbar._onScrollTopChange({}, 40);
                expect(grid.renderModel.get('scrollTop')).toBe(0);
            });
        });

        describe('_onDimensionChange', function() {
            beforeEach(function() {
                scrollbar.render = jasmine.createSpy('render');
            });

            it('dimension모델의 headerHeight 혹은 bodyHeight 이 변경되면 render 가 호출된다.', function() {
                grid.dimensionModel.set('headerHeight', 40);
                expect(scrollbar.render.calls.count()).toBe(1);
                grid.dimensionModel.set('bodyHeight', 40);
                expect(scrollbar.render.calls.count()).toBe(2);
            });

            it('dimension모델의 headerHeight 혹은 bodyHeight 이 변경되면 render 가 호출된다.', function() {
                grid.dimensionModel.set('toolbarHeight', 40);
                expect(scrollbar.render).not.toHaveBeenCalled();
            });
        });
    });
});
