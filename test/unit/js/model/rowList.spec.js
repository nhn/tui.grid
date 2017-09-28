'use strict';

var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var RowListModel = require('model/rowList');
var RowModel = require('model/row');
var FocusModel = require('model/focus');
var Model = require('base/model');
var classNameConst = require('common/classNameConst');

describe('model.rowList', function() {
    var columns = [
        {
            title: 'c1',
            name: 'c1'
        },
        {
            title: 'c2',
            name: 'c2',
            editOptions: {
                type: 'text'
            }
        },
        {
            title: 'c3',
            name: 'c3',
            editOptions: {
                type: 'select',
                list: [
                    {
                        text: 'text1',
                        value: 1
                    },
                    {
                        text: 'text2',
                        value: 2
                    },
                    {
                        text: 'text3',
                        value: 3
                    },
                    {
                        text: 'text4',
                        value: 4
                    }
                ]
            }
        }
    ];

    var columnModel, dataModel, focusModel, rowListModel;

    beforeEach(function() {
        columnModel = new ColumnModelData({
            rowHeaders: ['rowNum', 'checkbox'],
            columns: columns
        });
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
        focusModel = new FocusModel(null, {
            columnModel: columnModel,
            dataModel: dataModel
        });
    });

    /* eslint-disable max-nested-callbacks */
    describe('_formatData()', function() {
        beforeEach(function() {
            columnModel.set('rowHeaders', ['rowNum', 'checkbox']);
        });

        describe('rowspan test: ', function() {
            var rowList, model;

            beforeEach(function() {
                rowList = [
                    {
                        _extraData: {
                            rowSpan: {
                                c1: 2
                            }
                        },
                        c1: '0-1',
                        c2: '0-2'
                    },
                    {
                        c2: '1-2'
                    }
                ];
                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    columnModel: columnModel,
                    dataModel: dataModel,
                    focusModel: focusModel
                });
            });

            it('if the cell is a main cell, cell-data have rowspan data', function() {
                var dataList = dataModel.toJSON();
                var cellData = model._formatData(dataList[0], dataModel, columnModel, focusModel).c1;

                expect(cellData.mainRowKey).toBe(cellData.rowKey);
                expect(cellData.isMainRow).toBe(true);
                expect(cellData.rowSpan).toBe(2);
            });

            it('if the cell is in a rowspan column and not a main cell:', function() {
                var dataList = dataModel.toJSON();
                var cellData = model._formatData(dataList[1], dataModel, columnModel, focusModel).c1;

                expect(cellData.mainRowKey).toBe(0);
                expect(cellData.isMainRow).toBe(false);
                expect(cellData.rowSpan).toBe(-1);
            });

            it('if rowspan data do not exist, cell-data have default rowspan data', function() {
                var dataList = dataModel.toJSON();
                var cellData = model._formatData(dataList[1], dataModel, columnModel, focusModel).c2;

                expect(cellData.mainRowKey).toBe(1);
                expect(cellData.isMainRow).toBe(true);
                expect(cellData.rowSpan).toBe(0);
            });

            it('if the data are sorted, cell-data do not have rowspan data', function() {
                var dataList = dataModel.toJSON();
                var cellData;

                dataModel.sortByField('c1');
                cellData = model._formatData(dataList[0], dataModel, columnModel, focusModel).c1;

                expect(cellData.mainRowKey).toBe(0);
                expect(cellData.isMainRow).toBe(true);
                expect(cellData.rowSpan).toBe(0);
            });
        });

        describe('rowState test: ', function() {
            it('if rowState does not exist', function() {
                var rowList = [
                    {
                        c1: 'c1',
                        c2: 'c2',
                        c3: 'c3'
                    }
                ];
                var model = new RowModel(null, {
                    columnModel: columnModel,
                    dataModel: dataModel,
                    focusModel: focusModel
                });
                var dataList, formatted;

                dataModel.set(rowList, {parse: true});

                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel, focusModel);

                expect(formatted._button.editable).toBe(true);
                expect(formatted._button.disabled).toBe(false);

                expect(formatted.c1.editable).toBe(false);
                expect(formatted.c1.disabled).toBe(false);

                expect(formatted.c2.editable).toBe(true);
                expect(formatted.c2.disabled).toBe(false);

                expect(formatted.c3.editable).toBe(true);
                expect(formatted.c3.disabled).toBe(false);
            });

            it('if the rowState is CHECKED', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'CHECKED'
                        },
                        c1: 'c1',
                        c2: 'c2',
                        c3: 'c3'
                    }
                ];
                var model, dataList, formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    columnModel: columnModel,
                    dataModel: dataModel,
                    focusModel: focusModel
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel, focusModel);

                expect(formatted._button.value).toBe(true);
            });

            it('if the rowState is DISABLED', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'DISABLED'
                        },
                        c1: 'c1',
                        c2: 'c2',
                        c3: 'c3'
                    }
                ];
                var model, dataList, formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    columnModel: columnModel,
                    dataModel: dataModel,
                    focusModel: focusModel
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel, focusModel);

                expect(formatted._button.disabled).toBe(true);
                expect(formatted.c1.disabled).toBe(true);
                expect(formatted.c2.disabled).toBe(true);
                expect(formatted.c3.disabled).toBe(true);
            });

            it('rowState 가 DISABLED_CHECK 일 때', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'DISABLED_CHECK'
                        },
                        c1: 'c1',
                        c2: 'c2',
                        c3: 'c3'
                    }
                ];
                var model, dataList, formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    columnModel: columnModel,
                    dataModel: dataModel,
                    focusModel: focusModel
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel, focusModel);

                expect(formatted._button.disabled).toBe(true);
                expect(formatted.c1.disabled).toBe(false);
                expect(formatted.c2.disabled).toBe(false);
                expect(formatted.c3.disabled).toBe(false);
            });
        });
    });

    describe('onRowListDisabledChanged()', function() {
        beforeEach(function() {
            var rowList = [
                {
                    c1: '0-1',
                    c2: '0-2',
                    c3: '0-3'
                },
                {
                    c1: '1-1',
                    c2: '1-2',
                    c3: '1-3'
                },
                {
                    c1: '2-1',
                    c2: '2-2',
                    c3: '2-3'
                }
            ];
            dataModel.reset(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                dataModel: dataModel,
                columnModel: columnModel,
                focusModel: focusModel,
                parse: true
            });
        });

        function checkAllDataDisabled(row, expectedValue) {
            var columnNames = _.pluck(columnModel.getVisibleColumns(null, true), 'name');

            return _.every(columnNames, function(columnName) {
                var data = row.get(columnName);

                return !data || data.disabled === expectedValue;
            });
        }

        it('if dataModel changed to disabled, set disabled of all row to true', function() {
            dataModel.setDisabled(true);

            expect(checkAllDataDisabled(rowListModel.at(0), true)).toBe(true);
            expect(checkAllDataDisabled(rowListModel.at(1), true)).toBe(true);
            expect(checkAllDataDisabled(rowListModel.at(2), true)).toBe(true);
        });

        it('if dataModel changed to enabled, set disabled of all row to false', function() {
            dataModel.setDisabled(true);
            dataModel.setDisabled(false);
            expect(checkAllDataDisabled(rowListModel.at(0), false)).toBe(true);
            expect(checkAllDataDisabled(rowListModel.at(1), false)).toBe(true);
            expect(checkAllDataDisabled(rowListModel.at(2), false)).toBe(true);
        });

        it('disabled of dataModel has higher priority than individual disbled state', function() {
            dataModel.setDisabled(true);
            dataModel.enableRow(0);

            expect(checkAllDataDisabled(rowListModel.at(0), true)).toBe(true);
        });
    });

    describe('onDataModelChange()', function() {
        var rowList;

        beforeEach(function() {
            columnModel.set({
                selectType: 'checkbox'
            });
            rowList = [
                {
                    _button: false,
                    c1: 'c1',
                    c2: 'c2',
                    c3: 'c3'
                },
                {
                    _extraData: {
                        rowSpan: {
                            c1: 3
                        }
                    },
                    _button: false,
                    c1: 1,
                    c2: 1,
                    c3: 1
                },
                {
                    _button: false,
                    c1: 2,
                    c2: 2,
                    c3: 2
                },
                {
                    _button: false,
                    c1: 3,
                    c2: 3,
                    c3: 3
                }
            ];
            dataModel.set(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                dataModel: dataModel,
                columnModel: columnModel,
                focusModel: focusModel,
                parse: true
            });
        });

        describe('dataModel 의 _extraData 가 변경되었을 때 해당 row 의 전체 column 에 값을 변경하는지 확인한다.', function() {
            it('rowSpan 된 경우, mainRow 가 아닌 row 의 extraData 를 변경하면 무시한다', function() {
                var mainRow;

                dataModel.get(3).setRowState('DISABLED');

                mainRow = rowListModel.get(1);
                expect(mainRow.get('c1').disabled).toBe(false);
                expect(mainRow.get('c1').className).toBe('');
            });

            it('상태 변경 없을 때 기본값 검사', function() {
                var cell0 = rowListModel.get(0).get('_button');
                var cell1 = rowListModel.get(0).get('c1');
                var cell2 = rowListModel.get(0).get('c2');
                var cell3 = rowListModel.get(0).get('c3');

                expect(cell0.value).toBe(false);
                expect(cell0.editable).toBe(true);
                expect(cell0.disabled).toBe(false);
                expect(cell0.className).toBe(classNameConst.CELL_HEAD);

                expect(cell1.value).toBe('c1');
                expect(cell1.editable).toBe(false);
                expect(cell1.disabled).toBe(false);
                expect(cell1.className).toBe('');

                expect(cell2.value).toBe('c2');
                expect(cell2.editable).toBe(true);
                expect(cell2.disabled).toBe(false);
                expect(cell2.className).toBe(classNameConst.CELL_EDITABLE);

                expect(cell3.value).toBe('c3');
                expect(cell3.editable).toBe(true);
                expect(cell3.disabled).toBe(false);
                expect(cell3.className).toBe(classNameConst.CELL_EDITABLE);
            });

            it('DISABLED 로 변경 시', function() {
                var cell0, cell1, cell2, cell3;

                dataModel.get(0).setRowState('DISABLED');

                cell0 = rowListModel.get(0).get('_button');
                cell1 = rowListModel.get(0).get('c1');
                cell2 = rowListModel.get(0).get('c2');
                cell3 = rowListModel.get(0).get('c3');

                expect(cell0.value).toEqual(false);
                expect(cell0.editable).toEqual(true);
                expect(cell0.disabled).toEqual(true);
                expect(cell0.className).toEqual(classNameConst.CELL_HEAD + ' ' + classNameConst.CELL_DISABLED);

                expect(cell1.value).toEqual('c1');
                expect(cell1.editable).toEqual(false);
                expect(cell1.disabled).toEqual(true);
                expect(cell1.className).toEqual(classNameConst.CELL_DISABLED);

                expect(cell2.value).toEqual('c2');
                expect(cell2.editable).toEqual(true);
                expect(cell2.disabled).toEqual(true);
                expect(cell2.className).toEqual(classNameConst.CELL_EDITABLE + ' ' + classNameConst.CELL_DISABLED);

                expect(cell3.value).toEqual('c3');
                expect(cell3.editable).toEqual(true);
                expect(cell3.disabled).toEqual(true);
                expect(cell3.className).toEqual(classNameConst.CELL_EDITABLE + ' ' + classNameConst.CELL_DISABLED);
            });

            it('DISABLED_CHECK 로 변경 시', function() {
                var cell0, cell1, cell2, cell3, rowModel;

                rowModel = rowListModel.get(0);
                dataModel.get(0).setRowState('DISABLED_CHECK');

                cell0 = rowModel.get('_button');
                cell1 = rowModel.get('c1');
                cell2 = rowModel.get('c2');
                cell3 = rowModel.get('c3');

                expect(cell0.value).toEqual(false);
                expect(cell0.editable).toEqual(true);
                expect(cell0.disabled).toEqual(true);
                expect(cell0.className).toEqual(classNameConst.CELL_HEAD + ' ' + classNameConst.CELL_DISABLED);

                expect(cell1.value).toEqual('c1');
                expect(cell1.editable).toEqual(false);
                expect(cell1.disabled).toEqual(false);
                expect(cell1.className).toEqual('');

                expect(cell2.value).toEqual('c2');
                expect(cell2.editable).toEqual(true);
                expect(cell2.disabled).toEqual(false);
                expect(cell2.className).toEqual(classNameConst.CELL_EDITABLE);

                expect(cell3.value).toEqual('c3');
                expect(cell3.editable).toEqual(true);
                expect(cell3.disabled).toEqual(false);
                expect(cell3.className).toEqual(classNameConst.CELL_EDITABLE);
            });

            it('className 변경 시', function() {
                var cell0, cell1, cell2, cell3, rowModel;
                var rowData = dataModel.get(0);
                var extraData = rowData.get('_extraData');

                extraData.className = {
                    row: ['rowClass'],
                    column: {
                        c1: ['column1Class1', 'column1Class2'],
                        c2: ['column2Class1', 'column2Class2']
                    }
                };
                rowData._triggerExtraDataChangeEvent();

                rowModel = rowListModel.get(0);
                cell0 = rowModel.get('_button');
                cell1 = rowModel.get('c1');
                cell2 = rowModel.get('c2');
                cell3 = rowModel.get('c3');

                expect(cell0.value).toEqual(false);
                expect(cell0.editable).toEqual(true);
                expect(cell0.disabled).toEqual(false);
                expect(cell0.className).toEqual('rowClass ' + classNameConst.CELL_HEAD);

                expect(cell1.value).toEqual('c1');
                expect(cell1.editable).toEqual(false);
                expect(cell1.disabled).toEqual(false);
                expect(cell1.className).toEqual('rowClass column1Class1 column1Class2');

                expect(cell2.value).toEqual('c2');
                expect(cell2.editable).toEqual(true);
                expect(cell2.disabled).toEqual(false);
                expect(cell2.className).toEqual('rowClass column2Class1 column2Class2 ' + classNameConst.CELL_EDITABLE);

                expect(cell3.value).toEqual('c3');
                expect(cell3.editable).toEqual(true);
                expect(cell3.disabled).toEqual(false);
                expect(cell3.className).toEqual('rowClass ' + classNameConst.CELL_EDITABLE);
            });
        });

        describe('dataModel 의 값이 변경되었을 때 해당 컬럼의 값이 변경되는지 확인한다.', function() {
            it('값이 변경되는지 확인한다', function() {
                dataModel.get(0).set({c1: 'changed'});
                expect(rowListModel.get(0).get('c1').value).toEqual('changed');
            });
        });
    });

    describe('if restore event occur on the data model,', function() {
        beforeEach(function() {
            dataModel.set([{
                c1: '1',
                c2: '2',
                c3: '3'
            }], {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                dataModel: dataModel,
                columnModel: columnModel,
                focusModel: focusModel,
                parse: true
            });
        });

        it('trigger its own restore event with cell-data', function() {
            var callback = jasmine.createSpy('callback');
            var rowData = dataModel.at(0);
            var rowModel = rowListModel.at(0);

            rowModel.on('restore', callback);
            rowData.trigger('restore', 'c1');

            expect(callback).toHaveBeenCalledWith(rowModel.get('c1'));
        });
    });

    describe('setCell()', function() {
        var rowList;

        beforeEach(function() {
            rowList = [
                {
                    c1: 'c1',
                    c2: 'c2',
                    c3: 'c3'
                }
            ];
            dataModel.set(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                columnModel: columnModel,
                dataModel: dataModel,
                focusModel: focusModel,
                parse: true
            });
        });

        it('데이터가 변경되는지 확인한다.', function() {
            rowListModel.get(0).setCell('c1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                editable: 'changed',
                disabled: 'changed',
                listItems: ['changed'],
                className: 'changed'
            });

            expect(rowListModel.get(0).get('c1').rowKey).toEqual('changed');
            expect(rowListModel.get(0).get('c1').columnName).toEqual('changed');
            expect(rowListModel.get(0).get('c1').rowSpan).toEqual('changed');
            expect(rowListModel.get(0).get('c1').isMainRow).toEqual('changed');
            expect(rowListModel.get(0).get('c1').mainRowKey).toEqual('changed');
            expect(rowListModel.get(0).get('c1').editable).toEqual('changed');
            expect(rowListModel.get(0).get('c1').disabled).toEqual('changed');
            expect(rowListModel.get(0).get('c1').listItems).toEqual(['changed']);
            expect(rowListModel.get(0).get('c1').className).toEqual('changed');
        });

        it('변경된 목록들이 changed 프로퍼티에 잘 들어가는지 확인한다.', function() {
            var expectResult = {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                editable: 'changed',
                disabled: 'changed',
                listItems: ['changed'],
                className: 'changed'
            };

            rowListModel.get(0).setCell('c1', expectResult);
            expect(rowListModel.get(0).get('c1').changed).toContain('rowKey');
            expect(rowListModel.get(0).get('c1').changed).toContain('columnName');
            expect(rowListModel.get(0).get('c1').changed).toContain('rowSpan');
            expect(rowListModel.get(0).get('c1').changed).toContain('isMainRow');
            expect(rowListModel.get(0).get('c1').changed).toContain('mainRowKey');
            expect(rowListModel.get(0).get('c1').changed).toContain('editable');
            expect(rowListModel.get(0).get('c1').changed).toContain('disabled');
            expect(rowListModel.get(0).get('c1').changed).toContain('listItems');
            expect(rowListModel.get(0).get('c1').changed).toContain('className');
            expect(rowListModel.get(0).get('c1').changed).not.toContain('value');
        });

        it('변경시 change 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback');
            var listenModel = new Model();

            listenModel.listenTo(rowListModel.get(0), 'change', callback);
            rowListModel.get(0).setCell('c1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                editable: 'changed',
                disabled: 'changed',
                listItems: ['changed'],
                className: 'abd'
            });
            expect(callback.calls.count()).toEqual(1);
        });

        it('값이 변경된 경우 valueChange 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback');
            var listenModel = new Model();

            listenModel.listenTo(rowListModel.get(0), 'valueChange', callback);
            rowListModel.get(0).setCell('c1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                editable: 'changed',
                disabled: 'changed',
                listItems: ['changed'],
                className: 'abd'
            });
            expect(callback).not.toHaveBeenCalled();
            rowListModel.get(0).setCell('c1', {
                value: 10
            });
            expect(callback).toHaveBeenCalled();
        });
    });
});
