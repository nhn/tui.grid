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
        this.columnModel = options.columnModel;
        this.columnSummaryTypes = options.columnSummaryTypes || {};

        this.summaryMap = {};
        this._resetSummaryMap();

        this.listenTo(this.dataModel, 'add remove reset', this._resetSummaryMap);
        this.listenTo(this.dataModel, 'change', this._onChangeData);
        this.listenTo(this.dataModel, 'delRange', this._onDeleteRangeData);
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
     * Initialize summary map of columns specified in 'columnSummries' property.
     * @private
     */
    _resetSummaryMap: function() {
        this._resetColumnSummaryValue(_.keys(this.columnSummaryTypes));
    },

    /**
     * Reset summary values of given columnName
     * @param {Array.<string>} columnNames - An array of column names
     * @private
     */
    _resetColumnSummaryValue: function(columnNames) {
        _.each(columnNames, function(columnName) {
            var summaryTypes = this.columnSummaryTypes[columnName];
            var values, summaryValueMap;

            if (summaryTypes) {
                values = this.dataModel.getColumnValues(columnName);
                summaryValueMap = _.pick(this._calculate(values), summaryTypes);

                this.summaryMap[columnName] = summaryValueMap;
                this.trigger('change', columnName, summaryValueMap);
            }
        }, this);
    },

    /**
     * Event handler for 'change' event on dataModel
     * @param {object} model - row model
     * @private
     */
    _onChangeData: function(model) {
        this._resetColumnSummaryValue(_.keys(model.changed));
    },

    /**
     * Event handler for 'changeRange' event on dataModel
     * @param {Array.<number>} rowKeys - An array of rowkeys
     * @param {Array.<number>} columnNames - An arrya of columnNames
     * @private
     */
    _onDeleteRangeData: function(rowKeys, columnNames) {
        this._resetColumnSummaryValue(columnNames);
    },

    /**
     * Returns the summary value of given column and type.
     * If the summaryType is not specified, returns all values of types as an object
     * @param {string} columnName - column name
     * @param {string} [summaryType] - summary type
     * @returns {number|Object}
     */
    getValue: function(columnName, summaryType) {
        var columnValueMap = this.summaryMap[columnName];
        var value;

        if (!summaryType) {
            return columnValueMap;
        }

        value = this.summaryMap[columnName][summaryType];
        return _.isUndefined(value) ? null : value;
    },

    /**
     * Sets the summary value of given column and type.
     * If the length of argurments is 2, use second parameter as a value map
     * @param {string} columnName - column name
     * @param {string} [summaryType] - summary type
     * @param {number|Object} value - value
     */
    setValue: function(columnName, summaryType, value) {
        var summaryTypes = this.columnSummaryTypes[columnName];
        var valueMap = this.summaryMap[columnName];
        var newValueMap;

        if (_.isObject(summaryType)) {
            newValueMap = _.extend({}, summaryType);
        } else {
            newValueMap = {};
            valueMap[summaryType] = value;
        }
        _.extend(valueMap, _.pick(newValueMap, summaryTypes));

        this.trigger('change', columnName, valueMap);
    }
});

module.exports = Summary;
