/**
 * @fileoverview Footer 관련
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');
var View = require('../../base/view');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');

var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

var Footer = View.extend(/**@lends module:view/layout/footer.prototype */{
    /**
     * Initialize
     * @param {object} options - options
     */
    initialize: function(options) {
        this.whichSide = options.whichSide;

        // models
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.summaryModel = options.summaryModel;

        // events
        this.listenTo(this.renderModel, 'change:scrollLeft', this._onChangeScrollLeft);
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
     */
    _onScrollView: function(event) {
        if (this.whichSide === 'R') {
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
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Refresh <th> tag whenever summary value is changed.
     * @param {string} columnName - column name
     * @param {object} valueMap - value map
     * @private
     */
    _onChangeSummaryValue: function(columnName, valueMap) {
        var $th = this.$el.find('th[' + ATTR_COLUMN_NAME + '="' + columnName + '"]');

        $th.html(this._generateValueHTML(valueMap));
    },

    /**
     * Generates a HTML string of column summary value and returns it.
     * @param {object} valueMap - value map
     * @returns {string} HTML string
     * @private
     */
    _generateValueHTML: function(valueMap) {
        if (!valueMap) {
            return '';
        }
        return _.values(valueMap).join(', ');
    },

    /**
     * Generates a HTML string of <tbody> and returns it
     * @returns {string} - HTML String
     */
    _generateTbodyHTML: function() {
        var summaryModel = this.summaryModel;
        var columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);
        var columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide);

        return _.reduce(columnModelList, function(memo, column, index) {
            var valueMap;

            if (summaryModel) {
                valueMap = summaryModel.getValue(column.columnName);
            }

            return memo + this.templateHeader({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: column.columnName,
                className: classNameConst.CELL_HEAD + ' ' + classNameConst.CELL,
                width: columnWidthList[index],
                value: this._generateValueHTML(valueMap)
            });
        }, '', this);
    },

    /**
     * Render
     * @returns {object}
     */
    render: function() {
        var footerHeight = this.dimensionModel.get('footerHeight');

        if (!footerHeight) {
            return this;
        }

        this.$el.html(this.template({
            className: classNameConst.TABLE,
            height: footerHeight,
            tbody: this._generateTbodyHTML()
        }));

        return this;
    }
});

module.exports = Footer;
