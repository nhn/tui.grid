/**
 * @fileoverview Hidden Textarea View for handling key navigation events and emulating clipboard actions
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var View = require('../base/view');
var clipboardUtil = require('../common/clipboardUtil');
var keyEvent = require('../event/keyEvent');
var classNameConst = require('../common/classNameConst');
var KEYDOWN_LOCK_TIME = 10;
var Clipboard;

var isEdge = snippet.browser.edge;
var supportWindowClipboardData = !!window.clipboardData;

/**
 * Returns whether the ev.preventDefault should be called
 * @param {module:event/gridEvent} gridEvent - GridEvent
 * @returns {boolean}
 * @ignore
 */
function shouldPreventDefault(gridEvent) {
    return gridEvent.type !== 'key:clipboard';
}

/**
 * Returns whether given GrivEvent instance is paste event
 * @param {module:event/gridEvent} gridEvent - GridEvent
 * @returns {boolean}
 * @ignore
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
Clipboard = View.extend(/** @lends module:view/clipboard.prototype */{
    initialize: function(options) {
        _.assign(this, {
            focusModel: options.focusModel,
            clipboardModel: options.clipboardModel,
            domEventBus: options.domEventBus,

            isLocked: false,
            lockTimerId: null
        });

        this.listenTo(this.focusModel, 'focusClipboard', this._onFocusClipboard);
        this.listenTo(this.clipboardModel, 'change:text', this._onClipboardTextChange);
    },

    tagName: 'div',

    className: classNameConst.CLIPBOARD,

    attributes: {
        contenteditable: true
    },

    events: {
        keydown: '_onKeyDown',
        copy: '_onCopy',
        paste: '_onPaste',
        blur: '_onBlur'
    },

    /**
     * Render
     * @returns {module:view/clipboard}
     */
    render: function() {
        return this;
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

        gridEvent = keyEvent.generate(ev);

        if (!gridEvent) {
            return;
        }

        this._lock();

        if (shouldPreventDefault(gridEvent)) {
            ev.preventDefault();
        }

        if (!isPasteEvent(gridEvent)) {
            this.domEventBus.trigger(gridEvent.type, gridEvent);
        }
    },

    /**
     * oncopy event handler
     * - Step 1: When the keys(ctrl+c) are downed on grid, 'key:clipboard' is triggered.
     * - Step 2: To listen 'change:text event on the clipboard model.
     * - Step 3: When 'change:text' event is fired,
     *           IE browsers set copied data to window.clipboardData in event handler and
     *           other browsers append copied data and focus to contenteditable element.
     * - Step 4: Finally, when 'copy' event is fired on browsers except IE,
     *           setting copied data to ClipboardEvent.clipboardData.
     * @param {jQueryEvent} ev - Event object
     * @private
     */
    _onCopy: function(ev) {
        var text = this.clipboardModel.get('text');

        if (!supportWindowClipboardData) {
            (ev.originalEvent || ev).clipboardData.setData('text/plain', text);
        }

        ev.preventDefault();
    },

    /**
     * onpaste event handler
     * The original 'paste' event should be prevented on browsers except MS
     * to block that copied data is appending on contenteditable element.
     * @param {jQueryEvent} ev - Event object
     * @private
     */
    _onPaste: function(ev) {
        var clipboardData = (ev.originalEvent || ev).clipboardData || window.clipboardData;

        if (!isEdge && !supportWindowClipboardData) {
            ev.preventDefault();
            this._pasteInOtherBrowsers(clipboardData);
        } else {
            this._pasteInMSBrowsers(clipboardData);
        }
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
            }
        } catch (e) {
            // Do nothing.
            // This try/catch block is just for preventing 'Unspecified error'
            // in IE9(and under) when running test using karma.
        }
    },

    /**
     * Event handler for the 'change:text' event on the model/clipboard module
     * @private
     */
    _onClipboardTextChange: function() {
        var text = this.clipboardModel.get('text');

        if (supportWindowClipboardData) {
            window.clipboardData.setData('Text', text);
        } else {
            this.$el.html(text).focus();
        }
    },

    /**
     * Paste copied data in other browsers (chrome, safari, firefox)
     * [if] condition is copying from ms-excel,
     * [else] condition is copying from the grid or the copied data is plain text.
     * @param {object} clipboardData - clipboard object
     * @private
     */
    _pasteInOtherBrowsers: function(clipboardData) {
        var clipboardModel = this.clipboardModel;
        var data = clipboardData.getData('text/html');
        var table;

        if (data && $(data).find('tbody').length > 0) {
            // step 1: Append copied data on contenteditable element to parsing correctly table data.
            this.$el.html('<table>' + $(data).find('tbody').html() + '</table>');

            // step 2: Make grid data from cell data of appended table element.
            table = this.$el.find('table')[0];
            data = clipboardUtil.convertTableToData(table);

            // step 3: Empty contenteditable element to reset.
            this.$el.html('');
        } else {
            data = clipboardData.getData('text/plain');
            data = clipboardUtil.convertTextToData(data);
        }

        clipboardModel.pasteClipboardDataToGrid(data);
    },

    /**
     * Paste copied data in MS-browsers (IE, edge)
     * @param {object} clipboardData - clipboard object
     * @private
     */
    _pasteInMSBrowsers: function(clipboardData) {
        var self = this;
        var clipboardModel = this.clipboardModel;
        var data = clipboardData.getData('Text');
        var table;

        data = clipboardUtil.convertTextToData(data);

        setTimeout(function() {
            if (self.$el.find('table').length > 0) {
                table = self.$el.find('table')[0];
                data = clipboardUtil.convertTableToData(table);
            }

            self.$el.html('');
            clipboardModel.pasteClipboardDataToGrid(data);
        }, 0);
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
     * Returns whether the element has focus
     * @returns {boolean}
     * @private
     */
    _hasFocus: function() {
        return this.$el.is(':focus');
    }
});

Clipboard.KEYDOWN_LOCK_TIME = KEYDOWN_LOCK_TIME;

module.exports = Clipboard;
