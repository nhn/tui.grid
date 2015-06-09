    /**
     * @fileoverview Grid 의 Data Source 에 해당하는 Collection 과 Model 정의
     * @author Soonyoung Park <soonyoung.park@nhnent.com>
     */
    /**
     * Data 중 각 행의 데이터 모델 (DataSource)
     * @constructor Data.Row
     */
    Data.Row = Model.Base.extend(/**@lends Data.Row.prototype */{
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null
            }
        },

        /**
         * 생성자 함수
         */
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 반환한다.
         * @return {{isDisabled: boolean, isDisabledCheck: boolean}} rowState 정보
         * @private
         */
        getRowState: function() {
            var extraData = this.get('_extraData'),
                rowState = extraData && extraData['rowState'],
                isDisabledCheck = false,
                isDisabled = false,
                isChecked = false;

            if (rowState === 'DISABLED') {
                isDisabled = true;
            } else if (rowState === 'DISABLED_CHECK') {
                isDisabledCheck = true;
            } else if (rowState === 'CHECKED') {
                isChecked = true;
            }

            isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;

            return {
                isDisabled: isDisabled,
                isDisabledCheck: isDisabledCheck,
                isChecked: isChecked
            };
        },
        /**
         * row의 extraData에 설정된 classNameList 를 반환한다.
         * @param {String} [columnName] columnName 이 없을 경우 row 에 정의된 className 만 반환한다.
         * @return {Array} css 클래스 이름의 배열
         */
        getClassNameList: function(columnName) {
            var classNameList = [],
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                extraData = this.get('_extraData'),
                classNameObj = extraData.className,
                rowClassNameList = (classNameObj && classNameObj['row']) ? classNameObj['row'] : [], //_extraData 의 row 에 할당된 className 을 담는다.
                columnClassNameList = (classNameObj && classNameObj['column'] && classNameObj['column'][columnName]) ? classNameObj['column'][columnName] : [], //_extraData 의 column 에 할당된 className 을 담는다.
                tmpList,
                classNameMap = {},
                columnModelClassNameList = []; //columnModel 에 할당된 className 리스트

            if (columnModel.className) {
                columnModelClassNameList.push(columnModel.className);
            }
            if (columnModel.isEllipsis) {
                columnModelClassNameList.push('ellipsis');
            }

            tmpList = [classNameList, rowClassNameList, columnClassNameList, columnModelClassNameList];

            ne.util.forEachArray(tmpList, function(list) {
                ne.util.forEachArray(list, function(item) {
                    var sliced = item.slice(' ');
                    if (ne.util.isArray(sliced)) {
                        ne.util.forEachArray(sliced, function (className) {
                            classNameMap[className] = true;
                        });
                    } else {
                        classNameMap[item] = true;
                    }
                });
            });

            ne.util.forEach(classNameMap, function(value, className) {
                classNameList.push(className);
            });

            return classNameList;
        },
        /**
         * columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {{isEditable: boolean, isDisabled: boolean}} 편집 가능여부와 disabled 상태 정보
         */
        getCellState: function(columnName) {
            var notEditableTypeList = ['_number', 'normal'],
                columnModel = this.grid.columnModel,
                isDisabled = false,
                isEditable = true,
                editType = columnModel.getEditType(columnName),
                rowState, relationResult;


            relationResult = this.getRelationResult(['isDisabled', 'isEditable'])[columnName];
            rowState = this.getRowState();

            if (columnName === '_button') {
                isDisabled = rowState.isDisabledCheck;
            } else {
                isDisabled = rowState.isDisabled;
            }
            isDisabled = isDisabled || !!(relationResult && relationResult['isDisabled']);

            if ($.inArray(editType, notEditableTypeList) !== -1) {
                isEditable = false;
            } else {
                isEditable = !(relationResult && relationResult['isEditable'] === false);
            }

            return {
                isEditable: isEditable,
                isDisabled: isDisabled
            };
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Boolean}    편집 가능한지 여부
         */
        isEditable: function(columnName) {
            var notEditableTypeList = ['_number', 'normal'],
                editType, cellState;

            editType = this.grid.columnModel.getEditType(columnName);

            if ($.inArray(editType, notEditableTypeList) !== -1) {
                return false;
            } else {
                cellState = this.getCellState(columnName);
                return cellState.isEditable;
            }
        },
        /**
         * rowKey 와 columnName 에 해당하는 셀이 disable 상태인지 여부를 반환한다.
         * @param {String} columnName   컬럼명
         * @return {Boolean}    disabled 처리를 할지 여부
         */
        isDisabled: function(columnName) {
            var cellState;
            cellState = this.getCellState(columnName);
            return cellState.isDisabled;
        },
        /**
         * getRowSpanData
         *
         * rowSpan 설정값을 반환한다.
         * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData');
            if (this.collection.isRowSpanEnable()) {
                if (!columnName) {
                    return extraData['rowSpanData'];
                } else {
                    extraData = this.get('_extraData');
                    if (extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName]) {
                        return extraData['rowSpanData'][columnName];
                    }
                }
            } else {
                if (!columnName) {
                    return null;
                }
            }
            return {
                count: 0,
                isMainRow: true,
                mainRowKey: this.get('rowKey')
            };


        },
        /**
         * html string 을 encoding 한다.
         * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
         *
         * @param {String} columnName   컬럼명
         * @return {String} 인코딩된 결과값
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
         * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
         * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
         * text 로 전환해서 반환할 때 처리를 하여 변환한다.
         *
         * @param {String} columnName   컬럼명
         * @return {String} text 형태로 가공된 문자열
         * @private
         */
        _getListTypeVisibleText: function(columnName) {
            var value = this.get(columnName),
                columnModel = this.grid.columnModel.getColumnModel(columnName);

            if (ne.util.isExisty(ne.util.pick(columnModel, 'editOption', 'list'))) {
                var resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                    editOptionList = resultOptionList && resultOptionList['optionList'] ?
                        resultOptionList['optionList'] : columnModel.editOption.list,
                    typeExpected, valueList;

                typeExpected = typeof editOptionList[0].value;
                valueList = value.toString().split(',');
                if (typeExpected !== typeof valueList[0]) {
                    valueList = _.map(valueList, function(val) {
                        return Util.convertValueType(val, typeExpected);
                    });
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
         * @param {String} columnName   컬럼명
         * @return {String} 화면에 보여지는 데이터로 가공된 문자열
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
                    if (ne.util.isExisty(ne.util.pick(model, 'editOption', 'list', 0, 'value'))) {
                        value = this._getListTypeVisibleText(columnName);
                    } else {
                        throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (_.isFunction(model.formatter)) {
                        value = Util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
                    }
                }
            }
            value = !ne.util.isUndefined(value) ? value.toString() : value;
            return value;
        },
        /**
         * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisabled', 'isEditable'])
         * @return {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = (callbackNameList && callbackNameList.length) ?
                callbackNameList : ['optionListChange', 'isDisabled', 'isEditable'];
            var callback, attribute, targetColumnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.attributes,
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
                        //isDisabled relation 의 경우 rowState 설정 값을 우선적으로 선택한다.
                        if (!(rowState.isDisabled && callbackName === 'isDisabled')) {
                            callback = relation[callbackName];
                            if (typeof callback === 'function') {
                                attribute = '';
                                if (callbackName === 'optionListChange') {
                                    attribute = 'optionList';
                                } else if (callbackName === 'isDisabled') {
                                    attribute = 'isDisabled';
                                } else if (callbackName === 'isEditable') {
                                    attribute = 'isEditable';
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
            var rowList = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName');

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
         * 현재 정렬된 상태인지 여부를 반환한다.
         * @return {Boolean}    정렬된 상태인지 여부
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
            return isRaw ? rowList : this._removePrivateProp(rowList);
        },
        /**
         * rowData 변경 이벤트 핸들러.
         * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
         * @param {object} row  데이터의 키값
         * @private
         */
        _onChange: function(row) {
            var columnModel;

            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) {
                        return;
                    }
                    //beforeCallback 의 결과가 false 이면 모든 수행을 중지한다.
                    if (!this._executeChangeBeforeCallback(row, columnName)) {
                        return;
                    }
                    this._syncRowSpannedData(row, columnName, value);

                    //afterChangeCallback 수행
                    this._executeChangeAfterCallback(row, columnName);

                    //check 가 disable 이 아니고, columnModel 에 isIgnore 가 설정되지 않았을 경우, _button 필드 변경에 따라 check
                    if (!row.getRowState().isDisabledCheck && !columnModel.isIgnore) {
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
         * @param {String} columnName   변경이 발생한 컬럼명
         * @param {(String|Number)} value 변경된 값
         * @private
         */
        _syncRowSpannedData: function(row, columnName, value) {
            var index,
                rowSpanData,
                i;

            //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
            if (this.isRowSpanEnable()) {
                rowSpanData = row.getRowSpanData(columnName);
                if (!rowSpanData['isMainRow']) {
                    this.get(rowSpanData['mainRowKey']).set(columnName, value);
                } else {
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
         * @param {String} columnName 컬럼명
         * @return {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}} changeCallback 에 전달될 이벤트 객체
         * @private
         */
        _createChangeCallbackEvent: function(row, columnName) {
            return {
                'rowKey' : row.get('rowKey'),
                'columnName' : columnName,
                'value' : row.get(columnName),
                'instance': this.grid.publicInstance
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
         *
         * @param {object} row row 모델
         * @param {String} columnName
         * @return {boolean} changeAfterCallback 수행 결과값
         * @private
         */
        _executeChangeAfterCallback: function(row, columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                changeEvent;
            //afterChangeCallback 수행
            if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                changeEvent = this._createChangeCallbackEvent(row, columnName);
                return !!(columnModel.editOption.changeAfterCallback(changeEvent));
            }
            return true;
        },

        /**
         * Backbone 에서 sort 연산을 위해 구현되어야 하는 interface
         * @param {object} row row 모델
         * @return {number}
         */
        comparator: function(row) {
            if (this.isSortedByField()) {
                return +row.get(this.sortKey);
            }
        },
        /**
         * row 의 extraData 를 변경한다.
         * -Backbone 내부적으로 참조형 데이터의 프로퍼티 변경시 변화를 감지하지 못하므로, 데이터를 복제하여 변경 후 set 한다.
         *
         * @param {(Number|String)} rowKey  데이터의 키값
         * @param {Object} value    extraData 에 설정될 값
         * @param {Boolean} [silent=false] Backbone 의 'change' 이벤트 발생 여부
         * @return {boolean} rowKey 에 해당하는 데이터가 존재하는지 여부.
         */
        setExtraData: function(rowKey, value, silent) {
            var row = this.get(rowKey),
                obj = {},
                extraData;

            if (row) {
                //적용
                extraData = $.extend(true, {}, row.get('_extraData'));
                extraData = $.extend(true, extraData, value);
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
         * rowState 를 설정한다.
         * @param {(Number|String)} rowKey 데이터의 키값
         * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
         * @param {boolean} silent 내부 change 이벤트 발생 여부
         */
        setRowState: function(rowKey, rowState, silent) {
            this.setExtraData(rowKey, {rowState: rowState}, silent);
        },
        /**
         * rowKey 에 해당하는 _extraData 를 복제하여 반환한다.
         * @param {(Number|String)} rowKey  데이터의 키값
         * @return {object} 조회한 rowKey 에 해당하는 extraData 사본
         * @private
         */
        _getExtraDataClone: function(rowKey) {
            var row = this.get(rowKey),
                extraData;

            if (row) {
                extraData = $.extend(true, {}, row.get('_extraData'));
                return extraData;
            }
        },
        /**
         * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
         * @param {Array} classNameList 디자인 클래스명 리스트
         * @param {String} className    제거할 클래스명
         * @return {Array}  제거된 디자인 클래스명 리스트
         * @private
         */
        _removeClassNameFromArray: function(classNameList, className) {
            //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
            var classNameString = classNameList.join(' ');
            classNameList = classNameString.split(' ');
            return _.without(classNameList, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        removeCellClassName: function(rowKey, columnName, className) {
            var extraData = this._getExtraDataClone(rowKey),
                row = this.get(rowKey),
                classNameData;

            if (ne.util.isExisty(ne.util.pick(extraData, 'className', 'column', columnName))) {
                classNameData = extraData.className;
                classNameData.column[columnName] = this._removeClassNameFromArray(classNameData.column[columnName], className);
                row.set('_extraData', extraData);
            }
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        removeRowClassName: function(rowKey, className) {
            var extraData = this._getExtraDataClone(rowKey),
                row = this.get(rowKey),
                classNameData;

            if (extraData && extraData.className && extraData.className.row) {
                classNameData = extraData.className;
                classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
                //배열 제거이기 때문에 deep extend 를 하는 setExtraData 를 호출하면 삭제가 반영되지 않는다.
                row.set('_extraData', extraData);
            }
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        addCellClassName: function(rowKey, columnName, className) {
            var extraData = this._getExtraDataClone(rowKey),
                classNameData,
                classNameList;

            if (!ne.util.isUndefined(extraData)) {
                classNameData = extraData.className || {};
                classNameData.column = classNameData.column || {};
                classNameList = classNameData.column[columnName] || [];

                if (ne.util.inArray(className, classNameList) === -1) {
                    classNameList.push(className);
                    classNameData.column[columnName] = classNameList;
                    this.setExtraData(rowKey, {className: classNameData});
                }
            }
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        addRowClassName: function(rowKey, className) {
            var extraData = this._getExtraDataClone(rowKey),
                classNameData,
                classNameList;

            if (!ne.util.isUndefined(extraData)) {
                classNameData = extraData.className || {};
                classNameList = classNameData.row || [];

                if (ne.util.inArray(className, classNameList) === -1) {
                    classNameList.push(className);
                    classNameData.row = classNameList;
                    this.setExtraData(rowKey, {className: classNameData});
                }
            }
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
                this.remove(row);
                if (isRemoveOriginalData) {
                    this.setOriginalRowList();
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
         * @param {Object} rowData  prepend 할 행 데이터
         */
        prepend: function(rowData) {
            this.append(rowData, 0);
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
