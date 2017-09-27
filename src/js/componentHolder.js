/**
 * @fileoverview Component holder
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var defaultOptionsMap = {
    pagination: null
};

/**
 * Component holder
 * @module componentHolder
 * @ignore
 */
var ComponentHolder = snippet.defineClass(/** @lends module:componentHolder.prototype */{
    init: function(optionsMap) {
        this.optionsMap = $.extend(true, defaultOptionsMap, optionsMap);
        this.instanceMap = {};
    },

    /**
     * Returns an instance of tui.component.Pagination
     * @param {String} key - component key
     * @returns {tui.component.Pagination}
     */
    getInstance: function(key) {
        return this.instanceMap[key];
    },

    /**
     * Sets an instance of tui.component.Pagination
     * @param {String} key - component key
     * @param {tui.component.Pagination} instance - pagination instance
     */
    setInstance: function(key, instance) {
        this.instanceMap[key] = instance;
    },

    /**
     * Returns an option object.
     * @param {String} key - component key
     * @returns {Object}
     */
    getOptions: function(key) {
        return this.optionsMap[key];
    }
});

module.exports = ComponentHolder;
