/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');

var META_COLUMN_LIST = ['_number', '_button'];
/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module data/columnModel
 */
var ColumnModel = Model.extend(/**@lends module:data/columnModel.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            'normal': true,
            'text': true,
            'text-password': true,
            'text-convertible': true
        };

        this._setColumnModelList(this.get('columnModelList'));
        this._setColumnFixCountFromColumnFixIndex();
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        columnFixCount: 0,
        columnModelList: [],
        visibleList: [],
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {}
    },

    /**
     * deprecated된 columnFixIndex를 columnFixCount로 변환하여 저장하기 위한 메서드
     * @private
     * @return {number} columnFixCount
     * @todo columnFixIndex가 완전 없어질때, 이 메서드도 지움
     */
    _setColumnFixCountFromColumnFixIndex: function() {
        var columnFixIndex = this.get('columnFixIndex'),
            columnFixCount = this.get('columnFixCount');

        if (!columnFixCount && columnFixIndex) {
            columnFixCount = columnFixIndex;

            _.each(META_COLUMN_LIST, function(columnName) {
                var columnModel = this.getColumnModel(columnName);

                if (!columnModel.isHidden) {
                    columnFixCount -= 1;
                }
            }, this);

            this.unset('columnFixIndex');
        }

        this.set( 'columnFixCount', Math.max(0, columnFixCount), {
            silent: true
        });
        this.trigger('columnModelChange');
    },

    /**
     * 인자로 넘어온 columnModelList 에 설정값에 맞게 number column 을 추가한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array}  _number 컬럼이 추가된 컬럼모델 배열
     * @private
     */
    _initializeNumberColumn: function(columnModelList) {
        var hasNumberColumn = this.get('hasNumberColumn'),
            numberColumn = {
                columnName: '_number',
                title: 'No.',
                width: 60
            };
        if (!hasNumberColumn) {
            numberColumn.isHidden = true;
        }

       this._extendColumnList(numberColumn, columnModelList);
    },

    /**
     * 인자로 넘어온 columnModelList 에 설정값에 맞게 button column 을 추가한다.
     * @param {Array} columnModelList 컬럼모델 배열
     * @return {Array} _button 컬럼이 추가된 컬럼모델 배열
     * @private
     */
    _initializeButtonColumn: function(columnModelList) {
        var selectType = this.get('selectType'),
            buttonColumn = {
                columnName: '_button',
                isHidden: false,
                editOption: {
                    type: selectType,
                    list: [{
                        value: 'selected'
                    }]
                },
                width: 50
            };

        if (selectType === 'checkbox') {
            buttonColumn.title = '<input type="checkbox"/>';
        } else if (selectType === 'radio') {
            buttonColumn.title = '선택';
        } else {
            buttonColumn.isHidden = true;
        }
        this._extendColumnList(buttonColumn, columnModelList);
    },

    /**
     * column을 추가(push)한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * - 메타 컬럼들은 리스트의 가장 앞에 순서대로 위치하도록 한다.
     * @param {object} columnObj 추가할 컬럼모델
     * @param {Array} columnModelList 컬럼모델 배열
     * @return {Array} 확장한 결과 컬럼모델 배열
     * @private
     */
    _extendColumnList: function(columnObj, columnModelList) {
        var columnName = columnObj.columnName,
            index = _.findIndex(columnModelList, {columnName: columnName});

        if (index === -1) {
            columnModelList.push(columnObj);
        } else {
            columnModelList[index] = $.extend(columnModelList[index], columnObj);
        }

        this._moveMetaColumnsToFirst(columnModelList);
    },

    /**
     * 메타 컬럼들은 리스트의 가장 앞에 순서대로 위치하도록 한다.
     * @param {Array} columnModelList 컬럼모델 배열
     * @private
     */
    _moveMetaColumnsToFirst: function(columnModelList) {
        _.each(META_COLUMN_LIST, function(metaColumnName, index) {
            var oldIndex = _.findIndex(columnModelList, {columnName: metaColumnName});

            if (oldIndex > -1 && oldIndex !== index) {
                columnModelList.splice(index, 0, columnModelList.splice(oldIndex, 1)[0]);
            }
        });
    },

    /**
     * index 에 해당하는 columnModel 을 반환한다.
     * @param {Number} index    조회할 컬럼모델의 인덱스 값
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
     * @return {object} 조회한 컬럼 모델
     */
    at: function(index, isVisible) {
        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
        return columnModelList[index];
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * @param {string} columnName   컬럼명
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
     * @return {number} index   컬럼명에 해당하는 인덱스 값
     */
    indexOfColumnName: function(columnName, isVisible) {
        var columnModelList;

        if (isVisible) {
            columnModelList = this.getVisibleColumnModelList();
        } else {
            columnModelList = this.get('columnModelList');
        }
        return _.findIndex(columnModelList, {columnName: columnName});
    },

    /**
     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true);

        return index > -1 && index < this.getVisibleColumnFixCount();
    },

    /**
     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList 를 반환한다.
     * @return {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumnModelList: function(whichSide) {
        var columnModelList = [],
            visibleColumnFixCount = this.getVisibleColumnFixCount();

        whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;

        if (whichSide === 'L') {
            columnModelList = this.get('visibleList').slice(0, visibleColumnFixCount);
        } else if (whichSide === 'R') {
            columnModelList = this.get('visibleList').slice(visibleColumnFixCount);
        } else {
            columnModelList = this.get('visibleList');
        }
        return columnModelList;
    },

    /**
     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다. 메타 컬럼인 '_number', '_button'의 갯수도 포함하여 반환한다.
     * @returns {number}
     */
    getVisibleColumnFixCount: function() {
        var columnModelList = this.get('columnModelList'),
            realColumnFixCount = this.get('columnFixCount') + META_COLUMN_LIST.length,
            visibleColumnFixCount = realColumnFixCount;


        ne.util.forEach(this.get('columnModelList'),function(columnModel, index) {
            if (index >= realColumnFixCount) {
                return false;
            }
            if (columnModel.isHidden) {
                visibleColumnFixCount -= 1;
            }
        });

        return visibleColumnFixCount;
    },

    /**
     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Object} 컬럼명에 해당하는 컬럼모델
     */
    getColumnModel: function(columnName) {
        return this.get('columnModelMap')[columnName];
    },

    /**
     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
     * 랜더링시 html 태그 문자열을 제거할때 사용됨.
     * @param {String} columnName 컬럼명
     * @return {boolean} text 타입인지 여부
     */
    isTextType: function(columnName) {
        return !!this.textType[this.getEditType(columnName)];
    },

    /**
     * 컬럼 모델로부터 editType 을 반환한다.
     * @param {string} columnName The name of the target column
     * @return {string} 해당하는 columnName 의 editType 을 반환한다.
     */
    getEditType: function(columnName) {
        var columnModel = this.getColumnModel(columnName),
            editType = 'normal';
        if (columnName === '_button' || columnName === '_number') {
            editType = columnName;
        } else if (columnModel && columnModel['editOption'] && columnModel['editOption']['type']) {
            editType = columnModel['editOption']['type'];
        }
        return editType;
    },

    /**
     * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
     * @param {Array} [columnModelList]   컬럼모델 배열
     * @return {Array}  isHidden 이 설정되지 않은 컬럼모델 배열
     * @private
     */
    _getVisibleList: function(columnModelList) {
        columnModelList = columnModelList || this.get('columnModelList');
        return _.filter(columnModelList, function(item) {
            return !item['isHidden'];
        });
    },

    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @param {Array} columnModelList - Column Model List
     * @return {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
     * @private
     */
    _getRelationListMap: function(columnModelList) {
        var columnName,
            relationListMap = {};

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            if (columnModel.relationList) {
                relationListMap[columnName] = columnModel.relationList;
            }
        });
        return relationListMap;
    },

    /**
     * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.
     * @return {Array} isIgnore 가 true 로 설정된 columnName 배열.
     */
    getIgnoredColumnNameList: function() {
        var columnModelLsit = this.get('columnModelList'),
            ignoreColumnNameList = [];
        _.each(columnModelLsit, function(columnModel) {
            if (columnModel.isIgnore) {
                ignoreColumnNameList.push(columnModel['columnName']);
            }
        });
        return ignoreColumnNameList;
    },

    /**
     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
     * 열고정 영역 기준으로 partition 으로 나뉜 visible list 등 내부적으로 사용할 부가정보를 가공하여 저장한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @param {number} [columnFixCount]   열고정 카운트
     * @private
     * @todo 초기화 기능과 새로고침 기능이 합쳐져있음
     */
    _setColumnModelList: function(columnModelList, columnFixCount) {
        var visibleList;

        if (ne.util.isUndefined(columnFixCount)) {
            columnFixCount = this.get('columnFixCount');
        }
        columnModelList = $.extend(true, [], columnModelList);
        this._initializeNumberColumn(columnModelList);
        this._initializeButtonColumn(columnModelList);
        visibleList = this._getVisibleList(columnModelList);

        this.set({
            columnModelList: columnModelList,
            columnModelMap: _.indexBy(columnModelList, 'columnName'),
            relationListMap: this._getRelationListMap(columnModelList),
            columnFixCount: Math.max(0, columnFixCount),
            visibleList: visibleList
        }, {silent: true});

        this.trigger('columnModelChange');
    },

    /**
     * change 이벤트 발생시 핸들러
     * @param {Object} model change 이벤트가 발생한 model 객체
     * @private
     */
    _onChange: function(model) {
        var changed = model.changed,
            columnModelList = changed['columnModelList'] || this.get('columnModelList'),
            columnFixCount = changed['columnFixCount'];

        this._setColumnModelList(columnModelList, columnFixCount);
    },

    /**
     * Set 'isHidden' property of column model to true or false
     * @param {Array} columnNames - Column names to set 'isHidden' property
     * @param {boolean} isHidden - Hidden flag for setting
     */
    setHidden: function(columnNames, isHidden) {
        var columnMergeInfoList = this.grid.option('columnMerge'),
            columnMergeInfoItem;

        _.each(columnNames, function(name) {
            var columnModel = this.getColumnModel(name);

            if (columnModel) {
                columnModel.isHidden = isHidden;
            } else {
                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {columnName: name});
                if (columnMergeInfoItem) {
                    this.setHidden(columnMergeInfoItem.columnNameList, isHidden);
                }
            }
        }, this);

        this.set({
            visibleList: this._getVisibleList()
        }, {silent: true});
        this.trigger('columnModelChange');
    }
});

module.exports = ColumnModel;
