'use strict';

var _ = require('underscore');

var ModelManager = require('model/manager');
var DomState = require('domState');
var DomEventBus = require('event/domEventBus');

function create() {
    var domState = new DomState($('<div>'));
    var domEventBus = DomEventBus.create();
    var columnModelList = [
        {columnName: 'c1'},
        {columnName: 'c2'},
        {columnName: 'c3'},
        {columnName: 'c4'},
        {columnName: 'c5'}
    ];
    var modelManager = new ModelManager({columnModelList: columnModelList}, domState, domEventBus);
    modelManager.dataModel.setRowList([
        {}, {}, {}, {}, {}
    ]);

    return modelManager.selectionModel;
}

describe('model/selection', function() {
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
        it('when range exist', function() {
            var selection = create();
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
            var selection = create();
            spyOn(selection.dataModel, 'del');
            selection.focusModel.focus(0, 'c1');

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
            expect(selection.update).toHaveBeenCalledWith(1, 2);
            expect(selection._scrollTo).toHaveBeenCalledWith(1, 2);
        });

        it('down', function() {
            triggerSelectEvent('down');
            expect(selection.update).toHaveBeenCalledWith(3, 2);
            expect(selection._scrollTo).toHaveBeenCalledWith(3, 2);
        });

        it('left', function() {
            triggerSelectEvent('left');
            expect(selection.update).toHaveBeenCalledWith(2, 1);
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 1);
        });

        it('right', function() {
            triggerSelectEvent('right');
            expect(selection.update).toHaveBeenCalledWith(2, 3);
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 3);
        });

        it('firstColumn', function() {
            triggerSelectEvent('firstColumn');
            expect(selection.update).toHaveBeenCalledWith(2, 0);
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 0);
        });

        it('lastColumn', function() {
            triggerSelectEvent('lastColumn');
            expect(selection.update).toHaveBeenCalledWith(2, 4);
            expect(selection._scrollTo).toHaveBeenCalledWith(2, 4);
        });

        it('firstCell', function() {
            triggerSelectEvent('firstCell');
            expect(selection.update).toHaveBeenCalledWith(0, 0);
            expect(selection._scrollTo).toHaveBeenCalledWith(0, 0);
        });

        it('lastCell', function() {
            triggerSelectEvent('lastCell');
            expect(selection.update).toHaveBeenCalledWith(4, 4);
            expect(selection._scrollTo).toHaveBeenCalledWith(4, 4);
        });

        it('all', function() {
            spyOn(selection, 'selectAll');
            triggerSelectEvent('all');

            expect(selection.selectAll).toHaveBeenCalled();
        });

        describe('move page', function() {
            beforeEach(function() {
                selection.coordRowModel.getPageMovedIndex = function(rowIndex, isDownDir) {
                    return isDownDir ? 4 : 0;
                };
            });

            it('pageUp', function() {
                triggerSelectEvent('pageUp');
                expect(selection.update).toHaveBeenCalledWith(0, 2);
                expect(selection._scrollTo).toHaveBeenCalledWith(0, 2);
            });

            it('pageDown', function() {
                triggerSelectEvent('pageDown');
                expect(selection.update).toHaveBeenCalledWith(4, 2);
                expect(selection._scrollTo).toHaveBeenCalledWith(4, 2);
            });
        });
    });
});
