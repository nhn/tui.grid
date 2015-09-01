'use strict';

var Text = require('./text');

/**
 * Password 타입의 cell renderer
 * @extends {View.Base.Painter.Cell.Text}
 * @constructor View.Painter.Cell.Text.Password
 */
var Password = Text.extend(/**@lends Password.prototype */{
    initialize: function(attributes, options) {
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
