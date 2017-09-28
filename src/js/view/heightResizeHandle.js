/**
 * @fileoverview Class for the height resize handle
 * @author NHN Ent. FE Development Team
 */

'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var DragEventEmitter = require('../event/dragEventEmitter');

/**
 * Class for the height resize handle
 * @module view/layout/heightResizeHandle
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var HeightResizeHandle = View.extend(/** @lends module:view/layout/heightResizeHandle.prototype */{
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.domEventBus = options.domEventBus;

        this.dragEmitter = new DragEventEmitter({
            type: 'resizeHeight',
            cursor: 'row-resize',
            domEventBus: this.domEventBus
        });

        this.on('appended', this._onAppended);
    },

    className: classNameConst.HEIGHT_RESIZE_HANDLE,

    events: {
        'mousedown': '_onMouseDown'
    },

    /**
     * Event handler for 'appended' event
     * @private
     */
    _onAppended: function() {
        this.dimensionModel.set('resizeHandleHeight', this.$el.outerHeight());
    },

    /**
     * Event handler for 'mousedown' event
     * @param {MouseEvent} ev - MouseEvent object
     * @private
     */
    _onMouseDown: function(ev) {
        ev.preventDefault();

        this.dragEmitter.start(ev, {
            mouseOffsetY: ev.offsetY
        });
    },

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this.$el.html('<button><span></span></button>');

        return this;
    }
});

module.exports = HeightResizeHandle;
