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
    function createForRender(summaryOptions) {
        var summary = create(frameConst.R, {
            columns: [{
                name: 'c1',
                width: 50
            }, {
                name: 'c2',
                width: 60
            }],
            summary: summaryOptions
        });

        return summary;
    }

    describe('render()', function() {
        it('render nothing if dimension.summaryHeight is 0', function() {
            var summary = createForRender({});

            summary.render();

            expect(summary.$el).toBeEmpty();
        });

        it('height of table should be same as dimension.summaryHeight', function() {
            var summary = createForRender({
                height: 30,
                columnContent: {
                    c1: {
                        template: function() {
                            return '';
                        }
                    }
                }
            });

            summary.render();

            expect(summary.$el.find('table').height()).toBe(30);
        });

        it('width of each column should be the same as the result of coordColumnModel.getWidths()', function() {
            var summary = createForRender({
                height: 30,
                columnContent: {
                    c1: {
                        template: function() {
                            return '';
                        }
                    }
                }
            });
            var widths, $cols;

            summary.render();

            widths = summary.coordColumnModel.getWidths(frameConst.R);
            $cols = summary.$el.find('col');
            expect($cols.eq(0).width()).toBe(widths[0] + CELL_BORDER_WIDTH);
            expect($cols.eq(1).width()).toBe(widths[1] + CELL_BORDER_WIDTH);
        });

        it('If a template function exists, use it for generating HTML of <th>', function() {
            var summary = createForRender({
                height: 30,
                columnContent: {
                    c1: {
                        template: function() {
                            return 'C1';
                        }
                    },
                    c2: {
                        template: function() {
                            return 'C2';
                        }
                    }

                }
            });
            var $tds;

            summary.render();
            $tds = summary.$el.find('td');

            expect($tds.eq(0).html()).toBe('C1');
            expect($tds.eq(1).html()).toBe('C2');
        });
    });

    it('Refresh <td> whenever change event occurs on the summaryModel', function() {
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

        expect(summary.$el.find('td').eq(0).html()).toBe('10');
    });
});
