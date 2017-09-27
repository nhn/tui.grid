/**
 * @fileoverview Base class for the Input Painter
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var snippet = require('tui-code-snippet');

var Painter = require('../../base/painter');
var keyNameMap = require('../../common/constMap').keyName;

/**
 * Input Painter Base
 * @module painter/input/base
 * @extends module:base/painter
 * @param {Object} options - options
 * @ignore
 */
var InputPainter = snippet.defineClass(Painter, /** @lends module:painter/input/base.prototype */{
    init: function() {
        Painter.apply(this, arguments);

        /**
         * State of finishing to edit
         * @type {Boolean}
         */
        this._finishedEditing = false;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        keydown: '_onKeyDown',
        focusin: '_onFocusIn',
        focusout: '_onFocusOut',
        change: '_onChange'
    },

    /**
     * keydown Actions
     * @type {Object}
     */
    keyDownActions: {
        ESC: function(param) {
            this.controller.finishEditing(param.address, true);
        },
        ENTER: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
        },
        TAB: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
            this.controller.focusInToNextCell(param.shiftKey);
        }
    },

    /**
     * Extends the default keydown actions.
     * @param {Object} actions - Object that contains the action functions
     * @private
     */
    _extendKeydownActions: function(actions) {
        this.keyDownActions = _.assign({}, this.keyDownActions, actions);
    },

    /**
     * Extends the default event object
     * @param {Object} events - Object that contains the names of event handlers
     */
    _extendEvents: function(events) {
        this.events = _.assign({}, this.events, events);
    },

    /**
     * Executes the custom handler (defined by user) of the input events.
     * @param {Event} event - DOM event object
     * @param {{rowKey: number, columnName: string}} address - target cell address
     * @private
     */
    _executeCustomEventHandler: function(event, address) {
        this.controller.executeCustomInputEventHandler(event, address);
    },

    /**
     * Event handler for the 'change' event.
     * This method is just a stub. Override this if necessary.
     * @private
     */
    _onChange: function() {
        // do nothing
    },

    /**
     * Event handler for the 'focusin' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onFocusIn: function(event) {
        var $target = $(event.target);
        var address = this._getCellAddress($target);
        var self = this;

        // Defers starting editing
        // as button-type(checkbox, radio) defers finishing editing for detecting blurred state.
        // see {@link module:painter/input/button#_onFocusOut}
        _.defer(function() {
            self._executeCustomEventHandler(event, address);
            self.trigger('focusIn', $target, address);
            self.controller.startEditing(address);
        });
    },

    /**
     * Event handler for the 'focusout' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onFocusOut: function(event) {
        var $target = $(event.target);
        var address = this._getCellAddress($target);

        if (!this._finishedEditing) {
            this._executeCustomEventHandler(event, address);
            this.trigger('focusOut', $target, address);
            this.controller.finishEditing(address, false, $target.val());
        }
    },

    /**
     * Event handler for the 'keydown' event.
     * @param  {KeyboardEvent} event - KeyboardEvent object
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which;
        var keyName = keyNameMap[keyCode];
        var action = this.keyDownActions[keyName];
        var $target = $(event.target);
        var param = {
            $target: $target,
            address: this._getCellAddress($target),
            shiftKey: event.shiftKey,
            value: $target.val()
        };

        this._executeCustomEventHandler(event, param.address);

        if (action && !event.shiftKey) {
            action.call(this, param);
            event.preventDefault();
        }
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @abstract
     * @protected
     */
    _getDisplayValue: function() {
        throw new Error('implement _getDisplayValue() method');
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @abstract
     * @protected
     */
    _generateInputHtml: function() {
        throw new Error('implement _generateInputHtml() method');
    },

    /**
     * Returns whether the cell has view mode.
     * @param {Object} cellData - cell data
     * @returns {Boolean}
     * @private
     */
    _isUsingViewMode: function(cellData) {
        return snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @implements {module:painter/input/base}
     */
    generateHtml: function(cellData) {
        var result;

        if (!_.isNull(cellData.convertedHTML)) {
            result = cellData.convertedHTML;
        } else if (!this._isUsingViewMode(cellData) || cellData.editing) {
            result = this._generateInputHtml(cellData);
        } else {
            result = this._getDisplayValue(cellData);
        }

        return result;
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    },

    /**
     * Block focusing out
     */
    blockFocusingOut: function() {
        this._finishedEditing = true;
    },

    /**
     * Unblock focusing out
     */
    unblockFocusingOut: function() {
        this._finishedEditing = false;
    }
});

_.assign(InputPainter.prototype, Backbone.Events);

module.exports = InputPainter;
