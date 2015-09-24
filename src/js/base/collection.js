/**
 * @fileoverview Base class for Collections
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Collection
 * @module base/collection
 */
var Collection = Backbone.Collection.extend(/**@lends module:base/collection.prototype */{
    /**
     * @param {Array} models - 콜랙션에 추가할 model 리스트
     * @param {Object} options - 생성자의 option 객체. 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
     * @mixes module:base/common
     * @constructs
     */
    initialize: function(models, options) {
        var grid = options && options.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
    },

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
