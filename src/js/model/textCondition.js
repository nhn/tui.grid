/**
 * @fileoverview Text Conditon Model
 * @author Sohee Lee
 */

'use strict';

var _ = require('underscore');

var Model = require('../base/model');
var Condition = require('./condition');

/**
 * Text를 동등조건으로 비교하기 위한 Condition
 * @module model/TextCondition
 * @extends module:model/condition
 * @ignore
 */
var TextCondition = Condition.extend({
    initialize: function(attribute) {
        Model.prototype.initialize.apply(this, arguments);
        this.name = attribute.name;
        this.dataModel = attribute.dataModel;
        this.update(this.dataModel);
    },

    defaults: {
        items: []
    },

    /**
     * 각 Text별로 filter 여부를 담고 있는 items를 리턴한다.
     * @returns {Object} 각 text의 filter 여부가 담긴 items
     */
    getContent: function() {
        return this.get('items');
    },

    /**
     * text별 조건 정보를 전달받아서 items에 설정한다.
     * @param {Object} items text별 조건 정보
     */
    setContent: function(items) {
        this.set('items', items);
    },

    /**
     * 전달받은 rows의 정보를 토대로 조건 정보(items)를 update한다.
     * @param {Object} rows Row 데이터들
     */
    update: function(rows) {
        var columnDatas = [];
        var colItems;
        _.each(rows, function(data) {
            columnDatas.push(data.get(this.name));
        }, this);
        colItems = _.uniq(columnDatas);
        this.set('items', this._createItems(colItems), {silent: true});
    },

    /**
     * 전달받은 rows의 정보를 토대로 조건 정보(items)를 update를 하는데, 기존의 상태는 유지한다.
     * @param {Object} rows Row 데이터들
     */
    rebase: function(rows) {
        var unCheckedFilter = this._getUnCheckedItem();
        var items;
        this.update(rows);
        items = this.get('items');
        _.each(items, function(item) {
            if (unCheckedFilter.indexOf(item.field) > -1) {
                item.checked = false;
            }
        });
        this.set('items', items);
    },

    /**
     * 변경되는 row의 정보를 토데로 조건을 변경한다.
     * @param {Object} oldData 이전 row 데이터
     * @param {Object} newData 새로운 row 데이터
     */
    change: function(oldData, newData) {
        var items = this.get('items');
        var targetItem;
        if (oldData) {
            targetItem = _.find(items, function(item) {
                return item.field === oldData;
            });
            if (newData) {
                // change
                targetItem.field = newData;
            } else {
                // remove
                targetItem = _.find(items, function(item) {
                    return item.field === oldData;
                });
                if (targetItem) {
                    items.slice(items.indexOf(targetItem), 1);
                    this.set('items', items);
                }
            }
        } else {
            // add
            targetItem = _.find(items, function(item) {
                return item.field === newData;
            });
            if (!targetItem) {
                items.push({
                    field: newData,
                    checked: true
                });
                this.set('items', items);
            }
        }
    },

    /**
     * 전달 받은 데이터를 조건에 부합해보고 결괄르 반환한다.
     * @param {Object} data 적용해볼 row 데이터
     * @returns {Boolean} true이면 조건에 부합 / false이면 부합하지 않음
     */
    filter: function(data) {
        var items = this.get('items');
        var filter = _.find(items, function(item) {
            return item.field === data;
        });

        return filter ? filter.checked : true;
    },

    /**
     * 필터가 현재 작동중인지 확인하다. All의 checked가 풀린거면 필터가 동작 중인것으로 간주.
     * @returns {Boolean} 현재 필터가 작동 중인지를 반환하다.
     */
    isFiltering: function() {
        var items = this.get('items');
        var all = _.find(items, function(item) {
            return item.field === 'All';
        });

        return !all.checked;
    },

    /**
     * Text 정보로 items를 새롭게 만든다.
     * @param {Object} colItems 새로 만들 text들 정보
     * @returns {Object} item 리스트
     */
    _createItems: function(colItems) {
        var items = [{
            field: 'All',
            checked: true
        }];
        _.each(colItems, function(col) {
            var item = {
                field: col,
                checked: true
            };
            items.push(item);
        }, this);

        return items;
    },

    /**
     * 현재 선택되지 않은 아이템을 반환한다.
     * @returns {Object} 선택되지 않은 item 리스트
     */
    _getUnCheckedItem: function() {
        var items = this.get('items');
        var unCheckedFilter = [];
        _.each(items, function(item) {
            if (!item.checked) {
                unCheckedFilter.push(item.field);
            }
        });

        return unCheckedFilter;
    }
});

module.exports = TextCondition;
