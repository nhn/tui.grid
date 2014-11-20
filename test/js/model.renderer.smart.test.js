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
                    isDisabled: function(value, rowData) {
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
    };

    var rowList = [],
        columnModelInstance,
        dataModelInstance,
        renderInstance,
        dimensionModelInstance,
        grid = {},
        i;
    rowList = [];
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

    beforeEach(function() {
        renderInstance = new Model.Renderer.Smart({
            grid: grid
        });
        renderInstance.refresh();
    });
    describe('_setRenderingRange()', function() {
        it('scrollTop 변경에 따라 값을 설정한다.', function() {
            function getDiff(start, end) {
                return end - start;
            }
            renderInstance._setRenderingRange(0);
            expect(renderInstance.get('top')).toBe(0);
            expect(renderInstance.get('startIndex')).toBe(0);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(40);


            renderInstance._setRenderingRange(100);
            expect(renderInstance.get('top')).toBe(0);
            expect(renderInstance.get('startIndex')).toBe(0);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(40);


            renderInstance._setRenderingRange(200);
            expect(renderInstance.get('top')).toBe(77);
            expect(renderInstance.get('startIndex')).toBe(7);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);

            renderInstance._setRenderingRange(300);
            expect(renderInstance.get('top')).toBe(176);
            expect(renderInstance.get('startIndex')).toBe(16);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);

            renderInstance._setRenderingRange(400);
            expect(renderInstance.get('top')).toBe(275);
            expect(renderInstance.get('startIndex')).toBe(25);
            expect(getDiff(renderInstance.get('startIndex'), renderInstance.get('endIndex'))).toBe(42);

        });
    });
    describe('_isRenderable()', function() {
        it('scrollTop 변경에 따라 rendering 해야할지 여부를 판단하여 반환한다.', function () {
            renderInstance._setRenderingRange(0);
            expect(renderInstance._isRenderable(0)).toBe(false);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(200);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(false);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(400);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(true);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(false);
            expect(renderInstance._isRenderable(400)).toBe(false);
            expect(renderInstance._isRenderable(500)).toBe(true);
        });
    });

    describe('_onChange()', function() {
        it('bodyHeight', function () {
            renderInstance._setRenderingRange(0);
            expect(renderInstance._isRenderable(0)).toBe(false);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(200);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(false);
            expect(renderInstance._isRenderable(200)).toBe(false);
            expect(renderInstance._isRenderable(300)).toBe(true);
            expect(renderInstance._isRenderable(400)).toBe(true);
            expect(renderInstance._isRenderable(500)).toBe(true);

            renderInstance._setRenderingRange(400);
            expect(renderInstance._isRenderable(0)).toBe(true);
            expect(renderInstance._isRenderable(100)).toBe(true);
            expect(renderInstance._isRenderable(200)).toBe(true);
            expect(renderInstance._isRenderable(300)).toBe(false);
            expect(renderInstance._isRenderable(400)).toBe(false);
            expect(renderInstance._isRenderable(500)).toBe(true);
        });
    });
});

