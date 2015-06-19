'use strict';

describe('view.rowList', function() {
    var grid, rowListView;

    function createGridMock() {
        var mock = {
            $el: $('<div />'),
            hideGridLayer: function () {},
            dataModel: new Collection.Base(),
            columnModel: new Data.ColumnModel(),
            getElement: function(rowKey, columnName) {
                rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
                return this.$el.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
            }
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
        mock.dataModel = new Data.RowList([], {
            grid: mock
        });
        mock.cellFactory = new View.CellFactory({
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        grid.columnModel.set('columnModelList', [{
            columnName: 'c1',
            editOption: {
                type: 'normal'
            }
        }, {
            columnName: 'c2',
            editOption: {
                type: 'text'
            }
        }, {
            columnName: 'c3',
            editOption: {
                type: 'select',
                list: [
                    {text: 's1', value: 's1'},
                    {text: 's2', vlaue: 's2'}
                ]
            }
        }]);
        grid.dataModel.set([
            {
                c1: '0-1',
                c2: '0-2',
                c3: 's1'
            }, {
                c1: '1-1',
                c2: '1-2',
                c3: 's2'
            }
        ], {parse: true});

        grid.renderModel.refresh();

        rowListView = new View.RowList({
            whichSide: 'R',
            grid: grid,
            collection: grid.renderModel.getCollection('R')
        });
        rowListView.render();

        grid.$el.append(rowListView.$el);
    });

    afterEach(function() {
        rowListView.destroy();
    });

    describe('RowPainter 를 테스트한다.', function() {
        var rowPainter;

        beforeEach(function() {
            rowPainter = rowListView.rowPainter;
        });

        describe('_getEditType', function() {
            it('_number 일 경우 isEditable 과 관계없이 무조건 _number 을 리턴한다.', function() {
                expect(rowPainter._getEditType('_number', {isEditable: false})).toEqual('_number');
                expect(rowPainter._getEditType('_number', {isEditable: true})).toEqual('_number');
            });

            it('isEditable이 false 이고 _number가 아닐 경우 무조건 normal을 리턴한다.', function() {
                expect(rowPainter._getEditType('c1', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('c2', {isEditable: false})).toEqual('normal');
                expect(rowPainter._getEditType('c3', {isEditable: false})).toEqual('normal');
            });

            it('그 외의 경우 정확한 editType 을 반환한다.', function() {
                expect(rowPainter._getEditType('c1', {isEditable: true})).toEqual('normal');
                expect(rowPainter._getEditType('c2', {isEditable: true})).toEqual('text');
                expect(rowPainter._getEditType('c3', {isEditable: true})).toEqual('select');
            });
        });

        describe('_getRowElement', function() {
            it('현재 rendering된 엘리먼트 중, rowKey에 해당하는 엘리먼트를 반환한다.', function() {
                expect(rowPainter._getRowElement(0).length).toEqual(1);
                expect(rowPainter._getRowElement(0).attr('key')).toEqual('0');
                expect(rowPainter._getRowElement(1).length).toEqual(1);
                expect(rowPainter._getRowElement(1).attr('key')).toEqual('1');
                expect(rowPainter._getRowElement(2).length).toEqual(0);
            });
        });

        describe('_onFocus, _onBlur', function() {
            it('rendering 된 엘리먼트 중 해당하는 엘리먼트에 focus, blur 디자인 클래스를 적용한다.', function() {
                var $firstCell = rowListView.$el.find('tr:first').find('td').eq(1); // 0번째는 _button임

                rowPainter._onFocus(0, 'c1');
                expect($firstCell).toHaveClass('focused');

                rowPainter._onBlur(0, 'c1');
                expect($firstCell).not.toHaveClass('focused');
            });
        });

        describe('_onSelect, _onUnselect', function() {
            var $firstRowCells;

            beforeEach(function() {
                $firstRowCells = rowListView.$el.find('tr:first').find('td');
            });

            it('_onSelect 호출시 _setCssSelect 를 true 로 호출한다.', function() {
                rowPainter._onSelect(0);
                $firstRowCells.each(function() {
                    expect(this).toHaveClass('selected');
                });
            });

            it('_onUnselect 호출시 _setCssSelect 를 false 로 호출한다.', function() {
                rowPainter._onUnselect(0);
                $firstRowCells.each(function() {
                    expect(this).not.toHaveClass('selected');
                });
            });
        });
    });

    describe('RowList 를 테스트한다.', function() {
        describe('_showLayer', function() {
            it('row의 length가 0일 경우 grid.showGridLayer를 호출한다.', function() {
                grid.showGridLayer = jasmine.createSpy('showGridLayer');
                grid.dataModel.set([], {parse: true});
                rowListView._showLayer();
                expect(grid.showGridLayer).toHaveBeenCalledWith('empty');
            });

            it('row의 length가 0이 아닐경우 grid.hideGridLayer를 호출한다.', function() {
                grid.hideGridLayer = jasmine.createSpy('hideGridLayer');
                rowListView._showLayer();
                expect(grid.hideGridLayer).toHaveBeenCalled();
            });
        });

        describe('render', function() {
            it('dataModel 의 rowList 가 변경될 경우, 데이터 내용에 맞게 rendering 한다.', function() {
                var trList = rowListView.$el.find('tr'),
                    tdList = rowListView.$el.find('td');

                expect(trList.length).toBe(2);
                expect(tdList.length).toBe(8);
            });
        });

        describe('_createRowPainter', function() {
            beforeEach(function() {
                rowListView.destroyChildren();
                rowListView.rowPainter = null;
            });

            it('rowPainter 인스턴스를 생성한다..', function() {
                expect(rowListView.rowPainter).toBeNull();
                rowListView._createRowPainter();
                expect(rowListView.rowPainter).not.toBeNull();
            });
        });
    });
});
