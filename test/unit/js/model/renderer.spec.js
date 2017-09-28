'use strict';

var $ = require('jquery');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Focus = require('model/focus');
var Dimension = require('model/dimension');
var CoordRow = require('model/coordRow');
var CoordColumn = require('model/coordColumn');
var Renderer = require('model/renderer');
var Model = require('base/model');
var frameConst = require('common/constMap').frame;

describe('model.renderer', function() {
    var columns = [
        {
            title: 'columnName1',
            name: 'columnName1'
        },
        {
            title: 'columnName2',
            name: 'columnName2',
            editOptions: {
                type: 'text'
            }
        },
        {
            title: 'columnName3',
            name: 'columnName3',
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
        },
        {
            title: 'columnName4',
            name: 'columnName4',
            editOptions: {
                type: 'checkbox',
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
        },
        {
            title: 'columnName5',
            name: 'columnName5',
            editOptions: {
                type: 'radio',
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
        },
        {
            title: 'columnName6',
            name: 'columnName6',
            relations: [
                {
                    targetNames: ['columnName3', 'columnName4', 'columnName5'],
                    listItems: function(value) {
                        if (value === true) {
                            return [
                                {
                                    text: '하나',
                                    value: 1
                                },
                                {
                                    text: '둘',
                                    value: 2
                                },
                                {
                                    text: '셋',
                                    value: 3
                                },
                                {
                                    text: '넷',
                                    value: 4
                                }
                            ];
                        }

                        return [];
                    }
                },
                {
                    targetNames: ['columnName2'],
                    disabled: function(value) {
                        return value === false;
                    },
                    editable: function(value) {
                        return value !== false;
                    }
                }

            ]
        },
        {
            title: 'columnName7',
            name: 'columnName7',
            hidden: true
        }
    ];
    var originalRows = [
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

    var columnModel, dataModel, renderModel, focusModel, dimensionModel, rowList;
    var coordRowModel, coordColumnModel;

    beforeEach(function() {
        rowList = $.extend(true, [], originalRows);
        columnModel = new ColumnModelData({
            rowHeaders: ['rowNum', 'checkbox'],
            frozenCount: 2,
            columns: columns
        });
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
        dimensionModel = new Dimension(null, {
            dataModel: dataModel,
            columnModel: columnModel
        });
        coordRowModel = new CoordRow(null, {
            dataModel: dataModel,
            dimensionModel: dimensionModel
        });
        coordColumnModel = new CoordColumn(null, {
            columnModel: columnModel,
            dimensionModel: dimensionModel
        });
        focusModel = new Focus(null, {
            dataModel: dataModel,
            columnModel: columnModel,
            dimensionModel: dimensionModel
        });
        renderModel = new Renderer(null, {
            columnModel: columnModel,
            dataModel: dataModel,
            focusModel: focusModel,
            dimensionModel: dimensionModel,
            coordRowModel: coordRowModel,
            coordColumnModel: coordColumnModel
        });
    });

    describe('initializeVariables()', function() {
        it('값들이 초기화 되는지 확인한다.', function() {
            renderModel.initializeVariables();
            expect(renderModel.get('top')).toEqual(0);
            expect(renderModel.get('scrollTop')).toEqual(0);
            expect(renderModel.get('scrollLeft')).toEqual(0);
            expect(renderModel.get('startIndex')).toEqual(-1);
            expect(renderModel.get('endIndex')).toEqual(-1);
            expect(renderModel.get('startNumber')).toEqual(1);
        });
    });

    describe('getCollection()', function() {
        it('인자가 없다면 rside 콜렉션을 반환한다.', function() {
            expect(renderModel.getCollection()).toEqual(renderModel.get('partialRside'));
        });

        it('인자가 있다면 L R 중 하나의 콜렉션을 반환한다.', function() {
            expect(renderModel.getCollection(frameConst.R)).toEqual(renderModel.get('partialRside'));
            expect(renderModel.getCollection(frameConst.L)).toEqual(renderModel.get('partialLside'));
        });
    });

    describe('_getCollectionByColumnName()', function() {
        it('columnName 을 인자로 받아 해당 columnName 이 속한 collection 을 반환한다.', function() {
            var lside, rside;

            columnModel.set('frozenCount', 3);
            dataModel.set(rowList, {parse: true});
            renderModel.refresh();
            lside = renderModel.get('partialLside');
            rside = renderModel.get('partialRside');
            expect(renderModel._getCollectionByColumnName('_number').toJSON()).toEqual(lside.toJSON());
            expect(renderModel._getCollectionByColumnName('_button').toJSON()).toEqual(lside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName1').toJSON()).toEqual(lside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName2').toJSON()).toEqual(lside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName3').toJSON()).toEqual(lside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName4').toJSON()).toEqual(rside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName5').toJSON()).toEqual(rside.toJSON());
            expect(renderModel._getCollectionByColumnName('columnName6').toJSON()).toEqual(rside.toJSON());
        });
    });

    describe('getCellData()', function() {
        it('columnName 을 인자로 받아 해당 columnName 이 속한 collection 을 반환한다.', function() {
            rowList = [
                {
                    'columnName1': '1 normal',
                    'columnName2': '1 text',
                    'columnName3': 1,
                    'columnName4': 1,
                    'columnName5': 1,
                    'columnName6': true,
                    'columnName7': 'hidden'
                },
                {
                    'columnName1': '2 normal',
                    'columnName2': '2 text',
                    'columnName3': 2,
                    'columnName4': 2,
                    'columnName5': 2,
                    'columnName6': true,
                    'columnName7': 'hidden'
                },
                {
                    'columnName1': '3 normal',
                    'columnName2': '3 text',
                    'columnName3': 3,
                    'columnName4': 3,
                    'columnName5': 3,
                    'columnName6': true,
                    'columnName7': 'hidden'
                }
            ];
            columnModel.set({
                frozenCount: 3,
                rowHeaders: ['rowNum', 'checkbox']
            });
            dataModel.set(rowList, {parse: true});
            renderModel.refresh();

            expect(renderModel.getCellData(0, '_number').value).toEqual(1);
            expect(renderModel.getCellData(0, '_button').value).toEqual(false);
            expect(renderModel.getCellData(0, 'columnName1').value).toEqual('1 normal');
            expect(renderModel.getCellData(0, 'columnName2').value).toEqual('1 text');
            expect(renderModel.getCellData(0, 'columnName3').value).toEqual(1);
            expect(renderModel.getCellData(0, 'columnName4').value).toEqual(1);
            expect(renderModel.getCellData(0, 'columnName5').value).toEqual(1);
            expect(renderModel.getCellData(0, 'columnName6').value).toEqual(true);
        });
    });

    describe('refresh()', function() {
        beforeEach(function() {
            columnModel.set('frozenCount', 3);
            dataModel.set(rowList, {parse: true});
        });

        describe('lside 와 rside 에 해당하는 데이터가 할당되었는지 확인한다.', function() {
            var lsideResult,
                rsideResult;

            beforeEach(function() {
                renderModel.refresh();
                lsideResult = renderModel.get('partialLside').at(0).toJSON();
                rsideResult = renderModel.get('partialRside').at(0).toJSON();
            });

            it('rowKey와 extraData가 할당되어 있어야 한다.', function() {
                expect(lsideResult.rowKey).toBeDefined();
                expect(lsideResult._extraData).toBeDefined();
                expect(rsideResult.rowKey).toBeDefined();
                expect(rsideResult._extraData).toBeDefined();
            });

            it('보이는 column 에 대한 정보만 들어가야 한다.', function() {
                expect(lsideResult.columnName7).not.toBeDefined();
                expect(rsideResult.columnName7).not.toBeDefined();
            });

            it('Left side 정보를 확인한다.', function() {
                expect(lsideResult._number).toBeDefined();
                expect(lsideResult._button).toBeDefined();
                expect(lsideResult.columnName1).toBeDefined();
                expect(lsideResult.columnName2).toBeDefined();
                expect(lsideResult.columnName3).toBeDefined();
                expect(lsideResult.columnName4).not.toBeDefined();
                expect(lsideResult.columnName5).not.toBeDefined();
                expect(lsideResult.columnName6).not.toBeDefined();
            });

            it('Right side 정보를 확인한다.', function() {
                expect(rsideResult._number).not.toBeDefined();
                expect(rsideResult._button).not.toBeDefined();
                expect(rsideResult.columnName1).not.toBeDefined();
                expect(rsideResult.columnName2).not.toBeDefined();
                expect(rsideResult.columnName3).not.toBeDefined();
                expect(rsideResult.columnName4).toBeDefined();
                expect(rsideResult.columnName5).toBeDefined();
                expect(rsideResult.columnName6).toBeDefined();
            });
        });

        describe('데이터 append, remove, reset 혹은 columnModel의 변경으로 인해 호출되는 이벤트 핸들러', function() {
            var listenModel;

            beforeEach(function() {
                listenModel = new Model();
            });

            it('데이터가 변경되었을 경우 dataModelChanged 이벤트를 발생하는지 확인한다.', function(done) {
                var callback = jasmine.createSpy('callback');

                renderModel = new Renderer(null, {
                    dataModel: dataModel,
                    columnModel: columnModel,
                    dimensionModel: dimensionModel,
                    focusModel: focusModel,
                    coordRowModel: coordRowModel,
                    coordColumnModel: coordColumnModel
                });
                listenModel.listenTo(renderModel, 'rowListChanged', callback);
                dataModel.set([], {parse: true});
                setTimeout(function() {
                    expect(callback).toHaveBeenCalled();
                    done();
                }, 100);
            });

            it('컬럼 모델이 변경되었을 경우 isColumnModelChanged 이벤트를 발생하는지 확인한다.', function(done) {
                var callback = jasmine.createSpy('callback');

                renderModel = new Renderer(null, {
                    dataModel: dataModel,
                    columnModel: columnModel,
                    dimensionModel: dimensionModel,
                    focusModel: focusModel,
                    coordRowModel: coordRowModel,
                    coordColumnModel: coordColumnModel
                });
                listenModel.listenTo(renderModel, 'columnModelChanged', callback);
                columnModel.set({
                    frozenCount: 4
                });
                setTimeout(function() {
                    expect(callback).toHaveBeenCalled();
                    done();
                }, 100);
            });
        });
    });
});
