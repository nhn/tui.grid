/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

/**
 * Layer class that represents the state of rendering phase.
 * @module view/editingLayer
 * @extends module:base/view
 */
var FocusLayer = View.extend(/**@lends module:view/focusLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.focusModel = options.focusModel;
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.whichSide = options.whichSide;

        this.listenTo(this.focusModel, 'blur', this._onBlur);
        this.listenTo(this.focusModel, 'focus', this._onFocus);
    },

    className: 'focus_layer',

    /**
     * Event handler for 'onBlur' event on the render model.
     * @param {Object} cellData - cell data
     * @private
     */
    _onBlur: function() {
        console.log('blur!');
        this.$el.hide();
    },

    _onFocus: function(rowKey, columnName) {
        var targetSide = this.columnModel.isLside(columnName) ? 'L' : 'R';

        console.log(targetSide, this.whichSide);

        if (targetSide === this.whichSide) {
            console.log('show!');
            this.$el.show();
            this.$el.css({
                width: 100,
                height: 100,
                border: '1px solid #ccc'
            });

            console.log('is visible', this.$el.is(':visible'));
        }

        // if (
        // this.$el.show();
        // this.$el.css({
        //     width: 100,
        //     height: 100
        // });
        // console.log('focus', arguments);
    },

    /**
     * Render
     * @returns {Object} this instance
     */
    render: function() {
        return this;
    }
});

module.exports = FocusLayer;
