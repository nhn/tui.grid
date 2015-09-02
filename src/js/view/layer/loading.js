/**
 * @fileoverview Layer Loading
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * 로딩 레이어
 * @constructor View.Layer.Loading
 */
var Loading = Layer.extend(/**@lends Layer.prototype */{
    className: 'loading_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },

    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});

module.exports = Loading;
