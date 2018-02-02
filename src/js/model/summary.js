/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Model = require('../base/model');
var typeConst = require('../common/constMap').summaryType;

/**
 * Summary Model
 * @module model/summary
 * @extends module:base/model
 * @param {Object} attr - attributes
 * @param {Object} options - options
 * @ignore
 */
var Summary = Model.extend(/** @lends module:model/summary.prototype */{
    initialize: function(attr, options) {
        this.dataModel = options.dataModel;

        /**
         * An array of columnNames using auto calculation
         * @type {Array.<string>}
         */
        this.autoColumnNames = options.autoColumnNames;

        /**
         * Summary value map (KV)
         * K: column name {string}
         * V: value map {object}
         * @type {object}
         * @example
         * {
         *    columnName1: {
         *        [typeConst.SUM]: 200,
         *        [typeConst.AVG]: 200,
         *    },
         *    columnName2: {
         *        [typeConst.MAX]: 100
         *    }
         * }
         */
        this.columnSummaryMap = {};

        this.listenTo(this.dataModel, 'add remove reset', this._resetSummaryMap);
        this.listenTo(this.dataModel, 'change', this._onChangeData);
        this.listenTo(this.dataModel, 'deleteRange', this._onDeleteRangeData);

        this._resetSummaryMap();
    },

    /**
     * Calculate summaries of given array.
     * Values which can not be converted to Number type will be considered as 0.
     * @param {Array} values - An array of values (to be converted to Number type)
     * @returns {Object}
     * @private
     */
    _calculate: function(values) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var sum = 0;
        var count = values.length;
        var resultMap = {};
        var i, value;

        for (i = 0; i < count; i += 1) {
            value = Number(values[i]);
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
        this._resetSummarySummaryValue();
    },

    /**
     * Reset summary values of given columnName
     * @param {Array.<string>} columnNames - An array of column names
     * @private
     */
    _resetSummarySummaryValue: function(columnNames) {
        var targetColumnNames = this.autoColumnNames;

        if (columnNames) {
            targetColumnNames = _.intersection(columnNames, this.autoColumnNames);
        }
        _.each(targetColumnNames, function(columnName) {
            var values = this.dataModel.getColumnValues(columnName);
            var valueMap = this._calculate(values);

            this.columnSummaryMap[columnName] = valueMap;
            this.trigger('change', columnName, valueMap);
        }, this);
    },

    /**
     * Event handler for 'change' event on dataModel
     * @param {object} model - row model
     * @private
     */
    _onChangeData: function(model) {
        this._resetSummarySummaryValue(_.keys(model.changed));
    },

    /**
     * Event handler for 'deleteRange' event on dataModel
     * @param {GridEvent} ev - event object when "delRange" event is fired
     * @private
     */
    _onDeleteRangeData: function(ev) {
        this._resetSummarySummaryValue(ev.columnNames);
    },

    /**
     * Returns the summary value of given column and type.
     * If the summaryType is not specified, returns all values of types as an object
     * @param {string} columnName - column name
     * @param {string} [summaryType] - summary type
     * @returns {number|Object}
     */
    getValue: function(columnName, summaryType) {
        var valueMap = this.columnSummaryMap[columnName];
        var value;

        if (!summaryType) {
            return _.isUndefined(valueMap) ? null : valueMap;
        }

        value = snippet.pick(valueMap, summaryType);

        return _.isUndefined(value) ? null : value;
    }
});

module.exports = Summary;
