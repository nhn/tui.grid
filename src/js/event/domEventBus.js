'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

module.exports = {
    create: function() {
        return _.extend({}, Backbone.Events);
    }
};
