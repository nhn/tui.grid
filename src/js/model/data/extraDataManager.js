/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module data/row
 * @param {Object} data - Data object
 * @extends module:base/model
 * @ignore
 */
var ExtraDataManager = snippet.defineClass(/** @lends module:model/data/extraData.prototype */{
    init: function(data) {
        this.data = data || {};
    },

    /**
     * Returns rowSpan data
     * @param  {string} columnName - column name
     * @param  {(number|string)} rowKey - rowKey
     * @param  {boolean} isRowSpanEnable - Boolean value whether row span is enable.
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}} rowSpan data
     */
    getRowSpanData: function(columnName, rowKey, isRowSpanEnable) {
        var rowSpanData = null;

        if (isRowSpanEnable) {
            rowSpanData = this.data.rowSpanData;
            if (columnName && rowSpanData) {
                rowSpanData = rowSpanData[columnName];
            }
        }

        if (!rowSpanData && columnName) {
            rowSpanData = {
                count: 0,
                isMainRow: true,
                mainRowKey: rowKey
            };
        }

        return rowSpanData;
    },

    /**
     * Returns the object that contains rowState info.
     * @returns {{disabled: boolean, disabledCheck: boolean, checked: boolean}} rowState 정보
     */
    getRowState: function() {
        var result = {
            disabledCheck: false,
            disabled: false,
            checked: false
        };

        switch (this.data.rowState) {
            case 'DISABLED':
                result.disabled = true;
                // intentional no break
            case 'DISABLED_CHECK': // eslint-disable-line no-fallthrough
                result.disabledCheck = true;
                break;
            case 'CHECKED':
                result.checked = true;
            default: // eslint-disable-line no-fallthrough
        }

        return result;
    },

    /**
     * Sets the rowSate.
     * @param {string} rowState - 'DISABLED' | 'DISABLED_CHECK' | 'CHECKED'
     */
    setRowState: function(rowState) {
        this.data.rowState = rowState;
    },

    /**
     * Sets the rowSpanData.
     * @param {string} columnName - Column name
     * @param {object} data - Data
     */
    setRowSpanData: function(columnName, data) {
        var rowSpanData = _.assign({}, this.data.rowSpanData);

        if (!columnName) {
            return;
        }
        if (!data) {
            if (rowSpanData[columnName]) {
                delete rowSpanData[columnName];
            }
        } else {
            rowSpanData[columnName] = data;
        }
        this.data.rowSpanData = rowSpanData;
    },

    /**
     * Adds className to the cell
     * @param {String} columnName - Column name
     * @param {String} className - Class name
     */
    addCellClassName: function(columnName, className) {
        var classNameData, classNameList;

        classNameData = this.data.className || {};
        classNameData.column = classNameData.column || {};
        classNameList = classNameData.column[columnName] || [];

        if (!_.contains(classNameList, className)) {
            classNameList.push(className);
            classNameData.column[columnName] = classNameList;
            this.data.className = classNameData;
        }
    },

    /**
     * Adds className to the row
     * @param {String} className - Class name
     */
    addClassName: function(className) {
        var classNameData, classNameList;

        classNameData = this.data.className || {};
        classNameList = classNameData.row || [];

        if (snippet.inArray(className, classNameList) === -1) {
            classNameList.push(className);
            classNameData.row = classNameList;
            this.data.className = classNameData;
        }
    },

    /**
     * Returns the list of className.
     * @param {String} [columnName] - If specified, the result will only conatins class names of cell.
     * @returns {Array} - The array of class names.
     */
    getClassNameList: function(columnName) {
        var classNameData = this.data.className,
            arrayPush = Array.prototype.push,
            classNameList = [];

        if (classNameData) {
            if (classNameData.row) {
                arrayPush.apply(classNameList, classNameData.row);
            }
            if (columnName && classNameData.column && classNameData.column[columnName]) {
                arrayPush.apply(classNameList, classNameData.column[columnName]);
            }
        }

        return classNameList;
    },

    /**
     * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
     * @param {Array} classNameList 디자인 클래스명 리스트
     * @param {String} className    제거할 클래스명
     * @returns {Array}  제거된 디자인 클래스명 리스트
     * @private
     */
    _removeClassNameFromArray: function(classNameList, className) {
        // 배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
        var singleNameList = classNameList.join(' ').split(' ');

        return _.without(singleNameList, className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        var classNameData = this.data.className;

        if (snippet.pick(classNameData, 'column', columnName)) {
            classNameData.column[columnName] =
                this._removeClassNameFromArray(classNameData.column[columnName], className);
            this.data.className = classNameData;
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        var classNameData = this.data.className;

        if (classNameData && classNameData.row) {
            classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
            this.className = classNameData;
        }
    },

    /**
     * Sets the height of the row
     * @param {number} value - value
     */
    setHeight: function(value) {
        this.data.height = value;
    },

    /**
     * Returns the height of the row
     * @returns {number}
     */
    getHeight: function() {
        return this.data.height;
    }
});

module.exports = ExtraDataManager;
