/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');

var DatePickerLayer = View.extend({
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        var painter = options.textPainter;

        this.domState = options.domState;
        this.calendar = this._createCalendar();
        this.datePicker = this._createDatePicker();

        this.listenTo(painter, 'focusIn', this._show);
        this.listenTo(painter, 'focusOut', this._hide);
    },

    className: classNameConst.LAYER_DATE_PICKER,

    /**
     * Creates tui-component-calendar instance
     * @returns {[type]} [description]
     */
    _createCalendar: function() {
        var calendar = new tui.component.Calendar({
            element: $('<div id="calendar">')
        });

        calendar.$element.mousedown(function(ev) {
            ev.preventDefault();
            return false;
        });

        return calendar;
    },

    _createDatePicker: function() {
        var datePicker = new tui.component.DatePicker({
            parentElement: this.$el,
            dateForm: 'yyyy-mm-dd',
            pos: {
                top: 0,
                left: 0
            }
        }, this.calendar);

        datePicker.on('update', function() {
            datePicker.close();
        });

        return datePicker;
    },

    /**
     * Calculates the position and the dimension of the layer and returns the object that contains css properties.
     * @param {jQuery} $input - input element
     * @returns {Object}
     * @private
     */
    _calculateLayoutStyle: function($input) {
        var inputOffset = $input.offset();
        var inputHeight = $input.outerHeight();
        var wrapperOffset = this.domState.getOffset();

        return {
            top: inputOffset.top - wrapperOffset.top + inputHeight,
            left: inputOffset.left - wrapperOffset.left
        };
    },

    _show: function($input) {
        this.$el.css(this._calculateLayoutStyle($input)).show();
        this.datePicker.setElement($input);
        this.datePicker.open();
    },

    _hide: function() {
        this.datePicker.close();
        this.$el.hide();
    },

    render: function() {
        return this;
    }
});

module.exports = DatePickerLayer;
