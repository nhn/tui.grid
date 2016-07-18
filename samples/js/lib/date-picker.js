(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Spinbox', require('./src/spinbox'), true);
tui.util.defineNamespace('tui.component.TimePicker', require('./src/timepicker'), true);
tui.util.defineNamespace('tui.component.DatePicker', require('./src/datepicker'), true);

},{"./src/datepicker":2,"./src/spinbox":3,"./src/timepicker":4}],2:[function(require,module,exports){
/**
 * Created by nhnent on 15. 5. 14..
 * @fileoverview This component provides a calendar for picking a date & time.
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, component-calendar-1.0.1, timePicker.js
 */

'use strict';

var utils = require('./utils');

var inArray = tui.util.inArray,
    formatRegExp = /yyyy|yy|mm|m|dd|d/gi,
    mapForConverting = {
        yyyy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        yy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        y: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        mm: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        m: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        dd: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'},
        d: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'}
    },
    CONSTANTS = {
        MIN_YEAR: 1970,
        MAX_YEAR: 2999,
        MONTH_DAYS: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        WRAPPER_TAG: '<div style="position:absolute;"></div>',
        MIN_EDGE: +new Date(0),
        MAX_EDGE: +new Date(2999, 11, 31),
        YEAR_TO_MS: 31536000000
    };

/**
 * A number, or a string containing a number.
 * @typedef {Object} dateHash
 * @property {number} year - 1970~2999
 * @property {number} month - 1~12
 * @property {number} date - 1~31
 */

/**
 * Create DatePicker<br>
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateHash'
 * @constructor
 * @param {Object} option - options for DatePicker
 *      @param {HTMLElement|string|jQuery} option.element - input element(or selector) of DatePicker
 *      @param {dateHash} [option.date = today] - initial date object
 *      @param {string} [option.dateForm = 'yyyy-mm-dd'] - format of date string
 *      @param {string} [option.defaultCentury = 20] - if year-format is yy, this value is prepended automatically.
 *      @param {HTMLElement|string|jQuery} [option.parentElement] - The wrapper element will be inserted into
 *           this element. (since 1.3.0)
 *      @param {string} [option.selectableClassName = 'selectable'] - for selectable date elements
 *      @param {string} [option.selectedClassName = 'selected'] - for selected date element
        @param {boolean} [option.enableSetDateByEnterKey = true] - Whether set date from the input value
            when the 'Enter' key pressed (since 1.3.0)
 *      @param {Array.<Array.<dateHash>>} [options.selectableRanges] - Selectable date ranges, See example
 *      @param {Object} [option.pos] - calendar position style value
 *          @param {number} [option.pos.left] - position left of calendar
 *          @param {number} [option.pos.top] - position top of calendar
 *          @param {number} [option.pos.zIndex] - z-index of calendar
 *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)
 *      @param {boolean} [option.showAlways = false] - whether the datepicker shows the calendar always
 *      @param {boolean} [option.useTouchEvent = true] - whether the datepicker uses touch events
 *      @param {tui.component.TimePicker} [option.timePicker] - TimePicker instance
 * @param {tui.component.Calendar} calendar - Calendar instance
 * @example
 *   var calendar = new tui.component.Calendar({
 *       element: '#layer',
 *       titleFormat: 'yyyy년 m월',
 *       todayFormat: 'yyyy년 mm월 dd일 (D)'
 *   });
 *
 *   var timePicker = new tui.component.TimePicker({
 *       showMeridian: true,
 *       defaultHour: 13,
 *       defaultMinute: 24
 *   });
 *
 *   var range1 = [
 *          {year: 2015, month:1, date: 1},
 *          {year: 2015, month:2, date: 1}
 *      ],
 *      range2 = [
 *          {year: 2015, month:3, date: 1},
 *          {year: 2015, month:4, date: 1}
 *      ],
 *      range3 = [
 *          {year: 2015, month:6, date: 1},
 *          {year: 2015, month:7, date: 1}
 *      ];
 *
 *   var picker1 = new tui.component.DatePicker({
 *       element: '#picker',
 *       dateForm: 'yyyy년 mm월 dd일 - ',
 *       date: {year: 2015, month: 1, date: 1 },
 *       selectableRanges: [range1, range2, range3],
 *       openers: ['#opener'],
 *       timePicker: timePicker
 *   }, calendar);
 *
 *   // Close calendar when select a date
 *   $('#layer').on('click', function(event) {
 *       var $el = $(event.target);
 *
 *       if ($el.hasClass('selectable')) {
 *           picker1.close();
 *       }
 *   });
 */
var DatePicker = tui.util.defineClass(/** @lends DatePicker.prototype */{
    init: function(option, calendar) {
        // set defaults
        option = tui.util.extend({
            dateForm: 'yyyy-mm-dd ',
            defaultCentury: '20',
            selectableClassName: 'selectable',
            selectedClassName: 'selected',
            selectableRanges: [],
            enableSetDateByEnterKey: true,
            showAlways: false,
            useTouchEvent: true
        }, option);

        /**
         * Calendar instance
         * @type {Calendar}
         * @private
         */
        this._calendar = calendar;

        /**
         * Element for displaying a date value
         * @type {HTMLElement}
         * @private
         */
        this._$element = $(option.element);

        /**
         * Element wrapping calendar
         * @type {HTMLElement}
         * @private
         */
        this._$wrapperElement = $(CONSTANTS.WRAPPER_TAG);

        /**
         * Format of date string
         * @type {string}
         * @private
         */
        this._dateForm = option.dateForm;

        /**
         * RegExp instance for format of date string
         * @type {RegExp}
         * @private
         */
        this._regExp = null;

        /**
         * Array saving a order of format
         * @type {Array}
         * @private
         * @see {tui.component.DatePicker.prototype.setDateForm}
         * @example
         * // If the format is a 'mm-dd, yyyy'
         * // `this._formOrder` is ['month', 'date', 'year']
         */
        this._formOrder = [];

        /**
         * Object having date values
         * @type {dateHash}
         * @private
         */
        this._date = null;

        /**
         * This value is prepended automatically when year-format is 'yy'
         * @type {string}
         * @private
         * @example
         * //
         * // If this value is '20', the format is 'yy-mm-dd' and the date string is '15-04-12',
         * // the date value object is
         * //  {
         * //      year: 2015,
         * //      month: 4,
         * //      date: 12
         * //  }
         */
        this._defaultCentury = option.defaultCentury;

        /**
         * Class name for selectable date elements
         * @type {string}
         * @private
         */
        this._selectableClassName = option.selectableClassName;

        /**
         * Class name for selected date element
         * @type {string}
         * @private
         */
        this._selectedClassName = option.selectedClassName;

        /**
         * Whether set date from the input value when the 'Enter' key pressed
         * @type {Boolean}
         * @since 1.3.0
         * @private
         */
        this._enableSetDateByEnterKey = option.enableSetDateByEnterKey;

        /**
         * It is start timestamps from this._ranges
         * @type {Array.<number>}
         * @since 1.2.0
         * @private
         */
        this._startTimes = [];

        /**
         * It is end timestamps from this._ranges
         * @type {Array.<number>}
         * @since 1.2.0
         * @private
         */
        this._endTimes = [];

        /**
         * Selectable date ranges
         * @type {Array.<Array.<dateHash>>}
         * @private
         * @since 1.2.0
         */
        this._ranges = option.selectableRanges;

        /**
         * TimePicker instance
         * @type {TimePicker}
         * @since 1.1.0
         * @private
         */
        this._timePicker = null;

        /**
         * position - left & top & zIndex
         * @type {Object}
         * @private
         * @since 1.1.1
         */
        this._pos = null;

        /**
         * openers - opener list
         * @type {Array}
         * @private
         * @since 1.1.1
         */
        this._openers = [];

        /**
         * Handlers binding context
         * @type {Object}
         * @private
         */
        this._proxyHandlers = {};

        /**
         * Whether the datepicker shows always
         * @api
         * @type {boolean}
         * @since 1.2.0
         * @example
         * datepicker.showAlways = true;
         * datepicker.open();
         * // The datepicker will be not closed if you click the outside of the datepicker
         */
        this.showAlways = option.showAlways;

        /**
         * Whether the datepicker use touch event.
         * @api
         * @type {boolean}
         * @since 1.2.0
         * @example
         * datepicker.useTouchEvent = false;
         * // The datepicker will be use only 'click', 'mousedown' events
         */
        this.useTouchEvent = !!(
            (('createTouch' in document) || ('ontouchstart' in document)) &&
            option.useTouchEvent
        );

        this._initializeDatePicker(option);
    },

    /**
     * Initialize method
     * @param {Object} option - user option
     * @private
     */
    _initializeDatePicker: function(option) {
        this._ranges = this._filterValidRanges(this._ranges);

        this._setSelectableRanges();
        this._setWrapperElement(option.parentElement);
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._setProxyHandlers();
        this._setOpeners(option.openers);
        this._bindKeydownEvent(this._$element);
        this._setTimePicker(option.timePicker);
        this.setDateForm();
        this._$wrapperElement.hide();
    },

    /**
     * Looks through each value in the ranges, returning an array of only valid ranges.
     * @param {Array.<Array.<dateHash>>} ranges - ranges
     * @returns {Array.<Array.<dateHash>>} filtered ranges
     * @private
     */
    _filterValidRanges: function(ranges) {
        return tui.util.filter(ranges, function(range) {
            return (this._isValidDate(range[0]) && this._isValidDate(range[1]));
        }, this);
    },

    /**
     * Set wrapper element(= container)
     * @param {HTMLElement|jQuery} [parentElement] - parent element
     * @private
     */
    _setWrapperElement: function(parentElement) {
        var $wrapperElement = this._$wrapperElement;
        var $parentElement = $(parentElement);

        $wrapperElement.append(this._calendar.$element);

        if ($parentElement[0]) {
            $wrapperElement.appendTo($parentElement);
        } else if (this._$element[0]) {
            $wrapperElement.insertAfter(this._$element);
        } else {
            $wrapperElement.appendTo(document.body);
        }
    },

    /**
     * Set default date
     * @param {{year: number, month: number, date: number}|Date} opDate [option.date] - user setting: date
     * @private
     */
    _setDefaultDate: function(opDate) {
        var isNumber = tui.util.isNumber;

        if (!opDate) {
            this._date = utils.getToday();
        } else {
            this._date = {
                year: isNumber(opDate.year) ? opDate.year : CONSTANTS.MIN_YEAR,
                month: isNumber(opDate.month) ? opDate.month : 1,
                date: isNumber(opDate.date) ? opDate.date : 1
            };
        }
    },

    /**
     * Save default style-position of calendar
     * @param {Object} opPos [option.pos] - user setting: position(left, top, zIndex)
     * @private
     */
    _setDefaultPosition: function(opPos) {
        var pos = this._pos = opPos || {},
            bound = this._getBoundingClientRect();

        pos.left = pos.left || bound.left || 0;
        pos.top = pos.top || bound.bottom || 0;
        pos.zIndex = pos.zIndex || 9999;
    },

    /**
     * Set start/end edge from selectable-ranges
     * @private
     */
    _setSelectableRanges: function() {
        this._startTimes = [];
        this._endTimes = [];

        tui.util.forEach(this._ranges, function(range) {
            this._updateTimeRange({
                start: utils.getTime(range[0]),
                end: utils.getTime(range[1])
            });
        }, this);
    },

    /**
     * Update time range (startTimes, endTimes)
     * @param {{start: number, end: number}} newTimeRange - Time range for update
     * @private
     */
    _updateTimeRange: function(newTimeRange) {
        var index, existingTimeRange, mergedTimeRange;

        index = this._searchStartTime(newTimeRange.start).index;
        existingTimeRange = {
            start: this._startTimes[index],
            end: this._endTimes[index]
        };

        if (this._isOverlappedTimeRange(existingTimeRange, newTimeRange)) {
            mergedTimeRange = this._mergeTimeRanges(existingTimeRange, newTimeRange);
            this._startTimes.splice(index, 1, mergedTimeRange.start);
            this._endTimes.splice(index, 1, mergedTimeRange.end);
        } else {
            this._startTimes.splice(index, 0, newTimeRange.start);
            this._endTimes.splice(index, 0, newTimeRange.end);
        }
    },

    /**
     * Whether the ranges are overlapped
     * @param {{start: number, end: number}} existingTimeRange - Existing time range
     * @param {{start: number, end: number}} newTimeRange - New time range
     * @returns {boolean} Whether the ranges are overlapped
     * @private
     */
    _isOverlappedTimeRange: function(existingTimeRange, newTimeRange) {
        var existingStart = existingTimeRange.start,
            existingEnd = existingTimeRange.end,
            newStart = newTimeRange.start,
            newEnd = newTimeRange.end,
            isTruthy = existingStart && existingEnd && newStart && newEnd,
            isOverlapped = !(
                (newStart < existingStart && newEnd < existingStart) ||
                (newStart > existingEnd && newEnd > existingEnd)
            );

        return isTruthy && isOverlapped;
    },

    /**
     * Merge the overlapped time ranges
     * @param {{start: number, end: number}} existingTimeRange - Existing time range
     * @param {{start: number, end: number}} newTimeRange - New time range
     * @returns {{start: number, end: number}} Merged time range
     * @private
     */
    _mergeTimeRanges: function(existingTimeRange, newTimeRange) {
        return {
            start: Math.min(existingTimeRange.start, newTimeRange.start),
            end: Math.max(existingTimeRange.end, newTimeRange.end)
        };
    },

    /**
     * Search timestamp in startTimes
     * @param {number} timestamp - timestamp
     * @returns {{found: boolean, index: number}} result
     * @private
     */
    _searchStartTime: function(timestamp) {
        return utils.search(this._startTimes, timestamp);
    },

    /**
     * Search timestamp in endTimes
     * @param {number} timestamp - timestamp
     * @returns {{found: boolean, index: number}} result
     */
    _searchEndTime: function(timestamp) {
        return utils.search(this._endTimes, timestamp);
    },

    /**
     * Store opener element list
     * @param {Array} opOpeners [option.openers] - opener element list
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        tui.util.forEach(opOpeners, function(opener) {
            this.addOpener(opener);
        }, this);
    },

    /**
     * Set TimePicker instance
     * @param {tui.component.TimePicker} [opTimePicker] - TimePicker instance
     * @private
     */
    _setTimePicker: function(opTimePicker) {
        if (!opTimePicker) {
            return;
        }

        this._timePicker = opTimePicker;
        this._bindCustomEventWithTimePicker();
    },

    /**
     * Bind custom event with TimePicker
     * @private
     */
    _bindCustomEventWithTimePicker: function() {
        var onChangeTimePicker = tui.util.bind(this.setDate, this);

        this.on('open', function() {
            this._timePicker.setTimeFromInputElement(this._$element);
            this._timePicker.on('change', onChangeTimePicker);
        }, this);
        this.on('close', function() {
            this._timePicker.off('change', onChangeTimePicker);
        }, this);
    },

    /**
     * Check validation of a year
     * @param {number} year - year
     * @returns {boolean} - whether the year is valid or not
     * @private
     */
    _isValidYear: function(year) {
        return tui.util.isNumber(year) && year > CONSTANTS.MIN_YEAR && year < CONSTANTS.MAX_YEAR;
    },

    /**
     * Check validation of a month
     * @param {number} month - month
     * @returns {boolean} - whether the month is valid or not
     * @private
     */
    _isValidMonth: function(month) {
        return tui.util.isNumber(month) && month > 0 && month < 13;
    },

    /**
     * Check validation of values in a date object having year, month, day-in-month
     * @param {dateHash} dateHash - dateHash
     * @returns {boolean} - whether the date object is valid or not
     * @private
     */
    _isValidDate: function(datehash) {
        var year, month, date, isLeapYear, lastDayInMonth, isBetween;

        if (!datehash) {
            return false;
        }

        year = datehash.year;
        month = datehash.month;
        date = datehash.date;
        isLeapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);
        if (!this._isValidYear(year) || !this._isValidMonth(month)) {
            return false;
        }

        lastDayInMonth = CONSTANTS.MONTH_DAYS[month];
        if (isLeapYear && month === 2) {
                lastDayInMonth = 29;
        }
        isBetween = !!(tui.util.isNumber(date) && (date > 0) && (date <= lastDayInMonth));

        return isBetween;
    },

    /**
     * Check an element is an opener.
     * @param {HTMLElement} target element
     * @returns {boolean} - opener true/false
     * @private
     */
    _isOpener: function(target) {
        var result = false;

        tui.util.forEach(this._openers, function(opener) {
            if (target === opener || $.contains(opener, target)) {
                result = true;
                return false;
            }
        });
        return result;
    },

    /**
     * Set style-position of calendar
     * @private
     */
    _arrangeLayer: function() {
        var style = this._$wrapperElement[0].style,
            pos = this._pos;

        style.left = pos.left + 'px';
        style.top = pos.top + 'px';
        style.zIndex = pos.zIndex;
        this._$wrapperElement.append(this._calendar.$element);
        if (this._timePicker) {
            this._$wrapperElement.append(this._timePicker.$timePickerElement);
            this._timePicker.show();
        }
    },

    /**
     * Get boundingClientRect of an element
     * @param {HTMLElement|jQuery} [element] - element
     * @returns {Object} - an object having left, top, bottom, right of element
     * @private
     */
    _getBoundingClientRect: function(element) {
        var el = $(element)[0] || this._$element[0],
            bound,
            ceil;

        if (!el) {
            return {};
        }

        bound = el.getBoundingClientRect();
        ceil = Math.ceil;
        return {
            left: ceil(bound.left),
            top: ceil(bound.top),
            bottom: ceil(bound.bottom),
            right: ceil(bound.right)
        };
    },

    /**
     * Set date from string
     * @param {string} str - date string
     * @private
     */
    _setDateFromString: function(str) {
        var date = this._extractDate(str);

        if (date && this._isSelectable(date)) {
            if (this._timePicker) {
                this._timePicker.setTimeFromInputElement(this._$element);
            }
            this.setDate(date.year, date.month, date.date);
        } else {
            this.setDate();
        }
    },

    /**
     * Return formed date-string from date object
     * @return {string} - formed date-string
     * @private
     */
    _formed: function() {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            form = this._dateForm,
            replaceMap,
            dateString;

        month = month < 10 ? ('0' + month) : month;
        date = date < 10 ? ('0' + date) : date;

        replaceMap = {
            yyyy: year,
            yy: String(year).substr(2, 2),
            mm: month,
            m: Number(month),
            dd: date,
            d: Number(date)
        };

        dateString = form.replace(formatRegExp, function(key) {
            return replaceMap[key.toLowerCase()] || '';
        });

        return dateString;
    },

    /**
     * Extract date-object from input string with comparing date-format<br>
     * If can not extract, return false
     * @param {String} str - input string(text)
     * @returns {dateHash|false} - extracted date object or false
     * @private
     */
    _extractDate: function(str) {
        var formOrder = this._formOrder,
            resultDate = {},
            regExp = this._regExp;

        regExp.lastIndex = 0;
        if (regExp.test(str)) {
            resultDate[formOrder[0]] = Number(RegExp.$1);
            resultDate[formOrder[1]] = Number(RegExp.$2);
            resultDate[formOrder[2]] = Number(RegExp.$3);
        } else {
            return false;
        }

        if (String(resultDate.year).length === 2) {
            resultDate.year = Number(this._defaultCentury + resultDate.year);
        }

        return resultDate;
    },

    /**
     * Whether a dateHash is selectable
     * @param {dateHash} dateHash - dateHash
     * @returns {boolean} - Whether a dateHash is selectable
     * @private
     */
    _isSelectable: function(dateHash) {
        var inRange = true,
            startTimes, startTime, result, timestamp;

        if (!this._isValidDate(dateHash)) {
            return false;
        }

        startTimes = this._startTimes;
        timestamp = utils.getTime(dateHash);

        if (startTimes.length) {
            result = this._searchEndTime(timestamp);
            startTime = startTimes[result.index];
            inRange = result.found || (timestamp >= startTime);
        }

        return inRange;
    },

    /**
     * Set selectable-class-name to selectable date element.
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectableClassName: function(element, dateHash) {
        if (this._isSelectable(dateHash)) {
            $(element).addClass(this._selectableClassName);
        }
    },

    /**
     * Set selected-class-name to selected date element
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectedClassName: function(element, dateHash) {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            isSelected = (year === dateHash.year) && (month === dateHash.month) && (date === dateHash.date);

        if (isSelected) {
            $(element).addClass(this._selectedClassName);
        }
    },

    /**
     * Set value a date-string of current this instance to input element
     * @private
     */
    _setValueToInputElement: function() {
        var dateString = this._formed(),
            timeString = '';

        if (this._timePicker) {
            timeString = this._timePicker.getTime();
        }
        this._$element.val(dateString + timeString);
    },

    /**
     * Set(or make) RegExp instance from the date-format of this instance.
     * @private
     */
    _setRegExp: function() {
        var regExpStr = '^',
            index = 0,
            formOrder = this._formOrder;

        this._dateForm.replace(formatRegExp, function(str) {
            var key = str.toLowerCase();

            regExpStr += (mapForConverting[key].expression + '[\\D\\s]*');
            formOrder[index] = mapForConverting[key].type;
            index += 1;
        });
        this._regExp = new RegExp(regExpStr, 'gi');
    },

    /**
     * Set event handlers to bind context and then store.
     * @private
     */
    _setProxyHandlers: function() {
        var proxies = this._proxyHandlers,
            bind = tui.util.bind;

        // Event handlers for element
        proxies.onMousedownDocument = bind(this._onMousedownDocument, this);
        proxies.onKeydownElement = bind(this._onKeydownElement, this);
        proxies.onClickCalendar = bind(this._onClickCalendar, this);
        proxies.onClickOpener = bind(this._onClickOpener, this);

        // Event handlers for custom event of calendar
        proxies.onBeforeDrawCalendar = bind(this._onBeforeDrawCalendar, this);
        proxies.onDrawCalendar = bind(this._onDrawCalendar, this);
        proxies.onAfterDrawCalendar = bind(this._onAfterDrawCalendar, this);
    },

    /**
     * Event handler for mousedown of document<br>
     * - When click the out of layer, close the layer
     * @param {Event} event - event object
     * @private
     */
    _onMousedownDocument: function(event) {
        var isContains = $.contains(this._$wrapperElement[0], event.target);

        if ((!isContains && !this._isOpener(event.target))) {
            this.close();
        }
    },

    /**
     * Event handler for enter-key down of input element
     * @param {Event} [event] - event object
     * @private
     */
    _onKeydownElement: function(event) {
        if (!event || event.keyCode !== 13) {
            return;
        }
        this._setDateFromString(this._$element.val());
    },

    /**
     * Event handler for click of calendar<br>
     * - Update date form event-target
     * @param {Event} event - event object
     * @private
     */
    _onClickCalendar: function(event) {
        var target = event.target,
            className = target.className,
            value = Number((target.innerText || target.textContent || target.nodeValue)),
            shownDate,
            relativeMonth,
            date;

        if (value && !isNaN(value)) {
            if (className.indexOf('prev-month') > -1) {
                relativeMonth = -1;
            } else if (className.indexOf('next-month') > -1) {
                relativeMonth = 1;
            } else {
                relativeMonth = 0;
            }

            shownDate = this._calendar.getDate();
            shownDate.date = value;
            date = utils.getRelativeDate(0, relativeMonth, 0, shownDate);
            this.setDate(date.year, date.month, date.date);
        }
    },

    /**
     * Event handler for click of opener-element
     * @private
     */
    _onClickOpener: function() {
        this.open();
    },

    /**
     * Event handler for 'beforeDraw'-custom event of calendar
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onBeforeDrawCalendar: function() {
        this._unbindOnClickCalendar();
    },

    /**
     * Event handler for 'draw'-custom event of calendar
     * @param {Object} eventData - custom event data
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onDrawCalendar: function(eventData) {
        var dateHash = {
            year: eventData.year,
            month: eventData.month,
            date: eventData.date
        };
        this._setSelectableClassName(eventData.$dateContainer, dateHash);
        this._setSelectedClassName(eventData.$dateContainer, dateHash);
    },

    /**
     * Event handler for 'afterDraw'-custom event of calendar
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onAfterDrawCalendar: function() {
        this._showOnlyValidButtons();
        this._bindOnClickCalendar();
    },

    /**
     * Show only valid buttons in calendar
     * @private
     */
    _showOnlyValidButtons: function() {
        var $header = this._calendar.$header,
            $prevYearBtn = $header.find('[class*="btn-prev-year"]').hide(),
            $prevMonthBtn = $header.find('[class*="btn-prev-month"]').hide(),
            $nextYearBtn = $header.find('[class*="btn-next-year"]').hide(),
            $nextMonthBtn = $header.find('[class*="btn-next-month"]').hide(),
            shownDateHash = this._calendar.getDate(),
            shownDate = new Date(shownDateHash.year, shownDateHash.month - 1),
            startDate = new Date(this._startTimes[0] || CONSTANTS.MIN_EDGE).setDate(1),
            endDate = new Date(this._endTimes.slice(-1)[0] || CONSTANTS.MAX_EDGE).setDate(1),// arr.slice(-1)[0] === arr[arr.length - 1]
            startDifference = shownDate - startDate,
            endDifference = endDate - shownDate;

        if (startDifference > 0) {
            $prevMonthBtn.show();
            if (startDifference >= CONSTANTS.YEAR_TO_MS) {
                $prevYearBtn.show();
            }
        }

        if (endDifference > 0) {
            $nextMonthBtn.show();
            if (endDifference >= CONSTANTS.YEAR_TO_MS) {
                $nextYearBtn.show();
            }
        }
    },

    /**
     * Bind keydown event handler to the target element
     * @param {jQuery} $targetEl - target element
     * @private
     */
    _bindKeydownEvent: function($targetEl) {
        if (this._enableSetDateByEnterKey) {
            $targetEl.on('keydown', this._proxyHandlers.onKeydownElement);
        }
    },

    /**
     * Unbind keydown event handler from the target element
     * @param {jQuery} $targetEl - target element
     * @private
     */
    _unbindKeydownEvent: function($targetEl) {
        if (this._enableSetDateByEnterKey) {
            $targetEl.off('keydown', this._proxyHandlers.onKeydownElement);
        }
    },

    /**
     * Bind a (mousedown|touchstart) event of document
     * @private
     */
    _bindOnMousedownDocument: function() {
        var eventType = (this.useTouchEvent) ? 'touchstart' : 'mousedown';
        $(document).on(eventType, this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Unbind mousedown,touchstart events of document
     * @private
     */
    _unbindOnMousedownDocument: function() {
        $(document).off('mousedown touchstart', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Bind click event of calendar
     * @private
     */
    _bindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar,
            eventType = (this.useTouchEvent) ? 'touchend' : 'click';
        this._$wrapperElement.find('.' + this._selectableClassName).on(eventType, handler);
    },

    /**
     * Unbind click event of calendar
     * @private
     */
    _unbindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).off('click touchend', handler);
    },

    /**
     * Bind custom event of calendar
     * @private
     */
    _bindCalendarCustomEvent: function() {
        var proxyHandlers = this._proxyHandlers,
            onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
            onDraw = proxyHandlers.onDrawCalendar,
            onAfterDraw = proxyHandlers.onAfterDrawCalendar;

        this._calendar.on({
            'beforeDraw': onBeforeDraw,
            'draw': onDraw,
            'afterDraw': onAfterDraw
        });
    },

   /**
    * Unbind custom event of calendar
    * @private
    */
    _unbindCalendarCustomEvent: function() {
       var proxyHandlers = this._proxyHandlers,
           onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
           onDraw = proxyHandlers.onDrawCalendar,
           onAfterDraw = proxyHandlers.onAfterDrawCalendar;

       this._calendar.off({
           'beforeDraw': onBeforeDraw,
           'draw': onDraw,
           'afterDraw': onAfterDraw
       });
    },

    /**
     * Add a range
     * @api
     * @param {dateHash} startHash - Start dateHash
     * @param {dateHash} endHash - End dateHash
     * @since 1.2.0
     * @example
     * var start = {year: 2015, month: 2, date: 3},
     *     end = {year: 2015, month: 3, date: 6};
     *
     * datepicker.addRange(start, end);
     */
    addRange: function(startHash, endHash) {
        if (this._isValidDate(startHash) && this._isValidDate(endHash)) {
            this._ranges.push([startHash, endHash]);
            this._setSelectableRanges();
            this._calendar.draw();
        }
    },

    /**
     * Remove a range
     * @api
     * @param {dateHash} startHash - Start dateHash
     * @param {dateHash} endHash - End dateHash
     * @since 1.2.0
     * @example
     * var start = {year: 2015, month: 2, date: 3},
     *     end = {year: 2015, month: 3, date: 6};
     *
     * datepicker.addRange(start, end);
     * datepicker.removeRange(start, end);
     */
    removeRange: function(startHash, endHash) {
        var ranges = this._ranges,
            target = [startHash, endHash];

        tui.util.forEach(ranges, function(range, index) {
            if (tui.util.compareJSON(target, range)) {
                ranges.splice(index, 1);
                return false;
            }
        });
        this._setSelectableRanges();
        this._calendar.draw();
    },

    /**
     * Set selectable ranges
     * @api
     * @param {Array.<Array.<dateHash>>} ranges - The same with the selectableRanges option values
     * @since 1.3.0
     */
    setRanges: function(ranges) {
        this._ranges = this._filterValidRanges(ranges);
        this._setSelectableRanges();
    },

    /**
     * Set position-left, top of calendar
     * @api
     * @param {number} x - position-left
     * @param {number} y - position-top
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos,
            isNumber = tui.util.isNumber;

        pos.left = isNumber(x) ? x : pos.left;
        pos.top = isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * Set z-index of calendar
     * @api
     * @param {number} zIndex - z-index value
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!tui.util.isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
     * @api
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    addOpener: function(opener) {
        var eventType = (this.useTouchEvent) ? 'touchend' : 'click',
            $opener = $(opener);

        opener = $opener[0];
        if (opener && inArray(opener, this._openers) < 0) {
            this._openers.push(opener);
            $opener.on(eventType, this._proxyHandlers.onClickOpener);
        }
    },

    /**
     * remove opener
     * @api
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    removeOpener: function(opener) {
        var $opener = $(opener),
            index = inArray($opener[0], this._openers);

        if (index > -1) {
            $opener.off('click touchend', this._proxyHandlers.onClickOpener);
            this._openers.splice(index, 1);
        }
    },

    /**
     * Open calendar with arranging position
     * @api
     * @example
     * datepicker.open();
     */
    open: function() {
        if (this.isOpened()) {
            return;
        }

        this._arrangeLayer();
        this._bindCalendarCustomEvent();
        this._calendar.draw(this._date.year, this._date.month, false);
        this._$wrapperElement.show();
        if (!this.showAlways) {
            this._bindOnMousedownDocument();
        }

        /**
         * @api
         * @event DatePicker#open
         * @example
         * datePicker.on('open', function() {
         *     alert('open');
         * });
         */
        this.fire('open');
    },

    /**
     * Close calendar with unbinding some events
     * @api
     * @exmaple
     * datepicker.close();
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._unbindCalendarCustomEvent();
        this._unbindOnMousedownDocument();
        this._$wrapperElement.hide();

        /**
         * Close event - DatePicker
         * @api
         * @event DatePicker#close
         * @example
         * datePicker.on('close', function() {
         *     alert('close');
         * });
         */
        this.fire('close');
    },

    /**
     * Get date-object of current DatePicker instance.
     * @api
     * @returns {dateHash} - dateHash having year, month and day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDateHash(); // {year: 2015, month: 4, date: 13}
     */
    getDateHash: function() {
        return tui.util.extend({}, this._date);
    },

    /**
     * Return year
     * @api
     * @returns {number} - year
     * @example
     * // 2015-04-13
     * datepicker.getYear(); // 2015
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * Return month
     * @api
     * @returns {number} - month
     * @example
     * // 2015-04-13
     * datepicker.getMonth(); // 4
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * Return day-in-month
     * @api
     * @returns {number} - day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDayInMonth(); // 13
     */
    getDayInMonth: function() {
        return this._date.date;
    },

    /**
     * Set date from values(year, month, date) and then fire 'update' custom event
     * @api
     * @param {string|number} [year] - year
     * @param {string|number} [month] - month
     * @param {string|number} [date] - day in month
     * @example
     * datepicker.setDate(2014, 12, 3); // 2014-12- 03
     * datepicker.setDate(null, 11, 23); // 2014-11-23
     * datepicker.setDate('2015', '5', 3); // 2015-05-03
     */
    setDate: function(year, month, date) {
        var dateObj = this._date,
            newDateObj = {};

        newDateObj.year = year || dateObj.year;
        newDateObj.month = month || dateObj.month;
        newDateObj.date = date || dateObj.date;

        if (this._isSelectable(newDateObj)) {
            tui.util.extend(dateObj, newDateObj);
        }
        this._setValueToInputElement();
        this._calendar.draw(dateObj.year, dateObj.month, false);

        /**
         * Update event
         * @api
         * @event DatePicker#update
         */
        this.fire('update');
    },

    /**
     * Set or update date-form
     * @api
     * @param {String} [form] - date-format
     * @example
     * datepicker.setDateForm('yyyy-mm-dd');
     * datepicker.setDateForm('mm-dd, yyyy');
     * datepicker.setDateForm('y/m/d');
     * datepicker.setDateForm('yy/mm/dd');
     */
    setDateForm: function(form) {
        this._dateForm = form || this._dateForm;
        this._setRegExp();
        this.setDate();
    },

    /**
     * Return whether the calendar is opened or not
     * @api
     * @returns {boolean} - true if opened, false otherwise
     * @example
     * datepicker.close();
     * datepicker.isOpened(); // false
     *
     * datepicker.open();
     * datepicker.isOpened(); // true
     */
    isOpened: function() {
        return (this._$wrapperElement.css('display') === 'block');
    },

    /**
     * Return TimePicker instance
     * @api
     * @returns {TimePicker} - TimePicker instance
     * @example
     * var timepicker = this.getTimepicker();
     */
    getTimePicker: function() {
        return this._timePicker;
    },

    /**
     * Set input element of this instance
     * @api
     * @param {HTMLElement|jQuery} element - input element
     * @since 1.3.0
     */
    setElement: function(element) {
        var $currentEl = this._$element;
        var $newEl = $(element);

        if ($currentEl[0]) {
            this.removeOpener($currentEl);
            this._unbindKeydownEvent($currentEl);
        }

        this.addOpener($newEl);
        this._bindKeydownEvent($newEl);
        this._setDateFromString($newEl.val());
        this._$element = $newEl;
    }
});

tui.util.CustomEvents.mixin(DatePicker);

module.exports = DatePicker;

},{"./utils":5}],3:[function(require,module,exports){
/**
 * Created by nhnent on 15. 4. 28..
 * @fileoverview Spinbox Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2
 */

'use strict';

var util = tui.util,
    inArray = util.inArray;

/**
 * @constructor
 *
 * @param {String|HTMLElement} container - container of spinbox
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultValue = 0] - initial setting value
 * @param {number} [option.step = 1] - if step = 2, value : 0 -> 2 -> 4 -> ...
 * @param {number} [option.max = 9007199254740991] - max value
 * @param {number} [option.min = -9007199254740991] - min value
 * @param {string} [option.upBtnTag = button HTML] - up button html string
 * @param {string} [option.downBtnTag = button HTML] - down button html string
 * @param {Array}  [option.exclusion = []] - value to be excluded. if this is [1,3], 0 -> 2 -> 4 -> 5 ->....
 */
var Spinbox = util.defineClass(/** @lends Spinbox.prototype */ {
    init: function(container, option) {
        /**
         * @type {jQuery}
         * @private
         */
        this._$containerElement = $(container);

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = this._$containerElement.find('input[type="text"]');

        /**
         * @type {number}
         * @private
         */
        this._value = null;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$upButton = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$downButton = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option - Option for Initialization
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._assignHTMLElements();
        this._assignDefaultEvents();
        this.setValue(this._option.defaultValue);
    },

    /**
     * Set a option to instance
     * @param {Object} option - Option that you want
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultValue: 0,
            step: 1,
            max: Number.MAX_SAFE_INTEGER || 9007199254740991,
            min: Number.MIN_SAFE_INTEGER || -9007199254740991,
            upBtnTag: '<button type="button"><b>+</b></button>',
            downBtnTag: '<button type="button"><b>-</b></button>'
        };
        util.extend(this._option, option);

        if (!util.isArray(this._option.exclusion)) {
            this._option.exclusion = [];
        }

        if (!this._isValidOption()) {
            throw new Error('Spinbox option is invaild');
        }
    },

    /**
     * is a valid option?
     * @returns {boolean} result
     * @private
     */
    _isValidOption: function() {
        var opt = this._option;

        return (this._isValidValue(opt.defaultValue) && this._isValidStep(opt.step));
    },

    /**
     * is a valid value?
     * @param {number} value for spinbox
     * @returns {boolean} result
     * @private
     */
    _isValidValue: function(value) {
        var opt,
            isBetween,
            isNotInArray;

        if (!util.isNumber(value)) {
            return false;
        }

        opt = this._option;
        isBetween = value <= opt.max && value >= opt.min;
        isNotInArray = (inArray(value, opt.exclusion) === -1);

        return (isBetween && isNotInArray);
    },

    /**
     * is a valid step?
     * @param {number} step for spinbox up/down
     * @returns {boolean} result
     * @private
     */
    _isValidStep: function(step) {
        var maxStep = (this._option.max - this._option.min);

        return (util.isNumber(step) && step < maxStep);
    },

    /**
     * Assign elements to inside of container.
     * @private
     */
    _assignHTMLElements: function() {
        this._setInputSizeAndMaxLength();
        this._makeButton();
    },

    /**
     * Make up/down button
     * @private
     */
    _makeButton: function() {
        var $input = this._$inputElement,
            $upBtn = this._$upButton = $(this._option.upBtnTag),
            $downBtn = this._$downButton = $(this._option.downBtnTag);

        $upBtn.insertBefore($input);
        $upBtn.wrap('<div></div>');
        $downBtn.insertAfter($input);
        $downBtn.wrap('<div></div>');
    },

    /**
     * Set size/maxlength attributes of input element.
     * Default value is a digits of a longer value of option.min or option.max
     * @private
     */
    _setInputSizeAndMaxLength: function() {
        var $input = this._$inputElement,
            minValueLength = String(this._option.min).length,
            maxValueLength = String(this._option.max).length,
            maxlength = Math.max(minValueLength, maxValueLength);

        if (!$input.attr('size')) {
            $input.attr('size', maxlength);
        }
        if (!$input.attr('maxlength')) {
            $input.attr('maxlength', maxlength);
        }
    },

    /**
     * Assign default events to up/down button
     * @private
     */
    _assignDefaultEvents: function() {
        var onClick = util.bind(this._onClickButton, this),
            onKeyDown = util.bind(this._onKeyDownInputElement, this);

        this._$upButton.on('click', {isDown: false}, onClick);
        this._$downButton.on('click', {isDown: true}, onClick);
        this._$inputElement.on('keydown', onKeyDown);
        this._$inputElement.on('change', util.bind(this._onChangeInput, this));
    },

    /**
     * Set input value when user click a button.
     * @param {boolean} isDown - If a user clicked a down-buttton, this value is true.  Else if a user clicked a up-button, this value is false.
     * @private
     */
    _setNextValue: function(isDown) {
        var opt = this._option,
            step = opt.step,
            min = opt.min,
            max = opt.max,
            exclusion = opt.exclusion,
            nextValue = this.getValue();

        if (isDown) {
            step = -step;
        }

        do {
            nextValue += step;
            if (nextValue > max) {
                nextValue = min;
            } else if (nextValue < min) {
                nextValue = max;
            }
        } while (inArray(nextValue, exclusion) > -1);

        this.setValue(nextValue);
    },

    /**
     * DOM(Up/Down button) Click Event handler
     * @param {Event} event event-object
     * @private
     */
    _onClickButton: function(event) {
        this._setNextValue(event.data.isDown);
    },

    /**
     * DOM(Input element) Keydown Event handler
     * @param {Event} event event-object
     * @private
     */
    _onKeyDownInputElement: function(event) {
        var keyCode = event.which || event.keyCode,
            isDown;
        switch (keyCode) {
            case 38: isDown = false; break;
            case 40: isDown = true; break;
            default: return;
        }

        this._setNextValue(isDown);
    },

    /**
     * DOM(Input element) Change Event handler
     * @private
     */
    _onChangeInput: function() {
        var newValue = Number(this._$inputElement.val()),
            isChange = this._isValidValue(newValue) && this._value !== newValue,
            nextValue = (isChange) ? newValue : this._value;

        this._value = nextValue;
        this._$inputElement.val(nextValue);
    },

    /**
     * set step of spinbox
     * @param {number} step for spinbox
     */
    setStep: function(step) {
        if (!this._isValidStep(step)) {
            return;
        }
        this._option.step = step;
    },

    /**
     * get step of spinbox
     * @returns {number} step
     */
    getStep: function() {
        return this._option.step;
    },

    /**
     * Return a input value.
     * @returns {number} Data in input-box
     */
    getValue: function() {
        return this._value;
    },

    /**
     * Set a value to input-box.
     * @param {number} value - Value that you want
     */
    setValue: function(value) {
        this._$inputElement.val(value).change();
    },

    /**
     * Return a option of instance.
     * @returns {Object} Option of instance
     */
    getOption: function() {
        return this._option;
    },

    /**
     * Add value that will be excluded.
     * @param {number} value - Value that will be excluded.
     */
    addExclusion: function(value) {
        var exclusion = this._option.exclusion;

        if (inArray(value, exclusion) > -1) {
            return;
        }
        exclusion.push(value);
    },

    /**
     * Remove a value which was excluded.
     * @param {number} value - Value that will be removed from a exclusion list of instance
     */
    removeExclusion: function(value) {
        var exclusion = this._option.exclusion,
            index = inArray(value, exclusion);

        if (index === -1) {
            return;
        }
        exclusion.splice(index, 1);
    },

    /**
     * get container element
     * @return {HTMLElement} element
     */
    getContainerElement: function() {
        return this._$containerElement[0];
    }
});

module.exports = Spinbox;

},{}],4:[function(require,module,exports){
/**
 * @fileoverview TimePicker Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
 */

'use strict';

var util = tui.util,
    Spinbox = require('./spinbox'),
    timeRegExp = /\s*(\d{1,2})\s*:\s*(\d{1,2})\s*([ap][m])?(?:[\s\S]*)/i,
    timePickerTag = '<table class="timepicker"><tr class="timepicker-row"></tr></table>',
    columnTag = '<td class="timepicker-column"></td>',
    spinBoxTag = '<td class="timepicker-column timepicker-spinbox"><div><input type="text" class="timepicker-spinbox-input"></div></td>',
    upBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-up"><b>+</b></button>',
    downBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-down"><b>-</b></button>';

/**
 * @constructor
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultHour = 0] - initial setting value of hour
 * @param {number} [option.defaultMinute = 0] - initial setting value of minute
 * @param {HTMLElement} [option.inputElement = null] - optional input element with timepicker
 * @param {number} [option.hourStep = 1] - step of hour spinbox. if step = 2, hour value 1 -> 3 -> 5 -> ...
 * @param {number} [option.minuteStep = 1] - step of minute spinbox. if step = 2, minute value 1 -> 3 -> 5 -> ...
 * @param {Array} [option.hourExclusion = null] - hour value to be excluded. if hour [1,3] is excluded, hour value 0 -> 2 -> 4 -> 5 -> ...
 * @param {Array} [option.minuteExclusion = null] - minute value to be excluded. if minute [1,3] is excluded, minute value 0 -> 2 -> 4 -> 5 -> ...
 * @param {boolean} [option.showMeridian = false] - is time expression-"hh:mm AM/PM"?
 * @param {Object} [option.position = {}] - left, top position of timepicker element
 */
var TimePicker = util.defineClass(/** @lends TimePicker.prototype */ {
    init: function(option) {
        /**
         * @type {jQuery}
         */
        this.$timePickerElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$meridianElement = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._hourSpinbox = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._minuteSpinbox = null;

        /**
         * time picker element show up?
         * @type {boolean}
         * @private
         */
        this._isShown = false;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {number}
         * @private
         */
        this._hour = null;

        /**
         * @type {number}
         * @private
         */
        this._minute = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option for time picker
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._makeSpinboxes();
        this._makeTimePickerElement();
        this._assignDefaultEvents();
        this.fromSpinboxes();
    },

    /**
     * Set option
     * @param {Object} option for time picker
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultHour: 0,
            defaultMinute: 0,
            inputElement: null,
            hourStep: 1,
            minuteStep: 1,
            hourExclusion: null,
            minuteExclusion: null,
            showMeridian: false,
            position: {}
        };

        util.extend(this._option, option);
    },

    /**
     * make spinboxes (hour & minute)
     * @private
     */
    _makeSpinboxes: function() {
        var opt = this._option;

        this._hourSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultHour,
            min: 0,
            max: 23,
            step: opt.hourStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.hourExclusion
        });

        this._minuteSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultMinute,
            min: 0,
            max: 59,
            step: opt.minuteStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.minuteExclusion
        });
    },

    /**
     * make timepicker container
     * @private
     */
    _makeTimePickerElement: function() {
        var opt = this._option,
            $tp = $(timePickerTag),
            $tpRow = $tp.find('.timepicker-row'),
            $meridian,
            $colon = $(columnTag)
                .addClass('colon')
                .append(':');


        $tpRow.append(this._hourSpinbox.getContainerElement(), $colon, this._minuteSpinbox.getContainerElement());

        if (opt.showMeridian) {
            $meridian = $(columnTag)
                .addClass('meridian')
                .append(this._isPM ? 'PM' : 'AM');
            this._$meridianElement = $meridian;
            $tpRow.append($meridian);
        }

        $tp.hide();
        $('body').append($tp);
        this.$timePickerElement = $tp;

        if (opt.inputElement) {
            $tp.css('position', 'absolute');
            this._$inputElement = $(opt.inputElement);
            this._setDefaultPosition(this._$inputElement);
        }
    },

    /**
     * set position of timepicker container
     * @param {jQuery} $input jquery-object (element)
     * @private
     */
    _setDefaultPosition: function($input) {
        var inputEl = $input[0],
            position = this._option.position,
            x = position.x,
            y = position.y;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            x = inputEl.offsetLeft;
            y = inputEl.offsetTop + inputEl.offsetHeight + 3;
        }
        this.setXYPosition(x, y);
    },

    /**
     * assign default events
     * @private
     */
    _assignDefaultEvents: function() {
        var $input = this._$inputElement;

        if ($input) {
            this._assignEventsToInputElement();
            this.on('change', function() {
                $input.val(this.getTime());
            }, this);
        }
        this.$timePickerElement.on('change', util.bind(this._onChangeTimePicker, this));
    },

    /**
     * attach event to Input element
     * @private
     */
    _assignEventsToInputElement: function() {
        var self = this,
            $input = this._$inputElement;

        $input.on('click', function(event) {
            self.open(event);
        });

        $input.on('change', function() {
            if (!self.setTimeFromInputElement()) {
                $input.val(self.getTime());
            }
        });
    },

    /**
     * dom event handler (timepicker)
     * @private
     */
    _onChangeTimePicker: function() {
        this.fromSpinboxes();
    },

    /**
     * is clicked inside of container?
     * @param {Event} event event-object
     * @returns {boolean} result
     * @private
     */
    _isClickedInside: function(event) {
        var isContains = $.contains(this.$timePickerElement[0], event.target),
            isInputElement = (this._$inputElement && this._$inputElement[0] === event.target);

        return isContains || isInputElement;
    },

    /**
     * transform time into formatted string
     * @returns {string} time string
     * @private
     */
    _formToTimeFormat: function() {
        var hour = this._hour,
            minute = this._minute,
            postfix = this._getPostfix(),
            formattedHour,
            formattedMinute;

        if (this._option.showMeridian) {
            hour %= 12;
        }

        formattedHour = (hour < 10) ? '0' + hour : hour;
        formattedMinute = (minute < 10) ? '0' + minute : minute;
        return formattedHour + ':' + formattedMinute + postfix;
    },

    /**
     * set the boolean value 'isPM' when AM/PM option is true.
     * @private
     */
    _setIsPM: function() {
        this._isPM = (this._hour > 11);
    },

    /**
     * get postfix when AM/PM option is true.
     * @returns {string} postfix (AM/PM)
     * @private
     */
    _getPostfix: function() {
        var postfix = '';

        if (this._option.showMeridian) {
            postfix = (this._isPM) ? ' PM' : ' AM';
        }
        return postfix;
    },

    /**
     * set position of container
     * @param {number} x - it will be offsetLeft of element
     * @param {number} y - it will be offsetTop of element
     */
    setXYPosition: function(x, y) {
        var position;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            return;
        }

        position = this._option.position;
        position.x = x;
        position.y = y;
        this.$timePickerElement.css({left: x, top: y});
    },

    /**
     * show time picker element
     */
    show: function() {
        this.$timePickerElement.show();
        this._isShown = true;
    },

    /**
     * hide time picker element
     */
    hide: function() {
        this.$timePickerElement.hide();
        this._isShown = false;
    },

    /**
     * listener to show container
     * @param {Event} event event-object
     */
    open: function(event) {
        if (this._isShown) {
            return;
        }

        $(document).on('click', util.bind(this.close, this));
        this.show();

        /**
         * Open event - TimePicker
         * @event TimePicker#open
         * @param {(jQuery.Event|undefined)} - Click the input element
         */
        this.fire('open', event);
    },

    /**
     * listener to hide container
     * @param {Event} event event-object
     */
    close: function(event) {
        if (!this._isShown || this._isClickedInside(event)) {
            return;
        }

        $(document).off(event);
        this.hide();

        /**
         * Hide event - Timepicker
         * @event TimePicker#close
         * @param {(jQuery.Event|undefined)} - Click the document (not TimePicker)
         */
        this.fire('close', event);
    },

    /**
     * set values in spinboxes from time
     */
    toSpinboxes: function() {
        var hour = this._hour,
            minute = this._minute;

        this._hourSpinbox.setValue(hour);
        this._minuteSpinbox.setValue(minute);
    },

    /**
     * set time from spinboxes values
     */
    fromSpinboxes: function() {
        var hour = this._hourSpinbox.getValue(),
            minute = this._minuteSpinbox.getValue();

        this.setTime(hour, minute);
    },

    /**
     * set time from input element.
     * @param {HTMLElement|jQuery} [inputElement] jquery object (element)
     * @return {boolean} result of set time
     */
    setTimeFromInputElement: function(inputElement) {
        var input = $(inputElement)[0] || this._$inputElement[0];
        return !!(input && this.setTimeFromString(input.value));
    },

    /**
     * set hour
     * @param {number} hour for time picker
     * @return {boolean} result of set time
     */
    setHour: function(hour) {
        return this.setTime(hour, this._minute);
    },

    /**
     * set minute
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setMinute: function(minute) {
        return this.setTime(this._hour, minute);
    },

    /**
     * set time
     * @api
     * @param {number} hour for time picker
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setTime: function(hour, minute) {
        var isNumber = (util.isNumber(hour) && util.isNumber(minute)),
            isChange = (this._hour !== hour || this._minute !== minute),
            isValid = (hour < 24 && minute < 60);

        if (!isNumber || !isChange || !isValid) {
            return false;
        }

        this._hour = hour;
        this._minute = minute;
        this._setIsPM();
        this.toSpinboxes();
        if (this._$meridianElement) {
            this._$meridianElement.html(this._getPostfix());
        }

        /**
         * Change event - TimePicker
         * @event TimePicker#change
         */
        this.fire('change');
        return true;
    },

    /**
     * set time from time-string
     * @param {string} timeString time-string
     * @return {boolean} result of set time
     */
    setTimeFromString: function(timeString) {
        var hour,
            minute,
            postfix,
            isPM;

        if (timeRegExp.test(timeString)) {
            hour = Number(RegExp.$1);
            minute = Number(RegExp.$2);
            postfix = RegExp.$3.toUpperCase();

            if (hour < 24 && this._option.showMeridian) {
                if (postfix === 'PM') {
                    isPM = true;
                } else if (postfix === 'AM') {
                    isPM = false;
                } else {
                    isPM = this._isPM;
                }

                if (isPM) {
                    hour += 12;
                }
            }
        }
        return this.setTime(hour, minute);
    },

    /**
     * set step of hour
     * @param {number} step for time picker
     */
    setHourStep: function(step) {
        this._hourSpinbox.setStep(step);
        this._option.hourStep = this._hourSpinbox.getStep();
    },

    /**
     * set step of minute
     * @param {number} step for time picker
     */
    setMinuteStep: function(step) {
        this._minuteSpinbox.setStep(step);
        this._option.minuteStep = this._minuteSpinbox.getStep();
    },

    /**
     * add a specific hour to exclude
     * @param {number} hour for exclusion
     */
    addHourExclusion: function(hour) {
        this._hourSpinbox.addExclusion(hour);
    },

    /**
     * add a specific minute to exclude
     * @param {number} minute for exclusion
     */
    addMinuteExclusion: function(minute) {
        this._minuteSpinbox.addExclusion(minute);
    },

    /**
     * get step of hour
     * @returns {number} hour up/down step
     */
    getHourStep: function() {
        return this._option.hourStep;
    },

    /**
     * get step of minute
     * @returns {number} minute up/down step
     */
    getMinuteStep: function() {
        return this._option.minuteStep;
    },

    /**
     * remove hour from exclusion list
     * @param {number} hour that you want to remove
     */
    removeHourExclusion: function(hour) {
        this._hourSpinbox.removeExclusion(hour);
    },

    /**
     * remove minute from exclusion list
     * @param {number} minute that you want to remove
     */
    removeMinuteExclusion: function(minute) {
        this._minuteSpinbox.removeExclusion(minute);
    },

    /**
     * get hour
     * @returns {number} hour
     */
    getHour: function() {
        return this._hour;
    },

    /**
     * get minute
     * @returns {number} minute
     */
    getMinute: function() {
        return this._minute;
    },

    /**
     * get time
     * @api
     * @returns {string} 'hh:mm (AM/PM)'
     */
    getTime: function() {
        return this._formToTimeFormat();
    }
});
tui.util.CustomEvents.mixin(TimePicker);

module.exports = TimePicker;


},{"./spinbox":3}],5:[function(require,module,exports){
/**
 * @fileoverview Utils for calendar component
 * @author NHN Net. FE dev team. <dl_javascript@nhnent.com>
 * @dependency ne-code-snippet ~1.0.2
 */

'use strict';

/**
 * Utils of calendar
 * @namespace utils
 */
var utils = {
    /**
     * Return date hash by parameter.
     *  if there are 3 parameter, the parameter is corgnized Date object
     *  if there are no parameter, return today's hash date
     * @function getDateHashTable
     * @memberof utils
     * @param {Date|number} [year] A date instance or year
     * @param {number} [month] A month
     * @param {number} [date] A date
     * @returns {{year: *, month: *, date: *}} 
     */
    getDateHashTable: function(year, month, date) {
        var nDate;

        if (arguments.length < 3) {
            nDate = arguments[0] || new Date();

            year = nDate.getFullYear();
            month = nDate.getMonth() + 1;
            date = nDate.getDate();
        }

        return {
            year: year,
            month: month,
            date: date
        };
    },

    /**
     * Return today that saved on component or create new date.
     * @function getToday
     * @returns {{year: *, month: *, date: *}}
     * @memberof utils
     */
    getToday: function() {
       return utils.getDateHashTable();
    },

    /**
     * Get weeks count by paramenter
     * @function getWeeks
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} 주 (4~6)
     * @memberof utils
     **/
    getWeeks: function(year, month) {
        var firstDay = utils.getFirstDay(year, month),
            lastDate = utils.getLastDate(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },

    /**
     * Get unix time from date hash
     * @function getTime
     * @param {Object} date A date hash
     * @param {number} date.year A year
     * @param {number} date.month A month
     * @param {number} date.date A date
     * @return {number} 
     * @memberof utils
     * @example
     * utils.getTime({year:2010, month:5, date:12}); // 1273590000000
     **/
    getTime: function(date) {
        return utils.getDateObject(date).getTime();
    },

    /**
     * Get which day is first by parameters that include year and month information.
     * @function getFirstDay
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (0~6)
     * @memberof utils
     **/
    getFirstDay: function(year, month) {
        return new Date(year, month - 1, 1).getDay();
    },

    /**
     * Get which day is last by parameters that include year and month information.
     * @function getLastDay
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (0~6)
     * @memberof utils
     **/
    getLastDay: function(year, month) {
        return new Date(year, month, 0).getDay();
    },

    /**
     * Get last date by parameters that include year and month information.
     * @function
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (1~31)
     * @memberof utils
     **/
    getLastDate: function(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Get date instance.
     * @function getDateObject
     * @param {Object} date A date hash
     * @return {Date} Date  
     * @memberof utils
     * @example
     *  utils.getDateObject({year:2010, month:5, date:12});
     *  utils.getDateObject(2010, 5, 12); //year,month,date
     **/
    getDateObject: function(date) {
        if (arguments.length === 3) {
            return new Date(arguments[0], arguments[1] - 1, arguments[2]);
        }
        return new Date(date.year, date.month - 1, date.date);
    },

    /**
     * Get related date hash with parameters that include date information.
     * @function getRelativeDate
     * @param {number} year A related value for year(you can use +/-)
     * @param {number} month A related value for month (you can use +/-)
     * @param {number} date A related value for day (you can use +/-)
     * @param {Object} dateObj standard date hash
     * @return {Object} dateObj 
     * @memberof utils
     * @example
     *  utils.getRelativeDate(1, 0, 0, {year:2000, month:1, date:1}); // {year:2001, month:1, date:1}
     *  utils.getRelativeDate(0, 0, -1, {year:2010, month:1, date:1}); // {year:2009, month:12, date:31}
     **/
    getRelativeDate: function(year, month, date, dateObj) {
        var nYear = (dateObj.year + year),
            nMonth = (dateObj.month + month - 1),
            nDate = (dateObj.date + date),
            nDateObj = new Date(nYear, nMonth, nDate);

        return utils.getDateHashTable(nDateObj);
    },

    /**
     * Binary search
     * @param {Array} field - Search field
     * @param {Array} value - Search target
     * @returns {{found: boolean, index: number}} Result
     * @private
     */
    search: function(field, value) {
        var found = false,
            low = 0,
            high = field.length - 1,
            end, index, fieldValue;

        while (!found && !end) {
            index = Math.floor((low + high) / 2);
            fieldValue = field[index];

            if (fieldValue === value) {
                found = true;
            } else if (fieldValue < value) {
                low = index + 1;
            } else {
                high = index - 1;
            }
            end = (low > high);
        }

        return {
            found: found,
            index: (found || fieldValue > value) ? index : index + 1
        }
    }
};

module.exports = utils;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbjFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuU3BpbmJveCcsIHJlcXVpcmUoJy4vc3JjL3NwaW5ib3gnKSwgdHJ1ZSk7XG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuVGltZVBpY2tlcicsIHJlcXVpcmUoJy4vc3JjL3RpbWVwaWNrZXInKSwgdHJ1ZSk7XG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuRGF0ZVBpY2tlcicsIHJlcXVpcmUoJy4vc3JjL2RhdGVwaWNrZXInKSwgdHJ1ZSk7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgbmhuZW50IG9uIDE1LiA1LiAxNC4uXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgY29tcG9uZW50IHByb3ZpZGVzIGEgY2FsZW5kYXIgZm9yIHBpY2tpbmcgYSBkYXRlICYgdGltZS5cbiAqIEBhdXRob3IgTkhOIGVudCBGRSBkZXYgPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT4gPG1pbmt5dS55aUBuaG5lbnQuY29tPlxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLCBjb2RlLXNuaXBwZXQtMS4wLjIsIGNvbXBvbmVudC1jYWxlbmRhci0xLjAuMSwgdGltZVBpY2tlci5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgaW5BcnJheSA9IHR1aS51dGlsLmluQXJyYXksXG4gICAgZm9ybWF0UmVnRXhwID0gL3l5eXl8eXl8bW18bXxkZHxkL2dpLFxuICAgIG1hcEZvckNvbnZlcnRpbmcgPSB7XG4gICAgICAgIHl5eXk6IHtleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsIHR5cGU6ICd5ZWFyJ30sXG4gICAgICAgIHl5OiB7ZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLCB0eXBlOiAneWVhcid9LFxuICAgICAgICB5OiB7ZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLCB0eXBlOiAneWVhcid9LFxuICAgICAgICBtbToge2V4cHJlc3Npb246ICcoMVswMTJdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdtb250aCd9LFxuICAgICAgICBtOiB7ZXhwcmVzc2lvbjogJygxWzAxMl18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ21vbnRoJ30sXG4gICAgICAgIGRkOiB7ZXhwcmVzc2lvbjogJyhbMTJdXFxcXGR7MX18M1swMV18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ2RhdGUnfSxcbiAgICAgICAgZDoge2V4cHJlc3Npb246ICcoWzEyXVxcXFxkezF9fDNbMDFdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdkYXRlJ31cbiAgICB9LFxuICAgIENPTlNUQU5UUyA9IHtcbiAgICAgICAgTUlOX1lFQVI6IDE5NzAsXG4gICAgICAgIE1BWF9ZRUFSOiAyOTk5LFxuICAgICAgICBNT05USF9EQVlTOiBbMCwgMzEsIDI4LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV0sXG4gICAgICAgIFdSQVBQRVJfVEFHOiAnPGRpdiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO1wiPjwvZGl2PicsXG4gICAgICAgIE1JTl9FREdFOiArbmV3IERhdGUoMCksXG4gICAgICAgIE1BWF9FREdFOiArbmV3IERhdGUoMjk5OSwgMTEsIDMxKSxcbiAgICAgICAgWUVBUl9UT19NUzogMzE1MzYwMDAwMDBcbiAgICB9O1xuXG4vKipcbiAqIEEgbnVtYmVyLCBvciBhIHN0cmluZyBjb250YWluaW5nIGEgbnVtYmVyLlxuICogQHR5cGVkZWYge09iamVjdH0gZGF0ZUhhc2hcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB5ZWFyIC0gMTk3MH4yOTk5XG4gKiBAcHJvcGVydHkge251bWJlcn0gbW9udGggLSAxfjEyXG4gKiBAcHJvcGVydHkge251bWJlcn0gZGF0ZSAtIDF+MzFcbiAqL1xuXG4vKipcbiAqIENyZWF0ZSBEYXRlUGlja2VyPGJyPlxuICogWW91IGNhbiBnZXQgYSBkYXRlIGZyb20gJ2dldFllYXInLCAnZ2V0TW9udGgnLCAnZ2V0RGF5SW5Nb250aCcsICdnZXREYXRlSGFzaCdcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIG9wdGlvbnMgZm9yIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudHxzdHJpbmd8alF1ZXJ5fSBvcHRpb24uZWxlbWVudCAtIGlucHV0IGVsZW1lbnQob3Igc2VsZWN0b3IpIG9mIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtkYXRlSGFzaH0gW29wdGlvbi5kYXRlID0gdG9kYXldIC0gaW5pdGlhbCBkYXRlIG9iamVjdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kYXRlRm9ybSA9ICd5eXl5LW1tLWRkJ10gLSBmb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uZGVmYXVsdENlbnR1cnkgPSAyMF0gLSBpZiB5ZWFyLWZvcm1hdCBpcyB5eSwgdGhpcyB2YWx1ZSBpcyBwcmVwZW5kZWQgYXV0b21hdGljYWxseS5cbiAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudHxzdHJpbmd8alF1ZXJ5fSBbb3B0aW9uLnBhcmVudEVsZW1lbnRdIC0gVGhlIHdyYXBwZXIgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGludG9cbiAqICAgICAgICAgICB0aGlzIGVsZW1lbnQuIChzaW5jZSAxLjMuMClcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uc2VsZWN0YWJsZUNsYXNzTmFtZSA9ICdzZWxlY3RhYmxlJ10gLSBmb3Igc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnRzXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnNlbGVjdGVkQ2xhc3NOYW1lID0gJ3NlbGVjdGVkJ10gLSBmb3Igc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5lbmFibGVTZXREYXRlQnlFbnRlcktleSA9IHRydWVdIC0gV2hldGhlciBzZXQgZGF0ZSBmcm9tIHRoZSBpbnB1dCB2YWx1ZVxuICAgICAgICAgICAgd2hlbiB0aGUgJ0VudGVyJyBrZXkgcHJlc3NlZCAoc2luY2UgMS4zLjApXG4gKiAgICAgIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fSBbb3B0aW9ucy5zZWxlY3RhYmxlUmFuZ2VzXSAtIFNlbGVjdGFibGUgZGF0ZSByYW5nZXMsIFNlZSBleGFtcGxlXG4gKiAgICAgIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLnBvc10gLSBjYWxlbmRhciBwb3NpdGlvbiBzdHlsZSB2YWx1ZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLmxlZnRdIC0gcG9zaXRpb24gbGVmdCBvZiBjYWxlbmRhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLnRvcF0gLSBwb3NpdGlvbiB0b3Agb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy56SW5kZXhdIC0gei1pbmRleCBvZiBjYWxlbmRhclxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5vcGVuZXJzID0gW2VsZW1lbnRdXSAtIG9wZW5lciBidXR0b24gbGlzdCAoZXhhbXBsZSAtIGljb24sIGJ1dHRvbiwgZXRjLilcbiAqICAgICAgQHBhcmFtIHtib29sZWFufSBbb3B0aW9uLnNob3dBbHdheXMgPSBmYWxzZV0gLSB3aGV0aGVyIHRoZSBkYXRlcGlja2VyIHNob3dzIHRoZSBjYWxlbmRhciBhbHdheXNcbiAqICAgICAgQHBhcmFtIHtib29sZWFufSBbb3B0aW9uLnVzZVRvdWNoRXZlbnQgPSB0cnVlXSAtIHdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgdXNlcyB0b3VjaCBldmVudHNcbiAqICAgICAgQHBhcmFtIHt0dWkuY29tcG9uZW50LlRpbWVQaWNrZXJ9IFtvcHRpb24udGltZVBpY2tlcl0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gKiBAcGFyYW0ge3R1aS5jb21wb25lbnQuQ2FsZW5kYXJ9IGNhbGVuZGFyIC0gQ2FsZW5kYXIgaW5zdGFuY2VcbiAqIEBleGFtcGxlXG4gKiAgIHZhciBjYWxlbmRhciA9IG5ldyB0dWkuY29tcG9uZW50LkNhbGVuZGFyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjbGF5ZXInLFxuICogICAgICAgdGl0bGVGb3JtYXQ6ICd5eXl564WEIG3sm5QnLFxuICogICAgICAgdG9kYXlGb3JtYXQ6ICd5eXl564WEIG1t7JuUIGRk7J28IChEKSdcbiAqICAgfSk7XG4gKlxuICogICB2YXIgdGltZVBpY2tlciA9IG5ldyB0dWkuY29tcG9uZW50LlRpbWVQaWNrZXIoe1xuICogICAgICAgc2hvd01lcmlkaWFuOiB0cnVlLFxuICogICAgICAgZGVmYXVsdEhvdXI6IDEzLFxuICogICAgICAgZGVmYXVsdE1pbnV0ZTogMjRcbiAqICAgfSk7XG4gKlxuICogICB2YXIgcmFuZ2UxID0gW1xuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjEsIGRhdGU6IDF9LFxuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjIsIGRhdGU6IDF9XG4gKiAgICAgIF0sXG4gKiAgICAgIHJhbmdlMiA9IFtcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDozLCBkYXRlOiAxfSxcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDo0LCBkYXRlOiAxfVxuICogICAgICBdLFxuICogICAgICByYW5nZTMgPSBbXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NiwgZGF0ZTogMX0sXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NywgZGF0ZTogMX1cbiAqICAgICAgXTtcbiAqXG4gKiAgIHZhciBwaWNrZXIxID0gbmV3IHR1aS5jb21wb25lbnQuRGF0ZVBpY2tlcih7XG4gKiAgICAgICBlbGVtZW50OiAnI3BpY2tlcicsXG4gKiAgICAgICBkYXRlRm9ybTogJ3l5eXnrhYQgbW3sm5QgZGTsnbwgLSAnLFxuICogICAgICAgZGF0ZToge3llYXI6IDIwMTUsIG1vbnRoOiAxLCBkYXRlOiAxIH0sXG4gKiAgICAgICBzZWxlY3RhYmxlUmFuZ2VzOiBbcmFuZ2UxLCByYW5nZTIsIHJhbmdlM10sXG4gKiAgICAgICBvcGVuZXJzOiBbJyNvcGVuZXInXSxcbiAqICAgICAgIHRpbWVQaWNrZXI6IHRpbWVQaWNrZXJcbiAqICAgfSwgY2FsZW5kYXIpO1xuICpcbiAqICAgLy8gQ2xvc2UgY2FsZW5kYXIgd2hlbiBzZWxlY3QgYSBkYXRlXG4gKiAgICQoJyNsYXllcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gKiAgICAgICB2YXIgJGVsID0gJChldmVudC50YXJnZXQpO1xuICpcbiAqICAgICAgIGlmICgkZWwuaGFzQ2xhc3MoJ3NlbGVjdGFibGUnKSkge1xuICogICAgICAgICAgIHBpY2tlcjEuY2xvc2UoKTtcbiAqICAgICAgIH1cbiAqICAgfSk7XG4gKi9cbnZhciBEYXRlUGlja2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBEYXRlUGlja2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24sIGNhbGVuZGFyKSB7XG4gICAgICAgIC8vIHNldCBkZWZhdWx0c1xuICAgICAgICBvcHRpb24gPSB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgZGF0ZUZvcm06ICd5eXl5LW1tLWRkICcsXG4gICAgICAgICAgICBkZWZhdWx0Q2VudHVyeTogJzIwJyxcbiAgICAgICAgICAgIHNlbGVjdGFibGVDbGFzc05hbWU6ICdzZWxlY3RhYmxlJyxcbiAgICAgICAgICAgIHNlbGVjdGVkQ2xhc3NOYW1lOiAnc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc2VsZWN0YWJsZVJhbmdlczogW10sXG4gICAgICAgICAgICBlbmFibGVTZXREYXRlQnlFbnRlcktleTogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dBbHdheXM6IGZhbHNlLFxuICAgICAgICAgICAgdXNlVG91Y2hFdmVudDogdHJ1ZVxuICAgICAgICB9LCBvcHRpb24pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxlbmRhciBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7Q2FsZW5kYXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jYWxlbmRhciA9IGNhbGVuZGFyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IGZvciBkaXNwbGF5aW5nIGEgZGF0ZSB2YWx1ZVxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZWxlbWVudCA9ICQob3B0aW9uLmVsZW1lbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IHdyYXBwaW5nIGNhbGVuZGFyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudCA9ICQoQ09OU1RBTlRTLldSQVBQRVJfVEFHKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kYXRlRm9ybSA9IG9wdGlvbi5kYXRlRm9ybTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnRXhwIGluc3RhbmNlIGZvciBmb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAgICAgICAgICogQHR5cGUge1JlZ0V4cH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHNhdmluZyBhIG9yZGVyIG9mIGZvcm1hdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0RGF0ZUZvcm19XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIC8vIElmIHRoZSBmb3JtYXQgaXMgYSAnbW0tZGQsIHl5eXknXG4gICAgICAgICAqIC8vIGB0aGlzLl9mb3JtT3JkZXJgIGlzIFsnbW9udGgnLCAnZGF0ZScsICd5ZWFyJ11cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Zvcm1PcmRlciA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgaGF2aW5nIGRhdGUgdmFsdWVzXG4gICAgICAgICAqIEB0eXBlIHtkYXRlSGFzaH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIHZhbHVlIGlzIHByZXBlbmRlZCBhdXRvbWF0aWNhbGx5IHdoZW4geWVhci1mb3JtYXQgaXMgJ3l5J1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiAvL1xuICAgICAgICAgKiAvLyBJZiB0aGlzIHZhbHVlIGlzICcyMCcsIHRoZSBmb3JtYXQgaXMgJ3l5LW1tLWRkJyBhbmQgdGhlIGRhdGUgc3RyaW5nIGlzICcxNS0wNC0xMicsXG4gICAgICAgICAqIC8vIHRoZSBkYXRlIHZhbHVlIG9iamVjdCBpc1xuICAgICAgICAgKiAvLyAge1xuICAgICAgICAgKiAvLyAgICAgIHllYXI6IDIwMTUsXG4gICAgICAgICAqIC8vICAgICAgbW9udGg6IDQsXG4gICAgICAgICAqIC8vICAgICAgZGF0ZTogMTJcbiAgICAgICAgICogLy8gIH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDZW50dXJ5ID0gb3B0aW9uLmRlZmF1bHRDZW50dXJ5O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGFzcyBuYW1lIGZvciBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUgPSBvcHRpb24uc2VsZWN0YWJsZUNsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSA9IG9wdGlvbi5zZWxlY3RlZENsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciBzZXQgZGF0ZSBmcm9tIHRoZSBpbnB1dCB2YWx1ZSB3aGVuIHRoZSAnRW50ZXInIGtleSBwcmVzc2VkXG4gICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgKiBAc2luY2UgMS4zLjBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VuYWJsZVNldERhdGVCeUVudGVyS2V5ID0gb3B0aW9uLmVuYWJsZVNldERhdGVCeUVudGVyS2V5O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJdCBpcyBzdGFydCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFRpbWVzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEl0IGlzIGVuZCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbmRUaW1lcyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWxlY3RhYmxlIGRhdGUgcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48QXJyYXkuPGRhdGVIYXNoPj59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gb3B0aW9uLnNlbGVjdGFibGVSYW5nZXM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge1RpbWVQaWNrZXJ9XG4gICAgICAgICAqIEBzaW5jZSAxLjEuMFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHBvc2l0aW9uIC0gbGVmdCAmIHRvcCAmIHpJbmRleFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BvcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG9wZW5lcnMgLSBvcGVuZXIgbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3BlbmVycyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVycyBiaW5kaW5nIGNvbnRleHRcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Byb3h5SGFuZGxlcnMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBzaG93cyBhbHdheXNcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVwaWNrZXIuc2hvd0Fsd2F5cyA9IHRydWU7XG4gICAgICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAgICAgKiAvLyBUaGUgZGF0ZXBpY2tlciB3aWxsIGJlIG5vdCBjbG9zZWQgaWYgeW91IGNsaWNrIHRoZSBvdXRzaWRlIG9mIHRoZSBkYXRlcGlja2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNob3dBbHdheXMgPSBvcHRpb24uc2hvd0Fsd2F5cztcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGUgZGF0ZXBpY2tlciB1c2UgdG91Y2ggZXZlbnQuXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlcGlja2VyLnVzZVRvdWNoRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICogLy8gVGhlIGRhdGVwaWNrZXIgd2lsbCBiZSB1c2Ugb25seSAnY2xpY2snLCAnbW91c2Vkb3duJyBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudXNlVG91Y2hFdmVudCA9ICEhKFxuICAgICAgICAgICAgKCgnY3JlYXRlVG91Y2gnIGluIGRvY3VtZW50KSB8fCAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQpKSAmJlxuICAgICAgICAgICAgb3B0aW9uLnVzZVRvdWNoRXZlbnRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplRGF0ZVBpY2tlcihvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIG1ldGhvZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSB1c2VyIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemVEYXRlUGlja2VyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gdGhpcy5fZmlsdGVyVmFsaWRSYW5nZXModGhpcy5fcmFuZ2VzKTtcblxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgICAgIHRoaXMuX3NldFdyYXBwZXJFbGVtZW50KG9wdGlvbi5wYXJlbnRFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdERhdGUob3B0aW9uLmRhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24ob3B0aW9uLnBvcyk7XG4gICAgICAgIHRoaXMuX3NldFByb3h5SGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5fc2V0T3BlbmVycyhvcHRpb24ub3BlbmVycyk7XG4gICAgICAgIHRoaXMuX2JpbmRLZXlkb3duRXZlbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9zZXRUaW1lUGlja2VyKG9wdGlvbi50aW1lUGlja2VyKTtcbiAgICAgICAgdGhpcy5zZXREYXRlRm9ybSgpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb29rcyB0aHJvdWdoIGVhY2ggdmFsdWUgaW4gdGhlIHJhbmdlcywgcmV0dXJuaW5nIGFuIGFycmF5IG9mIG9ubHkgdmFsaWQgcmFuZ2VzLlxuICAgICAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fSByYW5nZXMgLSByYW5nZXNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fSBmaWx0ZXJlZCByYW5nZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWx0ZXJWYWxpZFJhbmdlczogZnVuY3Rpb24ocmFuZ2VzKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5maWx0ZXIocmFuZ2VzLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9pc1ZhbGlkRGF0ZShyYW5nZVswXSkgJiYgdGhpcy5faXNWYWxpZERhdGUocmFuZ2VbMV0pKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3cmFwcGVyIGVsZW1lbnQoPSBjb250YWluZXIpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtwYXJlbnRFbGVtZW50XSAtIHBhcmVudCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0V3JhcHBlckVsZW1lbnQ6IGZ1bmN0aW9uKHBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyRWxlbWVudCA9IHRoaXMuXyR3cmFwcGVyRWxlbWVudDtcbiAgICAgICAgdmFyICRwYXJlbnRFbGVtZW50ID0gJChwYXJlbnRFbGVtZW50KTtcblxuICAgICAgICAkd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcblxuICAgICAgICBpZiAoJHBhcmVudEVsZW1lbnRbMF0pIHtcbiAgICAgICAgICAgICR3cmFwcGVyRWxlbWVudC5hcHBlbmRUbygkcGFyZW50RWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fJGVsZW1lbnRbMF0pIHtcbiAgICAgICAgICAgICR3cmFwcGVyRWxlbWVudC5pbnNlcnRBZnRlcih0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkd3JhcHBlckVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRlZmF1bHQgZGF0ZVxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfXxEYXRlfSBvcERhdGUgW29wdGlvbi5kYXRlXSAtIHVzZXIgc2V0dGluZzogZGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERlZmF1bHREYXRlOiBmdW5jdGlvbihvcERhdGUpIHtcbiAgICAgICAgdmFyIGlzTnVtYmVyID0gdHVpLnV0aWwuaXNOdW1iZXI7XG5cbiAgICAgICAgaWYgKCFvcERhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGUgPSB1dGlscy5nZXRUb2RheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZSA9IHtcbiAgICAgICAgICAgICAgICB5ZWFyOiBpc051bWJlcihvcERhdGUueWVhcikgPyBvcERhdGUueWVhciA6IENPTlNUQU5UUy5NSU5fWUVBUixcbiAgICAgICAgICAgICAgICBtb250aDogaXNOdW1iZXIob3BEYXRlLm1vbnRoKSA/IG9wRGF0ZS5tb250aCA6IDEsXG4gICAgICAgICAgICAgICAgZGF0ZTogaXNOdW1iZXIob3BEYXRlLmRhdGUpID8gb3BEYXRlLmRhdGUgOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgZGVmYXVsdCBzdHlsZS1wb3NpdGlvbiBvZiBjYWxlbmRhclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcFBvcyBbb3B0aW9uLnBvc10gLSB1c2VyIHNldHRpbmc6IHBvc2l0aW9uKGxlZnQsIHRvcCwgekluZGV4KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERlZmF1bHRQb3NpdGlvbjogZnVuY3Rpb24ob3BQb3MpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX3BvcyA9IG9wUG9zIHx8IHt9LFxuICAgICAgICAgICAgYm91bmQgPSB0aGlzLl9nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBwb3MubGVmdCA9IHBvcy5sZWZ0IHx8IGJvdW5kLmxlZnQgfHwgMDtcbiAgICAgICAgcG9zLnRvcCA9IHBvcy50b3AgfHwgYm91bmQuYm90dG9tIHx8IDA7XG4gICAgICAgIHBvcy56SW5kZXggPSBwb3MuekluZGV4IHx8IDk5OTk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzdGFydC9lbmQgZWRnZSBmcm9tIHNlbGVjdGFibGUtcmFuZ2VzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2VsZWN0YWJsZVJhbmdlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fZW5kVGltZXMgPSBbXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuX3JhbmdlcywgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRpbWVSYW5nZSh7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IHV0aWxzLmdldFRpbWUocmFuZ2VbMF0pLFxuICAgICAgICAgICAgICAgIGVuZDogdXRpbHMuZ2V0VGltZShyYW5nZVsxXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRpbWUgcmFuZ2UgKHN0YXJ0VGltZXMsIGVuZFRpbWVzKVxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gbmV3VGltZVJhbmdlIC0gVGltZSByYW5nZSBmb3IgdXBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlVGltZVJhbmdlOiBmdW5jdGlvbihuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgdmFyIGluZGV4LCBleGlzdGluZ1RpbWVSYW5nZSwgbWVyZ2VkVGltZVJhbmdlO1xuXG4gICAgICAgIGluZGV4ID0gdGhpcy5fc2VhcmNoU3RhcnRUaW1lKG5ld1RpbWVSYW5nZS5zdGFydCkuaW5kZXg7XG4gICAgICAgIGV4aXN0aW5nVGltZVJhbmdlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX3N0YXJ0VGltZXNbaW5kZXhdLFxuICAgICAgICAgICAgZW5kOiB0aGlzLl9lbmRUaW1lc1tpbmRleF1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5faXNPdmVybGFwcGVkVGltZVJhbmdlKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpKSB7XG4gICAgICAgICAgICBtZXJnZWRUaW1lUmFuZ2UgPSB0aGlzLl9tZXJnZVRpbWVSYW5nZXMoZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFRpbWVzLnNwbGljZShpbmRleCwgMSwgbWVyZ2VkVGltZVJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuX2VuZFRpbWVzLnNwbGljZShpbmRleCwgMSwgbWVyZ2VkVGltZVJhbmdlLmVuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFRpbWVzLnNwbGljZShpbmRleCwgMCwgbmV3VGltZVJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuX2VuZFRpbWVzLnNwbGljZShpbmRleCwgMCwgbmV3VGltZVJhbmdlLmVuZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmFuZ2VzIGFyZSBvdmVybGFwcGVkXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBleGlzdGluZ1RpbWVSYW5nZSAtIEV4aXN0aW5nIHRpbWUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IG5ld1RpbWVSYW5nZSAtIE5ldyB0aW1lIHJhbmdlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJhbmdlcyBhcmUgb3ZlcmxhcHBlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzT3ZlcmxhcHBlZFRpbWVSYW5nZTogZnVuY3Rpb24oZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSkge1xuICAgICAgICB2YXIgZXhpc3RpbmdTdGFydCA9IGV4aXN0aW5nVGltZVJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgZXhpc3RpbmdFbmQgPSBleGlzdGluZ1RpbWVSYW5nZS5lbmQsXG4gICAgICAgICAgICBuZXdTdGFydCA9IG5ld1RpbWVSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIG5ld0VuZCA9IG5ld1RpbWVSYW5nZS5lbmQsXG4gICAgICAgICAgICBpc1RydXRoeSA9IGV4aXN0aW5nU3RhcnQgJiYgZXhpc3RpbmdFbmQgJiYgbmV3U3RhcnQgJiYgbmV3RW5kLFxuICAgICAgICAgICAgaXNPdmVybGFwcGVkID0gIShcbiAgICAgICAgICAgICAgICAobmV3U3RhcnQgPCBleGlzdGluZ1N0YXJ0ICYmIG5ld0VuZCA8IGV4aXN0aW5nU3RhcnQpIHx8XG4gICAgICAgICAgICAgICAgKG5ld1N0YXJ0ID4gZXhpc3RpbmdFbmQgJiYgbmV3RW5kID4gZXhpc3RpbmdFbmQpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBpc1RydXRoeSAmJiBpc092ZXJsYXBwZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1lcmdlIHRoZSBvdmVybGFwcGVkIHRpbWUgcmFuZ2VzXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBleGlzdGluZ1RpbWVSYW5nZSAtIEV4aXN0aW5nIHRpbWUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IG5ld1RpbWVSYW5nZSAtIE5ldyB0aW1lIHJhbmdlXG4gICAgICogQHJldHVybnMge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IE1lcmdlZCB0aW1lIHJhbmdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWVyZ2VUaW1lUmFuZ2VzOiBmdW5jdGlvbihleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogTWF0aC5taW4oZXhpc3RpbmdUaW1lUmFuZ2Uuc3RhcnQsIG5ld1RpbWVSYW5nZS5zdGFydCksXG4gICAgICAgICAgICBlbmQ6IE1hdGgubWF4KGV4aXN0aW5nVGltZVJhbmdlLmVuZCwgbmV3VGltZVJhbmdlLmVuZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHRpbWVzdGFtcCBpbiBzdGFydFRpbWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcCAtIHRpbWVzdGFtcFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZWFyY2hTdGFydFRpbWU6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdXRpbHMuc2VhcmNoKHRoaXMuX3N0YXJ0VGltZXMsIHRpbWVzdGFtcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aW1lc3RhbXAgaW4gZW5kVGltZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wIC0gdGltZXN0YW1wXG4gICAgICogQHJldHVybnMge3tmb3VuZDogYm9vbGVhbiwgaW5kZXg6IG51bWJlcn19IHJlc3VsdFxuICAgICAqL1xuICAgIF9zZWFyY2hFbmRUaW1lOiBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnNlYXJjaCh0aGlzLl9lbmRUaW1lcywgdGltZXN0YW1wKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcmUgb3BlbmVyIGVsZW1lbnQgbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG9wT3BlbmVycyBbb3B0aW9uLm9wZW5lcnNdIC0gb3BlbmVyIGVsZW1lbnQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wZW5lcnM6IGZ1bmN0aW9uKG9wT3BlbmVycykge1xuICAgICAgICB0aGlzLmFkZE9wZW5lcih0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gob3BPcGVuZXJzLCBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3BlbmVyKG9wZW5lcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7dHVpLmNvbXBvbmVudC5UaW1lUGlja2VyfSBbb3BUaW1lUGlja2VyXSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaW1lUGlja2VyOiBmdW5jdGlvbihvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgaWYgKCFvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpbWVQaWNrZXIgPSBvcFRpbWVQaWNrZXI7XG4gICAgICAgIHRoaXMuX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY3VzdG9tIGV2ZW50IHdpdGggVGltZVBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9uQ2hhbmdlVGltZVBpY2tlciA9IHR1aS51dGlsLmJpbmQodGhpcy5zZXREYXRlLCB0aGlzKTtcblxuICAgICAgICB0aGlzLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIub24oJ2NoYW5nZScsIG9uQ2hhbmdlVGltZVBpY2tlcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5vZmYoJ2NoYW5nZScsIG9uQ2hhbmdlVGltZVBpY2tlcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIGEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIC0geWVhclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIHllYXIgaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFllYXI6IGZ1bmN0aW9uKHllYXIpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLmlzTnVtYmVyKHllYXIpICYmIHllYXIgPiBDT05TVEFOVFMuTUlOX1lFQVIgJiYgeWVhciA8IENPTlNUQU5UUy5NQVhfWUVBUjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiBhIG1vbnRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIC0gbW9udGhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSBtb250aCBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkTW9udGg6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5pc051bWJlcihtb250aCkgJiYgbW9udGggPiAwICYmIG1vbnRoIDwgMTM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgdmFsdWVzIGluIGEgZGF0ZSBvYmplY3QgaGF2aW5nIHllYXIsIG1vbnRoLCBkYXktaW4tbW9udGhcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBkYXRlSGFzaCAtIGRhdGVIYXNoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgZGF0ZSBvYmplY3QgaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZERhdGU6IGZ1bmN0aW9uKGRhdGVoYXNoKSB7XG4gICAgICAgIHZhciB5ZWFyLCBtb250aCwgZGF0ZSwgaXNMZWFwWWVhciwgbGFzdERheUluTW9udGgsIGlzQmV0d2VlbjtcblxuICAgICAgICBpZiAoIWRhdGVoYXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB5ZWFyID0gZGF0ZWhhc2gueWVhcjtcbiAgICAgICAgbW9udGggPSBkYXRlaGFzaC5tb250aDtcbiAgICAgICAgZGF0ZSA9IGRhdGVoYXNoLmRhdGU7XG4gICAgICAgIGlzTGVhcFllYXIgPSAoeWVhciAlIDQgPT09IDApICYmICh5ZWFyICUgMTAwICE9PSAwKSB8fCAoeWVhciAlIDQwMCA9PT0gMCk7XG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZFllYXIoeWVhcikgfHwgIXRoaXMuX2lzVmFsaWRNb250aChtb250aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3REYXlJbk1vbnRoID0gQ09OU1RBTlRTLk1PTlRIX0RBWVNbbW9udGhdO1xuICAgICAgICBpZiAoaXNMZWFwWWVhciAmJiBtb250aCA9PT0gMikge1xuICAgICAgICAgICAgICAgIGxhc3REYXlJbk1vbnRoID0gMjk7XG4gICAgICAgIH1cbiAgICAgICAgaXNCZXR3ZWVuID0gISEodHVpLnV0aWwuaXNOdW1iZXIoZGF0ZSkgJiYgKGRhdGUgPiAwKSAmJiAoZGF0ZSA8PSBsYXN0RGF5SW5Nb250aCkpO1xuXG4gICAgICAgIHJldHVybiBpc0JldHdlZW47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGFuIGVsZW1lbnQgaXMgYW4gb3BlbmVyLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gb3BlbmVyIHRydWUvZmFsc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc09wZW5lcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuX29wZW5lcnMsIGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gb3BlbmVyIHx8ICQuY29udGFpbnMob3BlbmVyLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3R5bGUtcG9zaXRpb24gb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcnJhbmdlTGF5ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLl8kd3JhcHBlckVsZW1lbnRbMF0uc3R5bGUsXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9wb3M7XG5cbiAgICAgICAgc3R5bGUubGVmdCA9IHBvcy5sZWZ0ICsgJ3B4JztcbiAgICAgICAgc3R5bGUudG9wID0gcG9zLnRvcCArICdweCc7XG4gICAgICAgIHN0eWxlLnpJbmRleCA9IHBvcy56SW5kZXg7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5hcHBlbmQodGhpcy5fY2FsZW5kYXIuJGVsZW1lbnQpO1xuICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl90aW1lUGlja2VyLiR0aW1lUGlja2VyRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmRpbmdDbGllbnRSZWN0IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gW2VsZW1lbnRdIC0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gYW4gb2JqZWN0IGhhdmluZyBsZWZ0LCB0b3AsIGJvdHRvbSwgcmlnaHQgb2YgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kaW5nQ2xpZW50UmVjdDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgZWwgPSAkKGVsZW1lbnQpWzBdIHx8IHRoaXMuXyRlbGVtZW50WzBdLFxuICAgICAgICAgICAgYm91bmQsXG4gICAgICAgICAgICBjZWlsO1xuXG4gICAgICAgIGlmICghZWwpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvdW5kID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNlaWwgPSBNYXRoLmNlaWw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBjZWlsKGJvdW5kLmxlZnQpLFxuICAgICAgICAgICAgdG9wOiBjZWlsKGJvdW5kLnRvcCksXG4gICAgICAgICAgICBib3R0b206IGNlaWwoYm91bmQuYm90dG9tKSxcbiAgICAgICAgICAgIHJpZ2h0OiBjZWlsKGJvdW5kLnJpZ2h0KVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGF0ZSBmcm9tIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBkYXRlIHN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERhdGVGcm9tU3RyaW5nOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGRhdGUgPSB0aGlzLl9leHRyYWN0RGF0ZShzdHIpO1xuXG4gICAgICAgIGlmIChkYXRlICYmIHRoaXMuX2lzU2VsZWN0YWJsZShkYXRlKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGgsIGRhdGUuZGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZm9ybWVkIGRhdGUtc3RyaW5nIGZyb20gZGF0ZSBvYmplY3RcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWVkIGRhdGUtc3RyaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybWVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHllYXIgPSB0aGlzLl9kYXRlLnllYXIsXG4gICAgICAgICAgICBtb250aCA9IHRoaXMuX2RhdGUubW9udGgsXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5fZGF0ZS5kYXRlLFxuICAgICAgICAgICAgZm9ybSA9IHRoaXMuX2RhdGVGb3JtLFxuICAgICAgICAgICAgcmVwbGFjZU1hcCxcbiAgICAgICAgICAgIGRhdGVTdHJpbmc7XG5cbiAgICAgICAgbW9udGggPSBtb250aCA8IDEwID8gKCcwJyArIG1vbnRoKSA6IG1vbnRoO1xuICAgICAgICBkYXRlID0gZGF0ZSA8IDEwID8gKCcwJyArIGRhdGUpIDogZGF0ZTtcblxuICAgICAgICByZXBsYWNlTWFwID0ge1xuICAgICAgICAgICAgeXl5eTogeWVhcixcbiAgICAgICAgICAgIHl5OiBTdHJpbmcoeWVhcikuc3Vic3RyKDIsIDIpLFxuICAgICAgICAgICAgbW06IG1vbnRoLFxuICAgICAgICAgICAgbTogTnVtYmVyKG1vbnRoKSxcbiAgICAgICAgICAgIGRkOiBkYXRlLFxuICAgICAgICAgICAgZDogTnVtYmVyKGRhdGUpXG4gICAgICAgIH07XG5cbiAgICAgICAgZGF0ZVN0cmluZyA9IGZvcm0ucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VNYXBba2V5LnRvTG93ZXJDYXNlKCldIHx8ICcnO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGF0ZVN0cmluZztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBkYXRlLW9iamVjdCBmcm9tIGlucHV0IHN0cmluZyB3aXRoIGNvbXBhcmluZyBkYXRlLWZvcm1hdDxicj5cbiAgICAgKiBJZiBjYW4gbm90IGV4dHJhY3QsIHJldHVybiBmYWxzZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgLSBpbnB1dCBzdHJpbmcodGV4dClcbiAgICAgKiBAcmV0dXJucyB7ZGF0ZUhhc2h8ZmFsc2V9IC0gZXh0cmFjdGVkIGRhdGUgb2JqZWN0IG9yIGZhbHNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXh0cmFjdERhdGU6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB2YXIgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyLFxuICAgICAgICAgICAgcmVzdWx0RGF0ZSA9IHt9LFxuICAgICAgICAgICAgcmVnRXhwID0gdGhpcy5fcmVnRXhwO1xuXG4gICAgICAgIHJlZ0V4cC5sYXN0SW5kZXggPSAwO1xuICAgICAgICBpZiAocmVnRXhwLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMF1dID0gTnVtYmVyKFJlZ0V4cC4kMSk7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclsxXV0gPSBOdW1iZXIoUmVnRXhwLiQyKTtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzJdXSA9IE51bWJlcihSZWdFeHAuJDMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFN0cmluZyhyZXN1bHREYXRlLnllYXIpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmVzdWx0RGF0ZS55ZWFyID0gTnVtYmVyKHRoaXMuX2RlZmF1bHRDZW50dXJ5ICsgcmVzdWx0RGF0ZS55ZWFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHREYXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGEgZGF0ZUhhc2ggaXMgc2VsZWN0YWJsZVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IGRhdGVIYXNoIC0gZGF0ZUhhc2hcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIGEgZGF0ZUhhc2ggaXMgc2VsZWN0YWJsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzU2VsZWN0YWJsZTogZnVuY3Rpb24oZGF0ZUhhc2gpIHtcbiAgICAgICAgdmFyIGluUmFuZ2UgPSB0cnVlLFxuICAgICAgICAgICAgc3RhcnRUaW1lcywgc3RhcnRUaW1lLCByZXN1bHQsIHRpbWVzdGFtcDtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWREYXRlKGRhdGVIYXNoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnRUaW1lcyA9IHRoaXMuX3N0YXJ0VGltZXM7XG4gICAgICAgIHRpbWVzdGFtcCA9IHV0aWxzLmdldFRpbWUoZGF0ZUhhc2gpO1xuXG4gICAgICAgIGlmIChzdGFydFRpbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2VhcmNoRW5kVGltZSh0aW1lc3RhbXApO1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gc3RhcnRUaW1lc1tyZXN1bHQuaW5kZXhdO1xuICAgICAgICAgICAgaW5SYW5nZSA9IHJlc3VsdC5mb3VuZCB8fCAodGltZXN0YW1wID49IHN0YXJ0VGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5SYW5nZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGFibGUtY2xhc3MtbmFtZSB0byBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGFibGVDbGFzc05hbWU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRhdGVIYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1NlbGVjdGFibGUoZGF0ZUhhc2gpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzZWxlY3RlZC1jbGFzcy1uYW1lIHRvIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBlbGVtZW50IC0gZGF0ZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBkYXRlSGFzaCAtIGRhdGUgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2VsZWN0ZWRDbGFzc05hbWU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRhdGVIYXNoKSB7XG4gICAgICAgIHZhciB5ZWFyID0gdGhpcy5fZGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSB0aGlzLl9kYXRlLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUuZGF0ZSxcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQgPSAoeWVhciA9PT0gZGF0ZUhhc2gueWVhcikgJiYgKG1vbnRoID09PSBkYXRlSGFzaC5tb250aCkgJiYgKGRhdGUgPT09IGRhdGVIYXNoLmRhdGUpO1xuXG4gICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKHRoaXMuX3NlbGVjdGVkQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdmFsdWUgYSBkYXRlLXN0cmluZyBvZiBjdXJyZW50IHRoaXMgaW5zdGFuY2UgdG8gaW5wdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFZhbHVlVG9JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0ZVN0cmluZyA9IHRoaXMuX2Zvcm1lZCgpLFxuICAgICAgICAgICAgdGltZVN0cmluZyA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gdGhpcy5fdGltZVBpY2tlci5nZXRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJGVsZW1lbnQudmFsKGRhdGVTdHJpbmcgKyB0aW1lU3RyaW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0KG9yIG1ha2UpIFJlZ0V4cCBpbnN0YW5jZSBmcm9tIHRoZSBkYXRlLWZvcm1hdCBvZiB0aGlzIGluc3RhbmNlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFJlZ0V4cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWdFeHBTdHIgPSAnXicsXG4gICAgICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgICAgICBmb3JtT3JkZXIgPSB0aGlzLl9mb3JtT3JkZXI7XG5cbiAgICAgICAgdGhpcy5fZGF0ZUZvcm0ucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgdmFyIGtleSA9IHN0ci50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICByZWdFeHBTdHIgKz0gKG1hcEZvckNvbnZlcnRpbmdba2V5XS5leHByZXNzaW9uICsgJ1tcXFxcRFxcXFxzXSonKTtcbiAgICAgICAgICAgIGZvcm1PcmRlcltpbmRleF0gPSBtYXBGb3JDb252ZXJ0aW5nW2tleV0udHlwZTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9yZWdFeHAgPSBuZXcgUmVnRXhwKHJlZ0V4cFN0ciwgJ2dpJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudCBoYW5kbGVycyB0byBiaW5kIGNvbnRleHQgYW5kIHRoZW4gc3RvcmUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJveHlIYW5kbGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94aWVzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgIGJpbmQgPSB0dWkudXRpbC5iaW5kO1xuXG4gICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzIGZvciBlbGVtZW50XG4gICAgICAgIHByb3hpZXMub25Nb3VzZWRvd25Eb2N1bWVudCA9IGJpbmQodGhpcy5fb25Nb3VzZWRvd25Eb2N1bWVudCwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25LZXlkb3duRWxlbWVudCA9IGJpbmQodGhpcy5fb25LZXlkb3duRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25DbGlja0NhbGVuZGFyID0gYmluZCh0aGlzLl9vbkNsaWNrQ2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tPcGVuZXIgPSBiaW5kKHRoaXMuX29uQ2xpY2tPcGVuZXIsIHRoaXMpO1xuXG4gICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzIGZvciBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgICAgcHJveGllcy5vbkJlZm9yZURyYXdDYWxlbmRhciA9IGJpbmQodGhpcy5fb25CZWZvcmVEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uRHJhd0NhbGVuZGFyID0gYmluZCh0aGlzLl9vbkRyYXdDYWxlbmRhciwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25BZnRlckRyYXdDYWxlbmRhciA9IGJpbmQodGhpcy5fb25BZnRlckRyYXdDYWxlbmRhciwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlZG93biBvZiBkb2N1bWVudDxicj5cbiAgICAgKiAtIFdoZW4gY2xpY2sgdGhlIG91dCBvZiBsYXllciwgY2xvc2UgdGhlIGxheWVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdXNlZG93bkRvY3VtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgaXNDb250YWlucyA9ICQuY29udGFpbnModGhpcy5fJHdyYXBwZXJFbGVtZW50WzBdLCBldmVudC50YXJnZXQpO1xuXG4gICAgICAgIGlmICgoIWlzQ29udGFpbnMgJiYgIXRoaXMuX2lzT3BlbmVyKGV2ZW50LnRhcmdldCkpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgZW50ZXIta2V5IGRvd24gb2YgaW5wdXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IFtldmVudF0gLSBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleWRvd25FbGVtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIWV2ZW50IHx8IGV2ZW50LmtleUNvZGUgIT09IDEzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0RGF0ZUZyb21TdHJpbmcodGhpcy5fJGVsZW1lbnQudmFsKCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBjbGljayBvZiBjYWxlbmRhcjxicj5cbiAgICAgKiAtIFVwZGF0ZSBkYXRlIGZvcm0gZXZlbnQtdGFyZ2V0XG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrQ2FsZW5kYXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQsXG4gICAgICAgICAgICBjbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lLFxuICAgICAgICAgICAgdmFsdWUgPSBOdW1iZXIoKHRhcmdldC5pbm5lclRleHQgfHwgdGFyZ2V0LnRleHRDb250ZW50IHx8IHRhcmdldC5ub2RlVmFsdWUpKSxcbiAgICAgICAgICAgIHNob3duRGF0ZSxcbiAgICAgICAgICAgIHJlbGF0aXZlTW9udGgsXG4gICAgICAgICAgICBkYXRlO1xuXG4gICAgICAgIGlmICh2YWx1ZSAmJiAhaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ3ByZXYtbW9udGgnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9IC0xO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUuaW5kZXhPZignbmV4dC1tb250aCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vbnRoID0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNob3duRGF0ZSA9IHRoaXMuX2NhbGVuZGFyLmdldERhdGUoKTtcbiAgICAgICAgICAgIHNob3duRGF0ZS5kYXRlID0gdmFsdWU7XG4gICAgICAgICAgICBkYXRlID0gdXRpbHMuZ2V0UmVsYXRpdmVEYXRlKDAsIHJlbGF0aXZlTW9udGgsIDAsIHNob3duRGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRhdGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIG9mIG9wZW5lci1lbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja09wZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnYmVmb3JlRHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uQmVmb3JlRHJhd0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fdW5iaW5kT25DbGlja0NhbGVuZGFyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdkcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnREYXRhIC0gY3VzdG9tIGV2ZW50IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25EcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKGV2ZW50RGF0YSkge1xuICAgICAgICB2YXIgZGF0ZUhhc2ggPSB7XG4gICAgICAgICAgICB5ZWFyOiBldmVudERhdGEueWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBldmVudERhdGEubW9udGgsXG4gICAgICAgICAgICBkYXRlOiBldmVudERhdGEuZGF0ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlQ2xhc3NOYW1lKGV2ZW50RGF0YS4kZGF0ZUNvbnRhaW5lciwgZGF0ZUhhc2gpO1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENsYXNzTmFtZShldmVudERhdGEuJGRhdGVDb250YWluZXIsIGRhdGVIYXNoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2FmdGVyRHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uQWZ0ZXJEcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zaG93T25seVZhbGlkQnV0dG9ucygpO1xuICAgICAgICB0aGlzLl9iaW5kT25DbGlja0NhbGVuZGFyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgb25seSB2YWxpZCBidXR0b25zIGluIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd09ubHlWYWxpZEJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGhlYWRlciA9IHRoaXMuX2NhbGVuZGFyLiRoZWFkZXIsXG4gICAgICAgICAgICAkcHJldlllYXJCdG4gPSAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJidG4tcHJldi15ZWFyXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgJHByZXZNb250aEJ0biA9ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cImJ0bi1wcmV2LW1vbnRoXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgJG5leHRZZWFyQnRuID0gJGhlYWRlci5maW5kKCdbY2xhc3MqPVwiYnRuLW5leHQteWVhclwiXScpLmhpZGUoKSxcbiAgICAgICAgICAgICRuZXh0TW9udGhCdG4gPSAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJidG4tbmV4dC1tb250aFwiXScpLmhpZGUoKSxcbiAgICAgICAgICAgIHNob3duRGF0ZUhhc2ggPSB0aGlzLl9jYWxlbmRhci5nZXREYXRlKCksXG4gICAgICAgICAgICBzaG93bkRhdGUgPSBuZXcgRGF0ZShzaG93bkRhdGVIYXNoLnllYXIsIHNob3duRGF0ZUhhc2gubW9udGggLSAxKSxcbiAgICAgICAgICAgIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKHRoaXMuX3N0YXJ0VGltZXNbMF0gfHwgQ09OU1RBTlRTLk1JTl9FREdFKS5zZXREYXRlKDEpLFxuICAgICAgICAgICAgZW5kRGF0ZSA9IG5ldyBEYXRlKHRoaXMuX2VuZFRpbWVzLnNsaWNlKC0xKVswXSB8fCBDT05TVEFOVFMuTUFYX0VER0UpLnNldERhdGUoMSksLy8gYXJyLnNsaWNlKC0xKVswXSA9PT0gYXJyW2Fyci5sZW5ndGggLSAxXVxuICAgICAgICAgICAgc3RhcnREaWZmZXJlbmNlID0gc2hvd25EYXRlIC0gc3RhcnREYXRlLFxuICAgICAgICAgICAgZW5kRGlmZmVyZW5jZSA9IGVuZERhdGUgLSBzaG93bkRhdGU7XG5cbiAgICAgICAgaWYgKHN0YXJ0RGlmZmVyZW5jZSA+IDApIHtcbiAgICAgICAgICAgICRwcmV2TW9udGhCdG4uc2hvdygpO1xuICAgICAgICAgICAgaWYgKHN0YXJ0RGlmZmVyZW5jZSA+PSBDT05TVEFOVFMuWUVBUl9UT19NUykge1xuICAgICAgICAgICAgICAgICRwcmV2WWVhckJ0bi5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5kRGlmZmVyZW5jZSA+IDApIHtcbiAgICAgICAgICAgICRuZXh0TW9udGhCdG4uc2hvdygpO1xuICAgICAgICAgICAgaWYgKGVuZERpZmZlcmVuY2UgPj0gQ09OU1RBTlRTLllFQVJfVE9fTVMpIHtcbiAgICAgICAgICAgICAgICAkbmV4dFllYXJCdG4uc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQga2V5ZG93biBldmVudCBoYW5kbGVyIHRvIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0RWwgLSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRLZXlkb3duRXZlbnQ6IGZ1bmN0aW9uKCR0YXJnZXRFbCkge1xuICAgICAgICBpZiAodGhpcy5fZW5hYmxlU2V0RGF0ZUJ5RW50ZXJLZXkpIHtcbiAgICAgICAgICAgICR0YXJnZXRFbC5vbigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGtleWRvd24gZXZlbnQgaGFuZGxlciBmcm9tIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0RWwgLSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZEtleWRvd25FdmVudDogZnVuY3Rpb24oJHRhcmdldEVsKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVTZXREYXRlQnlFbnRlcktleSkge1xuICAgICAgICAgICAgJHRhcmdldEVsLm9mZigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBhIChtb3VzZWRvd258dG91Y2hzdGFydCkgZXZlbnQgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSAodGhpcy51c2VUb3VjaEV2ZW50KSA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nO1xuICAgICAgICAkKGRvY3VtZW50KS5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBtb3VzZWRvd24sdG91Y2hzdGFydCBldmVudHMgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91bmJpbmRPbk1vdXNlZG93bkRvY3VtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY2xpY2sgZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcixcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljayc7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9uKGV2ZW50VHlwZSwgaGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrQ2FsZW5kYXI7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9mZignY2xpY2sgdG91Y2hlbmQnLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94eUhhbmRsZXJzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25BZnRlckRyYXcgPSBwcm94eUhhbmRsZXJzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXI7XG5cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIub24oe1xuICAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgICdhZnRlckRyYXcnOiBvbkFmdGVyRHJhd1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAvKipcbiAgICAqIFVuYmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBfdW5iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgdmFyIHByb3h5SGFuZGxlcnMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICBvbkJlZm9yZURyYXcgPSBwcm94eUhhbmRsZXJzLm9uQmVmb3JlRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkFmdGVyRHJhdyA9IHByb3h5SGFuZGxlcnMub25BZnRlckRyYXdDYWxlbmRhcjtcblxuICAgICAgIHRoaXMuX2NhbGVuZGFyLm9mZih7XG4gICAgICAgICAgICdiZWZvcmVEcmF3Jzogb25CZWZvcmVEcmF3LFxuICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHJhbmdlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IHN0YXJ0SGFzaCAtIFN0YXJ0IGRhdGVIYXNoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZW5kSGFzaCAtIEVuZCBkYXRlSGFzaFxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHN0YXJ0ID0ge3llYXI6IDIwMTUsIG1vbnRoOiAyLCBkYXRlOiAzfSxcbiAgICAgKiAgICAgZW5kID0ge3llYXI6IDIwMTUsIG1vbnRoOiAzLCBkYXRlOiA2fTtcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIuYWRkUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICovXG4gICAgYWRkUmFuZ2U6IGZ1bmN0aW9uKHN0YXJ0SGFzaCwgZW5kSGFzaCkge1xuICAgICAgICBpZiAodGhpcy5faXNWYWxpZERhdGUoc3RhcnRIYXNoKSAmJiB0aGlzLl9pc1ZhbGlkRGF0ZShlbmRIYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5fcmFuZ2VzLnB1c2goW3N0YXJ0SGFzaCwgZW5kSGFzaF0pO1xuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZVJhbmdlcygpO1xuICAgICAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHJhbmdlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IHN0YXJ0SGFzaCAtIFN0YXJ0IGRhdGVIYXNoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZW5kSGFzaCAtIEVuZCBkYXRlSGFzaFxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHN0YXJ0ID0ge3llYXI6IDIwMTUsIG1vbnRoOiAyLCBkYXRlOiAzfSxcbiAgICAgKiAgICAgZW5kID0ge3llYXI6IDIwMTUsIG1vbnRoOiAzLCBkYXRlOiA2fTtcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIuYWRkUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICogZGF0ZXBpY2tlci5yZW1vdmVSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKi9cbiAgICByZW1vdmVSYW5nZTogZnVuY3Rpb24oc3RhcnRIYXNoLCBlbmRIYXNoKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSB0aGlzLl9yYW5nZXMsXG4gICAgICAgICAgICB0YXJnZXQgPSBbc3RhcnRIYXNoLCBlbmRIYXNoXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHJhbmdlcywgZnVuY3Rpb24ocmFuZ2UsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuY29tcGFyZUpTT04odGFyZ2V0LCByYW5nZSkpIHtcbiAgICAgICAgICAgICAgICByYW5nZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGFibGUgcmFuZ2VzXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fSByYW5nZXMgLSBUaGUgc2FtZSB3aXRoIHRoZSBzZWxlY3RhYmxlUmFuZ2VzIG9wdGlvbiB2YWx1ZXNcbiAgICAgKiBAc2luY2UgMS4zLjBcbiAgICAgKi9cbiAgICBzZXRSYW5nZXM6IGZ1bmN0aW9uKHJhbmdlcykge1xuICAgICAgICB0aGlzLl9yYW5nZXMgPSB0aGlzLl9maWx0ZXJWYWxpZFJhbmdlcyhyYW5nZXMpO1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwb3NpdGlvbi1sZWZ0LCB0b3Agb2YgY2FsZW5kYXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBwb3NpdGlvbi1sZWZ0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBwb3NpdGlvbi10b3BcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRYWTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fcG9zLFxuICAgICAgICAgICAgaXNOdW1iZXIgPSB0dWkudXRpbC5pc051bWJlcjtcblxuICAgICAgICBwb3MubGVmdCA9IGlzTnVtYmVyKHgpID8geCA6IHBvcy5sZWZ0O1xuICAgICAgICBwb3MudG9wID0gaXNOdW1iZXIoeSkgPyB5IDogcG9zLnRvcDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB6LWluZGV4IG9mIGNhbGVuZGFyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6SW5kZXggLSB6LWluZGV4IHZhbHVlXG4gICAgICogQHNpbmNlIDEuMS4xXG4gICAgICovXG4gICAgc2V0WkluZGV4OiBmdW5jdGlvbih6SW5kZXgpIHtcbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc051bWJlcih6SW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wb3MuekluZGV4ID0gekluZGV4O1xuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIG9wZW5lclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeXxzdHJpbmd9IG9wZW5lciAtIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKi9cbiAgICBhZGRPcGVuZXI6IGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gKHRoaXMudXNlVG91Y2hFdmVudCkgPyAndG91Y2hlbmQnIDogJ2NsaWNrJyxcbiAgICAgICAgICAgICRvcGVuZXIgPSAkKG9wZW5lcik7XG5cbiAgICAgICAgb3BlbmVyID0gJG9wZW5lclswXTtcbiAgICAgICAgaWYgKG9wZW5lciAmJiBpbkFycmF5KG9wZW5lciwgdGhpcy5fb3BlbmVycykgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vcGVuZXJzLnB1c2gob3BlbmVyKTtcbiAgICAgICAgICAgICRvcGVuZXIub24oZXZlbnRUeXBlLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tPcGVuZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBvcGVuZXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl8c3RyaW5nfSBvcGVuZXIgLSBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgcmVtb3ZlT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyICRvcGVuZXIgPSAkKG9wZW5lciksXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkoJG9wZW5lclswXSwgdGhpcy5fb3BlbmVycyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICRvcGVuZXIub2ZmKCdjbGljayB0b3VjaGVuZCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgICAgICAgICB0aGlzLl9vcGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3BlbiBjYWxlbmRhciB3aXRoIGFycmFuZ2luZyBwb3NpdGlvblxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc09wZW5lZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyh0aGlzLl9kYXRlLnllYXIsIHRoaXMuX2RhdGUubW9udGgsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LnNob3coKTtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dBbHdheXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRPbk1vdXNlZG93bkRvY3VtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciNvcGVuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVQaWNrZXIub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICogICAgIGFsZXJ0KCdvcGVuJyk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb3NlIGNhbGVuZGFyIHdpdGggdW5iaW5kaW5nIHNvbWUgZXZlbnRzXG4gICAgICogQGFwaVxuICAgICAqIEBleG1hcGxlXG4gICAgICogZGF0ZXBpY2tlci5jbG9zZSgpO1xuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQoKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xvc2UgZXZlbnQgLSBEYXRlUGlja2VyXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IERhdGVQaWNrZXIjY2xvc2VcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZVBpY2tlci5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICogICAgIGFsZXJ0KCdjbG9zZScpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnY2xvc2UnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGUtb2JqZWN0IG9mIGN1cnJlbnQgRGF0ZVBpY2tlciBpbnN0YW5jZS5cbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge2RhdGVIYXNofSAtIGRhdGVIYXNoIGhhdmluZyB5ZWFyLCBtb250aCBhbmQgZGF5LWluLW1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXREYXRlSGFzaCgpOyAvLyB7eWVhcjogMjAxNSwgbW9udGg6IDQsIGRhdGU6IDEzfVxuICAgICAqL1xuICAgIGdldERhdGVIYXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLmV4dGVuZCh7fSwgdGhpcy5fZGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB5ZWFyXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0geWVhclxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0WWVhcigpOyAvLyAyMDE1XG4gICAgICovXG4gICAgZ2V0WWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLnllYXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBtb250aFxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIG1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXRNb250aCgpOyAvLyA0XG4gICAgICovXG4gICAgZ2V0TW9udGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS5tb250aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGRheS1pbi1tb250aFxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGRheS1pbi1tb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0RGF5SW5Nb250aCgpOyAvLyAxM1xuICAgICAqL1xuICAgIGdldERheUluTW9udGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS5kYXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGF0ZSBmcm9tIHZhbHVlcyh5ZWFyLCBtb250aCwgZGF0ZSkgYW5kIHRoZW4gZmlyZSAndXBkYXRlJyBjdXN0b20gZXZlbnRcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbeWVhcl0gLSB5ZWFyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbbW9udGhdIC0gbW9udGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtkYXRlXSAtIGRheSBpbiBtb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKDIwMTQsIDEyLCAzKTsgLy8gMjAxNC0xMi0gMDNcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUobnVsbCwgMTEsIDIzKTsgLy8gMjAxNC0xMS0yM1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZSgnMjAxNScsICc1JywgMyk7IC8vIDIwMTUtMDUtMDNcbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSkge1xuICAgICAgICB2YXIgZGF0ZU9iaiA9IHRoaXMuX2RhdGUsXG4gICAgICAgICAgICBuZXdEYXRlT2JqID0ge307XG5cbiAgICAgICAgbmV3RGF0ZU9iai55ZWFyID0geWVhciB8fCBkYXRlT2JqLnllYXI7XG4gICAgICAgIG5ld0RhdGVPYmoubW9udGggPSBtb250aCB8fCBkYXRlT2JqLm1vbnRoO1xuICAgICAgICBuZXdEYXRlT2JqLmRhdGUgPSBkYXRlIHx8IGRhdGVPYmouZGF0ZTtcblxuICAgICAgICBpZiAodGhpcy5faXNTZWxlY3RhYmxlKG5ld0RhdGVPYmopKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5leHRlbmQoZGF0ZU9iaiwgbmV3RGF0ZU9iaik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KGRhdGVPYmoueWVhciwgZGF0ZU9iai5tb250aCwgZmFsc2UpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGUgZXZlbnRcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciN1cGRhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgndXBkYXRlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvciB1cGRhdGUgZGF0ZS1mb3JtXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbZm9ybV0gLSBkYXRlLWZvcm1hdFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneXl5eS1tbS1kZCcpO1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ21tLWRkLCB5eXl5Jyk7XG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneS9tL2QnKTtcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5eS9tbS9kZCcpO1xuICAgICAqL1xuICAgIHNldERhdGVGb3JtOiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIHRoaXMuX2RhdGVGb3JtID0gZm9ybSB8fCB0aGlzLl9kYXRlRm9ybTtcbiAgICAgICAgdGhpcy5fc2V0UmVnRXhwKCk7XG4gICAgICAgIHRoaXMuc2V0RGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgY2FsZW5kYXIgaXMgb3BlbmVkIG9yIG5vdFxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB0cnVlIGlmIG9wZW5lZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLmNsb3NlKCk7XG4gICAgICogZGF0ZXBpY2tlci5pc09wZW5lZCgpOyAvLyBmYWxzZVxuICAgICAqXG4gICAgICogZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICogZGF0ZXBpY2tlci5pc09wZW5lZCgpOyAvLyB0cnVlXG4gICAgICovXG4gICAgaXNPcGVuZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuXyR3cmFwcGVyRWxlbWVudC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtUaW1lUGlja2VyfSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciB0aW1lcGlja2VyID0gdGhpcy5nZXRUaW1lcGlja2VyKCk7XG4gICAgICovXG4gICAgZ2V0VGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aW1lUGlja2VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXQgZWxlbWVudCBvZiB0aGlzIGluc3RhbmNlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBlbGVtZW50IC0gaW5wdXQgZWxlbWVudFxuICAgICAqIEBzaW5jZSAxLjMuMFxuICAgICAqL1xuICAgIHNldEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRjdXJyZW50RWwgPSB0aGlzLl8kZWxlbWVudDtcbiAgICAgICAgdmFyICRuZXdFbCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCRjdXJyZW50RWxbMF0pIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlT3BlbmVyKCRjdXJyZW50RWwpO1xuICAgICAgICAgICAgdGhpcy5fdW5iaW5kS2V5ZG93bkV2ZW50KCRjdXJyZW50RWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRPcGVuZXIoJG5ld0VsKTtcbiAgICAgICAgdGhpcy5fYmluZEtleWRvd25FdmVudCgkbmV3RWwpO1xuICAgICAgICB0aGlzLl9zZXREYXRlRnJvbVN0cmluZygkbmV3RWwudmFsKCkpO1xuICAgICAgICB0aGlzLl8kZWxlbWVudCA9ICRuZXdFbDtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKERhdGVQaWNrZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgbmhuZW50IG9uIDE1LiA0LiAyOC4uXG4gKiBAZmlsZW92ZXJ2aWV3IFNwaW5ib3ggQ29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHR1aS51dGlsLFxuICAgIGluQXJyYXkgPSB1dGlsLmluQXJyYXk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAtIGNvbnRhaW5lciBvZiBzcGluYm94XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbl0gLSBvcHRpb24gZm9yIGluaXRpYWxpemF0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdFZhbHVlID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnN0ZXAgPSAxXSAtIGlmIHN0ZXAgPSAyLCB2YWx1ZSA6IDAgLT4gMiAtPiA0IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWF4ID0gOTAwNzE5OTI1NDc0MDk5MV0gLSBtYXggdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbiA9IC05MDA3MTk5MjU0NzQwOTkxXSAtIG1pbiB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24udXBCdG5UYWcgPSBidXR0b24gSFRNTF0gLSB1cCBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRvd25CdG5UYWcgPSBidXR0b24gSFRNTF0gLSBkb3duIGJ1dHRvbiBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtBcnJheX0gIFtvcHRpb24uZXhjbHVzaW9uID0gW11dIC0gdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIHRoaXMgaXMgWzEsM10sIDAgLT4gMiAtPiA0IC0+IDUgLT4uLi4uXG4gKi9cbnZhciBTcGluYm94ID0gdXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNwaW5ib3gucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihjb250YWluZXIsIG9wdGlvbikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRjb250YWluZXJFbGVtZW50ID0gJChjb250YWluZXIpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudCA9IHRoaXMuXyRjb250YWluZXJFbGVtZW50LmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJHVwQnV0dG9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRkb3duQnV0dG9uID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2l0aCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gT3B0aW9uIGZvciBJbml0aWFsaXphdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9zZXRPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fYXNzaWduSFRNTEVsZW1lbnRzKCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLl9vcHRpb24uZGVmYXVsdFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgb3B0aW9uIHRvIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiB0aGF0IHlvdSB3YW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0ge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgIG1heDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MSxcbiAgICAgICAgICAgIG1pbjogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgfHwgLTkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICB1cEJ0blRhZzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiPjxiPis8L2I+PC9idXR0b24+JyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4tPC9iPjwvYnV0dG9uPidcbiAgICAgICAgfTtcbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuXG4gICAgICAgIGlmICghdXRpbC5pc0FycmF5KHRoaXMuX29wdGlvbi5leGNsdXNpb24pKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24uZXhjbHVzaW9uID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRPcHRpb24oKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGluYm94IG9wdGlvbiBpcyBpbnZhaWxkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBvcHRpb24/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuXG4gICAgICAgIHJldHVybiAodGhpcy5faXNWYWxpZFZhbHVlKG9wdC5kZWZhdWx0VmFsdWUpICYmIHRoaXMuX2lzVmFsaWRTdGVwKG9wdC5zdGVwKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgdmFsdWU/XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIGZvciBzcGluYm94XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIG9wdCxcbiAgICAgICAgICAgIGlzQmV0d2VlbixcbiAgICAgICAgICAgIGlzTm90SW5BcnJheTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBvcHQgPSB0aGlzLl9vcHRpb247XG4gICAgICAgIGlzQmV0d2VlbiA9IHZhbHVlIDw9IG9wdC5tYXggJiYgdmFsdWUgPj0gb3B0Lm1pbjtcbiAgICAgICAgaXNOb3RJbkFycmF5ID0gKGluQXJyYXkodmFsdWUsIG9wdC5leGNsdXNpb24pID09PSAtMSk7XG5cbiAgICAgICAgcmV0dXJuIChpc0JldHdlZW4gJiYgaXNOb3RJbkFycmF5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBzdGVwP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94IHVwL2Rvd25cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdmFyIG1heFN0ZXAgPSAodGhpcy5fb3B0aW9uLm1heCAtIHRoaXMuX29wdGlvbi5taW4pO1xuXG4gICAgICAgIHJldHVybiAodXRpbC5pc051bWJlcihzdGVwKSAmJiBzdGVwIDwgbWF4U3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBlbGVtZW50cyB0byBpbnNpZGUgb2YgY29udGFpbmVyLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkhUTUxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldElucHV0U2l6ZUFuZE1heExlbmd0aCgpO1xuICAgICAgICB0aGlzLl9tYWtlQnV0dG9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdXAvZG93biBidXR0b25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICAkdXBCdG4gPSB0aGlzLl8kdXBCdXR0b24gPSAkKHRoaXMuX29wdGlvbi51cEJ0blRhZyksXG4gICAgICAgICAgICAkZG93bkJ0biA9IHRoaXMuXyRkb3duQnV0dG9uID0gJCh0aGlzLl9vcHRpb24uZG93bkJ0blRhZyk7XG5cbiAgICAgICAgJHVwQnRuLmluc2VydEJlZm9yZSgkaW5wdXQpO1xuICAgICAgICAkdXBCdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICAgICAgJGRvd25CdG4uaW5zZXJ0QWZ0ZXIoJGlucHV0KTtcbiAgICAgICAgJGRvd25CdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNpemUvbWF4bGVuZ3RoIGF0dHJpYnV0ZXMgb2YgaW5wdXQgZWxlbWVudC5cbiAgICAgKiBEZWZhdWx0IHZhbHVlIGlzIGEgZGlnaXRzIG9mIGEgbG9uZ2VyIHZhbHVlIG9mIG9wdGlvbi5taW4gb3Igb3B0aW9uLm1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldElucHV0U2l6ZUFuZE1heExlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgbWluVmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1pbikubGVuZ3RoLFxuICAgICAgICAgICAgbWF4VmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1heCkubGVuZ3RoLFxuICAgICAgICAgICAgbWF4bGVuZ3RoID0gTWF0aC5tYXgobWluVmFsdWVMZW5ndGgsIG1heFZhbHVlTGVuZ3RoKTtcblxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdzaXplJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdzaXplJywgbWF4bGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnKSkge1xuICAgICAgICAgICAgJGlucHV0LmF0dHIoJ21heGxlbmd0aCcsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXNzaWduIGRlZmF1bHQgZXZlbnRzIHRvIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvbkNsaWNrID0gdXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tCdXR0b24sIHRoaXMpLFxuICAgICAgICAgICAgb25LZXlEb3duID0gdXRpbC5iaW5kKHRoaXMuX29uS2V5RG93bklucHV0RWxlbWVudCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fJHVwQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IGZhbHNlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRkb3duQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IHRydWV9LCBvbkNsaWNrKTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC5vbigna2V5ZG93bicsIG9uS2V5RG93bik7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZUlucHV0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbnB1dCB2YWx1ZSB3aGVuIHVzZXIgY2xpY2sgYSBidXR0b24uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0Rvd24gLSBJZiBhIHVzZXIgY2xpY2tlZCBhIGRvd24tYnV0dHRvbiwgdGhpcyB2YWx1ZSBpcyB0cnVlLiAgRWxzZSBpZiBhIHVzZXIgY2xpY2tlZCBhIHVwLWJ1dHRvbiwgdGhpcyB2YWx1ZSBpcyBmYWxzZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXROZXh0VmFsdWU6IGZ1bmN0aW9uKGlzRG93bikge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uLFxuICAgICAgICAgICAgc3RlcCA9IG9wdC5zdGVwLFxuICAgICAgICAgICAgbWluID0gb3B0Lm1pbixcbiAgICAgICAgICAgIG1heCA9IG9wdC5tYXgsXG4gICAgICAgICAgICBleGNsdXNpb24gPSBvcHQuZXhjbHVzaW9uLFxuICAgICAgICAgICAgbmV4dFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG4gICAgICAgIGlmIChpc0Rvd24pIHtcbiAgICAgICAgICAgIHN0ZXAgPSAtc3RlcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIG5leHRWYWx1ZSArPSBzdGVwO1xuICAgICAgICAgICAgaWYgKG5leHRWYWx1ZSA+IG1heCkge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1pbjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dFZhbHVlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgbmV4dFZhbHVlID0gbWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChpbkFycmF5KG5leHRWYWx1ZSwgZXhjbHVzaW9uKSA+IC0xKTtcblxuICAgICAgICB0aGlzLnNldFZhbHVlKG5leHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShVcC9Eb3duIGJ1dHRvbikgQ2xpY2sgRXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tCdXR0b246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX3NldE5leHRWYWx1ZShldmVudC5kYXRhLmlzRG93bik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShJbnB1dCBlbGVtZW50KSBLZXlkb3duIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleURvd25JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBrZXlDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZSxcbiAgICAgICAgICAgIGlzRG93bjtcbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM4OiBpc0Rvd24gPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQwOiBpc0Rvd24gPSB0cnVlOyBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldE5leHRWYWx1ZShpc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgQ2hhbmdlIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZUlucHV0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gTnVtYmVyKHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKCkpLFxuICAgICAgICAgICAgaXNDaGFuZ2UgPSB0aGlzLl9pc1ZhbGlkVmFsdWUobmV3VmFsdWUpICYmIHRoaXMuX3ZhbHVlICE9PSBuZXdWYWx1ZSxcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IChpc0NoYW5nZSkgPyBuZXdWYWx1ZSA6IHRoaXMuX3ZhbHVlO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50LnZhbChuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHNwaW5ib3hcbiAgICAgKi9cbiAgICBzZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZFN0ZXAoc3RlcCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vcHRpb24uc3RlcCA9IHN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIHNwaW5ib3hcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzdGVwXG4gICAgICovXG4gICAgZ2V0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24uc3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgaW5wdXQgdmFsdWUuXG4gICAgICogQHJldHVybnMge251bWJlcn0gRGF0YSBpbiBpbnB1dC1ib3hcbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgdmFsdWUgdG8gaW5wdXQtYm94LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgeW91IHdhbnRcbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC52YWwodmFsdWUpLmNoYW5nZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBvcHRpb24gb2YgaW5zdGFuY2UuXG4gICAgICogQHJldHVybnMge09iamVjdH0gT3B0aW9uIG9mIGluc3RhbmNlXG4gICAgICovXG4gICAgZ2V0T3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHZhbHVlIHRoYXQgd2lsbCBiZSBleGNsdWRlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICovXG4gICAgYWRkRXhjbHVzaW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgZXhjbHVzaW9uID0gdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbjtcblxuICAgICAgICBpZiAoaW5BcnJheSh2YWx1ZSwgZXhjbHVzaW9uKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVzaW9uLnB1c2godmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSB2YWx1ZSB3aGljaCB3YXMgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSBhIGV4Y2x1c2lvbiBsaXN0IG9mIGluc3RhbmNlXG4gICAgICovXG4gICAgcmVtb3ZlRXhjbHVzaW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgZXhjbHVzaW9uID0gdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbixcbiAgICAgICAgICAgIGluZGV4ID0gaW5BcnJheSh2YWx1ZSwgZXhjbHVzaW9uKTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVzaW9uLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgZ2V0Q29udGFpbmVyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyRWxlbWVudFswXTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGluYm94O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRpbWVQaWNrZXIgQ29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBzcGluYm94LmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHR1aS51dGlsLFxuICAgIFNwaW5ib3ggPSByZXF1aXJlKCcuL3NwaW5ib3gnKSxcbiAgICB0aW1lUmVnRXhwID0gL1xccyooXFxkezEsMn0pXFxzKjpcXHMqKFxcZHsxLDJ9KVxccyooW2FwXVttXSk/KD86W1xcc1xcU10qKS9pLFxuICAgIHRpbWVQaWNrZXJUYWcgPSAnPHRhYmxlIGNsYXNzPVwidGltZXBpY2tlclwiPjx0ciBjbGFzcz1cInRpbWVwaWNrZXItcm93XCI+PC90cj48L3RhYmxlPicsXG4gICAgY29sdW1uVGFnID0gJzx0ZCBjbGFzcz1cInRpbWVwaWNrZXItY29sdW1uXCI+PC90ZD4nLFxuICAgIHNwaW5Cb3hUYWcgPSAnPHRkIGNsYXNzPVwidGltZXBpY2tlci1jb2x1bW4gdGltZXBpY2tlci1zcGluYm94XCI+PGRpdj48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInRpbWVwaWNrZXItc3BpbmJveC1pbnB1dFwiPjwvZGl2PjwvdGQ+JyxcbiAgICB1cEJ0blRhZyA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbWVwaWNrZXItYnRuIHRpbWVwaWNrZXItYnRuLXVwXCI+PGI+KzwvYj48L2J1dHRvbj4nLFxuICAgIGRvd25CdG5UYWcgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0aW1lcGlja2VyLWJ0biB0aW1lcGlja2VyLWJ0bi1kb3duXCI+PGI+LTwvYj48L2J1dHRvbj4nO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRIb3VyID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWUgb2YgaG91clxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdE1pbnV0ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIG1pbnV0ZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbi5pbnB1dEVsZW1lbnQgPSBudWxsXSAtIG9wdGlvbmFsIGlucHV0IGVsZW1lbnQgd2l0aCB0aW1lcGlja2VyXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5ob3VyU3RlcCA9IDFdIC0gc3RlcCBvZiBob3VyIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBob3VyIHZhbHVlIDEgLT4gMyAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWludXRlU3RlcCA9IDFdIC0gc3RlcCBvZiBtaW51dGUgc3BpbmJveC4gaWYgc3RlcCA9IDIsIG1pbnV0ZSB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24uaG91ckV4Y2x1c2lvbiA9IG51bGxdIC0gaG91ciB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgaG91ciBbMSwzXSBpcyBleGNsdWRlZCwgaG91ciB2YWx1ZSAwIC0+IDIgLT4gNCAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbi5taW51dGVFeGNsdXNpb24gPSBudWxsXSAtIG1pbnV0ZSB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgbWludXRlIFsxLDNdIGlzIGV4Y2x1ZGVkLCBtaW51dGUgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93TWVyaWRpYW4gPSBmYWxzZV0gLSBpcyB0aW1lIGV4cHJlc3Npb24tXCJoaDptbSBBTS9QTVwiP1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ucG9zaXRpb24gPSB7fV0gLSBsZWZ0LCB0b3AgcG9zaXRpb24gb2YgdGltZXBpY2tlciBlbGVtZW50XG4gKi9cbnZhciBUaW1lUGlja2VyID0gdXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRpbWVQaWNrZXIucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3BpbmJveH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwaW5ib3h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGltZSBwaWNrZXIgZWxlbWVudCBzaG93IHVwP1xuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ob3VyID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX21ha2VTcGluYm94ZXMoKTtcbiAgICAgICAgdGhpcy5fbWFrZVRpbWVQaWNrZXJFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5mcm9tU3BpbmJveGVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRIb3VyOiAwLFxuICAgICAgICAgICAgZGVmYXVsdE1pbnV0ZTogMCxcbiAgICAgICAgICAgIGlucHV0RWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGhvdXJTdGVwOiAxLFxuICAgICAgICAgICAgbWludXRlU3RlcDogMSxcbiAgICAgICAgICAgIGhvdXJFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBtaW51dGVFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBzaG93TWVyaWRpYW46IGZhbHNlLFxuICAgICAgICAgICAgcG9zaXRpb246IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtYWtlIHNwaW5ib3hlcyAoaG91ciAmIG1pbnV0ZSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveCA9IG5ldyBTcGluYm94KHNwaW5Cb3hUYWcsIHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogb3B0LmRlZmF1bHRIb3VyLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAyMyxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5ob3VyU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5ob3VyRXhjbHVzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3ggPSBuZXcgU3BpbmJveChzcGluQm94VGFnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG9wdC5kZWZhdWx0TWludXRlLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiA1OSxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5taW51dGVTdGVwLFxuICAgICAgICAgICAgdXBCdG5UYWc6IHVwQnRuVGFnLFxuICAgICAgICAgICAgZG93bkJ0blRhZzogZG93bkJ0blRhZyxcbiAgICAgICAgICAgIGV4Y2x1c2lvbjogb3B0Lm1pbnV0ZUV4Y2x1c2lvblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbWFrZSB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaW1lUGlja2VyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb24sXG4gICAgICAgICAgICAkdHAgPSAkKHRpbWVQaWNrZXJUYWcpLFxuICAgICAgICAgICAgJHRwUm93ID0gJHRwLmZpbmQoJy50aW1lcGlja2VyLXJvdycpLFxuICAgICAgICAgICAgJG1lcmlkaWFuLFxuICAgICAgICAgICAgJGNvbG9uID0gJChjb2x1bW5UYWcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xvbicpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnOicpO1xuXG5cbiAgICAgICAgJHRwUm93LmFwcGVuZCh0aGlzLl9ob3VyU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCksICRjb2xvbiwgdGhpcy5fbWludXRlU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCkpO1xuXG4gICAgICAgIGlmIChvcHQuc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICAkbWVyaWRpYW4gPSAkKGNvbHVtblRhZylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ21lcmlkaWFuJylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKHRoaXMuX2lzUE0gPyAnUE0nIDogJ0FNJyk7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50ID0gJG1lcmlkaWFuO1xuICAgICAgICAgICAgJHRwUm93LmFwcGVuZCgkbWVyaWRpYW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRwLmhpZGUoKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCgkdHApO1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9ICR0cDtcblxuICAgICAgICBpZiAob3B0LmlucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgJHRwLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICAgICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSAkKG9wdC5pbnB1dEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFBvc2l0aW9uKHRoaXMuXyRpbnB1dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkaW5wdXQganF1ZXJ5LW9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKCRpbnB1dCkge1xuICAgICAgICB2YXIgaW5wdXRFbCA9ICRpbnB1dFswXSxcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uLFxuICAgICAgICAgICAgeCA9IHBvc2l0aW9uLngsXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHggPSBpbnB1dEVsLm9mZnNldExlZnQ7XG4gICAgICAgICAgICB5ID0gaW5wdXRFbC5vZmZzZXRUb3AgKyBpbnB1dEVsLm9mZnNldEhlaWdodCArIDM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRYWVBvc2l0aW9uKHgsIHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhc3NpZ24gZGVmYXVsdCBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25EZWZhdWx0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKCRpbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzVG9JbnB1dEVsZW1lbnQoKTtcbiAgICAgICAgICAgIHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRpbnB1dC52YWwodGhpcy5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZVRpbWVQaWNrZXIsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXR0YWNoIGV2ZW50IHRvIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25FdmVudHNUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9wZW4oZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KCkpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHNlbGYuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRvbSBldmVudCBoYW5kbGVyICh0aW1lcGlja2VyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlVGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZnJvbVNwaW5ib3hlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBjbGlja2VkIGluc2lkZSBvZiBjb250YWluZXI/XG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ2xpY2tlZEluc2lkZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50WzBdLCBldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNJbnB1dEVsZW1lbnQgPSAodGhpcy5fJGlucHV0RWxlbWVudCAmJiB0aGlzLl8kaW5wdXRFbGVtZW50WzBdID09PSBldmVudC50YXJnZXQpO1xuXG4gICAgICAgIHJldHVybiBpc0NvbnRhaW5zIHx8IGlzSW5wdXRFbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB0cmFuc2Zvcm0gdGltZSBpbnRvIGZvcm1hdHRlZCBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aW1lIHN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1Ub1RpbWVGb3JtYXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXIsXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGUsXG4gICAgICAgICAgICBwb3N0Zml4ID0gdGhpcy5fZ2V0UG9zdGZpeCgpLFxuICAgICAgICAgICAgZm9ybWF0dGVkSG91cixcbiAgICAgICAgICAgIGZvcm1hdHRlZE1pbnV0ZTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgaG91ciAlPSAxMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdHRlZEhvdXIgPSAoaG91ciA8IDEwKSA/ICcwJyArIGhvdXIgOiBob3VyO1xuICAgICAgICBmb3JtYXR0ZWRNaW51dGUgPSAobWludXRlIDwgMTApID8gJzAnICsgbWludXRlIDogbWludXRlO1xuICAgICAgICByZXR1cm4gZm9ybWF0dGVkSG91ciArICc6JyArIGZvcm1hdHRlZE1pbnV0ZSArIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgYm9vbGVhbiB2YWx1ZSAnaXNQTScgd2hlbiBBTS9QTSBvcHRpb24gaXMgdHJ1ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJc1BNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNQTSA9ICh0aGlzLl9ob3VyID4gMTEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgcG9zdGZpeCB3aGVuIEFNL1BNIG9wdGlvbiBpcyB0cnVlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBvc3RmaXggKEFNL1BNKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBvc3RmaXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zdGZpeCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICBwb3N0Zml4ID0gKHRoaXMuX2lzUE0pID8gJyBQTScgOiAnIEFNJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zdGZpeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHBvc2l0aW9uIG9mIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gaXQgd2lsbCBiZSBvZmZzZXRMZWZ0IG9mIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGl0IHdpbGwgYmUgb2Zmc2V0VG9wIG9mIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRYWVBvc2l0aW9uOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uO1xuICAgICAgICBwb3NpdGlvbi54ID0geDtcbiAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmNzcyh7bGVmdDogeCwgdG9wOiB5fSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNob3cgdGltZSBwaWNrZXIgZWxlbWVudFxuICAgICAqL1xuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5zaG93KCk7XG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBoaWRlIHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuaGlkZSgpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIHNob3cgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2hvd24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIHV0aWwuYmluZCh0aGlzLmNsb3NlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcGVuIGV2ZW50IC0gVGltZVBpY2tlclxuICAgICAgICAgKiBAZXZlbnQgVGltZVBpY2tlciNvcGVuXG4gICAgICAgICAqIEBwYXJhbSB7KGpRdWVyeS5FdmVudHx1bmRlZmluZWQpfSAtIENsaWNrIHRoZSBpbnB1dCBlbGVtZW50XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ29wZW4nLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIGhpZGUgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5faXNTaG93biB8fCB0aGlzLl9pc0NsaWNrZWRJbnNpZGUoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vZmYoZXZlbnQpO1xuICAgICAgICB0aGlzLmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSGlkZSBldmVudCAtIFRpbWVwaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjY2xvc2VcbiAgICAgICAgICogQHBhcmFtIHsoalF1ZXJ5LkV2ZW50fHVuZGVmaW5lZCl9IC0gQ2xpY2sgdGhlIGRvY3VtZW50IChub3QgVGltZVBpY2tlcilcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnY2xvc2UnLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB2YWx1ZXMgaW4gc3BpbmJveGVzIGZyb20gdGltZVxuICAgICAqL1xuICAgIHRvU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlO1xuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnNldFZhbHVlKGhvdXIpO1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnNldFZhbHVlKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gc3BpbmJveGVzIHZhbHVlc1xuICAgICAqL1xuICAgIGZyb21TcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXJTcGluYm94LmdldFZhbHVlKCksXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFZhbHVlKCk7XG5cbiAgICAgICAgdGhpcy5zZXRUaW1lKGhvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gW2lucHV0RWxlbWVudF0ganF1ZXJ5IG9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRUaW1lRnJvbUlucHV0RWxlbWVudDogZnVuY3Rpb24oaW5wdXRFbGVtZW50KSB7XG4gICAgICAgIHZhciBpbnB1dCA9ICQoaW5wdXRFbGVtZW50KVswXSB8fCB0aGlzLl8kaW5wdXRFbGVtZW50WzBdO1xuICAgICAgICByZXR1cm4gISEoaW5wdXQgJiYgdGhpcy5zZXRUaW1lRnJvbVN0cmluZyhpbnB1dC52YWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgaG91clxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldEhvdXI6IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCB0aGlzLl9taW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgbWludXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRNaW51dGU6IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKHRoaXMuX2hvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZTogZnVuY3Rpb24oaG91ciwgbWludXRlKSB7XG4gICAgICAgIHZhciBpc051bWJlciA9ICh1dGlsLmlzTnVtYmVyKGhvdXIpICYmIHV0aWwuaXNOdW1iZXIobWludXRlKSksXG4gICAgICAgICAgICBpc0NoYW5nZSA9ICh0aGlzLl9ob3VyICE9PSBob3VyIHx8IHRoaXMuX21pbnV0ZSAhPT0gbWludXRlKSxcbiAgICAgICAgICAgIGlzVmFsaWQgPSAoaG91ciA8IDI0ICYmIG1pbnV0ZSA8IDYwKTtcblxuICAgICAgICBpZiAoIWlzTnVtYmVyIHx8ICFpc0NoYW5nZSB8fCAhaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faG91ciA9IGhvdXI7XG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG1pbnV0ZTtcbiAgICAgICAgdGhpcy5fc2V0SXNQTSgpO1xuICAgICAgICB0aGlzLnRvU3BpbmJveGVzKCk7XG4gICAgICAgIGlmICh0aGlzLl8kbWVyaWRpYW5FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50Lmh0bWwodGhpcy5fZ2V0UG9zdGZpeCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGFuZ2UgZXZlbnQgLSBUaW1lUGlja2VyXG4gICAgICAgICAqIEBldmVudCBUaW1lUGlja2VyI2NoYW5nZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdjaGFuZ2UnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gdGltZS1zdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGltZVN0cmluZyB0aW1lLXN0cmluZ1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tU3RyaW5nOiBmdW5jdGlvbih0aW1lU3RyaW5nKSB7XG4gICAgICAgIHZhciBob3VyLFxuICAgICAgICAgICAgbWludXRlLFxuICAgICAgICAgICAgcG9zdGZpeCxcbiAgICAgICAgICAgIGlzUE07XG5cbiAgICAgICAgaWYgKHRpbWVSZWdFeHAudGVzdCh0aW1lU3RyaW5nKSkge1xuICAgICAgICAgICAgaG91ciA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgbWludXRlID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICBwb3N0Zml4ID0gUmVnRXhwLiQzLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChob3VyIDwgMjQgJiYgdGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgICAgIGlmIChwb3N0Zml4ID09PSAnUE0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zdGZpeCA9PT0gJ0FNJykge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRoaXMuX2lzUE07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzUE0pIHtcbiAgICAgICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBob3VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgc2V0SG91clN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmhvdXJTdGVwID0gdGhpcy5faG91clNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRNaW51dGVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXAgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgc3BlY2lmaWMgaG91ciB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZEhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guYWRkRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBtaW51dGUgdG8gZXhjbHVkZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZE1pbnV0ZUV4Y2x1c2lvbjogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guYWRkRXhjbHVzaW9uKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldEhvdXJTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbi5ob3VyU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBob3VyIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciB0aGF0IHlvdSB3YW50IHRvIHJlbW92ZVxuICAgICAqL1xuICAgIHJlbW92ZUhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3gucmVtb3ZlRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgbWludXRlIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5yZW1vdmVFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyXG4gICAgICovXG4gICAgZ2V0SG91cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob3VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlXG4gICAgICovXG4gICAgZ2V0TWludXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21pbnV0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHRpbWVcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge3N0cmluZ30gJ2hoOm1tIChBTS9QTSknXG4gICAgICovXG4gICAgZ2V0VGltZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JtVG9UaW1lRm9ybWF0KCk7XG4gICAgfVxufSk7XG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVGltZVBpY2tlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZVBpY2tlcjtcblxuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxzIGZvciBjYWxlbmRhciBjb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIE5ldC4gRkUgZGV2IHRlYW0uIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBuZS1jb2RlLXNuaXBwZXQgfjEuMC4yXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxzIG9mIGNhbGVuZGFyXG4gKiBAbmFtZXNwYWNlIHV0aWxzXG4gKi9cbnZhciB1dGlscyA9IHtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGF0ZSBoYXNoIGJ5IHBhcmFtZXRlci5cbiAgICAgKiAgaWYgdGhlcmUgYXJlIDMgcGFyYW1ldGVyLCB0aGUgcGFyYW1ldGVyIGlzIGNvcmduaXplZCBEYXRlIG9iamVjdFxuICAgICAqICBpZiB0aGVyZSBhcmUgbm8gcGFyYW1ldGVyLCByZXR1cm4gdG9kYXkncyBoYXNoIGRhdGVcbiAgICAgKiBAZnVuY3Rpb24gZ2V0RGF0ZUhhc2hUYWJsZVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBwYXJhbSB7RGF0ZXxudW1iZXJ9IFt5ZWFyXSBBIGRhdGUgaW5zdGFuY2Ugb3IgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbW9udGhdIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2RhdGVdIEEgZGF0ZVxuICAgICAqIEByZXR1cm5zIHt7eWVhcjogKiwgbW9udGg6ICosIGRhdGU6ICp9fSBcbiAgICAgKi9cbiAgICBnZXREYXRlSGFzaFRhYmxlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSkge1xuICAgICAgICB2YXIgbkRhdGU7XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICBuRGF0ZSA9IGFyZ3VtZW50c1swXSB8fCBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICB5ZWFyID0gbkRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIG1vbnRoID0gbkRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBkYXRlID0gbkRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHllYXI6IHllYXIsXG4gICAgICAgICAgICBtb250aDogbW9udGgsXG4gICAgICAgICAgICBkYXRlOiBkYXRlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0b2RheSB0aGF0IHNhdmVkIG9uIGNvbXBvbmVudCBvciBjcmVhdGUgbmV3IGRhdGUuXG4gICAgICogQGZ1bmN0aW9uIGdldFRvZGF5XG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19XG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICovXG4gICAgZ2V0VG9kYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaFRhYmxlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3ZWVrcyBjb3VudCBieSBwYXJhbWVudGVyXG4gICAgICogQGZ1bmN0aW9uIGdldFdlZWtzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgbW9udGhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IOyjvCAoNH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRXZWVrczogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgdmFyIGZpcnN0RGF5ID0gdXRpbHMuZ2V0Rmlyc3REYXkoeWVhciwgbW9udGgpLFxuICAgICAgICAgICAgbGFzdERhdGUgPSB1dGlscy5nZXRMYXN0RGF0ZSh5ZWFyLCBtb250aCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCgoZmlyc3REYXkgKyBsYXN0RGF0ZSkgLyA3KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHVuaXggdGltZSBmcm9tIGRhdGUgaGFzaFxuICAgICAqIEBmdW5jdGlvbiBnZXRUaW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS55ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLm1vbnRoIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5kYXRlIEEgZGF0ZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB1dGlscy5nZXRUaW1lKHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTsgLy8gMTI3MzU5MDAwMDAwMFxuICAgICAqKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlT2JqZWN0KGRhdGUpLmdldFRpbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoaWNoIGRheSBpcyBmaXJzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0Rmlyc3REYXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDB+NilcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0Rmlyc3REYXk6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpLmdldERheSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGxhc3QgYnkgcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgeWVhciBhbmQgbW9udGggaW5mb3JtYXRpb24uXG4gICAgICogQGZ1bmN0aW9uIGdldExhc3REYXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDB+NilcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0TGFzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxhc3QgZGF0ZSBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDF+MzEpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldExhc3REYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGUgaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIGdldERhdGVPYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZSBBIGRhdGUgaGFzaFxuICAgICAqIEByZXR1cm4ge0RhdGV9IERhdGUgIFxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBleGFtcGxlXG4gICAgICogIHV0aWxzLmdldERhdGVPYmplY3Qoe3llYXI6MjAxMCwgbW9udGg6NSwgZGF0ZToxMn0pO1xuICAgICAqICB1dGlscy5nZXREYXRlT2JqZWN0KDIwMTAsIDUsIDEyKTsgLy95ZWFyLG1vbnRoLGRhdGVcbiAgICAgKiovXG4gICAgZ2V0RGF0ZU9iamVjdDogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdIC0gMSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoIC0gMSwgZGF0ZS5kYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbGF0ZWQgZGF0ZSBoYXNoIHdpdGggcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgZGF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0UmVsYXRpdmVEYXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSByZWxhdGVkIHZhbHVlIGZvciB5ZWFyKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSByZWxhdGVkIHZhbHVlIGZvciBtb250aCAoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlIEEgcmVsYXRlZCB2YWx1ZSBmb3IgZGF5ICh5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGVPYmogc3RhbmRhcmQgZGF0ZSBoYXNoXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBkYXRlT2JqIFxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBleGFtcGxlXG4gICAgICogIHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgxLCAwLCAwLCB7eWVhcjoyMDAwLCBtb250aDoxLCBkYXRlOjF9KTsgLy8ge3llYXI6MjAwMSwgbW9udGg6MSwgZGF0ZToxfVxuICAgICAqICB1dGlscy5nZXRSZWxhdGl2ZURhdGUoMCwgMCwgLTEsIHt5ZWFyOjIwMTAsIG1vbnRoOjEsIGRhdGU6MX0pOyAvLyB7eWVhcjoyMDA5LCBtb250aDoxMiwgZGF0ZTozMX1cbiAgICAgKiovXG4gICAgZ2V0UmVsYXRpdmVEYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSwgZGF0ZU9iaikge1xuICAgICAgICB2YXIgblllYXIgPSAoZGF0ZU9iai55ZWFyICsgeWVhciksXG4gICAgICAgICAgICBuTW9udGggPSAoZGF0ZU9iai5tb250aCArIG1vbnRoIC0gMSksXG4gICAgICAgICAgICBuRGF0ZSA9IChkYXRlT2JqLmRhdGUgKyBkYXRlKSxcbiAgICAgICAgICAgIG5EYXRlT2JqID0gbmV3IERhdGUoblllYXIsIG5Nb250aCwgbkRhdGUpO1xuXG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaFRhYmxlKG5EYXRlT2JqKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluYXJ5IHNlYXJjaFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGZpZWxkIC0gU2VhcmNoIGZpZWxkXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWUgLSBTZWFyY2ggdGFyZ2V0XG4gICAgICogQHJldHVybnMge3tmb3VuZDogYm9vbGVhbiwgaW5kZXg6IG51bWJlcn19IFJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2VhcmNoOiBmdW5jdGlvbihmaWVsZCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2UsXG4gICAgICAgICAgICBsb3cgPSAwLFxuICAgICAgICAgICAgaGlnaCA9IGZpZWxkLmxlbmd0aCAtIDEsXG4gICAgICAgICAgICBlbmQsIGluZGV4LCBmaWVsZFZhbHVlO1xuXG4gICAgICAgIHdoaWxlICghZm91bmQgJiYgIWVuZCkge1xuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkW2luZGV4XTtcblxuICAgICAgICAgICAgaWYgKGZpZWxkVmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWVsZFZhbHVlIDwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBsb3cgPSBpbmRleCArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBpbmRleCAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSAobG93ID4gaGlnaCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZm91bmQ6IGZvdW5kLFxuICAgICAgICAgICAgaW5kZXg6IChmb3VuZCB8fCBmaWVsZFZhbHVlID4gdmFsdWUpID8gaW5kZXggOiBpbmRleCArIDFcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iXX0=
