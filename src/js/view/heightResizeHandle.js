/**
 * @fileoverview Class for the height resize handle
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var HTML_INNER = '<a href="#"><span></span></a>';

/**
 * Class for the height resize handle
 * @module view/layout/heightResizeHandle
 * @extends module:base/view
 */
var HeightResizeHandle = View.extend(/**@lends module:view/layout/heightResizeHandle.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.timeoutIdForResize = 0;

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
     * Attach event handlers to start 'drag' action
     * @private
     */
    _attachMouseEvent: function() {
        $(document).on('mousemove', $.proxy(this._onMouseMove, this));
        $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        $(document).on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Detach event handler to cancel 'drag' action
     * @private
     */
    _detachMouseEvent: function() {
        $(document).off('mousemove', $.proxy(this._onMouseMove, this));
        $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        $(document).off('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Event handler for 'mousedown' event
     * @param {MouseEvent} mouseEvent - MouseEvent object
     * @private
     */
    _onMouseDown: function(mouseEvent) {
        mouseEvent.preventDefault();
        $(document.body).css('cursor', 'row-resize');
        this._attachMouseEvent();
    },

    /**
     * Event handler for 'mousemove' event
     * @param {MouseEvent} mouseEvent - MouseEvent object
     * @private
     */
    _onMouseMove: function(mouseEvent) {
        var dimensionModel = this.dimensionModel;
        var offsetTop = dimensionModel.get('offsetTop');
        var headerHeight = dimensionModel.get('headerHeight');
        var toolbarHeight = dimensionModel.get('toolbarHeight');
        var rowHeight = dimensionModel.get('rowHeight');
        var bodyHeight = mouseEvent.pageY - offsetTop - headerHeight - toolbarHeight;

        clearTimeout(this.timeoutIdForResize);

        bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());

        this.timeoutIdForResize = setTimeout(function() {
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
        }, 0);
    },

    /**
     * Event handler for 'mouseup' event
     * @private
     */
    _onMouseUp: function() {
        $(document.body).css('cursor', 'default');
        this._detachMouseEvent();
    },

    /**
     * Event handler for 'selectstart' event
     * @param {Event} event - Event object
     * @returns {boolean}
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this._destroyChildren();
        this.$el.html(HTML_INNER);

        return this;
    },

    /**
     * Destroy
     */
    destroy: function() {
        this.stopListening();
        this._onMouseUp();
        this._destroyChildren();
        this.remove();
    }
});

module.exports = HeightResizeHandle;
