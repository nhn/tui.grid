/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
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
        this.columnModel = options.columnModel;

        /**
         * Set for storing names of auto-calculate column
         * The value is always 'true'
         * @type {Object}
         * @example
         * {
         *     c1: true
         *     c2: true
         * }
         */
        this.autoColumnNameSet = {};

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
        this.columnTemplateMap = {};

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

        // store defaultContent option for future reset
        this.defaultContent = options.defaultContent;

        // store columnContent option for future reset
        this.columnContent = options.columnContent;

        this.listenTo(this.dataModel, 'add remove reset', this._onChangeDataRows);
        this.listenTo(this.dataModel, 'change', this._onChangeDataCells);
        this.listenTo(this.dataModel, 'deleteRange', this._onDeleteRangeData);
        this.listenTo(this.columnModel, 'columnModelChange', this._resetAll);

        this._resetAll();
    },

    /**
     * Reset autoColumnNames and columnTemplateMap based on columnContent options.
     * @param {Object} columnContent - summary.columnContent options
     * @private
     */
    _resetColumnContent: function() {
        var columnContentMap = {};
        var defaultContent = this.defaultContent;
        var columnContent = this.columnContent || {};

        if (defaultContent) {
            _.forEach(this.columnModel.getVisibleColumns(), function(column) {
                columnContentMap[column.name] = columnContent[column.name] || defaultContent;
            });
        } else {
            columnContentMap = columnContent;
        }

        _.each(columnContentMap, function(options, columnName) {
            this.setColumnContent(columnName, options);
        }, this);
    },

    /**
     * Reset autoColumnNameSet, columnTemplateMap, columnSummaryMap
     * @private
     */
    _resetAll: function() {
        this._resetColumnContent();
        this._resetColumnSummaryMap();
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
     * Reset summary values of given columnName
     * @param {Array.<string>} columnNames - An array of column names
     * @private
     */
    _resetColumnSummaryMap: function(columnNames) {
        var targetColumnNames = _.keys(this.autoColumnNameSet);

        if (columnNames) {
            targetColumnNames = _.intersection(columnNames, targetColumnNames);
        }

        _.each(targetColumnNames, function(columnName) {
            this._changeColumnSummaryValue(columnName);
        }, this);
    },

    /**
     * Change Summary Value
     * @param {string} columnName - column name
     * @private
     */
    _changeColumnSummaryValue: function(columnName) {
        var values = this.dataModel.getColumnValues(columnName);
        var valueMap = this._calculate(values);

        this.columnSummaryMap[columnName] = valueMap;
        this.trigger('change', columnName, valueMap);
    },

    /**
     * Event handler for 'add', 'append', 'remove' event on dataModel
     * @private
     */
    _onChangeDataRows: function() {
        this._resetColumnSummaryMap();
    },

    /**
     * Event handler for 'change' event on dataModel
     * @param {object} model - row model
     * @private
     */
    _onChangeDataCells: function(model) {
        this._resetColumnSummaryMap(_.keys(model.changed));
    },

    /**
     * Event handler for 'deleteRange' event on dataModel
     * @param {GridEvent} ev - event object when "delRange" event is fired
     * @private
     */
    _onDeleteRangeData: function(ev) {
        this._resetColumnSummaryMap(ev.columnNames);
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
     * Returns the summary value of given column.
     * If the column name is not specified, all values of available columns are returned.
     * @param {string} [columnName] - column name
     * @returns {Object}
     */
    getValues: function(columnName) {
        if (columnName) {
            return $.extend({}, this.columnSummaryMap[columnName]);
        }

        return $.extend(true, {}, this.columnSummaryMap);
    },

    /**
    * Returns whether given column is visible.
    * @param {string} columnName - Parameter description.
    * @returns {boolean}
    * @private
    */
    _isVisibleColumn: function(columnName) {
        return this.columnModel.getVisibleColumns().indexOf(columnName) !== -1;
    },

    /**
    * Return template function of given column name
    * @param {string} columnName - column name
    * @returns {function}
    */
    getTemplate: function(columnName) {
        var template = this.columnTemplateMap[columnName];

        if (!template && this.defaultContent && this._isVisibleColumn(columnName)) {
            template = this.defaultContent.template;
        }

        return template;
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
            this.columnTemplateMap[columnName] = content.template;
            if (content.useAutoSummary !== false) {
                this.autoColumnNameSet[columnName] = true;
            }
        } else if (_.isString(content)) {
            delete this.autoColumnNameSet[columnName];
            this.columnTemplateMap[columnName] = content;
        }

        if (shouldChangeValue) {
            this._changeColumnSummaryValue(columnName);
        }
    }
});

module.exports = Summary;
