'use strict';

var Clipboard = require('view/clipboard');
var Model = require('base/model');

xdescribe('grid paste test', function() {
    var clipboard;

    beforeEach(function() {
        var focusModel = new Model(),
            selectionModel = new Model();

        focusModel.indexOf = function() {};
        selectionModel.hasSelection = function() {return false};
        clipboard = new Clipboard({
            focusModel: focusModel,
            selectionModel: selectionModel
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
            clipboard.dataModel = {
                paste: function(r) {
                    result = r;
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

        // todo: focus, selection model test
    });

    describe('_pasteWhenKeyupCharV', function() {
        var pasteToGridSpy;
        beforeEach(function() {
            pasteToGridSpy = spyOn(clipboard, '_pasteToGrid');
        });

        it('paste date, while pasting', function() {
            clipboard.pasting = true;
            clipboard._pasteWhenKeyupCharV();
            expect(pasteToGridSpy).not.toHaveBeenCalled();
        });

        it('paste date, while idle', function() {
            clipboard._pasteWhenKeyupCharV();
            clipboard.$el.trigger('keyup');
            expect(pasteToGridSpy).toHaveBeenCalled();
        });
    });

    describe('keyup event fire flow', function() {
        var result;

        beforeEach(function() {
            clipboard.dataModel = {
                paste: function(r) {
                    result = r;
                }
            };
        });

        it('result check', function() {
            var text = 'aaa\tbbb\tccc\nddd\teee\tfff';

            clipboard.$el.val(text);
            clipboard._pasteToGrid();
            expect(clipboard._getProcessClipBoardData()).toEqual(result);
        });
    });
});
