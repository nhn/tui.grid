'use strict';

/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */

var Model = require('../base/model');

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @constructor Data.ColumnModel
 */
var ColumnModel = Model.extend(/**@lends Data.ColumnModel.prototype */{
    defaults: {
        keyColumnName: null,
        columnFixIndex: 0,  //columnFixIndex
        columnModelList: [],
        visibleList: [],
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {}
    },
    /**
     * 생성자 함수
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            'normal': true,
            'text': true,
            'text-password': true,
            'text-convertible': true
        };
        this._setColumnModelList(this.get('columnModelList'), this.get('columnFixIndex'));
        this.on('change', this._onChange, this);
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

        columnModelList = this._extendColumn(numberColumn, columnModelList);
        return columnModelList;
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

        columnModelList = this._extendColumn(buttonColumn, columnModelList);

        return columnModelList;
    },
    /**
     * column 을 prepend 한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * - _number, _button 컬럼 초기화시 사용함.
     * @param {object} columnObj    prepend 할 컬럼모델
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array} 확장한 결과 컬럼모델 배열
     * @private
     */
    _extendColumn: function(columnObj, columnModelList) {
        var index;
        if (!ne.util.isUndefined(columnObj) && !ne.util.isUndefined(columnObj['columnName'])) {
            index = this._indexOfColumnName(columnObj['columnName'], columnModelList);
            if (index === -1) {
                columnModelList = _.union([columnObj], columnModelList);
            } else {
                columnModelList[index] = $.extend(columnModelList[index], columnObj);
            }
        }
        return columnModelList;
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
        isVisible = (isVisible === undefined) ? true : isVisible;
        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
        return this._indexOfColumnName(columnName, columnModelList);
    },
    /**
     * columnName 에 해당하는 index를 반환한다.
     * - columnModel 이 내부에 세팅되기 전에 button, number column 을 추가할 때만 사용됨.
     * @param {string} columnName   컬럼명
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {number} 컬럼명에 해당하는 인덱스 값
     * @private
     */
    _indexOfColumnName: function(columnName, columnModelList) {
        var i = 0, len = columnModelList.length;
        for (; i < len; i++) {
            if (columnModelList[i]['columnName'] === columnName) {
                return i;
            }
        }
        return -1;
    },
    /**
     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true);
        if (index < 0) {
            return false;
        } else {
            return this.get('columnFixIndex') > index;
        }
    },
    /**
     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList 를 반환한다.
     * @return {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumnModelList: function(whichSide) {
        whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
        var columnModelList = [],
            columnFixIndex = this.get('columnFixIndex');

        if (whichSide === 'L') {
            columnModelList = this.get('visibleList').slice(0, columnFixIndex);
        } else if (whichSide === 'R') {
            columnModelList = this.get('visibleList').slice(columnFixIndex);
        } else {
            columnModelList = this.get('visibleList');
        }

        return columnModelList;
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
     * @param {string} columnName
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
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array}  isHidden 이 설정되지 않은 컬럼모델 배열
     * @private
     */
    _getVisibleList: function(columnModelList) {
        return _.filter(columnModelList, function(item) {return !item['isHidden'];});
    },
    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @return {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
     * @private
     */
    _getRelationListMap: function(columnModelList) {
        var columnName,
            relationListMap = {};

        ne.util.forEachArray(columnModelList, function(columnModel) {
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
     * @param {Number} columnFixIndex   열고정 인덱스
     * @private
     */
    _setColumnModelList: function(columnModelList, columnFixIndex) {
        columnModelList = $.extend(true, [], columnModelList);
        columnModelList = this._initializeNumberColumn(this._initializeButtonColumn(columnModelList));

        var visibleList = this._getVisibleList(columnModelList);

        this.set({
            columnModelList: columnModelList,
            columnModelMap: _.indexBy(columnModelList, 'columnName'),
            relationListMap: this._getRelationListMap(columnModelList),
            columnFixIndex: columnFixIndex,
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
            columnFixIndex = changed['columnFixIndex'] ? changed['columnFixIndex'] : this.get('columnFixIndex');

        this._setColumnModelList(columnModelList, columnFixIndex);
    }
});

module.exports = ColumnModel;
