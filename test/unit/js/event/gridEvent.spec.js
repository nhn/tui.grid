'use strict';

var GridEvent = require('event/gridEvent');

describe('event/gridEvent', function() {
    describe('contructor', function() {
        it('set nativeEvent property with a first argument', function() {
            var nativeEvent = {};
            var gridEvent = new GridEvent(nativeEvent);

            expect(gridEvent.nativeEvent).toBe(nativeEvent);
        });

        it('constructor copy all of the properties from given object', function() {
            var ev = new GridEvent(null, {
                paramNum: 1,
                paramStr: 'hi'
            });

            expect(ev.paramNum).toBe(1);
            expect(ev.paramStr).toBe('hi');
        });
    });

    it('setData() copy all of the properties from given object', function() {
        var ev = new GridEvent();
        ev.setData({
            paramNum: 1,
            paramStr: 'hi'
        });

        expect(ev.paramNum).toBe(1);
        expect(ev.paramStr).toBe('hi');
    });

    it('isStopped state is false when initiliazed', function() {
        var ev = new GridEvent();
        expect(ev.isStopped()).toBe(false);
    });

    it('stop() change the isStopped state', function() {
        var ev = new GridEvent();
        ev.stop();
        expect(ev.isStopped()).toBe(true);
    });
});
