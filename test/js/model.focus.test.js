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
                                {text: '하나', value: 1},
                                {text: '둘', value: 2},
                                {text: '셋', value: 3},
                                {text: '넷', value: 4}
                            ];
                        }
                    }
                },
                {
                    columnList: ['columnName2'],
                    isDisabled: function(value) {
                        return value === false;
                    },
                    isEditable: function(value) {
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
        },
        {
            title: 'keyColumn',
            columnName: 'keyColumn',
            isHidden: true
        }
    ];
    var sampleRow = {
            'columnName1': 'normal',
            'columnName2': 'text',
            'columnName3': 1,
            'columnName4': 2,
            'columnName5': 3,
            'columnName6': true,
            'columnName7': 'hidden',
            'keyColumn': 'key0'
        },
        rowList = [
            {
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
                'columnName7': 'hidden',
                'keyColumn': 'key0'
            },
            {
                'columnName1': 'normal',
                'columnName2': 'text',
                'columnName3': 1,
                'columnName4': 2,
                'columnName5': 3,
                'columnName6': true,
                'columnName7': 'hidden',
                'keyColumn': 'key1'
            },
            {
                'columnName1': 'normal',
                'columnName2': 'text',
                'columnName3': 1,
                'columnName4': 2,
                'columnName5': 3,
                'columnName6': true,
                'columnName7': 'hidden',
                'keyColumn': 'key2'

            },
            {
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
                'columnName7': 'hidden',
                'keyColumn': 'key3'
            }
        ],
        columnModelInstance,
        dataModelInstance,
        renderInstance,
        dimensionModelInstance,
        focusInstance,
        grid = {},
        i,
        count,
        temp;
    for (i = 0; i < 100; i += 1) {
        count = i + 4;
        temp = $.extend({}, sampleRow);
        temp.keyColumn = 'key' + count;
        rowList.push(temp);
    }

    columnModelInstance = grid.columnModel = new Data.ColumnModel({
        hasNumberColumn: true,
        selectType: 'checkbox',
        columnFixIndex: 2,
        keyColumnName: 'keyColumn'
    });
    columnModelInstance.set('columnModelList', columnModelList);
    dataModelInstance = grid.dataModel = new Data.RowList([], {
        grid: grid
    });
    dimensionModelInstance = grid.dimensionModel = new Model.Dimension({
        grid: grid,
        offsetLeft: 100,
        offsetTop: 200,
        width: 200,
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
        beforeEach(function(){
            focusInstance.blur();
        });

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

        it('이전 focus 정보를 저장하는지 확인한다.', function() {
            focusInstance.focus(11, 'columnName1');
            focusInstance.focus(22, 'columnName2');

            expect(focusInstance.get('rowKey')).toEqual(22);
            expect(focusInstance.get('columnName')).toEqual('columnName2');
            expect(focusInstance.get('prevRowKey')).toEqual(11);
            expect(focusInstance.get('prevColumnName')).toEqual('columnName1');
        });
    });

    describe('blur()', function() {
        it('blur 한다.', function() {
            focusInstance.blur();
            expect(focusInstance.get('columnName')).toEqual('');
        });

        it('blur 이벤트를 발생한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();

            focusInstance.focus(11, 'columnName1');
            listenModel.listenToOnce(focusInstance, 'blur', callback);
            focusInstance.blur();
            expect(callback).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith(11, 'columnName1');
        });
    });

    describe('which()', function() {
        it('현재 focus 정보를 반환하는지 확인한다.', function() {
            focusInstance.focus(11, 'columnName1');
            expect(focusInstance.which()).toEqual({
                rowKey: 11,
                columnName: 'columnName1'
            });
            focusInstance.blur();
            expect(focusInstance.which()).toEqual({
                rowKey: 11,
                columnName: ''
            });
        });
    });

    describe('indexOf()', function() {
        it('현재 focus 정보를 화면에 노출되는 Index 기준으로 반환하는지 확인한다.', function() {
            focusInstance.focus('key11', 'columnName5');
            expect(focusInstance.indexOf()).toEqual({
                rowIdx: 11,
                columnIdx: 6
            });
            focusInstance.focus('key21', '_button');
            expect(focusInstance.indexOf()).toEqual({
                rowIdx: 21,
                columnIdx: 1
            });
        });

        it('isPrevious 옵션이 설정되어 있다면 이전 정보를 반환한다.', function() {
            focusInstance.focus('key11', 'columnName5');
            focusInstance.focus('key21', '_button');
            expect(focusInstance.indexOf(true)).toEqual({
                rowIdx: 11,
                columnIdx: 6
            });
            focusInstance.focus(31, 'columnName5');
            expect(focusInstance.indexOf(true)).toEqual({
                rowIdx: 21,
                columnIdx: 1
            });
        });
    });

    describe('has()', function() {
        it('현재 focus 를 가지고 있는지 확인한다..', function() {
            focusInstance.focus('key11', 'columnName5');
            expect(focusInstance.has()).toBeTruthy();
            focusInstance.blur();
            expect(focusInstance.has()).toBeFalsy();
        });
    });

    describe('_findRowKey()', function() {
        it('offset 만큼 이동한 rowKey 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName5');
            expect(focusInstance._findRowKey(20)).toBe('key30');
            expect(focusInstance._findRowKey(-5)).toBe('key5');

            expect(focusInstance._findRowKey(-200)).toBe('key0');
            expect(focusInstance._findRowKey(2000)).toBe('key103');
        });
    });

    describe('_findColumnName()', function() {
        it('offset 만큼 이동한 columnName 을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName4');
            expect(focusInstance._findColumnName(2)).toBe('columnName6');
            expect(focusInstance._findColumnName(100)).toBe('columnName6');

            expect(focusInstance._findColumnName(-2)).toBe('columnName2');
            expect(focusInstance._findColumnName(-4)).toBe('_button');
            expect(focusInstance._findColumnName(-100)).toBe('_number');
        });
    });

    describe('nextRowIndex()', function() {
        it('offset 만큼 이동한 row 의 index 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.nextRowIndex()).toBe(11);
            expect(focusInstance.nextRowIndex(3)).toBe(13);
        });

        it('현재 focus 된 row 가  rowSpan 된 경우, rowSpan 값을 고려하여 반환한다.', function() {
            focusInstance.focus('key0', 'columnName1');
            expect(focusInstance.nextRowIndex()).toBe(3);
            focusInstance.focus('key1', 'columnName1');
            expect(focusInstance.nextRowIndex()).toBe(3);
            focusInstance.focus('key2', 'columnName1');
            expect(focusInstance.nextRowIndex()).toBe(3);
            focusInstance.focus('key3', 'columnName1');
            expect(focusInstance.nextRowIndex()).toBe(6);

            focusInstance.focus('key103', 'columnName1');
            expect(focusInstance.nextRowIndex()).toBe(103);
        });
    });

    describe('prevRowIndex()', function() {
        it('offset 만큼 이동한 row 의 index 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.prevRowIndex()).toBe(9);
            expect(focusInstance.prevRowIndex(3)).toBe(7);
        });

        it('현재 focus 된 row 가  rowSpan 된 경우, rowSpan 값을 고려하여 반환한다.', function() {
            focusInstance.focus('key5', 'columnName1');
            expect(focusInstance.prevRowIndex()).toBe(2);
            focusInstance.focus('key4', 'columnName1');
            expect(focusInstance.prevRowIndex()).toBe(2);
            focusInstance.focus('key3', 'columnName1');
            expect(focusInstance.prevRowIndex()).toBe(2);

            focusInstance.focus('key2', 'columnName1');
            expect(focusInstance.prevRowIndex()).toBe(0);

            focusInstance.focus('key10', 'columnName1');
            expect(focusInstance.prevRowIndex(5)).toBe(3);
            expect(focusInstance.prevRowIndex(6)).toBe(3);
        });
    });

    describe('nextColumnIndex()', function() {
        it('다음 columnName 을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName4');
            expect(focusInstance.nextColumnIndex()).toBe(6);
            focusInstance.focus('key10', 'columnName5');
            expect(focusInstance.nextColumnIndex()).toBe(7);
            focusInstance.focus('key10', 'columnName6');
            expect(focusInstance.nextColumnIndex()).toBe(7);
        });
    });

    describe('prevColumnIndex()', function() {
        it('다음 columnName 을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.prevColumnIndex()).toBe(2);
            focusInstance.focus('key10', 'columnName1');
            expect(focusInstance.prevColumnIndex()).toBe(1);
            focusInstance.focus('key10', '_button');
            expect(focusInstance.prevColumnIndex()).toBe(0);
            focusInstance.focus('key10', '_number');
            expect(focusInstance.prevColumnIndex()).toBe(0);
        });
    });

    describe('nextRowKey()', function() {
        it('다음 rowKey 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.nextRowKey()).toBe('key11');
            expect(focusInstance.nextRowKey(3)).toBe('key13');
            expect(focusInstance.nextRowKey(10)).toBe('key20');
            expect(focusInstance.nextRowKey(100)).toBe('key103');
        });

        it('rowSpan 되어 있는 경우 고려하여 다음 rowKey 를 반환한다.', function() {
            focusInstance.focus('key0', 'columnName1');
            expect(focusInstance.nextRowKey()).toBe('key3');
            focusInstance.focus('key1', 'columnName1');
            expect(focusInstance.nextRowKey()).toBe('key3');
            focusInstance.focus('key2', 'columnName1');
            expect(focusInstance.nextRowKey()).toBe('key3');
            focusInstance.focus('key3', 'columnName1');
            expect(focusInstance.nextRowKey()).toBe('key6');

            focusInstance.focus('key103', 'columnName1');
            expect(focusInstance.nextRowKey()).toBe('key103');
        });
    });

    describe('prevRowKey()', function() {
        it('offset 만큼 이동한 row 의 index 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.prevRowKey()).toBe('key9');
            expect(focusInstance.prevRowKey(3)).toBe('key7');
        });

        it('현재 focus 된 row 가  rowSpan 된 경우, rowSpan 값을 고려하여 반환한다.', function() {
            focusInstance.focus('key5', 'columnName1');
            expect(focusInstance.prevRowKey()).toBe('key2');
            focusInstance.focus('key4', 'columnName1');
            expect(focusInstance.prevRowKey()).toBe('key2');
            focusInstance.focus('key3', 'columnName1');
            expect(focusInstance.prevRowKey()).toBe('key2');

            focusInstance.focus('key2', 'columnName1');
            expect(focusInstance.prevRowKey()).toBe('key0');

            focusInstance.focus('key10', 'columnName1');
            expect(focusInstance.prevRowKey(5)).toBe('key3');
            expect(focusInstance.prevRowKey(6)).toBe('key3');
        });
    });

    describe('firstRowKey()', function() {
        it('첫번째 rowKey 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.firstRowKey()).toBe('key0');
        });
    });

    describe('lastRowKey()', function() {
        it('마지막 rowKey 를 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.lastRowKey()).toBe('key103');
        });
    });

    describe('firstColumnName()', function() {
        it('첫번째 columnName 을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.firstColumnName()).toBe('_number');
        });
    });

    describe('lastColumnName()', function() {
        it('마지막 columnName 을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance.lastColumnName()).toBe('columnName6');
        });
    });

    describe('_adjustScroll()', function() {
        it('현재 focus 위치에 맞추어 scrollTop 과 scrollLeft 값을 반환한다.', function() {
            focusInstance.focus('key10', 'columnName2');
            expect(focusInstance._getScrollPosition()).toEqual({scrollLeft: 133});
            focusInstance.focus('key20', 'columnName40');
            expect(focusInstance._getScrollPosition()).toEqual({scrollTop: 28});

            focusInstance.focus('key20', 'columnName2');
            expect(focusInstance._getScrollPosition()).toEqual({scrollLeft: 133, scrollTop: 28});
        });
    });
});
