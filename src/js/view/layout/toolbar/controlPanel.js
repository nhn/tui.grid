/**
 * @fileoverview Class for the control panel in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');
var classNameConst = require('../../../common/classNameConst');

/**
 * Class for the control panel in the toolbar
 * @module view/layout/toolbar/controlPanel
 * @extends module:base/view
 */
var ControlPanel = View.extend(/**@lends module:view/layout/toolbar/controlPanel.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            gridId: options.gridId,
            toolbarModel: options.toolbarModel,
            $btnExcel: null,
            $btnExcelAll: null
        });

        this.listenTo(this.toolbarModel,
            'change:isExcelButtonVisible change:isExcelAllButtonVisible', this.render);
    },

    events: function() {
        var hash = {};
        hash['click .' + classNameConst.BTN_EXCEL] = '_onClickExcel';
        return hash;
    },

    className: classNameConst.TOOLBAR_BTN_HOLDER,

    templateExcelBtn: _.template(
        '<a href="#" class="' + classNameConst.BTN_EXCEL + ' ' + classNameConst.BTN_TEXT + ' <%=className%>">' +
        '<span><em class="' + classNameConst.BTN_EXCEL_ICON + '"></em><%=text%></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     * @private
     */
    _onClickExcel: function(mouseEvent) {
        var grid = tui.Grid.getInstanceById(this.gridId);
        var net = grid.getAddOn('Net');
        var $target;

        mouseEvent.preventDefault();

        if (net) {
            $target = $(mouseEvent.target).closest('a');

            if ($target.hasClass(classNameConst.BTN_EXCEL_PAGE)) {
                net.download('excel');
            } else if ($target.hasClass(classNameConst.BTN_EXCEL_ALL)) {
                net.download('excelAll');
            }
        }
    },

    /**
     * Renders.
     * @returns {View.Layout.Toolbar.ControlPanel} - this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;

        this.$el.empty();

        if (toolbarModel.get('isExcelButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: classNameConst.BTN_EXCEL_PAGE,
                text: '엑셀 다운로드'
            }));
        }
        if (toolbarModel.get('isExcelAllButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: classNameConst.BTN_EXCEL_ALL,
                text: '전체 엑셀 다운로드'
            }));
        }
        return this;
    }
});

module.exports = ControlPanel;
