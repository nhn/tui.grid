/**
 * @fileoverview Toolbar View
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var GridEvent = require('../event/gridEvent');
var classNameConst = require('../common/classNameConst');

/**
 * Toolbar View
 * @module view/toolbar
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Toolbar = View.extend(/**@lends module:view/toolbar.prototype */{
    initialize: function(options) {
        _.assign(this, {
            domEventBus: options.domEventBus,
            toolbarModel: options.toolbarModel,
            dimensionModel: options.dimensionModel
        });

        this.on('appended', this._onAppended);
        this.listenTo(this.toolbarModel,
            'change:isExcelButtonVisible change:isExcelAllButtonVisible', this.render);
    },

    className: classNameConst.TOOLBAR,

    events: function() {
        var hash = {};
        hash['click .' + classNameConst.BTN_EXCEL] = '_onClickExcel';
        return hash;
    },

    templateExcelBtn: _.template(
        '<a href="#" class="' + classNameConst.BTN_EXCEL + ' ' + classNameConst.BTN_TEXT + ' <%=className%>">' +
        '<span><em class="' + classNameConst.BTN_EXCEL_ICON + '"></em><%=text%></span>' +
        '</a>'
    ),

    /**
     * Event handler for 'appended' event
     * @private
     */
    _onAppended: function() {
        this.dimensionModel.set('toolbarHeight', this.$el.outerHeight());
    },

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} ev - MouseEvent object
     * @private
     */
    _onClickExcel: function(ev) {
        var $button = $(ev.target).closest('a');
        var gridEvent, btnType;

        if ($button.hasClass(classNameConst.BTN_EXCEL_PAGE)) {
            btnType = 'page';
        } else if ($button.hasClass(classNameConst.BTN_EXCEL_ALL)) {
            btnType = 'all';
        }

        if (btnType) {
            ev.preventDefault();
            gridEvent = new GridEvent(ev);
            gridEvent.setData({type: btnType});
            this.domEventBus.trigger('click:excel', gridEvent);
        }
    },

    /**
     * Render
     * @returns {module:view/toolbar} this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;
        var $inner = $('<div>');

        if (toolbarModel.get('isExcelButtonVisible')) {
            $inner.append(this.templateExcelBtn({
                className: classNameConst.BTN_EXCEL_PAGE,
                text: '엑셀 다운로드'
            }));
        }
        if (toolbarModel.get('isExcelAllButtonVisible')) {
            $inner.append(this.templateExcelBtn({
                className: classNameConst.BTN_EXCEL_ALL,
                text: '전체 엑셀 다운로드'
            }));
        }
        this.$el.empty().append($inner);

        return this;
    }
});

module.exports = Toolbar;
