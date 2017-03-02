'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var RowData = require('model/data/row');
var RowListData = require('model/data/rowList');
var ColumnModel = require('model/data/columnModel');
var classNameConst = require('common/classNameConst');

describe('RowData', function() {
    describe('isDuplicatedPublicChanged()', function() {
        var row;

        beforeEach(function() {
            row = new RowData({
                c1: '0-1',
                c2: '0-2'
            }, {
                parse: true,
                collection: {
                    columnModel: new ColumnModel({
                        columns: [
                            {name: 'c1'},
                            {name: 'c2'}
                        ]
                    })
                }
            });
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.', function() {
            expect(row.isDuplicatedPublicChanged({value: 1})).toBe(false);
            expect(row.isDuplicatedPublicChanged({value: 2})).toBe(false);
            expect(row.isDuplicatedPublicChanged({value: 2})).toBe(true);
        });

        it('10ms 후에는 같은 객체로 호출이 일어나도 false를 반환한다.', function() {
            row.isDuplicatedPublicChanged({value: 1});
            jasmine.clock().tick(10);
            expect(row.isDuplicatedPublicChanged({value: 1})).toBe(false);
        });
    });

    describe('addClassName', function() {
        it('해당 row의 모든 셀에 주어진 className를 지정한다.', function() {
            var row = new RowData({
                c1: 'c1',
                c2: 'c2'
            }, {
                parse: true,
                collection: {
                    columnModel: new ColumnModel({
                        columns: [
                            {name: 'c1'},
                            {name: 'c2'}
                        ]
                    })
                }
            });
            row.addClassName('myClass');

            expect(_.contains(row.getClassNameList('c1'), 'myClass')).toBe(true);
            expect(_.contains(row.getClassNameList('c2'), 'myClass')).toBe(true);
        });
    });

    describe('getClassNameList', function() {
        var rowList, row, columnModel;

        beforeEach(function() {
            columnModel = new ColumnModel();
            rowList = new RowListData(null, {
                columnModel: columnModel
            });
            row = rowList.append({})[0];
        });

        describe('Returns array of className', function() {
            it('containing className of columnModel', function() {
                columnModel.set('columns', [
                    {name: 'c1', className: 'c1-class'}
                ]);
                expect(row.getClassNameList('c1')).toContain('c1-class');
            });

            it('containing \'ellipsis\' if columnModel.ellipsis is true', function() {
                columnModel.set('columns', [
                    {name: 'c1', ellipsis: true}
                ]);
                expect(row.getClassNameList('c1')).toContain(classNameConst.CELL_ELLIPSIS);
            });

            it('containing CELL_REQUIRED if columnModel.validation.required is true', function() {
                columnModel.set('columns', [
                    {
                        name: 'c1',
                        validation: {
                            required: true
                        }
                    }
                ]);
                expect(row.getClassNameList('c1')).toContain(classNameConst.CELL_REQUIRED);
            });

            it('containing row-added className', function() {
                columnModel.set('columns', [
                    {name: 'c1'}
                ]);
                row.addClassName('row-class');
                expect(row.getClassNameList('c1')).toContain('row-class');
            });
        });
    });

    describe('validateCell - when required:true', function() {
        var row, rowList, columnModel;

        beforeEach(function() {
            columnModel = new ColumnModel({
                columns: [
                    {
                        name: 'c1',
                        validation: {
                            required: true
                        }
                    }
                ]
            });
            rowList = new RowListData(null, {
                columnModel: columnModel
            });
        });

        describe('if data is empty', function() {
            beforeEach(function() {
                row = rowList.append({c1: ''})[0];
            });

            it('add \'invalid\' className to the cell', function() {
                row.validateCell('c1');
                expect(row.getClassNameList('c1')).toContain(classNameConst.CELL_INVALID);
            });

            it('returns REQUIRED', function() {
                expect(row.validateCell('c1')).toBe('REQUIRED');
            });
        });

        describe('if data is not empty', function() {
            beforeEach(function() {
                row = rowList.append({c1: 'hello'})[0];
            });

            it('remove \'invalid\' className from the cell', function() {
                row.addCellClassName('c1', classNameConst.CELL_INVALID);
                row.validateCell('c1');
                expect(row.getClassNameList('c1')).not.toContain(classNameConst.CELL_INVALID);
            });

            it('returns empty string', function() {
                expect(row.validateCell('c1')).toBe('');
            });
        });
    });

    describe('setRowState(), getRowState()', function() {
        var row;

        beforeEach(function() {
            row = new RowData({
                text: 'hello'
            }, {
                parse: true,
                collection: {
                    columnModel: new ColumnModel()
                }
            });
        });

        it('default', function() {
            var expected = {
                disabled: false,
                disabledCheck: false,
                checked: false
            };
            expect(row.getRowState()).toEqual(expected);
        });

        it('set DISABLED', function() {
            var expected = {
                disabled: true,
                disabledCheck: true,
                checked: false
            };

            row.setRowState('DISABLED');
            expect(row.getRowState()).toEqual(expected);
        });

        it('set CHECKED', function() {
            var expected = {
                disabled: false,
                disabledCheck: false,
                checked: true
            };

            row.setRowState('CHECKED');
            expect(row.getRowState()).toEqual(expected);
        });

        it('set DISABLE_CHECK', function() {
            var expected = {
                disabled: false,
                disabledCheck: true,
                checked: false
            };

            row.setRowState('DISABLED_CHECK');
            expect(row.getRowState()).toEqual(expected);
        });
    });

    describe('_executeChangeBeforeCallback()', function() {
        var row, callbackSpy, gridInstance = {};

        beforeEach(function() {
            var columnModel = new ColumnModel();
            callbackSpy = jasmine.createSpy('callback');
            spyOn(tui.Grid, 'getInstanceById').and.returnValue(gridInstance);
            columnModel.set('columns', [
                {
                    name: 'c1'
                },
                {
                    name: 'c2',
                    onBeforeChange: callbackSpy
                },
                {
                    name: 'c3',
                    onBeforeChange: function() {
                        return true;
                    }
                },
                {
                    name: 'c4',
                    onBeforeChange: function() {
                        return false;
                    }
                }
            ]);
            row = new RowData({
                rowKey: 1,
                c1: 'value1',
                c2: 'value2',
                c3: 'value3',
                c4: 'value4'
            }, {
                parse: true,
                collection: {
                    columnModel: columnModel,
                    syncRowSpannedData: function() {}
                }
            });
        });

        it('If the onBeforeChange is not defined, returns true', function() {
            var result = row._executeOnBeforeChange('c1');
            expect(result).toBe(true);
        });

        it('If the onBeforeChange is defined, pass an event object as an argument', function() {
            row._executeOnBeforeChange('c2');
            expect(callbackSpy).toHaveBeenCalledWith({
                rowKey: 1,
                columnName: 'c2',
                value: 'value2',
                instance: gridInstance
            });
        });

        describe('onBeforeChange의 결과값에 따른 동작 확인', function() {
            it('callback 결과 값이 true 인 경우 정상적으로 값이 변경된다.', function() {
                row.set('c3', 'value3 new');
                expect(row.get('c3')).toBe('value3 new');
            });

            it('callback결과 값이 false인 경우 restore이벤트 발생후 이전값으로 복원된다.', function() {
                var listenModel = new Backbone.Model();

                listenModel.listenTo(row, 'restore', callbackSpy);
                row.set('c4', 'value4 new');

                expect(callbackSpy).toHaveBeenCalled();
                expect(row.get('c4')).toBe('value4');
            });
        });
    });

    describe('_executeChangeAfterCallback()', function() {
        var callbackSpy, row, gridInstance = {};

        beforeEach(function() {
            var columnModel = new ColumnModel();
            callbackSpy = jasmine.createSpy('callback');
            spyOn(tui.Grid, 'getInstanceById').and.returnValue(gridInstance);
            columnModel.set('columns', [{
                name: 'c1',
                onAfterChange: callbackSpy
            }]);
            row = new RowData({
                rowKey: 1,
                c1: 'value1'
            }, {
                parse: true,
                collection: {
                    columnModel: columnModel,
                    syncRowSpannedData: function() {}
                }
            });
        });

        it('데이터 변경이 완료된 이후 onAfterChange을 수행한다.', function() {
            row.set('c1', 'value1 new');
            expect(callbackSpy).toHaveBeenCalledWith({
                rowKey: 1,
                columnName: 'c1',
                value: 'value1 new',
                instance: gridInstance
            });
        });
    });
});
