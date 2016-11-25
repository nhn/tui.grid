/**
 * @fileoverview Event class for public event of Grid
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

/**
 * Event class for public event of Grid
 * @module common/gridEvent
 * @param {Object} data - Event data for handler
 * @ignore
 */
var GridEvent = tui.util.defineClass(/**@lends module:common/gridEvent.prototype */{
    init: function(data) {
        this._stopped = false;
        this.setData(data);
    },

    /**
     * Sets data
     * @param {Object} data - data
     */
    setData: function(data) {
        _.extend(this, data);
    },

    /**
     * Stops propogation of this event.
     * @api
     */
    stop: function() {
        this._stopped = true;
    },

    /**
     * Returns whether this event is stopped.
     * @returns {Boolean}
     */
    isStopped: function() {
        return this._stopped;
    }
});

module.exports = GridEvent;
