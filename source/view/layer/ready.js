'use strict';

/**
 * @fileoverview Layer Ready
 * @author NHN Ent. FE Development Team
 */

var Layer = require('../base/view-layer');

/**
 * 초기화 레이어
 * @constructor View.Layer.Ready
 */
var Ready = Layer.extend(/**@lends View.Layer.Ready.prototype */{
    className: 'initializing_layer',
    /**
     * 생성자 함수
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    }
});

module.exports = Ready;
