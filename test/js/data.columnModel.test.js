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


    describe('기본 메서드 단위 테스트', function() {

        describe('_extendColumn', function() {
            var length;
            beforeEach(function() {
                length = sampleColumnModelList.length;
            });
            it('olumnName 에 해당하는 컬럼 모델이 존재하지 않는다면, 해당 리스트 가장 앞에 prepend 한다.', function() {

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
        describe('_onChange()', function() {
//            columnModelInstance.set({
//                columnFixIndex: 2,
//                hasNumber: true,
//                selectType: 'checkbox',
//                columnModelList: sampleColumnModelList
//            });

        });

    });
});

