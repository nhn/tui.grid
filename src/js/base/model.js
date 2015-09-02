'use strict';

var common = require('./common');

/**
 * Model Base Class
 * @constructor Model.Base
 */
var Model = Backbone.Model.extend(/**@lends Model.Base.prototype */{
    /**
     * 생성자 함수
     * @param {Object} attributes 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
     */
    initialize: function(attributes) {
        var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
    },

    /**
     * 내부 프로퍼티 설정
     * @param {Object} properties 할당할 프로퍼티 데이터
     */
    setOwnProperties: common.setOwnProperties
});

module.exports = Model;
