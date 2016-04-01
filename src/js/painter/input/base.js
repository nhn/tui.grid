/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');
var keyNameMap = require('../../common/constMap').keyName;

/**
 * Input Painter Base
 * @module painter/input/base
 * @extends module:base/painter
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/base.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function() {
        Painter.apply(this, arguments);
    },

    events: {
        blur: '_onBlur',
        keydown: '_onKeyDown',
        focus: '_onFocus'
    },

    selector: 'input',

    keyDownActions: {
        ESC: function(param) {
            this.controller.endEdit(param.address, true);
        },
        ENTER: function(param) {
            this.controller.endEdit(param.address, true, param.value);
        },
        TAB: function(param) {
            this.controller.endEdit(param.address, true, param.value);
            this.controller.focusInNext(param.shiftKey);
        }
    },

    /**
     * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
     * @param {jQuery} $target 조회할 엘리먼트
     * @returns {{rowKey: String, columnName: String}} rowKey 와 columnName 정보
     * @private
     */
    _getCellAddress: function($target) {
        return {
            rowKey: $target.closest('tr').attr('key'),
            columnName: $target.closest('td').attr('columnName')
        };
    },

    /**
     * Extends the default keydown actions.
     * @param {Object} actions - Object that contains the action functions
     * @private
     */
    _extendKeydownActions: function(actions) {
        this.keyDownActions = _.assign({}, this.keyDownActions, actions);
    },

    _extendEvents: function(events) {
        this.events = _.assign({}, this.events, events);
    },

    /**
     * event 객체가 발생한 셀을 찾아 editOption에 inputEvent 핸들러 정보가 설정되어 있으면
     * 해당 이벤트 핸들러를 호출해준다.
     * @param {Event} event - 이벤트 객체
     * @param {string} eventType - The type of the event.
     *     This value is required to clarify the type because the `event.type` of the 'focus' event
     *     can be 'focusin' and the 'blur' event can be 'focusout'
     * @returns {boolean} Return value of the event handler. Null if there's no event handler.
     * @private
     */
    _executeCustomEventHandler: function(event) {
        var $input = $(event.target),
            cellInfo = this._getCellAddress($input);

        return this.controller.executeCustomInputEventHandler(event, cellInfo);
    },

    /**
     * focus 이벤트 핸들러
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onFocus: function(event) {
        var address = this._getCellAddress($(event.target));

        this._executeCustomEventHandler(event);
        this.controller.startEdit(address);
    },

    /**
     * blur 이벤트 핸들러
     * @param {Event} blurEvent 이벤트 객체
     * @private
     */
    _onBlur: function(blurEvent) {
        var address = this._getCellAddress($(event.target));

        this._executeCustomEventHandler(blurEvent);
        this.controller.endEdit(address, false, blurEvent.target.value);
    },

    /**
     * keydown 이벤트 핸들러
     * @param  {KeyboardEvent} event 키보드 이벤트 객체
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which,
            keyName = keyNameMap[keyCode],
            action = this.keyDownActions[keyName],
            $target = $(event.target),
            param = {
                $target: $target,
                address: this._getCellAddress($target),
                shiftKey: event.shiftKey,
                value: $target.val()
            };

        this._executeCustomEventHandler(event);

        if (action) {
            action.call(this, param);
            event.preventDefault();
        }
    },

    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    }
});

module.exports = InputPainter;
