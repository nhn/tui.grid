/**
 * @fileoverview Toolbar model class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var isOptionEnabled = require('../common/util').isOptionEnabled;

/**
 * Toolbar Model
 * @module model/toolbar
 * @extends module:base/model
 */
var Toolbar = Model.extend(/**@lends module:model/toolbar.prototype */{
    initialize: function() {
        this._applyDeprecatedOption('excelDownload', 'hasControlPanel');
        this._applyDeprecatedOption('resizeHandle', 'hasResizeHandler');
        this._applyDeprecatedOption('pagination', 'hasPagination');
    },

    defaults: {
        // set by user (deprecated)
        hasControlPanel: false,  // changed to 'excelDownload'
        hasPagination: false, // changed to 'pagination'
        hasResizeHandler: false, // changed to 'resizeHandle'

        // set by user (since 1.4.0)
        excelDownload: false,
        resizeHandle: false,
        pagination: false, // {Object|Boolean}

        // for control panel
        isExcelButtonVisible: false,
        isExcelAllButtonVisible: false,

        // tui.component.pagination
        paginationComponent: null
    },

    _applyDeprecatedOption: function(newOptionName, oldOptionName) {
        if (!isOptionEnabled(this.get(newOptionName) && this.get(oldOptionName))) {
            this.set(newOptionName, true);
        }
    },

    /**
     * Returns whether the toolbar is visible
     * @returns {Boolean} True if the toolbar is visible
     */
    isVisible: function() {
        var excelDownload = isOptionEnabled(this.get('excelDownload')) || this.get('hasControlPanel');
        var resizeHandle = isOptionEnabled(this.get('resizeHandle')) || this.get('hasResizeHandler');
        var pagination = isOptionEnabled(this.get('pagination')) || this.get('hasPagination');

        return excelDownload || resizeHandle || pagination;
    }
});

module.exports = Toolbar;
