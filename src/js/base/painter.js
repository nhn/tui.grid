/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

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
     * @param {Object} options - options
     */
    init: function(options) {
        this.controller = options.controller;
    },

    events: {},

    selector: '',

    attachEventHandlers: function($target, rootSelector) {
        _.each(this.events, function(methodName, eventName) {
            var bindedHandler = _.bind(this[methodName], this),
                selector = rootSelector + ' ' + this.selector;

            $target.on(eventName, selector, bindedHandler);
        }, this);
    },

    /**
     * 렌더러에서 반환할 HTML 스트링
     */
    getHtml: function() {
        throw new Error('implement getHtml() method');
    }
});

module.exports = Painter;
