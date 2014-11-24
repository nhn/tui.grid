'use strict';

describe('core.base', function() {
    var $empty, Class;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        Class = {};
        Class.Model = Model.Base.extend({});
        Class.Collection = Collection.Base.extend({
            model: Class.Model
        });
        Class.View = View.Base.extend({});
    });


    describe('Model.Base', function() {

    });
});
