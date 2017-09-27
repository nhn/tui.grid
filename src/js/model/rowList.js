/**
 * @fileoverview RowList 클래스파일
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var Collection = require('../base/collection');
var Row = require('./row');

/**
  * View Model rowList collection
  * @module model/rowList
  * @extends module:base/collection
  * @param {Object} rawData - Raw data
  * @param {Object} options - Options
  * @ignore
  */
var RowList = Collection.extend(/** @lends module:model/rowList.prototype */{
    initialize: function(rawData, options) {
        _.assign(this, {
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            focusModel: options.focusModel
        });
    },

    model: Row
});

module.exports = RowList;
