/**
 * @fileoverview Selection Model class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../common/util');

/**
 * Row Model
 * @module model/row
 */
var Toolbar = Model.extend(/**@lends module:model/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     * @param  {object} options - Options
     */
    initialize: function(options) {
        Model.prototype.initialize.apply(this, arguments);
    },

    defatuls: {
        hasControlPanel: false,
        hasPagination: false,
        hasResizeHandler: false,

        // for control panel
        isExcelButtonVisible: false,
        isExcelAllButtonVisible: false,

        // tui.component.pagination
        pagination: null
    },

    isVisible: function() {
        return this.get('hasControlPanel') || this.get('hasPagination') || this.get('hasResizeHandler');
    }
});

module.exports = Toolbar;
