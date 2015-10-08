'use strict';

var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var Focus = require('../../src/js/model/focus');
var NormalPainter = require('../../src/js/view/painter/cell/normal');
var MainButtonPainter = require('../../src/js/view/painter/cell/mainButton');
var NumberPainter = require('../../src/js/view/painter/cell/number');

describe('view.painter.cell.normal', function() {
    var grid, cellPainter;

    function createGridMock() {
        var mock = {
            keyMap: {
                ENTER: 13,
                LEFT_ARROW: 37
            },
            keyName: {
                13: 'ENTER',
                37: 'LEFT_ARROW'
            },
            options: {
                toolbar: {}
            },
            option: function(name) {
                return this.options[name];
            },
            focusIn: function() {},
            setValue: function() {},
            updateLayoutData: function() {},
            dataModel: new Collection(),
            columnModel: new ColumnModelData()
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        mock.focusModel = new Focus({
            grid: mock
        });
        mock.dataModel = new RowListData([], {
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [
            {
                title: 'c1',
                columnName: 'c1',
                width: 30
            }, {
                title: 'c2',
                columnName: 'c2',
                width: 40
            }
        ]);
    });

    describe('Cell.Normal 클래스 테스트', function() {
        beforeEach(function() {
            grid.dataModel.set([
                {
                    c1: '0-1',
                    c2: '0-2'
                }
            ], {parse: true});

            cellPainter = new NormalPainter({
                grid: grid
            });
        });
        afterEach(function() {
            console.log('after each: destroy');
            //cellPainter.destroy();
        });

        describe('getEditType', function() {
            it('normal 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('normal');
            });
        });

        describe('getContentHtml', function() {
            it('formatter 가 정의되어 있지 않은 경우는 value 를 그대로 반환한다.', function() {
                var html, columnModel;

                columnModel = grid.columnModel.getColumnModel('c2');
                columnModel.formatter = null;

                html = cellPainter.getContentHtml({
                    rowKey: 0,
                    columnName: 'c2'
                });
                expect(html).toBe('0-2');
            });

            describe('formatter 가 정의되어 있는 경우.', function() {
                it('formatter를 알맞은 파라미터와 함께 호출하는지 확인한다.', function() {
                    var columnModel, rowJSON;

                    columnModel = grid.columnModel.getColumnModel('c2');
                    columnModel.formatter = jasmine.createSpy('formatter');
                    rowJSON = grid.dataModel.get(0).toJSON();
                    cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'c2'
                    });
                    expect(columnModel.formatter).toHaveBeenCalled();
                    expect(columnModel.formatter).toHaveBeenCalledWith('0-2', rowJSON, columnModel);
                });

                it('formatter 를 수행한 결과가 정확한지 확인한다.', function() {
                    var html, columnModel;

                    columnModel = grid.columnModel.getColumnModel('c2');
                    columnModel.formatter = function(value) {
                        return '<strong>' + value + '</strong>';
                    };
                    html = cellPainter.getContentHtml({
                        rowKey: 0,
                        columnName: 'c2'
                    });
                    expect(html).toBe('<strong>0-2</strong>');
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
            cellPainter = new NumberPainter({
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
            grid.options.selectType = 'checkbox';
            cellPainter = new MainButtonPainter({
                grid: grid
            });
        });

        afterEach(function() {
            console.log('after each: destroy');
            //cellPainter.destroy();
        });

        describe('getEditType', function() {
            it('_button 문자열을 반환한다.', function() {
                expect(cellPainter.getEditType()).toEqual('_button');
            });
        });

        describe('getContentHtml()', function() {
            var option, $button;

            it('value가 true 일 때 check 되는지 확인한다.', function() {
                option = {value: true};
                $button = $(cellPainter.getContentHtml(option));

                expect($button.is('input')).toBe(true);
                expect($button.prop('checked')).toBe(true);
            });

            it('isDisabled 가 true 일 때 비활성화 되는지 확인한다.', function() {
                option = {isDisabled: true};
                $button = $(cellPainter.getContentHtml(option));

                expect($button.prop('disabled')).toEqual(true);
            });

            describe('selectType 에 따라 input 이 잘 생성되는지 확인한다.', function() {
                it('checkbox', function() {
                    grid.options.selectType = 'checkbox';
                    $button = $(cellPainter.getContentHtml({}));

                    expect($button.attr('type')).toEqual('checkbox');
                });

                it('radio', function() {
                    grid.options.selectType = 'radio';
                    $button = $(cellPainter.getContentHtml({}));

                    expect($button.attr('type')).toEqual('radio');
                });
            });
        });

        describe('setElementAttribute', function() {
            var $td, $button;

            beforeEach(function() {
                $button = $(cellPainter.getContentHtml({}));
                $td = $('<td>').append($button);
            });

            it('값을 정확히 설정하는지 확인한다.', function() {
                cellPainter.setElementAttribute({value: true}, $td);
                expect($button.prop('checked')).toBe(true);

                cellPainter.setElementAttribute({value: false}, $td);
                expect($button.prop('checked')).toBe(false);

                cellPainter.setElementAttribute({value: true}, $td);
                expect($button.prop('checked')).toBe(true);
            });
        });

        describe('toggle', function() {
            var $td, $button;

            it('checkbox 일때 값을 toggle 하는지 확인한다.', function() {
                grid.options.selectType = 'checkbox';
                $button = $(cellPainter.getContentHtml({}));
                $td = $('<td>').append($button);

                expect($button.prop('checked')).toBe(false);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(true);
                cellPainter.toggle($td);
                expect($button.prop('checked')).toBe(false);
            });

            it('radio 일때 값을 toggle 하지 않는지 확인한다.', function() {
                grid.options.selectType = 'radio';
                $button = $(cellPainter.getContentHtml({}));
                $td = $('<td>').append($button);

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
            var $td, $button, mouseDownEvent;

            beforeEach(function() {
                var $table = jasmine.getFixtures().set('<table><tr><td></td></tr></table>');

                grid.options.selectType = 'checkbox';
                $button = $(cellPainter.getContentHtml({}));
                $td = $table.find('td').append($button);
                mouseDownEvent = {
                    target: $td[0]
                };
            });

            it('TD 에 mousedown 이벤트 발생시 button 의 상태변화를 유발하는지 확인한다.', function() {
                expect($button.prop('checked')).toBe(false);
                cellPainter._onMouseDown(mouseDownEvent);
                expect($button.prop('checked')).toBe(true);
                cellPainter._onMouseDown(mouseDownEvent);
                expect($button.prop('checked')).toBe(false);
            });
        });

        describe('_onChange', function() {
            var $button;

            beforeEach(function() {
                var $table;

                grid.options.selectType = 'checkbox';
                grid.dataModel.set([
                    {
                        c1: '0-1',
                        c2: '0-2'
                    }
                ], {parse: true});
                $table = $('<table><tr key=0><td></td></tr></table>');
                $button = $(cellPainter.getContentHtml({}));
                $table.find('td').append($button);
            });

            it('onChange 이벤트가 발생했을 때 setValue 를 적절한 파라미터로 호출하는지 확인한다.', function() {
                var changeEvent = {
                    target: $button.get(0)
                };
                grid.setValue = jasmine.createSpy('setValue');
                cellPainter._onChange(changeEvent);
                expect(grid.setValue).toHaveBeenCalledWith('0', '_button', $button.prop('checked'));
            });
        });

        describe('KeyDownSwitch', function() {
            var $target = $('<div>');

            function getKeyEvent(keyName) {
                return {
                    keyCode: grid.keyMap[keyName],
                    which: grid.keyMap[keyName],
                    target: $target.get(0)
                };
            }

            it('정의된 키 액션은 true 를 반환하는지 확인한다.', function() {
                expect(cellPainter._executeKeyDownSwitch(getKeyEvent('LEFT_ARROW', $target))).toBe(true);
            });

            it('ENTER 입력시 focusOut 을 호출하는지 확인한다. ', function() {
                spyOn(cellPainter, 'focusOut');
                cellPainter._executeKeyDownSwitch(getKeyEvent('ENTER'), $target);
                expect(cellPainter.focusOut).toHaveBeenCalled();
            });
        });
    });
});
