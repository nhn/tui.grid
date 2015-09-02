/**
 * @fileoverview RowList 클래스파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Collection = require('../base/collection');
var Row = require('./row');

/**
  * View Model rowList collection
  * @constructor Model.RowList
  */
var RowList = Collection.extend(/**@lends Model.RowList.prototype */{
    model: Row,
    /**
     * 생성자 함수
     */
    initialize: function() {
        Collection.prototype.initialize.apply(this, arguments);
    }
});

module.exports = RowList;
