/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var View = require('../../base/view');
var DragEventEmitter = require('../../event/dragEventEmitter');
var GridEvent = require('../../event/gridEvent');
var util = require('../../common/util');
var constMap = require('../../common/constMap');
var classNameConst = require('../../common/classNameConst');
var frameConst = constMap.frame;

// Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
var MIN_INTERVAL_FOR_PAUSED = 200;

// Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
var MIN_DISATNCE_FOR_DRAG = 10;

/**
 * Class for the body layout
 * @module view/layout/body
 * @extends module:base/view
 * @param {Object} options - Options
 * @param {String} [options.whichSide=R] L or R (which side)
 * @ignore
 */
var Body = View.extend(/** @lends module:view/layout/body.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        _.assign(this, {
            dimensionModel: options.dimensionModel,
            renderModel: options.renderModel,
            viewFactory: options.viewFactory,
            domEventBus: options.domEventBus,

            // DIV for setting rendering position of entire child-nodes of $el.
            $container: null,
            whichSide: (options && options.whichSide) || frameConst.R
        });

        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.dimensionModel, 'change:totalRowHeight', this._resetContainerHeight)
            .listenTo(this.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);

        this.dragEmitter = new DragEventEmitter({
            type: 'body',
            domEventBus: this.domEventBus,
            onDragMove: _.bind(this._onDragMove, this)
        });
    },

    className: classNameConst.BODY_AREA,

    events: function() {
        var hash = {};
        hash.scroll = '_onScroll';
        hash['mousedown .' + classNameConst.BODY_CONTAINER] = '_onMouseDown';

        return hash;
    },

    /**
     * Event handler for 'change:bodyHeight' event on module:model/dimension
     * @param {Object} model - changed model
     * @param {Number} value - new height value
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container DIV
     * @private
     */
    _resetContainerHeight: function() {
        this.$container.css({
            height: this.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * Event handler for 'scroll' event on DOM
     * @param {UIEvent} event - event object
     * @private
     */
    _onScroll: function(event) {
        var attrs = {
            scrollTop: event.target.scrollTop
        };

        if (this.whichSide === frameConst.R) {
            attrs.scrollLeft = event.target.scrollLeft;
        }
        this.renderModel.set(attrs);
    },

    /**
     * Event handler for 'change:scrollLeft' event on module:model/renderer
     * @param {Object} model - changed model
     * @param {Number} value - new scrollLeft value
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === frameConst.R) {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Event handler for 'chage:scrollTop' event on module:model/renderer
     * @param {Object} model - changed model instance
     * @param {Number} value - new scrollTop value
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * Mousedown event handler
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _onMouseDown: function(ev) {
        var $target = $(ev.target);
        var isTargetInput = $target.is('input, teaxarea');

        if (!this._triggerPublicMousedown(ev)) {
            return;
        }

        this._triggerBodyMousedown(ev);

        if (isTargetInput && ev.shiftKey) {
            ev.preventDefault();
        }

        if (util.isRightClickEvent(ev)) {
            return;
        }

        if (!isTargetInput || ev.shiftKey) {
            this.dragEmitter.start(ev, {
                pageX: ev.pageX,
                pageY: ev.pageY
            });
        }
    },

    /**
     * Trigger mousedown event on domEventBus and returns the result
     * @param {MouseEvent} ev - MouseEvent
     * @returns {module:event/gridEvent}
     * @private
     */
    _triggerPublicMousedown: function(ev) {
        var startTime, endTime;
        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($(ev.target)));
        var result = true;

        if (gridEvent.targetType === GridEvent.targetTypeConst.DUMMY) {
            result = false;
        } else {
            startTime = (new Date()).getTime();
            this.domEventBus.trigger('mousedown', gridEvent);

            if (gridEvent.isStopped()) {
                result = false;
            } else {
                // check if the model window (alert or confirm) was popped up
                endTime = (new Date()).getTime();
                result = (endTime - startTime) <= MIN_INTERVAL_FOR_PAUSED;
            }
        }

        return result;
    },

    /**
     * Trigger mousedown:body event on domEventBus
     * @param {MouseEvent} ev - MouseEvent
     * @private
     */
    _triggerBodyMousedown: function(ev) {
        var gridEvent = new GridEvent(ev, {
            pageX: ev.pageX,
            pageY: ev.pageY,
            shiftKey: ev.shiftKey
        });

        this.domEventBus.trigger('mousedown:body', gridEvent);
    },

    /**
     * Event handler for dragmove
     * @param {event:module/gridEvent} gridEvent - GridEvent
     */
    _onDragMove: function(gridEvent) {
        var startData = gridEvent.startData;
        var currentData = {
            pageX: gridEvent.pageX,
            pageY: gridEvent.pageY
        };

        if (this._getMouseMoveDistance(startData, currentData) < MIN_DISATNCE_FOR_DRAG) {
            gridEvent.stop();
        }
    },

    /**
     * Returns the distance between start position and current position.
     * @param {{pageX:number, pageY:number}} start - start position
     * @param {{pageX:number, pageY:number}} current - current position
     * @returns {number}
     * @private
     */
    _getMouseMoveDistance: function(start, current) {
        var dx = Math.abs(start.pageX - current.pageX);
        var dy = Math.abs(start.pageY - current.pageY);

        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
    },

    /**
     * renders
     * @returns {module:view/layout/body}
     */
    render: function() {
        var whichSide = this.whichSide;

        this._destroyChildren();

        if (!this.dimensionModel.get('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }
        if (!this.dimensionModel.get('scrollY') && whichSide === frameConst.R) {
            this.$el.css('overflow-y', 'hidden');
        }
        this.$el.css('height', this.dimensionModel.get('bodyHeight'));

        this.$container = $('<div>').addClass(classNameConst.BODY_CONTAINER);
        this.$el.append(this.$container);

        this._addChildren([
            this.viewFactory.createBodyTable(whichSide),
            this.viewFactory.createSelectionLayer(whichSide),
            this.viewFactory.createFocusLayer(whichSide)
        ]);
        this.$container.append(this._renderChildren());
        this._resetContainerHeight();

        return this;
    }
});

module.exports = Body;
