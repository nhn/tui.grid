'use strict';

var Factory = require('view/factory');
var ModelManager = require('model/manager');
var FooterView = require('view/layout/footer');
var frameConst = require('common/constMap').frame;

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
            var footer = factory.createFooter(frameConst.R);

            expect(footer instanceof FooterView).toBe(true);
            expect(footer.whichSide).toBe(frameConst.R);
            expect(footer.columnModel).toBe(modelManager.columnModel);
            expect(footer.renderModel).toBe(modelManager.renderModel);
            expect(footer.dimensionModel).toBe(modelManager.dimensionModel);
            expect(footer.summaryModel).toBe(modelManager.summaryModel);
        });

        it('set formatters from footer options', function() {
            var columnContent = {
                c1: {template: function() {}},
                c2: {template: function() {}}
            };
            var factory = new Factory({
                modelManager: modelManager,
                footer: {
                    columnContent: columnContent
                }
            });
            var footer = factory.createFooter(frameConst.R);

            expect(footer.columnTemplateMap).toEqual({
                c1: columnContent.c1.template,
                c2: columnContent.c2.template
            });
        });
    });
});
