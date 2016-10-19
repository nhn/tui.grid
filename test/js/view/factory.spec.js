'use strict';

var Factory = require('view/factory');
var ModelManager = require('model/manager');
var FooterView = require('view/layout/footer');

describe('[view/factory] ', function() {
    var modelManager;

    beforeEach(function() {
        modelManager = new ModelManager();
    });

    describe('createFooter()', function() {
        it('create Footer with options', function() {
            var factory = new Factory({
                modelManager: modelManager,
                footer: {}
            });
            var footer = factory.createFooter('R');

            expect(footer instanceof FooterView).toBe(true);
            expect(footer.whichSide).toBe('R');
            expect(footer.columnModel).toBe(modelManager.columnModel);
            expect(footer.renderModel).toBe(modelManager.renderModel);
            expect(footer.dimensionModel).toBe(modelManager.dimensionModel);
            expect(footer.summaryModel).toBe(modelManager.summaryModel);
        });

        it('set formatters from footer options', function() {
            var columnContents = {
                c1: {template: function() {}},
                c2: {template: function() {}}
            };
            var factory = new Factory({
                modelManager: modelManager,
                footer: {
                    columnContents: columnContents
                }
            });
            var footer = factory.createFooter('R');

            expect(footer.columnTemplateMap).toEqual({
                c1: columnContents.c1.template,
                c2: columnContents.c2.template
            });
        });
    });
});
