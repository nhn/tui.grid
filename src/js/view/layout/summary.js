/**
 * @fileoverview Summary
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var _ = require('underscore');
var View = require('../../base/view');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;

var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

/**
 * Summary area
 * @module view/layout/summary
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Summary = View.extend(/** @lends module:view/layout/summary.prototype */{
    initialize: function(options) {
        /**
         * L: Left, R: Right
         * @type {string}
         */
        this.whichSide = options.whichSide;

        // models
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.coordColumnModel = options.coordColumnModel;
        this.renderModel = options.renderModel;
        this.summaryModel = options.summaryModel;

        // events
        this.listenTo(this.renderModel, 'change:scrollLeft', this._onChangeScrollLeft);
        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
        if (this.summaryModel) {
            this.listenTo(this.summaryModel, 'change', this._onChangeSummaryValue);
        }
    },

    className: classNameConst.SUMMARY_AREA,

    events: {
        scroll: '_onScrollView'
    },

    /**
     * template
     */
    template: _.template(
        '<table class="<%=className%>" style="height:<%=height%>px">' +
            '<colgroup><%=colgroup%></colgroup>' +
            '<tbody><%=tbody%></tbody>' +
        '</table>'
    ),

    /**
     * Template for <td>
     */
    templateBody: _.template(
        '<td <%=attrColumnName%>="<%=columnName%>" ' +
            'class="<%=className%>" ' +
        '>' +
        '<%=value%>' +
        '</td>'
    ),

    /**
     * Template for <col>
     */
    templateColgroup: _.template(
        '<col ' +
            '<%=attrColumnName%>="<%=columnName%>" ' +
            'style="width:<%=width%>px">'
    ),

    /**
     * Event handler for 'scroll' event
     * @param {UIEvent} event - scroll event
     * @private
     */
    _onScrollView: function(event) {
        if (this.whichSide === frameConst.R) {
            this.renderModel.set('scrollLeft', event.target.scrollLeft);
        }
    },

    /**
     * Sync scroll-left position with the value of body
     * @param {Object} model - render model
     * @param {Number} value - scrollLeft value
     * @private
     */
    _onChangeScrollLeft: function(model, value) {
        if (this.whichSide === frameConst.R) {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Change column width
     * @private
     */
    _onChangeColumnWidth: function() {
        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
        var $ths = this.$el.find('col');

        _.each(columnWidths, function(columnWidth, index) {
            $ths.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
        });
    },

    /**
     * Sets the HTML string of <td> of given column
     * @param {string} columnName - column name
     * @param {string} contents - HTML string
     * @private
     */
    _setColumnContent: function(columnName, contents) {
        var $th = this.$el.find('td[' + ATTR_COLUMN_NAME + '="' + columnName + '"]');

        $th.html(contents);
    },

    /**
     * Refresh <td> tag whenever summary value is changed.
     * @param {string} columnName - column name
     * @param {object} valueMap - value map
     * @private
     */
    _onChangeSummaryValue: function(columnName, valueMap) {
        var contents = this._generateValueHTML(columnName, valueMap);

        this._setColumnContent(columnName, contents);
    },

    /**
     * Generates a HTML string of column summary value and returns it.
     * @param {object} columnName - column name
     * @param {object} valueMap - value map
     * @returns {string} HTML string
     * @private
     */
    _generateValueHTML: function(columnName, valueMap) {
        var template = this.summaryModel.getTemplate(columnName);
        var html = '';

        if (_.isFunction(template)) {
            html = template(valueMap);
        } else if (_.isString(template)) {
            html = template;
        }

        return html;
    },

    /**
     * Generates a HTML string of <colgroup> and returns it
     * @returns {string} - HTML String
     * @private
     */
    _generateColgroupHTML: function() {
        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);
        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
        var htmlList = [];

        _.each(columnWidths, function(width, index) {
            htmlList.push(this.templateColgroup({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: columns[index].name,
                width: width + CELL_BORDER_WIDTH
            }));
        }, this);

        return htmlList.join('');
    },

    /**
     * Generates a HTML string of <tbody> and returns it
     * @returns {string} - HTML String
     * @private
     */
    _generateTbodyHTML: function() {
        var summaryModel = this.summaryModel;
        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);

        return _.reduce(columns, function(memo, column) {
            var columnName = column.name;
            var valueMap;

            if (summaryModel) {
                valueMap = summaryModel.getValue(column.name);
            }

            return memo + this.templateBody({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: columnName,
                className: [classNameConst.CELL, classNameConst.CELL_SUMMARY].join(' '),
                value: this._generateValueHTML(columnName, valueMap)
            });
        }, '', this);
    },

    /**
     * Render
     * @returns {object}
     */
    render: function() {
        var summaryHeight = this.dimensionModel.get('summaryHeight');

        if (summaryHeight) {
            this.$el.html(this.template({
                className: classNameConst.TABLE,
                height: summaryHeight,
                tbody: this._generateTbodyHTML(),
                colgroup: this._generateColgroupHTML()
            }));
        }

        return this;
    }
});

module.exports = Summary;
