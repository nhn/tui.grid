/**
 * @fileoverview Public Event Emitter
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var snippet = require('tui-code-snippet');

/**
 * Class that listens public events (for external user) to the other object and
 * triggers them on the public object(module:grid).
 * @module publicEventEmitter
 * @param {Object} publicObject - Object on which event will be triggered.
 *            This object should have methods of Backbone.Events.
 * @ignore
 */
var PublicEventEmitter = snippet.defineClass(/** @lends module:publicEventEmitter.prototype */{
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
     * Trigger specified event on the public object.
     * @param  {String} eventName - Event name
     * @param  {Object} eventData - Event data
     * @private
     */
    _triggerOnPublic: function(eventName, eventData) {
        this.publicObject.trigger(eventName, _.extend(eventData, {
            instance: this.publicObject
        }));
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
     * Listen to Dom Event bus
     * @param  {module:event/domEventBus} domEventBus - Dom Event bus
     */
    listenToDomEventBus: function(domEventBus) {
        this._listenForThrough(domEventBus, [
            'click',
            'dblclick',
            'mousedown',
            'mouseover',
            'mouseout'
        ]);
    },

    /**
     * Listen to Focus model
     * @param  {module:model/focus} focusModel - Focus model
     */
    listenToFocusModel: function(focusModel) {
        this._listenForThrough(focusModel, ['focusChange']);
    },

    /**
     * Listen to RowList model
     * @param {module:model/rowList} dataModel - RowList model
     */
    listenToDataModel: function(dataModel) {
        this._listenForThrough(dataModel, [
            'check',
            'uncheck',
            'deleteRange'
        ]);
    },

    listenToSelectionModel: function(selectionModel) {
        this._listenForThrough(selectionModel, ['selection']);
    }
});

_.extend(PublicEventEmitter.prototype, Backbone.Events);

module.exports = PublicEventEmitter;
