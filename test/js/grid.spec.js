'use strict';

describe('grid', function() {
    var grid, model;

    beforeEach(function() {
        grid = new tui.Grid({
            el: $('<div>')
        });
        model = grid.modelManager;
    });

    it('disable -> dataModel.setDisable(true)', function() {
        spyOn(model.dataModel, 'setDisabled');
        grid.disable();
        expect(model.dataModel.setDisabled).toHaveBeenCalledWith(true);
    });

    it('enable -> dataModel.setDisable(false)', function() {
        spyOn(model.dataModel, 'setDisabled');
        grid.enable();
        expect(model.dataModel.setDisabled).toHaveBeenCalledWith(false);
    });
});
