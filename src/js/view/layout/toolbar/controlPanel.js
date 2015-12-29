/**
 * @fileoverview Class for the control panel in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the control panel in the toolbar
 * @module view/layout/toolbar/controlPanel
 */
var ControlPanel = View.extend(/**@lends module:view/layout/toolbar/controlPanel.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function(options) {
        this.setOwnProperties({
            gridId: options.gridId,
            toolbarModel: options.toolbarModel,
            $btnExcel: null,
            $btnExcelAll: null
        });

        this.listenTo(this.toolbarModel,
            'change:isExcelButtonVisible change:isExcelAllButtonVisible', this.render)
    },

    events: {
        'click a.excel_download_button': '_onClickExcel'
    },

    tagName: 'div',

    className: 'btn_setup',

    templateExcelBtn: _.template(
        '<a href="#" class="excel_download_button btn_text <%=className%>">' +
        '<span><em class="excel"><%=text%></em></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} clickEvent - MouseEvent object
     */
    _onClickExcel: function(mouseEvent) {
        var grid = tui.Grid.getInstanceById(this.gridId),
            net = grid.getAddOn('Net'),
            $target;

        mouseEvent.preventDefault();
        
        if (net) {
            $target = $(mouseEvent.target).closest('a');

            if ($target.hasClass('excel_page')) {
                net.download('excel');
            } else if ($target.hasClass('excel_all')) {
                net.download('excelAll');
            }
        }
    },

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar.ControlPanel} - this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;

        this.$el.empty();

        if (toolbarModel.get('isExcelButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: 'excel_page',
                text: '엑셀 다운로드'
            }));
        }
        if (toolbarModel.get('isExcelAllButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: 'excel_all',
                text: '전체 엑셀 다운로드'
            }));
        }
        return this;
    }
});

module.exports = ControlPanel;
