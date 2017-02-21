/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var Model = require('../../base/model');
var util = require('../../common/util');
var frameConst = require('../../common/constMap').frame;

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module model/data/columnModel
 * @extends module:base/model
 * @ignore
 */
var ColumnModel = Model.extend(/**@lends module:model/data/columnModel.prototype */{
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            normal: true,
            text: true,
            password: true
        };
        this._setColumns(this.get('columns'));
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        columnFixCount: 0,
        metaColumns: [],
        dataColumns: [],
        visibleColumns: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {},
        columnMerge: [],
        copyOptions: {
            useFormattedValue: false
        }
    },

    /**
     * 메타컬럼모델들을 초기화한다.
     * @param {Array} source - 사용자가 입력한 메타컬럼의 셋팅값
     * @returns {Array} dest - 초기화가 완료된 메타컬럼 모델 리스트
     * @private
     */
    _initializeMetaColumns: function(source) {
        var dest = [];

        this._initializeButtonColumn(dest);
        this._initializeNumberColumn(dest);
        this._overwriteColumns(dest, source);
        return dest;
    },

    /**
     * overwrite column model list
     * @param {Array} dest - destination model list
     * @param {Array} source - source model list
     * @private
     */
    _overwriteColumns: function(dest, source) {
        _.each(source, function(columnModel) {
            this._extendColumns(columnModel, dest);
        }, this);
    },

    /**
     * 인자로 넘어온 metaColumns 에 설정값에 맞게 number column 을 추가한다.
     * @param {Array} metaColumns - Meta column model list
     * @private
     */
    _initializeNumberColumn: function(metaColumns) {
        var hasNumberColumn = this.get('hasNumberColumn');
        var numberColumn = {
            name: '_number',
            align: 'center',
            title: 'No.',
            isFixedWidth: true,
            width: 60
        };

        if (!hasNumberColumn) {
            numberColumn.hidden = true;
        }

        this._extendColumns(numberColumn, metaColumns);
    },

    /**
     * 인자로 넘어온 metaColumns 에 설정값에 맞게 button column 을 추가한다.
     * @param {Array} metaColumns - Meta column model listt
     * @private
     */
    _initializeButtonColumn: function(metaColumns) {
        var selectType = this.get('selectType');
        var buttonColumn = {
            name: '_button',
            hidden: false,
            align: 'center',
            width: 40,
            isFixedWidth: true,
            editOption: {
                type: 'mainButton'
            }
        };

        if (selectType === 'checkbox') {
            buttonColumn.title = '<input type="checkbox"/>';
        } else if (selectType === 'radio') {
            buttonColumn.title = '선택';
        } else {
            buttonColumn.hidden = true;
        }

        this._extendColumns(buttonColumn, metaColumns);
    },

    /**
     * column을 추가(push)한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * @param {object} columnObj 추가할 컬럼모델
     * @param {Array} columns 컬럼모델 배열
     * @private
     */
    _extendColumns: function(columnObj, columns) {
        var columnName = columnObj.name;
        var index = _.findIndex(columns, {name: columnName});

        if (index === -1) {
            columns.push(columnObj);
        } else {
            columns[index] = $.extend(columns[index], columnObj);
        }
    },

    /**
     * index 에 해당하는 columnModel 을 반환한다.
     * @param {Number} index    조회할 컬럼모델의 인덱스 값
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
     * @returns {object} 조회한 컬럼 모델
     */
    at: function(index, isVisible) {
        var columns = isVisible ? this.getVisibleColumns() : this.get('dataColumns');

        return columns[index];
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * @param {string} columnName   컬럼명
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
     * @returns {number} index   컬럼명에 해당하는 인덱스 값
     */
    indexOfColumnName: function(columnName, isVisible) {
        var columns;

        if (isVisible) {
            columns = this.getVisibleColumns();
        } else {
            columns = this.get('dataColumns');
        }
        return _.findIndex(columns, {name: columnName});
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
     * 화면에 노출되는 (!hidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
     * @returns {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumns: function(whichSide, withMeta) {
        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount();
        var visibleColumnFixCount = this.getVisibleColumnFixCount(withMeta);
        var columns;

        whichSide = whichSide && whichSide.toUpperCase();

        if (whichSide === frameConst.L) {
            columns = this.get('visibleColumns').slice(startIndex, visibleColumnFixCount);
        } else if (whichSide === frameConst.R) {
            columns = this.get('visibleColumns').slice(visibleColumnFixCount);
        } else {
            columns = this.get('visibleColumns').slice(startIndex);
        }

        return columns;
    },

    /**
     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.
     * @returns {number} count
     */
    getVisibleMetaColumnCount: function() {
        var models = this.get('metaColumns');
        var totalLength = models.length;
        var hiddenLength = _.where(models, {hidden: true}).length;

        return (totalLength - hiddenLength);
    },

    /**
     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
     * @returns {number} Visible columnFix count
     */
    getVisibleColumnFixCount: function(withMeta) {
        var count = this.get('columnFixCount');
        var fixedColumns = _.first(this.get('dataColumns'), count);
        var visibleFixedColumns, visibleCount;

        visibleFixedColumns = _.filter(fixedColumns, function(column) {
            return !column.hidden;
        });
        visibleCount = visibleFixedColumns.length;

        if (withMeta) {
            visibleCount += this.getVisibleMetaColumnCount();
        }

        return visibleCount;
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
        var columnModel = this.getColumnModel(columnName);
        var editType = 'normal';

        if (columnName === '_button' || columnName === '_number') {
            editType = columnName;
        } else if (columnModel && columnModel.editOption && columnModel.editOption.type) {
            editType = columnModel.editOption.type;
        }

        return editType;
    },

    /**
     * 인자로 받은 컬럼 모델에서 !hidden을 만족하는 리스트를 추려서 반환한다.
     * @param {Array} metaColumns 메타 컬럼 모델 리스트
     * @param {Array} dataColumns 데이터 컬럼 모델 리스트
     * @returns {Array} hidden 이 설정되지 않은 전체 컬럼 모델 리스트
     * @private
     */
    _makeVisibleColumns: function(metaColumns, dataColumns) {
        metaColumns = metaColumns || this.get('metaColumns');
        dataColumns = dataColumns || this.get('dataColumns');

        return _.filter(metaColumns.concat(dataColumns), function(item) {
            return !item.hidden;
        });
    },

    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @param {Array} columns - Column Model List
     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
     * @private
     */
    _getRelationListMap: function(columns) {
        var relationListMap = {};

        _.each(columns, function(columnModel) {
            var columnName = columnModel.name;
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
        var columnModelLsit = this.get('dataColumns');
        var ignoredColumnNames = [];

        _.each(columnModelLsit, function(columnModel) {
            if (columnModel.isIgnore) {
                ignoredColumnNames.push(columnModel.name);
            }
        });
        return ignoredColumnNames;
    },

    /**
     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
     * 메타컬럼과 데이터컬럼을 분리하여 저장한다.
     * @param {Array} columns   컬럼모델 배열
     * @param {number} [columnFixCount]   열고정 카운트
     * @private
     */
    _setColumns: function(columns, columnFixCount) {
        var division, relationListMap, visibleColumns, metaColumns, dataColumns;

        columns = $.extend(true, [], columns);
        if (tui.util.isUndefined(columnFixCount)) {
            columnFixCount = this.get('columnFixCount');
        }

        division = _.partition(columns, function(model) {
            return util.isMetaColumn(model.name);
        }, this);
        metaColumns = this._initializeMetaColumns(division[0]);
        dataColumns = division[1];

        relationListMap = this._getRelationListMap(dataColumns);
        visibleColumns = this._makeVisibleColumns(metaColumns, dataColumns);
        this.set({
            metaColumns: metaColumns,
            dataColumns: dataColumns,
            columnModelMap: _.indexBy(metaColumns.concat(dataColumns), 'name'),
            relationListMap: relationListMap,
            columnFixCount: Math.max(0, columnFixCount),
            visibleColumns: visibleColumns
        }, {
            silent: true
        });
        this.unset('columns', {
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
        var changed = model.changed;
        var columnFixCount = changed.columnFixCount;
        var columns = changed.columns;

        if (!columns) {
            columns = this.get('dataColumns');
        }
        this._setColumns(columns, columnFixCount);
    },

    /**
     * Set 'hidden' property of column model to true or false
     * @param {Array} columnNames - Column names to set 'hidden' property
     * @param {boolean} hidden - Hidden flag for setting
     */
    setHidden: function(columnNames, hidden) {
        var name, names, columnModel, visibleColumns;

        while (columnNames.length) {
            name = columnNames.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                columnModel.hidden = hidden;
            } else {
                names = this.getUnitColumnNamesIfMerged(name);
                columnNames.push.apply(columnNames, names);
            }
        }

        visibleColumns = this._makeVisibleColumns(
            this.get('metaColumns'),
            this.get('dataColumns')
        );
        this.set('visibleColumns', visibleColumns, {
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
        var columnMergeInfoList = this.get('columnMerge');
        var stackForSearch = [];
        var searchedNames = [];
        var name, columnModel, columnMergeInfoItem;

        stackForSearch.push(columnName);
        while (stackForSearch.length) {
            name = stackForSearch.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                searchedNames.push(name);
            } else {
                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {
                    name: name
                });
                if (columnMergeInfoItem) {
                    stackForSearch.push.apply(stackForSearch, columnMergeInfoItem.childNames);
                }
            }
        }
        return _.uniq(searchedNames);
    },

    /**
     * Returns the copy option of given column.
     * @param {string} columnName - column name
     * @returns {{useFormattedValue: boolean}}
     */
    getCopyOptions: function(columnName) {
        var columnModel = this.getColumnModel(columnName);

        return _.extend({}, this.get('copyOptions'), columnModel.copyOptions);
    },

    /**
     * Set footer contents.
     * (Just trigger 'setFooterContent')
     * @param {string} columnName - columnName
     * @param {string} contents - HTML string
     */
    setFooterContent: function(columnName, contents) {
        this.trigger('setFooterContent', columnName, contents);
    }
});

module.exports = ColumnModel;
