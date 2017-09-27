/**
 * @fileoverview Event class for public event of Grid
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var util = require('../common/util');
var attrNameConst = require('../common/constMap').attrName;
var targetTypeConst = {
    ROW_HEAD: 'rowHead',
    COLUMN_HEAD: 'columnHead',
    DUMMY: 'dummy',
    CELL: 'cell',
    ETC: 'etc'
};

/**
 * Event class for public event of Grid
 * @module event/gridEvent
 * @param {Object} data - Event data for handler
 */
var GridEvent = snippet.defineClass(/** @lends module:event/gridEvent.prototype */{
    init: function(nativeEvent, data) {
        this._stopped = false;
        if (nativeEvent) {
            this.nativeEvent = nativeEvent;
        }
        if (data) {
            this.setData(data);
        }
    },

    /**
     * Sets data
     * @param {Object} data - data
     * @ignore
     */
    setData: function(data) {
        _.extend(this, data);
    },

    /**
     * Stops propogation of this event.
     */
    stop: function() {
        this._stopped = true;
    },

    /**
     * Returns whether this event is stopped.
     * @returns {Boolean}
     * @ignore
     */
    isStopped: function() {
        return this._stopped;
    }
});

/**
 * Returns the information of event target
 * @param {jQuery} $target - event target
 * @returns {{targetType: string, rowKey: (number|string), columnName: string}}
 * @ignore
 */
GridEvent.getTargetInfo = function($target) {
    var $cell = $target.closest('td');
    var targetType = targetTypeConst.ETC;
    var rowKey, columnName;

    if ($cell.length === 1) {
        rowKey = $cell.attr(attrNameConst.ROW_KEY);
        columnName = $cell.attr(attrNameConst.COLUMN_NAME);

        if (rowKey && columnName) {
            if (util.isMetaColumn(columnName)) {
                targetType = targetTypeConst.ROW_HEAD;
            } else {
                targetType = targetTypeConst.CELL;
            }
        } else {
            targetType = targetTypeConst.DUMMY;
        }
    } else {
        $cell = $target.closest('th');

        if ($cell.length === 1) {
            columnName = $cell.attr(attrNameConst.COLUMN_NAME);
            targetType = targetTypeConst.COLUMN_HEAD;
        }
    }

    return util.pruneObject({
        targetType: targetType,
        rowKey: util.strToNumber(rowKey),
        columnName: columnName
    });
};

GridEvent.targetTypeConst = targetTypeConst;

module.exports = GridEvent;
