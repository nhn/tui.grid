'use strict';

describe('view.painter.cell.text', function() {
    var grid, cellPainter;

    function createGridMock() {
        var mock = {
            options: {
                toolbar: {}
            },
            option: function(name) {
                return this.options[name];
            },
            focusIn: function() {},
            selection: {},
            updateLayoutData: function() {},
            dataModel: new Collection.Base(),
            columnModel: new Data.ColumnModel()
        };
        mock.dimensionModel = new Model.Dimension({
            grid: mock
        });
        mock.renderModel = new Model.Renderer({
            grid: mock
        });
        mock.focusModel = new Model.Focus({
            grid: mock
        });
        mock.selection = new View.Selection({
            grid: mock
        });
        mock.dataModel = new Data.RowList([], {
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
    });

    afterEach(function() {
        cellPainter.destroy();
    });

    describe('View.Painter.Cell.Text 클래스 테스트', function() {
        var options;

        beforeEach(function() {
            grid.columnModel.set('columnModelList', [{
                title: 'c1',
                columnName: 'c1',
                editOption: {
                    type: 'text'
                }
            }]);
            grid.dataModel.set([{
                c1: '0-1'
            }], {parse: true});

            options = {
                rowKey: 0,
                columnName: 'c1'
            };

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

            it('grid 의 selection.disable() 을 호출하는지 확인한다.', function() {
                grid.selection.disable = jasmine.createSpy('disable');
                cellPainter._onFocus({target: $input.get(0)});
                expect(grid.selection.disable).toHaveBeenCalled();
            });
        });

        describe('_isEdited, _restore 테스트', function() {
            var $input;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
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
                expect($input.val()).toEqual('0-1');
                expect(cellPainter._isEdited($input)).toEqual(false);
            });
        });

        describe('_onBlur', function() {
            var $input;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
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
        var options;

        beforeEach(function() {
            grid.columnModel.set('columnModelList', [{
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
                columnName: 'c1'
            };
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
            var html, $table, $td, $input;

            beforeEach(function() {
                options.isDisabled = true;
                html = cellPainter.getContentHtml(options);
                $table = $('<table><tr key="0"><td></td></tr></table>');
                $td = $table.find('td').html(html).attr('columnname', 'c1');
            });

            afterEach(function() {
                cellPainter._endEdit($td);
            });

            it('input text 를 생성하는지 확인한다.', function() {
                cellPainter._startEdit($td);
                $input = $td.find('input');

                expect($input.length).toBe(1);
                expect($input.val()).toBe(html);
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
        });

        describe('_endEdit', function() {
            var html, $table, $td, $input;

            beforeEach(function() {
                options.isDisabled = true;
                html = cellPainter.getContentHtml(options);
                $table = $('<table><tr key="0"><td></td></tr></table>');
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
                    columnName: ''
                });
            });
        });

        describe('_onBlurConvertible', function() {
            var $input;

            beforeEach(function() {
                $input = $(cellPainter.getContentHtml(options));
                cellPainter._onFocus({target: $input.get(0)});
            });

            it('grid.selection.enable 를 호출하는지 확인한다.', function() {
                spyOn(grid.selection, 'enable');
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
            var $td, clickEvent;

            beforeEach(function() {
                var $table;

                $table = $('<table><tr key="0"><td></td></tr></table>');
                $td = $table.find('td').attr('columnname', 'c1');
                $td.html(cellPainter.getContentHtml(options));
                clickEvent = {
                    target: $td[0]
                };
                cellPainter._startEdit = jasmine.createSpy('_startEdit');
                jasmine.clock().install();
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it('800 ms 가 지난 후 click 이벤트가 발생하면 startEdit 를 호출하지 않는다.', function() {
                cellPainter._onClick(clickEvent);
                expect(cellPainter.clicked).toEqual({
                    rowKey: '0',
                    columnName: 'c1'
                });
                jasmine.clock().tick(900);
                cellPainter._onClick(clickEvent);
                expect(cellPainter._startEdit).not.toHaveBeenCalled();
            });

            it('400 ms 가 지나기 전에 click 이벤트가 발생하면 startEdit 를 호출한다.', function() {
                cellPainter._onClick(clickEvent);
                jasmine.clock().tick(100);
                cellPainter._onClick(clickEvent);
                expect(cellPainter._startEdit).toHaveBeenCalled();
            });
        });

        describe('KeyDownSwitch', function() {
            var $target = $('<div>');

            function getKeyEvent(keyName, $eventTarget) {
                return {
                    keyCode: grid.keyMap[keyName],
                    which: grid.keyMap[keyName],
                    target: $eventTarget.get(0)
                };
            }

            beforeEach(function() {
                grid.focusClipboard = function() {};
                grid.keyMap = {
                    'ENTER': 13,
                    'ESC': 27,
                    'UP_ARROW': 38,
                    'DOWN_ARROW': 40,
                    'PAGE_UP': 33,
                    'PAGE_DOWN': 34
                };
                grid.keyName = {
                    13: 'ENTER',
                    27: 'ESC',
                    38: 'UP_ARROW',
                    40: 'DOWN_ARROW',
                    33: 'PAGE_UP',
                    34: 'PAGE_DOWN'
                };
            });

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
