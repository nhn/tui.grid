'use strict';

describe('model.dimension', function() {
    var columnModelList = [
        {
            title: 'changeCallback',
            columnName: 'changeCallback',
            editOption: {
                changeBeforeCallback: function(changeEvent) {
                    return !!changeEvent.value;
                },
                changeAfterCallback: function(changeEvent) {
                    return !!changeEvent.value;
                }
            }
        },
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
            formatter: function(value) {
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
                                {text: '하나', value: 1},
                                {text: '둘', value: 2},
                                {text: '셋', value: 3},
                                {text: '넷', value: 4}
                            ];
                        }
                    }
                },
                {
                    columnList: ['text'],
                    isDisabled: function(value) {
                        return value === false;
                    },
                    isEditable: function(value) {
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
        dimensionModel,
        grid = {},
        defaultConfig;

    function min(widthList) {
        return _.min(widthList);
    }

    beforeEach(function() {
        rowList = $.extend(true, [], originalData);
        columnModelInstance = grid.columnModel = new Data.ColumnModel();
        columnModelInstance.set('columnModelList', columnModelList);
        dataModelInstance = grid.dataModel = new Data.RowList([], {
            grid: grid
        });
        defaultConfig = {
            grid: grid,
            offsetLeft: 100,
            offsetTop: 200,
            width: 500,
            height: 500,
            headerHeight: 150,
            rowHeight: 100,

            scrollX: true,
            scrollBarSize: 17,

            minimumColumnWidth: 20,
            displayRowCount: 20
        };
    });

    describe('getColumnWidthList()', function() {
        it('ColumnFixIndex 를 기반으로 Left side 와 Right Side 를 잘 반환하는지 확인한다.', function() {
            columnModelInstance.set({
                columnFixIndex: 3
            });
            dimensionModel = new Model.Dimension({
                grid: grid
            });
            dimensionModel.set({
                columnWidthList: [10, 20, 30, 40, 50, 60]
            });
            expect(dimensionModel.getColumnWidthList()).toEqual([10, 20, 30, 40, 50, 60]);
            expect(dimensionModel.getColumnWidthList('L')).toEqual([10, 20, 30]);
            expect(dimensionModel.getColumnWidthList('R')).toEqual([40, 50, 60]);

            columnModelInstance.set({
                columnFixIndex: 4
            });
            dimensionModel.set({
                columnWidthList: [10, 20, 30, 40, 50, 60]
            });
            expect(dimensionModel.getColumnWidthList('L')).toEqual([10, 20, 30, 40]);
            expect(dimensionModel.getColumnWidthList('R')).toEqual([50, 60]);
        });
    });

    describe('_getFrameWidth()', function() {
        it('인자로 받은 columnModelList로부터 border 값을 포함하여 해당 columnModelList를 감싸고 있는 frame width를 구한다.', function() {
            var widthList = [10, 20, 30, 40, 50];
            dimensionModel = new Model.Dimension(defaultConfig);
            expect(dimensionModel._getFrameWidth(widthList)).toEqual(156);
            expect(dimensionModel._getFrameWidth([])).toEqual(0);
        });
    });

    describe('getFrameWidth()', function() {
        describe('인자로 받은 값으로 columnWidthList 를 제대로 반환한다.', function() {
            beforeEach(function() {
                columnModelInstance.set({
                    columnFixIndex: 2
                });
                dimensionModel = new Model.Dimension(defaultConfig);
                dimensionModel.set('columnWidthList', [10, 20, 30, 40, 50]);
            });

            it('인자가 없을 경우 전체 frame의 너비 값을 반환한다.', function() {
                expect(dimensionModel.getFrameWidth()).toEqual(157);
            });

            it('L일 경우 Left Side의 Frame 너비를 반환한다.', function() {
                expect(dimensionModel.getFrameWidth('L')).toEqual(33);
            });

            it('R일 경우 Right Side의 Frame 너비를 반환한다.', function() {
                expect(dimensionModel.getFrameWidth('R')).toEqual(124);
            });
        });
    });

    describe('_calculateColumnWidthList()가 인자로 받은 배열로부터 width list를 잘 생성하는지 확인한다.', function() {
        beforeEach(function() {
            dimensionModel = new Model.Dimension(defaultConfig);
            dimensionModel.set({
                width: 500,
                minimumWidth: 20
            });
        });

        it('생성된 width 각 요소는 minimumColumnWidth 보다 같거나 커야하고, 요소들의 합은 width 보다 같거나 커야 한다.', function() {
            var compareWidth = dimensionModel.get('width') - 18,
                minimumWidth = dimensionModel.get('minimumColumnWidth') - 1,
                widthList1 = [5, 10, 15, 20, 25, 30, 35, 40, 45, -1],
                widthList2 = [5, 10, 15, 20, 25, 130, 135, 140, 145, 150],
                widthList3 = [5, 10, 315, 320, 325, 330, 335, 340, 345, 350],
                widthList4 = [5, 10, 415, 420, 425, -1, -1, -1, -1, -1],
                newWidthList;

            newWidthList = dimensionModel._calculateColumnWidthList(widthList1);
            expect(dimensionModel._getFrameWidth(newWidthList)).toBeGreaterThan(compareWidth);
            expect(min(newWidthList)).toBeGreaterThan(minimumWidth);

            newWidthList = dimensionModel._calculateColumnWidthList(widthList2);
            expect(dimensionModel._getFrameWidth(newWidthList)).toBeGreaterThan(compareWidth);
            expect(min(newWidthList)).toBeGreaterThan(minimumWidth);

            newWidthList = dimensionModel._calculateColumnWidthList(widthList3);
            expect(dimensionModel._getFrameWidth(newWidthList)).toBeGreaterThan(compareWidth);
            expect(min(newWidthList)).toBeGreaterThan(minimumWidth);

            newWidthList = dimensionModel._calculateColumnWidthList(widthList4);
            expect(dimensionModel._getFrameWidth(newWidthList)).toBeGreaterThan(compareWidth);
            expect(min(newWidthList)).toBeGreaterThan(minimumWidth);
        });
    });

    describe('_getOriginalWidthList() columnModel', function() {
        var sampleColumnModel;

        beforeEach(function() {
            sampleColumnModel = [
                {
                    columnName: 'column1',
                    width: 10
                },
                {
                    columnName: 'column2',
                    width: 20
                },
                {
                    columnName: 'column3',
                    width: 300,
                    isHidden: true
                },
                {
                    columnName: 'column4',
                    width: 40
                },
                {
                    columnName: 'column5'
                }
            ];
            columnModelInstance.set({
                columnModelList: sampleColumnModel,
                hasNumberColumn: false,
                selectType: ''
            });
            dimensionModel = new Model.Dimension(defaultConfig);
            dimensionModel.set({
                width: 500,
                minimumWidth: 20
            });
        });

        it('columnModelList에 정의된 값으로 columnWidthList 를 생성하는지 확인한다.', function() {
            var originalWidthList = dimensionModel._getOriginalWidthList(),
                compareWidth = dimensionModel.get('width') - 18,
                minimumWidth = dimensionModel.get('minimumColumnWidth') - 1;

            expect(dimensionModel._getFrameWidth(originalWidthList)).toBeGreaterThan(compareWidth);
            expect(min(originalWidthList)).toBeGreaterThan(minimumWidth);

            expect(originalWidthList).toEqual([
               20, 20, 40, 398
            ]);
        });
    });

    describe('_getMinLeftSideWidth()', function() {
        it('Left Side의 최소 너비를 잘 구하는지 확인한다.', function() {
            columnModelInstance.set({
                columnFixIndex: 3
            });
            dimensionModel = new Model.Dimension({
                grid: grid,
                minimumColumnWidth: 20
            });
            expect(dimensionModel._getMinLeftSideWidth()).toEqual(64);
            columnModelInstance.set({
                columnFixIndex: 0
            });
            expect(dimensionModel._getMinLeftSideWidth()).toEqual(0);
        });
    });

    describe('_getMaxLeftSideWidth()', function() {
        it('Left Side 의 최대 너비 를 잘 구하는지 확인한다.', function() {
            columnModelInstance.set({
                columnFixIndex: 3
            });
            dimensionModel = new Model.Dimension({
                grid: grid,
                width: 100,
                minimumColumnWidth: 20
            });
            expect(dimensionModel._getMaxLeftSideWidth()).toEqual(90);
            dimensionModel.set({
                minimumColumnWidth: 200
            });
            expect(dimensionModel._getMaxLeftSideWidth()).toEqual(604);
        });
    });

    describe('_setColumnWidthVariables()', function() {
        var sampleColumnModel;
        beforeEach(function() {
            sampleColumnModel = [
                {
                    columnName: 'column1',
                    width: 10
                },
                {
                    columnName: 'column2',
                    width: 20
                },
                {
                    columnName: 'column3',
                    width: 300,
                    isHidden: true
                },
                {
                    columnName: 'column4',
                    width: 40
                },
                {
                    columnName: 'column5',
                    width: 50
                }
            ];
            columnModelInstance.set({
                columnModelList: sampleColumnModel,
                hasNumberColumn: false,
                selectType: ''
            });
            dimensionModel = new Model.Dimension(defaultConfig);
            dimensionModel.set({
                width: 1000,
                minimumWidth: 20
            });
        });

        describe('lside와 rside의 너비를 계산한다.', function() {
            function changeFixIndex(fixIndex, widthList) {
                widthList = widthList || dimensionModel.get('columnWidthList');
                columnModelInstance.set({columnFixIndex: fixIndex});
                dimensionModel._setColumnWidthVariables(widthList);
            }

            describe('인자로 넘긴 columnWidthList를 기준으로 lside와 rside를 계산한다.', function() {
                var widthList;
                beforeEach(function() {
                    widthList = [5, 10, 315, 320, 325, 330, 335, 340, 345, 350];

                    columnModelInstance.set({columnFixIndex: 0});
                    dimensionModel._setColumnWidthVariables(widthList);
                });

                it('columnFixIndex 값이 작아서, 열고정 영역의 너비가 전체의 90%를 넘지 않는 경우', function() {
                    expect(dimensionModel.get('columnWidthList')).toEqual(widthList);
                    expect(dimensionModel.get('lsideWidth')).toEqual(0);
                    expect(dimensionModel.get('rsideWidth')).toEqual(1000);

                    changeFixIndex(1);
                    expect(dimensionModel.get('columnWidthList')).toEqual(widthList);
                    expect(dimensionModel.get('lsideWidth')).toEqual(7);
                    expect(dimensionModel.get('rsideWidth')).toEqual(993);

                    changeFixIndex(2);
                    expect(dimensionModel.get('columnWidthList')).toEqual(widthList);
                    expect(dimensionModel.get('lsideWidth')).toEqual(18);
                    expect(dimensionModel.get('rsideWidth')).toEqual(982);

                    changeFixIndex(3);
                    expect(dimensionModel.get('columnWidthList')).toEqual(widthList);
                    expect(dimensionModel.get('lsideWidth')).toEqual(334);
                    expect(dimensionModel.get('rsideWidth')).toEqual(666);

                    changeFixIndex(4);
                    expect(dimensionModel.get('columnWidthList')).toEqual(widthList);
                    expect(dimensionModel.get('lsideWidth')).toEqual(655);
                    expect(dimensionModel.get('rsideWidth')).toEqual(345);
                });

                it('columnFixIndex 값이 충분히 커서 열고정 영역의 너비가 전체의 90%를 넘어가는 경우 전체의 열고정 영역의 너비를 전체의 90%로 강제 조정한다.', function() {
                    var leftSideframeWidth,
                        rsideWidthList;

                    changeFixIndex(5);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(5);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);

                    changeFixIndex(6);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(6);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);

                    changeFixIndex(7);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(7);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);

                    changeFixIndex(8);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(8);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);

                    changeFixIndex(9);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(9);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);

                    changeFixIndex(10);
                    leftSideframeWidth = dimensionModel._getFrameWidth(dimensionModel.getColumnWidthList('L'));
                    rsideWidthList = widthList.slice(10);
                    expect(dimensionModel.getColumnWidthList('R')).toEqual(rsideWidthList);
                    expect(leftSideframeWidth).toEqual(900);
                    expect(dimensionModel.get('lsideWidth')).toEqual(900);
                    expect(dimensionModel.get('rsideWidth')).toEqual(100);
                });
            });
        });
    });

    describe('_adjustLeftSideWidthList()', function() {
        var widthList;

        beforeEach(function() {
            dimensionModel = new Model.Dimension({
                grid: grid,
                minimumColumnWidth: 10
            });
            widthList = [100, 80, 60, 40, 30, 20, 10];
        });

        it('열고정 영역을 인자로 넘긴 totalWidth 에 맞추어 조정한다. 가장 마지막 요소부터 처음 요소까지 조정이 완료될 까지 역으로 순환한다.', function() {
            expect(dimensionModel._adjustLeftSideWidthList(widthList, 300)).toEqual([100, 80, 60, 22, 10, 10, 10]);
        });

        it('인자로 넘긴 totalWidth 가 너무 작은값일 경우, minimumColumnWidth 크기 까지만 조정한다.', function() {
            expect(dimensionModel._adjustLeftSideWidthList(widthList, 50)).toEqual([10, 10, 10, 10, 10, 10, 10]);
        });
    });

    describe('_setBodyHeight()', function() {
        describe('displayRowHeight 와 rowHeight 값을 기반으로 bodyHeight 값을 계산한다.', function() {
            beforeEach(function() {
                dimensionModel = new Model.Dimension(defaultConfig);
            });

            it('scrollX 옵션이 false 일 경우', function() {
                dimensionModel.set({
                    displayRowCount: 10,
                    rowHeight: 20,
                    scrollX: false
                });
                dimensionModel._setBodyHeight();
                expect(dimensionModel.get('bodyHeight')).toEqual(211);
            });

            it('scrollX 옵션이 true 일 경우', function() {
                dimensionModel.set({
                    displayRowCount: 10,
                    rowHeight: 20,
                    scrollX: true
                });
                dimensionModel._setBodyHeight();
                expect(dimensionModel.get('bodyHeight')).toEqual(228);
            });
        });
    });

    describe('getDisplayRowCount()', function() {
        beforeEach(function() {
            dimensionModel = new Model.Dimension(defaultConfig);
        });

        it('bodyHeight 값에서 toolbar 영역을 제외한 컨텐트 영역에 보여지는 행의 개수를 구한다.', function() {
            dimensionModel.set({
                bodyHeight: 150,
                toolbarHeight: 50,
                rowHeight: 9
            });
            expect(dimensionModel.getDisplayRowCount()).toEqual(10);
        });
    });

    describe('getScrollXHeight() scrollX 옵션값에 따라 scrollXHeight 를 반환한다.', function() {
        beforeEach(function() {
            dimensionModel = new Model.Dimension(defaultConfig);
        });

        it('scrollX 가 false 로 설정되어 있을 경우', function() {
            dimensionModel.set({
                scrollX: false
            });
            expect(dimensionModel.getScrollXHeight()).toEqual(0);
        });

        it('scrollX 가 true 로 설정되어 있을 경우', function() {
            dimensionModel.set({
                scrollX: true
            });
            expect(dimensionModel.getScrollXHeight()).toEqual(17);
        });
    });

    describe('setColumnWidth()', function() {
        var currentColumnWidthList;
        beforeEach(function() {
            columnModelInstance.set({
                columnFixIndex: 3
            });
            dimensionModel = new Model.Dimension(defaultConfig);
            dimensionModel.set({
                minimumColumnWidth: 20,
                columnWidthList: [50, 50, 50, 50, 50]
            });

            currentColumnWidthList = dimensionModel._calculateColumnWidthList([50, 50, 50, 50, 50]);
            dimensionModel._setColumnWidthVariables(currentColumnWidthList);
        });

        it('값이 잘 변경되는지 확인한다.', function() {
            dimensionModel.setColumnWidth(0, 100);
            expect(dimensionModel.getColumnWidthList()[0]).toEqual(100);
            dimensionModel.setColumnWidth(1, 100);
            expect(dimensionModel.getColumnWidthList()[1]).toEqual(100);
            dimensionModel.setColumnWidth(2, 100);
            expect(dimensionModel.getColumnWidthList()[2]).toEqual(100);
            dimensionModel.setColumnWidth(3, 100);
            expect(dimensionModel.getColumnWidthList()[3]).toEqual(100);
            dimensionModel.setColumnWidth(4, 100);
            expect(dimensionModel.getColumnWidthList()[4]).toEqual(100);
            dimensionModel.setColumnWidth(5, 100);
            expect(dimensionModel.getColumnWidthList()[5]).not.toBeDefined();
        });

        it('miminumColumnWidth 이하로 떨어지지 않는지 확인한다.', function() {
            dimensionModel.setColumnWidth(0, 10);
            expect(dimensionModel.getColumnWidthList()[0]).toEqual(20);
        });
    });

    describe('getCellPosition() Frame 으로 부터 상대적인 cell의 위치를 잘 반환한다.', function() {
        beforeEach(function() {
            columnModelInstance.set({
                selectType: '',
                hasNumberColumn: false,
                columnFixIndex: 2
            });
            dataModelInstance.set(rowList, {parse: true});
            dimensionModel = new Model.Dimension(defaultConfig);
        });

        it('rowSpan 이 없는 경우', function() {
            expect(dimensionModel.getCellPosition(0, 'changeCallback')).toEqual(
                {'top': 0, 'left': 0, 'right': 40, 'bottom': 101}
            );
            expect(dimensionModel.getCellPosition(0, 'keyColumn')).toEqual(
                {'top': 0, 'left': 40, 'right': 80, 'bottom': 101}
            );
            //columnFix Index 이기 때문에 left 가 0부터 시작된다.
            expect(dimensionModel.getCellPosition(0, 'none')).toEqual(
                {top: 0, left: 0, right: 40, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(0, 'hasFormatter')).toEqual(
                {top: 0, left: 40, right: 80, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(0, 'notUseHtmlEntity')).toEqual(
                {top: 0, left: 80, right: 120, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(0, 'relationOptionList')).toEqual(
                {top: 0, left: 120, right: 160, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(0, 'text')).toEqual(
                {top: 0, left: 160, right: 200, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(0, 'text-convertible')).toEqual(
                {top: 0, left: 200, right: 240, bottom: 101}
            );
            expect(dimensionModel.getCellPosition(1, 'changeCallback')).toEqual(
                {top: 102, left: 0, right: 40, bottom: 203}
            );
            expect(dimensionModel.getCellPosition(1, 'keyColumn')).toEqual(
                {top: 102, left: 40, right: 80, bottom: 203}
            );
        });

        it('rowSpan 이 있는 경우 main row 가 아닌 row 라도 정상적으로 반환한다.', function() {
            var expectPosition = {top: 102, left: 0, right: 40, bottom: 304};
            //columnFix Index 이기 때문에 left 가 0부터 시작된다.
            expect(dimensionModel.getCellPosition(1, 'none')).toEqual(expectPosition);
            expect(dimensionModel.getCellPosition(2, 'none')).toEqual(expectPosition);
        });

        it('rowSpan 이 3인 경우', function() {
            var expectPosition = {top: 102, left: 160, right: 200, bottom: 405};
            expect(dimensionModel.getCellPosition(1, 'text')).toEqual(expectPosition);
            expect(dimensionModel.getCellPosition(2, 'text')).toEqual(expectPosition);
            expect(dimensionModel.getCellPosition(3, 'text')).toEqual(expectPosition);
        });
    });
});
