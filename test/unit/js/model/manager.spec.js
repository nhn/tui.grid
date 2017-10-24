'use strict';

var $ = require('jquery');

var ModelManager = require('model/manager');
var DomState = require('domState');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var DimensionModel = require('model/dimension');
var SmartRenderModel = require('model/renderer-smart');
var CoordRowModel = require('model/coordRow');
var SummaryModel = require('model/summary');
var ClipboardModel = require('model/clipboard');

describe('model/manager', function() {
    var domState = new DomState($('<div>'));

    describe('creates dimension model', function() {
        it('with options', function() {
            var manager, dimension;
            manager = new ModelManager({
                header: {
                    height: 281
                },
                rowHeight: 72,
                scrollX: true,
                scrollY: true,
                columnOptions: {
                    minWidth: 192
                }
            }, domState);

            dimension = manager.dimensionModel;
            expect(dimension.get('headerHeight')).toBe(281);
            expect(dimension.get('rowHeight')).toBe(72);
            expect(dimension.get('scrollX')).toBe(true);
            expect(dimension.get('scrollY')).toBe(true);
            expect(dimension.get('minimumColumnWidth')).toBe(192);
        });

        it('with options (boolean)', function() {
            var manager, dimension;
            manager = new ModelManager({
                bodyHeight: 'fitToParent',
                scrollX: false,
                scrollY: false
            });

            dimension = manager.dimensionModel;
            expect(dimension.get('fitToParentHeight')).toBe(true);
            expect(dimension.get('scrollX')).toBe(false);
            expect(dimension.get('scrollY')).toBe(false);
        });

        it('with required models', function() {
            var manager, dimension;
            manager = new ModelManager({}, domState);
            dimension = manager.dimensionModel;

            expect(dimension.columnModel instanceof ColumnModel).toBe(true);
            expect(dimension.dataModel instanceof DataModel).toBe(true);
            expect(dimension.domState).toBe(domState);
        });
    });

    describe('creates renderer model', function() {
        it('with options', function() {
            var manager, renderModel, options;
            options = {
                emptyMessage: 'No Data',
                showDummyRows: true
            };
            manager = new ModelManager(options);
            renderModel = manager.renderModel;

            expect(renderModel.get('emptyMessage', options.emptyMessage));
            expect(renderModel.get('showDummyRows', options.showDummyRows));
        });

        it('with required models', function() {
            var manager, renderModel;
            manager = new ModelManager();
            renderModel = manager.renderModel;

            expect(renderModel.columnModel instanceof ColumnModel).toBe(true);
            expect(renderModel.dataModel instanceof DataModel).toBe(true);
            expect(renderModel.dimensionModel instanceof DimensionModel).toBe(true);
        });

        it('if virtualScrolling:false, instance should not be SmartRenderer', function() {
            var manager = new ModelManager({
                virtualScrolling: false
            });

            expect(manager.renderModel).not.toEqual(jasmine.any(SmartRenderModel));
        });

        it('if virtualScrolling:true, instance should be SmartRenderer', function() {
            var manager = new ModelManager({
                rowHeight: 10,
                virtualScrolling: true
            });

            expect(manager.renderModel).toEqual(jasmine.any(SmartRenderModel));
        });
    });

    describe('creates summary model', function() {
        it('only if summary.columnContent option exists', function() {
            var manager1 = new ModelManager();
            var manager2 = new ModelManager({
                summary: {
                    columnContent: {}
                }
            });

            expect(manager1.summaryModel).toBe(null);
            expect(manager2.summaryModel).toEqual(jasmine.any(SummaryModel));
        });

        it('with dataModel', function() {
            var manager = new ModelManager({
                summary: {columnContent: {}}
            });

            expect(manager.summaryModel.dataModel).toEqual(jasmine.any(DataModel));
        });

        it('with autoColumnes which contains columnNames only which has a template function' +
            'and its useAutoSummary is not false', function() {
            var manager = new ModelManager({
                summary: {
                    columnContent: {
                        c1: {
                            template: function() {}
                        },
                        c2: {
                            useAutoSummary: false,
                            template: function() {}
                        },
                        c3: {}
                    }
                }
            });
            expect(manager.summaryModel.autoColumnNames).toEqual(['c1']);
        });
    });

    it('creates coordRow model', function() {
        var manager = new ModelManager();

        expect(manager.coordRowModel).toEqual(jasmine.any(CoordRowModel));
    });

    it('creates clipboard model', function() {
        var manager = new ModelManager({
            copyOptions: {
                useFormattedValue: true
            }
        });

        expect(manager.clipboardModel).toEqual(jasmine.any(ClipboardModel));
        expect(manager.clipboardModel.copyOptions.useFormattedValue).toBe(true);
    });
});
