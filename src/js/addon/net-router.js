/**
 * @fileoverview Router for Addon.Net
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
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
