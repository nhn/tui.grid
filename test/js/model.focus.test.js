'use strict';

describe('model.renderer', function() {
    var grid, focusModel;

    function createGridMock() {
        var mock = {
            options: {
                toolbar: {}
            },
            option: function(name) {
                return this.options[name];
            },
            focusIn: function() {},
            selection: {},
            updateLayoutData: function() {},
            dataModel: new Collection.Base(),
            columnModel: new Data.ColumnModel()
        };
        mock.dimensionModel = new Model.Dimension({
            grid: mock
        });
        mock.renderModel = new Model.Renderer({
            grid: mock
        });
        mock.focusModel = new Model.Focus({
            grid: mock
        });
        mock.selection = new View.Selection({
            grid: mock
        });
        mock.dataModel = new Data.RowList([], {
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [{
            columnName: 'c1',
            editOption: {
                type: 'text'
            }
        }, {
            columnName: 'c2',
            editOption: {
                type: 'text'
            }
        }, {
            columnName: 'c3',
            editOption: {
                type: 'text'
            }
        }]);
        grid.dataModel.set([{
            c1: '0-1',
            c2: '0-2',
            c3: '0-3'
        }, {
            c1: '1-1',
            c2: '1-2',
            c3: '1-3'
        }, {
            c1: '2-1',
            c2: '2-2',
            c3: '2-3'
        }, {
            c1: '3-1',
            c2: '3-2',
            c3: '3-3'
        }], {parse: true});

        focusModel = grid.focusModel;
    });

    describe('select()', function() {
        it('select 된 rowKey 를 저장한다.', function() {
            focusModel.select(1);
            expect(focusModel.get('rowKey')).toEqual(1);
        });

        it('select 시 select 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusModel, 'select', callback);
            focusModel.select(1);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('unselect()', function() {
        it('저장된 rowKey 를 제거한다.', function() {
            focusModel.unselect();
            expect(focusModel.get('rowKey')).toBeNull();
        });
        it('unselect 시 unselect 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusModel, 'unselect', callback);
            focusModel.unselect();
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('focus()', function() {
        beforeEach(function() {
            focusModel.blur();
        });

        it('지정된 rowKey, columnName 을 저장한다.', function() {
            focusModel.focus('1', 'c1');
            expect(focusModel.get('rowKey')).toEqual('1');
            expect(focusModel.get('columnName')).toEqual('c1');
        });

        it('focus 이벤트를 발생한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();
            listenModel.listenToOnce(focusModel, 'focus', callback);
            focusModel.focus('1', 'c1');
            expect(callback).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith('1', 'c1');
        });

        it('이전 focus 정보를 저장하는지 확인한다.', function() {
            focusModel.focus(0, 'c1');
            focusModel.focus(1, 'c2');

            expect(focusModel.get('rowKey')).toEqual(1);
            expect(focusModel.get('columnName')).toEqual('c2');
            expect(focusModel.get('prevRowKey')).toEqual(0);
            expect(focusModel.get('prevColumnName')).toEqual('c1');
        });
    });

    describe('blur()', function() {
        it('blur 한다.', function() {
            focusModel.blur();
            expect(focusModel.get('columnName')).toEqual('');
        });

        it('blur 이벤트를 발생한다.', function() {
            var callback = jasmine.createSpy('callback'),
                listenModel = new Model.Base();

            focusModel.focus(1, 'c1');
            listenModel.listenToOnce(focusModel, 'blur', callback);
            focusModel.blur();
            expect(callback).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith(1, 'c1');
        });
    });

    describe('which()', function() {
        it('현재 focus 정보를 반환하는지 확인한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel.which()).toEqual({
                rowKey: 1,
                columnName: 'c1'
            });
            focusModel.blur();
            expect(focusModel.which()).toEqual({
                rowKey: 1,
                columnName: ''
            });
        });
    });

    describe('indexOf()', function() {
        it('현재 focus 정보를 화면에 노출되는 Index 기준으로 반환하는지 확인한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel.indexOf()).toEqual({
                rowIdx: 1,
                columnIdx: 1
            });
            focusModel.focus(1, '_number');
            expect(focusModel.indexOf()).toEqual({
                rowIdx: 1,
                columnIdx: 0
            });
        });

        it('isPrevious 옵션이 설정되어 있다면 이전 정보를 반환한다.', function() {
            focusModel.focus('1', 'c1');
            focusModel.focus('1', 'c2');
            expect(focusModel.indexOf(true)).toEqual({
                rowIdx: 1,
                columnIdx: 1
            });

            focusModel.focus('0', 'c1');
            expect(focusModel.indexOf(true)).toEqual({
                rowIdx: 1,
                columnIdx: 2
            });
        });
    });

    describe('has()', function() {
        it('현재 focus 를 가지고 있는지 확인한다.', function() {
            focusModel.focus(0, 'c1');
            expect(focusModel.has()).toBeTruthy();

            focusModel.blur();
            expect(focusModel.has()).toBeFalsy();
        });
    });

    describe('_findRowKey()', function() {
        it('offset 만큼 이동한 rowKey 를 반환한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel._findRowKey(2)).toBe(3);
            expect(focusModel._findRowKey(-1)).toBe(0);

            expect(focusModel._findRowKey(-10)).toBe(0);
            expect(focusModel._findRowKey(10)).toBe(3);
        });
    });

    describe('_findColumnName()', function() {
        it('offset 만큼 이동한 columnName 을 반환한다.', function() {
            focusModel.focus(1, 'c1');
            expect(focusModel._findColumnName(2)).toBe('c3');
            expect(focusModel._findColumnName(-1)).toBe('_number');

            expect(focusModel._findColumnName(10)).toBe('c3');
            expect(focusModel._findColumnName(-100)).toBe('_number');
        });
    });

    describe('nextColumnIndex()', function() {
        it('다음 columnName 을 반환한다.', function() {
            focusModel.focus(0, 'c1');
            expect(focusModel.nextColumnIndex()).toBe(2);
            focusModel.focus(0, 'c2');
            expect(focusModel.nextColumnIndex()).toBe(3);
        });
    });

    describe('prevColumnIndex()', function() {
        it('다음 columnName 을 반환한다.', function() {
            focusModel.focus(0, 'c2');
            expect(focusModel.prevColumnIndex()).toBe(1);
            focusModel.focus(0, 'c1');
            expect(focusModel.prevColumnIndex()).toBe(0);
            focusModel.focus(0, '_number');
            expect(focusModel.prevColumnIndex()).toBe(0);
        });
    });

    describe('firstRowKey()', function() {
        it('첫번째 rowKey 를 반환한다.', function() {
            focusModel.focus(2, 'c2');
            expect(focusModel.firstRowKey()).toBe(0);
        });
    });

    describe('lastRowKey()', function() {
        it('마지막 rowKey 를 반환한다.', function() {
            focusModel.focus(2, 'c2');
            expect(focusModel.lastRowKey()).toBe(3);
        });
    });

    describe('firstColumnName()', function() {
        it('첫번째 columnName 을 반환한다.', function() {
            focusModel.focus(2, 'c2');
            expect(focusModel.firstColumnName()).toBe('_number');
        });
    });

    describe('lastColumnName()', function() {
        it('마지막 columnName 을 반환한다.', function() {
            focusModel.focus(2, 'c2');
            expect(focusModel.lastColumnName()).toBe('c3');
        });
    });

    // TODO: TC 구현
    describe('_adjustScroll()', function() {
        // it('현재 focus 위치에 맞추어 scrollTop 과 scrollLeft 값을 반환한다.', function() {
        //     focusModel.focus(0, 'c1');
        //     expect(focusModel._getScrollPosition()).toEqual({scrollLeft: 80});
        //
        //     focusModel.focus(3, 'c2');
        //     expect(focusModel._getScrollPosition()).toEqual({scrollLeft: 81, scrollTop: 3});
        // });
    });

    describe('with rowSpan Data', function() {
        beforeEach(function() {
            grid.dataModel.set([{
                c1: '0-1',
                c2: '0-2',
                c3: '0-3'
            }, {
                _extraData: {
                    rowSpan: {c1: 3}
                },
                c1: '1-1',
                c2: '1-2',
                c3: '1-3'
            }, {
                c2: '2-2',
                c3: '2-3'
            }, {
                c2: '3-2',
                c3: '3-3'
            }, {
                c1: '4-1',
                c2: '4-2',
                c3: '4-3'
            }], {parse: true});
        });

        describe('nextRowIndex()', function() {
            it('offset 만큼 이동한 row 의 index 를 반환한다.', function() {
                focusModel.focus(0, 'c2');
                expect(focusModel.nextRowIndex()).toBe(1);
                expect(focusModel.nextRowIndex(3)).toBe(3);
            });

            it('현재 focus된 row가 rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(1, 'c1');
                expect(focusModel.nextRowIndex()).toBe(4);

                focusModel.focus(2, 'c1');
                expect(focusModel.nextRowIndex()).toBe(4);

                focusModel.focus(0, 'c1');
                expect(focusModel.nextRowIndex(2)).toBe(1);
                expect(focusModel.nextRowIndex(3)).toBe(1);
            });
        });

        describe('prevRowIndex()', function() {
            it('offset 만큼 이동한 row 의 inde 를 반환한다.', function() {
                focusModel.focus(4, 'c2');
                expect(focusModel.prevRowIndex()).toBe(3);
                expect(focusModel.prevRowIndex(3)).toBe(1);
            });

            it('현재 focus된 row가  rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(3, 'c1');
                expect(focusModel.prevRowIndex()).toBe(0);

                focusModel.focus(2, 'c1');
                expect(focusModel.prevRowIndex()).toBe(0);

                focusModel.focus(4, 'c1');
                expect(focusModel.prevRowIndex(2)).toBe(1);
                expect(focusModel.prevRowIndex(3)).toBe(1);
            });
        });

        describe('nextRowKey()', function() {
            it('offset만큼 이동한 row의 rowKey를 반환한다.', function() {
                focusModel.focus(0, 'c2');
                expect(focusModel.nextRowKey()).toBe(1);
                expect(focusModel.nextRowKey(3)).toBe(3);
            });

            it('현재 focus된 row가 rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(1, 'c1');
                expect(focusModel.nextRowKey()).toBe(4);

                focusModel.focus(2, 'c1');
                expect(focusModel.nextRowKey()).toBe(4);

                focusModel.focus(0, 'c1');
                expect(focusModel.nextRowKey(2)).toBe(1);
                expect(focusModel.nextRowKey(3)).toBe(1);
            });
        });

        describe('prevRowKey()', function() {
            it('offset 만큼 이동한 row 의 rowKey를 반환한다.', function() {
                focusModel.focus(4, 'c2');
                expect(focusModel.prevRowKey()).toBe(3);
                expect(focusModel.prevRowKey(3)).toBe(1);
            });

            it('현재 focus된 row가  rowSpan된 경우, rowSpan값을 고려하여 반환한다.', function() {
                focusModel.focus(3, 'c1');
                expect(focusModel.prevRowKey()).toBe(0);

                focusModel.focus(2, 'c1');
                expect(focusModel.prevRowKey()).toBe(0);

                focusModel.focus(4, 'c1');
                expect(focusModel.prevRowKey(2)).toBe(1);
                expect(focusModel.prevRowKey(3)).toBe(1);
            });
        });
    });
});
