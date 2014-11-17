'use strict';
describe('model.renderer', function() {
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
            }
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
            }
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

            ]
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            isHidden: true
        }
    ];
    var originalRowList = [
        {
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        },
        {
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        },
        {
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden'
        }
    ];

    var columnModelInstance,
        dataModelInstance,
        renderModelInstance,
        grid = {},
        rowList;

    beforeEach(function() {
        rowList = $.extend(true, [], originalRowList);
        columnModelInstance = grid.columnModel = new Data.ColumnModel({
            hasNumberColumn: true,
            selectType: 'checkbox',
            columnFixIndex: 2
        });
        columnModelInstance.set('columnModelList', columnModelList);
        dataModelInstance = grid.dataModel = new Data.RowList([], {
            grid: grid
        });
        renderModelInstance = new Model.Renderer({
            grid: grid
        });
    });
    describe('initializeVariables()', function() {
        it('값들이 초기화 되는지 확인한다.', function() {
            renderModelInstance.initializeVariables();
            expect(renderModelInstance.get('top')).toEqual(0);
            expect(renderModelInstance.get('scrollTop')).toEqual(0);
            expect(renderModelInstance.get('$scrollTarget')).toBeNull();
            expect(renderModelInstance.get('scrollLeft')).toEqual(0);
            expect(renderModelInstance.get('startIdx')).toEqual(0);
            expect(renderModelInstance.get('endIdx')).toEqual(0);
            expect(renderModelInstance.get('startNumber')).toEqual(1);
        });
    });
    describe('getCollection()', function() {
        it('인자가 없다면 rside 콜렉션을 반환한다.', function() {
            expect(renderModelInstance.getCollection()).toEqual(renderModelInstance.get('rside'));
        });
        it('인자가 있다면 L R 중 하나의 콜렉션을 반환한다.', function() {
            expect(renderModelInstance.getCollection('R')).toEqual(renderModelInstance.get('rside'));
            expect(renderModelInstance.getCollection('L')).toEqual(renderModelInstance.get('lside'));
        });
    });
    describe('_getCollectionByColumnName()', function() {
        it('columnName 을 인자로 받아 해당 columnName 이 속한 collection을 반환한다.', function() {
        });
    });
});
