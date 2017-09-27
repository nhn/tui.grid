'use strict';

var keyEvent = require('event/keyEvent');

describe('event.keyEvent', function() {
    describe('generate with normal key', function() {
        it('up', function() {
            var ev = keyEvent.generate({keyCode: 38});

            expect(ev.type).toBe('key:move');
            expect(ev.command).toBe('up');
        });

        it('enter', function() {
            var ev = keyEvent.generate({keyCode: 13});

            expect(ev.type).toBe('key:edit');
            expect(ev.command).toBe('currentCell');
        });

        it('del', function() {
            var ev = keyEvent.generate({keyCode: 46});

            expect(ev.type).toBe('key:delete');
        });
    });

    describe('generate with shift key', function() {
        it('shift-up', function() {
            var ev = keyEvent.generate({
                shiftKey: true,
                keyCode: 38
            });

            expect(ev.type).toBe('key:select');
            expect(ev.command).toBe('up');
        });

        it('shift-tab', function() {
            var ev = keyEvent.generate({
                shiftKey: true,
                keyCode: 9
            });

            expect(ev.type).toBe('key:edit');
            expect(ev.command).toBe('prevCell');
        });
    });

    describe('generate with ctrl/meta key', function() {
        it('ctrl-up', function() {
            var ev = keyEvent.generate({
                ctrlKey: true,
                keyCode: 65
            });

            expect(ev.type).toBe('key:select');
            expect(ev.command).toBe('all');
        });

        it('meta-up', function() {
            var ev = keyEvent.generate({
                metaKey: true,
                keyCode: 65
            });

            expect(ev.type).toBe('key:select');
            expect(ev.command).toBe('all');
        });
    });

    describe('generate with ctrl and shift key', function() {
        it('ctrl-shift-home', function() {
            var ev = keyEvent.generate({
                ctrlKey: true,
                shiftKey: true,
                keyCode: 36
            });

            expect(ev.type).toBe('key:select');
            expect(ev.command).toBe('firstCell');
        });
    });
});
