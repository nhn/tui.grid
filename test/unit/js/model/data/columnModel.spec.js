'use strict';

var _ = require('underscore');
var ColumnModelData = require('model/data/columnModel');
var frameConst = require('common/constMap').frame;

describe('data.columnModel', function() {
    var columnModelInstance,
        sampleColumns,
        expectedColumnModel;

    beforeEach(function() {
        columnModelInstance = new ColumnModelData();
        sampleColumns = [
            {
                title: '_number',
                name: '_number'
            },
            {
                title: '_button',
                name: '_button'
            },
            {
                title: 'none',
                name: 'none'
            },
            {
                title: 'text',
                name: 'text',
                editOptions: {
                    type: 'text'
                }
            },
            {
                title: 'text-convertible',
                name: 'text-convertible',
                editOptions: {
                    type: 'text-convertible'
                }
            },
            {
                title: 'select',
                name: 'select',
                editOptions: {
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
                name: 'checkbox',
                editOptions: {
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
                name: 'radio',
                editOptions: {
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
                name: 'hidden',
                hidden: true
            }
        ];
    });

    describe('_extendColumns', function() {
        var length;

        beforeEach(function() {
            length = sampleColumns.length;
        });

        it('columnName에 해당하는 컬럼 모델이 존재하지 않는다면, 해당 리스트에 push 한다.', function() {
            var newLength;
            expectedColumnModel = {
                name: 'not_exist',
                title: 'Not exist column.',
                width: 60
            };
            columnModelInstance._extendColumns(expectedColumnModel, sampleColumns);

            newLength = sampleColumns.length;
            expect(newLength).toBe(length + 1);
            expect(sampleColumns[newLength - 1]).toEqual(expectedColumnModel);
        });

        it('columnName에 해당하는 컬럼 모델이 존재한다면, 해당 컬럼 모델을 확장한다.', function() {
            var sampleColumn = {
                name: 'none',
                title: 'exist column.',
                width: 300
            };
            columnModelInstance._extendColumns(sampleColumn, sampleColumns);
            expectedColumnModel = $.extend(sampleColumn, _.findWhere(sampleColumns, {name: 'none'}));

            expect(sampleColumns.length).toBe(length);
            expect(_.findWhere(sampleColumns, {name: 'none'})).toEqual(expectedColumnModel);
        });
    });

    describe('_initializeNumberColumn()', function() {
        it('hasNumberColumn: false라면 _number 컬럼의 hidden 프로퍼티를 true로 설정한다.', function() {
            expectedColumnModel = {
                name: '_number',
                align: 'center',
                fixedWidth: true,
                title: 'No.',
                width: 60,
                hidden: true
            };

            columnModelInstance.set('hasNumberColumn', false, {silent: true});
            columnModelInstance._initializeNumberColumn(sampleColumns);
            expect(_.findWhere(sampleColumns, {name: '_number'})).toEqual(expectedColumnModel);
        });

        it('hasNumberColumn: true일 때 _number 컬럼이 정상적으로 생성된다.', function() {
            expectedColumnModel = {
                name: '_number',
                align: 'center',
                fixedWidth: true,
                title: 'No.',
                width: 60
            };

            columnModelInstance.set('hasNumberColumn', true, {silent: true});
            columnModelInstance._initializeNumberColumn(sampleColumns);
            expect(_.findWhere(sampleColumns, {name: '_number'})).toEqual(expectedColumnModel);
        });
    });

    describe('_initializeButtonColumn()', function() {
        it('selectType: checkbox 일 때 ', function() {
            var selectType = 'checkbox';
            expectedColumnModel = {
                title: '<input type="checkbox"/>',
                name: '_button',
                align: 'center',
                hidden: false,
                fixedWidth: true,
                editOptions: {
                    type: 'mainButton'
                },
                width: 40
            };
            columnModelInstance.set('selectType', selectType, {silent: true});
            columnModelInstance._initializeButtonColumn(sampleColumns);
            expect(_.findWhere(sampleColumns, {name: '_button'})).toEqual(expectedColumnModel);
        });

        it('selectType: radio 일 때', function() {
            var selectType = 'radio';
            expectedColumnModel = {
                title: '선택',
                name: '_button',
                align: 'center',
                hidden: false,
                fixedWidth: true,
                editOptions: {
                    type: 'mainButton'
                },
                width: 40
            };
            columnModelInstance.set('selectType', selectType, {silent: true});
            columnModelInstance._initializeButtonColumn(sampleColumns);
            expect(_.findWhere(sampleColumns, {name: '_button'})).toEqual(expectedColumnModel);
        });

        it('selectType 이 없을때 hidden: true 로 설정된다.', function() {
            var sampleColumnModel = {
                name: '_button',
                editOptions: {
                    type: '',
                    list: [{
                        value: 'selected'
                    }]
                },
                width: 40,
                fixedWidth: true,
                hidden: true
            };
            expectedColumnModel = $.extend(
                _.findWhere(sampleColumns, {name: '_button'}),
                sampleColumnModel
            );
            columnModelInstance.set('selectType', '', {silent: true});
            columnModelInstance._initializeButtonColumn(sampleColumns);
            expect(_.findWhere(sampleColumns, {name: '_button'})).toEqual(expectedColumnModel);
        });
    });

    describe('getEditType()', function() {
        it('컬럼모델에 정의된 editType 속성값을 반환한다. 없다면 normal을 반환한다.', function() {
            columnModelInstance.set({
                columns: sampleColumns
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
        it('hidden 이 아닌 컬럼 중 ColumnFixCount 기준으로 L side 여부를 판단한다.', function() {
            sampleColumns = [
                {
                    name: '_button',
                    hidden: true
                },
                {
                    name: '_number',
                    hidden: true
                },
                {
                    name: 'column2'
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                frozenCount: 2,
                columns: sampleColumns
            });

            expect(columnModelInstance.isLside('_button')).toBe(false);
            expect(columnModelInstance.isLside('_number')).toBe(false);
            expect(columnModelInstance.isLside('column2')).toBe(true);
            expect(columnModelInstance.isLside('column3')).toBe(true);
            expect(columnModelInstance.isLside('column4')).toBe(false);
            expect(columnModelInstance.isLside('column5')).toBe(false);
        });
    });

    it('indexOfColumnName(), _number와 _button컬럼을 제외하고 계산한다.', function() {
        sampleColumns = [
            {
                name: '_button',
                hidden: true
            },
            {
                name: '_number',
                hidden: true
            },
            {
                name: 'column2'
            },
            {
                name: 'column3'
            },
            {
                name: 'column4'
            },
            {
                name: 'column5',
                hidden: true
            }
        ];
        columnModelInstance.set({
            columns: sampleColumns
        });

        expect(columnModelInstance.indexOfColumnName('column2', true)).toBe(0);
        expect(columnModelInstance.indexOfColumnName('column3', true)).toBe(1);
        expect(columnModelInstance.indexOfColumnName('column4', true)).toBe(2);

        expect(columnModelInstance.indexOfColumnName('column5', true)).toBe(-1);
        expect(columnModelInstance.indexOfColumnName('column5', false)).toBe(3);
    });

    describe('at() 의 동작을 확인한다.', function() {
        beforeEach(function() {
            sampleColumns = [
                {
                    name: 'column0',
                    hidden: true
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2'
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                columns: sampleColumns
            });
        });

        it('isVisible 이 기본값 (=false) 라면 실제 보이는 컬럼일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0)).toEqual(sampleColumns[0]);
            expect(columnModelInstance.at(1)).toEqual(sampleColumns[1]);
            expect(columnModelInstance.at(2)).toEqual(sampleColumns[2]);
            expect(columnModelInstance.at(3)).toEqual(sampleColumns[3]);
            expect(columnModelInstance.at(4)).toEqual(sampleColumns[4]);
            expect(columnModelInstance.at(5)).toEqual(sampleColumns[5]);
        });

        it('isVisible: true 일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0, true)).toEqual(sampleColumns[2]);
            expect(columnModelInstance.at(1, true)).toEqual(sampleColumns[3]);
            expect(columnModelInstance.at(2, true)).toEqual(sampleColumns[4]);

            expect(columnModelInstance.at(3, true)).not.toBeDefined();
            expect(columnModelInstance.at(4, true)).not.toBeDefined();
            expect(columnModelInstance.at(5, true)).not.toBeDefined();
            expect(columnModelInstance.at(6, true)).not.toBeDefined();
            expect(columnModelInstance.at(7, true)).not.toBeDefined();
        });
    });

    //@todo TC추가: whichSdie, withMeta - option args
    describe('getVisibleColumns()', function() {
        beforeEach(function() {
            sampleColumns = [
                {
                    name: '_button',
                    hidden: true
                },
                {
                    name: '_number',
                    hidden: true
                },
                {
                    name: 'column0',
                    hidden: true
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2'
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                columns: sampleColumns,
                frozenCount: 4
            });
        });

        it('_number, _button 을 제외하고 hidden: true 가 아닌 columns 를 반환한다.', function() {
            var visibleColumns;

            visibleColumns = columnModelInstance.getVisibleColumns();
            expect(visibleColumns.length).toBe(3);
        });

        it('whichSide 를 지정하지 않으면 전체 visibleColumns 를 반환한다.', function() {
            var expectList = [
                {name: 'column2'},
                {name: 'column3'},
                {name: 'column4'}
            ];
            var visibleColumns = columnModelInstance.getVisibleColumns();

            expect(visibleColumns).toEqual(expectList);
        });

        it('whichSide = L 이라면 L Side 의 visibleColumns 를 반환한다.', function() {
            var expectList = [
                {name: 'column2'},
                {name: 'column3'}
            ];
            var visibleColumns = columnModelInstance.getVisibleColumns(frameConst.L);

            expect(visibleColumns).toEqual(expectList);
        });

        it('whichSide = R 이라면 L Side 의 visibleColumns 를 반환한다.', function() {
            var expectList = [{name: 'column4'}];
            var visibleColumns = columnModelInstance.getVisibleColumns(frameConst.R);

            expect(visibleColumns).toEqual(expectList);
        });
    });

    describe('getColumnModel()', function() {
        it('name 에 해당하는 columnModel 을 반환한다.', function() {
            sampleColumns = [
                {
                    name: '_button',
                    hidden: true
                },
                {
                    name: '_number',
                    hidden: true
                },
                {
                    name: 'column0',
                    hidden: true
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2'
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                columns: sampleColumns,
                frozenCount: 2
            });
            //_button 과 _number 는 가공되었기 때문에, 인자로 넘긴 columnModel 과는 달라야 한다.
            expect(columnModelInstance.getColumnModel('_button')).not.toEqual(sampleColumns[0]);
            expect(columnModelInstance.getColumnModel('_number')).not.toEqual(sampleColumns[1]);

            expect(columnModelInstance.getColumnModel('column0')).toEqual(sampleColumns[2]);
            expect(columnModelInstance.getColumnModel('column1')).toEqual(sampleColumns[3]);
            expect(columnModelInstance.getColumnModel('column2')).toEqual(sampleColumns[4]);
            expect(columnModelInstance.getColumnModel('column3')).toEqual(sampleColumns[5]);
            expect(columnModelInstance.getColumnModel('column4')).toEqual(sampleColumns[6]);
            expect(columnModelInstance.getColumnModel('column5')).toEqual(sampleColumns[7]);
        });
    });

    describe('_getRelationListMap()', function() {
        it('각 columnModel 의 relations 를 모아 주체가 되는 name 기준으로 relationsMap 를 생성하여 반환한다.', function() {
            var expectResult, relationsMap;

            sampleColumns = [
                {
                    name: 'column0',
                    hidden: true,
                    relations: [
                        {
                            targetNames: ['column1', 'column5'],
                            disabled: function(value) {
                                return value === 2;
                            },
                            editable: function(value) {
                                return value !== 3;
                            }
                        },
                        {
                            targetNames: ['column2'],
                            disabled: function(value) {
                                return value === 2;
                            }
                        }
                    ]
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2',
                    relations: [
                        {
                            targetNames: ['column3', 'column4'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        }
                    ]
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];

            expectResult = {
                'column0': sampleColumns[0].relations,
                'column2': sampleColumns[2].relations
            };
            relationsMap = columnModelInstance._getRelationListMap(sampleColumns);
            expect(relationsMap).toEqual(expectResult);
        });
    });

    describe('isTextType()', function() {
        it('textType 인지 확인한다.', function() {
            columnModelInstance.set({
                columns: sampleColumns
            });
            expect(columnModelInstance.isTextType('none')).toBe(true);
            expect(columnModelInstance.isTextType('_number')).toBe(false);
            expect(columnModelInstance.isTextType('_button')).toBe(false);
            expect(columnModelInstance.isTextType('text')).toBe(true);
            expect(columnModelInstance.isTextType('password')).toBe(true);
            expect(columnModelInstance.isTextType('select')).toBe(false);
            expect(columnModelInstance.isTextType('checkbox')).toBe(false);
            expect(columnModelInstance.isTextType('radio')).toBe(false);
            expect(columnModelInstance.isTextType('hidden')).toBe(true);
        });
    });

    describe('_onChange, _setColumns(), setHidden()', function() {
        beforeEach(function() {
            sampleColumns = [
                {
                    name: 'column0',
                    hidden: true,
                    relations: [
                        {
                            targetNames: ['column1', 'column5'],
                            disalbed: function(value) {
                                return value === 2;
                            },
                            editable: function(value) {
                                return value !== 3;
                            }
                        },
                        {
                            targetNames: ['column2'],
                            disabled: function(value) {
                                return value === 2;
                            }
                        }
                    ]
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2',
                    relations: [
                        {
                            targetNames: ['column3', 'column4'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        }
                    ]
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                frozenCount: 2,
                hasNumberColumn: false,
                columns: sampleColumns
            });
        });

        describe('columns가 정상적으로 가공되었는지 확인한다.', function() {
            it('_button, _checkbox 가 생성 되었는지 확인한다.', function() {
                var columns = columnModelInstance.get('metaColumns');
                var length = columns.length;

                expect(length).toBe(2);
            });
        });

        it('columnModelMap이 정상적으로 가공되었는지 확인한다.', function() {
            var dataColumns = columnModelInstance.get('dataColumns');
            var metaColumns = columnModelInstance.get('metaColumns');
            var columnModelMap = columnModelInstance.get('columnModelMap');
            var expectResult = _.indexBy(_.union(metaColumns, dataColumns), 'name');

            expect(columnModelMap).toEqual(expectResult);
        });

        it('relationListMap가 저장 되었는지 확인한다.', function() {
            var relationsMap = columnModelInstance.get('relationsMap'),
                expectResult = {
                    'column0': sampleColumns[0].relations,
                    'column2': sampleColumns[2].relations
                };

            expect(_.isEqual(relationsMap, expectResult)).toBe(true);
        });

        it('frozenCount가 저장 되었는지 확인한다.', function() {
            expect(columnModelInstance.get('frozenCount')).toEqual(2);
        });

        it('visibleColumns 저장 되었는지 확인한다.', function() {
            var visibleColumns = columnModelInstance.get('visibleColumns'),
                expectResult = [
                    {
                        name: 'column2',
                        relations: sampleColumns[2].relations
                    },
                    {
                        name: 'column3'
                    },
                    {
                        name: 'column4'
                    }
                ];
            expect(_.isEqual(visibleColumns, expectResult)).toBe(true);
        });

        it('컬럼모델의 "hidden"속성이 동적으로 변경되는지 확인한다.', function() {
            columnModelInstance.set('complexHeaderColumns', [
                {
                    name: 'merge1',
                    title: 'merge1',
                    childNames: ['column1', 'column2']
                }
            ]);

            columnModelInstance.setHidden(['column3', 'column4'], true);
            expect(columnModelInstance.get('columnModelMap')['column3'].hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap')['column4'].hidden).toBe(true);

            columnModelInstance.setHidden(['column1', 'column2', 'column3', 'column4'], false);
            expect(columnModelInstance.get('columnModelMap')['column1'].hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap')['column2'].hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap')['column3'].hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap')['column4'].hidden).toBe(false);

            columnModelInstance.setHidden(['merge1', 'column3'], true);
            expect(columnModelInstance.get('columnModelMap')['column1'].hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap')['column2'].hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap')['column3'].hidden).toBe(true);

            columnModelInstance.setHidden(['merge1', 'column3'], false);
            expect(columnModelInstance.get('columnModelMap')['column1'].hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap')['column2'].hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap')['column3'].hidden).toBe(false);
        });
    });

    describe('columFixCount', function() {
        beforeEach(function() {
            sampleColumns = [
                {
                    name: 'column0',
                    relations: [
                        {
                            targetNames: ['column1', 'column5'],
                            disabled: function(value) {
                                return value === 2;
                            },
                            editable: function(value) {
                                return value !== 3;
                            }
                        },
                        {
                            targetNames: ['column2'],
                            disabled: function(value) {
                                return value === 2;
                            }
                        }
                    ]
                },
                {
                    name: 'column1',
                    hidden: true
                },
                {
                    name: 'column2',
                    relations: [
                        {
                            targetNames: ['column3', 'column4'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [
                                        {text: '하나', value: 1},
                                        {text: '둘', value: 2},
                                        {text: '셋', value: 3},
                                        {text: '넷', value: 4}
                                    ];
                                }
                            }
                        }
                    ]
                },
                {
                    name: 'column3'
                },
                {
                    name: 'column4'
                },
                {
                    name: 'column5',
                    hidden: true
                }
            ];
            columnModelInstance.set({
                frozenCount: 3,
                hasNumberColumn: true,
                selectType: 'checkbox',
                columns: sampleColumns
            });
        });

        it('visibleColumnFixCount를 확인한다', function() {
            var count = columnModelInstance.getVisibleFrozenCount();

            expect(count).toEqual(2);
        });
    });
});
