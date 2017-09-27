/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */

'use strict';

var Backbone = require('backbone');

/**
 * Router for Addon.Net
 * @module addon/net-router
 * @param  {object} attributes - Attributes
 * @ignore
 */
var Router = Backbone.Router.extend(/** @lends module:addon/net-router.prototype */{
    initialize: function(attributes) {
        this.net = attributes.net;
    },

    routes: {
        'read/:queryStr': 'read'
    }
});

module.exports = Router;
