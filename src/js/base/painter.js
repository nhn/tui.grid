/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Painters
 * - HTML Element 당 하나의 view 를 생성하면 성능이 좋지 않기 때문에 Drawer 라는 개념을 도입.
 * - 마크업 문자열을 생성하고 이벤트 핸들러를 attach, detach 하는 역할.
 * - backbone view 의 events 와 동일한 방식으로 evantHandler 라는 프로퍼티에 이벤트 핸들러를 정의한다.
 * @module base/painter
 */
var Painter = tui.util.defineClass(/**@lends module:base/painter.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     */
    init: function(attrs) {
        var grid = attrs && attrs.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
        this.initializeEventHandler();
    },

    eventHandler: {},

    /**
     * eventHandler 를 미리 parsing 하여 들고있는다.
     */
    initializeEventHandler: function() {
        var eventHandler = {};
        _.each(this.eventHandler, function(methodName, eventName) {
            var tmp = eventName.split(' '),
                event = tmp[0],
                selector = tmp[1] || '';

            eventHandler[event] = {
                selector: selector,
                handler: $.proxy(this[methodName], this)
            };
        }, this);
        this.setOwnProperties({
            _eventHandler: eventHandler
        });
    },

    /**
     * 이벤트 핸들러 정보를 반환한다.
     * @returns {object} Event handlers
     */
    getEventHandlerInfo: function() {
        return this._eventHandler;
    },

    /**
     * 렌더러에서 반환할 HTML 스트링
     */
    getHtml: function() {
        throw this.error('implement getHtml() method');
    }
});
_.assign(Painter.prototype, common);
module.exports = Painter;
