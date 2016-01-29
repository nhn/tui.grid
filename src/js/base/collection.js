/**
 * @fileoverview Base class for Collections
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Collection
 * @module base/collection
 * @mixes module:base/common
 */
var Collection = Backbone.Collection.extend(/**@lends module:base/collection.prototype */{
    /**
     * @constructs
     * @param {Array.<Object>} models - Models
     * @param {Object} options - Options
     */
    initialize: function(models, options) {},

    /**
     * collection 내 model 들의 event listener 를 제거하고 메모리에서 해제한다.
     * @returns {object} this object
     */
    clear: function() {
        this.each(function(model) {
            model.stopListening();
            model = null;
        });
        this.reset([], {silent: true});

        return this;
    }
});

_.assign(Collection.prototype, common);

module.exports = Collection;
