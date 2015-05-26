'use strict';

describe('view.painter.cell.text', function() {
    function getKeyEvent(keyName, $target) {
        return {
            keyCode: grid.keyMap[keyName],
            which: grid.keyMap[keyName],
            target: $target.get(0)
        };
    }
    var columnModelList = [
        {
            title: 'text',
            columnName: 'text',
            editOption: {
                type: 'text-convertible'
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
            'text': 'text',
            'text-convertible': 'text-convertible',
            'isDisabled': false,
            'isEditable': true
        },{
            'text': 'text',
            'text-convertible': 'text-convertible',
            'isDisabled': false,
            'isEditable': true
        }
    ];
    var grid = {
            selection: {
                disable: function() {},
                enable: function() {}
            },
            getElement: function() { return [];},
            setValue: function() {},
            focusIn: function() {},
            focusClipboard: function() {
                $(document).focus();
            },
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
        $empty,
        cellPainter;

    jasmine.getFixtures().fixturesPath = 'base/';
    loadFixtures('test/fixtures/empty.html');
    $empty = $('#empty');

    grid.columnModel = new Data.ColumnModel({
        hasNumberColumn: true,
        selectType: 'checkbox',
        columnFixIndex: 2,
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

    beforeEach(function() {
        cellPainter && cellPainter.destroy && cellPainter.destroy();
        grid.dataModel.set(rowList, {parse: true});
        grid.renderModel.refresh();
    });

    afterEach(function() {
        $empty.empty();
    });

    describe('View.Painter.Cell.Text 클래스 테스트', function() {
        beforeEach(function() {
            cellPainter = new View.Painter.Cell.Text({
                grid: grid
            });
        });

        describe('getEditType', function() {
            it('text 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('text');
            });
        });

        describe('focusOut', function() {
            it('Grid 의 focusClipboard 메서드가 호출되는지 확인한다.', function() {
                grid.focusClipboard = jasmine.createSpy('focusClipboard');
                cellPainter.focusOut();
                expect(grid.focusClipboard).toHaveBeenCalled();
            });
        });

        describe('getContentHtml', function() {
            it('value 값이 input 에 설정되는지 확인한다.', function() {
                var html = cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'text'
                    }),
                    $input;
                $empty.html(html);
                $input = $empty.find('input');
                expect($input.length).toEqual(1);
                expect($input.val()).toEqual('text');
                expect($input.prop('disabled')).toEqual(false);
            });
            it('disabled 가 설정되는지 확인한다..', function() {
                var html = cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'text',
                        isDisabled: true
                    }),
                    $input;
                $empty.html(html);
                $input = $empty.find('input');
                expect($input.length).toEqual(1);
                expect($input.prop('disabled')).toEqual(true);
            });
        });
        describe('setElementAttribute', function() {
            var html,
                $input,
                $td;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text'
                });
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $input = $empty.find('input');
                $td = $empty.find('td');
            });
            it('값을 정확히 설정하는지 확인한다.', function() {
                expect($input.val()).toBe('text');
                cellPainter.setElementAttribute({
                    value: 'changed',
                    changed: []
                }, $td);
                expect($input.val()).toBe('text');
                cellPainter.setElementAttribute({
                    value: 'changed',
                    changed: ['value']
                }, $td);
                expect($input.val()).toBe('changed');
            });
            it('isDisabled 를 설정하는지 확인한다.', function() {
                expect($input.prop('disabled')).toBe(false);
                cellPainter.setElementAttribute({
                    isDisabled: true
                }, $td);
                expect($input.val()).toBe('text');
                expect($input.prop('disabled')).toBe(true);
                cellPainter.setElementAttribute({
                    isDisabled: false
                }, $td);
                expect($input.prop('disabled')).toBe(false);
            });
        });
        describe('_onFocus', function() {
            var html,
                $input;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text'
                });
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $input = $empty.find('input');
            });

            it('originalText 를 잘 설정하는지 확인한다.', function() {
                expect($input.val()).toEqual('text');
                expect(cellPainter.originalText).toEqual('');
                cellPainter._onFocus({target: $input.get(0)});
                expect($input.val()).toEqual('text');
                expect(cellPainter.originalText).toEqual('text');
            });

            it('grid 의 selection.disable() 을 호출하는지 확인한다.', function() {
                grid.selection.disable = jasmine.createSpy('disable');
                cellPainter._onFocus({target: $input.get(0)});
                expect(grid.selection.disable).toHaveBeenCalled();
            });
        });

        describe('_isEdited, _restore 테스트', function() {
            var html,
                $input;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text'
                });
                $empty.html('<table><tr><td>' + html + '</td></tr></table>');
                $input = $empty.find('input');
                //_onFocus 를 호출함으로서 originalText 를 설정한다.
                cellPainter._onFocus({target: $input.get(0)});
            });
            it('focus 후 input 의 value 값에 변화가 있다면 isEdited 가 true 로 설정된다.', function() {
                expect(cellPainter._isEdited($input)).toEqual(false);
                $input.val('changed');
                expect(cellPainter._isEdited($input)).toEqual(true);
            });
            it('_restore 를 호출한 경우 값이 복원된다.', function() {
                $input.val('changed');
                cellPainter._restore($input);
                expect($input.val()).toEqual('text');
                expect(cellPainter._isEdited($input)).toEqual(false);
            });
        });

        describe('_onBlur', function() {
            var html,
                $input;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text'
                });
                $empty.html('<table><tr row="0"><td columnname="text">' + html + '</td></tr></table>');
                $input = $empty.find('input');
                cellPainter._onFocus({target: $input.get(0)});
            });

            it('grid.selection.enable 를 호출하는지 확인한다.', function() {
                grid.selection.enable = jasmine.createSpy('enable');
                cellPainter._onBlur({target: $input.get(0)});
                expect(grid.selection.enable).toHaveBeenCalled();
            });

            it('_isEdited === true 일 때 setValue 를 호출하는지 확인한다.', function() {
                grid.setValue = jasmine.createSpy('setValue');
                cellPainter._onBlur({target: $input.get(0)});

                expect(cellPainter._isEdited($input)).toEqual(false);
                expect(grid.setValue.calls.count()).toBe(0);

                $input.val('changed');
                cellPainter._onBlur({target: $input.get(0)});
                expect(cellPainter._isEdited($input)).toEqual(true);
                expect(grid.setValue.calls.count()).toBe(1);
            });
        });
    });

    describe('View.Painter.Cell.Text.Convertible 클래스 테스트', function() {
        beforeEach(function() {
            cellPainter = new View.Painter.Cell.Text.Convertible({
                grid: grid
            });
        });

        describe('getEditType', function() {
            it('text-convertible 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('text-convertible');
            });
        });

        describe('focusIn', function() {
            it('_startEdit 메서드가 호출되는지 확인한다.', function() {
                var $td = $('<td>');
                cellPainter._startEdit = jasmine.createSpy('focusClipboard');
                cellPainter.focusIn($td);
                expect(cellPainter._startEdit).toHaveBeenCalled();
            });
        });

        describe('focusOut', function() {
            it('_endEdit 메서드가 호출되는지 확인한다.', function() {
                grid.focusClipboard = jasmine.createSpy('focusClipboard');
                cellPainter.focusOut();
                expect(grid.focusClipboard).toHaveBeenCalled();
            });
        });
        describe('getContentHtml', function() {
            var html,
                $td,
                $input;

            beforeEach(function() {
                $empty.html('<table><tr row="0"><td columnname="text-convertible"></td></tr></table>');
                $td = $empty.find('td');
            });

            describe('편집중이지 않은 셀일 경우 value 만 반환한다.', function() {
                beforeEach(function() {
                    cellPainter.editingCell = {
                        rowKey: 0,
                        columnName: 'text-convertible'
                    };
                    html = cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'text-convertible',
                        isDisabled: true
                    });
                });
                it('value 만 반환하는지 확인한다.', function() {
                    expect(html).toEqual('text-convertible');
                });
            });

            describe('편집중일 경우 input text 마크업을 반환한다.', function() {
                beforeEach(function() {
                    cellPainter.editingCell = {
                        rowKey: '0',
                        columnName: 'text-convertible'
                    };
                    html = cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'text-convertible',
                        isDisabled: true
                    });
                    $td.html(html);
                    $input = $empty.find('input');
                });

                it('input 에 value 를 잘 설정한다.', function() {
                    expect($input.length).toEqual(1);
                    expect($input.val()).toEqual('text-convertible');
                });

                it('disabled 를 잘 설정한다.', function() {
                    expect($input.length).toEqual(1);
                    expect($input.prop('disabled')).toEqual(true);
                    html = cellPainter.getContentHtml({
                        rowKey: '0',
                        columnName: 'text-convertible',
                        isDisabled: false
                    });
                    $empty.html('<table><tr row="0"><td columnname="text-convertible">' + html + '</td></tr></table>');
                    $input = $empty.find('input');
                    $td = $empty.find('td');
                    grid.getElement = function() {return $td;};
                    expect($input.length).toEqual(1);
                    expect($input.prop('disabled')).toEqual(false);
                });
            });
        });

        describe('_startEdit', function() {
            var html,
                $td,
                $input;

            beforeEach(function() {
                $empty.html('<table><tr key="0"><td columnname="text-convertible"></td></tr></table>');
                $td = $empty.find('td');
                grid.getElement = function() {return $td; };
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text-convertible',
                    isDisabled: true
                });
                $td.html(html);
                $input = $empty.find('input');
            });

            afterEach(function() {
                cellPainter._endEdit($td);
            });

            it('input text 를 생성하는지 확인한다.', function() {
                expect($input.length).toBe(0);
                cellPainter._startEdit($td);
                $input = $empty.find('input');
                expect($input.length).toBe(1);
                expect($input.val()).toBe(html);
            });

            it('editingCell 값을 잘 설정하는지 확인한다.', function() {
                cellPainter._startEdit($td);
                expect(cellPainter.editingCell).toEqual({
                    rowKey: '0',
                    columnName: 'text-convertible'
                });
            });

            it('isEditable 이 false 일 때에는 input text 를 노출하지 않는다.', function() {
                grid.dataModel.get(0).set('isEditable', false);
                cellPainter._startEdit($td);
                $input = $empty.find('input');
                expect($input.length).toBe(0);
            });

            it('isDisabled 이 true 일 때에는 input text 를 노출하지 않는다.', function() {
                grid.dataModel.get(0).set('isDisabled', true);
                cellPainter._startEdit($td);
                $input = $empty.find('input');
                expect($input.length).toBe(0);
            });
        });

        describe('_endEdit', function() {
            var html,
                $td,
                $input;

            beforeEach(function() {
                $empty.html('<table><tr key="0"><td columnname="text-convertible"></td></tr></table>');
                $td = $empty.find('td');
                grid.getElement = function() {return $td; };
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text-convertible',
                    isDisabled: true
                });
                $td.html(html);
                //input text 를 생성한다.
                cellPainter._startEdit($td);
                $input = $empty.find('input');
            });

            it('input text 를 감추는지 확인한다.', function() {
                expect($input.length).toBe(1);
                cellPainter._endEdit($td);
                $input = $empty.find('input');
                expect($input.length).toBe(0);
                expect($td.html()).toBe(html);
            });

            it('isEdit 값을 false 로 설정하는지 확인한다.', function() {
                expect($input.length).toBe(1);
                cellPainter._endEdit($td);
                expect(cellPainter.editingCell).toEqual({
                    rowKey: null,
                    columnName: ''
                });
            });
        });

        describe('_onBlurConvertible', function() {
            var html,
                $input,
                $td;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text-convertible'
                });
                $empty.html('<table><tr row="0"><td columnname="text-convertible">' + html + '</td></tr></table>');
                $input = $empty.find('input');
                $td = $empty.find('td');
                cellPainter._onFocus({target: $input.get(0)});
            });

            it('grid.selection.enable 를 호출하는지 확인한다.', function() {
                grid.selection.enable = jasmine.createSpy('enable');
                cellPainter._onBlurConvertible({target: $input.get(0)});
                expect(grid.selection.enable).toHaveBeenCalled();
            });

            it('_endEdit 를 호출하는지 확인한다.', function() {
                cellPainter._endEdit = jasmine.createSpy('_endEdit');
                cellPainter._onBlurConvertible({target: $input.get(0)});
                expect(cellPainter._endEdit).toHaveBeenCalled();
            });
        });

        describe('_onClick', function() {
            var html,
                $input,
                $td;

            beforeEach(function() {
                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'text-convertible'
                });
                $empty.html('<table><tr key="0"><td columnname="text-convertible">' + html + '</td></tr></table>');
                $input = $empty.find('input');
                $td = $empty.find('td');
                cellPainter.attachHandler($td);
                cellPainter._startEdit = jasmine.createSpy('_startEdit');
                jasmine.clock().install();
            });

            afterEach(function() {
                cellPainter.detachHandler($td);
                jasmine.clock().uninstall();
            });

            it('800 ms 가 지난 후 click 이벤트가 발생하면 startEdit 를 호출하지 않는다.', function() {
                $td.trigger('click');
                expect(cellPainter.clicked).toEqual({
                    rowKey: '0',
                    columnName: 'text-convertible'
                });
                jasmine.clock().tick(900);
                $td.trigger('click');
                expect(cellPainter._startEdit).not.toHaveBeenCalled();
            });

            it('400 ms 가 지나기 전에 click 이벤트가 발생하면 startEdit 를 호출한다.', function() {
                $td.trigger('click');
                jasmine.clock().tick(100);
                $td.trigger('click');
                expect(cellPainter._startEdit).toHaveBeenCalled();
            });
        });

        describe('KeyDownSwitch', function() {
            var $target = $('<div>');
            it('정의된 키 액션은 true 를 반환하는지 확인한다.', function() {
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('UP_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('DOWN_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_UP', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_DOWN', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target))).toBe(true);
            });

            it('ENTER 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                cellPainter.focusOut = jasmine.createSpy('focusOut');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });

            it('ESC 입력시 focusOut, _restore 를 호출하는지 확인한다. ', function() {
                cellPainter.focusOut = jasmine.createSpy('focusOut');
                cellPainter._restore = jasmine.createSpy('_restore');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target));
                expect(cellPainter._restore).toHaveBeenCalled();
            });
        });
    });
});
