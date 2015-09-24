/**
 * @fileoverview Password 타입의 Input을 가진 Cell Painter
 * @author NHN Ent. FE Development Team
 * @module view/painter/cell/text-password
 */
'use strict';

var Text = require('./text');

/**
 * Password 타입의 cell renderer
 * @extends module:view/painter/cell/text
 * @constructor module:view/painter/cell/text-password
 */
var Password = Text.extend(/**@lends module:view/painter/cell/text-password.prototype */{
    /**
     * Initializes
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    initialize: function(attributes, options) { // eslint-disable-line
        Text.prototype.initialize.apply(this, arguments);
    },

    /**
     * input type 을 반환한다.
     * @return {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'password';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text-password';
    }
});

module.exports = Password;
