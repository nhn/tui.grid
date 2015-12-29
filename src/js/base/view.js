/**
 * @fileoverview Base class for Views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Views
 * @module base/view
 */
var View = Backbone.View.extend(/**@lends module:base/view.prototype */{
    /**
     * @constructs
     * @mixes module:base/common
     * @param {Object} attributes Attributes
     */
    initialize: function(attributes) {
        this._children = [];
    },

    /**
     * 에러 객체를 반환한다.
     * @param {String} message - Error message
     * @return {error} 에러객체
     */
    error: function(message) {
        var GridError = function() {
            this.name = 'Grid Exception';
            this.message = message || 'error';
        };
        GridError.prototype = new Error();
        return new GridError();
    },

    /**
     * destroy 시 함께 삭제할 View 를 내부 변수 _children 에 추가한다.
     * @param {instance} instance 인스턴스 객체
     * @return {instance} instance 인자로 전달받은 인스턴스 객체
     */
    _addChildren: function(views) {
        if (!_.isArray(views)) {
            views = [views];
        }
        _.each(views, function(view) {
            this._children.push(view);
        }, this);
    },

    /**
     * Render children and returns thier elements as array.
     * @return {array.<HTMLElement>} An array of element of children
     */
    _renderChildren: function() {
        var elements = [];

        _.each(this._children, function(view) {
            elements.push(view.render().el);
        });
        return elements;
    },

    /**
     * 자식 View를 제거한 뒤 자신도 제거한다.
     */
    destroy: function() {
        this.stopListening();
        this._destroyChildren();
        this.remove();
    },

    /**
     * customEvent 에서 사용할 이벤트 객체를 포멧에 맞게 생성하여 반환한다.
     * @param {Object} data 이벤트 핸들러에 넘길 데이터
     * @return {{_isStopped: boolean, stop: function, param1: param1, param2: param2}} 생성된 커스텀 이벤트 객체
     */
    createEventData: function(data) {
        var eventData = $.extend({}, data);
        eventData.stop = function() {
            this._isStopped = true;
        };
        eventData.isStopped = function() {
            return this._isStopped;
        };
        eventData._isStopped = eventData._isStopped || false;
        return eventData;
    },

    /**
     * 등록되어있는 자식 View 들을 제거한다.
     */
    _destroyChildren: function() {
        if (_.isArray(this._children)) {
            while (this._children.length > 0) {
                this._children.pop().destroy();
            }
        }
    }
});

_.assign(View.prototype, common);

module.exports = View;
