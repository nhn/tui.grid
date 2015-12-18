'use strict';

var Clipboard = require('../../src/js/view/clipboard');
var Model = require('../../src/js/base/model');

describe('grid paste test', function() {
    var clipboard;

    beforeEach(function() {
        clipboard = new Clipboard({
            grid: {
                focusModel: new Model()
            }
        });
    });

    it('define', function() {
        expect(clipboard).toBeDefined();
    });


    describe('_getProcessClipBoardData', function() {
        it('one line', function() {
            var txt = 'aaa\tbbb\tccc',
                result;

            clipboard.$el.val(txt);
            result = clipboard._getProcessClipBoardData();
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(3);
        });

        it('two line', function() {
            var txt = 'aaa\tbbb\tccc\nddd\teee\tfff',
                result;

            clipboard.$el.val(txt);
            result = clipboard._getProcessClipBoardData();
            expect(result.length).toBe(2);
            expect(result[1][0]).toBe('ddd');
        });
    });

    describe('_pasteToGrid', function() {
        var result,
            txt;
        beforeEach(function() {
            clipboard.grid = {
                dataModel: {
                    paste: function(r) {
                        result = r;
                    }
                }
            };
            txt = 'aaa\tbbb\tccc\nddd\teee\tfff';
            clipboard.$el.val(txt);
        });

        it('paste to grid', function() {
            var res = clipboard._getProcessClipBoardData();
            clipboard._pasteToGrid();
            expect(result).toEqual(res);
        });

        it('paste to grid Repeatedly', function() {
            var res = clipboard._getProcessClipBoardData();
            clipboard._pasteToGrid();
            clipboard._pasteToGrid();
            clipboard._pasteToGrid();
            expect(result).toEqual(res);
        });
    });

    describe('_paste', function() {
        var runned;
        beforeEach(function() {
            runned = false;
            clipboard._onKeyupCharV = function() {
                runned = true;
            };
        });
        it('paste date, while pasting', function() {
            clipboard.pasting = true;
            clipboard._paste();
            expect(runned).toBe(false);
        });

        it('paste date, while idle', function() {
            clipboard._paste();
            expect(runned).toBe(true);
        });
    });

    describe('keyup event fire flow', function() {
        var result,
            txt;

        beforeEach(function() {
            clipboard.pasting = false;
            clipboard.grid = {
                dataModel: {
                    paste: function(r) {
                        result = r;
                    }
                }
            };
        });

        it('change pasting', function() {
            var fststatus = clipboard.pasting,
                sndstatus;
            clipboard._paste();
            sndstatus = clipboard.pasting;
            clipboard.onKeyupCharV();
            expect(clipboard.pasting).toBe(fststatus);
            expect(clipboard.pasting).not.toBe(sndstatus);
        });

        it('result check', function() {
            var res;
            clipboard._paste();
            txt = 'aaa\tbbb\tccc\nddd\teee\tfff';
            clipboard.$el.val(txt);
            clipboard.onKeyupCharV();
            res = clipboard._getProcessClipBoardData();
            expect(res).toEqual(result);
        });
    });
});
