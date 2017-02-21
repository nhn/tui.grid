/**
 * @fileoverview Footer
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');
var View = require('../../base/view');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;

var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

/**
 * Footer area
 * @module view/layout/footer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Footer = View.extend(/**@lends module:view/layout/footer.prototype */{
    initialize: function(options) {
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
        this.columnTemplateMap = options.columnTemplateMap || {};

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
        this.listenTo(this.columnModel, 'setFooterContent', this._setColumnContent);
        if (this.summaryModel) {
            this.listenTo(this.summaryModel, 'change', this._onChangeSummaryValue);
        }
    },

    className: classNameConst.FOOT_AREA,

    events: {
        scroll: '_onScrollView'
    },

    /**
     * template
     */
    template: _.template(
        '<table class="<%=className%>" style="height:<%=height%>px">' +
            '<tbody><%=tbody%></tbody>' +
        '</table>'
    ),

    /**
     * Template for <th>
     */
    templateHeader: _.template(
        '<th <%=attrColumnName%>="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            'style="width:<%=width%>px"' +
        '>' +
        '<%=value%>' +
        '</th>'
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

    _onChangeColumnWidth: function() {
        var columnWidths = this.coordColumnModel.getColumnWidthList(this.whichSide);
        var $ths = this.$el.find('th');

        _.each(columnWidths, function(columnWidth, index) {
            $ths.eq(index).css('width', columnWidth);
        });
    },

    /**
     * Sets the HTML string of <th> of given column
     * @param {string} columnName - column name
     * @param {string} contents - HTML string
     * @private
     */
    _setColumnContent: function(columnName, contents) {
        var $th = this.$el.find('th[' + ATTR_COLUMN_NAME + '="' + columnName + '"]');

        $th.html(contents);
    },

    /**
     * Refresh <th> tag whenever summary value is changed.
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
        var template = this.columnTemplateMap[columnName];
        var html = '';

        if (_.isFunction(template)) {
            html = template(valueMap);
        }

        return html;
    },

    /**
     * Generates a HTML string of <tbody> and returns it
     * @returns {string} - HTML String
     * @private
     */
    _generateTbodyHTML: function() {
        var summaryModel = this.summaryModel;
        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);
        var columnWidths = this.coordColumnModel.getColumnWidthList(this.whichSide);

        return _.reduce(columns, function(memo, column, index) {
            var columnName = column.name;
            var valueMap;

            if (summaryModel) {
                valueMap = summaryModel.getValue(column.name);
            }

            return memo + this.templateHeader({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: columnName,
                className: classNameConst.CELL_HEAD + ' ' + classNameConst.CELL,
                width: columnWidths[index],
                value: this._generateValueHTML(columnName, valueMap)
            });
        }, '', this);
    },

    /**
     * Render
     * @returns {object}
     */
    render: function() {
        var footerHeight = this.dimensionModel.get('footerHeight');

        if (footerHeight) {
            this.$el.html(this.template({
                className: classNameConst.TABLE,
                height: footerHeight,
                tbody: this._generateTbodyHTML()
            }));
        }

        return this;
    }
});

module.exports = Footer;
