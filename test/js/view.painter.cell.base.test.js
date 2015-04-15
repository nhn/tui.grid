describe('view.painter.cell.base', function() {
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1'
        },
        {
            title: 'columnName2',
            columnName: 'columnName2',
            editOption: {
                type: 'text'
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
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        },{
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
            focusIn: function(){},
            focusClipboard: function(){},
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
        cellPainter = new View.Base.Painter.Cell({
            grid: grid
        });
    });
    describe('_getClassNameList()', function() {
        var classNameList;
        beforeEach(function() {
            grid.focusModel.focus(0, 'columnName1');
        });
        it('select 된 row 는 selected 클래스 반환한다.', function() {
            classNameList = cellPainter._getClassNameList({
                columnName: 'columnName2',
                rowKey: 0,
                className: '',
                isEditable: false,
                isDisabled: false
            });
            expect(classNameList.length).toBe(1);
            expect(classNameList).toContain('selected');
        });
        it('focus 된 row 는 selected, focused 클래스 반환한다.', function() {
            classNameList = cellPainter._getClassNameList({
                columnName: 'columnName1',
                rowKey: 0,
                className: '',
                isEditable: false,
                isDisabled: false
            });
            expect(classNameList.length).toBe(2);
            expect(classNameList).toContain('selected');
            expect(classNameList).toContain('focused');
        });
        it('isEditable 이 true 라면 editable 클래스를 포함한다.', function() {
            classNameList = cellPainter._getClassNameList({
                columnName: 'columnName1',
                rowKey: 0,
                className: '',
                isEditable: true,
                isDisabled: false
            });
            expect(classNameList.length).toBe(3);
            expect(classNameList).toContain('selected');
            expect(classNameList).toContain('focused');
            expect(classNameList).toContain('editable');
        });
        it('isDisabled 가 true 라면 disabled 클래스를 포함한다.', function() {
            classNameList = cellPainter._getClassNameList({
                columnName: 'columnName1',
                rowKey: 0,
                className: '',
                isEditable: true,
                isDisabled: true
            });
            expect(classNameList.length).toBe(4);
            expect(classNameList).toContain('selected');
            expect(classNameList).toContain('focused');
            expect(classNameList).toContain('editable');
            expect(classNameList).toContain('disabled');
        });
        it('정의된 className 이 있다면, 해당 className 을 포함하여 반환한다.', function() {
            classNameList = cellPainter._getClassNameList({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: true
            });
            expect(classNameList.length).toBe(5);
            expect(classNameList).toContain('selected');
            expect(classNameList).toContain('focused');
            expect(classNameList).toContain('editable');
            expect(classNameList).toContain('disabled');
            expect(classNameList).toContain('rowClass');
        });

    });
    describe('getHtml()', function() {
        it('html 마크업을 잘 생성하는지 확인한다.', function() {
            var html;
            html = cellPainter.getHtml({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: true
            });
            expect(html).toEqual('<td columnName="columnName1"  class="selected focused rowClass editable disabled"  align="left" edit-type="normal"></td>');

            html = cellPainter.getHtml({
                columnName: 'columnName2',
                rowKey: 1,
                className: 'rowClass',
                isEditable: false,
                isDisabled: false
            });
            expect(html).toEqual('<td columnName="columnName2"  class="rowClass"  align="left" edit-type="normal"></td>');
        });
    });
    describe('redraw()', function() {
        it('생성한 html 마크업 실제 랜더링한 뒤 isDisabled 값을 false 로 변경후 redraw를 호출하여 잘 갱신하는지 확인한다.', function() {
            var html,
                $td;
            html = cellPainter.getHtml({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: true
            });
            $empty.html(html);
            $td = $empty.find('td');

            cellPainter.redraw({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: false
            }, $td);
            expect($td.hasClass('editable')).toBe(true);
            expect($td.hasClass('disabled')).toBe(false);
        });
    });
    describe('_getCellData, getRowKey, getColumnName, _getCellAddress 확인', function() {
        var html,
            $td;
        beforeEach(function() {
            //tr 은 Row Painter 에서 생성해주기 때문에 해당 test case 에서는 문자열로 넣어준다.
            html = '<table><tr key="0">';
            html += cellPainter.getHtml({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: true
            });
            html += cellPainter.getHtml({
                columnName: 'columnName2',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: false
            });
            html += '</tr></table>';
            $empty.html(html);


        });
        it('getRowKey 의 동작을 확인한다.', function() {
            $td = $empty.find('td:first');
            expect(cellPainter.getRowKey($td)).toBe('0');
            $td = $empty.find('td:last');
            expect(cellPainter.getRowKey($td)).toBe('0');
        });
        it('getColumnName 의 동작을 확인한다.', function() {
            $td = $empty.find('td:first');
            expect(cellPainter.getColumnName($td)).toBe('columnName1');
            $td = $empty.find('td:last');
            expect(cellPainter.getColumnName($td)).toBe('columnName2');
        });
        it('_getCellAddress 의 동작을 확인한다.', function() {
            $td = $empty.find('td:first');
            expect(cellPainter._getCellAddress($td)).toEqual({
                rowKey: '0',
                columnName: 'columnName1'
            });
            $td = $empty.find('td:last');
            expect(cellPainter._getCellAddress($td)).toEqual({
                rowKey: '0',
                columnName: 'columnName2'
            });
        });
        it('_getCellData 의 동작을 확인한다.', function() {
            var cellData;
            $td = $empty.find('td:first');
            cellData = cellPainter._getCellData($td);
            expect(cellData.value).toEqual('normal');
            expect(cellData.rowKey).toEqual(0);
            expect(cellData.columnName).toEqual('columnName1');

            $td = $empty.find('td:last');
            cellData = cellPainter._getCellData($td);
            expect(cellData.value).toEqual('text');
            expect(cellData.rowKey).toEqual(0);
            expect(cellData.columnName).toEqual('columnName2');
        });
    });
    describe('_getParamForKeyDownSwitch()', function() {
        it('keyEvent 처리에 필요한 파라미터를 반환하는지 확인한다.', function() {
            var keyDownEvent,
                param;

            keyDownEvent = {
                keyCode: grid.keyMap['LEFT_ARROW'],
                which: grid.keyMap['LEFT_ARROW'],
                target: '<div>'
            };
            grid.focusModel.focus(0, 'columnName1');
            param = cellPainter._getParamForKeyDownSwitch(keyDownEvent);
            expect(param.keyDownEvent).toEqual(keyDownEvent);
            expect(param.$target.is('div')).toBe(true);
            expect(param.focusModel).toEqual(grid.focusModel);
            expect(param.rowKey).toEqual(0);
            expect(param.columnName).toEqual('columnName1');
            expect(param.keyName).toEqual('LEFT_ARROW');
        });
    });

    describe('setKeyDownSwitch()', function() {
        it('이미 존재하는 keyDownSwitch 에 함수를 override 한다.', function() {
            var newFunction = function() {};
            expect(cellPainter['_keyDownSwitch']['ENTER']).toBeDefined();
            expect(cellPainter['_keyDownSwitch']['ENTER']).not.toEqual(newFunction);
            cellPainter.setKeyDownSwitch('ENTER', newFunction);
            expect(cellPainter['_keyDownSwitch']['ENTER']).toEqual(newFunction);
        });
        it('존재하지 않는 keyDownSwitch 를 추가한다.', function() {
            var newFunction = function() {};
            expect(cellPainter['_keyDownSwitch']['F5']).not.toBeDefined();
            cellPainter.setKeyDownSwitch('F5', newFunction);
            expect(cellPainter['_keyDownSwitch']['F5']).toEqual(newFunction);
        });
        it('첫번째 인자에 Object 형태로 추가한다..', function() {
            var switchObject = {
                'ESC': function() {},
                'F1': function() {},
                'F2': function() {},
                'F3': function() {}
            };
            expect(cellPainter['_keyDownSwitch']['TAB']).toBeDefined();
            cellPainter.setKeyDownSwitch(switchObject);
            expect(cellPainter['_keyDownSwitch']['ESC']).toEqual(switchObject['ESC']);
            expect(cellPainter['_keyDownSwitch']['F1']).toEqual(switchObject['F1']);
            expect(cellPainter['_keyDownSwitch']['F2']).toEqual(switchObject['F2']);
            expect(cellPainter['_keyDownSwitch']['F3']).toEqual(switchObject['F3']);
            expect(cellPainter['_keyDownSwitch']['TAB']).toBeDefined();
        });
    });

    describe('_executeKeyDownSwitch()', function() {
        it('정의되어 있는 keyDownSwitch 를 수행한다.', function() {
            var callback = jasmine.createSpy('callback'),
                keyDownEvent = {
                    keyCode: grid.keyMap['F5'],
                    which: grid.keyMap['F5'],
                    target: '<div>'
                },
                result;
            cellPainter.setKeyDownSwitch('F5', callback);
            result = cellPainter._executeKeyDownSwitch(keyDownEvent);

            expect(callback).toHaveBeenCalled();
            expect(result).toBe(true);
        });
        it('정의되어있지 않은 keyDownSwitch 를 수행할 경우 defaultAction 을 호출한다.', function() {
            var callback = jasmine.createSpy('callback'),
                keyDownEvent = {
                    keyCode: grid.keyMap['BACKSPACE'],
                    which: grid.keyMap['BACKSPACE'],
                    target: '<div>'
                },
                result;
            expect(cellPainter['_keyDownSwitch']['BACKSPACE']).not.toBeDefined();
            cellPainter.setKeyDownSwitch('defaultAction', callback);
            result = cellPainter._executeKeyDownSwitch(keyDownEvent);
            expect(callback).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
    describe('_onKeyDown', function() {
        var callback,
            keyDownEvent;
        beforeEach(function() {
            callback = jasmine.createSpy('callback');
            keyDownEvent = {
                keyCode: grid.keyMap['F5'],
                which: grid.keyMap['F5'],
                target: '<div>',
                preventDefault: jasmine.createSpy('callback')
            };
        });
        it('정의된 keyDownSwitch 를 수행한다면 keyDownEvent.preventDefault() 를 호출한다.', function() {
            keyDownEvent.keyCode = keyDownEvent.which =grid.keyMap['TAB'];
            expect(cellPainter['_keyDownSwitch']['TAB']).toBeDefined();
            cellPainter.setKeyDownSwitch('TAB', callback);
            cellPainter._executeKeyDownSwitch(keyDownEvent);
            expect(callback).toHaveBeenCalled();
        });
        it('정의되지 않은 keyDownSwitch 를 수행한다면 keyDownEvent.preventDefault() 를 호출하지 않는다.', function() {
            delete cellPainter['_keyDownSwitch']['F5'];
            expect(cellPainter['_keyDownSwitch']['F5']).not.toBeDefined();
            cellPainter.setKeyDownSwitch('F5', callback);
            cellPainter._executeKeyDownSwitch(keyDownEvent);
            expect(callback).toHaveBeenCalled();
        });
    });
    describe('focusOut()', function() {
       it('this.grid.focusClipboard 를 수행하는지 확인한다.', function() {
           grid.focusClipboard = jasmine.createSpy('focusClipboard');
           cellPainter.focusOut();
           expect(grid.focusClipboard).toHaveBeenCalled();
       });
    });
    describe('onModelChange()', function() {
        var html,
            $tr;

        beforeEach(function() {
            cellPainter.redraw = jasmine.createSpy('redraw');
            cellPainter.setElementAttribute = jasmine.createSpy('setElementAttribute');
            //tr 은 Row Painter 에서 생성해주기 때문에 해당 test case 에서는 문자열로 넣어준다.
            html = '<table><tr key="0">';
            html += cellPainter.getHtml({
                columnName: 'columnName1',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: true
            });
            html += cellPainter.getHtml({
                columnName: 'columnName2',
                rowKey: 0,
                className: 'rowClass',
                isEditable: true,
                isDisabled: false
            });
            html += '</tr></table>';
            $empty.html(html);
            $tr = $empty.find('tr');
        });
        describe('redrawAttributes 에 해당하는 값이 변경된 경우', function() {
            it('redraw 가 호출되었는지 확인한다.', function() {
                var cellData = {
                    columnName: 'columnName1',
                    rowKey: 0,
                    changed: ['isEditable']
                };
                cellPainter.onModelChange(cellData, $tr);
                expect(cellPainter.redraw).toHaveBeenCalled();
                expect(cellPainter.setElementAttribute).not.toHaveBeenCalled();
            });
        });
        describe('redrawAttributes 에 해당하지 않는 값이 변경된 경우', function() {
            it('setElementAttribute 를 호출하였는지 확인한다.', function() {
                var cellData = {
                    columnName: 'columnName1',
                    rowKey: 0,
                    changed: ['className']
                };
                cellPainter.onModelChange(cellData, $tr);
                expect(cellPainter.redraw).not.toHaveBeenCalled();
                expect(cellPainter.setElementAttribute).toHaveBeenCalled();
            });
        });
    });
});