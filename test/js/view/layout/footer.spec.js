'use strict';

var ModelManager = require('model/manager');
var DomState = require('domState');
var ViewFactory = require('view/factory');

fdescribe('Footer', function() {
    var footer, modelManager, viewFactory;

    beforeEach(function() {
        modelManager = new ModelManager(null, new DomState($('<div>')));
        viewFactory = new ViewFactory({
            modelManager: modelManager
        });
        modelManager.columnModel.set('columnModelList', [
            {
                columnName: 'c1',
                width: 50
            },
            {
                columnName: 'c2',
                width: 60
            }
        ]);
        footer = viewFactory.createFooter('R');
    });

    describe('render()', function() {
        it('render nothing if dimension.footerHeight is 0', function() {
            footer.dimensionModel.set('footerHeight', 0);
            footer.render();

            expect(footer.$el).toBeEmpty();
        });

        it('height of table should be same as dimension.footerHeight', function() {
            var height = 50;

            footer.dimensionModel.set('footerHeight', height);
            footer.render();

            expect(footer.$el.find('table').height()).toBe(height);
        });

        it('width of each column should be the same as the result of dimension.getColumnWidthList()', function() {
            var widthList = footer.dimensionModel.getColumnWidthList('R');
            var $ths;

            footer.dimensionModel.set('footerHeight', 30);
            footer.render();

            $ths = footer.$el.find('th');
            expect($ths.eq(0).width()).toBe(widthList[0]);
            expect($ths.eq(1).width()).toBe(widthList[1]);
        });
    });
});
