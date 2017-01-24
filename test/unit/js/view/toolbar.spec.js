'use strict';

var ToolbarView = require('view/toolbar');
var Model = require('base/model');
var DomEventBus = require('event/domEventBus');
var classNameConst = require('common/classNameConst');

function create() {
    return new ToolbarView({
        toolbarModel: new Model(),
        dimensionModel: new Model(),
        domEventBus: DomEventBus.create()
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

    describe('trigger click:excel', function() {
        var toolbar, clickSpy;

        beforeEach(function() {
            toolbar = create();
            clickSpy = jasmine.createSpy('clickSpy');

            toolbar.domEventBus.on('click:excel', clickSpy);
        });

        it('with page type', function() {
            toolbar.toolbarModel.set('isExcelButtonVisible', true);
            toolbar.render();

            toolbar.$el.find('.' + classNameConst.BTN_EXCEL_PAGE).trigger('click');
            expect(clickSpy.calls.argsFor(0)[0].type).toBe('page');
        });

        it('with all type', function() {
            toolbar.toolbarModel.set('isExcelAllButtonVisible', true);
            toolbar.render();

            toolbar.$el.find('.' + classNameConst.BTN_EXCEL_ALL).trigger('click');
            expect(clickSpy.calls.argsFor(0)[0].type).toBe('all');
        });
    });
});
