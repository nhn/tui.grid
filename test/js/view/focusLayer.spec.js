'use strict';

var ModelManager = require('model/manager');
var DomState = require('domState');
var FocusLayer = require('view/focusLayer');

function createModelManager(columnFixCount) {
    return new ModelManager({
        domState: new DomState($('<div>')),
        columnFixCount: columnFixCount
    });
}

function createFocusLayer(modelManager, whichSide) {
    return new FocusLayer({
        whichSide: whichSide,
        focusModel: modelManager.focusModel,
        columnModel: modelManager.columnModel,
        dimensionModel: modelManager.dimensionModel
    });
}

function loadGridCSS() {
    var fixtures = jasmien.getStyleFixtures();
    fixtures.fixturePath = '';
}


fdescribe('view/focusLayer', function() {
    var $wrapper, layerLside, layerRside, modelManager;

    beforeEach(function() {
        $wrapper = jasmine.getFixtures().set('<div>');

        modelManager = createModelManager(1);
        modelManager.columnModel.set('columnModelList', [
            {columnName: 'c1'}, {columnName: 'c2'}
        ]);
        modelManager.dataModel.setRowList([
            {c1: '0-1', c2: '0-2'},
            {c1: '1-1', c2: '1-2'}
        ]);

        layerLside = createFocusLayer(modelManager, 'L');
        layerRside = createFocusLayer(modelManager, 'R');
        $wrapper.append(layerLside.$el);
        $wrapper.append(layerRside.$el);
    });

    it('initial state is hidden', function() {
        expect(layerLside.$el).toBeHidden();
        expect(layerRside.$el).toBeHidden();
    });

    describe('when focus event occur', function() {
        beforeEach(function() {
            modelManager.focusModel.focusAt(0, 0);
        });

        it('and the target cell is in the same side, show layer', function() {
            expect(layerLside.$el).toBeVisible();
            // console.log(layerLside.$el.is(':visible'));
            expect(layerRside.$el).toBeHidden();
        });
    });
});
