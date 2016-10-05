/**
 * @fileoverview Header 관련
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
        this.whichSide = options.whichSide;
    },

    className: classNameConst.FOOTER_AREA,

    /**
     * 전체 template
     */
    template: _.template(
        '<table class="<%=className%>" style="height:<%=height%>">' +
            '<tbody><%=tbody%></tbody>' +
        '</table>'
    ),

    /**
     * <th> 템플릿
     */
    templateHeader: _.template(
        '<th <%=attrColumnName%>="<%=columnName%>" ' +
            'class="<%=className%>" ' +
        '>' +
        '<%=value%>' +
        '</th>'
    ),

    render: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);
        var columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide);
        var tbodyHTML = _.reduce(columnModelList, function(memo, column, index) {
            return memo + this.templateHeader({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: column.columnName,
                className: '',
                width: columnWidthList[index],
                value: 0
            });
        }, '', this);

        this.$el.html(this.template({
            tbody: tbodyHTML,
            height: 30,
            className: classNameConst.TABLE
        }));

        return this;
    }
});

module.exports = Footer;

