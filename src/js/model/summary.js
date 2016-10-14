/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var typeConst = require('../common/constMap').summaryType;

/**
 * Summary Model
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
        this.summaryMap = {};

        this._initSummaryMap();
    },

    /**
     * Initialize summary map of columns specified in 'columnSummries' property.
     * @private
     */
    _initSummaryMap: function() {
        _.each(this.columnSummaries, function(summaryTypes, columnName) {
            var values = this.dataModel.getColumnValues(columnName);
            var resultMap = this._calculate(values);

            this.summaryMap[columnName] = _.pick(resultMap, summaryTypes);
        }, this);
    },

    /**
     * Calculate summaries of given array.
     * @param {Array} arr - An array of number values
     * @returns {Object}
     * @private
     */
    _calculate: function(arr) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var sum = 0;
        var count = arr.length;
        var resultMap = {};
        var i, value;

        for (i = 0; i < count; i += 1) {
            value = arr[i] || 0;

            sum += value;
            if (min > value) {
                min = value;
            }
            if (max < value) {
                max = value;
            }
        }

        resultMap[typeConst.SUM] = sum;
        resultMap[typeConst.MIN] = min;
        resultMap[typeConst.MAX] = max;
        resultMap[typeConst.AVG] = sum / count;
        resultMap[typeConst.CNT] = count;

        return resultMap;
    },

    /**
     * @param {string} columnName - column name
     * @param {string} summaryType - summary type
     * @returns {number}
     */
    getValue: function(columnName, summaryType) {
        var value = this.summaryMap[columnName][summaryType];

        if (_.isUndefined(value)) {
            value = null;
        }
        return value;
    }
});

module.exports = Summary;
