'use strict';

var _ = require('underscore');

var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var FocusModel = require('model/focus');
var DomEventBus = require('event/domEventBus');

describe('model/focus', function() {
    function create(options) {
        var columnModel, dataModel;

        columnModel = new ColumnModelData({
            columns: _.map(['c1', 'c2', 'c3', 'c4', 'c5'], function(name) {
                return {
                    name: name,
                    editOptions: {
                        type: 'text'
                    }
                };
            })
        });
        dataModel = new RowListData([], {
            columnModel: columnModel
        });
        dataModel.set([{}, {}, {}, {}, {}], {parse: true});

        return new FocusModel(null, _.extend({
            columnModel: columnModel,
            dataModel: dataModel,
            coordRowModel: {},
            domEventBus: DomEventBus.create()
        }, options));
    }

    describe('key:edit event', function() {
        var focus;

        function triggerEditEvent(command) {
            focus.domEventBus.trigger('key:edit', {command: command});
        }

        beforeEach(function() {
            focus = create();
            focus.focus(2, 'c3');
            spyOn(focus, 'focusIn');
        });

        it('currentCell', function() {
            triggerEditEvent('currentCell');
            expect(focus.focusIn).toHaveBeenCalledWith(2, 'c3', true);
        });

        it('nextCell', function() {
            triggerEditEvent('nextCell');
            expect(focus.focusIn).toHaveBeenCalledWith(2, 'c4', true);
        });

        it('prevCell', function() {
            triggerEditEvent('prevCell');
            expect(focus.focusIn).toHaveBeenCalledWith(2, 'c2', true);
        });
    });

    describe('key:move event', function() {
        var focus;

        function triggerMoveEvent(command) {
            focus.domEventBus.trigger('key:move', {command: command});
        }

        beforeEach(function() {
            focus = create();
            focus.focus(2, 'c3');
        });

        it('up', function() {
            triggerMoveEvent('up');
            expect(focus.which()).toEqual({
                rowKey: 1,
                columnName: 'c3'
            });
        });

        it('down', function() {
            triggerMoveEvent('down');
            expect(focus.which()).toEqual({
                rowKey: 3,
                columnName: 'c3'
            });
        });

        it('left', function() {
            triggerMoveEvent('left');
            expect(focus.which()).toEqual({
                rowKey: 2,
                columnName: 'c2'
            });
        });

        it('right', function() {
            triggerMoveEvent('right');
            expect(focus.which()).toEqual({
                rowKey: 2,
                columnName: 'c4'
            });
        });

        it('firstColumn', function() {
            triggerMoveEvent('firstColumn');
            expect(focus.which()).toEqual({
                rowKey: 2,
                columnName: 'c1'
            });
        });

        it('lastColumn', function() {
            triggerMoveEvent('lastColumn');
            expect(focus.which()).toEqual({
                rowKey: 2,
                columnName: 'c5'
            });
        });

        it('firstCell', function() {
            triggerMoveEvent('firstCell');
            expect(focus.which()).toEqual({
                rowKey: 0,
                columnName: 'c1'
            });
        });

        it('lastCell', function() {
            triggerMoveEvent('lastCell');
            expect(focus.which()).toEqual({
                rowKey: 4,
                columnName: 'c5'
            });
        });

        describe('move page', function() {
            beforeEach(function() {
                focus.coordRowModel.getPageMovedIndex = function(rowIndex, isDownDir) {
                    return isDownDir ? 4 : 0;
                };
            });

            it('pageUp', function() {
                triggerMoveEvent('pageUp');
                expect(focus.which()).toEqual({
                    rowKey: 0,
                    columnName: 'c3'
                });
            });

            it('pageDown', function() {
                triggerMoveEvent('pageDown');
                expect(focus.which()).toEqual({
                    rowKey: 4,
                    columnName: 'c3'
                });
            });
        });
    });
});
