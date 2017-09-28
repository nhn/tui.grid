'use strict';

var $ = require('jquery');

var ModelManager = require('model/manager');
var ButtonPainter = require('painter/cell/button');
var SelectPainter = require('painter/cell/select');
var ListPainter = require('painter/cell/list');

describe('view.painter.cell.base', function() {
    var grid, cellPainter;

    function getKeyEvent(keyName, $target) {
        return {
            keyCode: grid.keyMap[keyName],
            which: grid.keyMap[keyName],
            target: $target.get(0)
        };
    }

    beforeEach(function() {
        grid = grid = new ModelManager();
    });

    describe('Cell.List Base 클래스 테스트', function() {
        beforeEach(function() {
            grid.columnModel.set('columns', [{
                title: 'c1',
                columnName: 'c1',
                editOptions: {
                    type: 'checkbox',
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }]
                }
            }]);
            cellPainter = new ListPainter({
                grid: grid
            });
        });

        describe('getOptionList()', function() {
            it('cellData에 optionList가 존재한다면 cellData의 optionList를 반환한다.', function() {
                var cellData, optionList;

                cellData = {
                    optionList: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }]
                };
                optionList = cellPainter.getOptionList(cellData);

                expect(optionList).toEqual(optionList);
            });

            it('cellData에 optionList가 존재하지 않는다면 columnModel의 optionList를 반환한다.', function() {
                var cellData, optionList;

                cellData = {
                    columnName: 'c1',
                    rowKey: 0,
                    optionsList: []
                };
                optionList = cellPainter.getOptionList(cellData);

                expect(optionList).toEqual(grid.columnModel.getColumnModel('c1').editOptions.listItems);
            });
        });
    });

    describe('View.Painter.Cell.List.Select 클래스 테스트', function() {
        var $select, options;

        beforeEach(function() {
            options = {
                columnName: 'c1',
                optionList: [{
                    text: 'text0',
                    value: 0
                }, {
                    text: 'text1',
                    value: 1
                }, {
                    text: 'text2',
                    value: 2
                }]
            };
            grid.columnModel.set('columns', [options]);
            cellPainter = new SelectPainter({
                grid: grid
            });
        });

        describe('getEditType', function() {
            it('select 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('select');
            });
        });

        describe('getContentHtml', function() {
            it('optionList 의 length 만큼 select 의 option 을 생성하는지 확인한다.', function() {
                $select = $(cellPainter.getContentHtml(options));

                expect($select.find('option').length).toEqual(3);
            });

            it('cellData 의 value 에 해당하는 option 이 selected 되었는지 확인한다.', function() {
                options.value = 1;
                $select = $(cellPainter.getContentHtml(options));

                expect($select.val()).toBe('1');
            });

            it('isDisabled 옵션이 존재할 때, disable 어트리뷰트를 잘 설정하는지 확인한다.', function() {
                options.isDisabled = true;
                $select = $(cellPainter.getContentHtml(options));

                expect($select.prop('disabled')).toBe(true);
            });
        });

        describe('setElementAttribute', function() {
            var $table, $td;

            beforeEach(function() {
                $select = $(cellPainter.getContentHtml(options));
                $table = $('<table><tr data-row-key="0"><td></td></tr></table>');
                $td = $table.find('td').attr('columnname', 'c1').append($select);
            });

            it('값을 정확히 설정하는지 확인한다.', function() {
                cellPainter.setElementAttribute({value: 1}, $td, true);
                expect($select.val()).toEqual('1');
            });
        });

        describe('_onChange', function() {
            beforeEach(function() {
                var $table;

                options.value = 0;
                $select = $(cellPainter.getContentHtml(options));
                $table = $('<table><tr data-row-key="0"><td></td></tr></table>');
                $table.find('td').attr('columnname', 'c1').append($select);
            });

            it('grid 의 setValue 를 호출하는지 확인한다.', function() {
                var changeEvent = {
                    target: $select.get(0)
                };
                grid.dataModel.setValue = jasmine.createSpy('setValue');
                cellPainter._onChange(changeEvent);

                expect(grid.dataModel.setValue).toHaveBeenCalledWith('0', 'c1', '0');
            });
        });

        describe('KeyDownSwitch', function() {
            var $target = $('<div>');

            beforeEach(function() {
                grid.keyMap = {
                    'ENTER': 13,
                    'ESC': 27
                };
                grid.keyName = {
                    13: 'ENTER',
                    27: 'ESC'
                };
                cellPainter.focusOut = jasmine.createSpy('focusOut');
            });

            it('ESC 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });

            it('ENTER 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });
        });
    });

    describe('View.Painter.Cell.List.Button 클래스 테스트', function() {
        var cellData, $table, $td;

        beforeEach(function() {
            grid.columnModel.set('columns', [{
                title: 'c1',
                columnName: 'c1',
                editOptions: {
                    type: 'checkbox',
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }]
                }
            }, {
                title: 'c2',
                columnName: 'c2',
                editOptions: {
                    type: 'radio',
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }]
                }
            }]);

            cellData = {
                optionList: [{
                    text: 'text1',
                    value: 1
                }, {
                    text: 'text2',
                    value: 2
                }]
            };

            cellPainter = new ButtonPainter({
                grid: grid
            });

            $table = jasmine.getFixtures().set('<table><tr data-row-key="0"><td></td></tr></table>');
            $td = $table.find('td');
        });

        describe('getEditType', function() {
            it('button 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('button');
            });
        });

        describe('getContentHtml', function() {
            describe('마크업 문자열을 적절히 반환하는지 확인한다.', function() {
                var $input;

                it('optionList의 length 만큼 checkbox 를 생성하는지 확인한다.', function() {
                    cellData.columnName = 'c1';
                    $input = $(cellPainter.getContentHtml(cellData));
                    expect($input.filter('[type=checkbox]').length).toEqual(2);
                });

                it('optionList 의 length 만큼 radio 를 생성하는지 확인한다.', function() {
                    cellData.columnName = 'c2';
                    $input = $(cellPainter.getContentHtml(cellData));
                    expect($input.filter('[type=radio]').length).toEqual(2);
                });

                describe('cellData의 value에 해당하는 option이 selected 되었는지 확인한다.', function() {
                    it('checkbox일 때 여러개 선택 가능한지 확인한다.', function() {
                        cellData.columnName = 'c1';
                        cellData.value = '1,2';
                        $input = $(cellPainter.getContentHtml(cellData)).filter('input');
                        expect($input.filter(':checked').length).toBe(2);
                    });

                    it('radio 일 때 값이 설정되는지 확인한다.', function() {
                        cellData.columnName = 'c2';
                        cellData.value = '1';
                        $input = $(cellPainter.getContentHtml(cellData)).filter('input');
                        expect($input.filter(':checked').val()).toBe('1');
                    });
                });

                it('isDisabled 옵션이 존재할 때, disable 어트리뷰트를 잘 설정하는지 확인한다.', function() {
                    cellData.columnName = 'c1';
                    cellData.isDisabled = true;
                    $input = $(cellPainter.getContentHtml(cellData)).filter('input');

                    expect($input.eq(0).prop('disabled')).toBe(true);
                    expect($input.eq(1).prop('disabled')).toBe(true);
                });
            });
        });

        describe('setElementAttribute', function() {
            var $checked;

            it('checkbox 일 때 값을 정확히 설정하는지 확인한다.', function() {
                cellData.columnName = 'c1';
                cellData.value = 0;
                $td.html(cellPainter.getContentHtml(cellData)).attr('columnname', 'c1');

                cellPainter.setElementAttribute({value: '1,2'}, $td, true);
                $checked = $td.find(':checked');
                expect($checked.length).toBe(2);
                expect($checked.eq(0).val()).toBe('1');
                expect($checked.eq(1).val()).toBe('2');
            });

            it('radio 일 때 값을 정확히 설정하는지 확인한다.', function() {
                $td.attr('columnname', 'c2');
                cellData.columnName = 'c2';
                cellData.value = 0;
                $td.html(cellPainter.getContentHtml(cellData)).attr('columnname', 'c2');

                cellPainter.setElementAttribute({value: '1'}, $td, true);
                $checked = $td.find(':checked');
                expect($checked.length).toBe(1);
                expect($checked.eq(0).val()).toBe('1');
            });
        });

        describe('_onChange', function() {
            var $button, changeEvent;

            beforeEach(function() {
                changeEvent = {};
                grid.dataModel.setValue = jasmine.createSpy('setValue');
            });

            it('checkbox 일때 grid 의 setValue 메서드를 정확한 값으로 호출하는지 확인한다.', function() {
                cellData.columnName = 'c1';
                cellData.value = 1;
                $td.html(cellPainter.getContentHtml(cellData)).attr('columnname', 'c1');
                $button = $td.find('input:first');
                changeEvent.target = $button.get(0);

                cellPainter._onChange(changeEvent);

                expect(grid.dataModel.setValue).toHaveBeenCalledWith('0', 'c1', '1');
            });

            it('radio 일때 grid 의 setValue 메서드를 정확한 값으로 호출하는지 확인한다.', function() {
                cellData.columnName = 'c2';
                cellData.value = 1;
                $td.html(cellPainter.getContentHtml(cellData)).attr('columnname', 'c2');
                $button = $td.find('input:first');
                changeEvent.target = $button.get(0);

                cellPainter._onChange(changeEvent);

                expect(grid.dataModel.setValue).toHaveBeenCalledWith('0', 'c2', '1');
            });
        });

        describe('_focusNextInput, _focusPrevInput', function() {
            var $input;

            beforeEach(function() {
                cellData.columnName = 'c2';
                cellData.value = 1;
                $td.attr('columnname', 'c2').html(cellPainter.getContentHtml(cellData));
                $input = $td.find('input');
            });

            describe('_focusNextInput()', function() {
                it('다음 input 이 존재한다면 다음 input 에 focus 하고 true 를 반환한다.', function() {
                    expect(cellPainter._focusNextInput($input.eq(0))).toBe(true);
                });

                it('다음 input 이 존재하지 않는다면 false 를 반환한다.', function() {
                    expect(cellPainter._focusNextInput($input.eq(1))).toBe(false);
                });
            });

            describe('_focusPrevInput()', function() {
                it('이전 input 이 존재한다면 이전 input 에 focus 하고 true 를 반환한다.', function() {
                    expect(cellPainter._focusPrevInput($input.eq(1))).toBe(true);
                });
                it('이전 input 이 존재하지 않는다면 false 를 반환한다.', function() {
                    expect(cellPainter._focusPrevInput($input.eq(0))).toBe(false);
                });
            });
        });

        describe('_getCheckedValueList', function() {
            it('check 된 값들의 리스트를 반환하는지 확인한다.', function() {
                cellData.columnName = 'c1';
                cellData.value = '1,2';
                $td.attr('columnname', 'c1').html(cellPainter.getContentHtml(cellData));

                expect(cellPainter._getCheckedValueList($td)).toContain('1');
                expect(cellPainter._getCheckedValueList($td)).toContain('2');
            });
        });

        describe('KeyDownSwitch', function() {
            var $input, $target;

            beforeEach(function() {
                grid.focusClipboard = function() {};
                grid.keyMap = {
                    'TAB': 9,
                    'ENTER': 13,
                    'ESC': 27,
                    'LEFT_ARROW': 37,
                    'UP_ARROW': 38,
                    'RIGHT_ARROW': 39,
                    'DOWN_ARROW': 40,
                    'PAGE_UP': 33,
                    'PAGE_DOWN': 34
                };
                grid.keyName = {
                    9: 'TAB',
                    13: 'ENTER',
                    27: 'ESC',
                    37: 'LEFT_ARROW',
                    38: 'UP_ARROW',
                    39: 'RIGHT_ARROW',
                    40: 'DOWN_ARROW',
                    33: 'PAGE_UP',
                    34: 'PAGE_DOWN'
                };

                cellData.columnName = 'c1';
                $td.attr('columnname', 'c1').html(cellPainter.getContentHtml(cellData));
                $input = $td.find('input');
                $target = $input.eq(0);

                grid.dataModel.reset([{
                    c1: '1',
                    c2: '2'
                }], {
                    parse: true
                });
            });

            it('정의된 키 액션은 true 를 반환하는지 확인한다.', function() {
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('UP_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('DOWN_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_UP', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_DOWN', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('LEFT_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('RIGHT_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('TAB', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('F5', $target))).toBe(false);
            });

            it('ENTER 입력시 input 에 click 이벤트를 발생하는지 확인한다. ', function() {
                expect($target.prop('checked')).toBe(false);
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target));
                expect($target.prop('checked')).toBe(true);
            });

            it('LEFT_ARROW 입력시 _focusPrevInput 을 호출하는지 확인한다.', function() {
                cellPainter._focusPrevInput = jasmine.createSpy('_focusPrevInput');
                cellPainter._executeKeyDownSwitch(getKeyEvent('LEFT_ARROW', $target));
                expect(cellPainter._focusPrevInput).toHaveBeenCalled();
            });

            it('RIGHT_ARROW 입력시 _focusNextInput 을 호출하는지 확인한다. ', function() {
                cellPainter._focusNextInput = jasmine.createSpy('_focusNextInput');
                cellPainter._executeKeyDownSwitch(getKeyEvent('RIGHT_ARROW', $target));
                expect(cellPainter._focusNextInput).toHaveBeenCalled();
            });

            it('ESC 입력시 focusOut 을 호출하는지 확인한다.', function() {
                cellPainter.focusOut = jasmine.createSpy('focusOut');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });

            describe('TAB', function() {
                beforeEach(function() {
                    grid.focusModel.focusIn = jasmine.createSpy('focusIn');
                    grid.focusModel.focus(0, 'c1');
                });

                it('입력시 _focusNextInput의 결과값이 false 이면 grid.focusIn을 다음 columnName 파라미터와 함께 호출하는지 확인한다.', function() {
                    cellPainter._focusNextInput = function() {
                        return false;
                    };
                    cellPainter._executeKeyDownSwitch(getKeyEvent('TAB', $target));
                    expect(grid.focusModel.focusIn).toHaveBeenCalledWith(0, 'c2', true);
                });

                it('shift와 함께 입력시 _focusPrevInput의 결과값이 false 이면 grid.focusIn을 이전 columnName 파라미터와 함께 호출하는지 확인한다.', function() {
                    var keyEvent = getKeyEvent('TAB', $target);
                    cellPainter._focusPrevInput = function() {
                        return false;
                    };
                    keyEvent.shiftKey = true;

                    grid.focusModel.focus(0, 'c2');
                    cellPainter._executeKeyDownSwitch(keyEvent);
                    expect(grid.focusModel.focusIn).toHaveBeenCalledWith(0, 'c1', true);
                });
            });
        });
    });
});
