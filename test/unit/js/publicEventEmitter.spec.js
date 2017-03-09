'use strict';

var PublicEventEmitter = require('publicEventEmitter');

function testTrigger(target, publicObject, eventName, publicEventName) {
    var eventData = {},
        callbackSpy = jasmine.createSpy('callback');

    publicObject.on(publicEventName || eventName, callbackSpy);
    target.trigger(eventName, eventData);
    expect(callbackSpy).toHaveBeenCalledWith(eventData);
}

describe('publicEventEmitter', function() {
    var emitter, target, publicObject;

    beforeEach(function() {
        publicObject = new Backbone.Model();
        emitter = new PublicEventEmitter(publicObject);
        target = new Backbone.Model();
    });

    describe('listenToNetAddon', function() {
        beforeEach(function() {
            emitter.listenToNetAddon(target);
        });

        it('should listen beforeRequest event', function() {
            testTrigger(target, publicObject, 'beforeRequest');
        });

        it('should listen response event', function() {
            testTrigger(target, publicObject, 'response');
        });

        it('should listen successResponse event', function() {
            testTrigger(target, publicObject, 'successResponse');
        });

        it('should listen failResponse event', function() {
            testTrigger(target, publicObject, 'failResponse');
        });

        it('should listen errorResponse event', function() {
            testTrigger(target, publicObject, 'errorResponse');
        });
    });

    describe('listenToContainerView', function() {
        beforeEach(function() {
            emitter.listenToContainerView(target);
        });

        it('should listen click event', function() {
            testTrigger(target, publicObject, 'click');
        });

        it('should listen dblclick event', function() {
            testTrigger(target, publicObject, 'dblclick');
        });

        it('should listen mousedown event', function() {
            testTrigger(target, publicObject, 'mousedown');
        });

        it('should listen clickCell event', function() {
            testTrigger(target, publicObject, 'clickCell');
        });

        it('should listen dblclickCell event', function() {
            testTrigger(target, publicObject, 'dblclickCell');
        });

        it('should listen mouseoverCell event', function() {
            testTrigger(target, publicObject, 'mouseoverCell');
        });

        it('should listen mouseoutCell event', function() {
            testTrigger(target, publicObject, 'mouseoutCell');
        });

        it('should listen rendered event', function() {
            testTrigger(target, publicObject, 'rendered');
        });
    });

    describe('listenToFocusModel', function() {
        beforeEach(function() {
            emitter.listenToFocusModel(target);
        });

        it('should listen select event and trigger it as selectRow event', function() {
            testTrigger(target, publicObject, 'select', 'selectRow');
        });
    });

    describe('listenToDataModel', function() {
        beforeEach(function() {
            emitter.listenToDataModel(target);
        });

        it('should listen check event', function() {
            testTrigger(target, publicObject, 'check');
        });

        it('should listen uncheck event', function() {
            testTrigger(target, publicObject, 'uncheck');
        });
    });
});
