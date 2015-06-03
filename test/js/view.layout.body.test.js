'use strict';

/* global Model, Data, View, Collection */
describe('view.layout.body', function() {
    var grid, body;

    function createGridMock() {
        var mock = {
            options: {},
            option: function(name) {
                return this.options[name];
            },
            showGridLayer: function() {

            },
            dataModel: new Collection.Base(),
            columnModel: new Data.ColumnModel({
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
            focusModel: new Model.Base()
        };
        mock.dimensionModel = new Model.Dimension({
            grid: mock
        });
        mock.renderModel = new Model.Renderer({
            grid: mock
        });
        mock.selection = new View.Selection({
            grid: mock
        });
        mock.cellFactory = new View.CellFactory({
            grid: grid
        });
        return mock;
    }

    beforeEach(function() {
        grid = createGridMock();
        body = new View.Layout.Body({
            grid: grid
        });
    });

    afterEach(function() {
        body.destroy();
    });

    describe('initialize', function() {
        it('프라퍼티 기본값으로 whichSide는 R, isScrollSync는 false를 설정한다.', function() {
            expect(body.whichSide).toBe('R');
            expect(body.isScrollSync).toBe(false);
        });
    });

    describe('render()', function() {
        it('whichSide값과 grid.option의 scrollX, scrollY값에 따라 el의 overflow 속성을 설정한다.', function() {
            body.$el.css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            grid.options.scrollX = true;
            grid.options.scrollY = true;
            body.render();
            expect(body.$el.css('overflow-x')).toBe('visible');
            expect(body.$el.css('overflow-y')).toBe('visible');

            grid.options.scrollX = false;
            grid.options.scrollY = false;
            body.whichSide = 'L';
            body.render();
            expect(body.$el.css('overflow-x')).toBe('hidden');
            expect(body.$el.css('overflow-y')).toBe('visible');

            body.whichSide = 'R';
            body.render();
            expect(body.$el.css('overflow-y')).toBe('hidden');
        });

        it('dimensionModel의 bodyHeight값에 따라 height를 설정한다.', function() {
            grid.dimensionModel.set('bodyHeight', 200);
            body.render();
            expect($(body.el).height()).toBe(200);
        });

        it('div.table_container, table, tbody를 생성한다.', function() {
            body.render();
            expect(body.$el).toContainElement('div.table_container>table>tbody');
        });

        it('columnModel의 값에 따라 colgroup을 생성한다.', function() {
            var $colgroup, $cols;

            body.render();

            $colgroup = body.$el.find('colgroup');
            $cols = $colgroup.find('col');

            expect($colgroup.length).toBe(1);
            expect($cols.length).toBe(3);
            expect($cols.eq(1).width()).toBe(30);
            expect($cols.eq(1).attr('columnname')).toBe('c1');
            expect($cols.eq(2).width()).toBe(40);
            expect($cols.eq(2).attr('columnname')).toBe('c2');
        });

        it('selection layer가 생성되었는지 확인한다.', function() {
            body.render();
            $(grid.selection.el).parent().is(body.el);
        });

        it('View.RowList를 생성하고, render를 실행한다.', function() {
            spyOn(View.RowList.prototype, 'render');

            body.render();
            expect(View.RowList.prototype.render).toHaveBeenCalled();
        });
    });

    describe('grid.renderModel의 refresh 이벤트 발생시', function() {
        beforeEach(function() {
            jasmine.getFixtures().set('<div id="wrapper" />');
            $('#wrapper').append(body.render().el);
        });

        it('넘겨진 값으로 css top 속성을 설정한다.', function() {
            var $container = body.$el.find('.table_container');
            $container.css('position', 'absolute'); // css 파일에서 설정됨

            grid.renderModel.trigger('refresh', 10);
            expect($container.css('top')).toEqual('10px');

            grid.renderModel.trigger('refresh', 20);
            expect($container.css('top')).toEqual('20px');
        });
    });

    describe('grid.dimensionModel의 change:bodyHeight 이벤트 발생시', function() {
        it('el의 height를 dimensionModel의 bodyHeight 값으로 설정한다.', function() {
            grid.dimensionModel.set('bodyHeight', 70);
            expect(body.$el.height()).toBe(70);

            grid.dimensionModel.set('bodyHeight', 80);
            expect(body.$el.height()).toBe(80);
        });
    });

    describe('grid.dimensionModel의 columnWidthChanged 이벤트 발생시', function() {
        it('각 col요소의 넓이를 재설정한다.', function() {
            var $cols;

            body.render();
            $cols = body.$el.find('col');

            $cols.eq(1).width(10);
            expect($cols.eq(1).width()).toBe(10);

            grid.dimensionModel.trigger('columnWidthChanged');
            expect($cols.eq(1).width()).toBe(30);
        });
    });
});
