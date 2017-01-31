/**
 * @fileoverview Hidden Textarea View for handling key navigation events and emulating clipboard actions
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var keyEvent = require('../event/keyEvent');
var classNameConst = require('../common/classNameConst');
var Clipboard;

var PASTE_DEBOUNCE_TIME = 300;
var KEYDOWN_LOCK_TIME = 10;

/**
 * Returns whether the ev.preventDefault should be called
 * @param {module:event/gridEvent} gridEvent - GridEvent
 * @returns {boolean}
 */
function shouldPreventDefault(gridEvent) {
    return gridEvent.type !== 'key:clipboard';
}

/**
 * Returns whether given GrivEvent instance is paste event
 * @param {module:event/gridEvent} gridEvent - GridEvent
 * @returns {boolean}
 */
function isPasteEvent(gridEvent) {
    return gridEvent.type === 'key:clipboard' && gridEvent.command === 'paste';
}

/**
 * Clipboard view class
 * @module view/clipboard
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    initialize: function(options) {
        _.assign(this, {
            focusModel: options.focusModel,
            clipboardModel: options.clipboardModel,
            domEventBus: options.domEventBus,

            isLocked: false,
            lockTimerId: null
        });

        this._handlePasteEventDebounced = _.debounce(_.bind(this._handlePasteEvent, this), PASTE_DEBOUNCE_TIME);

        this.listenTo(this.focusModel, 'focusClipboard', this._onFocusClipboard);
        this.listenTo(this.clipboardModel, 'change:text', this._onClipboardTextChange);
    },

    tagName: 'textarea',

    className: classNameConst.CLIPBOARD,

    events: {
        'keydown': '_onKeyDown',
        'blur': '_onBlur'
    },

    /**
     * Event handler for blur event.
     * @private
     */
    _onBlur: function() {
        var focusModel = this.focusModel;

        setTimeout(function() {
            focusModel.refreshState();
        }, 0);
    },

    /**
     * Returns whether the element has focus
     * @returns {boolean}
     * @private
     */
    _hasFocus: function() {
        return this.$el.is(':focus');
    },

    /**
     * Event handler for 'focusClipboard' event on focusModel
     * @private
     */
    _onFocusClipboard: function() {
        try {
            if (!this._hasFocus()) {
                this.$el.focus();

                // bug fix for IE8 (calling focus() only once doesn't work)
                if (!this._hasFocus()) {
                    this.$el.focus();
                }
                this.focusModel.refreshState();
            }
        } catch (e) {
            // Do nothing.
            // This try/catch block is just for preventing 'Unspecified error'
            // in IE9(and under) when running test using karma.
        }
    },

    /**
     * Render
     * @returns {module:view/clipboard}
     */
    render: function() {
        return this;
    },

    /**
     * Lock for a moment to reduce event frequency
     * @private
     */
    _lock: function() {
        this.isLocked = true;
        this.lockTimerId = setTimeout(_.bind(this._unlock, this), KEYDOWN_LOCK_TIME);
    },

    /**
     * Unlock
     * @private
     */
    _unlock: function() {
        this.isLocked = false;
        this.lockTimerId = null;
    },

    /**
     * Event handler for the keydown event
     * @param {Event} ev - Event
     * @private
     */
    _onKeyDown: function(ev) {
        var gridEvent;

        if (this.isLocked) {
            ev.preventDefault();
            return;
        }

        this._lock();

        gridEvent = keyEvent.generate(ev);
        if (!gridEvent) {
            return;
        }

        if (shouldPreventDefault(gridEvent)) {
            ev.preventDefault();
        }

        if (isPasteEvent(gridEvent)) {
            this._handlePasteEventDebounced(gridEvent);
        } else {
            this.domEventBus.trigger(gridEvent.type, gridEvent);
        }
    },

    /**
     * Event handler for the 'change:text' event on the model/clipboard module
     * @private
     */
    _onClipboardTextChange: function() {
        var text = this.clipboardModel.get('text');

        if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        } else {
            this.$el.val(text).select();
        }
    },

    /**
     * Handle paste event.
     * This handler should be called with debounced to :
     * (should be called in the next frame to use the text pasted into the textarea by native action)
     * (also should be called debounced for preventing repetitive execution)
     * @param {module:event/gridEvent} gridEvent - GridEvent
     */
    _handlePasteEvent: function(gridEvent) {
        gridEvent.setData({text: this.$el.val()});
        this.domEventBus.trigger(gridEvent.type, gridEvent);
        this.$el.val('');
    }
});

module.exports = Clipboard;
