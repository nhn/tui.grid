/**
 * @fileoverview Filter Model
 * @author Sohee Lee
 */

'use strict';

var Model = require('../base/model');
var TextCondition = require('./textCondition');
var NumberCondition = require('./numberConditon');

/**
 * Filter를 모델로 갖고 있는 FilterList 콜렉션
 * @module model/filter
 * @extends module:base/model
 * @ignore
 */
var Filter = Model.extend({
    initialize: function(attribute) {
        var rows;
        Model.prototype.initialize.apply(this, arguments);
        this.name = attribute.name;
        this.type = attribute.filterOptions.type;
        this.editOptions = attribute.editOptions;

        if (this.type === 'text') {
            rows = this.collection.dataModel.filter(function() {
                return true;
            }, this);
            this.condition = new TextCondition({
                name: this.name,
                dataModel: rows
            });
        } else if (this.type === 'number') {
            this.condition = new NumberCondition({
                name: this.name
            });
        }

        this.listenTo(this.condition, 'change', this._onChangeCondition);
    },

    defaults: {
        type: null,
        condition: null
    },

    /**
     * 필터가 갖고 있는 조건 정보 모델 Condition의 내용을 리턴한다.
     * @returns {Object} 필터의 조건 정보
     */
    getContent: function() {
        return this.condition.getContent();
    },

    /**
     * 필터가 갖고 있는 조건 정보 모델 Condition의 내용을 설정한다.
     * @param {Object} content 필터의 조건 정보
     */
    setContent: function(content) {
        this.condition.setContent(content);
    },

    /**
     * 전달받은 rows의 정보를 토대로 filter의 조건 정보를 새롭게 update한다.
     * @param {Object} rows Row 데이터들
     */
    update: function(rows) {
        this.condition.update(rows);
    },

    /**
     * 전달받은 rows의 정보를 토대로 filter의 조건 정보를 update를 하는데, 기존 필터의 적용 여부 상태는 유지한다.
     * @param {Object} rows Row 데이터들
     */
    rebase: function(rows) {
        this.condition.rebase(rows);
    },

    /**
     * 변경되는 row의 정보를 토데로 filter의 조건을 변경한다.
     * @param {Object} oldData 이전 row 데이터
     * @param {Object} newData 새로운 row 데이터
     */
    change: function(oldData, newData) {
        this.condition.change(oldData, newData);
    },

    /**
     * 필터가 현재 작동중인지 확인하다.
     * @returns {Boolean} 현재 필터가 작동 중인지를 반환하다.
     */
    isFiltering: function() {
        return this.condition.isFiltering();
    },

    /**
     * 전달 받은 데이터에 필터를 적용해보고 결과를 반환한다.
     * @param {Object} data 적용해볼 row 데이터
     * @returns {Boolean} true이면 필터 조건에 부합 / false이면 부합하지 않음
     */
    applyToData: function(data) {
        var column = data.get(this.name);
        return this.condition.filter(column);
    },

    /**
     * 필터의 조건 내용이 변경되었음을 감지하여 알린다. 다른필터들의 조건내용을 변경하기 위함.
     */
    _onChangeCondition: function() {
        this.trigger('change:filterCondition', this);
    }

});

module.exports = Filter;
