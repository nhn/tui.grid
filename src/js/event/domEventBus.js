
/**
 * @fileoverview Creator of domEventBus
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

module.exports = {
    create: function() {
        return _.extend({}, Backbone.Events);
    }
};
