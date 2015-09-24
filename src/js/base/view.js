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
        var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid,
            _viewList: []
        });
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
     * 자식 View 를 생성할 때 사용하는 메서드
     * 스스로를 다시 rendering 하거나 소멸 될 때 내부에서 스스로 생성한 View instance 들도 메모리에서 제거하기 위함이다.
     *
     * @param {class} constructor   View 생성자
     * @param {object} params   생성자에 넘길 옵션 파라미터
     * @return {instance} instance    생성자를 통해 인스턴스화 한 객체
     */
    createView: function(constructor, params) {
        var instance = new constructor(params);
        this.addView(instance);
        return instance;
    },

    /**
     * destroy 시 함께 삭제할 View 를 내부 변수 _viewList 에 추가한다.
     * @param {instance} instance 인스턴스 객체
     * @return {instance} instance 인자로 전달받은 인스턴스 객체
     */
    addView: function(instance) {
        if (!this.hasOwnProperty('_viewList')) {
            this.setOwnProperties({
                _viewList: []
            });
        }
        this._viewList.push(instance);
        return instance;
    },

    /**
     * 자식 View를 제거한 뒤 자신도 제거한다.
     */
    destroy: function() {
        this.stopListening();
        this.destroyChildren();
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
    destroyChildren: function() {
        if (this._viewList instanceof Array) {
            while (this._viewList.length !== 0) {
                this._viewList.pop().destroy();
            }
        }
    }
});

_.assign(View.prototype, common);

module.exports = View;
