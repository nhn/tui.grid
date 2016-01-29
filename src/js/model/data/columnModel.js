/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../../base/model');

/**
 * @ignore
 * @const
 * @type {string[]}
 * @desc
 *  Meta column names
 */
var META_COLUMN_LIST = ['_button', '_number'];

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module model/data/columnModel
 * @extends module:base/model
 */
var ColumnModel = Model.extend(/**@lends module:model/data/columnModel.prototype */{
    /**
     * @constructs
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
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        columnFixCount: 0,
        metaColumnModelList: [],
        dataColumnModelList: [],
        visibleList: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {},
        columnMerge: []
    },

    /**
     * 메타컬럼모델들을 초기화한다.
     * @param {Array} source - 사용자가 입력한 메타컬럼의 셋팅값
     * @returns {Array} dset - 초기화가 완료된 메타컬럼 모델 리스트
     * @private
     */
    _initializeMetaColumns: function(source) {
        var dest = [];

        this._initializeButtonColumn(dest);
        this._initializeNumberColumn(dest);
        this._overwriteColumnModelList(dest, source);
        return dest;
    },

    /**
     * overwrite column model list
     * @param {Array} dest - destination model list
     * @param {Array} source - source model list
     * @private
     */
    _overwriteColumnModelList: function(dest, source) {
        _.each(source, function(columnModel) {
            this._extendColumnList(columnModel, dest);
        }, this);
    },

    /**
     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 number column 을 추가한다.
     * @param {Array} metaColumnModelList - Meta column model list
     * @private
     */
    _initializeNumberColumn: function(metaColumnModelList) {
        var hasNumberColumn = this.get('hasNumberColumn'),
            numberColumn = {
                columnName: '_number',
                align: 'center',
                title: 'No.',
                isFixedWidth: true,
                width: 60
            };
        if (!hasNumberColumn) {
            numberColumn.isHidden = true;
        }

       this._extendColumnList(numberColumn, metaColumnModelList);
    },

    /**
     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 button column 을 추가한다.
     * @param {Array} metaColumnModelList - Meta column model listt
     * @private
     */
    _initializeButtonColumn: function(metaColumnModelList) {
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
                isFixedWidth: true,
                width: 40
            };

        if (selectType === 'checkbox') {
            buttonColumn.title = '<input type="checkbox"/>';
        } else if (selectType === 'radio') {
            buttonColumn.title = '선택';
        } else {
            buttonColumn.isHidden = true;
        }

        this._extendColumnList(buttonColumn, metaColumnModelList);
    },

    /**
     * column을 추가(push)한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * @param {object} columnObj 추가할 컬럼모델
     * @param {Array} columnModelList 컬럼모델 배열
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
    },

    /**
     * index 에 해당하는 columnModel 을 반환한다.
     * @param {Number} index    조회할 컬럼모델의 인덱스 값
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
     * @returns {object} 조회한 컬럼 모델
     */
    at: function(index, isVisible) {
        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('dataColumnModelList');
        return columnModelList[index];
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * @param {string} columnName   컬럼명
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
     * @returns {number} index   컬럼명에 해당하는 인덱스 값
     */
    indexOfColumnName: function(columnName, isVisible) {
        var columnModelList;

        if (isVisible) {
            columnModelList = this.getVisibleColumnModelList();
        } else {
            columnModelList = this.get('dataColumnModelList');
        }
        return _.findIndex(columnModelList, {columnName: columnName});
    },

    /**
     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true);

        return (index > -1) && (index < this.get('columnFixCount'));
    },

    /**
     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
     * @returns {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumnModelList: function(whichSide, withMeta) {
        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount(),
            visibleColumnFixCount = this.getVisibleColumnFixCount(withMeta),
            columnModelList;

        whichSide = whichSide && whichSide.toUpperCase();

        if (whichSide === 'L') {
            columnModelList = this.get('visibleList').slice(startIndex, visibleColumnFixCount);
        } else if (whichSide === 'R') {
            columnModelList = this.get('visibleList').slice(visibleColumnFixCount);
        } else {
            columnModelList = this.get('visibleList').slice(startIndex);
        }

        return columnModelList;
    },

    /**
     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.
     * @returns {number} count
     */
    getVisibleMetaColumnCount: function() {
        var models = this.get('metaColumnModelList'),
            totalLength = models.length,
            hiddenLength = _.where(models, {
                isHidden: true
            }).length;

        return (totalLength - hiddenLength);
    },

    /**
     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
     * @returns {number} Visible columnFix count
     */
    getVisibleColumnFixCount: function(withMeta) {
        var realColumnFixCount = this.get('columnFixCount'),
            visibleColumnFixCount = realColumnFixCount;

        tui.util.forEach(this.get('dataColumnModelList'), function(columnModel, index) {
            if (index >= realColumnFixCount) {
                return false;
            }
            if (columnModel.isHidden) {
                visibleColumnFixCount -= 1;
            }
        });

        return (withMeta) ? (visibleColumnFixCount + this.getVisibleMetaColumnCount())
            : visibleColumnFixCount;
    },

    /**
     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {Object} 컬럼명에 해당하는 컬럼모델
     */
    getColumnModel: function(columnName) {
        return this.get('columnModelMap')[columnName];
    },

    /**
     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
     * 랜더링시 html 태그 문자열을 제거할때 사용됨.
     * @param {String} columnName 컬럼명
     * @returns {boolean} text 타입인지 여부
     */
    isTextType: function(columnName) {
        return !!this.textType[this.getEditType(columnName)];
    },

    /**
     * 컬럼 모델로부터 editType 을 반환한다.
     * @param {string} columnName The name of the target column
     * @returns {string} 해당하는 columnName 의 editType 을 반환한다.
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
     * @param {Array} metaColumnModelList 메타 컬럼 모델 리스트
     * @param {Array} dataColumnModelList 데이터 컬럼 모델 리스트
     * @returns {Array}  isHidden 이 설정되지 않은 전체 컬럼 모델 리스트
     * @private
     */
    _makeVisibleColumnModelList: function(metaColumnModelList, dataColumnModelList) {
        metaColumnModelList = metaColumnModelList || this.get('metaColumnModelList');
        dataColumnModelList = dataColumnModelList || this.get('dataColumnModelList');

        return _.filter(metaColumnModelList.concat(dataColumnModelList), function(item) {
            return !item['isHidden'];
        });
    },

    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @param {Array} columnModelList - Column Model List
     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
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
     * @returns {Array} isIgnore 가 true 로 설정된 columnName 배열.
     */
    getIgnoredColumnNameList: function() {
        var columnModelLsit = this.get('dataColumnModelList'),
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
     * 메타컬럼과 데이터컬럼을 분리하여 저장한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @param {number} [columnFixCount]   열고정 카운트
     * @private
     */
    _setColumnModelList: function(columnModelList, columnFixCount) {
        var division, relationListMap, visibleList, metaColumnModelList, dataColumnModelList;

        columnModelList = $.extend(true, [], columnModelList);
        if (tui.util.isUndefined(columnFixCount)) {
            columnFixCount = this.get('columnFixCount');
        }

        division = _.partition(columnModelList, function(model) {
            return this.isMetaColumn(model.columnName);
        }, this);
        metaColumnModelList = this._initializeMetaColumns(division[0]);
        dataColumnModelList = division[1];

        relationListMap = this._getRelationListMap(dataColumnModelList);
        visibleList = this._makeVisibleColumnModelList(metaColumnModelList, dataColumnModelList);
        this.set({
            metaColumnModelList: metaColumnModelList,
            dataColumnModelList: dataColumnModelList,
            columnModelMap: _.indexBy(metaColumnModelList.concat(dataColumnModelList), 'columnName'),
            relationListMap: relationListMap,
            columnFixCount: Math.max(0, columnFixCount),
            visibleList: visibleList
        }, {
            silent: true
        });
        this.unset('columnModelList', {
            silent: true
        });
        this.trigger('columnModelChange');
    },

    /**
     * change 이벤트 발생시 핸들러
     * @param {Object} model change 이벤트가 발생한 model 객체
     * @private
     */
    _onChange: function(model) {
        var changed = model.changed,
            columnFixCount = changed['columnFixCount'],
            columnModelList = changed['columnModelList'];

        if (!columnModelList) {
            columnModelList = this.get('dataColumnModelList');
        }
        this._setColumnModelList(columnModelList, columnFixCount);
    },

    /**
     * Set 'isHidden' property of column model to true or false
     * @param {Array} columnNames - Column names to set 'isHidden' property
     * @param {boolean} isHidden - Hidden flag for setting
     */
    setHidden: function(columnNames, isHidden) {
        var name, names, columnModel, visibleList;

        while (columnNames.length) {
            name = columnNames.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                columnModel.isHidden = isHidden;
            } else {
                names = this.getUnitColumnNamesIfMerged(name);
                columnNames.push.apply(columnNames, names);
            }
        }

        visibleList = this._makeVisibleColumnModelList(
            this.get('metaColumnModelList'),
            this.get('dataColumnModelList')
        );
        this.set('visibleList', visibleList, {
            silent: true
        });
        this.trigger('columnModelChange');
    },

    /**
     * Get unit column names
     * @param {string} columnName - columnName
     * @returns {Array.<string>} Unit column names
     */
    getUnitColumnNamesIfMerged: function(columnName) {
        var columnMergeInfoList = this.get('columnMerge'),
            stackForSearch = [],
            searchedNames = [],
            name, columnModel, columnMergeInfoItem;

        stackForSearch.push(columnName);
        while (stackForSearch.length) {
            name = stackForSearch.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                searchedNames.push(name);
            } else {
                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {
                    columnName: name
                });
                if (columnMergeInfoItem) {
                    stackForSearch.push.apply(stackForSearch, columnMergeInfoItem.columnNameList);
                }
            }
        }
        return _.uniq(searchedNames);
    },

    /**
     * Return whether the column is meta column
     * @param {string} columnName - columnName
     * @returns {boolean} Whether the column is meta column.
     */
    isMetaColumn: function(columnName) {
        return _.indexOf(META_COLUMN_LIST, columnName) >= 0;
    }
});

module.exports = ColumnModel;
