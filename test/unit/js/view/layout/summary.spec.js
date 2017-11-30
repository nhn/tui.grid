'use strict';

var $ = require('jquery');

var ModelManager = require('model/manager');
var DomState = require('domState');
var ViewFactory = require('view/factory');
var frameConst = require('common/constMap').frame;

var CELL_BORDER_WIDTH = require('common/constMap').dimension.CELL_BORDER_WIDTH;

function create(whichSide, options) {
    var modelManager = new ModelManager(options, new DomState($('<div>')));
    var viewFactory = new ViewFactory({
        modelManager: modelManager,
        summary: options.summary
    });

    return viewFactory.createSummary(whichSide);
}

describe('Summary', function() {
    describe('render()', function() {
        var summary;

        beforeEach(function() {
            summary = create(frameConst.R, {
                columns: [{
                    name: 'c1',
                    width: 50
                }, {
                    name: 'c2',
                    width: 60
                }],
                summary: {}
            });
            summary.dimensionModel.set('summaryHeight', 30);
        });

        it('render nothing if dimension.summaryHeight is 0', function() {
            summary.dimensionModel.set('summaryHeight', 0);
            summary.render();

            expect(summary.$el).toBeEmpty();
        });

        it('height of table should be same as dimension.summaryHeight', function() {
            summary.render();

            expect(summary.$el.find('table').height()).toBe(30);
        });

        it('width of each column should be the same as the result of coordColumnModel.getWidths()', function() {
            var widths, $cols;

            summary.render();

            widths = summary.coordColumnModel.getWidths(frameConst.R);
            $cols = summary.$el.find('col');
            expect($cols.eq(0).width()).toBe(widths[0] + CELL_BORDER_WIDTH);
            expect($cols.eq(1).width()).toBe(widths[1] + CELL_BORDER_WIDTH);
        });

        it('If the summaryModel does not exist, values should be empty', function() {
            var $cols;

            summary.render();

            $cols = summary.$el.find('col');
            expect($cols.eq(0).html()).toBe('');
            expect($cols.eq(1).html()).toBe('');
        });

        it('If the summaryModel exists, use summary values for HTML of <th>', function() {
            var summaryMap = {
                c1: {
                    sum: 10,
                    avg: 0.4
                },
                c2: {
                    max: 10
                }
            };
            var $ths;

            summary.summaryModel = {
                getValue: function(columnName) {
                    return summaryMap[columnName];
                }
            };
            summary.render();

            $ths = summary.$el.find('th');
            expect($ths.eq(0).html('10, 0.4'));
            expect($ths.eq(1).html('10'));
        });

        it('If a template function exists, use it for generating HTML of <th>', function() {
            var $ths;

            function fmt1() {
                return 'formatted1';
            }
            function fmt2() {
                return 'formatted2';
            }

            summary.columnTemplateMap = {
                c1: fmt1,
                c2: fmt2
            };
            summary.render();
            $ths = summary.$el.find('th');

            expect($ths.eq(0).html()).toBe(fmt1());
            expect($ths.eq(1).html()).toBe(fmt2());
        });

        it('Template should take a value from the summaryModel as a paramater', function() {
            var fmt1 = jasmine.createSpy();
            var fmt2 = jasmine.createSpy();
            var summaryMap = {
                c1: {sum: 10},
                c2: {max: 5}
            };

            summary.summaryModel = {
                getValue: function(columnName) {
                    return summaryMap[columnName];
                }
            };
            summary.columnTemplateMap = {
                c1: fmt1,
                c2: fmt2
            };

            summary.render();

            expect(fmt1).toHaveBeenCalledWith(summaryMap.c1);
            expect(fmt2).toHaveBeenCalledWith(summaryMap.c2);
        });
    });

    it('If the setSummaryContent event occurs on columnModel, refresh <th>', function() {
        var summary = create(frameConst.R, {
            columns: [
                {name: 'c1'},
                {name: 'c2'}
            ],
            summary: {
                height: 30,
                columnContent: {}
            }
        });

        summary.render();
        summary.columnModel.trigger('setSummaryContent', 'c1', 'contents');

        expect(summary.$el.find('th').eq(0).html()).toBe('contents');
    });

    it('Refresh <th> whenever change event occurs on the summaryModel', function() {
        var summary = create(frameConst.R, {
            columns: [
                {name: 'c1'},
                {name: 'c2'}
            ],
            summary: {
                height: 30,
                columnContent: {
                    c1: {
                        template: function(valueMap) {
                            return String(valueMap.sum);
                        }
                    }
                }
            }
        });

        summary.render();
        summary.summaryModel.trigger('change', 'c1', {
            sum: 10
        });

        expect(summary.$el.find('th').eq(0).html()).toBe('10');
    });
});
