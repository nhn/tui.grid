'use strict';

var _ = require('underscore');

var Clipboard = require('view/clipboard');
var Model = require('base/model');
var DomEventBus = require('event/domEventBus');
var keyEvent = require('event/keyEvent');

describe('view.clipboard', function() {
    function create() {
        return new Clipboard({
            focusModel: new Model(),
            renderModel: new Model(),
            domEventBus: DomEventBus.create()
        });
    }

    describe('_onKeyDown', function() {
        var eventStub;

        beforeEach(function() {
            eventStub = {
                preventDefault: jasmine.createSpy('preventDefault')
            };
        });

        it('trigger key event', function() {
            var clipboard = create();
            var gridEventStub = {type: 'key:move'};
            var domEventSpy = jasmine.createSpy('domEventSpy');
            keyEvent.generate = _.constant(gridEventStub);

            clipboard.domEventBus.on('key:move', domEventSpy);
            clipboard._onKeyDown(eventStub);

            expect(domEventSpy).toHaveBeenCalledWith(gridEventStub);
        });

        it('should not trigger key event if the command type of key:clipboard is paste', function() {
            var clipboard = create();
            var gridEventStub = {
                type: 'key:clipboard',
                command: 'paste'
            };
            var domEventSpy = jasmine.createSpy('domEventSpy');
            keyEvent.generate = _.constant(gridEventStub);

            clipboard.domEventBus.on('key:clipboard', domEventSpy);
            clipboard._onKeyDown(eventStub);

            expect(domEventSpy).not.toHaveBeenCalledWith(gridEventStub);
        });

        it('should call ev.preventDefault if the type is not key:clipboard', function() {
            var clipboard = create();
            var gridEventStub = {type: 'key:move'};
            keyEvent.generate = _.constant(gridEventStub);

            clipboard._onKeyDown(eventStub);

            expect(eventStub.preventDefault).toHaveBeenCalled();
        });

        it('should not call ev.preventDefault if the type is key:clipboard', function() {
            var clipboard = create();
            var gridEventStub = {type: 'key:clipboard'};
            keyEvent.generate = _.constant(gridEventStub);

            clipboard._onKeyDown(eventStub);

            expect(eventStub.preventDefault).not.toHaveBeenCalled();
        });

        it('should prevent repetitive input for a moment', function() {
            var clipboard = create();
            var gridEventStub = {type: 'key:move'};
            var domEventSpy = jasmine.createSpy('domEventSpy');
            keyEvent.generate = _.constant(gridEventStub);

            jasmine.clock().install();

            clipboard.domEventBus.on('key:move', domEventSpy);
            clipboard._onKeyDown(eventStub);
            clipboard._onKeyDown(eventStub);
            clipboard._onKeyDown(eventStub);

            expect(eventStub.preventDefault.calls.count()).toBe(3);
            expect(domEventSpy.calls.count()).toBe(1);

            jasmine.clock().tick(Clipboard.KEYDOWN_LOCK_TIME);
            clipboard._onKeyDown(eventStub);

            expect(eventStub.preventDefault.calls.count()).toBe(4);
            expect(domEventSpy.calls.count()).toBe(2);

            jasmine.clock().uninstall();
        });
    });
});
