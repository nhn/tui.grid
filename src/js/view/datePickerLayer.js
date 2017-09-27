/**
 * @fileoverview Layer View class which contains the 'tui-date-picker'
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var DatePicker = require('tui-date-picker');

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
var FULL_RANGES = [[new Date(1900, 0, 1), new Date(2999, 11, 31)]];
var DatePickerLayer;

/**
 * Layer View class which contains the 'tui-date-picker'
 * @module view/datePickerLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
DatePickerLayer = View.extend(/** @lends module:view/datePickerLayer.prototype */{
    initialize: function(options) {
        this.focusModel = options.focusModel;
        this.textPainter = options.textPainter;
        this.columnModel = options.columnModel;
        this.domState = options.domState;
        this.datePickerMap = this._createDatePickers();

        /**
         * Current focused input element
         * @type {jQuery}
         */
        this.$focusedInput = null;

        this.listenTo(this.textPainter, 'focusIn', this._onFocusInTextInput);
        this.listenTo(options.domEventBus, 'windowResize', this._closeDatePickerLayer);
    },

    className: classNameConst.LAYER_DATE_PICKER,

    events: {
        click: '_onClick'
    },

    /**
     * Event handler for the 'click' event on the datepicker layer.
     * @param {MouseEvent} ev - MouseEvent object
     * @private
     */
    _onClick: function(ev) {
        ev.stopPropagation();
    },

    /**
     * Creates instances map of 'tui-date-picker'
     * @returns {Object.<string, DatePicker>}
     * @private
     */
    _createDatePickers: function() {
        var datePickerMap = {};
        var columnModelMap = this.columnModel.get('columnModelMap');

        _.each(columnModelMap, function(columnModel) {
            var name = columnModel.name;
            var component = columnModel.component;
            var options;

            if (component && component.name === 'datePicker') {
                options = component.options || {};

                datePickerMap[name] = new DatePicker(this.$el, options);

                this._bindEventOnDatePicker(datePickerMap[name]);
            }
        }, this);

        return datePickerMap;
    },

    /**
     * Bind custom event on the DatePicker instance
     * @param {DatePicker} datePicker - instance of DatePicker
     * @private
     */
    _bindEventOnDatePicker: function(datePicker) {
        var self = this;

        datePicker.on('open', function() {
            self.textPainter.blockFocusingOut();
        });

        datePicker.on('close', function() {
            var focusModel = self.focusModel;
            var address = focusModel.which();
            var rowKey = address.rowKey;
            var columnName = address.columnName;
            var changedValue = self.$focusedInput.val();

            self.textPainter.unblockFocusingOut();

            // when the datePicker layer is closed, selected date must set on input element.
            if (focusModel.isEditingCell(rowKey, columnName)) {
                focusModel.dataModel.setValue(rowKey, columnName, changedValue);
            }
            focusModel.finishEditing();
        });
    },

    /**
     * Resets date picker options
     * @param {Object} options - datePicker options
     * @param {jQuery} $input - target input element
     * @param {string} columnName - name to find the DatePicker instance created on each column
     * @private
     */
    _resetDatePicker: function(options, $input, columnName) {
        var datePicker = this.datePickerMap[columnName];
        var format = options.format || DEFAULT_DATE_FORMAT;
        var date = options.date || (new Date());
        var selectableRanges = options.selectableRanges;

        datePicker.setInput($input, {
            format: format,
            syncFromInput: true
        });

        if (selectableRanges) {
            datePicker.setRanges(selectableRanges);
        } else {
            datePicker.setRanges(FULL_RANGES);
        }

        if ($input.val() === '') {
            datePicker.setDate(date);
            $input.val('');
        }
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
        var options;

        if (editType === 'text' && component && component.name === 'datePicker') {
            options = component.options || {};

            this.$focusedInput = $input;

            this.$el.css(this._calculatePosition($input)).show();
            this._resetDatePicker(options, $input, columnName);
            this.datePickerMap[columnName].open();
        }
    },

    /**
     * Close the date picker layer that is already opend
     * @private
     */
    _closeDatePickerLayer: function() {
        var name = this.focusModel.which().columnName;
        var datePicker = this.datePickerMap[name];

        if (datePicker && datePicker.isOpened()) {
            datePicker.close();
        }
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
