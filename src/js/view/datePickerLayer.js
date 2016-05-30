/**
 * @fileoverview Layer class which contains the Toast-UI-DatePicker component
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var DEFAULT_DATE_FORM = 'yyyy-mm-dd';
var DatePickerLayer;

/**
 * Returns a HTML string of a span element to represent an arrow-icon
 * @param {String} dirClassName - className to indicate direction of the arrow
 * @returns {String}
 */
function arrowHTML(dirClassName) {
    var classNameStr = classNameConst.ICO_ARROW + ' ' + dirClassName;

    return '<span class="' + classNameStr + '"></span>';
}

/**
 * Layer class which contains the Toast-UI-DatePicker component
 * @module view/datePickerLayer
 * @extends module:base/view
 */
DatePickerLayer = View.extend(/**@lends module:view/datePickerLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.textPainter = options.textPainter;
        this.columnModel = options.columnModel;
        this.domState = options.domState;
        this.calendar = this._createCalendar();
        this.datePicker = this._createDatePicker();

        this._customizeCalendarBtns();

        this.listenTo(this.textPainter, 'focusIn', this._onFocusInTextInput);
        this.listenTo(this.textPainter, 'focusOut', this._onFocusOutTextInput);
    },

    className: classNameConst.LAYER_DATE_PICKER,

    /**
     * Creates an instance of tui-component-calendar
     * @returns {tui.component.Calendar}
     * @private
     */
    _createCalendar: function() {
        var $calendarEl = $('<div>').addClass(classNameConst.CALENDAR);

        // prevent blur event from occuring in the input element
        $calendarEl.mousedown(function(ev) {
            ev.preventDefault();
            ev.target.unselectable = true;  // trick for IE8
            return false;
        });

        return new tui.component.Calendar({
            element: $calendarEl,
            classPrefix: classNameConst.CALENDAR + '-'
        });
    },

    /**
     * Customize the buttons of the calendar.
     * @private
     */
    _customizeCalendarBtns: function() {
        var $header = this.calendar.$header;
        var leftArrowHTML = arrowHTML(classNameConst.ICO_ARROW_LEFT);
        var rightArrowHTML = arrowHTML(classNameConst.ICO_ARROW_RIGHT);

        $header.find('.' + classNameConst.CALENDAR_BTN_PREV_YEAR).html(leftArrowHTML + leftArrowHTML);
        $header.find('.' + classNameConst.CALENDAR_BTN_NEXT_YEAR).html(rightArrowHTML + rightArrowHTML);
        $header.find('.' + classNameConst.CALENDAR_BTN_PREV_MONTH).html(leftArrowHTML);
        $header.find('.' + classNameConst.CALENDAR_BTN_NEXT_MONTH).html(rightArrowHTML);
    },

    /**
     * Creates an instance of tui-component-datepicker
     * @returns {tui.component.DatePicker}
     * @private
     */
    _createDatePicker: function() {
        var datePicker = new tui.component.DatePicker({
            parentElement: this.$el,
            dateForm: DEFAULT_DATE_FORM,
            enableSetDateByEnterKey: false,
            selectableClassName: classNameConst.CALENDAR_SELECTABLE,
            selectedClassName: classNameConst.CALENDAR_SELECTED,
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
     * Resets date picker options
     * @param {Object} options - datePicker options
     * @param {jQuery} $input - target input element
     * @private
     */
    _resetDatePicker: function(options, $input) {
        var datePicker = this.datePicker;
        var today = new Date();

        datePicker.setDateForm(options.dateForm || DEFAULT_DATE_FORM);
        datePicker.setRanges(options.selectableRanges || []);
        datePicker.setDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
        datePicker.setElement($input);
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
     * Event handler for 'focusin' event of module:painter/input/text
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
            this._resetDatePicker(component.option || {}, $input);
            this.datePicker.open();
        }
    },

    /**
     * Hides the layer.
     * @private
     */
    _onFocusOutTextInput: function() {
        this.datePicker.close();
        this.$el.hide();
    }
});

module.exports = DatePickerLayer;
