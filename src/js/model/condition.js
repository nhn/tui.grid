/**
 * @fileoverview Condition Model
 * @author Sohee Lee
 */

'use strict';

var Model = require('../base/model');

/**
 * Filter의 다양한 조건들을 커버하기 위한 추상클래스
 * @module model/condition
 * @extends module:base/model
 * @ignore
 */
var Condition = Model.extend({
    initialize: function(attribute) {
        Model.prototype.initialize.apply(this, arguments);
        this.name = attribute.name;
    },

    getContent: function() {
    },

    setContent: function() {
    },

    rebase: function() {
    },

    update: function() {
    },

    filter: function() {
    },

    isFiltering: function() {
    }
});

module.exports = Condition;
