/**
 * @fileoverview Base class for Collections
 * @author NHN Ent. FE Development Team
 */

'use strict';

var Backbone = require('backbone');

/**
 * Base class for Collection
 * @module base/collection
 * @ignore
 */
var Collection = Backbone.Collection.extend(/** @lends module:base/collection.prototype */{
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

module.exports = Collection;
