/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Collection 정의
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var Collection = require('../../base/collection');
var Row = require('./row');
var GridEvent = require('../../event/gridEvent');

/**
 * Raw 데이터 RowList 콜렉션. (DataSource)
 * Grid.setData 를 사용하여 콜렉션을 설정한다.
 * @module model/data/rowList
 * @extends module:base/collection
 * @param {Array} models - 콜랙션에 추가할 model 리스트
 * @param {Object} options - 생성자의 option 객체
 * @ignore
 */
var RowList = Collection.extend(/** @lends module:model/data/rowList.prototype */{
    initialize: function(models, options) {
        Collection.prototype.initialize.apply(this, arguments);
        _.assign(this, {
            columnModel: options.columnModel,
            domState: options.domState,
            gridId: options.gridId,
            lastRowKey: -1,
            originalRows: [],
            originalRowMap: {},
            startIndex: options.startIndex || 1,
            sortOptions: {
                columnName: 'rowKey',
                ascending: true,
                useClient: (_.isBoolean(options.useClientSort) ? options.useClientSort : true)
            },

            /**
             * Whether the all rows are disabled.
             * This state is not related to individual state of each rows.
             * @type {Boolean}
             */
            disabled: false,
            publicObject: options.publicObject
        });

        if (!this.sortOptions.useClient) {
            this.comparator = null;
        }

        if (options.domEventBus) {
            this.listenTo(options.domEventBus, 'click:headerCheck', this._onClickHeaderCheck);
            this.listenTo(options.domEventBus, 'click:headerSort', this._onClickHeaderSort);
        }
    },

    model: Row,

    /**
     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
     * @param {Array} data  원본 데이터
     * @returns {Array}  파싱하여 가공된 데이터
     */
    parse: function(data) {
        data = (data && data.contents) || data;

        return this._formatData(data);
    },

    /**
     * Event handler for 'click:headerCheck' event on domEventBus
     * @param {module:event/gridEvent} ev - GridEvent
     * @private
     */
    _onClickHeaderCheck: function(ev) {
        if (ev.checked) {
            this.checkAll();
        } else {
            this.uncheckAll();
        }
    },

    /**
     * Event handler for 'click:headerSort' event on domEventBus
     * @param {module:event/gridEvent} ev - GridEvent
     * @private
     */
    _onClickHeaderSort: function(ev) {
        this.sortByField(ev.columnName);
    },

    /**
     * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
     * _extraData 필드에 rowSpanData 를 추가한다.
     * @param {Array} data  가공할 데이터
     * @returns {Array} 가공된 데이터
     * @private
     */
    _formatData: function(data) {
        var rowList = _.filter(data, _.isObject);

        _.each(rowList, function(row, i) {
            rowList[i] = this._baseFormat(rowList[i]);
            if (this.isRowSpanEnable()) {
                this._setExtraRowSpanData(rowList, i);
            }
        }, this);

        return rowList;
    },

    /**
     * row 를 기본 포멧으로 wrapping 한다.
     * 추가적으로 rowKey 를 할당하고, rowState 에 따라 checkbox 의 값을 할당한다.
     *
     * @param {object} row  대상 row 데이터
     * @param {number} index    해당 row 의 인덱스 정보. rowKey 를 자동 생성할 경우 사용된다.
     * @returns {object} 가공된 row 데이터
     * @private
     */
    _baseFormat: function(row) {
        var defaultExtraData = {
                rowSpan: null,
                rowSpanData: null,
                rowState: null
            },
            keyColumnName = this.columnModel.get('keyColumnName'),
            rowKey = (keyColumnName === null) ? this._createRowKey() : row[keyColumnName];

        row._extraData = $.extend(defaultExtraData, row._extraData);
        row._button = row._extraData.rowState === 'CHECKED';
        row.rowKey = rowKey;

        return row;
    },

    /**
     * 새로운 rowKey를 생성해서 반환한다.
     * @returns {number} 생성된 rowKey
     * @private
     */
    _createRowKey: function() {
        this.lastRowKey += 1;

        return this.lastRowKey;
    },

    /**
     * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
     * @param {Array} rowList - 전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
     * @param {number} index - 해당 배열에서 extraData 를 설정할 배열
     * @returns {Array} rowList - 가공된 rowList
     * @private
     */
    _setExtraRowSpanData: function(rowList, index) {
        var row = rowList[index],
            rowSpan = row && row._extraData && row._extraData.rowSpan,
            rowKey = row && row.rowKey,
            subCount, childRow, i;

        function hasRowSpanData(row, columnName) { // eslint-disable-line no-shadow, require-jsdoc
            var extraData = row._extraData;

            return !!(extraData.rowSpanData && extraData.rowSpanData[columnName]);
        }
        function setRowSpanData(row, columnName, rowSpanData) { // eslint-disable-line no-shadow, require-jsdoc
            var extraData = row._extraData;
            extraData.rowSpanData = (extraData && extraData.rowSpanData) || {};
            extraData.rowSpanData[columnName] = rowSpanData;

            return extraData;
        }

        if (rowSpan) {
            _.each(rowSpan, function(count, columnName) {
                if (!hasRowSpanData(row, columnName)) {
                    setRowSpanData(row, columnName, {
                        count: count,
                        isMainRow: true,
                        mainRowKey: rowKey
                    });
                    // rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
                    subCount = -1;
                    for (i = index + 1; i < index + count; i += 1) {
                        childRow = rowList[i];
                        childRow[columnName] = row[columnName];
                        childRow._extraData = childRow._extraData || {};
                        setRowSpanData(childRow, columnName, {
                            count: subCount,
                            isMainRow: false,
                            mainRowKey: rowKey
                        });
                        subCount -= 1;
                    }
                }
            });
        }

        return rowList;
    },

    /**
     * originalRows 와 originalRowMap 을 생성한다.
     * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRows 로 저장한다.
     * @returns {Array} format 을 거친 데이터 리스트.
     */
    setOriginalRowList: function(rowList) {
        this.originalRows = rowList ? this._formatData(rowList) : this.toJSON();
        this.originalRowMap = _.indexBy(this.originalRows, 'rowKey');

        return this.originalRows;
    },

    /**
     * 원본 데이터 리스트를 반환한다.
     * @param {boolean} [isClone=true]  데이터 복제 여부.
     * @returns {Array}  원본 데이터 리스트 배열.
     */
    getOriginalRowList: function(isClone) {
        isClone = _.isUndefined(isClone) ? true : isClone;

        return isClone ? _.clone(this.originalRows) : this.originalRows;
    },

    /**
     * 원본 row 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @returns {Object} 해당 행의 원본 데이터값
     */
    getOriginalRow: function(rowKey) {
        return _.clone(this.originalRowMap[rowKey]);
    },

    /**
     * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
     */
    getOriginal: function(rowKey, columnName) {
        return _.clone(this.originalRowMap[rowKey][columnName]);
    },

    /**
     * mainRowKey 를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
     */
    getMainRowKey: function(rowKey, columnName) {
        var row = this.get(rowKey),
            rowSpanData;
        if (this.isRowSpanEnable()) {
            rowSpanData = row && row.getRowSpanData(columnName);
            rowKey = rowSpanData ? rowSpanData.mainRowKey : rowKey;
        }

        return rowKey;
    },

    /**
     * rowKey 에 해당하는 index를 반환한다.
     * @param {(Number|String)} rowKey 데이터의 키값
     * @returns {Number} 키값에 해당하는 row의 인덱스
     */
    indexOfRowKey: function(rowKey) {
        return this.indexOf(this.get(rowKey));
    },

    /**
     * rowSpan 이 적용되어야 하는지 여부를 반환한다.
     * 랜더링시 사용된다.
     * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
     * @returns {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
     */
    isRowSpanEnable: function() {
        return !this.isSortedByField();
    },

    /**
     * 현재 RowKey가 아닌 다른 컬럼에 의해 정렬된 상태인지 여부를 반환한다.
     * @returns {Boolean}    정렬된 상태인지 여부
     */
    isSortedByField: function() {
        return this.sortOptions.columnName !== 'rowKey';
    },

    /**
     * 정렬옵션 객체의 값을 변경하고, 변경된 값이 있을 경우 sortChanged 이벤트를 발생시킨다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} ascending 오름차순 여부
     * @param {boolean} requireFetch 서버 데이타의 갱신이 필요한지 여부
     */
    setSortOptionValues: function(columnName, ascending, requireFetch) {
        var options = this.sortOptions,
            isChanged = false;

        if (_.isUndefined(columnName)) {
            columnName = 'rowKey';
        }
        if (_.isUndefined(ascending)) {
            ascending = true;
        }

        if (options.columnName !== columnName || options.ascending !== ascending) {
            isChanged = true;
        }
        options.columnName = columnName;
        options.ascending = ascending;

        if (isChanged) {
            this.trigger('sortChanged', {
                columnName: columnName,
                ascending: ascending,
                requireFetch: requireFetch
            });
        }
    },

    /**
     * 주어진 컬럼명을 기준으로 오름/내림차순 정렬한다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} ascending 오름차순 여부
     */
    sortByField: function(columnName, ascending) {
        var options = this.sortOptions;

        if (_.isUndefined(ascending)) {
            ascending = (options.columnName === columnName) ? !options.ascending : true;
        }
        this.setSortOptionValues(columnName, ascending, !options.useClient);

        if (options.useClient) {
            this.sort();
        }
    },

    /**
     * rowList 를 반환한다.
     * @param {boolean} [checkedOnly=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     * @param {boolean} [withRawData=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     * @returns {Array} Row List
     */
    getRows: function(checkedOnly, withRawData) {
        var rows, checkedRows;

        if (checkedOnly) {
            checkedRows = this.where({
                '_button': true
            });
            rows = [];
            _.each(checkedRows, function(checkedRow) {
                rows.push(checkedRow.attributes);
            }, this);
        } else {
            rows = this.toJSON();
        }

        return withRawData ? rows : this._removePrivateProp(rows);
    },

    /**
     * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
     * rowSpan 된 데이터들도 함께 update 한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   변경이 발생한 컬럼명
     * @param {(String|Number)} value 변경된 값
     */
    syncRowSpannedData: function(row, columnName, value) {
        var index, rowSpanData, i;

        // 정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
        if (this.isRowSpanEnable()) {
            rowSpanData = row.getRowSpanData(columnName);
            if (!rowSpanData.isMainRow) {
                this.get(rowSpanData.mainRowKey).set(columnName, value);
            } else {
                index = this.indexOfRowKey(row.get('rowKey'));
                for (i = 0; i < rowSpanData.count - 1; i += 1) {
                    this.at(i + 1 + index).set(columnName, value);
                }
            }
        }
    },

    /* eslint-disable complexity */
    /**
     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
     * @param {Row} a 비교할 앞의 모델
     * @param {Row} b 비교할 뒤의 모델
     * @returns {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
     */
    comparator: function(a, b) {
        var columnName = this.sortOptions.columnName;
        var ascending = this.sortOptions.ascending;
        var valueA = a.get(columnName);
        var valueB = b.get(columnName);

        var isEmptyA = _.isNull(valueA) || _.isUndefined(valueA) || valueA === '';
        var isEmptyB = _.isNull(valueB) || _.isUndefined(valueB) || valueB === '';
        var result = 0;

        if (isEmptyA && !isEmptyB) {
            result = -1;
        } else if (!isEmptyA && isEmptyB) {
            result = 1;
        } else if (valueA < valueB) {
            result = -1;
        } else if (valueA > valueB) {
            result = 1;
        }

        if (!ascending) {
            result = -result;
        }

        return result;
    },
    /* eslint-enable complexity */

    /**
     * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
     * @param {Array} rowList   내부에 설정된 rowList 배열
     * @returns {Array}  private 프로퍼티를 제거한 결과값
     * @private
     */
    _removePrivateProp: function(rowList) {
        return _.map(rowList, function(row) {
            return _.omit(row, Row.privateProperties);
        });
    },

    /**
     * rowKey 에 해당하는 그리드 데이터를 삭제한다.
     * @param {(Number|String)} rowKey - 행 데이터의 고유 키
     * @param {object} options - 삭제 옵션
     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
     */
    removeRow: function(rowKey, options) {
        var row = this.get(rowKey);
        var rowSpanData, nextRow, removedData, currentIndex;

        if (!row) {
            return;
        }

        if (options && options.keepRowSpanData) {
            removedData = _.clone(row.attributes);
        }

        currentIndex = this.indexOf(row);
        rowSpanData = _.clone(row.getRowSpanData());
        nextRow = this.at(currentIndex + 1);

        this.remove(row, {
            silent: true
        });
        this._syncRowSpanDataForRemove(rowSpanData, nextRow, removedData);

        if (options && options.removeOriginalData) {
            this.setOriginalRowList();
        }
        this.trigger('remove', rowKey, currentIndex);
    },

    /**
     * 삭제된 행에 rowSpan이 적용되어 있었을 때, 관련된 행들의 rowSpan데이터를 갱신한다.
     * @param {object} rowSpanData - 삭제된 행의 rowSpanData
     * @param {Row} nextRow - 삭제된 다음 행의 모델
     * @param {object} [removedData] - 삭제된 행의 데이터 (삭제옵션의 keepRowSpanData가 true인 경우에만 넘겨짐)
     * @private
     */
    _syncRowSpanDataForRemove: function(rowSpanData, nextRow, removedData) {
        if (!rowSpanData) {
            return;
        }
        _.each(rowSpanData, function(data, columnName) {
            var mainRowSpanData = {},
                mainRow, startOffset, spanCount;

            if (data.isMainRow) {
                if (data.count === 1) {
                    // if isMainRow is true and count is 1, rowSpanData is meaningless
                    return;
                }
                mainRow = nextRow;
                spanCount = data.count - 1;
                startOffset = 1;
                if (spanCount > 1) {
                    mainRowSpanData.mainRowKey = mainRow.get('rowKey');
                    mainRowSpanData.isMainRow = true;
                }
                mainRow.set(columnName, (removedData ? removedData[columnName] : ''), {
                    silent: true
                });
            } else {
                mainRow = this.get(data.mainRowKey);
                spanCount = mainRow.getRowSpanData(columnName).count - 1;
                startOffset = -data.count;
            }

            if (spanCount > 1) {
                mainRowSpanData.count = spanCount;
                mainRow.setRowSpanData(columnName, mainRowSpanData);
                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
            } else {
                mainRow.setRowSpanData(columnName, null);
            }
        }, this);
    },

    /**
     * append, prepend 시 사용할 dummy row를 생성한다.
     * @returns {Object} 값이 비어있는 더미 row 데이터
     * @private
     */
    _createDummyRow: function() {
        var columns = this.columnModel.get('dataColumns');
        var data = {};

        _.each(columns, function(columnModel) {
            data[columnModel.name] = '';
        }, this);

        return data;
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @param {(Array|Object)} [rowData] - The data for the new row
     * @param {Object} [options] - Options
     * @param {Number} [options.at] - The index at which new row will be inserted
     * @param {Boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {Boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/row>} Row model list
     */
    append: function(rowData, options) {
        var modelList = this._createModelList(rowData),
            addOptions;

        options = _.extend({at: this.length}, options);
        addOptions = {
            at: options.at,
            add: true,
            silent: true
        };

        this.add(modelList, addOptions);

        this._syncRowSpanDataForAppend(options.at, modelList.length, options.extendPrevRowSpan);
        this.trigger('add', modelList, options);

        return modelList;
    },

    /**
     * 현재 rowList 에 최상단에 데이터를 append 한다.
     * @param {Object} rowData  prepend 할 행 데이터
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/row>} Row model list
     */
    prepend: function(rowData, options) {
        options = options || {};
        options.at = 0;

        return this.append(rowData, options);
    },

    /**
     * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
     * @param {(Number|String)} rowKey  행 데이터의 고유 키
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Object} 행 데이터
     */
    getRowData: function(rowKey, isJsonString) {
        var row = this.get(rowKey),
            rowData = row ? row.toJSON() : null;

        return isJsonString ? JSON.stringify(rowData) : rowData;
    },

    /**
     * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
     * @param {Number} index 행의 인덱스
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Object} 행 데이터
     */
    getRowDataAt: function(index, isJsonString) {
        var row = this.at(index),
            rowData = row ? row.toJSON() : null;

        return isJsonString ? JSON.stringify(row) : rowData;
    },

    /**
     * rowKey 와 columnName 에 해당하는 값을 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
     * @returns {(Number|String|undefined)}    조회한 셀의 값.
     */
    getValue: function(rowKey, columnName, isOriginal) {
        var value, row;

        if (isOriginal) {
            value = this.getOriginal(rowKey, columnName);
        } else {
            row = this.get(rowKey);
            value = row && row.get(columnName);
        }

        return value;
    },

    /**
     * Sets the vlaue of the cell identified by the specified rowKey and columnName.
     * @param {(Number|String)} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {(Number|String)} value - value
     * @param {Boolean} [silent=false] - whether set silently
     * @returns {Boolean} True if affected row exists
     */
    setValue: function(rowKey, columnName, value, silent) {
        var row = this.get(rowKey);

        if (row) {
            row.set(columnName, value, {
                silent: silent
            });

            return true;
        }

        return false;
    },

    /**
     * columnName에 해당하는 column data list를 리턴한다.
     * @param {String} columnName   컬럼명
     * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
     */
    getColumnValues: function(columnName, isJsonString) {
        var valueList = this.pluck(columnName);

        return isJsonString ? JSON.stringify(valueList) : valueList;
    },

    /**
     * columnName 에 해당하는 값을 전부 변경한다.
     * @param {String} columnName 컬럼명
     * @param {(Number|String)} columnValue 변경할 컬럼 값
     * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
     * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
        var obj = {},
            cellState = {
                disabled: false,
                editable: true
            };

        obj[columnName] = columnValue;
        isCheckCellState = _.isUndefined(isCheckCellState) ? true : isCheckCellState;

        this.forEach(function(row) {
            if (isCheckCellState) {
                cellState = row.getCellState(columnName);
            }
            if (!cellState.disabled && cellState.editable) {
                row.set(obj, {
                    silent: silent
                });
            }
        }, this);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @returns {object} rowSpanData
     */
    getRowSpanData: function(rowKey, columnName) {
        var row = this.get(rowKey);

        return row ? row.getRowSpanData(columnName) : null;
    },

    /**
     * Returns true if there are at least one row modified.
     * @returns {boolean} - True if there are at least one row modified.
     */
    isModified: function() {
        var modifiedRowsArr = _.values(this.getModifiedRows());

        return _.some(modifiedRowsArr, function(modifiedRows) {
            return modifiedRows.length > 0;
        });
    },

    /**
     * Enables or Disables all rows.
     * @param  {Boolean} disabled - Whether disabled or not
     */
    setDisabled: function(disabled) {
        if (this.disabled !== disabled) {
            this.disabled = disabled;
            this.trigger('disabledChanged');
        }
    },

    /**
     * rowKey에 해당하는 행을 활성화시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableRow: function(rowKey) {
        this.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행을 비활성화 시킨다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    disableRow: function(rowKey) {
        this.get(rowKey).setRowState('DISABLED');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableCheck: function(rowKey) {
        this.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    disableCheck: function(rowKey) {
        this.get(rowKey).setRowState('DISABLED_CHECK');
    },

    /**
     * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {Boolean} [silent] 이벤트 발생 여부
     */
    check: function(rowKey, silent) {
        var isDisabledCheck = this.get(rowKey).getRowState().isDisabledCheck;
        var selectType = this.columnModel.get('selectType');

        if (!isDisabledCheck && selectType) {
            if (selectType === 'radio') {
                this.uncheckAll();
            }
            this.setValue(rowKey, '_button', true, silent);
        }
    },

    /**
     * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {Boolean} [silent] 이벤트 발생 여부
     */
    uncheck: function(rowKey, silent) {
        this.setValue(rowKey, '_button', false, silent);
    },

    /**
     * 전체 행을 선택한다.
     * TODO: disableCheck 행 처리
     */
    checkAll: function() {
        this.setColumnValues('_button', true);
    },

    /**
     * 모든 행을 선택 해제 한다.
     */
    uncheckAll: function() {
        this.setColumnValues('_button', false);
    },

    /**
     * 주어진 데이터로 모델 목록을 생성하여 반환한다.
     * @param {object|array} rowData - 모델을 생성할 데이터. Array일 경우 여러개를 동시에 생성한다.
     * @returns {Row[]} 생성된 모델 목록
     */
    _createModelList: function(rowData) {
        var modelList = [],
            rowList;

        rowData = rowData || this._createDummyRow();
        if (!_.isArray(rowData)) {
            rowData = [rowData];
        }
        rowList = this._formatData(rowData);

        _.each(rowList, function(row) {
            var model = new Row(row, {
                collection: this,
                parse: true
            });
            modelList.push(model);
        }, this);

        return modelList;
    },

    /**
     * 새로운 행이 추가되었을 때, 관련된 주변 행들의 rowSpan 데이터를 갱신한다.
     * @param {number} index - 추가된 행의 인덱스
     * @param {number} length - 추가된 행의 개수
     * @param {boolean} extendPrevRowSpan - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
     */
    _syncRowSpanDataForAppend: function(index, length, extendPrevRowSpan) {
        var prevRow = this.at(index - 1);

        if (!prevRow) {
            return;
        }
        _.each(prevRow.getRowSpanData(), function(data, columnName) {
            var mainRow, mainRowData, startOffset, spanCount;

            // count 값은 mainRow인 경우 '전체 rowSpan 개수', 아닌 경우는 'mainRow까지의 거리 (음수)'를 의미한다.
            // 0이면 rowSpan 되어 있지 않다는 의미이다.
            if (data.count === 0) {
                return;
            }
            if (data.isMainRow) {
                mainRow = prevRow;
                mainRowData = data;
                startOffset = 1;
            } else {
                mainRow = this.get(data.mainRowKey);
                mainRowData = mainRow.getRowSpanData()[columnName];
                // 루프를 순회할 때 의미를 좀더 명확하게 하기 위해 양수값으로 변경해서 offset 처럼 사용한다.
                startOffset = -data.count + 1;
            }

            if (mainRowData.count > startOffset || extendPrevRowSpan) {
                mainRowData.count += length;
                spanCount = mainRowData.count;

                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
            }
        }, this);
    },

    /**
     * 특정 컬럼의 rowSpan 데이터를 주어진 범위만큼 갱신한다.
     * @param {Row} mainRow - rowSpan의 첫번째 행
     * @param {string} columnName - 컬럼명
     * @param {number} startOffset - mainRow로부터 몇번째 떨어진 행부터 갱신할지를 지정하는 값
     * @param {number} spanCount - span이 적용될 행의 개수
     */
    _updateSubRowSpanData: function(mainRow, columnName, startOffset, spanCount) {
        var mainRowIdx = this.indexOf(mainRow),
            mainRowKey = mainRow.get('rowKey'),
            row, offset;

        for (offset = startOffset; offset < spanCount; offset += 1) {
            row = this.at(mainRowIdx + offset);
            row.set(columnName, mainRow.get(columnName), {
                silent: true
            });
            row.setRowSpanData(columnName, {
                count: -offset,
                mainRowKey: mainRowKey,
                isMainRow: false
            });
        }
    },

    /**
     * 해당 row가 수정된 Row인지 여부를 반환한다.
     * @param {Object} row - row 데이터
     * @param {Object} originalRow - 원본 row 데이터
     * @param {Array} ignoredColumns - 비교에서 제외할 컬럼명
     * @returns {boolean} - 수정여부
     */
    _isModifiedRow: function(row, originalRow, ignoredColumns) {
        var filtered = _.omit(row, ignoredColumns);
        var result = _.some(filtered, function(value, columnName) {
            if (typeof value === 'object') {
                return (JSON.stringify(value) !== JSON.stringify(originalRow[columnName]));
            }

            return value !== originalRow[columnName];
        }, this);

        return result;
    },

    /**
     * 수정된 rowList 를 반환한다.
     * @param {Object} options 옵션 객체
     *      @param {boolean} [options.checkedOnly=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     *      @param {boolean} [options.withRawData=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     *      @param {boolean} [options.rowKeyOnly=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
     *      @param {Array} [options.ignoredColumns]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
     * @returns {{createdRows: Array, updatedRows: Array, deletedRows: Array}} options 조건에 해당하는 수정된 rowList 정보
     */
    getModifiedRows: function(options) {
        var withRawData = options && options.withRawData;
        var checkedOnly = options && options.checkedOnly;
        var rowKeyOnly = options && options.rowKeyOnly;
        var original = withRawData ? this.originalRows : this._removePrivateProp(this.originalRows);
        var current = withRawData ? this.toJSON() : this._removePrivateProp(this.toJSON());
        var ignoredColumns = options && options.ignoredColumns;
        var result = {
            createdRows: [],
            updatedRows: [],
            deletedRows: []
        };

        original = _.indexBy(original, 'rowKey');
        current = _.indexBy(current, 'rowKey');
        ignoredColumns = _.union(ignoredColumns, this.columnModel.getIgnoredColumnNames());

        // 추가/ 수정된 행 추출
        _.each(current, function(row, rowKey) {
            var originalRow = original[rowKey],
                item = rowKeyOnly ? row.rowKey : _.omit(row, ignoredColumns);

            if (!checkedOnly || (checkedOnly && this.get(rowKey).get('_button'))) {
                if (!originalRow) {
                    result.createdRows.push(item);
                } else if (this._isModifiedRow(row, originalRow, ignoredColumns)) {
                    result.updatedRows.push(item);
                }
            }
        }, this);

        // 삭제된 행 추출
        _.each(original, function(obj, rowKey) {
            var item = rowKeyOnly ? obj.rowKey : _.omit(obj, ignoredColumns);
            if (!current[rowKey]) {
                result.deletedRows.push(item);
            }
        }, this);

        return result;
    },

    /**
     * data 를 설정한다. setData 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
     * @param {Array} data - 설정할 데이터 배열 값
     * @param {boolean} [parse=true]  backbone 의 parse 로직을 수행할지 여부
     * @param {Function} [callback] callback function
     */
    resetData: function(data, parse, callback) {
        if (!data) {
            data = [];
        }
        if (_.isUndefined(parse)) {
            parse = true;
        }
        this.trigger('beforeReset', data.length);

        this.lastRowKey = -1;
        this.reset(data, {
            parse: parse
        });

        if (_.isFunction(callback)) {
            callback();
        }
    },

    /**
     * data 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
     * @param {Array} data - 설정할 데이터 배열 값
     * @param {boolean} [parse=true]  backbone 의 parse 로직을 수행할지 여부
     * @param {function} [callback] 완료시 호출될 함수
     */
    setData: function(data, parse, callback) {
        var wrappedCallback = _.bind(function() {
            this.setOriginalRowList();
            if (_.isFunction(callback)) {
                callback();
            }
        }, this);

        this.resetData(data, parse, wrappedCallback);
    },

    /**
     * setData()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
     */
    restore: function() {
        var originalRows = this.getOriginalRowList();
        this.resetData(originalRows, true);
    },

    /**
     * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     */
    del: function(rowKey, columnName, silent) {
        var mainRowKey = this.getMainRowKey(rowKey, columnName),
            cellState = this.get(mainRowKey).getCellState(columnName),
            editType = this.columnModel.getEditType(columnName),
            isDeletableType = _.contains(['text', 'password'], editType);

        if (isDeletableType && cellState.editable && !cellState.disabled) {
            this.setValue(mainRowKey, columnName, '', silent);
        }
    },

    /**
     * Calls del() method for multiple cells silently, and trigger 'deleteRange' event
     * @param {{row: Array.<number>, column: Array.<number>}} range - visible indexes
     */
    delRange: function(range) {
        var columnModels = this.columnModel.getVisibleColumns();
        var rowIdxes = _.range(range.row[0], range.row[1] + 1);
        var columnIdxes = _.range(range.column[0], range.column[1] + 1);
        var rowKeys, columnNames;

        rowKeys = _.map(rowIdxes, function(idx) {
            return this.at(idx).get('rowKey');
        }, this);

        columnNames = _.map(columnIdxes, function(idx) {
            return columnModels[idx].name;
        });

        _.each(rowKeys, function(rowKey) {
            _.each(columnNames, function(columnName) {
                this.del(rowKey, columnName, true);
                this.get(rowKey).validateCell(columnName, true);
            }, this);
        }, this);

        /**
         * Occurs when cells are deleted by 'del' key
         * @event Grid#deleteRange
         * @type {module:event/gridEvent}
         * @property {Array} columnNames - columName list of deleted cell
         * @property {Array} rowKeys - rowKey list of deleted cell
         * @property {Grid} instance - Current grid instance
         */
        this.trigger('deleteRange', new GridEvent(null, {
            rowKeys: rowKeys,
            columnNames: columnNames
        }));
    },

    /**
     * 2차원 배열로 된 데이터를 받아 현재 Focus된 셀을 기준으로 하여 각각의 인덱스의 해당하는 만큼 우측 아래 방향으로
     * 이동하며 셀의 값을 변경한다. 완료한 후 적용된 셀 범위에 Selection을 지정한다.
     * @param {Array[]} data - 2차원 배열 데이터. 내부배열의 사이즈는 모두 동일해야 한다.
     * @param {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
     */
    paste: function(data, startIdx) {
        var endIdx = this._getEndIndexToPaste(data, startIdx);

        _.each(data, function(row, index) {
            this._setValueForPaste(row, startIdx.row + index, startIdx.column, endIdx.column);
        }, this);

        this.trigger('paste', {
            startIdx: startIdx,
            endIdx: endIdx
        });
    },

    /**
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @example
        [
            {
                rowKey: 1,
                errors: [
                    {
                        columnName: 'c1',
                        errorCode: 'REQUIRED'
                    },
                    {
                        columnName: 'c2',
                        errorCode: 'REQUIRED'
                    }
                ]
            },
            {
                rowKey: 3,
                errors: [
                    {
                        columnName: 'c2',
                        errorCode: 'REQUIRED'
                    }
                ]
            }
        ]
     */
    validate: function() {
        var errorRows = [];
        var requiredColumnNames = _.chain(this.columnModel.getVisibleColumns())
            .filter(function(columnModel) {
                return columnModel.validation && columnModel.validation.required === true;
            })
            .pluck('name')
            .value();

        this.each(function(row) {
            var errorCells = [];
            _.each(requiredColumnNames, function(columnName) {
                var errorCode = row.validateCell(columnName);
                if (errorCode) {
                    errorCells.push({
                        columnName: columnName,
                        errorCode: errorCode
                    });
                }
            });
            if (errorCells.length) {
                errorRows.push({
                    rowKey: row.get('rowKey'),
                    errors: errorCells
                });
            }
        });

        return errorRows;
    },

    /**
     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
     * @param  {Array[]} data - 붙여넣기할 데이터
     * @param  {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
     * @returns {{row: number, column: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getEndIndexToPaste: function(data, startIdx) {
        var columns = this.columnModel.getVisibleColumns(),
            rowIdx = data.length + startIdx.row - 1,
            columnIdx = Math.min(data[0].length + startIdx.column, columns.length) - 1;

        return {
            row: rowIdx,
            column: columnIdx
        };
    },

    /**
     * 주어진 행 데이터를 지정된 인덱스의 컬럼에 반영한다.
     * 셀이 수정 가능한 상태일 때만 값을 변경하며, RowSpan이 적용된 셀인 경우 MainRow인 경우에만 값을 변경한다.
     * @param  {rowData} rowData - 붙여넣을 행 데이터
     * @param  {number} rowIdx - 행 인덱스
     * @param  {number} columnStartIdx - 열 시작 인덱스
     * @param  {number} columnEndIdx - 열 종료 인덱스
     */
    _setValueForPaste: function(rowData, rowIdx, columnStartIdx, columnEndIdx) {
        var row = this.at(rowIdx),
            columnModel = this.columnModel,
            attributes = {},
            columnIdx, columnName, cellState, rowSpanData;

        if (!row) {
            row = this.append({})[0];
        }
        for (columnIdx = columnStartIdx; columnIdx <= columnEndIdx; columnIdx += 1) {
            columnName = columnModel.at(columnIdx, true).name;
            cellState = row.getCellState(columnName);
            rowSpanData = row.getRowSpanData(columnName);

            if (cellState.editable && !cellState.disabled && (!rowSpanData || rowSpanData.count >= 0)) {
                attributes[columnName] = rowData[columnIdx - columnStartIdx];
            }
        }
        row.set(attributes);
    },

    /**
     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @returns {jQuery} 해당 jQuery Element
     */
    getElement: function(rowKey, columnName) {
        var mainRowKey = this.getMainRowKey(rowKey, columnName);

        return this.domState.getElement(mainRowKey, columnName);
    },

    /**
     * Returns the count of check-available rows and checked rows.
     * @returns {{available: number, checked: number}}
     */
    getCheckedState: function() {
        var available = 0;
        var checked = 0;

        this.forEach(function(row) {
            var buttonState = row.getCellState('_button');

            if (!buttonState.disabled && buttonState.editable) {
                available += 1;
                if (row.get('_button')) {
                    checked += 1;
                }
            }
        });

        return {
            available: available,
            checked: checked
        };
    }
});

module.exports = RowList;
