/**
 * @fileoverview Number Condition Model
 * @author Sohee Lee
 */

'use strict';

var Model = require('../base/model');
var Condition = require('./condition');

/**
 * 숫지를 다양한 비교조건으로 필터링하기 위한 Condition
 * @module model/NumberCondition
 * @extends module:model/condition
 * @ignore
 */
var NumberCondition = Condition.extend({
    initialize: function(attr) {
        Model.prototype.initialize.apply(this, arguments);
        this.name = attr.name;
        this.Conditions = {
            NONE: 'none',
            SAME: 'same',
            BIGGER: 'bigger',
            BIGGER_SAME: 'bingger-same',
            SMALLER: 'smaller',
            SMALLER_SAME: 'smaller-same'
        };
    },

    defaults: {
        value: 0,
        condition: 'none'
    },

    /**
     * 기준이 될 value와 비교할 연산으로 선택된 것을 리턴한다.
     * @returns {Object} 기준 value, 비교연산
     */
    getContent: function() {
        return {
            value: this.get('value'),
            condition: this.get('condition')
        };
    },

    /**
     * 기준이 될 value와 비교할 연산으로 선택된것을 받아서 설정한다.
     * @param {Object} content 기준 value, 비교연산
     */
    setContent: function(content) {
        this.set('value', content.value);
        this.set('condition', content.condition);
    },

    update: function() {
        // Number Condition은 조건 내용을 Update할 것이 없다
    },

    rebase: function() {
        // Number Condition은 조건 내용을 rebase할 것이 없다.
    },

    change: function() {
        // row 데이터가 변경되어서 조건 내용의 변경은 없다.
    },

    /**
     * 전달 받은 데이터를 조건에 부합해보고 결괄르 반환한다.
     * @param {Object} data 적용해볼 row 데이터
     * @returns {Boolean} true이면 조건에 부합 / false이면 부합하지 않음
     */
    filter: function(data) {
        var result = false;
        var value = parseInt(this.get('value'), 10);
        data = parseInt(data, 10);
        switch (this.get('condition')) {
            case this.Conditions.NONE:
                result = true;
                break;
            case this.Conditions.SAME:
                result = (value === data);
                break;
            case this.Conditions.BIGGER:
                result = (value < data);
                break;
            case this.Conditions.BIGGER_SAME:
                result = (value <= data);
                break;
            case this.Conditions.SMALLER:
                result = (value > data);
                break;
            case this.Conditions.SMALLER_SAME:
                result = (value >= data);
                break;
            default:
                break;
        }

        return result;
    },

    /**
     * 필터가 현재 작동중인지 확인하다. none이 선택되지 않은 거면 필터가 동작 중인것으로 간주.
     * @returns {Boolean} 현재 필터가 작동 중인지를 반환하다.
     */
    isFiltering: function() {
        return this.get('condition') !== this.Conditions.NONE;
    }
});

module.exports = NumberCondition;
