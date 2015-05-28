'use strict';

describe('view.painter.cell.normal', function() {
    function setSelectType(selectType) {
        grid.option = function() {
            return selectType;
        };
    }
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
            columnName: 'columnName1'
        },
        {
            title: 'columnName2',
            columnName: 'columnName2',
            formatter: function(value, rowData, columnModel) {
                return value + '_formatted';
            }
        },
        {
            title: 'columnName3',
            columnName: 'columnName3',
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
            title: 'columnName4',
            columnName: 'columnName4',
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
            title: 'columnName5',
            columnName: 'columnName5',
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
            title: 'columnName6',
            columnName: 'columnName6',
            relationList: [
                {
                    columnList: ['columnName3', 'columnName4', 'columnName5'],
                    optionListChange: function(value) {
                        if (value === true) {
                            return [
                                { text: '하나', value: 1},
                                { text: '둘', value: 2},
                                { text: '셋', value: 3},
                                { text: '넷', value: 4}
                            ];
                        }
                    }
                },
                {
                    columnList: ['columnName2'],
                    isDisabled: function(value, rowData) {
                        return value === false;
                    },
                    isEditable: function(value, rowData) {
                        return value !== false;
                    }
                }

            ]
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            isHidden: true
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
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        },
        {
            '_extraData': {
                'className': {
                    'row': ['rowClass'],
                    'column': {
                        'columnName1': ['normalClass']
                    }
                }
            },
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        },
        {
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        }
    ];
    var grid = {
            id: 'test_id',
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
        },
        cellPainter,
        $empty;
    grid.columnModel = new Data.ColumnModel({
        hasNumberColumn: true,
        selectType: 'checkbox',
        columnFixIndex: 2,
        columnModelList: columnModelList
    });
    grid.dataModel = new Data.RowList(rowList, {
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

    grid.renderModel.refresh();

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        cellPainter && cellPainter.destroy && cellPainter.destroy();
        setSelectType('checkbox');
    });
    afterEach(function() {
        $empty.empty();
    });
    describe('Cell.Normal 클래스 테스트', function() {
        beforeEach(function() {
            cellPainter = new View.Painter.Cell.Normal({
                grid: grid
            });
        });
        afterEach(function() {

        });
        describe('getEditType', function() {
            it('normal 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('normal');
            });
        });

        describe('getContentHtml', function() {
            it('formatter 가 정의되어 있지 않은 경우는 value 를 그대로 반환한다.', function() {
                var columnName = 'columnName2',
                    html,
                    rowKey = 0,
                    columnModel = grid.columnModel.getColumnModel(columnName);
                columnModel.formatter = null;

                html = cellPainter.getContentHtml({
                    rowKey: rowKey,
                    columnName: 'columnName2',
                    value: 'test'
                });
                expect(html).toBe('text');
            });
            describe('formatter 가 정의되어 있는 경우.', function() {
                it('formatter 를 알맞은 파라미터와 함께 호출하는지 확인한다.', function() {
                    var columnName = 'columnName2',
                        html,
                        rowKey = 0,
                        columnModel = grid.columnModel.getColumnModel(columnName);

                    columnModel.formatter = jasmine.createSpy('formatter');
                    html = cellPainter.getContentHtml({
                        rowKey: rowKey,
                        columnName: 'columnName2'
                    });
                    expect(columnModel.formatter).toHaveBeenCalledWith('text', grid.dataModel.get(rowKey).toJSON(), columnModel);
                });
                it('formatter 를 수행한 결과가 정확한지 확인한다.', function() {
                    var columnName = 'columnName2',
                        html,
                        rowKey = 0,
                        columnModel = grid.columnModel.getColumnModel(columnName);

                    columnModel.formatter = function(value, rowData, columnModel) {
                        return '<TEST>value';
                    };
                    html = cellPainter.getContentHtml({
                        rowKey: rowKey,
                        columnName: 'columnName2'
                    });
                    expect(html).toBe('<TEST>value');
                });
            });
        });
        describe('focusIn', function() {
            it('Grid 의 focusClipboard 메서드가 호출되는지 확인한다.', function() {
                grid.focusClipboard = jasmine.createSpy('focusClipboard');
                cellPainter.focusIn();
                expect(grid.focusClipboard).toHaveBeenCalled();
            });
        });
    });

    describe('Cell.Normal.Number 클래스 테스트', function() {
        beforeEach(function() {
            cellPainter = new View.Painter.Cell.Normal.Number({
                grid: grid
            });
        });
        afterEach(function() {

        });
        describe('getEditType', function() {
            it('_number 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('_number');
            });
        });

        describe('getContentHtml', function() {
            it('value 를 그대로 반환한다.', function() {
                var html = cellPainter.getContentHtml({
                    value: 'test'
                });
                expect(html).toBe('test');
            });
        });
    });

    describe('View.Painter.Cell.MainButton 클래스 테스트', function() {
        beforeEach(function() {
            cellPainter = new View.Painter.Cell.MainButton({
                grid: grid
            });
        });
        afterEach(function() {

        });
        describe('getEditType', function() {
            it('_button 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('_button');
            });
        });

        describe('getContentHtml', function() {
            it('value가 true 일 때 check 되는지 확인한다.', function() {
                var html = cellPainter.getContentHtml({
                        value: true
                    }),
                    $button;
                $empty.html(html);
                $button = $empty.find('input');
                expect($button.length).toEqual(1);
                expect($button.prop('checked')).toEqual(true);
            });
            it('isDisabled 가 true 일 때 비활성화 되는지 확인한다.', function() {
                var html = cellPainter.getContentHtml({
                        isDisabled: true
                    }),
                    $button;
                $empty.html(html);
                $button = $empty.find('input');
                expect($button.length).toEqual(1);
                expect($button.prop('disabled')).toEqual(true);
            });
            describe('selectType 에 따라 input 이 잘 생성되는지 확인한다.', function() {
                it('checkbox', function() {
                    setSelectType('checkbox');
                    var html = cellPainter.getContentHtml({}),
                        $button;
                    $empty.html(html);
                    $button = $empty.find('input');
                    expect($button.length).toEqual(1);
                    expect($button.attr('type')).toEqual('checkbox');
                });
                it('radio', function() {
                    setSelectType('radio');
                    var html = cellPainter.getContentHtml({}),
                        $button;
                    $empty.html(html);
                    $button = $empty.find('input');
                    expect($button.length).toEqual(1);
                    expect($button.attr('type')).toEqual('radio');
                });
            });
        });
        describe('setElementAttribute', function() {
            var html,
                $button,
                $td;
            beforeEach(function() {
                html = cellPainter.getContentHtml({});
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $button = $empty.find('input');
                $td = $empty.find('td');
            });
            it('값을 정확히 설정하는지 확인한다.', function() {
                expect($button.prop('checked')).toBe(false);
                cellPainter.setElementAttribute({value: true}, $td);
                expect($button.prop('checked')).toBe(true);
                cellPainter.setElementAttribute({value: true}, $td);
                expect($button.prop('checked')).toBe(true);
                cellPainter.setElementAttribute({value: false}, $td);
                expect($button.prop('checked')).toBe(false);
            });
        });
        describe('toggle', function() {
            var html,
                $button,
                $td;

            it('checkbox 일때 값을 toggle 하는지 확인한다.', function() {
                setSelectType('checkbox');
                html = cellPainter.getContentHtml({});
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $button = $empty.find('input');
                $td = $empty.find('td');

                expect($button.prop('checked')).toBe(false);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(true);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(false);
            });
            it('radio 일때 값을 toggle 하지 않는지 확인한다.', function() {
                setSelectType('radio');
                html = cellPainter.getContentHtml({});
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $button = $empty.find('input');
                $td = $empty.find('td');

                expect($button.prop('checked')).toBe(false);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(false);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(false);
            });
        });
        describe('getAttributes', function() {
            it('가운데 정렬 관련 세팅을 반환하는지 확인한다.', function() {
                expect(cellPainter.getAttributes()).toEqual({
                    align: 'center'
                });
            });
        });
        describe('_onMouseDown', function() {
            var html,
                $button,
                $td;

            beforeEach(function() {
                setSelectType('checkbox');
                html = cellPainter.getContentHtml({});
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $button = $empty.find('input');
                $td = $empty.find('td');
            });
            it('TD 에 mousedown 이벤트 발생시 button 의 상태변화를 유발하는지 확인한다.', function() {
                cellPainter.attachHandler($td);
                expect($button.prop('checked')).toBe(false);
                $td.trigger('mousedown');
                expect($button.prop('checked')).toBe(true);
                $td.trigger('mousedown');
                expect($button.prop('checked')).toBe(false);
                cellPainter.detachHandler($td);
            });
        });
        describe('_onChange', function() {
            var html,
                $button,
                $td;

            beforeEach(function() {
                setSelectType('checkbox');
                html = cellPainter.getContentHtml({});
                $empty.html('<table><tr key="0"><td>' + html + '</td></tr></table>');
                $button = $empty.find('input');
                $td = $empty.find('td');
            });
            it('onChange 이벤트가 발생했을 때 setValue 를 적절한 파라미터로 호출하는지 확인한다.', function() {
                grid.setValue = jasmine.createSpy('setValue');
                var changeEvent = {
                    target: $button.get(0)
                };
                cellPainter._onChange(changeEvent);
                expect(grid.setValue).toHaveBeenCalledWith('0', '_button', $button.prop('checked'));
            });
        });
        describe('KeyDownSwitch', function() {
            var $target = $('<div>');
            it('정의된 키 액션은 true 를 반환하는지 확인한다.', function() {
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('UP_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('DOWN_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('LEFT_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('RIGHT_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target))).toBe(true);
            });
            it('ENTER 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                cellPainter.focusOut = jasmine.createSpy('focusOut');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });
        });
    });
});
