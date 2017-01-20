/**
 * @fileoverview Drag event emitter
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var _ = require('underscore');
var GridEvent = require('./gridEvent');
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/* Drag event emitter
 * @module event/dragEventEmitter
 * @ignore
 */
var DragEventEmitter = tui.util.defineClass(/**@lends module:event/dragEventEmitter.prototype */{
    init: function(domEventBus) {
        this.domEventBus = domEventBus;
        this.targetType = null;

        domEventBus.on('mousedown:header', this._onMouseDown, this);
    },

    /**
     * Event handler for 'mouseup' event on document
     * @private
     */
    _onMouseUp: function() {
        this._detachDragEvents();
        this.domEventBus.trigger('dragend:' + this.targetType);
    },

    /**
     * Event handler for 'mousedown:*' events on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onMouseDown: function(gridEvent) {
        this.targetType = gridEvent.targetType;
        this.domEventBus.trigger('dragstart:' + this.targetType, gridEvent);

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
        var eventData = new GridEvent(ev);
        var $target = $(ev.target);

        if (this.targetType === 'header') {
            eventData.setData(this._getHeaderEventData($target));
        }
        this.domEventBus.trigger('dragmove:' + this.targetType, eventData);
    },

    /**
     * Returns the columnName and isOnHeaderArea value as an object from $target
     * @param {$} $target - target
     * @returns {Object}
     * @private
     */
    _getHeaderEventData: function($target) {
        return {
            columnName: $target.closest('th').attr(attrNameConst.COLUMN_NAME),
            isOnHeaderArea: $target.closest('.' + classNameConst.HEAD_AREA).length === 1
        };
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

/**
 * Create new instance of DragEventEmitter and returns it
 * @param {module:event/domEventBus} domEventBus - domEventBus
 * @returns {module:event/dragEventEmitter}
 * @static
 */
DragEventEmitter.create = function(domEventBus) {
    return new DragEventEmitter(domEventBus);
};

module.exports = DragEventEmitter;
