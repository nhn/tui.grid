'use strict';
describe('Data.ColumnModel', function() {
    var columnModelInstance,
        sampleColumnModelList,
        resultList,
        expectedColumnModel;

    beforeEach(function() {
        columnModelInstance = new Data.ColumnModel();
        sampleColumnModelList = [
            {
                title: 'none',
                columnName: 'none'
            },
            {
                title: '_button',
                columnName: '_button'
            },
            {
                title: '_number',
                columnName: '_number'
            },
            {
                title: 'text',
                columnName: 'text',
                editOption: {
                    type: 'text'
                }
            },
            {
                title: 'text-convertible',
                columnName: 'text-convertible',
                editOption: {
                    type: 'text-convertible'
                }
            },
            {
                title: 'select',
                columnName: 'select',
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
                title: 'checkbox',
                columnName: 'checkbox',
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
                title: 'radio',
                columnName: 'radio',
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
                title: 'hidden',
                columnName: 'hidden',
                isHidden: true
            }
        ];
    });


    describe('_extendColumn', function() {
        var length;
        beforeEach(function() {
            length = sampleColumnModelList.length;
        });
        it('columnName 에 해당하는 컬럼 모델이 존재하지 않는다면, 해당 리스트 가장 앞에 prepend 한다.', function() {

            expectedColumnModel = {
                columnName: 'not_exist',
                title: 'Not exist column.',
                width: 60
            };

            resultList = columnModelInstance._extendColumn(expectedColumnModel, sampleColumnModelList);
            expect(resultList.length).toBe(length + 1);
            expect(resultList[0]).toEqual(expectedColumnModel);
        });
        it('columnName 에 해당하는 컬럼 모델이 존재한다면, 해당 컬럼 모델을 확장한다.', function() {
            var sampleColumn = {
                columnName: 'none',
                title: 'exist column.',
                width: 300
            };
            resultList = columnModelInstance._extendColumn(sampleColumn, sampleColumnModelList),
            expectedColumnModel = $.extend(sampleColumn, _.findWhere(sampleColumnModelList, {columnName: 'none'}));

            expect(resultList.length).toBe(length);
            expect(resultList[0]).toEqual(expectedColumnModel);
        });

    });
    describe('_initializeNumberColumn()', function() {

        it('hasNumberColumn: false 라면 _number 컬럼의 isHidden 프로퍼티가 true 로 설정된다.', function() {
            expectedColumnModel = {
                columnName: '_number',
                title: 'No.',
                width: 60,
                isHidden: true
            };
            columnModelInstance.set('hasNumberColumn', false, {silent: true});
            resultList = columnModelInstance._initializeNumberColumn(sampleColumnModelList);
            expect(resultList[2]).toEqual(expectedColumnModel);
        });
        it('hasNumberColumn: true ', function() {
            expectedColumnModel = {
                columnName: '_number',
                title: 'No.',
                width: 60
            };

            columnModelInstance.set('hasNumberColumn', true, {silent: true});
            resultList = columnModelInstance._initializeNumberColumn(sampleColumnModelList);
            expect(resultList[2]).toEqual(expectedColumnModel);
        });

    });
    describe('_initializeButtonColumn()', function() {

        it('selectType: checkbox 일 때 ', function() {
            var selectType = 'checkbox';
            expectedColumnModel = {
                title: '<input type="checkbox"/>',
                columnName: '_button',
                editOption: {
                    type: selectType,
                    list: [{
                        value: 'selected'
                    }]
                },
                width: 50
            };
            columnModelInstance.set('selectType', selectType, {silent: true});
            resultList = columnModelInstance._initializeButtonColumn(sampleColumnModelList);
            expect(resultList[1]).toEqual(expectedColumnModel);
        });
        it('selectType: radio 일 때', function() {
            var selectType = 'radio';
            expectedColumnModel = {
                title: '선택',
                columnName: '_button',
                editOption: {
                    type: selectType,
                    list: [{
                        value: 'selected'
                    }]
                },
                width: 50
            };
            columnModelInstance.set('selectType', selectType, {silent: true});
            resultList = columnModelInstance._initializeButtonColumn(sampleColumnModelList);
            expect(resultList[1]).toEqual(expectedColumnModel);
        });
        it('selectType 이 없을때 isHidden: true 로 설정된다.', function() {
            var selectType = '',
                sampleColumnModel = {
                    columnName: '_button',
                    editOption: {
                        type: '',
                        list: [{
                            value: 'selected'
                        }]
                    },
                    width: 50,
                    isHidden: true
                };
            expectedColumnModel = $.extend(sampleColumnModelList[1], sampleColumnModel);
            columnModelInstance.set('selectType', '', {silent: true});
            resultList = columnModelInstance._initializeButtonColumn(sampleColumnModelList);
            expect(resultList[1]).toEqual(expectedColumnModel);
        });
    });

    describe('_getVisibleList()', function() {
        it('_number, _button 을 제외하고 isHidden: true 가 아닌 columnModelList 를 반환한다.', function() {
            sampleColumnModelList = [
                {
                    columnName: '_button'
                },
                {
                    columnName: '_number',
                    isHidden: true
                },
                {
                    columnName: 'column2'
                },
                {
                    columnName: 'column3',
                    isHidden: true
                },
                {
                    columnName: 'column4',
                    isHidden: true
                },
                {
                    columnName: 'column5'
                }
            ];
            var visibleList = columnModelInstance._getVisibleList(sampleColumnModelList);
            expect(visibleList.length).toBe(3);
        });
    });
    describe('getEditType()', function() {
        it('컬럼모델에 정의된 editType 속성값을 반환한다. 없다면 normal 을 반환한다.', function() {
            columnModelInstance.set({
                columnModelList: sampleColumnModelList
            });
            expect(columnModelInstance.getEditType('hidden')).toBe('normal');
            expect(columnModelInstance.getEditType('none')).toBe('normal');

            expect(columnModelInstance.getEditType('text-convertible')).toBe('text-convertible');
            expect(columnModelInstance.getEditType('text')).toBe('text');
            expect(columnModelInstance.getEditType('checkbox')).toBe('checkbox');
            expect(columnModelInstance.getEditType('radio')).toBe('radio');
            expect(columnModelInstance.getEditType('select')).toBe('select');
        });

    });
    describe('isLside()', function() {
        it('isHidden 이 아닌 컬럼 중 ColumnFixIndex 기준으로 L side 여부를 판단한다.', function() {
            sampleColumnModelList = [
                {
                    columnName: '_button',
                    isHidden: true
                },
                {
                    columnName: '_number',
                    isHidden: true
                },
                {
                    columnName: 'column2'
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            columnModelInstance.set({
                columnFixIndex: 2,
                columnModelList: sampleColumnModelList
            });

            expect(columnModelInstance.isLside('_button')).toBe(false);
            expect(columnModelInstance.isLside('_number')).toBe(false);
            expect(columnModelInstance.isLside('column2')).toBe(true);
            expect(columnModelInstance.isLside('column3')).toBe(true);
            expect(columnModelInstance.isLside('column4')).toBe(false);
            expect(columnModelInstance.isLside('column5')).toBe(false);

        });
    });
    it('_indexOfColumnName()', function() {
        sampleColumnModelList = [
            {
                columnName: '_button',
                isHidden: true
            },
            {
                columnName: '_number',
                isHidden: true
            },
            {
                columnName: 'column2'
            },
            {
                columnName: 'column3'
            },
            {
                columnName: 'column4'
            },
            {
                columnName: 'column5',
                isHidden: true
            }
        ];
        expect(columnModelInstance._indexOfColumnName('_button', sampleColumnModelList)).toBe(0);
        expect(columnModelInstance._indexOfColumnName('_number', sampleColumnModelList)).toBe(1);
        expect(columnModelInstance._indexOfColumnName('column2', sampleColumnModelList)).toBe(2);
        expect(columnModelInstance._indexOfColumnName('column3', sampleColumnModelList)).toBe(3);
        expect(columnModelInstance._indexOfColumnName('column4', sampleColumnModelList)).toBe(4);
        expect(columnModelInstance._indexOfColumnName('column5', sampleColumnModelList)).toBe(5);
        expect(columnModelInstance._indexOfColumnName('column6', sampleColumnModelList)).toBe(-1);

    });
    it('indexOfColumnName()', function() {
        sampleColumnModelList = [
            {
                columnName: '_button',
                isHidden: true
            },
            {
                columnName: '_number',
                isHidden: true
            },
            {
                columnName: 'column2'
            },
            {
                columnName: 'column3'
            },
            {
                columnName: 'column4'
            },
            {
                columnName: 'column5',
                isHidden: true
            }
        ];
        columnModelInstance.set({
            columnModelList: sampleColumnModelList
        });
        expect(columnModelInstance.indexOfColumnName('_button', true)).toBe(-1);
        expect(columnModelInstance.indexOfColumnName('_number', true)).toBe(-1);
        expect(columnModelInstance.indexOfColumnName('column2', true)).toBe(0);
        expect(columnModelInstance.indexOfColumnName('column3', true)).toBe(1);
        expect(columnModelInstance.indexOfColumnName('column4', true)).toBe(2);
        expect(columnModelInstance.indexOfColumnName('column5', true)).toBe(-1);


        expect(columnModelInstance.indexOfColumnName('_button', false)).toBe(0);
        expect(columnModelInstance.indexOfColumnName('_number', false)).toBe(1);
        expect(columnModelInstance.indexOfColumnName('column2', false)).toBe(2);
        expect(columnModelInstance.indexOfColumnName('column3', false)).toBe(3);
        expect(columnModelInstance.indexOfColumnName('column4', false)).toBe(4);
        expect(columnModelInstance.indexOfColumnName('column5', false)).toBe(5);

    });
    describe('at() 의 동작을 확인한다.', function() {

        beforeEach(function() {
            sampleColumnModelList = [
                {
                    columnName: '_button',
                    isHidden: true
                },
                {
                    columnName: '_number',
                    isHidden: true
                },
                {
                    columnName: 'column0',
                    isHidden: true
                },
                {
                    columnName: 'column1',
                    isHidden: true
                },
                {
                    columnName: 'column2'
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            columnModelInstance.set({
                columnModelList: $.extend(true, [], sampleColumnModelList)
            });
        });

        it('isVisible 이 기본값(false)일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0)).not.toEqual(sampleColumnModelList[0]);
            expect(columnModelInstance.at(1)).not.toEqual(sampleColumnModelList[1]);

            expect(columnModelInstance.at(2)).toEqual(sampleColumnModelList[2]);
            expect(columnModelInstance.at(3)).toEqual(sampleColumnModelList[3]);
            expect(columnModelInstance.at(4)).toEqual(sampleColumnModelList[4]);
            expect(columnModelInstance.at(5)).toEqual(sampleColumnModelList[5]);
            expect(columnModelInstance.at(6)).toEqual(sampleColumnModelList[6]);
            expect(columnModelInstance.at(7)).toEqual(sampleColumnModelList[7]);
        });
        it('isVisible: true 일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0, true)).toEqual(sampleColumnModelList[4]);
            expect(columnModelInstance.at(1, true)).toEqual(sampleColumnModelList[5]);
            expect(columnModelInstance.at(2, true)).toEqual(sampleColumnModelList[6]);

            expect(columnModelInstance.at(3, true)).not.toBeDefined();
            expect(columnModelInstance.at(4, true)).not.toBeDefined();
            expect(columnModelInstance.at(5, true)).not.toBeDefined();
            expect(columnModelInstance.at(6, true)).not.toBeDefined();
            expect(columnModelInstance.at(7, true)).not.toBeDefined();
        });
    });
    describe('getVisibleColumnModelList()', function() {
        beforeEach(function() {
            sampleColumnModelList = [
                {
                    columnName: '_button',
                    isHidden: true
                },
                {
                    columnName: '_number',
                    isHidden: true
                },
                {
                    columnName: 'column0',
                    isHidden: true
                },
                {
                    columnName: 'column1',
                    isHidden: true
                },
                {
                    columnName: 'column2'
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            columnModelInstance.set({
                columnModelList: $.extend(true, [], sampleColumnModelList),
                columnFixIndex: 2
            });
        });
        it('whichSide 를 지정하지 않으면 전체 visibleList 를 반환한다.', function() {

            var expectList = [
                    {
                        columnName: 'column2'
                    },
                    {
                        columnName: 'column3'
                    },
                    {
                        columnName: 'column4'
                    }
                ],
                visibleList = columnModelInstance.getVisibleColumnModelList();
            expect(visibleList).toEqual(expectList);
        });
        it('whichSide = L 이라면 L Side 의 visibleList 를 반환한다.', function() {

            var expectList = [
                    {
                        columnName: 'column2'
                    },
                    {
                        columnName: 'column3'
                    }
                ],
                visibleList = columnModelInstance.getVisibleColumnModelList('L');
            expect(visibleList).toEqual(expectList);
        });
        it('whichSide = L 이라면 L Side 의 visibleList 를 반환한다.', function() {

            var expectList = [
                    {
                        columnName: 'column4'
                    }
                ],
                visibleList = columnModelInstance.getVisibleColumnModelList('R');
            expect(visibleList).toEqual(expectList);
        });

    });
    describe('getColumnModel()', function() {
        it('columnName 에 해당하는 columnModel 을 반환한다.', function() {
            sampleColumnModelList = [
                {
                    columnName: '_button',
                    isHidden: true
                },
                {
                    columnName: '_number',
                    isHidden: true
                },
                {
                    columnName: 'column0',
                    isHidden: true
                },
                {
                    columnName: 'column1',
                    isHidden: true
                },
                {
                    columnName: 'column2'
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            columnModelInstance.set({
                columnModelList: $.extend(true, [], sampleColumnModelList),
                columnFixIndex: 2
            });
            //_button 과 _number 는 가공되었기 때문에, 인자로 넘긴 columnModel 과는 달라야 한다.
            expect(columnModelInstance.getColumnModel('_button')).not.toEqual(sampleColumnModelList[0]);
            expect(columnModelInstance.getColumnModel('_number')).not.toEqual(sampleColumnModelList[1]);

            expect(columnModelInstance.getColumnModel('column0')).toEqual(sampleColumnModelList[2]);
            expect(columnModelInstance.getColumnModel('column1')).toEqual(sampleColumnModelList[3]);
            expect(columnModelInstance.getColumnModel('column2')).toEqual(sampleColumnModelList[4]);
            expect(columnModelInstance.getColumnModel('column3')).toEqual(sampleColumnModelList[5]);
            expect(columnModelInstance.getColumnModel('column4')).toEqual(sampleColumnModelList[6]);
            expect(columnModelInstance.getColumnModel('column5')).toEqual(sampleColumnModelList[7]);

        });
    });
    describe('_getRelationListMap()', function() {
        it('각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.', function() {
            sampleColumnModelList = [
                {
                    columnName: 'column0',
                    isHidden: true,
                    relationList: [
                        {
                            columnList: ['column1', 'column5'],
                            isDisable: function(value, rowData) {
                                return value == 2;
                            },
                            isEditable: function(value, rowData) {
                                return value != 3;
                            }
                        },
                        {
                            columnList: ['column2'],
                            isDisable: function(value, rowData) {
                                return value == 2;
                            }
                        }
                    ]
                },
                {
                    columnName: 'column1',
                    isHidden: true
                },
                {
                    columnName: 'column2',
                    relationList: [
                        {
                            columnList: ['column3', 'column4'],
                            optionListChange: function(value, rowData) {
                                if (value == 2) {
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
                            columnList: ['column5'],
                            optionListChange: function(value, rowData) {
                                if (value == 2) {
                                    return [
                                        { text: '하나', value: 1},
                                        { text: '둘', value: 2},
                                        { text: '셋', value: 3},
                                        { text: '넷', value: 4}
                                    ];
                                }
                            }
                        }
                    ]
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            var expectResult = {
                    'column0': sampleColumnModelList[0].relationList,
                    'column2': sampleColumnModelList[2].relationList
                },
                relationListMap = columnModelInstance._getRelationListMap(sampleColumnModelList);
            expect(relationListMap).toEqual(expectResult);
        });
    });
    describe('_onChange, _setColumnModelList()', function() {
        beforeEach(function() {
            sampleColumnModelList = [
                {
                    columnName: 'column0',
                    isHidden: true,
                    relationList: [
                        {
                            columnList: ['column1', 'column5'],
                            isDisable: function(value, rowData) {
                                return value == 2;
                            },
                            isEditable: function(value, rowData) {
                                return value != 3;
                            }
                        },
                        {
                            columnList: ['column2'],
                            isDisable: function(value, rowData) {
                                return value == 2;
                            }
                        }
                    ]
                },
                {
                    columnName: 'column1',
                    isHidden: true
                },
                {
                    columnName: 'column2',
                    relationList: [
                        {
                            columnList: ['column3', 'column4'],
                            optionListChange: function(value, rowData) {
                                if (value == 2) {
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
                            columnList: ['column5'],
                            optionListChange: function(value, rowData) {
                                if (value == 2) {
                                    return [
                                        { text: '하나', value: 1},
                                        { text: '둘', value: 2},
                                        { text: '셋', value: 3},
                                        { text: '넷', value: 4}
                                    ];
                                }
                            }
                        }
                    ]
                },
                {
                    columnName: 'column3'
                },
                {
                    columnName: 'column4'
                },
                {
                    columnName: 'column5',
                    isHidden: true
                }
            ];
            columnModelInstance.set({
                columnFixIndex: 2,
                hasNumberColumn: false,
                columnModelList: $.extend(true, [], sampleColumnModelList)
            });
        });
        describe('columnModelList 가 정상적으로 가공되었는지 확인한다.', function() {
            it('_button, _checkbox 가 append 되어 length 가 +2 되었는지 확인한다.', function() {
                var columnModelList = columnModelInstance.get('columnModelList'),
                    length = columnModelList.length;
                expect(length).toBe(sampleColumnModelList.length+2);
            });
        });

        it('columnModelMap 이 정상적으로 가공되었는지 확인한다.', function() {
            var columnModelList = columnModelInstance.get('columnModelList'),
                columnModelMap = columnModelInstance.get('columnModelMap');
            expect(columnModelMap).toEqual(_.indexBy(columnModelList, 'columnName'));
        });
        it('relationListMap 가 저장 되었는지 확인한다.', function() {
            var columnModelList = columnModelInstance.get('columnModelList'),
                relationListMap = columnModelInstance.get('relationListMap'),
                expectResult = {
                    'column0': sampleColumnModelList[0].relationList,
                    'column2': sampleColumnModelList[2].relationList
                };
            expect(relationListMap).toEqual(expectResult);
        });
        it('columnFixIndex 가 저장 되었는지 확인한다.', function() {
            expect(columnModelInstance.get('columnFixIndex')).toEqual(2);
        });
        it('visibleList 가 저장 되었는지 확인한다.', function() {
            var columnModelList = columnModelInstance.get('columnModelList'),
                visibleList = columnModelInstance.get('visibleList'),
                expectResult = [
                    {
                        columnName: 'column2',
                        relationList: sampleColumnModelList[2].relationList
                    },
                    {
                        columnName: 'column3'
                    },
                    {
                        columnName: 'column4'
                    }
                ];
            expect(visibleList).toEqual(expectResult);
        });
    });


});

