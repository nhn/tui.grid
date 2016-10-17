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
                modelManager: modelManager
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
            var columnSummary = {
                c1: {formatter: function() {}},
                c2: {formatter: function() {}}
            };
            var factory = new Factory({
                modelManager: modelManager,
                footer: {
                    columnSummary: columnSummary
                }
            });
            var footer = factory.createFooter('R');

            expect(footer.formatters).toEqual({
                c1: columnSummary.c1.formatter,
                c2: columnSummary.c2.formatter
            });
        });
    });
});
