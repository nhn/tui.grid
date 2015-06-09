'use strict';

describe('view.painter.rowList', function() {
    var columnModelList = [
        {
            title: 'normal',
            columnName: 'normal'
        }, {
            title: 'text',
            columnName: 'text',
            editOption: {
                type: 'text'
            }
        },
        {
            title: 'text-convertible',
            columnName: 'text-convertible',
            editOption: {
                type: 'text-convertible'
            }
        },
        {
            title: 'select',
            columnName: 'select',
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
            title: 'checkbox',
            columnName: 'checkbox',
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
            title: 'radio',
            columnName: 'radio',
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
            title: 'isDisabled',
            columnName: 'isDisabled',
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
            title: 'isEditable',
            columnName: 'isEditable',
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
        }, {
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
        }, {
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
        hideGridLayer: function() {},
        showGridLayer: function() {},
        check: function() {},
        option: function() {},
        focus: function() {},
        selection: {
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

    var rowListView,
        $empty;
    function createRowListView() {
        rowListView && rowListView.destroy();
        rowListView = new View.RowList({
            el: $empty,
            whichSide: 'R',
            grid: grid,
            collection: grid.renderModel.getCollection('R')
        });
    }
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        rowListView && rowListView.destroy();

        grid.dataModel.set(rowList, {parse: true});
        grid.renderModel.refresh();
        createRowListView();

    });
    describe('RowPainter 를 테스트한다.', function() {
        var simpleRowList = [
            {
                'normal': 'normal',
                'checkbox': 1,
                'radio': 1,
                'select': 1,
                'text': 'text',
                'text-convertible': 'text-convertible',
                'isDisabled': false,
                'isEditable': true
            },
            {
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
        var rowPainter;
        beforeEach(function() {
            rowPainter = rowListView.rowPainter;
        });
        describe('_getEditType', function() {
            it('_number 일 경우 isEditable 과 관계없이 무조건 _number 을 리턴한다.', function() {
                expect(rowPainter._getEditType('_number', {isEditable: false})).toEqual('_number');
                expect(rowPainter._getEditType('_number', {isEditable: true})).toEqual('_number');
            });
            it('isEditable 이 false 이고 _number 가 아닐 경우 무조건 normal 을 리턴한다.', function() {
                expect(rowPainter._getEditType('normal', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('text', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('text-convertible', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('select', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('checkbox', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('radio', {isEditable: false})).toEqual('normal');
            });
            it('그 외의 경우 정확한 editType 을 반환한다.', function() {
                expect(rowPainter._getEditType('normal', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('normal', {isEditable: true})).toEqual('normal');
                expect(rowPainter._getEditType('text', {isEditable: true})).toEqual('text');
                expect(rowPainter._getEditType('text-convertible', {isEditable: true})).toEqual('text-convertible');
                expect(rowPainter._getEditType('select', {isEditable: true})).toEqual('select');
                expect(rowPainter._getEditType('checkbox', {isEditable: true})).toEqual('checkbox');
                expect(rowPainter._getEditType('radio', {isEditable: true})).toEqual('radio');
            });
        });
        describe('_getRowElement', function() {
            it('현재 rendering 된 엘리먼트 중, rowKey 에 해당하는 엘리먼트를 반환한다.', function() {
                grid.dataModel.set(simpleRowList, {parse: true});
                grid.renderModel.refresh();
                expect(rowPainter._getRowElement(0).length).toEqual(1);
                expect(rowPainter._getRowElement(0).attr('key')).toEqual('0');
                expect(rowPainter._getRowElement(1).length).toEqual(1);
                expect(rowPainter._getRowElement(1).attr('key')).toEqual('1');
                expect(rowPainter._getRowElement(2).length).toEqual(0);
            });
        });
        describe('_onFocus, _onBlur', function() {
            it('rendering 된 엘리먼트 중 해당하는 엘리먼트에 focus, blur 디자인 클래스를 적용한다.', function() {
                grid.dataModel.set(simpleRowList, {parse: true});
                grid.renderModel.refresh();
                expect(grid.getElement(0, 'text').hasClass('focused')).toBe(false);
                rowPainter._onFocus(0, 'text');
                expect(grid.getElement(0, 'text').hasClass('focused')).toBe(true);
                rowPainter._onBlur(0, 'text');
                expect(grid.getElement(0, 'text').hasClass('focused')).toBe(false);

                expect(grid.getElement(1, 'text-convertible').hasClass('focused')).toBe(false);
                rowPainter._onFocus(1, 'text-convertible');
                expect(grid.getElement(1, 'text-convertible').hasClass('focused')).toBe(true);
            });
        });
        describe('_setCssSelect', function() {
            it('rendering 된 엘리먼트 중 해당하는 엘리먼트에 focus, blur 디자인 클래스를 적용한다.', function() {
                grid.dataModel.set(simpleRowList, {parse: true});
                grid.renderModel.refresh();
                expect(grid.getElement(0, 'text').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'text-convertible').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'normal').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'radio').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'select').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'isDisabled').hasClass('selected')).toBe(false);
                expect(grid.getElement(0, 'isEditable').hasClass('selected')).toBe(false);

                rowPainter._setCssSelect(0, true);
                expect(grid.getElement(0, 'text').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'text-convertible').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'normal').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'radio').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'select').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'isDisabled').hasClass('selected')).toBe(true);
                expect(grid.getElement(0, 'isEditable').hasClass('selected')).toBe(true);
            });
        });
        describe('_onSelect, _onUnselect', function() {
            beforeEach(function() {
                grid.dataModel.set(simpleRowList, {parse: true});
                grid.renderModel.refresh();
                rowPainter._setCssSelect = jasmine.createSpy('_setCssSelect');
            });
            it('_onSelect 호출시 _setCssSelect 를 true 로 호출한다.', function() {
                rowPainter._onSelect(0);
                expect(rowPainter._setCssSelect).toHaveBeenCalledWith(0, true);
            });
            it('_onUnselect 호출시 _setCssSelect 를 false 로 호출한다.', function() {
                rowPainter._onUnselect(0);
                expect(rowPainter._setCssSelect).toHaveBeenCalledWith(0, false);
            });
        });
    });
    describe('RowList 를 테스트한다.', function() {
        var simpleRowList = [
            {
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
                    rowSpan: {
                        normal: 2
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
        describe('_showLayer', function() {
            it('row의 length 가 0 이 아닐경우 grid.hideGridLayer를 를 호출한다.', function() {
                expect(grid.dataModel.length).toBeGreaterThan(0);
                grid.hideGridLayer = jasmine.createSpy('hideGridLayer');
                rowListView._showLayer();
                expect(grid.hideGridLayer).toHaveBeenCalled();

            });
            it('row의 length 가 0 일경우 grid.showGridLayer 를 호출한다.', function() {
                grid.showGridLayer = jasmine.createSpy('showGridLayer');
                grid.dataModel.set([], {parse: true});
                rowListView._showLayer();
                expect(grid.showGridLayer).toHaveBeenCalledWith('empty');

            });
        });
        describe('render', function() {
            beforeEach(function() {
                rowListView.destroy();
            });
            it('dataModel 의 rowList 가 변경될 경우, 데이터 내용에 맞게 rendering 한다.', function() {
                grid.dataModel.set(simpleRowList, {parse: true});
                grid.renderModel.refresh();

                expect($.trim($empty.html())).toBe('');
                createRowListView();
                rowListView.render();
                var trList = $empty.find('tr'),
                    tdList = $empty.find('td');

                expect(trList.length).toBe(3);
                //rowSpan 이 있기 때문에 (3 * 10) -1 이 기대값이다.
                expect(tdList.length).toBe(29);
            });
        });
        describe('_createRowPainter', function() {
            beforeEach(function() {
                rowListView.destroyChildren();
                rowListView.rowPainter = null;
            });
            it('rowPainter 인스턴스를 생성한다..', function() {
                expect(rowListView.rowPainter).toBeNull();
                rowListView._createRowPainter();
                expect(rowListView.rowPainter).not.toBeNull();
            });
        });
    });

});
