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
        this.columnSummaryTypes = options.columnSummaryTypes || {};

        this.summaryMap = {};
        this._resetSummaryMap();

        this.listenTo(this.dataModel, 'add remove reset', this._resetSummaryMap);
        this.listenTo(this.dataModel, 'change', this._onChangeData);
        // this.listenTo(this.dataModel, 'changeRange', this._onChangeDataRange);
    },

    /**
     * Initialize summary map of columns specified in 'columnSummries' property.
     * @private
     */
    _resetSummaryMap: function() {
        _.each(this.columnSummaryTypes, function(summaryTypes, columnName) {
            this._resetColumnSummaryValue(columnName, summaryTypes);
        }, this);
    },

    /**
     * Reset summary values of given columnName
     * @param {string} columnName - column name
     * @param {Array.<string>} summaryTypes - summary types
     * @private
     */
    _resetColumnSummaryValue: function(columnName, summaryTypes) {
        var values = this.dataModel.getColumnValues(columnName);
        var resultMap = this._calculate(values);
        var pickedResultMap = _.pick(resultMap, summaryTypes);

        this.summaryMap[columnName] = pickedResultMap;
        this.trigger('change', columnName, pickedResultMap);
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
            value = Number(arr[i]);
            if (isNaN(value)) {
                value = 0;
            }

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
        resultMap[typeConst.AVG] = count ? (sum / count) : 0;
        resultMap[typeConst.CNT] = count;

        return resultMap;
    },

    /**
     * Event handler for reset summary value when dataModel is changed
     * @param {module:model/Row} [model] - Changed(Added) Row. Undefined when Deleted
     * @private
     */
    _onChangeDataLength: function() {
        this._resetSummaryMap();
    },

    _onChangeData: function(model) {
        _.each(model.changed, function(value, columnName) {
            var types = this.columnSummaryTypes[columnName];
            if (types) {
                this._resetColumnSummaryValue(columnName, types);
            }
        }, this);
    },

    /**
     * @param {string} columnName - column name
     * @param {string} summaryType - summary type
     * @returns {number}
     */
    getValue: function(columnName, summaryType) {
        var columnValueMap = this.summaryMap[columnName];
        var value;

        if (!summaryType) {
            return columnValueMap;
        }

        value = this.summaryMap[columnName][summaryType];
        return _.isUndefined(value) ? null : value;
    }
});

module.exports = Summary;
