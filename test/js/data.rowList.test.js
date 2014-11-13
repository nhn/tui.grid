'use strict';
describe('data.rowList', function() {
    var columnModelList = [
        {
            title: 'keyColumn',
            columnName: 'keyColumn'
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
            title: 'none',
            columnName: 'none'
        },
        {
            title: 'hasFormatter',
            columnName: 'hasFormatter',
            formatter: function(value, rowData, model) {
                return '<a href="http://www.testurl.com" >' + value + '</a> click<button> me</button>';
            }
        },
        {
            title: 'notUseHtmlEntity',
            columnName: 'notUseHtmlEntity',
            notUseHtmlEntity: true
        },
        {
            title: 'relationOptionList',
            columnName: 'relationOptionList',
            relationList: [
                {
                    columnList: ['select', 'checkbox', 'radio'],
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
                    columnList: ['text'],
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
            title: 'radioNoRelation',
            columnName: 'radioNoRelation',
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
    var originalData = [
        {
            '_extraData': {
                rowState: 'CHECKED'
            },
            '_number': false,
            '_button': false,
            'keyColumn': 10,
            'none': 0,
            'text': 0,
            'text-convertible': 0,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_extraData': {
                rowSpan: {
                    'none': 2,
                    'text': 3
                }
            },
            '_number': false,
            '_button': false,
            'keyColumn': 11,
            'none': 1,
            'text': 1,
            'text-convertible': 1,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            'keyColumn': 12,
            'none': 2,
            'text': 2,
            'text-convertible': 2,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_number': false,
            '_button': false,
            'keyColumn': 13,
            'none': 3,
            'text': 3,
            'text-convertible': 3,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_number': true,
            '_button': true,
            'keyColumn': 14,
            'none': 4,
            'text': 4,
            'text-convertible': 4,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_number': false,
            '_button': false,
            'keyColumn': 15,
            'none': 5,
            'text': 5,
            'text-convertible': 5,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_number': false,
            '_button': false,
            'keyColumn': 16,
            'none': 6,
            'text': 6,
            'text-convertible': 6,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_number': false,
            '_button': false,
            'keyColumn': 17,
            'none': 7,
            'text': 7,
            'text-convertible': 7,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_extraData': {
                rowState: 'DISABLED'
            },
            '_number': false,
            '_button': false,
            'keyColumn': 18,
            'none': 8,
            'text': 8,
            'text-convertible': 8,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        },
        {
            '_extraData': {
                rowState: 'DISABLED_CHECK'
            },
            '_number': false,
            '_button': false,
            'keyColumn': 19,
            'none': 9,
            'text': 9,
            'text-convertible': 9,
            'select': 1,
            'checkbox': 1,
            'radio': 1,
            'hidden': 1
        }
    ];

    var rowList,
        dataModelInstance,
        columnModelInstance,
        grid = {};

    beforeEach(function() {
        rowList = $.extend(true, [], originalData);
        columnModelInstance = grid.columnModel = new Data.ColumnModel();
        columnModelInstance.set('columnModelList', columnModelList);
        dataModelInstance = new Data.RowList([], {
            grid: grid
        });
    });
    describe('RowList Collection 테스트', function() {
        describe('rowList set 시 parse 관련 로직을 테스트한다.', function() {
            describe('_baseFormat()', function() {
                describe('keyColumnName 이 존재하지 않을 때', function() {
                    it('extraData 가 없을때', function() {
                        var baseRow = dataModelInstance._baseFormat({
                                'none': 4,
                                'text': 4,
                                'text-convertible': 4,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            }, 0),
                            expectResult = {
                                'rowKey': 0,
                                '_button': false,
                                '_extraData': {
                                    rowSpan: null,
                                    rowState: null
                                },

                                'none': 4,
                                'text': 4,
                                'text-convertible': 4,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            };


                        expect(baseRow).toEqual(expectResult);
                    });
                    it('rowState가 CHECKED 일 때', function() {
                        var baseRow = dataModelInstance._baseFormat({
                                '_extraData': {
                                    rowState: 'CHECKED'
                                },
                                'none': 0,
                                'text': 0,
                                'text-convertible': 0,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            }, 0),
                            expectResult = {
                                'rowKey': 0,
                                '_button': true,
                                '_extraData': {
                                    rowSpan: null,
                                    rowState: 'CHECKED'
                                },
                                'none': 0,
                                'text': 0,
                                'text-convertible': 0,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            };


                        expect(baseRow).toEqual(expectResult);
                    });
                    it('rowSpan 이 존재할 때', function() {
                        var baseRow = dataModelInstance._baseFormat({
                                '_extraData': {
                                    rowSpan: {
                                        'none': 2,
                                        'text': 3,
                                        'text-convertible': 4,
                                        'select': 5,
                                        'checkbox': 6,
                                        'radio': 7
                                    }
                                },
                                'none': 1,
                                'text': 1,
                                'text-convertible': 1,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            }, 0),
                            expectResult = {
                                'rowKey': 0,
                                '_button': false,
                                '_extraData': {
                                    rowSpan: {
                                        'none': 2,
                                        'text': 3,
                                        'text-convertible': 4,
                                        'select': 5,
                                        'checkbox': 6,
                                        'radio': 7
                                    },
                                    rowState: null
                                },
                                'none': 1,
                                'text': 1,
                                'text-convertible': 1,
                                'select': 1,
                                'checkbox': 1,
                                'radio': 1,
                                'hidden': 1
                            };
                        expect(baseRow).toEqual(expectResult);
                    });


                });
                describe('keyColumnName 이 설정되어 있다면', function() {
                    it('keyColumnName 이 설정되어 있다면 rowKey 는 keyColumn 에 해당하는 값으로 설정된다.', function() {
                        columnModelInstance.set('keyColumnName', 'none');
                        var baseRow = dataModelInstance._baseFormat({
                            'none': 4,
                            'text': 4,
                            'text-convertible': 4,
                            'select': 1,
                            'checkbox': 1,
                            'radio': 1,
                            'hidden': 1
                        }, 0);
                        expect(baseRow.rowKey).toEqual(4);
                    });
                });

            });
            describe('_setExtraRowSpanData()', function() {
                it('자신과 자식 row 까지 rowSpanData를 잘 설정하는지 확인한다.', function() {
                    var testList = [
                        {
                            '_extraData': {
                                'rowSpan': {
                                    'none': 2,
                                    'text': 3
                                }
                            },
                            rowKey: 0
                        },
                        {
                            rowKey: 1
                        },
                        {
                            rowKey: 2
                        }
                    ];
                    var formattedList = dataModelInstance._setExtraRowSpanData(testList, 0);
                    expect(formattedList[0]['_extraData']['rowSpanData']).toEqual({
                        'none': {
                            count: 2,
                            isMainRow: true,
                            mainRowKey: 0
                        },
                        'text': {
                            count: 3,
                            isMainRow: true,
                            mainRowKey: 0
                        }
                    });
                    expect(formattedList[1]['_extraData']['rowSpanData']).toEqual({
                        'none': {
                            count: -1,
                            isMainRow: false,
                            mainRowKey: 0
                        },
                        'text': {
                            count: -1,
                            isMainRow: false,
                            mainRowKey: 0
                        }
                    });
                    expect(formattedList[2]['_extraData']['rowSpanData']).toEqual({
                        'text': {
                            count: -2,
                            isMainRow: false,
                            mainRowKey: 0
                        }
                    });
                });
            });

        });
        describe('original Data 시리즈', function() {
            beforeEach(function() {
                dataModelInstance.set(rowList, {
                    parse: true
                });
            });
            describe('getOriginalRowList()', function() {
                it('set 에서 parse 후 originalRowList 가 정상적으로 생성되었는지 확인한다.', function() {
                    var expectResult = dataModelInstance._formatData(originalData);
                    expect(dataModelInstance.toJSON()).toEqual(expectResult);
                    //데이터 변경
                    dataModelInstance.get(0).set('none', '2222');
                    expect(dataModelInstance.toJSON()).not.toEqual(expectResult);
                    expect(dataModelInstance.getOriginalRowList()).toEqual(expectResult);
                });
            });
            describe('getOriginalRow()', function() {
                it('set 에서 parse 후 originalRowList 가 정상적으로 생성되었는지 확인한다.', function() {
                    var expectResultList = dataModelInstance._formatData(originalData);
                    expect(dataModelInstance.get(0).toJSON()).toEqual(expectResultList[0]);
                    dataModelInstance.at(0).set('none', '2222');
                    expect(dataModelInstance.get(0).toJSON()).not.toEqual(expectResultList[0]);
                    expect(dataModelInstance.getOriginalRow(0)).toEqual(expectResultList[0]);
                });
            });
            describe('getOriginal()', function() {
                it('set 에서 parse 후 originalRowList 가 정상적으로 생성되었는지 확인한다.', function() {
                    var expectResultList = dataModelInstance._formatData(originalData);

                    expect(dataModelInstance.get(0).get('none')).toBe(expectResultList[0]['none']);
                    //데이터 변경
                    dataModelInstance.at(0).set('none', '2222');
                    expect(dataModelInstance.get(0).get('none')).not.toBe(expectResultList[0]['none']);
                    expect(dataModelInstance.getOriginal(0, 'none')).toBe(expectResultList[0]['none']);
                });
            });
        });
        describe('indexOfRowKey()', function() {
            it('rowKey 를 인자로 index 를 알 수 있다.', function() {
                columnModelInstance.set('keyColumnName', 'keyColumn');
                dataModelInstance.set(rowList, {
                    parse: true
                });
                expect(dataModelInstance.indexOfRowKey(10)).toBe(0);
                expect(dataModelInstance.indexOfRowKey(11)).toBe(1);
                expect(dataModelInstance.indexOfRowKey(12)).toBe(2);
                expect(dataModelInstance.indexOfRowKey(1)).toBe(-1);
            });
        });
        describe('_isPrivateProperty()', function() {
            it('rowData 에서 내부용으로만 사용되는 데이터인지 확인한다.', function() {
                expect(dataModelInstance._isPrivateProperty('_button')).toBe(true);
                expect(dataModelInstance._isPrivateProperty('_number')).toBe(true);
                expect(dataModelInstance._isPrivateProperty('_extraData')).toBe(true);
                expect(dataModelInstance._isPrivateProperty('none')).toBe(false);
            });
        });
        describe('getRowList', function() {
            it('isRaw 옵션값이 설정되어 있으면 내부용 데이터를 제거하지 않고 반환한다.', function() {
                var myRowList;
                columnModelInstance.set({
                    hasNumberColumn: true,
                    selectType: 'checkbox'
                });
                dataModelInstance.set(rowList, {
                    parse: true
                });
                myRowList = dataModelInstance.getRowList();
                //            console.log(myRowList);
                expect(myRowList[0]['_button']).not.toBeDefined();
                expect(myRowList[0]['_extraData']).not.toBeDefined();
                expect(myRowList[0]['_number']).not.toBeDefined();

                myRowList = dataModelInstance.getRowList(false, true);
                //            console.log(myRowList);
                expect(myRowList[0]['_button']).toBeDefined();
                expect(myRowList[0]['_extraData']).toBeDefined();
                expect(myRowList[0]['_number']).toBeDefined();
            });

            it('isChecked 옵션값이 설정되어 있으면 checked 된 리스트만 반환한다.', function() {
                var myRowList;
                columnModelInstance.set({
                    hasNumberColumn: true,
                    selectType: 'checkbox'
                });
                dataModelInstance.set(rowList, {
                    parse: true
                });

                dataModelInstance.at(0).set('_button', true);
                dataModelInstance.at(2).set('_button', true);
                dataModelInstance.at(3).set('_button', true);

                myRowList = dataModelInstance.getRowList(true);
                expect(myRowList.length).toBe(3);
                expect(myRowList[1]['keyColumn']).toBe(12);
                expect(myRowList[1]['_extraData']).not.toBeDefined();


                myRowList = dataModelInstance.getRowList(true, true);
                expect(myRowList[1]['_extraData']).toBeDefined();
            });
        });
        describe('isSortedByField()', function() {
            it('현재 sorting 상태인지 확인할 수 있다.', function() {
                dataModelInstance.set(rowList, {
                    parse: true
                });
                expect(dataModelInstance.isSortedByField()).toBe(false);
                dataModelInstance.sortByField('none');
                expect(dataModelInstance.isSortedByField()).toBe(true);
                dataModelInstance.sortByField('rowKey');
                expect(dataModelInstance.isSortedByField()).toBe(false);
            });
        });

    });



    describe('RowList Model 테스트', function() {

        describe('getRowState()', function() {
            var testList, rowState;

            beforeEach(function() {
                testList = [
                    {},
                    {
                        '_extraData': {
                            'rowState': 'CHECKED'
                        }
                    },
                    {
                        '_extraData': {
                            'rowState': 'DISABLED'
                        }
                    },
                    {
                        '_extraData': {
                            'rowState': 'DISABLED_CHECK'
                        }
                    },
                    {}
                ];
                dataModelInstance.set(testList, {
                    parse: true
                });
            });
            it('데이터는 항상 동일한 포멧이다.', function() {

                rowState = dataModelInstance.get(0).getRowState();
                expect(rowState.isDisabled).toBeDefined();
                expect(rowState.isDisabledCheck).toBeDefined();
                expect(rowState.isChecked).toBeDefined();
                expect(rowState.classNameList).toBeDefined();

                rowState = dataModelInstance.get(1).getRowState();
                expect(rowState.isDisabled).toBeDefined();
                expect(rowState.isDisabledCheck).toBeDefined();
                expect(rowState.isChecked).toBeDefined();
                expect(rowState.classNameList).toBeDefined();
            });
            it('아무 값이 없을 때', function() {
                rowState = dataModelInstance.get(0).getRowState();
                expect(rowState.isDisabled).toBe(false);
                expect(rowState.isDisabledCheck).toBe(false);
                expect(rowState.isChecked).toBe(false);
                expect(rowState.classNameList).toEqual([]);
            });
            it('CHECKED 일 때', function() {
                rowState = dataModelInstance.get(1).getRowState();
                expect(rowState.isDisabled).toBe(false);
                expect(rowState.isDisabledCheck).toBe(false);
                expect(rowState.isChecked).toBe(true);
                expect(rowState.classNameList).toEqual([]);
            });
            it('DISABLED 일 때', function() {
                rowState = dataModelInstance.get(2).getRowState();
                expect(rowState.isDisabled).toBe(true);
                expect(rowState.isDisabledCheck).toBe(true);
                expect(rowState.isChecked).toBe(false);
                expect(rowState.classNameList).toEqual(['disabled']);
            });
            it('DISABLED_CHECK 일 때', function() {
                rowState = dataModelInstance.get(3).getRowState();
                expect(rowState.isDisabled).toBe(false);
                expect(rowState.isDisabledCheck).toBe(true);
                expect(rowState.isChecked).toBe(false);
                expect(rowState.classNameList).toEqual([]);
            });
        });
        describe('getRowSpanData()', function() {
            var testList,
                rowSpanData;
            beforeEach(function() {
                testList = [
                    {},
                    {
                        '_extraData': {
                            'rowSpan': {
                                'none': 2,
                                'text': 3
                            }
                        }
                    },
                    {},
                    {},
                    {},
                    {
                        '_extraData': {
                            'rowSpan': {
                                'none': 4
                            }
                        }
                    },
                    {},
                    {},
                    {},
                    {}
                ];
                dataModelInstance.set(testList, {
                    parse: true
                });
            });
            it('columnName 인자가 존재할 경우 항상 같은 형태의 데이터를 리턴한다.', function() {
                rowSpanData = dataModelInstance.get(1).getRowSpanData('text');
                expect(rowSpanData['count']).toBeDefined();
                expect(rowSpanData['isMainRow']).toBeDefined();
                expect(rowSpanData['mainRowKey']).toBeDefined();
                rowSpanData = dataModelInstance.get(1).getRowSpanData('none');
                expect(rowSpanData['count']).toBeDefined();
                expect(rowSpanData['isMainRow']).toBeDefined();
                expect(rowSpanData['mainRowKey']).toBeDefined();
                rowSpanData = dataModelInstance.get(0).getRowSpanData('text');
                expect(rowSpanData['count']).toBeDefined();
                expect(rowSpanData['isMainRow']).toBeDefined();
                expect(rowSpanData['mainRowKey']).toBeDefined();
                rowSpanData = dataModelInstance.get(0).getRowSpanData('none');
                expect(rowSpanData['count']).toBeDefined();
                expect(rowSpanData['isMainRow']).toBeDefined();
                expect(rowSpanData['mainRowKey']).toBeDefined();
            });

            describe('sort 가 되지 않았을 경우', function() {
                it('columnName 파라미터가 설정되었을 경우 정상적 동작 확인한다.', function() {
                    expect(dataModelInstance.get(1).getRowSpanData('none')).toEqual({
                        count: 2,
                        isMainRow: true,
                        mainRowKey: 1
                    });
                    expect(dataModelInstance.get(2).getRowSpanData('none')).toEqual({
                        count: -1,
                        isMainRow: false,
                        mainRowKey: 1
                    });
                    expect(dataModelInstance.get(3).getRowSpanData('none')).toEqual({
                        count: 0,
                        isMainRow: true,
                        mainRowKey: 3
                    });
                });
                it('columnName 파라미터가 설정되지 않은 경우 row에 해당하는 데이터를 MAP 형태로 반환한다.', function() {
                    expect(dataModelInstance.get(1).getRowSpanData()).toEqual({
                        'none': {
                            'count': 2,
                            'isMainRow': true,
                            'mainRowKey': 1
                        },
                        'text': {
                            'count': 3,
                            'isMainRow': true,
                            'mainRowKey': 1
                        }
                    });
                    expect(dataModelInstance.get(2).getRowSpanData()).toEqual({
                        'none': {
                            'count': -1,
                            'isMainRow': false,
                            'mainRowKey': 1
                        },
                        'text': {
                            'count': -1,
                            'isMainRow': false,
                            'mainRowKey': 1
                        }
                    });
                    expect(dataModelInstance.get(3).getRowSpanData()).toEqual({
                        'text': {
                            'count': -2,
                            'isMainRow': false,
                            'mainRowKey': 1
                        }
                    });
                });
            });
            describe('sort 가 되었을 경우 ', function() {
                beforeEach(function() {
                    dataModelInstance.sortByField('none');
                });
                it('columnName 파라미터가 설정되었을 경우 정상적 동작 확인한다.', function() {
                    expect(dataModelInstance.get(1).getRowSpanData('none')).toEqual({
                        count: 0,
                        isMainRow: true,
                        mainRowKey: 1
                    });
                    expect(dataModelInstance.get(2).getRowSpanData('none')).toEqual({
                        count: 0,
                        isMainRow: true,
                        mainRowKey: 2
                    });
                });
                it('columnName 파라미터가 설정되지 않은 경우 Null 을 반환한다.', function() {
                    expect(dataModelInstance.get(1).getRowSpanData()).toBeNull();
                    expect(dataModelInstance.get(2).getRowSpanData()).toBeNull();
                });
            });
        });
        describe('getHTMLEncodedString()', function() {
            var testString, sampleList;
            beforeEach(function() {
                testString = 'test <script>alert("test");</script>&nbsp; string';
                sampleList = [{
                    'notUseHtmlEntity': testString,
                    'none': testString
                }];
                dataModelInstance.set(sampleList, {parse: true});
            });
            it('일반적인 경우 - columnModel 에 notUseHtmlEntity 설정이 없음', function() {
                var result = dataModelInstance.at(0).getHTMLEncodedString('none'),
                    expectResult = 'test &lt;script&gt;alert(&quot;test&quot;);&lt;/script&gt;&amp;nbsp; string';
                expect(result).toEqual(expectResult);

            });
            it('columnModel 에 notUseHtmlEntity 활성화', function() {
                var result = dataModelInstance.at(0).getHTMLEncodedString('notUseHtmlEntity');
                expect(result).toEqual(testString);

            });

        });
        describe('_getListTypeVisibleText()', function() {
            it('List Type 의 경우 columnModel 의 editOptionList 에 정의된 Text 를 반환한다.', function() {
                var sampleList = [{
                        'select': 1,
                        'radio': 2,
                        'checkbox': '1,2,3',
                        'none': 1
                    }],
                    row;
                dataModelInstance.set(sampleList, {parse: true});
                row = dataModelInstance.at(0);

                expect(row._getListTypeVisibleText('select')).toBe('text1');
                expect(row._getListTypeVisibleText('radio')).toBe('text2');
                expect(row._getListTypeVisibleText('checkbox')).toBe('text1,text2,text3');
                expect(row._getListTypeVisibleText('none')).not.toBeDefined();
            });
            it('changeOptionList Relation 이 걸려있을 경우에도 정상 동작하는지 확인한다.', function() {
                var sampleList = [{
                        'relationOptionList': true,
                        'select': 1,
                        'radio': 2,
                        'radioNoRelation': 2,
                        'checkbox': '1,2,3',
                        'none': 1
                    }],
                    row;
                dataModelInstance.set(sampleList, {parse: true});
                row = dataModelInstance.at(0);

                expect(row._getListTypeVisibleText('select')).toBe('하나');
                expect(row._getListTypeVisibleText('radio')).toBe('둘');
                expect(row._getListTypeVisibleText('checkbox')).toBe('하나,둘,셋');
                expect(row._getListTypeVisibleText('radioNoRelation')).toBe('text2');
            });
        });
        describe('getVisibleText()', function() {
            it('copy & paste 기능을 사용할 때 정상적으로 텍스트를 반환한다.', function() {
                var sampleList = [{
                        'none': 'nope',
                        'hasFormatter': '<script>alert("test");</script>',
                        'notUseHtmlEntity': '<html></html>',
                        'relationOptionList': false,
                        'text': 'text',
                        'text-convertible': 'convertible-text',
                        'select': 1,
                        'radio': 2,
                        'checkbox': '1,2,3',
                        'radioNoRelation': 2,
                        'hidden': 1
                    },{
                        'none': 'nope',
                        'hasFormatter': '<script>alert("test");</script>',
                        'notUseHtmlEntity': '<html></html>',
                        'relationOptionList': true,
                        'text': 'text',
                        'text-convertible': 'convertible-text',
                        'select': 1,
                        'radio': 2,
                        'checkbox': '1,2,3',
                        'radioNoRelation': 2,
                        'hidden': 1
                    }],
                    row;
                dataModelInstance.set(sampleList, {parse: true});
                row = dataModelInstance.at(0);

                expect(row.getVisibleText('none')).toBe('nope');
                expect(row.getVisibleText('hasFormatter')).toBe('<script>alert("test");</script> click');
                expect(row.getVisibleText('notUseHtmlEntity')).toBe('<html></html>');
                expect(row.getVisibleText('relationOptionList')).toBe('false');
                expect(row.getVisibleText('text')).toBe('text');
                expect(row.getVisibleText('text-convertible')).toBe('convertible-text');
                expect(row.getVisibleText('select')).toBe('text1');
                expect(row.getVisibleText('radio')).toBe('text2');
                expect(row.getVisibleText('checkbox')).toBe('text1,text2,text3');
                expect(row.getVisibleText('radioNoRelation')).toBe('text2');
                expect(row.getVisibleText('hidden')).toBe('1');

                row = dataModelInstance.at(1);
                expect(row.getVisibleText('none')).toBe('nope');
                expect(row.getVisibleText('hasFormatter')).toBe('<script>alert("test");</script> click');
                expect(row.getVisibleText('notUseHtmlEntity')).toBe('<html></html>');
                expect(row.getVisibleText('relationOptionList')).toBe('true');
                expect(row.getVisibleText('text')).toBe('text');
                expect(row.getVisibleText('text-convertible')).toBe('convertible-text');
                expect(row.getVisibleText('select')).toBe('하나');
                expect(row.getVisibleText('radio')).toBe('둘');
                expect(row.getVisibleText('checkbox')).toBe('하나,둘,셋');
                expect(row.getVisibleText('radioNoRelation')).toBe('text2');
                expect(row.getVisibleText('hidden')).toBe('1');
            });
        });
        describe('getRelationResult()', function() {
            var sampleList, row;
            beforeEach(function() {
                sampleList = [{
                    'relationOptionList': false,
                    'select': 1,
                    'radio': 2,
                    'checkbox': '1,2,3',
                    'radioNoRelation': 2
                },{
                    'relationOptionList': true,
                    'select': 1,
                    'radio': 2,
                    'checkbox': '1,2,3',
                    'radioNoRelation': 2
                }];
                dataModelInstance.set(sampleList, {parse: true});
            });
            it('relation 수행 결과를 정확하게 반환한다.', function() {
                row = dataModelInstance.at(0);
                expect(row.getRelationResult()).toEqual({
                    select: {
                        optionList: undefined
                    },
                    checkbox: {
                        optionList: undefined
                    },
                    radio: {
                        optionList: undefined
                    },
                    text: { isDisabled: true, isEditable: false }
                });

                row = dataModelInstance.at(1);
                expect(row.getRelationResult()).toEqual({
                    select: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    checkbox: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    radio: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    text: { isDisabled: false, isEditable: true }
                });
            });
            it('원하는 callbackNameList 에 맞게 relationResult 를 반환한다.', function() {
                row = dataModelInstance.at(1);
                expect(row.getRelationResult(['optionListChange'])).toEqual({
                    select: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    checkbox: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    radio: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    }
                });

                expect(row.getRelationResult(['optionListChange', 'isEditable'])).toEqual({
                    select: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    checkbox: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    radio: {
                        optionList: [
                            { text: '하나', value: 1},
                            { text: '둘', value: 2},
                            { text: '셋', value: 3},
                            { text: '넷', value: 4}
                        ]
                    },
                    text: { isEditable: true }
                });
                expect(row.getRelationResult(['isEditable'])).toEqual({
                    text : { isEditable : true }
                });
                expect(row.getRelationResult(['isEditable', 'isDisable'])).toEqual({
                    text: { isDisabled: false, isEditable: true }
                });
            });
        });
        describe('_syncRowSpannedData()', function() {

        });
        describe('_executeChangeBeforeCallback()', function() {

        });
        describe('_executeChangeAfterCallback()', function() {

        });
    });
});
