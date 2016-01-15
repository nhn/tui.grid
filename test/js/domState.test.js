'use strict';

var DomState = require('../../src/js/domState');

it('domState:init', function() {
    var $el = $('<div>');
    var domState = new DomState($el);

    expect(domState.$el).toBe($el);
});

describe('domState', function() {
    var domState;

    beforeEach(function() {
        domState = new DomState($('<div>'));
    });

    it('getParentHeight', function() {
        var $parent = $('<div>');
        $parent.append(domState.$el).height(300);

        expect(domState.getParentHeight()).toBe(300);
    });
});
