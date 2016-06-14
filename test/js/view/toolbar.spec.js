'use strict';

var ToolbarView = require('view/toolbar');
var Model = require('base/model');
var classNameConst = require('common/classNameConst');

function create() {
    return new ToolbarView({
        gridId: 1,
        toolbarModel: new Model(),
        dimensionModel: new Model()
    });
}

describe('[view/toolbar] ', function() {
    it('element has toolbar class', function() {
        var toolbar = create();
        expect(toolbar.$el).toHaveClass(classNameConst.TOOLBAR);
    });

    it('when appended event occur, set dimensionModel.toolbarHeight', function() {
        var toolbar = create();

        toolbar.$el.height(100);
        toolbar.trigger('appended');

        expect(toolbar.dimensionModel.get('toolbarHeight')).toBe(100);
    });

    describe('render(): ', function() {
        it('if toolbarModel.isExcelButtonVisible is true, download-page-button should exist', function() {
            var toolbar = create();

            toolbar.toolbarModel.set('isExcelButtonVisible', true);
            toolbar.render();

            expect(toolbar.$el).toContainElement('.' + classNameConst.BTN_EXCEL_PAGE);
        });

        it('if toolbarModel.isExcelButtonVisible is false, download-page-button should not exist', function() {
            var toolbar = create();

            toolbar.toolbarModel.set('isExcelButtonVisible', false);
            toolbar.render();

            expect(toolbar.$el).not.toContainElement('.' + classNameConst.BTN_EXCEL_PAGE);
        });

        it('if toolbarModel.isExcelAllButtonVisible is true, download-all-button should exist', function() {
            var toolbar = create();

            toolbar.toolbarModel.set('isExcelAllButtonVisible', true);
            toolbar.render();

            expect(toolbar.$el).toContainElement('.' + classNameConst.BTN_EXCEL_ALL);
        });

        it('if toolbarModel.isExcelAllButtonVisible is false, download-all-button should not exist', function() {
            var toolbar = create();

            toolbar.toolbarModel.set('isExcelAllButtonVisible', false);
            toolbar.render();

            expect(toolbar.$el).not.toContainElement('.' + classNameConst.BTN_EXCEL_ALL);
        });

        it('should be called, when isExcelButtonVisible or isExcelAllButtonVisible is changed', function() {
            var toolbar, toolbarModel;

            spyOn(ToolbarView.prototype, 'render');
            toolbar = create();
            toolbarModel = toolbar.toolbarModel;

            toolbarModel.set('isExcelButtonVisible', true);
            toolbarModel.set('isExcelAllButtonVisible', true);

            expect(ToolbarView.prototype.render.calls.count()).toBe(2);
        });
    });

    describe('when net addon exist and ', function() {
        function mockGrid(net) {
            tui.Grid.getInstanceById = _.constant({
                getAddOn: _.constant(net)
            });
        }

        function createNetStub() {
            return {
                download: jasmine.createSpy('download')
            };
        }

        it('download-page-button is clicked, call net.download(\'excel\')', function() {
            var net = createNetStub();
            var toolbar = create();

            mockGrid(net);
            toolbar.toolbarModel.set('isExcelButtonVisible', true);
            toolbar.render();
            toolbar.$el.find('.' + classNameConst.BTN_EXCEL_PAGE).trigger('click');

            expect(net.download).toHaveBeenCalledWith('excel');
        });

        it('download-all-button is clicked, call net.download(\'excelAll\')', function() {
            var net = createNetStub();
            var toolbar = create();

            mockGrid(net);
            toolbar.toolbarModel.set('isExcelAllButtonVisible', true);
            toolbar.render();
            toolbar.$el.find('.' + classNameConst.BTN_EXCEL_ALL).trigger('click');

            expect(net.download).toHaveBeenCalledWith('excelAll');
        });
    });
});
