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

    tagName: 'div',
    className: 'btn_setup',
    template: _.template(
            '<a href="#" class="excel_download_button btn_text excel_all">' +
            '<span><em class="excel">전체엑셀다운로드</em></span>' +
            '</a>' +
            '<a href="#" class="excel_download_button btn_text excel_grid">' +
            '<span><em class="excel">엑셀다운로드</em></span>' +
            '</a>'
            ),
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
