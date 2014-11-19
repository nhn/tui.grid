'use strict';
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

    var columnModelInstance,
        dataModelInstance,
        rowListModelInstance,
        grid = {};

    beforeEach(function() {
        columnModelInstance = grid.columnModel = new Data.ColumnModel({
            selectType: 'checkbox'
        });
        columnModelInstance.set('columnModelList', columnModelList);
        dataModelInstance = grid.dataModel = new Data.RowList([], {
            grid: grid
        });
    });

    describe('_formatData()', function() {
        beforeEach(function() {
            columnModelInstance.set({
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
                dataModelInstance.set(rowList, {parse: true});
                model = new Model.Row({
                    grid: grid
                });
            });
            it('sorting 되어있지 않은 경우에는 rowSpan 정보를 잘 저장한다.', function() {
                var dataList = dataModelInstance.toJSON(),
                    formatted = model._formatData(dataList[0]);

                expect(formatted['columnName1']).toEqual({
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
                formatted = model._formatData(dataList[1]);
                expect(formatted['columnName1']).toEqual({
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
            it('sorting 된 경우 rowSpan 정보를 저장하지 않는다.', function() {
                var dataList = dataModelInstance.toJSON(),
                    formatted = model._formatData(dataList[0]);
                dataModelInstance.sortByField('columnName1');
                expect(formatted['columnName1']).toEqual({
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
                formatted = model._formatData(dataList[1]);
                expect(formatted['columnName1']).toEqual({
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
                    model = new Model.Row({
                        grid: grid
                    });
                dataModelInstance.set(rowList, {parse: true});

                var dataList = dataModelInstance.toJSON(),
                    formatted;

                formatted = model._formatData(dataList[0]);
                expect(formatted['_button']).toEqual({
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
                expect(formatted['columnName1']).toEqual({
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
                expect(formatted['columnName2']).toEqual({
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
                expect(formatted['columnName3']).toEqual({
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
                    model;
                dataModelInstance.set(rowList, {parse: true});
                model = new Model.Row({
                    grid: grid
                });
                var dataList = dataModelInstance.toJSON();
                var formatted;

                formatted = model._formatData(dataList[0]);

                expect(formatted['_button']).toEqual({
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
                expect(formatted['columnName1']).toEqual({
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
                expect(formatted['columnName2']).toEqual({
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
                expect(formatted['columnName3']).toEqual({
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
            it('rowState 가 DISABLED 일 때', function() {
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
                    model;
                dataModelInstance.set(rowList, {parse: true});
                model = new Model.Row({
                    grid: grid
                });
                var dataList = dataModelInstance.toJSON();
                var formatted;

                formatted = model._formatData(dataList[0]);

                expect(formatted['_button']).toEqual({
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
                expect(formatted['columnName1']).toEqual({
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
                expect(formatted['columnName2']).toEqual({
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
                expect(formatted['columnName3']).toEqual({
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
                    model;
                dataModelInstance.set(rowList, {parse: true});
                model = new Model.Row({
                    grid: grid
                });
                var dataList = dataModelInstance.toJSON();
                var formatted;

                formatted = model._formatData(dataList[0]);

                expect(formatted['_button']).toEqual({
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
                expect(formatted['columnName1']).toEqual({
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
                expect(formatted['columnName2']).toEqual({
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
                expect(formatted['columnName3']).toEqual({
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
    describe('onDataModelChange()', function() {
        var rowList;
        beforeEach(function() {
            columnModelInstance.set({
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
            dataModelInstance.set(rowList, {parse: true});

            rowListModelInstance = new Model.RowList(dataModelInstance.toJSON(), {
                grid: grid,
                parse: true
            });
        });

        describe('dataModel 의 _extraData 가 변경되었을 때 해당 row 의 전체 column 에 값을 변경하는지 확인한다.', function() {
            it('rowSpan 된 경우, mainRow 가 아닌 row 의 extraData 를 변경하면 main row 의 extraData가 변경된다.', function() {
                dataModelInstance.setExtraData(3, {rowState: 'DISABLED'});

                var mainRow= rowListModelInstance.get(1);
                expect(mainRow.get('columnName1').isDisabled).toEqual(true);
                expect(mainRow.get('columnName1').className).toEqual('');

            });
            it('상태 변경 없을 때 기본값 검사', function() {
                var cell0 = rowListModelInstance.get(0).get('_button'),
                    cell1 = rowListModelInstance.get(0).get('columnName1'),
                    cell2 = rowListModelInstance.get(0).get('columnName2'),
                    cell3 = rowListModelInstance.get(0).get('columnName3');

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
                dataModelInstance.setExtraData(0, {rowState: 'DISABLED'});

                var cell0 = rowListModelInstance.get(0).get('_button'),
                    cell1 = rowListModelInstance.get(0).get('columnName1'),
                    cell2 = rowListModelInstance.get(0).get('columnName2'),
                    cell3 = rowListModelInstance.get(0).get('columnName3');

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
                dataModelInstance.setExtraData(0, {rowState: 'DISABLED_CHECK'});

                var cell0 = rowListModelInstance.get(0).get('_button'),
                    cell1 = rowListModelInstance.get(0).get('columnName1'),
                    cell2 = rowListModelInstance.get(0).get('columnName2'),
                    cell3 = rowListModelInstance.get(0).get('columnName3');

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
                dataModelInstance.setExtraData(0, {
                    className: {
                        row: ['rowClass'],
                        column: {
                            'columnName1': ['column1Class1', 'column1Class2'],
                            'columnName2': ['column2Class1', 'column2Class2']
                        }
                    }
                });

                var cell0 = rowListModelInstance.get(0).get('_button'),
                    cell1 = rowListModelInstance.get(0).get('columnName1'),
                    cell2 = rowListModelInstance.get(0).get('columnName2'),
                    cell3 = rowListModelInstance.get(0).get('columnName3');

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
                dataModelInstance.get(0).set({columnName1: 'changed'});
                expect(rowListModelInstance.get(0).get('columnName1').value).toEqual('changed');
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
            dataModelInstance.set(rowList, {parse: true});

            rowListModelInstance = new Model.RowList(dataModelInstance.toJSON(), {
                grid: grid,
                parse: true
            });
        });
        it('데이터가 변경되는지 확인한다.', function() {
            rowListModelInstance.get(0).setCell('columnName1', {
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

            expect(rowListModelInstance.get(0).get('columnName1')['rowKey']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['columnName']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['rowSpan']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['isMainRow']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['mainRowKey']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['isEditable']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['isDisabled']).toEqual('changed');
            expect(rowListModelInstance.get(0).get('columnName1')['optionList']).toEqual(['changed']);
            expect(rowListModelInstance.get(0).get('columnName1')['className']).toEqual('changed');
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
            rowListModelInstance.get(0).setCell('columnName1', expectResult);
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('rowKey');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('columnName');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('rowSpan');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('isMainRow');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('mainRowKey');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('isEditable');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('isDisabled');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('optionList');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).toContain('className');
            expect(rowListModelInstance.get(0).get('columnName1')['changed']).not.toContain('value');
        });
        it('변경시 change 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenTo(rowListModelInstance.get(0), 'change', callback);
            rowListModelInstance.get(0).setCell('columnName1', {
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
                listenModel = new Model.Base();
            listenModel.listenTo(rowListModelInstance.get(0), 'valueChange', callback);
            rowListModelInstance.get(0).setCell('columnName1', {
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
            rowListModelInstance.get(0).setCell('columnName1', {
               value: 10
            });
            expect(callback).toHaveBeenCalled();
        });
    });
});
