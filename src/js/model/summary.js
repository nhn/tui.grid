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
        this.autoColumnNames = [];

        /**
         * Store template functions of each column
         * K: column name
         * V: template function
         * @example
         * {
         *     c1: function() {},
         *     c2: function() {}
         * }
         * @type {Object}
         */
        this.templateMap = {};

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

        this._resetColumnContent(options.columnContent);
        this._resetSummaryMap();
    },

    /**
    * Reset autoColumnNames and templateMap based on columnContent options.
    * @param {Object} columnContent - summary.columnContent options
    */
    _resetColumnContent: function(columnContent) {
        _.each(columnContent, function(options, columnName) {
            this.setColumnContent(columnName, options);
        }, this);
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
        var count = values.length;
        var sum = 0;
        var avg = 0;
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

        if (!count) {
            max = min = avg = 0;
        } else {
            avg = sum / count;
        }

        resultMap[typeConst.SUM] = sum;
        resultMap[typeConst.MIN] = min;
        resultMap[typeConst.MAX] = max;
        resultMap[typeConst.AVG] = avg;
        resultMap[typeConst.CNT] = count;

        return resultMap;
    },

    /**
     * Initialize summary map of columns specified in 'columnSummries' property.
     * @private
     */
    _resetSummaryMap: function() {
        this._resetColumnSummaryValue();
    },

    /**
     * Reset summary values of given columnName
     * @param {Array.<string>} columnNames - An array of column names
     * @private
     */
    _resetColumnSummaryValue: function(columnNames) {
        var targetColumnNames = this.autoColumnNames;

        if (columnNames) {
            targetColumnNames = _.intersection(columnNames, this.autoColumnNames);
        }
        _.each(targetColumnNames, this._changeColumnSummaryValue.bind(this));
    },

    _changeColumnSummaryValue: function(columnName) {
        var values = this.dataModel.getColumnValues(columnName);
        var valueMap = this._calculate(values);

        this.columnSummaryMap[columnName] = valueMap;
        this.trigger('change', columnName, valueMap);
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
     * Event handler for 'deleteRange' event on dataModel
     * @param {GridEvent} ev - event object when "delRange" event is fired
     * @private
     */
    _onDeleteRangeData: function(ev) {
        this._resetColumnSummaryValue(ev.columnNames);
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
    },

    /**
    * Return template function of given column name
    * @param {string} columnName - column name
    * @returns {function}
    */
    getTemplate: function(columnName) {
        return this.templateMap[columnName];
    },

    /**
     * Set summary contents.
     * (Just trigger 'setSummaryContent')
     * @param {string} columnName - columnName
     * @param {string|object} content - HTML string or Options Object
     * @param {boolean} shouldChangeValue - If set to true, summary value is re-calculated
     */
    setColumnContent: function(columnName, content, shouldChangeValue) { // eslint-disable-line complexity
        if (_.isObject(content) && _.isFunction(content.template)) {
            this.templateMap[columnName] = content.template;
            if (content.useAutoSummary !== false && this.autoColumnNames.indexOf(columnName) === -1) {
                this.autoColumnNames.push(columnName);
            }
        } else if (_.isString(content)) {
            this.autoColumnNames = _.without(this.autoColumnNames, columnName);
            this.templateMap[columnName] = content;
        }

        if (shouldChangeValue) {
            this._changeColumnSummaryValue(columnName);
        }
    }
});

module.exports = Summary;
