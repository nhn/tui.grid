'use strict';

var $ = require('jquery');

var ModelManager = require('model/manager');
var TextPainter = require('painter/cell/text');
var ConvertiblePainter = require('painter/cell/text-convertible');
var keyCodeMap = require('common/constMap').keyCode;

describe('view.painter.cell.text', function() {
    var grid, cellPainter;

    beforeEach(function() {
        grid = new ModelManager();
    });

    describe('View.Painter.Cell.Text 클래스 테스트', function() {
        var options;

        beforeEach(function() {
            grid.columnModel.set('columns', [{
                title: 'c1',
                columnName: 'c1',
                editOption: {
                    type: 'text'
                }
            }]);
            grid.dataModel.set([{
                c1: '0-1',
                c2: '0-2'
            }], {parse: true});

            options = {
                rowKey: 0,
                columnName: 'c1',
                value: '0-1'
            };

            cellPainter = new TextPainter({
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
                grid.focusModel.focusClipboard = jasmine.createSpy('focusClipboard');
                cellPainter.focusOut();
                expect(grid.focusModel.focusClipboard).toHaveBeenCalled();
            });
        });

        describe('getContentHtml', function() {
            var $input;

            it('value 값이 input 에 설정되는지 확인한다.', function() {
                $input = $(cellPainter.getContentHtml(options));

                expect($input.val()).toEqual('0-1');
                expect($input.prop('disabled')).toEqual(false);
            });

            it('disabled 가 설정되는지 확인한다..', function() {
                options.isDisabled = true;
                $input = $(cellPainter.getContentHtml(options));

                expect($input.prop('disabled')).toEqual(true);
            });
        });

        describe('setElementAttribute', function() {
            var $input, $td;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
                $td = $('<td />').append($input);
            });

            it('값을 정확히 설정하는지 확인한다.', function() {
                cellPainter.setElementAttribute({
                    value: 'changed',
                    changed: []
                }, $td);

                expect($input.val()).toBe('0-1');

                cellPainter.setElementAttribute({
                    value: 'changed',
                    changed: ['value']
                }, $td);
                expect($input.val()).toBe('changed');
            });

            it('isDisabled 를 설정하는지 확인한다.', function() {
                cellPainter.setElementAttribute({
                    isDisabled: true
                }, $td);
                expect($input.val()).toBe('0-1');
                expect($input.prop('disabled')).toBe(true);

                cellPainter.setElementAttribute({
                    isDisabled: false
                }, $td);
                expect($input.prop('disabled')).toBe(false);
            });
        });

        describe('_onFocus', function() {
            var $input;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
            });

            it('originalText 를 잘 설정하는지 확인한다.', function() {
                expect($input.val()).toEqual('0-1');
                expect(cellPainter.originalText).toEqual('');
                cellPainter._onFocus({target: $input.get(0)});
                expect($input.val()).toEqual('0-1');
                expect(cellPainter.originalText).toEqual('0-1');
            });

            it('grid 의 selection.end() 을 호출하는지 확인한다.', function() {
                grid.selectionModel.end = jasmine.createSpy('end');
                cellPainter._onFocus({target: $input.get(0)});
                expect(grid.selectionModel.end).toHaveBeenCalled();
            });
        });

        describe('_isEdited, _restore 테스트', function() {
            var $input;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
                // _onFocus 를 호출함으로서 originalText 를 설정한다.
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
                expect($input.val()).toEqual('0-1');
                expect(cellPainter._isEdited($input)).toEqual(false);
            });
        });

        describe('_onBlur', function() {
            var $table, $input;

            beforeEach(function() {
                $table = $('<table><tr data-row-key="0"><td columnname="c1"></td></tr></table>');
                $input = $(cellPainter.getContentHtml(options)).appendTo($table.find('td'));
                cellPainter._onFocus({target: $input.get(0)});
            });

            it('grid.selectionModel.enable 를 호출하는지 확인한다.', function() {
                grid.selectionModel.enable = jasmine.createSpy('enable');
                cellPainter._onBlur({target: $input.get(0)});
                expect(grid.selectionModel.enable).toHaveBeenCalled();
            });

            it('_isEdited === true 일 때 setValue 를 호출하는지 확인한다.', function() {
                grid.dataModel.setValue = jasmine.createSpy('setValue');
                cellPainter._onBlur({target: $input.get(0)});

                expect(cellPainter._isEdited($input)).toEqual(false);
                expect(grid.dataModel.setValue.calls.count()).toBe(0);

                $input.val('changed');
                cellPainter._onBlur({target: $input.get(0)});
                expect(cellPainter._isEdited($input)).toEqual(true);
                expect(grid.dataModel.setValue.calls.count()).toBe(1);
            });
        });
    });

    describe('View.Painter.Cell.Text.Convertible 클래스 테스트', function() {
        var options;

        beforeEach(function() {
            grid.columnModel.set('columns', [{
                title: 'c1',
                columnName: 'c1',
                editOption: {
                    type: 'text-convertible'
                }
            }]);
            grid.dataModel.set([{
                c1: '0-1'
            }], {parse: true});
            grid.renderModel.refresh();

            options = {
                rowKey: 0,
                columnName: 'c1',
                value: '0-1'
            };
            cellPainter = new ConvertiblePainter({
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
                grid.focusModel.focusClipboard = jasmine.createSpy('focusClipboard');
                cellPainter.focusOut();
                expect(grid.focusModel.focusClipboard).toHaveBeenCalled();
            });
        });

        describe('getContentHtml', function() {
            describe('편집중이지 않은 셀일 경우 value 만 반환한다.', function() {
                it('value 만 반환하는지 확인한다.', function() {
                    var html = cellPainter.getContentHtml(options);

                    expect(html).toEqual('0-1');
                });
            });

            describe('편집중일 경우 input을 포함한 마크업을 반환한다.', function() {
                var $content;

                beforeEach(function() {
                    cellPainter.editingCell = {
                        rowKey: '0',
                        columnName: 'c1'
                    };
                });

                it('input 에 value 를 잘 설정한다.', function() {
                    options.isDisabled = true;
                    $content = $(cellPainter.getContentHtml(options));

                    expect($content.find('input').val()).toEqual('0-1');
                });

                it('disabled 를 잘 설정한다.', function() {
                    options.isDisabled = false;
                    $content = $(cellPainter.getContentHtml(options));

                    expect($content.find('input').prop('disabled')).toBe(false);
                });
            });
        });

        describe('_startEdit', function() {
            var $table, $td, $input;

            beforeEach(function() {
                $table = $('<table><tr data-row-key="0"></tr></table>');
                $td = $('<td />').attr('columnname', 'c1');
                $table.find('tr').append($td);
            });

            afterEach(function() {
                cellPainter._endEdit($td);
            });

            it('input text 를 생성하는지 확인한다.', function() {
                cellPainter._startEdit($td);
                $input = $td.find('input');

                expect($input.length).toBe(1);
                expect($input.val()).toBe('0-1');
            });

            it('editingCell 값을 잘 설정하는지 확인한다.', function() {
                cellPainter._startEdit($td);
                expect(cellPainter.editingCell).toEqual({
                    rowKey: '0',
                    columnName: 'c1'
                });
            });

            it('isDisabled이 true 일 때에는 input text 를 노출하지 않는다.', function() {
                grid.dataModel.get('0').setRowState('DISABLED');
                cellPainter._startEdit($td);
                $input = $td.find('input');

                expect($input.length).toBe(0);
            });

            it('do nothing if dataModel.isDisabled is true', function() {
                grid.dataModel.isDisabled = true;
                cellPainter._startEdit($td);
                $input = $td.find('input');

                expect($input.length).toBe(0);
            });
        });

        describe('_endEdit', function() {
            var html, $table, $td, $input;

            beforeEach(function() {
                options.isDisabled = true;
                html = cellPainter.getContentHtml(options);
                $table = $('<table><tr data-row-key="0"><td></td></tr></table>');
                $td = $table.find('td').html(html).attr('columnname', 'c1');

                cellPainter._startEdit($td);
                $input = $td.find('input');
            });

            it('input text 를 감추는지 확인한다.', function() {
                expect($input.length).toBe(1);
                cellPainter._endEdit($td);

                $input = $td.find('input');
                expect($input.length).toBe(0);
                expect($td.html()).toBe(html);
            });

            it('isEdit 값을 false 로 설정하는지 확인한다.', function() {
                expect($input.length).toBe(1);
                cellPainter._endEdit($td);
                expect(cellPainter.editingCell).toEqual({
                    rowKey: null,
                    columnName: null
                });
            });
        });

        describe('_endEditingCell', function() {
            var $table, $td;

            beforeEach(function() {
                var $wrapper = setFixtures('<div />');
                options.isDisabled = true;
                $table = $('<table><tr data-row-key="0"><td></td></tr></table>');
                $td = $table.find('td').attr('columnname', 'c1');
                $wrapper.append($table);
                cellPainter._startEdit($td);
            });

            it('Emit blur event on editing cell if exist', function() {

            });
        });

        describe('_onBlurConvertible', function() {
            var $table, $input;

            beforeEach(function() {
                $table = $('<table><tr data-row-key="0"><td columnname="c1"></td></tr></table>');
                $input = $(cellPainter.getContentHtml(options)).appendTo($table.find('td'));
                cellPainter._onFocus({target: $input.get(0)});
                jasmine.clock().install();
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it('grid.selection.enable 를 호출하는지 확인한다.', function() {
                spyOn(grid.selectionModel, 'enable');
                cellPainter._onBlurConvertible({target: $table.find('td')});
                expect(grid.selectionModel.enable).toHaveBeenCalled();
            });

            it('_endEdit 를 호출하는지 확인한다.', function() {
                cellPainter._endEdit = jasmine.createSpy('_endEdit');
                cellPainter._onBlurConvertible({target: $table.find('td')});
                expect(cellPainter._endEdit).toHaveBeenCalled();
            });

            it('_focusModel.refreshState를 호출한다', function() {
                grid.focusModel.refreshState = jasmine.createSpy('refreshState');
                cellPainter._onBlurConvertible({target: $table.find('td')});
                jasmine.clock().tick(1);
                expect(grid.focusModel.refreshState).toHaveBeenCalled();
            });
        });

        describe('KeyDownSwitch', function() {
            var $target = $('<div>');

            function getKeyEvent(keyName, $eventTarget) {
                return {
                    keyCode: keyCodeMap[keyName],
                    which: keyCodeMap[keyName],
                    target: $eventTarget.get(0)
                };
            }

            it('정의된 키 액션은 true 를 반환하는지 확인한다.', function() {
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('UP_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('DOWN_ARROW', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_UP', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('PAGE_DOWN', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target))).toBe(true);
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target))).toBe(true);
            });

            it('ENTER 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                spyOn(cellPainter, 'focusOut');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER', $target));
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });

            it('ESC 입력시 focusOut, _restore 를 호출하는지 확인한다. ', function() {
                spyOn(cellPainter, 'focusOut');
                spyOn(cellPainter, '_restore');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ESC', $target));
                expect(cellPainter._restore).toHaveBeenCalled();
            });
        });
    });
});
