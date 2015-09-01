'use strict';

module.exports = {
    setOwnProperties: function(properties) {
        _.each(properties, function(value, key) {
            this[key] = value;
        }, this);
    }
};
