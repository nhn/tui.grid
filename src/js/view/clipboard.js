/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var keyEvent = require('../event/keyEvent');
var classNameConst = require('../common/classNameConst');
var constMap = require('../common/constMap');
var keyCodeMap = constMap.keyCode;

/**
 * Clipboard view class
 * @module view/clipboard
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    initialize: function(options) {
        _.assign(this, {
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            focusModel: options.focusModel,
            selectionModel: options.selectionModel,
            renderModel: options.renderModel,
            domEventBus: options.domEventBus,
            useFormattedValue: !!tui.util.pick(options, 'copyOption', 'useFormattedValue'),
            timeoutIdForKeyIn: 0,
            isLocked: false
        });

        this.listenTo(this.focusModel, 'focusClipboard', this._onFocusClipboard);
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
     * 랜더링 한다.
     * @returns {View.Clipboard} this object
     */
    render: function() {
        return this;
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 설정한다.
     * @private
     */
    _lock: function() {
        clearTimeout(this.timeoutIdForKeyIn);
        this.isLocked = true;
        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10); // eslint-disable-line no-magic-numbers
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 해제한다.
     * @private
     */
    _unlock: function() {
        this.isLocked = false;
    },

    /**
     * keyDown 이벤트 핸들러
     * @param {Event} ev - event이벤트 객체
     * @private
     */
    _onKeyDown: function(ev) { // eslint-disable-line complexity
        var gridEvent;

        if (this.isLocked) {
            ev.preventDefault();
            return;
        }

        gridEvent = keyEvent.generate(ev);

        if (gridEvent) {
            ev.preventDefault();
            this.domEventBus.trigger(gridEvent.type, gridEvent);
        }
        this._lock();
    },

    /**
     * ctrl 가 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithCtrl: function(keyDownEvent) {  // eslint-disable-line complexity
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyCodeMap.CHAR_C:
                this._copyToClipboard();
                break;
            case keyCodeMap.CHAR_V:
                this._pasteWhenKeyupCharV();
                break;
            default:
                break;
        }
    },

    /**
     * paste date
     * @private
     */
    _pasteWhenKeyupCharV: function() {
        var self = this;

        // pressing v long time, clear clipboard to keep final paste date
        this._clearClipBoard();
        if (this.pasting) {
            return;
        }

        this.pasting = true;
        this.$el.on('keyup', function() {
            self._pasteToGrid();
            self.pasting = false;
        });
    },

   /**
     * clipboard textarea clear
     * @private
     */
    _clearClipBoard: function() {
        this.$el.val('');
    },

    /**
     * paste text data
     * @private
     */
    _pasteToGrid: function() {
        var selectionModel = this.selectionModel;
        var focusModel = this.focusModel;
        var dataModel = this.dataModel;
        var startIdx, data;

        if (selectionModel.hasSelection()) {
            startIdx = selectionModel.getStartIndex();
        } else {
            startIdx = focusModel.indexOf();
        }
        data = this._getProcessClipBoardData();

        this.$el.off('keyup');
        dataModel.paste(data, startIdx);
    },

    /**
     * process data for paste to grid
     * @private
     * @returns {Array.<Array.<string>>} result
     */
    _getProcessClipBoardData: function() {
        var text = this.$el.val();
        var result = text.split('\n');
        var i = 0;
        var len = result.length;

        for (; i < len; i += 1) {
            result[i] = result[i].split('\t');
        }

        return result;
    },

    /**
     * clipboard 에 설정될 문자열 반환한다.
     * @returns {String} 데이터를 text 형태로 변환한 문자열
     * @private
     */
    _getClipboardString: function() {
        var selectionModel = this.selectionModel;
        var focused = this.focusModel.which();
        var text;

        if (selectionModel.hasSelection()) {
            text = this.selectionModel.getValuesToString(this.useFormattedValue);
        } else if (this.useFormattedValue) {
            text = this.renderModel.getCellData(focused.rowKey, focused.columnName).formattedValue;
        } else {
            text = this.dataModel.get(focused.rowKey).getValueString(focused.columnName);
        }

        return text;
    },

    /**
     * 현재 그리드의 data 를 clipboard 에 copy 한다.
     * @private
     */
    _copyToClipboard: function() {
        var text = this._getClipboardString();

        if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        } else {
            this.$el.val(text).select();
        }
    }
});

module.exports = Clipboard;
