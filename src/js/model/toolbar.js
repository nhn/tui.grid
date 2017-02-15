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
 * @ignore
 */
var Toolbar = Model.extend(/**@lends module:model/toolbar.prototype */{
    initialize: function(options) {
        this.options = options;
    },

    defaults: {
        // excel button visibility
        isExcelButtonVisible: false,
        isExcelAllButtonVisible: false
    },

    /**
     * Returns whether the toolbar is enabled
     * @returns {Boolean} True if the toolbar is enbaled
     */
    isEnabled: function() {
        return isOptionEnabled(this.options);
    }
});

module.exports = Toolbar;
