/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */
'use strict';

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
    }
});

module.exports = Router;
