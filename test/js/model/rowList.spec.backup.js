'use strict';

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var RowListModel = require('model/rowList');
var RowModel = require('model/row');
var FocusModel = require('model/focus');
var Model = require('base/model');

describe('model.rowList', function() {
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
        }
    ];

    var columnModel, dataModel, focusModel, rowListModel;

    beforeEach(function() {
        columnModel = new ColumnModelData({
            selectType: 'checkbox',
            columnModelList: columnModelList
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
            columnModel.set({
                hasNumberColumn: true,
                selectType: 'checkbox'
            });
        });

        describe('rowSpan 에 따른 동작을 확인한다.', function() {
            var rowList, model;

            beforeEach(function() {
                rowList = [
                    {
                        _extraData: {
                            rowSpan: {
                                columnName1: 2
                            }
                        },
                        columnName1: '1'
                    },
                    {
                        columnName1: '2'
                    }
                ];
                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    collection: {
                        columnModel: columnModel,
                        dataModel: dataModel,
                        focusModel: focusModel
                    }
                });
            });

            it('sorting 되어있지 않은 경우에는 rowSpan 정보를 잘 저장한다.', function() {
                var dataList = dataModel.toJSON(),
                    formatted = model._formatData(dataList[0], dataModel, columnModel, focusModel);

                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: '1',
                    rowSpan: 2,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                formatted = model._formatData(dataList[1], dataModel, columnModel, focusModel);
                expect(formatted.columnName1).toEqual({
                    rowKey: 1,
                    columnName: 'columnName1',
                    value: '1',
                    rowSpan: -1,
                    isMainRow: false,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });

            it('sorting된 경우 rowSpan 정보를 저장하지 않는다.', function() {
                var dataList = dataModel.toJSON(),
                    formatted = model._formatData(dataList[0], dataModel, columnModel);
                dataModel.sortByField('columnName1');
                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: '1',
                    rowSpan: 2,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                formatted = model._formatData(dataList[1], dataModel, columnModel);
                expect(formatted.columnName1).toEqual({
                    rowKey: 1,
                    columnName: 'columnName1',
                    value: '1',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 1,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });
        });

        describe('rowState 에 따른 동작을 확인한다.', function() {
            it('rowState 가 존재하지 않을 때', function() {
                var rowList = [
                    {
                        columnName1: 'columnName1',
                        columnName2: 'columnName2',
                        columnName3: 'columnName3'
                    }
                    ],
                    model = new RowModel(null, {
                        collection: {
                            columnModel: columnModel,
                            dataModel: dataModel,
                            focusModel: focusModel
                        }
                    }),
                    dataList,
                    formatted;

                dataModel.set(rowList, {parse: true});

                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel);

                expect(formatted._button).toEqual({
                    rowKey: 0,
                    columnName: '_button',
                    value: false,
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: 'columnName1',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName2).toEqual({
                    rowKey: 0,
                    columnName: 'columnName2',
                    value: 'columnName2',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName3).toEqual({
                    rowKey: 0,
                    columnName: 'columnName3',
                    value: 'columnName3',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });

            it('rowState 가 CHECKED 일 때', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'CHECKED'
                        },
                        columnName1: 'columnName1',
                        columnName2: 'columnName2',
                        columnName3: 'columnName3'
                    }
                    ],
                    model,
                    dataList,
                    formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    collection: {
                        columnModel: columnModel,
                        dataModel: dataModel
                    }
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel);

                expect(formatted._button).toEqual({
                    rowKey: 0,
                    columnName: '_button',
                    value: true,
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: 'columnName1',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName2).toEqual({
                    rowKey: 0,
                    columnName: 'columnName2',
                    value: 'columnName2',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName3).toEqual({
                    rowKey: 0,
                    columnName: 'columnName3',
                    value: 'columnName3',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });

            it('rowState가 DISABLED 일 때', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'DISABLED'
                        },
                        columnName1: 'columnName1',
                        columnName2: 'columnName2',
                        columnName3: 'columnName3'
                    }
                    ],
                    model,
                    dataList,
                    formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    collection: {
                        columnModel: columnModel,
                        dataModel: dataModel
                    }
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel);

                expect(formatted._button).toEqual({
                    rowKey: 0,
                    columnName: '_button',
                    value: false,
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: true,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: 'columnName1',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: true,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName2).toEqual({
                    rowKey: 0,
                    columnName: 'columnName2',
                    value: 'columnName2',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: true,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName3).toEqual({
                    rowKey: 0,
                    columnName: 'columnName3',
                    value: 'columnName3',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: true,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });

            it('rowState 가 DISABLED_CHECK 일 때', function() {
                var rowList = [
                    {
                        _extraData: {
                            rowState: 'DISABLED_CHECK'
                        },
                        columnName1: 'columnName1',
                        columnName2: 'columnName2',
                        columnName3: 'columnName3'
                    }
                    ],
                    model,
                    dataList,
                    formatted;

                dataModel.set(rowList, {parse: true});
                model = new RowModel(null, {
                    collection: {
                        columnModel: columnModel,
                        dataModel: dataModel
                    }
                });
                dataList = dataModel.toJSON();
                formatted = model._formatData(dataList[0], dataModel, columnModel);

                expect(formatted._button).toEqual({
                    rowKey: 0,
                    columnName: '_button',
                    value: false,
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: true,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName1).toEqual({
                    rowKey: 0,
                    columnName: 'columnName1',
                    value: 'columnName1',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: false,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName2).toEqual({
                    rowKey: 0,
                    columnName: 'columnName2',
                    value: 'columnName2',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
                expect(formatted.columnName3).toEqual({
                    rowKey: 0,
                    columnName: 'columnName3',
                    value: 'columnName3',
                    rowSpan: 0,
                    isMainRow: true,
                    mainRowKey: 0,
                    isEditable: true,
                    isDisabled: false,
                    optionList: [],
                    className: '',
                    changed: []
                });
            });
        });
    });

    describe('onRowListDisabledChanged()', function() {
        beforeEach(function() {
            var rowList = [
                {
                    columnName1: '0-1',
                    columnName2: '0-2',
                    columnName3: '0-3'
                },
                {
                    columnName1: '0-1',
                    columnName2: '0-2',
                    columnName3: '0-3'
                },
                {
                    columnName1: '0-1',
                    columnName2: '0-2',
                    columnName3: '0-3'
                }
            ];
            dataModel.reset(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                dataModel: dataModel,
                columnModel: columnModel,
                parse: true
            });
        });

        function checkAllDataIsDisabled(row, expectedValue) {
            var columnNames = _.pluck(columnModel.getVisibleColumnModelList(null, true), 'columnName');

            _.each(columnNames, function(columnName) {
                var data = row.get(columnName);
                if (data) {
                    expect(data.isDisabled).toBe(expectedValue);
                }
            });
        }

        it('if dataModel changed to disabled, set isDisabled of all row to true', function() {
            dataModel.setDisabled(true);
            checkAllDataIsDisabled(rowListModel.at(0), true);
            checkAllDataIsDisabled(rowListModel.at(1), true);
            checkAllDataIsDisabled(rowListModel.at(2), true);
        });

        it('if dataModel changed to enabled, set isDisabled of all row to false', function() {
            dataModel.setDisabled(true);
            dataModel.setDisabled(false);
            checkAllDataIsDisabled(rowListModel.at(0), false);
            checkAllDataIsDisabled(rowListModel.at(1), false);
            checkAllDataIsDisabled(rowListModel.at(2), false);
        });

        it('isDisabled of dataModel has higher priority than individual disbled state', function() {
            dataModel.setDisabled(true);
            dataModel.enableRow(0);

            checkAllDataIsDisabled(rowListModel.at(0), true);
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
                    columnName1: 'columnName1',
                    columnName2: 'columnName2',
                    columnName3: 'columnName3'
                },
                {
                    _extraData: {
                        rowSpan: {
                            columnName1: 3
                        }
                    },
                    _button: false,
                    columnName1: 1,
                    columnName2: 1,
                    columnName3: 1
                },
                {
                    _button: false,
                    columnName1: 2,
                    columnName2: 2,
                    columnName3: 2
                },
                {
                    _button: false,
                    columnName1: 3,
                    columnName2: 3,
                    columnName3: 3
                }
            ];
            dataModel.set(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                dataModel: dataModel,
                columnModel: columnModel,
                parse: true
            });
        });

        describe('dataModel 의 _extraData 가 변경되었을 때 해당 row 의 전체 column 에 값을 변경하는지 확인한다.', function() {
            it('rowSpan 된 경우, mainRow 가 아닌 row 의 extraData 를 변경하면 main row 의 extraData가 변경된다.', function() {
                var mainRow;

                dataModel.get(3).setRowState('DISABLED');

                mainRow = rowListModel.get(1);
                expect(mainRow.get('columnName1').isDisabled).toEqual(true);
                expect(mainRow.get('columnName1').className).toEqual('');
            });

            it('상태 변경 없을 때 기본값 검사', function() {
                var cell0 = rowListModel.get(0).get('_button'),
                    cell1 = rowListModel.get(0).get('columnName1'),
                    cell2 = rowListModel.get(0).get('columnName2'),
                    cell3 = rowListModel.get(0).get('columnName3');

                expect(cell0.value).toEqual(false);
                expect(cell0.isEditable).toEqual(true);
                expect(cell0.isDisabled).toEqual(false);
                expect(cell0.className).toEqual('');

                expect(cell1.value).toEqual('columnName1');
                expect(cell1.isEditable).toEqual(false);
                expect(cell1.isDisabled).toEqual(false);
                expect(cell1.className).toEqual('');

                expect(cell2.value).toEqual('columnName2');
                expect(cell2.isEditable).toEqual(true);
                expect(cell2.isDisabled).toEqual(false);
                expect(cell2.className).toEqual('');

                expect(cell3.value).toEqual('columnName3');
                expect(cell3.isEditable).toEqual(true);
                expect(cell3.isDisabled).toEqual(false);
                expect(cell3.className).toEqual('');
            });

            it('DISABLED 로 변경 시', function() {
                var cell0, cell1, cell2, cell3;

                dataModel.get(0).setRowState('DISABLED');

                cell0 = rowListModel.get(0).get('_button');
                cell1 = rowListModel.get(0).get('columnName1');
                cell2 = rowListModel.get(0).get('columnName2');
                cell3 = rowListModel.get(0).get('columnName3');

                expect(cell0.value).toEqual(false);
                expect(cell0.isEditable).toEqual(true);
                expect(cell0.isDisabled).toEqual(true);
                expect(cell0.className).toEqual('');

                expect(cell1.value).toEqual('columnName1');
                expect(cell1.isEditable).toEqual(false);
                expect(cell1.isDisabled).toEqual(true);
                expect(cell1.className).toEqual('');

                expect(cell2.value).toEqual('columnName2');
                expect(cell2.isEditable).toEqual(true);
                expect(cell2.isDisabled).toEqual(true);
                expect(cell2.className).toEqual('');

                expect(cell3.value).toEqual('columnName3');
                expect(cell3.isEditable).toEqual(true);
                expect(cell3.isDisabled).toEqual(true);
                expect(cell3.className).toEqual('');
            });

            it('DISABLED_CHECK 로 변경 시', function() {
                var cell0, cell1, cell2, cell3, rowModel;

                rowModel = rowListModel.get(0);
                dataModel.get(0).setRowState('DISABLED_CHECK');

                cell0 = rowModel.get('_button');
                cell1 = rowModel.get('columnName1');
                cell2 = rowModel.get('columnName2');
                cell3 = rowModel.get('columnName3');

                expect(cell0.value).toEqual(false);
                expect(cell0.isEditable).toEqual(true);
                expect(cell0.isDisabled).toEqual(true);
                expect(cell0.className).toEqual('');

                expect(cell1.value).toEqual('columnName1');
                expect(cell1.isEditable).toEqual(false);
                expect(cell1.isDisabled).toEqual(false);
                expect(cell1.className).toEqual('');

                expect(cell2.value).toEqual('columnName2');
                expect(cell2.isEditable).toEqual(true);
                expect(cell2.isDisabled).toEqual(false);
                expect(cell2.className).toEqual('');

                expect(cell3.value).toEqual('columnName3');
                expect(cell3.isEditable).toEqual(true);
                expect(cell3.isDisabled).toEqual(false);
                expect(cell3.className).toEqual('');
            });

            it('className 변경 시', function() {
                var cell0, cell1, cell2, cell3, rowModel,
                    rowData = dataModel.get(0),
                    extraData = rowData.get('_extraData');

                extraData.className = {
                    row: ['rowClass'],
                    column: {
                        columnName1: ['column1Class1', 'column1Class2'],
                        columnName2: ['column2Class1', 'column2Class2']
                    }
                };
                rowData._triggerExtraDataChangeEvent();

                rowModel = rowListModel.get(0);
                cell0 = rowModel.get('_button');
                cell1 = rowModel.get('columnName1');
                cell2 = rowModel.get('columnName2');
                cell3 = rowModel.get('columnName3');

                expect(cell0.value).toEqual(false);
                expect(cell0.isEditable).toEqual(true);
                expect(cell0.isDisabled).toEqual(false);
                expect(cell0.className).toEqual('rowClass');

                expect(cell1.value).toEqual('columnName1');
                expect(cell1.isEditable).toEqual(false);
                expect(cell1.isDisabled).toEqual(false);
                expect(cell1.className).toEqual('rowClass column1Class1 column1Class2');

                expect(cell2.value).toEqual('columnName2');
                expect(cell2.isEditable).toEqual(true);
                expect(cell2.isDisabled).toEqual(false);
                expect(cell2.className).toEqual('rowClass column2Class1 column2Class2');

                expect(cell3.value).toEqual('columnName3');
                expect(cell3.isEditable).toEqual(true);
                expect(cell3.isDisabled).toEqual(false);
                expect(cell3.className).toEqual('rowClass');
            });
        });

        describe('dataModel 의 값이 변경되었을 때 해당 컬럼의 값이 변경되는지 확인한다.', function() {
            it('값이 변경되는지 확인한다', function() {
                dataModel.get(0).set({columnName1: 'changed'});
                expect(rowListModel.get(0).get('columnName1').value).toEqual('changed');
            });
        });
    });

    describe('setCell()', function() {
        var rowList;

        beforeEach(function() {
            rowList = [
                {
                    columnName1: 'columnName1',
                    columnName2: 'columnName2',
                    columnName3: 'columnName3'
                }
            ];
            dataModel.set(rowList, {parse: true});

            rowListModel = new RowListModel(dataModel.toJSON(), {
                columnModel: columnModel,
                dataModel: dataModel,
                parse: true
            });
        });

        it('데이터가 변경되는지 확인한다.', function() {
            rowListModel.get(0).setCell('columnName1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                isEditable: 'changed',
                isDisabled: 'changed',
                optionList: ['changed'],
                className: 'changed'
            });

            expect(rowListModel.get(0).get('columnName1').rowKey).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').columnName).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').rowSpan).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').isMainRow).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').mainRowKey).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').isEditable).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').isDisabled).toEqual('changed');
            expect(rowListModel.get(0).get('columnName1').optionList).toEqual(['changed']);
            expect(rowListModel.get(0).get('columnName1').className).toEqual('changed');
        });

        it('변경된 목록들이 changed 프로퍼티에 잘 들어가는지 확인한다.', function() {
            var expectResult = {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                isEditable: 'changed',
                isDisabled: 'changed',
                optionList: ['changed'],
                className: 'changed'
            };

            rowListModel.get(0).setCell('columnName1', expectResult);
            expect(rowListModel.get(0).get('columnName1').changed).toContain('rowKey');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('columnName');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('rowSpan');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('isMainRow');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('mainRowKey');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('isEditable');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('isDisabled');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('optionList');
            expect(rowListModel.get(0).get('columnName1').changed).toContain('className');
            expect(rowListModel.get(0).get('columnName1').changed).not.toContain('value');
        });

        it('변경시 change 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model();

            listenModel.listenTo(rowListModel.get(0), 'change', callback);
            rowListModel.get(0).setCell('columnName1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                isEditable: 'changed',
                isDisabled: 'changed',
                optionList: ['changed'],
                className: 'abd'
            });
            expect(callback.calls.count()).toEqual(1);
        });

        it('값이 변경된 경우 valueChange 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model();

            listenModel.listenTo(rowListModel.get(0), 'valueChange', callback);
            rowListModel.get(0).setCell('columnName1', {
                rowKey: 'changed',
                columnName: 'changed',
                rowSpan: 'changed',
                isMainRow: 'changed',
                mainRowKey: 'changed',
                isEditable: 'changed',
                isDisabled: 'changed',
                optionList: ['changed'],
                className: 'abd'
            });
            expect(callback).not.toHaveBeenCalled();
            rowListModel.get(0).setCell('columnName1', {
               value: 10
            });
            expect(callback).toHaveBeenCalled();
        });
    });
});
