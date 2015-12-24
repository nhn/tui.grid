/**
 * @fileoverview Base class for Models
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Models
 * @module base/model
 */
var Model = Backbone.Model.extend(/**@lends module:base/model.prototype*/{
    /**
     * @constructs
     * @mixes module:base/common
     * @param {Object} attributes Attributes
     */
    initialize: function(attributes) {}
});

_.assign(Model.prototype, common);

module.exports = Model;
