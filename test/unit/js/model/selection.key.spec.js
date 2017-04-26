'use strict';

var _ = require('underscore');

var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');
var DomEventBus = require('event/domEventBus');
var SelectionModel = require('model/selection');

function create() {
    var domEventBus = DomEventBus.create();
    var columnModel = new ColumnModel({
        columns: [
            {name: 'c1'},
            {name: 'c2'},
            {name: 'c3'},
            {name: 'c4'},
            {name: 'c5'}
        ]
    });
    var dataModel = new DataModel(null, {
        columnModel: columnModel
    });

    dataModel.setData([
        {}, {}, {}, {}, {}
    ]);

    return new SelectionModel({
        selectionUnit: 'cell'
    }, {
        columnModel: columnModel,
        dataModel: dataModel,
        domEventBus: domEventBus
    });
}

describe('model/selection key events', function() {
    it('key:move event', function() {
        var selection = create();
        spyOn(selection, 'end');
        selection.domEventBus.trigger('key:move', {});

        expect(selection.end).toHaveBeenCalled();
    });

    it('key:edit event', function() {
        var selection = create();
        spyOn(selection, 'end');
        selection.domEventBus.trigger('key:edit', {});

        expect(selection.end).toHaveBeenCalled();
    });

    describe('key:delete event', function() {
        var selection;

        beforeEach(function() {
            selection = create();
        });
        it('when range exist', function() {
            var range = {
                row: [1, 2],
                column: [1, 2]
            };
            selection.set('range', range);
            spyOn(selection.dataModel, 'delRange');

            selection.domEventBus.trigger('key:delete');

            expect(selection.dataModel.delRange).toHaveBeenCalledWith(range);
        });

        it('when range does not exist', function() {
            spyOn(selection.dataModel, 'del');
            selection.focusModel = {
                which: _.constant({
                    rowKey: 0,
                    columnName: 'c1'
                })
            };

            selection.domEventBus.trigger('key:delete');

            expect(selection.dataModel.del).toHaveBeenCalledWith(0, 'c1');
        });
    });

    describe('key:select event', function() {
        var selection;

        function triggerSelectEvent(command) {
            selection.domEventBus.trigger('key:select', {command: command});
        }

        beforeEach(function() {
            selection = create();
            selection._getRecentAddress = _.constant({
                row: 2,
                column: 2
            });
            spyOn(selection, 'update');
            spyOn(selection, '_scrollTo');
        });

        it('up', function() {
            triggerSelectEvent('up');
            expect(selection.update).toHaveBeenCalledWith(1, 2, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(1, 2);
        });

        it('down', function() {
            triggerSelectEvent('down');
            expect(selection.update).toHaveBeenCalledWith(3, 2, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(3, 2);
        });

        it('left', function() {
            triggerSelectEvent('left');
            expect(selection.update).toHaveBeenCalledWith(2, 1, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 1);
        });

        it('right', function() {
            triggerSelectEvent('right');
            expect(selection.update).toHaveBeenCalledWith(2, 3, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 3);
        });

        it('firstColumn', function() {
            triggerSelectEvent('firstColumn');
            expect(selection.update).toHaveBeenCalledWith(2, 0, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 0);
        });

        it('lastColumn', function() {
            triggerSelectEvent('lastColumn');
            expect(selection.update).toHaveBeenCalledWith(2, 4, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 4);
        });

        it('firstCell', function() {
            triggerSelectEvent('firstCell');
            expect(selection.update).toHaveBeenCalledWith(0, 0, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(0, 0);
        });

        it('lastCell', function() {
            triggerSelectEvent('lastCell');
            expect(selection.update).toHaveBeenCalledWith(4, 4, 'CELL');
            expect(selection._scrollTo).toHaveBeenCalledWith(4, 4);
        });

        it('all', function() {
            spyOn(selection, 'selectAll');
            triggerSelectEvent('all');

            expect(selection.selectAll).toHaveBeenCalled();
        });

        describe('move page', function() {
            beforeEach(function() {
                selection.coordRowModel = {
                    getPageMovedIndex: function(rowIndex, isDownDir) {
                        return isDownDir ? 4 : 0;
                    }
                };
            });

            it('pageUp', function() {
                triggerSelectEvent('pageUp');
                expect(selection.update).toHaveBeenCalledWith(0, 2, 'CELL');
                expect(selection._scrollTo).toHaveBeenCalledWith(0, 2);
            });

            it('pageDown', function() {
                triggerSelectEvent('pageDown');
                expect(selection.update).toHaveBeenCalledWith(4, 2, 'CELL');
                expect(selection._scrollTo).toHaveBeenCalledWith(4, 2);
            });
        });
    });
});
