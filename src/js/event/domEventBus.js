'use strict';

var Backbone = require('backbone');

module.exports = {
    create: function() {
        return _.extend({}, Backbone.Events);
    }
};
