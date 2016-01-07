/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('../base/common');
var util = require('../common/util');

/**
 * Router for Addon.Net
 * @module addon/net-router
 */
var Router = Backbone.Router.extend(/**@lends module:addon/net-router.prototype */{
    /**
     * @constructs
     * @param  {object} attributes - Attributes
     */
    initialize: function(attributes) {
        this.net = attributes.net;
    },

    routes: {
        'read/:queryStr': 'read'
    },

    /**
     * Read
     * @param {String} queryStr - query string
     */
    read: function(queryStr) {}
});

module.exports = Router;
