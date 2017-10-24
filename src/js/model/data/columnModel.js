/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Model = require('../../base/model');
var frameConst = require('../../common/constMap').frame;

var defaultRowHeaders = {
    rowNum: {
        type: 'rowNum',
        title: 'No.',
        name: '_number',
        align: 'center',
        fixedWidth: true,
        width: 60,
        hidden: false
    },
    checkbox: {
        type: 'checkbox',
        title: '<input type="checkbox" />',
        name: '_button',
        align: 'center',
        fixedWidth: true,
        width: 40,
        hidden: false,
        editOptions: {
            type: 'mainButton'
        }
    },
    radio: {
        type: 'radio',
        title: 'select',
        name: '_button',
        align: 'center',
        fixedWidth: true,
        width: 40,
        hidden: false,
        editOptions: {
            type: 'mainButton'
        }
    }
};

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module model/data/columnModel
 * @extends module:base/model
 * @ignore
 */
var ColumnModel = Model.extend(/** @lends module:model/data/columnModel.prototype */{
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            normal: true,
            text: true,
            password: true
        };
        this._setColumns(this.get('rowHeaders'), this.get('columns'));
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        frozenCount: 0,
        rowHeaders: [],
        dataColumns: [],
        visibleColumns: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
        selectType: '',
        columnModelMap: {},
        relationsMap: {},
        complexHeaderColumns: [],
        copyOptions: {
            useFormattedValue: false
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
     * Returns state that the column is included in left side by column name
     * @param {String} columnName - Column name
     * @returns {Boolean} Whether the column is included in left side or not
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true);
        var frozenCount = this.getVisibleFrozenCount(false);

        return (index > -1) && (index < frozenCount);
    },

    /**
     * 화면에 노출되는 (!hidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
     * @returns {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumns: function(whichSide, withMeta) {
        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount();
        var visibleColumnFixCount = this.getVisibleFrozenCount(withMeta);
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
        var models = this.get('rowHeaders');
        var totalLength = models.length;
        var hiddenLength = _.where(models, {hidden: true}).length;

        return (totalLength - hiddenLength);
    },

    /**
     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
     * @returns {number} Visible frozen count
     */
    getVisibleFrozenCount: function(withMeta) {
        var count = this.get('frozenCount');
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
        } else if (columnModel && columnModel.editOptions && columnModel.editOptions.type) {
            editType = columnModel.editOptions.type;
        }

        return editType;
    },

    /**
     * Whether copying the visible text or not
     * @param {string} columnName - Column name
     * @returns {boolena} State
     */
    copyVisibleTextOfEditingColumn: function(columnName) {
        var columnModel = this.getColumnModel(columnName);

        if (snippet.pick(columnModel, 'editOptions', 'listItems')) {
            return !!snippet.pick(columnModel, 'copyOptions', 'useListItemText');
        }

        return false;
    },

    /**
     * 인자로 받은 컬럼 모델에서 !hidden을 만족하는 리스트를 추려서 반환한다.
     * @param {Array} rowHeaders 메타 컬럼 모델 리스트
     * @param {Array} dataColumns 데이터 컬럼 모델 리스트
     * @returns {Array} hidden 이 설정되지 않은 전체 컬럼 모델 리스트
     * @private
     */
    _makeVisibleColumns: function(rowHeaders, dataColumns) {
        rowHeaders = rowHeaders || this.get('rowHeaders');
        dataColumns = dataColumns || this.get('dataColumns');

        return _.filter(rowHeaders.concat(dataColumns), function(item) {
            return !item.hidden;
        });
    },

    /**
     * 각 columnModel 의 relations 를 모아 주체가 되는 columnName 기준으로 relationsMap 를 생성하여 반환한다.
     * @param {Array} columns - Column Model List
     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationsMap
     * @private
     */
    _getRelationListMap: function(columns) {
        var relationsMap = {};

        _.each(columns, function(columnModel) {
            var columnName = columnModel.name;
            if (columnModel.relations) {
                relationsMap[columnName] = columnModel.relations;
            }
        });

        return relationsMap;
    },

    /**
     * ignored 가 true 로 설정된 columnName 의 list 를 반환한다.
     * @returns {Array} ignored 가 true 로 설정된 columnName 배열.
     */
    getIgnoredColumnNames: function() {
        var dataColumns = this.get('dataColumns');
        var ignoredColumnNames = [];

        _.each(dataColumns, function(columnModel) {
            if (columnModel.ignored) {
                ignoredColumnNames.push(columnModel.name);
            }
        });

        return ignoredColumnNames;
    },

    /**
     * Set column model by data
     * @param {array} rowHeaders - Data of row headers
     * @param {array} columns - Data of columns
     * @param {number} [frozenCount] Count of frozen column
     * @private
     */
    _setColumns: function(rowHeaders, columns, frozenCount) {
        var relationsMap, visibleColumns, dataColumns;

        if (snippet.isUndefined(frozenCount)) {
            frozenCount = this.get('frozenCount');
        }

        rowHeaders = this._getRowHeadersData(rowHeaders);
        dataColumns = $.extend(true, [], columns);

        relationsMap = this._getRelationListMap(dataColumns);
        visibleColumns = this._makeVisibleColumns(rowHeaders, dataColumns);

        this.set({
            selectType: this._getSelectType(rowHeaders),
            rowHeaders: rowHeaders,
            dataColumns: dataColumns,
            columnModelMap: _.indexBy(rowHeaders.concat(dataColumns), 'name'),
            relationsMap: relationsMap,
            frozenCount: Math.max(0, frozenCount),
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
     * Get data of row headers
     * @param {object} options - Options to set each row header
     * @returns {array} Row headers data
     * @private
     */
    _getRowHeadersData: function(options) {
        var rowHeadersData = [];
        var type, isObject;
        var defaultData;
        var hasTitle;

        _.each(options, function(data) {
            isObject = _.isObject(data);
            type = isObject ? data.type : data;
            defaultData = defaultRowHeaders[type];

            if (!isObject) {
                data = defaultData;
            } else {
                hasTitle = data.title;
                data = $.extend({}, defaultData, data);
            }

            // Customizing the cell data in the row header
            if (data.template && !hasTitle && type !== 'rowNum') {
                data.title = data.template({
                    className: '',
                    name: '',
                    disabled: '',
                    checked: ''
                });
            }

            // "checkbox" and "radio" should not exist in duplicate
            if (_.findIndex(rowHeadersData, {name: data.name}) === -1) {
                rowHeadersData.push(data);
            }
        }, this);

        return rowHeadersData;
    },

    /**
     * Get select type in row headers
     * @param {array} rowHeaders - Row headers data
     * @returns {string} Select type
     * @private
     */
    _getSelectType: function(rowHeaders) {
        var rowHeader = _.findWhere(rowHeaders, {name: '_button'});

        return rowHeader ? rowHeader.type : '';
    },

    /**
     * change 이벤트 발생시 핸들러
     * @param {Object} model change 이벤트가 발생한 model 객체
     * @private
     */
    _onChange: function(model) {
        var changed = model.changed;
        var frozenCount = changed.frozenCount;
        var columns = changed.columns || this.get('dataColumns');
        var rowHeaders = changed.rowHeaders || this.get('rowHeaders');

        this._setColumns(rowHeaders, columns, frozenCount);
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
            this.get('rowHeaders'),
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
        var complexHeaderColumns = this.get('complexHeaderColumns');
        var stackForSearch = [];
        var searchedNames = [];
        var name, columnModel, complexHeaderColumn;

        stackForSearch.push(columnName);
        while (stackForSearch.length) {
            name = stackForSearch.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                searchedNames.push(name);
            } else {
                complexHeaderColumn = _.findWhere(complexHeaderColumns, {
                    name: name
                });
                if (complexHeaderColumn) {
                    stackForSearch.push.apply(stackForSearch, complexHeaderColumn.childNames);
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
     * Set summary contents.
     * (Just trigger 'setSummaryContent')
     * @param {string} columnName - columnName
     * @param {string} contents - HTML string
     */
    setSummaryContent: function(columnName, contents) {
        this.trigger('setSummaryContent', columnName, contents);
    }
});

ColumnModel._defaultRowHeaders = defaultRowHeaders;

module.exports = ColumnModel;
