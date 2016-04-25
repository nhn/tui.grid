/**
 * @fileoverview Class for the control panel in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

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

    events: {
        'click a.tui-grid-excel-download-button': '_onClickExcel'
    },

    tagName: 'div',

    className: 'tui-grid-btn-setup',

    templateExcelBtn: _.template(
        '<a href="#" class="tui-grid-excel-download-button tui-grid-btn-text <%=className%>">' +
        '<span><em class="tui-grid-excel"></em><%=text%></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     * @private
     */
    _onClickExcel: function(mouseEvent) {
        var grid = tui.Grid.getInstanceById(this.gridId),
            net = grid.getAddOn('Net'),
            $target;

        mouseEvent.preventDefault();

        if (net) {
            $target = $(mouseEvent.target).closest('a');

            if ($target.hasClass('tui-grid-excel-page')) {
                net.download('excel');
            } else if ($target.hasClass('tui-grid-excel-all')) {
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
                className: 'tui-grid-excel-page',
                text: '엑셀 다운로드'
            }));
        }
        if (toolbarModel.get('isExcelAllButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: 'tui-grid-excel-all',
                text: '전체 엑셀 다운로드'
            }));
        }
        return this;
    }
});

module.exports = ControlPanel;
