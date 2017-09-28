/**
 * @fileoverview Drag event emitter
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var GridEvent = require('./gridEvent');

/* Drag event emitter
 * @module event/dragEventEmitter
 * @ignore
 */
var DragEventEmitter = snippet.defineClass(/** @lends module:event/dragEventEmitter.prototype */{
    init: function(options) {
        _.assign(this, {
            type: options.type,
            domEventBus: options.domEventBus,
            onDragMove: options.onDragMove,
            onDragEnd: options.onDragEnd,
            cursor: options.cursor,
            startData: null
        });
    },

    /**
     * Starts drag
     * @param {MouseEvent} ev - MouseEvent
     * @param {Object} data - start data (to be used in dragmove, dragend event)
     */
    start: function(ev, data) {
        var gridEvent = new GridEvent(ev, data);

        this.domEventBus.trigger('dragstart:' + this.type, gridEvent);

        if (!gridEvent.isStopped()) {
            this._startDrag(ev.target, data);
        }
    },

    /**
     * Starts drag
     * @param {HTMLElement} target - drag target
     * @param {Object} data - start data
     * @private
     */
    _startDrag: function(target, data) {
        this.startData = data;
        this._attachDragEvents();

        if (this.cursor) {
            $('body').css('cursor', this.cursor);
        }

        // for IE8 and under
        if (target.setCapture) {
            target.setCapture();
        }
    },

    /**
     * Ends drag
     * @private
     */
    _endDrag: function() {
        this.startData = null;
        this._detachDragEvents();

        if (this.cursor) {
            $('body').css('cursor', 'default');
        }

        // for IE8 and under
        if (document.releaseCapture) {
            document.releaseCapture();
        }
    },

    /**
     * Event handler for 'mousemove' event on document
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onMouseMove: function(ev) {
        var gridEvent = new GridEvent(ev, {
            startData: this.startData,
            pageX: ev.pageX,
            pageY: ev.pageY
        });

        if (_.isFunction(this.onDragMove)) {
            this.onDragMove(gridEvent);
        }

        if (!gridEvent.isStopped()) {
            this.domEventBus.trigger('dragmove:' + this.type, gridEvent);
        }
    },

    /**
     * Event handler for 'mouseup' event on document
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onMouseUp: function(ev) {
        var gridEvent = new GridEvent(ev, {
            startData: this.startData
        });

        if (_.isFunction(this.onDragEnd)) {
            this.onDragEnd(gridEvent);
        }

        if (!gridEvent.isStopped()) {
            this.domEventBus.trigger('dragend:' + this.type, gridEvent);
            this._endDrag();
        }
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
