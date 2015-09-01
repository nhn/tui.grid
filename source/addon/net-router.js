'use strict';

var common = require('../base/common');
var util = require('../util');

/**
 * Ajax History 관리를 위한 Router AddOn
 * @constructor AddOn.Net.Router
 */
var Router = Backbone.Router.extend(/**@lends AddOn.Net.Router.prototype */{
    routes: {
        'read/:queryStr': 'read'
    },
    initialize: function(attributes) {
        this.setOwnProperties({
            grid: attributes && attributes.grid || null,
            net: attributes && attributes.net || null
        });
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
    },
    /**
     * 내부 프로퍼티 설정
     * @param {Object} properties 할당할 프로퍼티 데이터
     */
    setOwnProperties: common.setOwnProperties
});

module.exports = Router;
