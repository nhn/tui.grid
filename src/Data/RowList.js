    /**
     * @fileoverview Grid 의 Data Source 에 해당하는 Collection 과 Model 정의
     * @author Soonyoung Park <soonyoung.park@nhnent.com>
     */

    /**
     * Data 중 각 행의 데이터 모델 (DataSource)
     * @constructor
     */
    Data.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null
            }
        },
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 반환한다.
         * @return {{isDisabled: boolean, isDisabledCheck: boolean}}
         * @private
         */
        getRowState: function() {
            var extraData = this.get('_extraData'),
                rowState = extraData && extraData['rowState'],
                isDisabledCheck = false,
                isDisabled = false,
                isChecked = false,
                classNameList = [];

            if (rowState) {
                switch (rowState) {
                    case 'DISABLED':
                        isDisabled = true;
                        break;
                    case 'DISABLED_CHECK':
                        isDisabledCheck = true;
                        break;
                    case 'CHECKED':
                        isChecked = true;
                }
            }
            isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;
            if (isDisabled) {
                classNameList.push('disabled');
            }

            return {
                isDisabled: isDisabled,
                isDisabledCheck: isDisabledCheck,
                isChecked: isChecked,
                classNameList: classNameList
            };
        },
        /**
         * getRowSpanData
         *
         * rowSpan 설정값을 반환한다.
         * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData'),
                defaultData = {
                    count: 0,
                    isMainRow: true,
                    mainRowKey: this.get('rowKey')
                };
            if (!this.collection.isSortedByField()) {
                if (!columnName) {
                    return extraData['rowSpanData'];
                }else {
                    extraData = this.get('_extraData');
                    return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
                }
            } else {
                if (columnName) {
                    return defaultData;
                } else {
                    return null;
                }
            }


        },
        /**
         * html string 을 encoding 한다.
         * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
         *
         * @param {String} columnName
         * @return {String}
         * @private
         */
        getHTMLEncodedString: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                isTextType = this.grid.columnModel.isTextType(columnName),
                value = this.get(columnName),
                notUseHtmlEntity = columnModel.notUseHtmlEntity;
            if (!notUseHtmlEntity && isTextType && ne.util.hasEncodableString(value)) {
                value = ne.util.encodeHTMLEntity(value);
            }
            return value;
        },

        /**
         * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
         * text 로 전환해서 반환할 때 처리를 하여 변환한다.
         *
         * @param {String} columnName
         * @return {string}
         * @private
         */
        _getListTypeVisibleText: function(columnName) {
            var value = this.get(columnName),
                columnModel = this.grid.columnModel.getColumnModel(columnName);

            if (columnModel && columnModel.editOption && columnModel.editOption.list) {
                var resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                    editOptionList = resultOptionList && resultOptionList['optionList'] ?
                        resultOptionList['optionList'] : columnModel.editOption.list,
                    typeExpected, valueList;

                typeExpected = typeof editOptionList[0].value;
                valueList = value.toString().split(',');
                if (typeExpected !== typeof valueList[0]) {
                    _.each(valueList, function(val, index) {
                        valueList[index] = Util.convertValueType(val, typeExpected);
                    }, this);
                }
                _.each(valueList, function(val, index) {
                    var item = _.findWhere(editOptionList, {value: val});
                    valueList[index] = item && item.text || '';
                }, this);

                return valueList.join(',');
            }
        },
        /**
         * 복사 기능을 사용할 때 화면에 보여지는 데이터를 반환한다.
         * @param {String} columnName
         * @return {String}
         */
        getVisibleText: function(columnName) {
            var columnModel = this.grid.columnModel,
                value = this.get(columnName),
                editType, model,
                listTypeMap = {
                    'select': true,
                    'radio': true,
                    'checkbox': true
                };

            if (columnModel) {
                editType = columnModel.getEditType(columnName);
                model = columnModel.getColumnModel(columnName);
                //list type 의 editType 이 존재하는 경우
                if (listTypeMap[editType]) {
                    if (model.editOption && model.editOption.list && model.editOption.list[0].value) {
                        value = this._getListTypeVisibleText(columnName);
                    } else {
                        throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (typeof model.formatter === 'function') {
                        value = Util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
                    }
                }
            }
            return value.toString();
        },
        /**
         * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisable', 'isEditable'])
         * @return {{columnName: {attribute: resultValue}}} row 의 columnName 에 적용될 속성값.
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = (callbackNameList && callbackNameList.length) ?
                callbackNameList : ['optionListChange', 'isDisable', 'isEditable'];
            var callback, attribute, targetColumnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.toJSON(),
                relationListMap = this.grid.columnModel.get('relationListMap'),
                relationResult = {},
                rowState = this.getRowState();

            //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
            // relationListMap 구조 {columnName : relationList}
            _.each(relationListMap, function(relationList, columnName) {
                value = rowData[columnName];
                //relationList 를 순회하며 수행한다.
                _.each(relationList, function(relation) {
                    targetColumnList = relation.columnList;

                    //각 relation 에 걸려있는 콜백들을 수행한다.
                    _.each(callbackNameList, function(callbackName) {
                        //isDisable relation 의 경우 rowState 설정 값을 우선적으로 선택한다.
                        if (!(rowState.isDisabled && callbackName === 'isDisable')) {
                            callback = relation[callbackName];
                            if (typeof callback === 'function') {
                                attribute = '';
                                switch (callbackName) {
                                    case 'optionListChange':
                                        attribute = 'optionList';
                                        break;
                                    case 'isDisable':
                                        attribute = 'isDisabled';
                                        break;
                                    case 'isEditable':
                                        attribute = 'isEditable';
                                        break;
                                }
                                if (attribute) {
                                    //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                    _.each(targetColumnList, function(targetColumnName) {
                                        relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                        relationResult[targetColumnName][attribute] = callback(value, rowData);
                                    }, this);
                                }
                            }
                        }
                    }, this);
                }, this);
            }, this);
            return relationResult;
        }


    });

    /**
     * Raw 데이터 RowList 콜렉션. (DataSource)
     * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
     *
     * @constructor
     */
    Data.RowList = Collection.Base.extend({
        model: Data.Row,
        initialize: function(models, options) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                sortKey: 'rowKey',
                originalRowList: [],
                originalRowMap: {},
                startIndex: options.startIndex || 1,
                privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.on('change', this._onChange, this)
                .on('change:_button', this._onButtonStatusChange, this);
        },
        /**
         * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
         * @param {Array} data
         * @return {Array}
         */
        parse: function(data) {
            data = data && data['contents'] || data;
            return this.setOriginalRowList(data);
        },
        /**
         * 데이터를 grid 에서 사용하기 쉽도록 가공한다.
         * _extraData 필드에 rowSpanData 를 추가한다.
         * @param {Array} data
         * @return {Array}
         * @private
         */
        _formatData: function(data) {
            var rowList = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = rowList.length,
                row,
                i;

            for (i = 0; i < len; i++) {
                row = rowList[i] = this._baseFormat(rowList[i], i);
                if (!this.isSortedByField()) {
                    this._setExtraRowSpanData(rowList, i);
                }
            }
            return rowList;
        },
        /**
         * row 를 기본 포멧으로 wrapping 한다.
         * 추가적으로 rowKey 를 할당하고, rowState 에 따라 checkbox 의 값을 할당한다.
         *
         * @param {object} row
         * @param {number} index
         * @return {object}
         * @private
         */
        _baseFormat: function(row, index) {
            var defaultExtraData = {
                    rowSpan: null,
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
         * @param {Array} rowList
         * @param {number} index
         * @return {Array} rowList
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
                rowSpan = row['_extraData']['rowSpan'],
                rowKey = row['rowKey'],
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
         * @private
         */
        setOriginalRowList: function(rowList) {
            this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
            this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
            return this.originalRowList;
        },
        /**
         * 원본 데이터 리스트를 반환한다.
         * @param {boolean} [isClone=true]
         * @return {Array}
         */
        getOriginalRowList: function(isClone) {
            isClone = isClone === undefined ? true : isClone;
            return isClone ? _.clone(this.originalRowList) : this.originalRowList;
        },
        /**
         * 원본 row 데이터를 반환한다.
         * @param {(Number|String)} rowKey
         * @return {Object}
         */
        getOriginalRow: function(rowKey) {
            return _.clone(this.originalRowMap[rowKey]);
        },
        /**
         * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {(Number|String)}
         */
        getOriginal: function(rowKey, columnName) {
            return _.clone(this.originalRowMap[rowKey][columnName]);
        },
        /**
         * rowKey 에 해당하는 index를 반환한다.
         * @param {(Number|String)} rowKey
         * @return {Number}
         */
        indexOfRowKey: function(rowKey) {
            return this.indexOf(this.get(rowKey));
        },
        /**
         * rowData 의 프로퍼티 중 내부에서 사용하는 프로퍼티인지 여부를 반환한다.
         * - 서버로 전송 시 내부에서 사용하는 데이터 제거시 사용됨
         * @param {String} name
         * @return {boolean}
         * @private
         */
        _isPrivateProperty: function(name) {
            return $.inArray(name, this.privateProperties) !== -1;
        },
        /**
         * 현재 정렬된 상태인지 여부를 반환한다.
         * @return {Boolean}
         */
        isSortedByField: function() {
            return this.sortKey !== 'rowKey';
        },
        /**
         * sorting 한다.
         * @param {string} fieldName 정렬할 column 의 이름
         */
        sortByField: function(fieldName) {
            this.sortKey = fieldName;
            this.sort();
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
            return isRaw ? rowList : this._filter(rowList);
        },
        /**
         * rowData 변경 이벤트 핸들러.
         * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
         * @param {object} row
         * @private
         */
        _onChange: function(row) {
            var rowSpanData, changeEvent, columnModel,
                obj, i, index;

            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) return;
                    //beforeCallback 의 결과가 false 이면 모든 수행을 중지한다.
                    if (!this._executeChangeBeforeCallback(row, columnName, columnModel)) {
                        return;
                    }
                    this._syncRowSpannedData(row, columnName, value);

                    //afterChangeCallback 수행
                    this._executeChangeAfterCallback(row, columnName, columnModel);
                    //check가 disable 이 아닐 경우에만 _button 필드 변경에 따라 check
                    if (!row.getRowState().isDisabledCheck) {
                        row.set('_button', true);
                    }
                }
            }, this);
        },
        /**
         * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
         * rowSpan 된 데이터들도 함께 update 한다.
         *
         * @param {object} row row 모델
         * @param {String} columnName
         * @param {(String|Number)} value
         * @private
         */
        _syncRowSpannedData: function(row, columnName, value) {
            var index, rowSpanData, i;

            //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
            if (!this.isSortedByField()) {
                rowSpanData = row.getRowSpanData(columnName);
                if (!rowSpanData['isMainRow']) {
                    this.get(rowSpanData['mainRowKey']).set(columnName, value);
                }else {
                    index = this.indexOfRowKey(row.get('rowKey'));
                    for (i = 0; i < rowSpanData['count'] - 1; i++) {
                        this.at(i + 1 + index).set(columnName, value);
                    }
                }
            }
        },
        /**
         * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
         * @param {object} row row 모델
         * @param {String} columnName
         * @returns {{rowKey: *, columnName: *, columnData: *}}
         * @private
         */
        _createChangeCallbackEvent: function(row, columnName) {
            return {
                'rowKey' : row.get('rowKey'),
                'columnName' : columnName,
                'columnData' : row.get(columnName)
            };
        },
        /**
         * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
         * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
         *
         * @param {object} row row 모델
         * @param {String} columnName
         * @param {object} columnModel
         * @return {boolean} false 를 리턴하면 이후 로직을 수행하지 않는다.
         * @private
         */
        _executeChangeBeforeCallback: function(row, columnName, columnModel) {
            var changeEvent,
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
         *
         * @param {object} row row 모델
         * @param {String} columnName
         * @param {object} columnModel
         * @return {boolean} false 를 리턴하면 이후 로직을 수행하지 않는다.
         * @private
         */
        _executeChangeAfterCallback: function(row, columnName, columnModel) {
            var changeEvent;
            //afterChangeCallback 수행
            if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                changeEvent = this._createChangeCallbackEvent(row, columnName);
                return !!(columnModel.editOption.changeAfterCallback(changeEvent));
            }
            return true;
        },
        /**
         * _button 컬럼이 변경되었을때 radio button 에 대한 처리를 위한 이벤트 핸들러
         * @param {Object} row
         * @private
         */
        _onButtonStatusChange: function(row) {
            var selectType = this.grid.columnModel.get('selectType'),
                rowKey = row.get('rowKey'),
                checkedList;
            if (selectType === 'radio') {
                checkedList = this.where({
                    '_button' : true
                });
                _.each(checkedList, function(checked, key) {
                    if (rowKey != checked.get('rowKey')) {
                        checked.set({
                            '_button' : false
                        }, {
                            silent: true
                        });
                    }
                });
            }
        },

        /**
         * Backbone 에서 sort 연산을 위해 구현되어야 하는 interface
         * @param {object} item
         * @return {number}
         */
        comparator: function(item) {
            if (this.isSortedByField()) {
                return +item.get(this.sortKey);
            }
        },
        /**
         * rowState 를 설정한다.
         * @param {(Number|String)} rowKey
         * @param {string} rowState DISABLED|DISABLED_CHECK|CHECKED
         * @param {boolean} silent
         */
        setRowState: function(rowKey, rowState, silent) {
            this.setExtraData(rowKey, {rowState: rowState}, silent);
        },
        /**
         * row 의 extraData 를 변경한다.
         * -Backbone 내부적으로 참조형 데이터의 프로퍼티 변경시 변화를 감지하지 못하므로, 데이터를 복제하여 변경 후 set 한다.
         *
         * @param {(Number|String)} rowKey
         * @param {(Number|String)} value
         * @param {Boolean} silent
         * @return {boolean}
         */
        setExtraData: function(rowKey, value, silent) {
            var row = this.get(rowKey),
                obj = {}, extraData;

            if (row) {
                //적용
                extraData = _.clone(row.get('_extraData'));
                extraData = $.extend(extraData, value);
                obj['_extraData'] = extraData;
                row.set(obj, {
                    silent: silent
                });
                return true;
            } else {
                return false;
            }
        },



        /**
         * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
         * @param {Array} rowList
         * @return {Array}
         * @private
         */
        _filter: function(rowList) {
            var obj, filteredRowList = [];

            for (var i = 0, len = rowList.length; i < len; i++) {
                obj = {};
                //_로 시작하는 property 들은 제거한다.
                _.each(rowList[i], function(value, key) {
                    if (!this._isPrivateProperty(key)) {
                        obj[key] = value;
                    }
                }, this);
                filteredRowList.push(obj);
            }
            return filteredRowList;
        },
        /**
         * 수정된 rowList 를 반환한다.
         * @param {Object} options
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {boolean} [options.filteringColumnList=[]] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}}
         */
        getModifiedRowList: function(options) {

            var isRaw = options && options.isRaw,
                isOnlyChecked = options && options.isOnlyChecked,
                isOnlyRowKeyList = options && options.isOnlyRowKeyList,
                filteringColumnList = options && options.filteringColumnList || [],

                original = isRaw ? this.originalRowList : this._filter(this.originalRowList),
                current = isRaw ? this.toJSON() : this._filter(this.toJSON()),
                result = {
                    'createList' : [],
                    'updateList' : [],
                    'deleteList' : []
                }, item;

            original = _.indexBy(original, 'rowKey');
            current = _.indexBy(current, 'rowKey');

            /**
             * filteringColumnList 에 해당하는 필드를 null 값으로 할당한다.
             * @param {Object} row 대상 row 데이터
             * @param {Array} filteringColumnList row 필터링할 컬럼 이름 배열
             * @return {row}
             */
            function filterColumnList(row, filteringColumnList) {
                var i = 0, len = filteringColumnList.length;
                for (; i < len; i++) {
                    row[filteringColumnList[i]] = null;
                }
                return row;
            }

            // 추가/ 수정된 행 추출
            _.each(current, function(obj, rowKey) {
                item = isOnlyRowKeyList ? rowKey : obj;
                if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                    if (!original[rowKey]) {
                        result.createList.push(item);
                    } else {
                        //filtering 이 설정되어 있다면 filter 를 한다.
                        obj = filterColumnList(obj);
                        original[rowKey] = filterColumnList(original[rowKey]);
                        if (JSON.stringify(obj) !== JSON.stringify(original[rowKey])) {
                            result.updateList.push(item);
                        }
                    }
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey) {
                item = isOnlyRowKeyList ? rowKey : obj;
                if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                    if (!current[rowKey]) {
                        result.deleteList.push(item);
                    }
                }
            }, this);
            return result;
        },


        /**
         * append, prepend 시 사용할 dummy row를 생성한다.
         * @return {Object}
         * @private
         */
        _createDummyRow: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList');
            var data = {};
            for (var i = 0; i < columnModelList.length; i++) {
                data[columnModelList[i]['columnName']] = '';
            }
            return data;
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 삭제 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            var row = this.get(rowKey);
            if (row) {
                this.remove(row);
                if (isRemoveOriginalData) {
                    this.setOriginalRowList();
                }
            }
        },
        /**
         * 현재 rowList 중 at 에 해당하는 인덱스에 데이터를 append 한다.
         * @param {Object|Array} rowData Array 형태일 경우 여러 줄의 row 를 append 한다.
         * @param {number} [at=this.length] 데이터를 append 할 index
         */
        append: function(rowData, at) {
            at = at !== undefined ? at : this.length;
            rowData = rowData || this._createDummyRow();

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = this.length;


            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._formatData(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                row['_button'] = true;
                modelList.push(new Data.Row(row, {collection: this}));
            }, this);
            this.add(modelList, {
                at: at,
                merge: true
            });
        },
        /**
         * 현재 rowList 에 최상단에 데이터를 append 한다.
         * @param {Object} rowData
         */
        prepend: function(rowData) {
            this.append(rowData, 0);
        }
    });
