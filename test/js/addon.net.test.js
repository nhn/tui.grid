'use strict';

describe('addon.net', function() {
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
        beforeEach(function() {
            jasmine.Ajax.install();
        });
        it('ajax mock test', function() {
            var onSuccess = jasmine.createSpy('onSuccess'),
                onFailure = jasmine.createSpy('onFailure');
            $.ajax({
                url: 'http://nate.com'
            });
            var request = jasmine.Ajax.requests.mostRecent();
            console.log(request);
        });
    });
});
