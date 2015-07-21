/**
 * Raw 데이터 RowList 콜렉션. (DataSource)
 * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
 *
 * @constructor Data.RowList
 */
Data.RowList = Collection.Base.extend(/**@lends Data.RowList.prototype */{
    model: Data.Row,
    /**
     * 생성자 함수
     * @param {Array} models    콜랙션에 추가할 model 리스트
     * @param {Object} options   생성자의 option 객체
     */
    initialize: function(models, options) {
        Collection.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            originalRowList: [],
            originalRowMap: {},
            startIndex: options.startIndex || 1,
            privateProperties: [
                '_button',
                '_number',
                '_extraData'
            ],
            sortOptions: {
                columnName: 'rowKey',
                isAscending: true,
                useClient: (ne.util.isBoolean(options.useClientSort) ? options.useClientSort : true)
            }
        });
        if (!this.sortOptions.useClient) {
            this.comparator = null;
        }

        this.on('change', this._onChange, this);
    },
    /**
     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
     * @param {Array} data  원본 데이터
     * @return {Array}  파싱하여 가공된 데이터
     */
    parse: function(data) {
        data = data && data['contents'] || data;
        return this._formatData(data);
    },
    /**
     * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
     * _extraData 필드에 rowSpanData 를 추가한다.
     * @param {Array} data  가공할 데이터
     * @return {Array} 가공된 데이터
     * @private
     */
    _formatData: function(data) {
        var rowList = data;

        _.each(rowList, function(row, i) {
            rowList[i] = this._baseFormat(rowList[i], i);
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
     * @return {object} 가공된 row 데이터
     * @private
     */
    _baseFormat: function(row, index) {
        var defaultExtraData = {
                rowSpan: null,
                rowSpanData: null,
                rowState: null
            },
            keyColumnName = this.grid.columnModel.get('keyColumnName'),
            rowKey = (keyColumnName === null) ? index : row[keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성

        row['_extraData'] = $.extend(defaultExtraData, row['_extraData']);
        row['_button'] = (row['_extraData']['rowState'] === 'CHECKED');
        row['rowKey'] = rowKey;
        return row;
    },
    /**
     * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
     * @param {Array} rowList   전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
     * @param {number} index    해당 배열에서 extraData 를 설정할 배열
     * @return {Array} rowList  가공된 rowList
     * @private
     */
    _setExtraRowSpanData: function(rowList, index) {
        function hasRowSpanData(row, columnName) {
            var extraData = row['_extraData'];
            return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
        }
        function setRowSpanData(row, columnName, rowSpanData) {
            var extraData = row['_extraData'];
            extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
            extraData['rowSpanData'][columnName] = rowSpanData;
            return extraData;
        }

        var row = rowList[index],
            rowSpan = row && row['_extraData'] && row['_extraData']['rowSpan'],
            rowKey = row && row['rowKey'],
            subCount,
            childRow,
            i;

        if (rowSpan) {
            _.each(rowSpan, function(count, columnName) {
                if (!hasRowSpanData(row, columnName)) {
                    setRowSpanData(row, columnName, {
                        count: count,
                        isMainRow: true,
                        mainRowKey: rowKey
                    });
                    //rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
                    subCount = -1;
                    for (i = index + 1; i < index + count; i++) {
                        childRow = rowList[i];
                        childRow[columnName] = row[columnName];
                        childRow['_extraData'] = childRow['_extraData'] || {};
                        setRowSpanData(childRow, columnName, {
                            count: subCount--,
                            isMainRow: false,
                            mainRowKey: rowKey
                        });
                    }
                }
            });
        }
        return rowList;
    },
    /**
     * originalRowList 와 originalRowMap 을 생성한다.
     * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRowList 로 저장한다.
     * @return {Array} format 을 거친 데이터 리스트.
     */
    setOriginalRowList: function(rowList) {
        this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
        this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
        return this.originalRowList;
    },
    /**
     * 원본 데이터 리스트를 반환한다.
     * @param {boolean} [isClone=true]  데이터 복제 여부.
     * @return {Array}  원본 데이터 리스트 배열.
     */
    getOriginalRowList: function(isClone) {
        isClone = isClone === undefined ? true : isClone;
        return isClone ? _.clone(this.originalRowList) : this.originalRowList;
    },
    /**
     * 원본 row 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @return {Object} 해당 행의 원본 데이터값
     */
    getOriginalRow: function(rowKey) {
        return _.clone(this.originalRowMap[rowKey]);
    },
    /**
     * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
     */
    getOriginal: function(rowKey, columnName) {
        return _.clone(this.originalRowMap[rowKey][columnName]);
    },
    /**
     * mainRowKey 를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
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
     * @return {Number} 키값에 해당하는 row의 인덱스
     */
    indexOfRowKey: function(rowKey) {
        return this.indexOf(this.get(rowKey));
    },
    /**
     * rowData 의 프로퍼티 중 내부에서 사용하는 프로퍼티인지 여부를 반환한다.
     * - 서버로 전송 시 내부에서 사용하는 데이터 제거시 사용 됨
     * @param {String} name 확인할 프로퍼티 명
     * @return {boolean}    private 프로퍼티인지 여부.
     * @private
     */
    _isPrivateProperty: function(name) {
        return $.inArray(name, this.privateProperties) !== -1;
    },
    /**
     * rowSpan 이 적용되어야 하는지 여부를 반환한다.
     * 랜더링시 사용된다.
     * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
     * @return {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
     */
    isRowSpanEnable: function() {
        return !this.isSortedByField();
    },
    /**
     * 현재 RowKey가 아닌 다른 컬럼에 의해 정렬된 상태인지 여부를 반환한다.
     * @return {Boolean}    정렬된 상태인지 여부
     */
    isSortedByField: function() {
        return this.sortOptions.columnName !== 'rowKey';
    },
    /**
     * 정렬옵션 객체의 값을 변경하고, 변경된 값이 있을 경우 sortChanged 이벤트를 발생시킨다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} isAscending 오름차순 여부
     * @param {boolean} isRequireFetch 서버 데이타의 갱신이 필요한지 여부
     */
    setSortOptionValues: function(columnName, isAscending, isRequireFetch) {
        var options = this.sortOptions,
            isChanged = false;

        if (ne.util.isUndefined(columnName)) {
            columnName = 'rowKey';
        }
        if (ne.util.isUndefined(isAscending)) {
            isAscending = true;
        }

        if (options.columnName !== columnName || options.isAscending !== isAscending) {
            isChanged = true;
        }
        options.columnName = columnName;
        options.isAscending = isAscending;

        if (isChanged) {
            this.trigger('sortChanged', {
                columnName: columnName,
                isAscending: isAscending,
                isRequireFetch: isRequireFetch
            });
        }
    },
    /**
     * 주어진 컬럼명을 기준으로 오름/내림차순 정렬한다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} isAscending 오름차순 여부
     */
    sortByField: function(columnName, isAscending) {
        var options = this.sortOptions;

        if (ne.util.isUndefined(isAscending)) {
            isAscending = (options.columnName === columnName) ? !options.isAscending : true;
        }
        this.setSortOptionValues(columnName, isAscending, !options.useClient);

        if (options.useClient) {
            this.sort();
        }
    },
    /**
     * rowList 를 반환한다.
     * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     */
    getRowList: function(isOnlyChecked, isRaw) {
        var rowList,
            checkedRowList;
        if (isOnlyChecked) {
            checkedRowList = this.where({
                '_button' : true
            });
            rowList = [];
            _.each(checkedRowList, function(checkedRow) {
                rowList.push(checkedRow.attributes);
            }, this);
        } else {
            rowList = this.toJSON();
        }
        return isRaw ? rowList : this._removePrivateProp(rowList);
    },
    /**
     * rowData 변경 이벤트 핸들러.
     * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
     * @param {object} row  데이터의 키값
     * @private
     */
    _onChange: function(row) {
        var columnModel,
            publicChanged = _.omit(row.changed, this.privateProperties);

        if (row.isDuplicatedPublicChanged(publicChanged)) {
            return;
        }
        _.each(publicChanged, function(value, columnName) {
            columnModel = this.grid.columnModel.getColumnModel(columnName);
            if (!columnModel) {
                return;
            }
            if (!this._executeChangeBeforeCallback(row, columnName)) {
                return;
            }
            this._syncRowSpannedData(row, columnName, value);
            this._executeChangeAfterCallback(row, columnName);
            if (!row.getRowState().isDisabledCheck && !columnModel.isIgnore) {
                row.set('_button', true);
            }
        }, this);
    },
    /**
     * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
     * rowSpan 된 데이터들도 함께 update 한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   변경이 발생한 컬럼명
     * @param {(String|Number)} value 변경된 값
     * @private
     */
    _syncRowSpannedData: function(row, columnName, value) {
        var index, rowSpanData, i;

        //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
        if (this.isRowSpanEnable()) {
            rowSpanData = row.getRowSpanData(columnName);
            if (!rowSpanData['isMainRow']) {
                this.get(rowSpanData['mainRowKey']).set(columnName, value);
            } else {
                index = this.indexOfRowKey(row.get('rowKey'));
                for (i = 0; i < rowSpanData['count'] - 1; i += 1) {
                    this.at(i + 1 + index).set(columnName, value);
                }
            }
        }
    },
    /**
     * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
     * @param {object} row row 모델
     * @param {String} columnName 컬럼명
     * @return {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}} changeCallback 에 전달될 이벤트 객체
     * @private
     */
    _createChangeCallbackEvent: function(row, columnName) {
        return {
            rowKey: row.get('rowKey'),
            columnName: columnName,
            value: row.get(columnName),
            instance: this.grid.publicInstance
        };
    },
    /**
     * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
     * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   컬럼명
     * @return {boolean} changeBeforeCallback 수행 결과값
     * @private
     */
    _executeChangeBeforeCallback: function(row, columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            changeEvent,
            obj;
        if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
            changeEvent = this._createChangeCallbackEvent(row, columnName);
            //beforeChangeCallback 의 결과값이 false 라면 restore 후 false 를 반환한다.
            if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                obj = {};
                obj[columnName] = row.previous(columnName);
                row.set(obj);
                row.trigger('restore', {
                    changed: obj
                });
                return false;
            }
        }
        return true;
    },
    /**
     * columnModel 에 정의된 changeAfterCallback 을 수행한다.
     * @param {object} row - row 모델
     * @param {String} columnName - 컬럼명
     * @return {boolean} changeAfterCallback 수행 결과값
     * @private
     */
    _executeChangeAfterCallback: function(row, columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            changeEvent;

        if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
            changeEvent = this._createChangeCallbackEvent(row, columnName);
            return !!(columnModel.editOption.changeAfterCallback(changeEvent));
        }
        return true;
    },

    /**
     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
     * @param {Data.Row} a 비교할 앞의 모델
     * @param {Data.Row} b 비교할 뒤의 모델
     * @return {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
     */
    comparator: function(a, b) {
        var columnName = this.sortOptions.columnName,
            isAscending = this.sortOptions.isAscending,
            valueA = a.get(columnName),
            valueB = b.get(columnName),
            result = 0;

        if (valueA < valueB) {
            result = -1;
        } else if (valueA > valueB) {
            result = 1;
        }

        if (!isAscending) {
            result = -result;
        }
        return result;
    },

    /**
     * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
     * @param {Array} rowList   내부에 설정된 rowList 배열
     * @return {Array}  private 프로퍼티를 제거한 결과값
     * @private
     */
    _removePrivateProp: function(rowList) {
        var obj,
            filteredRowList = [];

        _.each(rowList, function(row) {
            obj = {};
            //_로 시작하는 property 들은 제거한다.
            _.each(row, function(value, key) {
                if (!this._isPrivateProperty(key)) {
                    obj[key] = value;
                }
            }, this);
            filteredRowList.push(obj);
        }, this);

        return filteredRowList;
    },
    /**
     * rowKey 에 해당하는 그리드 데이터를 삭제한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 삭제 여부
     */
    removeRow: function(rowKey, isRemoveOriginalData) {
        var row = this.get(rowKey);
        if (row) {
            this._syncRowSpanDataForRemove(row);
            this.remove(row);
            if (isRemoveOriginalData) {
                this.setOriginalRowList();
            }
        }
    },
    /**
     * 삭제할 행에 rowSpan이 적용되어 있는 경우, 관련된 행들의 rowSpan데이터를 갱신한다.
     * @param {Data.Row} row 삭제할 Row
     * @private
     */
    _syncRowSpanDataForRemove: function(row) {
        var rowSpanData = row.getRowSpanData();

        if (!rowSpanData) {
            return;
        }
        _.each(rowSpanData, function(data, columnName) {
            var mainRow = this.get(data.mainRowKey);

            if (data.isMainRow) {
                this._updateRowSpanColumnDataForRemove(mainRow, columnName, data.count - 1);
            } else {
                mainRow.getRowSpanData()[columnName].count -= 1;
            }
        }, this);
    },
    /**
     * rowSpan의 mainRow가 삭제되는 경우, 관련된 하위 행들의 rowSpan 데이터를 갱신하고, 바로 다음 행을 mainRow로 지정한다.
     * @param {Data.Row} mainRow 삭제되는 mainRow
     * @param {string} columnName rowSpan이 적용된 컬럼명
     * @param {number} count 관련된 하위 행들의 수
     * @private
     */
    _updateRowSpanColumnDataForRemove: function(mainRow, columnName, count) {
        var idx = this.indexOf(mainRow) + 1,
            lastIdx = idx + count - 1,
            row, newMainRowKey, spanData;

        for (; idx <= lastIdx; idx += 1) {
            row = this.at(idx);
            spanData = row.getRowSpanData()[columnName];
            spanData.count += 1;

            if (!newMainRowKey) {
                spanData.isMainRow = true;
                spanData.count = count;
                newMainRowKey = row.get('rowKey');
                row.set(columnName, '');
            } else {
                spanData.mainRowKey = newMainRowKey;
            }
        }
    },
    /**
     * append, prepend 시 사용할 dummy row를 생성한다.
     * @return {Object} 값이 비어있는 더미 row 데이터
     * @private
     */
    _createDummyRow: function() {
        var columnModelList = this.grid.columnModel.get('columnModelList'),
            data = {};
        _.each(columnModelList, function(columnModel) {
            data[columnModel['columnName']] = '';
        }, this);
        return data;
    },

    /**
     * 현재 rowList 중 at 에 해당하는 인덱스에 데이터를 append 한다.
     * @param {object|array} rowData - 행 추가할 데이터. Array일 경우 여러행를 동시에 추가한다.
     * @param {object} [options] - 옵션 객체
     * @param {number} [options.at] - 데이터를 append 할 index
     * @param {boolean} [options.rowSpanPrev] - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
     */
    append: function(rowData, options) {
        var modelList = this._createModelList(rowData),
            addOptions;

        options = _.extend({at: this.length}, options);
        addOptions = {
            at: options.at,
            merge: true,
            silent: true
        };

        this.add(modelList, addOptions);
        this._syncRowSpanDataForAppend(options.at, modelList.length, options.rowSpanPrev);
        this.trigger('add', modelList, addOptions);
    },

    /**
     * 현재 rowList 에 최상단에 데이터를 append 한다.
     * @param {Object} rowData  prepend 할 행 데이터
     */
    prepend: function(rowData) {
        this.append(rowData, {
            at: 0
        });
    },

    /**
     * 주어진 데이터로 모델 목록을 생성하여 반환한다.
     * @param {object|array} rowData - 모델을 생성할 데이터. Array일 경우 여러개를 동시에 생성한다.
     * @return {Data.Row[]} 생성된 모델 목록
     */
    _createModelList: function(rowData) {
        var modelList = [],
            keyColumnName = this.grid.columnModel.get('keyColumnName'),
            rowList;

        rowData = rowData || this._createDummyRow();
        if (!ne.util.isArray(rowData)) {
            rowData = [rowData];
        }
        rowList = this._formatData(rowData);

        _.each(rowList, function(row, index) {
            row.rowKey = keyColumnName ? row[keyColumnName] : this.length + index;
            row._button = true;
            modelList.push(new Data.Row(row, {collection: this}));
        }, this);

        return modelList;
    },

    /**
     * 새로운 행이 추가되었을 때, 관련된 주변 행들의 rowSpan 데이터를 갱신한다.
     * @param {number} index - 추가된 행의 인덱스
     * @param {number} length - 추가된 행의 개수
     * @param {boolean} rowSpanPrev - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
     */
    _syncRowSpanDataForAppend: function(index, length, rowSpanPrev) {
        var prevRow = this.at(index - 1);

        if (!prevRow) {
            return;
        }
        _.each(prevRow.getRowSpanData(), function(data, columnName) {
            var mainRow, mainRowData, startOffset, endOffset;

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

            if (mainRowData.count > startOffset || rowSpanPrev) {
                mainRowData.count += length;
                endOffset = mainRowData.count - 1;

                this._updateRowSpanColumnDataForAppend(mainRow, columnName, startOffset, endOffset);
            }
        }, this);
    },

    /**
     * 특정 컬럼의 rowSpan 데이터를 주어진 범위만큼 갱신한다.
     * @param {Data.Row} mainRow - rowSpan의 첫번째 행
     * @param {string} columnName - 컬럼명
     * @param {number} startOffset - mainRow로부터 몇번째 떨어진 행부터 갱신할지를 지정하는 값
     * @param {number} endOffset - mainRow로부터 몇번째 떨어진 행까지 갱신할지를 지정하는 값
     */
    _updateRowSpanColumnDataForAppend: function(mainRow, columnName, startOffset, endOffset) {
        var mainRowIdx = this.indexOf(mainRow),
            mainRowKey = mainRow.get('rowKey'),
            row, offset;

        for (offset = startOffset; offset <= endOffset; offset += 1) {
            row = this.at(mainRowIdx + offset);
            row.set(columnName, '', {
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
     * 수정된 rowList 를 반환한다.
     * @param {Object} options
     *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
     *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
     * @return {{createList: Array, updateList: Array, deleteList: Array}} options 조건에 해당하는 수정된 rowList 정보
     */
    getModifiedRowList: function(options) {
        var isRaw = options && options.isRaw,
            isOnlyChecked = options && options.isOnlyChecked,
            isOnlyRowKeyList = options && options.isOnlyRowKeyList,
            original = isRaw ? this.originalRowList : this._removePrivateProp(this.originalRowList),
            current = isRaw ? this.toJSON() : this._removePrivateProp(this.toJSON()),
            result = {
                'createList' : [],
                'updateList' : [],
                'deleteList' : []
            },
            filteringColumnMap = {},
            filteringColumnList = _.union(options && options.filteringColumnList || [],
                this.grid.columnModel.getIngoredColumnNameList()),
            item;

        _.each(filteringColumnList, function(columnName) {
            filteringColumnMap[columnName] = true;
        });

        original = _.indexBy(original, 'rowKey');
        current = _.indexBy(current, 'rowKey');

        // 추가/ 수정된 행 추출
        _.each(current, function(row, rowKey) {
            var isDiff,
                originalRow = original[rowKey];
            item = isOnlyRowKeyList ? row['rowKey'] : row;
            if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                if (!originalRow) {
                    result.createList.push(item);
                } else {
                    //filtering 이 설정되어 있다면 filter 를 한다.
                    _.each(row, function(value, columnName) {
                        if (!filteringColumnMap[columnName]) {
                            if (typeof value === 'object') {
                                isDiff = ($.toJSON(value) !== $.toJSON(originalRow[columnName]));
                            } else {
                                isDiff = value !== originalRow[columnName];
                            }
                            if (isDiff) {
                                result.updateList.push(item);
                            }
                        }
                    }, this);
                }
            }
        }, this);

        //삭제된 행 추출
        _.each(original, function(obj, rowKey) {
            item = isOnlyRowKeyList ? obj['rowKey'] : obj;
            if (!current[rowKey]) {
                result.deleteList.push(item);
            }
        }, this);
        return result;
    }
});
