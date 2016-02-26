/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * GridEvent
 * @module model/renderer-smart
 * @extends module:model/renderer
 */
var GridEvent = tui.util.defineClass(/**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} data - Event data for handler
     */
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
     * Stops propagating this event.
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
