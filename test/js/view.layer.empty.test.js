'use strict';

var EmptyLayer = require('../../src/js/view/layer/empty');

function createGridMock() {
    return {
        dimensionModel: new Backbone.Model(),
        options: {}
    }
}
describe('view.layer.empty', function() {
    it('initialize()', function() {
        var gridMock = createGridMock(),
            layer = new EmptyLayer({
                grid: gridMock
            });

        layer.render();
        expect(layer.$el.html()).toEqual('데이터가 존재하지 않습니다.');
    });

    it('initialize() with emptyMessage option', function() {
        var gridMock = createGridMock(),
            emptyMessage = 'Empty!',
            layer;

        gridMock.options.emptyMessage = emptyMessage;
        layer = new EmptyLayer({
            grid: gridMock
        });
        layer.render();
        expect(layer.$el.html()).toEqual(emptyMessage);
    })
});
