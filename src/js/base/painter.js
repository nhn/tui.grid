/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var attrNameConst = require('../common/constMap').attrName;

/**
 * Base class for Painters
 * The Painter class is implentation of 'flyweight' pattern for the View class.
 * This aims to act like a View class but doesn't create an instance of each view items
 * to improve rendering performance.
 * @module base/painter
 * @param {Object} options - options
 * @ignore
 */
var Painter = snippet.defineClass(/** @lends module:base/painter.prototype */{
    init: function(options) {
        this.controller = options.controller;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {},

    /**
     * css selector to use delegated event handlers by '$.on()' method.
     * @type {String}
     */
    selector: '',

    /**
     * Returns the cell address of the target element.
     * @param {jQuery} $target - target element
     * @returns {{rowKey: String, columnName: String}}
     * @private
     */
    _getCellAddress: function($target) {
        var $addressHolder = $target.closest('[' + attrNameConst.ROW_KEY + ']');

        return {
            rowKey: $addressHolder.attr(attrNameConst.ROW_KEY),
            columnName: $addressHolder.attr(attrNameConst.COLUMN_NAME)
        };
    },

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
