'use strict';

var Factory = require('view/factory');
var SummaryView = require('view/layout/summary');
var HeightResizeHandleVeiw = require('view/heightResizeHandle');
var frameConst = require('common/constMap').frame;

describe('[view/factory] ', function() {
    var modelManager;

    beforeEach(function() {
        modelManager = {
            columnModel: {},
            renderModel: {},
            dimesnionModel: {},
            summaryModel: {}
        };
    });

    describe('createResizeHandle()', function() {
        it('create resizeHandle with options', function() {
            var domEventBus = {};
            var factory = new Factory({
                modelManager: modelManager,
                domEventBus: domEventBus,
                heightResizable: true
            });
            var resizeHandle = factory.createHeightResizeHandle();

            expect(resizeHandle instanceof HeightResizeHandleVeiw).toBe(true);
            expect(resizeHandle.diemnsionModel).toBe(modelManager.dimensionModel);
            expect(resizeHandle.domEventBus).toBe(domEventBus);
        });

        it('if heightResizable:false, return null', function() {
            var factory = new Factory({heightResizable: false});

            expect(factory.createHeightResizeHandle()).toBeNull();
        });
    });

    describe('createSummary()', function() {
        it('create Summary with options', function() {
            var factory = new Factory({
                modelManager: modelManager,
                summary: {}
            });
            var summary = factory.createSummary(frameConst.R);

            expect(summary instanceof SummaryView).toBe(true);
            expect(summary.whichSide).toBe(frameConst.R);
            expect(summary.columnModel).toBe(modelManager.columnModel);
            expect(summary.renderModel).toBe(modelManager.renderModel);
            expect(summary.dimensionModel).toBe(modelManager.dimensionModel);
            expect(summary.summaryModel).toBe(modelManager.summaryModel);
        });

        it('set formatters from summary options', function() {
            var columnContent = {
                c1: {template: function() {}},
                c2: {template: function() {}}
            };
            var factory = new Factory({
                modelManager: modelManager,
                summary: {
                    columnContent: columnContent
                }
            });
            var summary = factory.createSummary(frameConst.R);

            expect(summary.columnTemplateMap).toEqual({
                c1: columnContent.c1.template,
                c2: columnContent.c2.template
            });
        });
    });
});
