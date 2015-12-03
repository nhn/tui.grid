'use strict';

var Collection = require('../../src/js/base/collection');
var ColumnModelData = require('../../src/js/data/columnModel');
var RowListData = require('../../src/js/data/rowList');
var Dimension = require('../../src/js/model/dimension');
var Renderer = require('../../src/js/model/renderer');
var LayoutHeader = require('../../src/js/view/layout/header');
var Selection = require('../../src/js/model/selection');

describe('Header', function() {
    var grid, header;

    function createGridMock() {
        var mock = {
            options: {},
            option: function(name) {
                return this.options[name];
            },
            sort: function() {},
            dataModel: new Collection(),
            columnModel: new ColumnModelData({
                columnModelList: [
                    {
                        title: 'c1',
                        columnName: 'c1',
                        width: 30
                    }, {
                        title: 'c2',
                        columnName: 'c2',
                        width: 40
                    }
                ]
            }),
            focusAt: function() {}
        };
        mock.dimensionModel = new Dimension({
            grid: mock
        });
        mock.renderModel = new Renderer({
            grid: mock
        });
        mock.selectionModel = new Selection({
            grid: mock
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        header = new LayoutHeader({
            grid: grid
        });
    });

    describe('render', function() {
        it('el 하위의 HTML 요소를 생성한다.', function() {
            header.render();

            expect(header.$el.find('table').length).toEqual(1);
            expect(header.$el.find('colgroup').length).toEqual(1);
            expect(header.$el.find('tbody').length).toEqual(1);
            expect(header.$el.find('tr').length).toEqual(1);
        });

        it('el의 높이를 dimensionModel의 headerHeight값으로 설정한다.', function() {
            grid.dimensionModel.set('headerHeight', 20);
            header.render();

            expect(header.$el.height()).toEqual(20);
        });

        it('grid.option의 scrollX, scrollY값에 따라 el의 overflow 속성을 설정한다.', function() {
            header.$el.css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            grid.options.scrollX = true;
            grid.options.scrollY = true;
            header.render();
            expect(header.$el.css('overflow-x')).toBe('visible');
            expect(header.$el.css('overflow-y')).toBe('visible');

            grid.options.scrollX = false;
            grid.options.scrollY = false;
            header.render();
            expect(header.$el.css('overflow-x')).toBe('hidden');
            expect(header.$el.css('overflow-y')).toBe('hidden');
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var $colgroup, $cols;

            header.render();

            $colgroup = header.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(2);
            expect($cols.eq(0).width()).toBe(30);
            expect($cols.eq(0).attr('columnname')).toBe('c1');
            expect($cols.eq(1).width()).toBe(40);
            expect($cols.eq(1).attr('columnname')).toBe('c2');
        });

        // TODO: TC 구현
        // it('resize 핸들러를 랜더링 하는지 확인한다.', function() {
        //     var resizeHandlerEl = $('<div />')[0];
        //     spyOn(LayoutHeader, 'ResizeHandler').and.callFake(function() {
        //         this.render = function() {
        //             this.el = resizeHandlerEl;
        //             return this;
        //         };
        //     });
        //
        //     header.render();
        //     expect($(resizeHandlerEl).parent().is(header.$el)).toBe(true);
        // });

        describe('_getHeaderMainCheckbox', function() {
            var lHeader;
            beforeEach(function() {
                lHeader = new LayoutHeader({
                    grid: grid,
                    whichSide: 'L'
                });
            });

            it('header에 checkbox가 랜더링 되었을 때, checkbox를 잘 가져오는지 확인한다.', function() {
                grid.columnModel.set('selectType', 'checkbox');
                lHeader.render();
                expect(lHeader._getHeaderMainCheckbox().length).toBe(1);
            });

            it('header에 checkbox 가 랜더링 되지 않았을 때', function() {
                grid.columnModel.set('selectType', 'radio');
                lHeader.render();
                expect(lHeader._getHeaderMainCheckbox().length).toBe(0);
            });
        });

        describe('_getColumnData()', function() {
            it('columnModelList와 columnWidthList를 반환하는지 확인한다.', function() {
                var columnData = header._getColumnData();
                expect(columnData.widthList.length).toBeGreaterThan(0);
                expect(columnData.modelList.length).toBeGreaterThan(0);
            });
        });
    });

    describe('isSortable 관련 테스트', function() {
        beforeEach(function() {
            grid.columnModel.set('columnModelList', [
                {
                    title: 'c1',
                    columnName: 'c1',
                    isSortable: true
                }, {
                    title: 'c2',
                    columnName: 'c2',
                    isSortable: true
                }, {
                    title: 'c3',
                    columnName: 'c3'
                }
            ]);
            header = new LayoutHeader({
                grid: grid
            });
            header.render();
        });

        it('true인 경우 버튼이 생성된다.', function() {
            var $btns = header.$el.find('a.btn_sorting');

            expect($btns.length).toBe(2);
            expect($btns.eq(0).parent().attr('columnname')).toBe('c1');
            expect($btns.eq(1).parent().attr('columnname')).toBe('c2');
        });

        it('버튼을 클릭하면 grid.sort()를 실행한다.', function() {
            var $btn = header.$el.find('a.btn_sorting');
            spyOn(grid, 'sort');
            $btn.trigger('click');
            expect(grid.sort).toHaveBeenCalled();
        });

        it('dataModel의 sortChanged 이벤트 발생시 정렬 버튼이 갱신된다.', function() {
            var $btns = header.$el.find('a.btn_sorting'),
                eventData = {
                    columnName: 'c1',
                    isAscending: true
                };

            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).toHaveClass('sorting_up');

            eventData.columnName = 'c2';
            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(0)).not.toHaveClass('sorting_up');
            expect($btns.eq(1)).toHaveClass('sorting_up');

            eventData.isAscending = false;
            grid.dataModel.trigger('sortChanged', eventData);
            expect($btns.eq(1)).not.toHaveClass('sorting_up');
            expect($btns.eq(1)).toHaveClass('sorting_down');
        });
    });
});
