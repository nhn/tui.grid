'use strict';

var _ = require('underscore');
var ColumnModelData = require('model/data/columnModel');
var frameConst = require('common/constMap').frame;

describe('data.columnModel', function() {
    var columnModelInstance;
    var rowHeadersData, columnsData;

    beforeEach(function() {
        columnModelInstance = new ColumnModelData();
        rowHeadersData = [
            {
                title: '_number',
                name: '_number'
            },
            {
                title: '_button',
                name: '_button',
                type: 'checkbox'
            }
        ];
        columnsData = [
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
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }, {
                        text: 'text3',
                        value: 3
                    }, {
                        text: 'text4',
                        value: 4
                    }]
                }
            },
            {
                title: 'checkbox',
                name: 'checkbox',
                editOptions: {
                    type: 'checkbox',
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }, {
                        text: 'text3',
                        value: 3
                    }, {
                        text: 'text4',
                        value: 4
                    }]
                }
            },
            {
                title: 'radio',
                name: 'radio',
                editOptions: {
                    type: 'radio',
                    list: [{
                        text: 'text1',
                        value: 1
                    }, {
                        text: 'text2',
                        value: 2
                    }, {
                        text: 'text3',
                        value: 3
                    }, {
                        text: 'text4',
                        value: 4
                    }]
                }
            },
            {
                title: 'hidden',
                name: 'hidden',
                hidden: true
            }
        ];
    });

    describe('getEditType()', function() {
        it('컬럼모델에 정의된 editType 속성값을 반환한다. 없다면 normal을 반환한다.', function() {
            columnModelInstance.set({
                columns: columnsData
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
            columnsData = [
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
                columns: columnsData
            });

            expect(columnModelInstance.isLside('_button')).toBe(false);
            expect(columnModelInstance.isLside('_number')).toBe(false);
            expect(columnModelInstance.isLside('column2')).toBe(true);
            expect(columnModelInstance.isLside('column3')).toBe(true);
            expect(columnModelInstance.isLside('column4')).toBe(false);
            expect(columnModelInstance.isLside('column5')).toBe(false);
        });
    });

    it('indexOfColumnName() should return index caclulated except hidden columns.', function() {
        columnsData = [
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
            columns: columnsData
        });

        expect(columnModelInstance.indexOfColumnName('column2', true)).toBe(0);
        expect(columnModelInstance.indexOfColumnName('column3', true)).toBe(1);
        expect(columnModelInstance.indexOfColumnName('column4', true)).toBe(2);

        expect(columnModelInstance.indexOfColumnName('column5', true)).toBe(-1);
        expect(columnModelInstance.indexOfColumnName('column5', false)).toBe(3);
    });

    describe('at() 의 동작을 확인한다.', function() {
        beforeEach(function() {
            columnsData = [
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
                columns: columnsData
            });
        });

        it('isVisible 이 기본값 (=false) 라면 실제 보이는 컬럼일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0)).toEqual(columnsData[0]);
            expect(columnModelInstance.at(1)).toEqual(columnsData[1]);
            expect(columnModelInstance.at(2)).toEqual(columnsData[2]);
            expect(columnModelInstance.at(3)).toEqual(columnsData[3]);
            expect(columnModelInstance.at(4)).toEqual(columnsData[4]);
            expect(columnModelInstance.at(5)).toEqual(columnsData[5]);
        });

        it('isVisible: true 일 때 정상동작 하는지 확인한다.', function() {
            expect(columnModelInstance.at(0, true)).toEqual(columnsData[2]);
            expect(columnModelInstance.at(1, true)).toEqual(columnsData[3]);
            expect(columnModelInstance.at(2, true)).toEqual(columnsData[4]);

            expect(columnModelInstance.at(3, true)).not.toBeDefined();
            expect(columnModelInstance.at(4, true)).not.toBeDefined();
            expect(columnModelInstance.at(5, true)).not.toBeDefined();
            expect(columnModelInstance.at(6, true)).not.toBeDefined();
            expect(columnModelInstance.at(7, true)).not.toBeDefined();
        });
    });

    // @todo TC추가: whichSdie, withMeta - option args
    describe('getVisibleColumns()', function() {
        beforeEach(function() {
            columnsData = [
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
                columns: columnsData,
                frozenCount: 4
            });
        });

        it('should return visible columns except row headers.', function() {
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
            columnsData = [
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
                rowHeaders: ['rowNum', 'checkbox'],
                columns: columnsData,
                frozenCount: 2
            });
            expect(columnModelInstance.getColumnModel('_button')).not.toBe(null);
            expect(columnModelInstance.getColumnModel('_number')).not.toBe(null);

            expect(columnModelInstance.getColumnModel('column0')).toEqual(columnsData[0]);
            expect(columnModelInstance.getColumnModel('column1')).toEqual(columnsData[1]);
            expect(columnModelInstance.getColumnModel('column2')).toEqual(columnsData[2]);
            expect(columnModelInstance.getColumnModel('column3')).toEqual(columnsData[3]);
            expect(columnModelInstance.getColumnModel('column4')).toEqual(columnsData[4]);
            expect(columnModelInstance.getColumnModel('column5')).toEqual(columnsData[5]);
        });
    });

    describe('_getRelationListMap()', function() {
        it('각 columnModel 의 relations 를 모아 주체가 되는 name 기준으로 relationsMap 를 생성하여 반환한다.', function() {
            var expectResult, relationsMap;

            columnsData = [
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
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
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
                'column0': columnsData[0].relations,
                'column2': columnsData[2].relations
            };
            relationsMap = columnModelInstance._getRelationListMap(columnsData);
            expect(relationsMap).toEqual(expectResult);
        });
    });

    describe('isTextType()', function() {
        it('textType 인지 확인한다.', function() {
            columnModelInstance.set({
                columns: columnsData
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
            columnsData = [
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
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
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
                columns: columnsData,
                rowHeaders: ['rowNum', 'checkbox']
            });
        });

        describe('columns가 정상적으로 가공되었는지 확인한다.', function() {
            it('rowNum, checkbox 가 생성 되었는지 확인한다.', function() {
                var columns = columnModelInstance.get('rowHeaders');
                var length = columns.length;

                expect(length).toBe(2);
            });
        });

        it('columnModelMap이 정상적으로 가공되었는지 확인한다.', function() {
            var dataColumns = columnModelInstance.get('dataColumns');
            var rowHeaders = columnModelInstance.get('rowHeaders');
            var columnModelMap = columnModelInstance.get('columnModelMap');
            var expectResult = _.indexBy(_.union(rowHeaders, dataColumns), 'name');

            expect(columnModelMap).toEqual(expectResult);
        });

        it('relationListMap가 저장 되었는지 확인한다.', function() {
            var relationsMap = columnModelInstance.get('relationsMap'),
                expectResult = {
                    'column0': columnsData[0].relations,
                    'column2': columnsData[2].relations
                };

            expect(_.isEqual(relationsMap, expectResult)).toBe(true);
        });

        it('frozenCount가 저장 되었는지 확인한다.', function() {
            expect(columnModelInstance.get('frozenCount')).toEqual(2);
        });

        it('visibleColumns 저장 되었는지 확인한다.', function() {
            var visibleColumns = columnModelInstance.get('visibleColumns');

            expect(visibleColumns.length).toBe(5);
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
            expect(columnModelInstance.get('columnModelMap').column3.hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap').column4.hidden).toBe(true);

            columnModelInstance.setHidden(['column1', 'column2', 'column3', 'column4'], false);
            expect(columnModelInstance.get('columnModelMap').column1.hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap').column2.hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap').column3.hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap').column4.hidden).toBe(false);

            columnModelInstance.setHidden(['merge1', 'column3'], true);
            expect(columnModelInstance.get('columnModelMap').column1.hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap').column2.hidden).toBe(true);
            expect(columnModelInstance.get('columnModelMap').column3.hidden).toBe(true);

            columnModelInstance.setHidden(['merge1', 'column3'], false);
            expect(columnModelInstance.get('columnModelMap').column1.hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap').column2.hidden).toBe(false);
            expect(columnModelInstance.get('columnModelMap').column3.hidden).toBe(false);
        });
    });

    describe('columFixCount', function() {
        beforeEach(function() {
            columnsData = [
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
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
                            }
                        },
                        {
                            targetNames: ['column5'],
                            listItems: function(value) {
                                if (value === 2) {
                                    return [{
                                        text: '하나',
                                        value: 1
                                    }, {
                                        text: '둘',
                                        value: 2
                                    }, {
                                        text: '셋',
                                        value: 3
                                    }, {
                                        text: '넷',
                                        value: 4
                                    }];
                                }

                                return false;
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
                columns: columnsData
            });
        });

        it('visibleColumnFixCount를 확인한다', function() {
            var count = columnModelInstance.getVisibleFrozenCount();

            expect(count).toEqual(2);
        });
    });

    describe('_getRowHeadersData', function() {
        var defaultRowHeaders = ColumnModelData._defaultRowHeaders;
        var options;

        it('when the options is empty, the row header data have empty array.', function() {
            rowHeadersData = columnModelInstance._getRowHeadersData([]);
            expect(rowHeadersData.length).toBe(0);
        });

        it('when options have string value, the row header data is object of matching type.', function() {
            rowHeadersData = columnModelInstance._getRowHeadersData(['rowNum']);
            expect(rowHeadersData[0]).toEqual(defaultRowHeaders.rowNum);

            rowHeadersData = columnModelInstance._getRowHeadersData(['checkbox']);
            expect(rowHeadersData[0]).toEqual(defaultRowHeaders.checkbox);

            rowHeadersData = columnModelInstance._getRowHeadersData(['radio']);
            expect(rowHeadersData[0]).toEqual(defaultRowHeaders.radio);
        });

        it('when the options have object value, ' +
            'the row header data is overwrite as object of matching type.', function() {
            options = [
                {
                    type: 'rowNum',
                    title: 'Row Number',
                    align: 'left',
                    width: 10
                },
                {
                    type: 'radio',
                    title: 'test'
                }
            ];

            rowHeadersData = columnModelInstance._getRowHeadersData(options);

            expect(rowHeadersData[0].title).toEqual(options[0].title);
            expect(rowHeadersData[0].align).toEqual(options[0].align);
            expect(rowHeadersData[0].width).toEqual(options[0].width);

            expect(rowHeadersData[1].title).toEqual(options[1].title);
        });

        it('when the options have both "checkbox" and "radio", ' +
            'the row headers data only has the latest input.', function() {
            options = ['checkbox', 'radio'];
            rowHeadersData = columnModelInstance._getRowHeadersData(options);

            expect(rowHeadersData[0].type).toBe('checkbox');

            options = ['radio', 'rowNum', 'checkbox'];
            rowHeadersData = columnModelInstance._getRowHeadersData(options);

            expect(rowHeadersData[0].type).toBe('radio');
            expect(rowHeadersData[1].type).toBe('rowNum');
        });

        it('When the type of option is checkbox and the option has template, ' +
            'the title is replaced by template.', function() {
            var replacedHtml = '<input type="checkbox">';

            options = [
                {
                    type: 'checkbox',
                    template: function() {
                        return replacedHtml;
                    }
                }
            ];

            rowHeadersData = columnModelInstance._getRowHeadersData(options);

            expect(rowHeadersData[0].title).toBe(replacedHtml);
        });
    });

    describe('copyVisibleTextOfEditingColumn', function() {
        var result;

        beforeEach(function() {
            columnsData = [
                {
                    name: 'column0'
                },
                {
                    name: 'column1',
                    editOptions: {
                        type: 'select',
                        listItems: [{
                            text: 'Deluxe',
                            value: '1'
                        }, {
                            text: 'EP',
                            value: '2'
                        }, {
                            text: 'Single',
                            value: '3'
                        }]
                    }
                },
                {
                    name: 'column2',
                    copyOptions: {
                        useListItemText: true
                    },
                    editOptions: {
                        type: 'checkbox',
                        listItems: [{
                            text: 'Pop',
                            value: '1'
                        }, {
                            text: 'Rock',
                            value: '2'
                        }, {
                            text: 'R&B',
                            value: '3'
                        }, {
                            text: 'Electronic',
                            value: '4'
                        }, {
                            text: 'etc.',
                            value: '5'
                        }]
                    }
                }
            ];
            columnModelInstance.set('columns', columnsData);
        });

        it('when "editOptions" is not set, the result is false.', function() {
            result = columnModelInstance.copyVisibleTextOfEditingColumn('column0');
            expect(result).toEqual(false);
        });

        it('when "copyOptions.useListItemText" option is not set, the result is false.', function() {
            result = columnModelInstance.copyVisibleTextOfEditingColumn('column1');
            expect(result).toEqual(false);
        });

        it('when "copyOptions.useListItemText" option is set, the result is true.', function() {
            result = columnModelInstance.copyVisibleTextOfEditingColumn('column2');
            expect(result).toEqual(true);
        });
    });
});
