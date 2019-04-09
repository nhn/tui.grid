
/**
 * @fileoverview Creator of domEventBus
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

module.exports = {
    create: function() {
        return _.extend({}, Backbone.Events);
    }
};
