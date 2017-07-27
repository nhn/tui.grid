'use strict';

var $ = require('jquery');

var DomState = require('domState');

it('domState:init', function() {
    var $el = $('<div>');
    var domState = new DomState($el);

    expect(domState.$el).toBe($el);
});

describe('domState', function() {
    var $parent, domState;

    beforeEach(function() {
        $parent = jasmine.getFixtures().set('<div />');
        domState = new DomState($('<table>'));
    });

    it('getParentHeight', function() {
        $parent.append(domState.$el).height(300);

        expect(domState.getParentHeight()).toBe(300);
    });
});
