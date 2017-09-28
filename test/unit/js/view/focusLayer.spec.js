'use strict';

var $ = require('jquery');

var ModelManager = require('model/manager');
var DomState = require('domState');
var FocusLayer = require('view/focusLayer');
var frameConst = require('common/constMap').frame;

function createModelManager(frozenCount) {
    return new ModelManager({
        rowHeight: 10,
        domState: new DomState($('<div>')),
        columnOptions: {
            frozenCount: frozenCount
        }
    });
}

function createFocusLayer(modelManager, whichSide) {
    return new FocusLayer({
        whichSide: whichSide,
        focusModel: modelManager.focusModel,
        columnModel: modelManager.columnModel,
        dimensionModel: modelManager.dimensionModel,
        coordRowModel: modelManager.coordRowModel,
        coordColumnModel: modelManager.coordColumnModel,
        coordConverterModel: modelManager.coordConverterModel
    });
}

describe('view/focusLayer', function() {
    var $wrapper, layerLside, layerRside, modelManager;

    beforeEach(function() {
        $wrapper = jasmine.getFixtures().set('<div>');

        modelManager = createModelManager(1);
        modelManager.columnModel.set('columns', [
            {name: 'c1'}, {name: 'c2'}
        ]);
        modelManager.dataModel.setData([{
            c1: '0-1',
            c2: '0-2'
        }, {
            c1: '1-1',
            c2: '1-2'
        }]);

        layerLside = createFocusLayer(modelManager, frameConst.L);
        layerRside = createFocusLayer(modelManager, frameConst.R);
        $wrapper.append(layerLside.render().$el);
        $wrapper.append(layerRside.render().$el);
    });

    it('the layer element is hidden initially', function() {
        expect(layerLside.$el).toBeHidden();
        expect(layerRside.$el).toBeHidden();
    });

    it('the layer has for elements to draw border', function() {
        expect(layerLside.$el.find('div').length).toBe(4);
    });

    describe('when focus is set', function() {
        beforeEach(function() {
            modelManager.focusModel.focusAt(0, 0);
        });

        it('and the target cell is in the same side, show layer element', function() {
            expect(layerLside.$el).toBeVisible();
            expect(layerRside.$el).toBeHidden();
        });

        it('and then blurred, hide layer element', function() {
            modelManager.focusModel.blur();

            expect(layerLside.$el).toBeHidden();
        });
    });
});
