'use strict';

var ToolbarView = require('view/toolbar');

describe('view/toolbar', function() {
    var toolbarModel;

    describe('Toolbar instance 를 테스트한다.', function() {
        var toolbarView;

        beforeEach(function() {
            toolbarView = new ToolbarView({
                toolbarModel: toolbarModel
            });
        });

        afterEach(function() {
            toolbarView.destroy();
        });
    });
});
