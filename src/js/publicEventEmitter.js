/**
 * @fileoverview Public Event Emitter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

/**
 * Class that listens public events (for external user) to the other object and
 * triggers them on the public object(module:grid).
 * @module publicEventEmitter
 * @param {Object} publicObject - Object on which event will be triggered.
 *            This object should have methods of Backbone.Events.
 * @ignore
 */
var PublicEventEmitter = tui.util.defineClass(/**@lends module:publicEventEmitter.prototype */{
    init: function(publicObject) {
        this.publicObject = publicObject;
    },

    /**
     * Listen and trigger specified events with same event name.
     * @param {Object} target - Target object
     * @param {String[]} eventNames - An array of the event names
     * @private
     */
    _listenForThrough: function(target, eventNames) {
        _.each(eventNames, function(eventName) {
            this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, eventName));
        }, this);
    },

    /**
     * Listen specified event and rename it to public name and trigger it.
     * @param  {Object} target - Target object
     * @param  {String} eventName - Event name
     * @param  {String} publicEventName - New event name for public use
     * @private
     */
    _listenForRename: function(target, eventName, publicEventName) {
        this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, publicEventName));
    },

    /**
     * Trigger specified event on the public object.
     * @param  {String} eventName - Event name
     * @param  {Object} eventData - Event data
     * @private
     */
    _triggerOnPublic: function(eventName, eventData) {
        this.publicObject.trigger(eventName, eventData);
    },

    /**
     * Listen to Net addon.
     * @param {module:addon/net} net - Net addon object
     */
    listenToNetAddon: function(net) {
        this._listenForThrough(net, [
            'beforeRequest',
            'response',
            'successResponse',
            'failResponse',
            'errorResponse'
        ]);
    },

    /**
     * Listen to Conatiner view.
     * @param  {module:view/container} container - Container view object
     */
    listenToContainerView: function(container) {
        this._listenForThrough(container, [
            'click',
            'dblclick',
            'mousedown',
            'clickCell',
            'dblclickCell',
            'mouseoverCell',
            'mouseoutCell',
            'rendered'
        ]);
    },

    /**
     * Listen to Focus model
     * @param  {module:model/focus} focusModel - Focus model
     */
    listenToFocusModel: function(focusModel) {
        this._listenForRename(focusModel, 'select', 'selectRow');
    },

    /**
     * Listen to RowList model
     * @param {module:model/rowList} dataModel - RowList model
     */
    listenToDataModel: function(dataModel) {
        this._listenForThrough(dataModel, [
            'check',
            'uncheck'
        ]);
    }
});

_.extend(PublicEventEmitter.prototype, Backbone.Events);

module.exports = PublicEventEmitter;
