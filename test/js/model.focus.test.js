'use strict';
describe('model.renderer', function() {
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        },
        {
            title: 'columnName2',
            columnName: 'columnName2',
            editOption: {
                type: 'text'
            },
            width: 100

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
            },
            width: 100
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
            },
            width: 100
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
            },
            width: 100
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
                    isDisable: function(value, rowData) {
                        return value === false;
                    },
                    isEditable: function(value, rowData) {
                        return value !== false;
                    }
                }

            ],
            width: 100
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            isHidden: true
        }
    ];
    var sampleRow = {
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
        },
        rowList = [],
        columnModelInstance,
        dataModelInstance,
        renderInstance,
        dimensionModelInstance,
        focusInstance,
        grid = {},
        i;

    for (i = 0; i < 100; i++) {
        rowList.push($.extend({}, sampleRow));
    }
    columnModelInstance = grid.columnModel = new Data.ColumnModel({
        hasNumberColumn: true,
        selectType: 'checkbox',
        columnFixIndex: 2
    });
    columnModelInstance.set('columnModelList', columnModelList);
    dataModelInstance = grid.dataModel = new Data.RowList([], {
        grid: grid
    });
    dimensionModelInstance = grid.dimensionModel = new Model.Dimension({
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

    dimensionModelInstance.set('bodyHeight',
        Util.getHeight(dimensionModelInstance.get('displayRowCount'), dimensionModelInstance.get('rowHeight')));


    dataModelInstance.set(rowList, {parse: true});
    renderInstance = grid.renderModel = new Model.Renderer.Smart({
        grid: grid
    });
    focusInstance = grid.focusModel = new Model.Focus({
        grid: grid
    });

    describe('select()', function() {
        it('select 된 rowKey 를 저장한다.', function() {
            focusInstance.select(22);
            expect(focusInstance.get('rowKey')).toEqual(22);
        });
        it('select 시 select 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusInstance, 'select', callback);
            focusInstance.select(22);
            expect(callback).toHaveBeenCalled();
        });
    });
    describe('unselect()', function() {
        it('저장된 rowKey 를 제거한다.', function() {
            focusInstance.unselect();
            expect(focusInstance.get('rowKey')).toBeNull();
        });
        it('unselect 시 unselect 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusInstance, 'unselect', callback);
            focusInstance.unselect();
            expect(callback).toHaveBeenCalled();
        });
    });
    describe('focus()', function() {
        it('지정된 rowKey, columnName 을 저장한다.', function() {
            focusInstance.focus('22', 'columnName1');
            expect(focusInstance.get('rowKey')).toEqual('22');
            expect(focusInstance.get('columnName')).toEqual('columnName1');
        });
        it('focus 이벤트를 발생한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusInstance, 'focus', callback);

            focusInstance.focus('22', 'columnName1');
            expect(callback).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith('22', 'columnName1');
        });
    });
});

