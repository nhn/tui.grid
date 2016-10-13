/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');
var Model = require('../base/model');

var calculator = {
    sum: function(arr) {
        return _.reduce(arr, function(memo, num) {
            return memo + num;
        }, 0);
    },
    avg: function(arr, sumValue) {
        if (!sumValue) {
            sumValue = calculator.sum(arr);
        }
        return sumValue / arr.length;
    },
    count: function(arr) {
        return arr.length;
    },
    max: _.max,
    min: _.min
};

/**
 * Summary Module
 * @module model/summary
 * @extends module:base/model
 */
var Summary = Model.extend(/**@lends module:model/summary.prototype */{
    /**
     * @constructs
     * @param {Object} attr - attributes
     * @param {Object} options - options
     */
    initialize: function(attr, options) {
        this.dataModel = options.dataModel;
        this.columnSummaries = options.columnSummaries;
    },

    /**
     * @param {string} columnName - column name
     * @param {string} summaryType - summary type
     * @return {number}
     */
    getValue: function(columnName, summaryType) {
        var calFn = calculator[summaryType];
        var values = this.dataModel.getColumnValues(columnName);

        return calFn(values);
    }
});

module.exports = Summary;
