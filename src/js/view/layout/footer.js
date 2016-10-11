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
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.whichSide = options.whichSide;

        this.listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    className: classNameConst.FOOT_AREA,

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
     * Sync scroll-left position with the value of body
     * @param {Object} model - render model
     * @param {Number} value - scrollLeft value
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Render
     * @returns {object}
     */
    render: function() {
        var columnModelList, columnWidthList, tbodyHTML;

        if (!this.dimensionModel.get('footerHeight')) {
            return this;
        }

        columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);
        columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide);
        tbodyHTML = _.reduce(columnModelList, function(memo, column, index) {
            return memo + this.templateHeader({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: column.columnName,
                className: classNameConst.CELL_HEAD + ' ' + classNameConst.CELL,
                width: columnWidthList[index],
                value: this.whichSide === 'R' ? '합계: 123' : ''
            });
        }, '', this);

        this.$el.html(this.template({
            tbody: tbodyHTML,
            height: this.dimensionModel.get('footerHeight'),
            className: classNameConst.TABLE
        }));

        return this;
    }
});

module.exports = Footer;

