/**
 * @fileoverview Mixin object for base class
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Mixin object for base class
 * @mixin
 * @exports module:base/common
 */
var common = {
    /**
     * 주어진 객체의 프라퍼티들을 this에 복사해서 추가한다.
     * @param  {object} properties 추가할 프라퍼티 객체
     */
    setOwnProperties: function(properties) {
        _.each(properties, function(value, key) {
            this[key] = value;
        }, this);
    }
};
module.exports = common;
