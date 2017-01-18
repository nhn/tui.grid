'use strict';

var GridEvent = require('event/gridEvent');

describe('event/gridEvent', function() {
    it('constructor copy all of the properties from given object', function() {
        var ev = new GridEvent({
            paramNum: 1,
            paramStr: 'hi'
        });

        expect(ev.paramNum).toBe(1);
        expect(ev.paramStr).toBe('hi');
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
