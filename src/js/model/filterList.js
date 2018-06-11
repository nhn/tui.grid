/**
 * @fileoverview FilerList
 * @author Sohee Lee
 */

'use strict';

var _ = require('underscore');

var Collection = require('../base/collection');
var Filter = require('./filter');

/**
 * Filter를 모델로 갖고 있는 FilterList 콜렉션
 * @module model/filterList
 * @extends module:base/collection
 * @param {Array} models - 콜랙션에 추가할 model 리스트
 * @param {Object} options - 생성자의 option 객체
 * @ignore
 */
var FilterList = Collection.extend({
    initialize: function(filterData, options) {
        Collection.prototype.initialize.apply(this, arguments);
        _.assign(this, {
            columnModel: options.columnModel,
            dataModel: options.dataModel
        });
        this.workingFilter = [];
        this.listenTo(this.dataModel, 'reset', this._onDataModelReset)
            .listenTo(this.dataModel, 'change', this._onDataModelChange)
            .listenTo(this.dataModel, 'add', this._onDataModelAdd)
            .listenTo(this.dataModel, 'remove', this._onDataModelRemove);
        this.on('change:filterCondition', this._OnChange);
    },

    model: Filter,

    /**
     * 컬럼 이름에 해당하는 필터를 찾는다.
     * @param {String} columnName 찾고자 하는 필터 컬럼의 이름
     * @returns {Object} 필터 모델
     */
    getFilter: function(columnName) {
        return this.where({name: columnName})[0];
    },

    /**
     * DataModel이 리셋되었다는 이벤트를 받았을 때 FilterList도 데이터를 리셋한다.
     * @private
     */
    _onDataModelReset: function() {
        var filters = [];
        _.each(this.columnModel.get('columnModelMap'), function(col) {
            if (col.filterOptions) {
                filters.push(col);
            }
        }, this);
        this.reset(filters);
    },

    /**
     * 전달받은 데이터에 필터들을 적용하였을 때의 결과를 리턴한다.
     * @private
     * @param {Object} data Row 모델 데이터
     * @param {Object} filterIDs 적용할 필터들의 ID값
     * @returns {Boolean} 필터를 적용한 결과
     */
    _applyFilter: function(data, filterIDs) {
        var filterResult = true;
        var filter;
        _.each(filterIDs, function(filterID) {
            filter = this.get(filterID);
            filterResult = filterResult && filter.applyToData(data);
        }, this);

        return filterResult;
    },

    /**
     * 특정 필터가 적용되었을 때 나머지 적용중인 필터들도 변경해주는 것
     * @private
     * @param {Object} changedfilter Filter 모델
     */
    _updateWorkingFilter: function(changedfilter) {
        var index = this.workingFilter.indexOf(changedfilter.cid);
        var front, rear, length;
        if (index > -1) {
            length = this.workingFilter.length;
            front = this.workingFilter.slice(0, index + 1);
            rear = this.workingFilter.slice(index + 1, length);
            if (!changedfilter.isFiltering()) {
                front.pop();
            }
            if (rear.length) {
                if (front.length) {
                    this.dataModel.each(function(data) {
                        data.filter = !this._applyFilter(data, front);
                    }, this);
                } else {
                    this.dataModel.each(function(data) {
                        data.filter = false;
                    }, this);
                }
                _.each(rear, function(id) {
                    var unFilterRows = this.dataModel.filter(function(data) {
                        return !data.filter;
                    }, this);
                    var filter = this.get(id);
                    filter.rebase(unFilterRows);
                }, this);
            }
            this.workingFilter = front.concat(rear);
        } else {
            this.workingFilter.push(changedfilter.cid);
        }
    },

    /**
     * Row 데이터의 filter값을 작동중인 필터들을 적용한 값으로 변경해준다.
     * @private
     */
    _updateRowFilter: function() {
        this.dataModel.each(function(data) {
            // Row의 filter가 true이면 필터링되어져서 안보이게 되는 것 (Filter에서는 필터 조건(원하는 데이터 조건)과 부합하면 true를 리턴한다.)
            data.filter = !this._applyFilter(data, this.workingFilter);
        }, this);
    },

    /**
     * 특정 필터가 변경되었을 때 이벤트를 받아서 다른 필터들의 내용도 update하고 Row데이터의 filter값도 변경한다.
     * @private
     * @param {Object} filter Filter 모델
     */
    _OnChange: function(filter) {
        this._updateWorkingFilter(filter);
        this._updateRowFilter();
        this.each(function(otherFilter) {
            var unFilterRows;
            if (otherFilter.cid !== filter.cid && !otherFilter.isFiltering()) {
                unFilterRows = this.dataModel.filter(function(data) {
                    return !data.filter;
                }, this);
                otherFilter.update(unFilterRows);
            }
        }, this);
    },

    /**
     * row 데이터의 변경이 일어났을 때 필터정보도 변경한다.
     * @private
     * @param {Object} ev 변경된 Row 모델
     */
    _onDataModelChange: function(ev) {
        this.each(function(filter) {
            var oldData = ev.previousAttributes();
            if (ev.changed[filter.name]) {
                filter.change(oldData[filter.name], ev.changed[filter.name]);
            }
        }, this);
    },

    /**
     * row 데이터가 추가되었을 때 필터정보도 변경한다.
     * @private
     * @param {Object} modelList 추가된 Row 모델 리스트
     */
    _onDataModelAdd: function(modelList) {
        this.each(function(filter) {
            _.each(modelList, function(newData) {
                filter.change(null, newData.get(filter.name));
            }, this);
        }, this);
    },

    /**
     * row 데이터가 삭제되었을 때 필터정보도 변경한다.
     * @private
     * @param {Object} rowKey 삭제된 Row 모델 키
     * @param {Object} index 삭제된 Row 모델 인텍스
     * @param {Object} row 삭제된 Row 모델
     */
    _onDataModelRemove: function(rowKey, index, row) {
        this.each(function(filter) {
            filter.change(row.get(filter.name), null);
        }, this);
    }
});

module.exports = FilterList;
