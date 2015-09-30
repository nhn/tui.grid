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
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
    },

    events: {
        'click a.excel_download_button': '_onClickExcel'
    },

    tagName: 'div',

    className: 'btn_setup',

    template: _.template(
        '<a href="#" class="excel_download_button btn_text excel_all">' +
        '<span><em class="excel">전체엑셀다운로드</em></span>' +
        '</a>' +
        '<a href="#" class="excel_download_button btn_text excel_page">' +
        '<span><em class="excel">엑셀다운로드</em></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} clickEvent - MouseEvent object
     */
    _onClickExcel: function(mouseEvent) {
        var net = this.grid.addOn.Net,
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
        this.destroyChildren();
        this.$el.html(this.template());
        return this;
    }
});

module.exports = ControlPanel;
