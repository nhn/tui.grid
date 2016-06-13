/**
 * @fileoverview Base class for Views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Views
 * @module base/view
 * @mixes module:base/common
 */
var View = Backbone.View.extend(/**@lends module:base/view.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        this._children = [];
    },

    /**
     * 에러 객체를 반환한다.
     * @param {String} message - Error message
     * @returns {error} 에러객체
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
     * Add children views
     * @param {(Object|Array)} views - View instance of Array of view instances
     * @private
     */
    _addChildren: function(views) {
        if (!_.isArray(views)) {
            views = [views];
        }
        [].push.apply(this._children, _.compact(views));
    },

    /**
     * Render children and returns thier elements as array.
     * @returns {array.<HTMLElement>} An array of element of children
     */
    _renderChildren: function() {
        var elements = _.map(this._children, function(view) {
            return view.render().el;
        });

        return elements;
    },

    /**
     * Trigger 'appended' event on child view.
     * @private
     */
    _triggerChildrenAppended: function() {
        _.each(this._children, function(view) {
            view.trigger('appended');
        });
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
     * 등록되어있는 자식 View 들을 제거한다.
     */
    _destroyChildren: function() {
        if (this._children) {
            while (this._children.length > 0) {
                this._children.pop().destroy();
            }
        }
    }
});

_.assign(View.prototype, common);

module.exports = View;
