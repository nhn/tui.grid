'use strict';

var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var FocusModel = require('model/focus');
var DomEventBus = require('event/domEventBus');
var GridEvent = require('event/gridEvent');
var Model = require('base/model');

describe('model/focus', function() {
    function create(options) {
        var columnModel, dataModel;

        columnModel = new ColumnModelData({
            columns: [
                {
                    name: 'c1',
                    editOptions: {
                        type: 'text'
                    }
                }, {
                    name: 'c2',
                    editOptions: {
                        type: 'text'
                    }
                }, {
                    name: 'c3',
                    editOptions: {
                        type: 'text'
                    }
                }
            ]
        });
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
        dataModel.set([{
            c1: '0-1',
            c2: '0-2',
            c3: '0-3'
        }, {
            c1: '1-1',
            c2: '1-2',
            c3: '1-3'
        }, {
            c1: '2-1',
            c2: '2-2',
            c3: '2-3'
        }, {
            c1: '3-1',
            c2: '3-2',
            c3: '3-3'
        }], {parse: true});

        return new FocusModel(null, _.extend({
            columnModel: columnModel,
            dataModel: dataModel
        }, options));
    }

    describe('when singleClickEdit is true', function() {
        it('and clickCell event occurs, call focusIn() with given address', function() {
            var domEventBus = DomEventBus.create();
            var focusModel = create({
                domEventBus: domEventBus,
                editingEvent: 'click'
            });

            spyOn(focusModel, 'focusIn');
            domEventBus.trigger('click:cell', new GridEvent(null, {
                rowKey: 0,
                columnName: 'c1'
            }));

            expect(focusModel.focusIn).toHaveBeenCalledWith(0, 'c1');
        });
    });

    describe('when new data appended with focus:true option', function() {
        it('focus to first cell of new added row', function() {
            var focusModel = create();
            var newRows = focusModel.dataModel.append({}, {
                focus: true
            });
            expect(focusModel.get('rowKey')).toBe(newRows[0].get('rowKey'));
            expect(focusModel.get('columnName')).toBe('c1');
        });
    });

    describe('focus()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
            focusModel.blur();
        });

        it('set rowKey and columnName', function() {
            focusModel.focus('1', 'c1');

            expect(focusModel.get('rowKey')).toEqual('1');
            expect(focusModel.get('columnName')).toEqual('c1');
        });

        it('trigger focus event', function() {
            var callback = jasmine.createSpy();
            focusModel.on('focus', callback);

            focusModel.focus('1', 'c1', true);

            expect(callback).toHaveBeenCalledWith('1', 'c1', true);
        });

        it('trigger focusChange event', function() {
            var callback = jasmine.createSpy();
            var argEvent;

            focusModel.focus('1', 'c1', true);
            focusModel.on('focusChange', callback);
            focusModel.focus('2', 'c2', true);

            argEvent = callback.calls.argsFor(0)[0];

            expect(argEvent.prevRowKey).toBe('1');
            expect(argEvent.prevColumnName).toBe('c1');
            expect(argEvent.rowKey).toBe('2');
            expect(argEvent.columnName).toBe('c2');
        });

        it('if callback of focusChange event invokes ev.stop(), do nothing', function() {
            focusModel.on('focusChange', function(ev) {
                ev.stop();
            });
            focusModel.focus('1', 'c1');

            expect(focusModel.get('rowKey')).toBeNull();
            expect(focusModel.get('columnName')).toBeNull();
        });

        it('if the target is the same as current cell and the focus is not active,' +
            'trigger nothing', function() {
            var callback = jasmine.createSpy();

            focusModel.focus('1', 'c1');
            focusModel.on('focus', callback);
            focusModel.on('focusChange', callback);
            focusModel.focus('1', 'c1');

            expect(callback).not.toHaveBeenCalled();
        });

        it('save previous rowKey and columnName', function() {
            focusModel.focus(0, 'c1');
            focusModel.focus(1, 'c2');

            expect(focusModel.get('rowKey')).toEqual(1);
            expect(focusModel.get('columnName')).toEqual('c2');
            expect(focusModel.get('prevRowKey')).toEqual(0);
            expect(focusModel.get('prevColumnName')).toEqual('c1');
        });
    });

    describe('blur()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
        });

        it('clear rowKey and columnName', function() {
            focusModel.blur();
            expect(focusModel.get('rowKey')).toBeNull();
            expect(focusModel.get('columnName')).toBeNull();
        });

        it('trigger blur event', function() {
            var callback = jasmine.createSpy();
            var listenModel = new Model();

            focusModel.focus(1, 'c1');
            listenModel.listenToOnce(focusModel, 'blur', callback);

            focusModel.blur();

            expect(callback).toHaveBeenCalledWith(1, 'c1');
        });
    });

    describe('which()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
        });

        it('현재 focus 정보를 반환하는지 확인한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel.which()).toEqual({
                rowKey: 1,
                columnName: 'c1'
            });
            focusModel.blur();
            expect(focusModel.which()).toEqual({
                rowKey: null,
                columnName: null
            });
        });
    });

    describe('indexOf()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
        });

        it('현재 focus 정보를 화면에 노출되는 Index 기준으로 반환하는지 확인한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel.indexOf()).toEqual({
                row: 1,
                column: 0
            });
        });

        it('메타컬럼은 포커스가 되지 않으므로, "_number"컬럼에 포커스하여도 변경사항이 없다', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel.indexOf()).toEqual({
                row: 1,
                column: 0
            });

            focusModel.focus(1, '_number');
            expect(focusModel.indexOf()).toEqual({
                row: 1,
                column: 0
            });
        });

        it('isPrevious 옵션이 설정되어 있다면 이전 정보를 반환한다.', function() {
            focusModel.focus('1', 'c1');
            focusModel.focus('1', 'c2');
            expect(focusModel.indexOf(true)).toEqual({
                row: 1,
                column: 0
            });

            focusModel.focus('0', 'c1');
            expect(focusModel.indexOf(true)).toEqual({
                row: 1,
                column: 1
            });
        });
    });

    describe('has()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
        });

        it('현재 focus 를 가지고 있는지 확인한다.', function() {
            focusModel.focus(0, 'c1');
            expect(focusModel.has()).toBe(true);

            focusModel.blur();
            expect(focusModel.has()).toBe(false);
        });

        it('If called with true and focused cell is not valid, return false', function() {
            focusModel.focus(0, 'c5');
            expect(focusModel.has(true)).toBe(false);
        });
    });

    describe('_findRowKey()', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
        });

        it('offset 만큼 이동한 rowKey 를 반환한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel._findRowKey(2)).toBe(3);
            expect(focusModel._findRowKey(-1)).toBe(0);

            expect(focusModel._findRowKey(-10)).toBe(0);
            expect(focusModel._findRowKey(10)).toBe(3);
        });
    });

    describe('_findColumnName()', function() {
        it('offset 만큼 이동한 columnName 을 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(1, 'c1');
            expect(focusModel._findColumnName(2)).toBe('c3');
            expect(focusModel._findColumnName(-1)).toBe('c1');

            expect(focusModel._findColumnName(10)).toBe('c3');
            expect(focusModel._findColumnName(-100)).toBe('c1');
        });
    });

    describe('nextColumnIndex()', function() {
        it('다음 columnIndex를 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(0, 'c1');
            expect(focusModel.nextColumnIndex()).toBe(1);
            focusModel.focus(0, 'c2');
            expect(focusModel.nextColumnIndex()).toBe(2);
        });
    });

    describe('prevColumnIndex()', function() {
        it('이전 columnIndex를 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(0, 'c3');
            expect(focusModel.prevColumnIndex()).toBe(1);
            focusModel.focus(0, 'c2');
            expect(focusModel.prevColumnIndex()).toBe(0);
            focusModel.focus(0, 'c1');
            expect(focusModel.prevColumnIndex()).toBe(0);
        });
    });

    describe('firstRowKey()', function() {
        it('첫번째 rowKey 를 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(2, 'c2');
            expect(focusModel.firstRowKey()).toBe(0);
        });
    });

    describe('lastRowKey()', function() {
        it('마지막 rowKey 를 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(2, 'c2');
            expect(focusModel.lastRowKey()).toBe(3);
        });
    });

    describe('firstColumnName()', function() {
        it('첫번째 columnName 을 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(2, 'c2');
            expect(focusModel.firstColumnName()).toBe('c1');
        });
    });

    describe('lastColumnName()', function() {
        it('마지막 columnName 을 반환한다.', function() {
            var focusModel = create();

            focusModel.focus(2, 'c2');
            expect(focusModel.lastColumnName()).toBe('c3');
        });
    });

    describe('_isValidCell', function() {
        it('Returns where specified cell is valid', function() {
            var focusModel = create();

            expect(focusModel._isValidCell(1, 'c1')).toBe(true);
            expect(focusModel._isValidCell(2, 'c3')).toBe(true);
            expect(focusModel._isValidCell(1, 'c4')).toBe(false);
            expect(focusModel._isValidCell(5, 'c1')).toBe(false);
        });
    });

    describe('restore', function() {
        it('If previous data exist, restore it and return true', function() {
            var focusModel = create();
            var result;

            focusModel.focus(0, 'c1');
            focusModel.blur();
            result = focusModel.restore();

            expect(result).toBe(true);
            expect(focusModel.which()).toEqual({
                rowKey: 0,
                columnName: 'c1'
            });
        });

        it('If previous data does not exist, return false', function() {
            var focusModel = create();
            var result = focusModel.restore();

            expect(result).toBe(false);
            expect(focusModel.has(true)).toBe(false);
        });
    });

    describe('with rowSpan Data', function() {
        var focusModel;

        beforeEach(function() {
            focusModel = create();
            focusModel.dataModel.lastRowKey = -1;
            focusModel.dataModel.reset(
                [
                    {
                        c1: '0-1',
                        c2: '0-2',
                        c3: '0-3'
                    },
                    {
                        _extraData: {
                            rowSpan: {
                                c1: 3
                            }
                        },
                        c1: '1-1',
                        c2: '1-2',
                        c3: '1-3'
                    },
                    {
                        c2: '2-2',
                        c3: '2-3'
                    },
                    {
                        c2: '3-2',
                        c3: '3-3'
                    },
                    {
                        c1: '4-1',
                        c2: '4-2',
                        c3: '4-3'
                    }
                ],
                {
                    parse: true
                }
            );
        });

        describe('nextRowIndex()', function() {
            it('offset 만큼 이동한 row 의 index 를 반환한다.', function() {
                focusModel.focus(0, 'c2');
                expect(focusModel.nextRowIndex()).toBe(1);
                expect(focusModel.nextRowIndex(3)).toBe(3);
            });

            it('현재 focus된 row가 rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(1, 'c1');
                expect(focusModel.nextRowIndex()).toBe(4);

                focusModel.focus(2, 'c1');
                expect(focusModel.nextRowIndex()).toBe(4);

                focusModel.focus(0, 'c1');
                expect(focusModel.nextRowIndex(2)).toBe(1);
                expect(focusModel.nextRowIndex(3)).toBe(1);
            });
        });

        describe('prevRowIndex()', function() {
            it('offset 만큼 이동한 row 의 inde 를 반환한다.', function() {
                focusModel.focus(4, 'c2');
                expect(focusModel.prevRowIndex()).toBe(3);
                expect(focusModel.prevRowIndex(3)).toBe(1);
            });

            it('현재 focus된 row가  rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(3, 'c1');
                expect(focusModel.prevRowIndex()).toBe(0);

                focusModel.focus(2, 'c1');
                expect(focusModel.prevRowIndex()).toBe(0);

                focusModel.focus(4, 'c1');
                expect(focusModel.prevRowIndex(2)).toBe(1);
                expect(focusModel.prevRowIndex(3)).toBe(1);
            });
        });

        describe('nextRowKey()', function() {
            it('offset만큼 이동한 row의 rowKey를 반환한다.', function() {
                focusModel.focus(0, 'c2');
                expect(focusModel.nextRowKey()).toBe(1);
                expect(focusModel.nextRowKey(3)).toBe(3);
            });

            it('현재 focus된 row가 rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(1, 'c1');
                expect(focusModel.nextRowKey()).toBe(4);

                focusModel.focus(2, 'c1');
                expect(focusModel.nextRowKey()).toBe(4);

                focusModel.focus(0, 'c1');
                expect(focusModel.nextRowKey(2)).toBe(1);
                expect(focusModel.nextRowKey(3)).toBe(1);
            });
        });

        describe('prevRowKey()', function() {
            it('offset 만큼 이동한 row 의 rowKey를 반환한다.', function() {
                focusModel.focus(4, 'c2');
                expect(focusModel.prevRowKey()).toBe(3);
                expect(focusModel.prevRowKey(3)).toBe(1);
            });

            it('현재 focus된 row가  rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(3, 'c1');
                expect(focusModel.prevRowKey()).toBe(0);

                focusModel.focus(2, 'c1');
                expect(focusModel.prevRowKey()).toBe(0);

                focusModel.focus(4, 'c1');
                expect(focusModel.prevRowKey(2)).toBe(1);
                expect(focusModel.prevRowKey(3)).toBe(1);
            });
        });
    });
});
