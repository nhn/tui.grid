/**
 * @fileoverview Drag event emitter
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var _ = require('underscore');
var GridEvent = require('./gridEvent');

/* Drag event emitter
 * @module event/dragEventEmitter
 * @ignore
 */
var DragEventEmitter = tui.util.defineClass(/**@lends module:event/dragEventEmitter.prototype */{
    init: function(options) {
        _.assign(this, {
            type: options.type,
            domEventBus: options.domEventBus,
            onDragMove: options.onDragMove,
            onDragEnd: options.onDragEnd,
            startData: null
        });
    },

    /**
     * Starts drag action
     * @param {MouseEvent} ev - MouseEvent
     * @param {Object} data - start data (to be used in dragmove, dragend event)
     */
    start: function(ev, data) {
        var gridEvent = new GridEvent();

        this.startData = data;
        gridEvent.setData(data);
        this.domEventBus.trigger('dragstart:' + this.type, gridEvent);

        if (!gridEvent.isStopped()) {
            this._attachDragEvents();
        }
    },

    /**
     * Event handler for 'mousemove' event on document
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onMouseMove: function(ev) {
        var gridEvent = new GridEvent(ev);

        if (_.isFunction(this.onDragMove)) {
            this.onDragMove(gridEvent);
        }

        gridEvent.setData({startData: this.startData});
        this.domEventBus.trigger('dragmove:' + this.type, gridEvent);
    },

    /**
     * Event handler for 'mouseup' event on document
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onMouseUp: function(ev) {
        var gridEvent = new GridEvent(ev);

        if (_.isFunction(this.onDragEnd)) {
            this.onDragEnd(gridEvent);
        }

        gridEvent.setData({startData: this.startData});
        this.domEventBus.trigger('dragend:' + this.type, gridEvent);

        this.startData = null;
        this._detachDragEvents();
    },

    /**
     * Event handler for 'selectstart' event on document
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onSelectStart: function(ev) {
        ev.preventDefault();
    },

    /**
     * Attach mouse event handlers for drag to document
     * @private
     */
    _attachDragEvents: function() {
        $(document)
            .on('mousemove.grid', _.bind(this._onMouseMove, this))
            .on('mouseup.grid', _.bind(this._onMouseUp, this))
            .on('selectstart.grid', _.bind(this._onSelectStart, this));
    },

    /**
     * Detach mouse event handlers drag from document
     * @private
     */
    _detachDragEvents: function() {
        $(document).off('.grid');
    }
});

module.exports = DragEventEmitter;
