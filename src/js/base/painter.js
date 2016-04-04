/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Base class for Painters
 * The Painter class is implentation of 'flyweight' pattern for the View class.
 * This aims to act like a View class but doesn't create an instance of each view items
 * to improve rendering performance.
 * @module base/painter
 */
var Painter = tui.util.defineClass(/**@lends module:base/painter.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        this.controller = options.controller;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {},

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: '',

    /**
     * Attaches all event handlers to the $target element.
     * @param {jquery} $target - target element
     * @param {String} parentSelector - selector of a parent element
     */
    attachEventHandlers: function($target, parentSelector) {
        _.each(this.events, function(methodName, eventName) {
            var boundHandler = _.bind(this[methodName], this),
                selector = parentSelector + ' ' + this.selector;

            $target.on(eventName, selector, boundHandler);
        }, this);
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @abstract
     */
    generateHtml: function() {
        throw new Error('implement generateHtml() method');
    }
});

module.exports = Painter;
