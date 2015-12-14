/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('../base/common');
var util = require('../common/util');

/**
 * Router for Addon.Net
 * @module addon/net-router
 */
var Router = Backbone.Router.extend(/**@lends module:addon/net-router.prototype */{
    /**
     * @constructs
     * @mixes module:base/common
     * @param  {object} attributes - Attributes
     */
    initialize: function(attributes) {
        this.setOwnProperties({
            grid: attributes && attributes.grid || null,
            net: attributes && attributes.net || null
        });
    },

    routes: {
        'read/:queryStr': 'read'
    },

    /**
     * Backbone Router 에서 url 정보를 통해 서버로 read 요청을 한다.
     * @param {String} queryStr 쿼리 문자열
     */
    read: function(queryStr) {
        var data = util.toQueryObject(queryStr);
        //formData 를 설정한다.
        this.net.setFormData(data);
        //그 이후 read
        this.net.readData(data);
    }
});

_.assign(Router.prototype, common);

module.exports = Router;
