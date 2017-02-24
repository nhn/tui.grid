/**
 * @fileoverview Layer View class which contains the 'tui-component-date-picker'
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
var DatePickerLayer;

/**
 * Layer View class which contains the 'tui-component-date-picker'
 * @module view/datePickerLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
DatePickerLayer = View.extend(/**@lends module:view/datePickerLayer.prototype */{
    initialize: function(options) {
        this.textPainter = options.textPainter;
        this.columnModel = options.columnModel;
        this.domState = options.domState;
        this.datePicker = this._createDatePicker();

        this._preventCalendarEvent();

        this.listenTo(this.textPainter, 'focusIn', this._onFocusInTextInput);
        this.listenTo(this.textPainter, 'focusOut', this._onFocusOutTextInput);
    },

    className: classNameConst.LAYER_DATE_PICKER,

    /**
     * Creates an instance of 'tui-component-date-picker'
     * @returns {tui.component.DatePicker}
     * @private
     */
    _createDatePicker: function() {
        var datePicker = new tui.component.Datepicker(this.$el, {
            date: new Date(),
            input: {
                format: 'yyyy-MM-dd'
            },
            calendar: {
                showToday: false
            }
        });

        datePicker.on('change', function() {
            console.log('date change');
        });

        return datePicker;
    },

    /**
     * Prevent event of calendar
     */
    _preventCalendarEvent: function() {
        var calendar = this.datePicker.getCalendar();

        calendar._$element.mousedown(function(ev) {
            ev.preventDefault();
            ev.target.unselectable = true;  // trick for IE8
            return false;
        });
    },

    /**
     * Resets date picker options
     * @param {Object} options - datePicker options
     * @param {jQuery} $input - target input element
     * @private
     */
    _resetDatePicker: function(options, $input) {
        var datePicker = this.datePicker;
        var date = datePicker.getDate() || (new Date());
        var selectableRanges = options.selectableRanges;

        datePicker.setDateFormat(options.format || DEFAULT_DATE_FORMAT);
        if (selectableRanges) {
            datePicker.setRanges(options.selectableRanges);
        }
        datePicker.setDate(date);
        datePicker.setInput($input);
    },

    /**
     * Calculates the position of the layer and returns the object that contains css properties.
     * @param {jQuery} $input - input element
     * @returns {Object}
     * @private
     */
    _calculatePosition: function($input) {
        var inputOffset = $input.offset();
        var inputHeight = $input.outerHeight();
        var wrapperOffset = this.domState.getOffset();

        return {
            top: inputOffset.top - wrapperOffset.top + inputHeight,
            left: inputOffset.left - wrapperOffset.left
        };
    },

    /**
     * Event handler for 'focusIn' event of module:painter/input/text
     * @param {jQuery} $input - target input element
     * @param {{rowKey: String, columnName: String}} address - target cell address
     * @private
     */
    _onFocusInTextInput: function($input, address) {
        var columnName = address.columnName;
        var component = this.columnModel.getColumnModel(columnName).component;
        var editType = this.columnModel.getEditType(columnName);

        if (editType === 'text' && component && component.name === 'datePicker') {
            this.$el.css(this._calculatePosition($input)).show();
            this._resetDatePicker(component.options || {}, $input);
            this.datePicker.open();
        }
    },

    /**
     * Event handler for 'focusOut' event of module:painter/input/text
     * @private
     */
    _onFocusOutTextInput: function() {
        this.datePicker.close();
        this.$el.hide();
    },

    /**
     * Render
     * @returns {Object} this object
     */
    render: function() {
        this.$el.hide();
        return this;
    }
});

module.exports = DatePickerLayer;
