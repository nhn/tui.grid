/**
 * @fileoverview Password 타입의 Input을 가진 Cell Painter
 * @author NHN Ent. FE Development Team
 * @module view/painter/cell/text-password
 */
'use strict';

var TextCell = require('./text');

/**
 * Password 타입의 cell renderer
 * @module painter/cell/text-password
 * @extends module:painter/cell/text
 */
var PasswordCell = tui.util.defineClass(TextCell, /**@lends module:painter/cell/text-password.prototype */{
    /**
     * @construct
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    init: function(attributes, options) { // eslint-disable-line
        TextCell.apply(this, arguments);
    },

    /**
     * input type 을 반환한다.
     * @returns {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'password';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @returns {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text-password';
    }
});

module.exports = PasswordCell;
