    /**
     * Row Data 모델
     * @class
     */
    Data.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null,
                'selected' : false,
                'focused' : ''
            }
        },
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 리턴한다.
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
         * rowSpan 관련 data 가져온다.
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData'), defaultData;
            if (!columnName) {
                return extraData['rowSpanData'];
            }else {
                extraData = this.get('_extraData');
                defaultData = {
                    count: 0,
                    isMainRow: true,
                    mainRowKey: this.get('rowKey')
                };
                return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
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
        getTagFiltered: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                editType = this.grid.columnModel.getEditType(columnName),
                value = this.get(columnName),
                notUseHtmlEntity = columnModel.notUseHtmlEntity;
            if (!notUseHtmlEntity && (!editType || editType === 'text') && Util.hasTagString(value)) {
                value = Util.encodeHTMLEntity(value);
            }
            return value;
        },
        /**
         * type 인자에 맞게 value type 을 convert 한다.
         * List 형태에서 editOption.list 에서 검색을 위해 value type 해당 type 에 맞게 변환한다.
         * @param {Number|String} value
         * @param {String} type
         * @return {Number|String}
         * @private
         */
        _convertValueType: function(value, type) {
            if (type === 'string') {
                return value.toString();
            } else if (type === 'number') {
                return value * 1;
            } else {
                return value;
            }
        },
        /**
         * List type 의 경우 실제 데이터와 editOption.list 의 데이터가 다르기 때문에
         * text 로 전환해서 리턴할 때 처리를 하여 변환한다.
         *
         * @param {Number|String} value
         * @param {Object} columnModel
         * @return {string}
         * @private
         */
        _getListTypeVisibleText: function(value, columnModel) {
            var columnName = columnModel['columnName'],
                resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list,
                typeExpected, valueList;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                _.each(valueList, function(val, index) {
                    valueList[index] = this._convertValueType(val, typeExpected);
                }, this);
            }
            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                valueList[index] = item && item.text || '';
            }, this);

            return valueList.join(',');
        },
        /**
         * getRelationResult
         * 컬럼모델에 정의된 relation 을 수행한 결과를 반환한다.
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisable', 'isEditable'])
         * @return {{columnName: {attribute: resultValue}}}
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = callbackNameList || ['optionListChange', 'isDisable', 'isEditable'];

            var callback, attribute, columnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.toJSON(),
                relationListMap = this.grid.columnModel.get('relationListMap'),
                relationResult = {};

            //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
            // relationListMap 구조 {columnName : relationList}
            _.each(relationListMap, function(relationList, columnName) {
                value = rowData[columnName];

                //relationList 를 순회하며 수행한다.
                _.each(relationList, function(relation) {
                    columnList = relation.columnList;

                    //각 relation 에 걸려있는 콜백들을 수행한다.
                    _.each(callbackNameList, function(callbackName) {
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
                                _.each(columnList, function(targetColumnName) {
                                    relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                    relationResult[targetColumnName][attribute] = callback(value, rowData);
                                }, this);
                            }
                        }
                    }, this);
                }, this);
            }, this);
            return relationResult;
        },
        /**
         * 화면에 보여지는 데이터를 반환한다.
         * @param {String} columnName
         * @return {*}
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
                        value = this._getListTypeVisibleText(value, model);
                    } else {
                       throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (typeof model.formatter === 'function') {
                        value = Util.stripTags(model.formatter(this.getTagFiltered(columnName), this.toJSON(), model));
                    }
                }
            }
            return value;
        }

    });
    /**
     * 실제 데이터 RowList 콜렉션
     * @class
     */
    Data.RowList = Collection.Base.extend({
        model: Data.Row,

        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _sortKey: 'rowKey',
                _originalRowList: [],
                _originalRowMap: {},
                _startIndex: attributes.startIndex || 1,
                _privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.listenTo(this.grid.focusModel, 'change', this._onFocusChange, this);
            this.on('change', this._onChange, this);
            this.on('change:_button', this._onCheckChange, this);
    //            this.on('sort add remove reset', this._onSort, this);
            this.on('sort', this._onSort, this);
            this.on('all', this.test1, this);
        },
        test1: function() {
                console.log('#####TEST', arguments);
        },
        /**
         * rowKey 의 index를 가져온다.
         * @param {Number|String} rowKey
         * @return {Number}
         */
        indexOfRowKey: function(rowKey) {
            return this.indexOf(this.get(rowKey));
        },
        _onSort: function() {
            this._refreshNumber();
        },
        _refreshNumber: function() {
            for (var i = 0; i < this.length; i++) {
                this.at(i).set('_number', this._startIndex + i, {silent: true});
            }
        },

        _isPrivateProperty: function(name) {
            return $.inArray(name, this._privateProperties) !== -1;
        },
        _onChange: function(row) {
            var getChangeEvent = function(row, columnName) {
                return {
                    'rowKey' : row.get('rowKey'),
                    'columnName' : columnName,
                    'columnData' : row.get(columnName)
                };
            };
            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    var columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) return;
                    var rowSpanData = row.getRowSpanData(columnName);

                    var changeEvent = getChangeEvent(row, columnName);
                    var obj;
                    //beforeChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
                        if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                            obj = {};
                            obj[columnName] = row.previous(columnName);
                            row.set(obj);
                            row.trigger('restore', {
                                changed: obj
                            });
                            return;
                        }
                    }
                    //sorted 가 되지 않았다면, rowSpan 된 데이터들도 함께 update
                    if (!this.isSortedByField()) {
                        if (!rowSpanData['isMainRow']) {
                            this.get(rowSpanData['mainRowKey']).set(columnName, value);
                        }else {
                            var index = this.indexOfRowKey(row.get('rowKey'));
                            for (var i = 0; i < rowSpanData['count'] - 1; i++) {
                                this.at(i + 1 + index).set(columnName, value);
                            }
                        }
                    }

                    changeEvent = getChangeEvent(row, columnName);
                    //afterChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                        columnModel.editOption.changeAfterCallback(changeEvent);
                    }
                    //check가 disable 이 아닐 경우에만.
                    if (!row.getRowState().isDisabledCheck) {
                        row.set('_button', true);
                    }
                }
            }, this);
        },
        _onCheckChange: function(row) {
            var columnModel = this.grid.columnModel.getColumnModel('_button'),
                selectType = this.grid.option('selectType'),
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
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSortedByField: function() {
            return this._sortKey !== 'rowKey';
        },
        sortByField: function(fieldName) {
            this._sortKey = fieldName;
            this.sort();
        },
        comparator: function(item) {
            if (this.isSortedByField()) {
                return item.get(this._sortKey) * 1;
            }
        },
        /**
         * cell 값을 변경한다.
         * @param rowKey
         * @param columnName
         * @param columnValue
         * @param silent
         * @return {boolean}
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            var row = this.get(rowKey),
                obj = {};
            if (row) {
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        /**
         * column 에 해당하는 값을 전부 변경한다.
         * @param columnName
         * @param columnValue
         * @param silent
         */
        setColumnValue: function(columnName, columnValue, silent) {
            var obj = {};
            obj[columnName] = columnValue;
            this.forEach(function(row, key) {
                row.set(obj, {
                    silent: silent
                });
            }, this);
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
            }else {
                return false;
            }
        },
        _onFocusChange: function(focusModel) {
            var selected = true,
                rowKey = focusModel.get('rowKey');
            _.each(focusModel.changed, function(value, name) {
                if (name === 'rowKey') {
                    if (value === null) {
                        value = focusModel.previous('rowKey');
                        selected = false;
                    }
                    this.setExtraData(value, { selected: selected});

                } else if (name === 'columnName') {
                    this.setExtraData(rowKey, { focused: value});
                }
            }, this);
        },

        parse: function(data) {
            data = data && data['contents'] || data;
            this.setOriginalRowList(this._format(data));
            return this._originalRowList;
        },

        /**
         * originalRowList 와 originalRowMap 을 생성한다.
         * @param {Array} rowList rowList 가 없을 시 현재 설정된 데이터를 originalRowList 로 저장한다.
         * @private
         */
        setOriginalRowList: function(rowList) {
            this._originalRowList = rowList || this.toJSON();
            this._originalRowMap = _.indexBy(this._originalRowList, 'rowKey');
        },
        /**
         *
         * @param {boolean} [isClone=true]
         * @return {Array}
         */
        getOriginalRowList: function(isClone) {
            isClone = isClone === undefined ? true : isClone;
            return isClone ? _.clone(this._originalRowList) : this._originalRowList;
        },
        /**
         * original row 을 리턴한다.
         * @param {(Number|String)} rowKey
         * @return {Object}
         */
        getOriginalRow: function(rowKey) {
            return _.clone(this._originalRowMap[rowKey]);
        },
        /**
         * rowKey 와 columnName 에 해당하는 데이터를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {(Number|String)}
         */
        getOriginal: function(rowKey, columnName) {
            return _.clone(this._originalRowMap[rowKey][columnName]);
        },

        /**
         * 내부 변수를 제거한다.
         * @param rowList
         * @return {Array}
         * @private
         */
        _filterRowList: function(rowList) {
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
         * @return {{inserted: Array, edited: Array, deleted: Array}}
         */
        getModifiedRowList: function() {
            var original = _.indexBy(this._filterRowList(this._originalRowList), 'rowKey'),
                current = _.indexBy(this._filterRowList(this.toJSON()), 'rowKey'),
                result = {
                    'inserted' : [],
                    'edited' : [],
                    'deleted' : []
                };

            // 추가/ 수정된 행 추출
            _.each(current, function(obj, rowKey) {
                if (!original[rowKey]) {
                    result.inserted.push(obj);
                }else if (JSON.stringify(obj) !== JSON.stringify(original[rowKey])) {
                    result.edited.push(obj);
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey) {
                if (!current[rowKey]) {
                    result.deleted.push(obj);
                }
            }, this);
            return result;
        },
        _format: function(data) {
            function setExtraRowSpanData(extraData, columnName, rowSpanData) {
                extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
                extraData['rowSpanData'][columnName] = rowSpanData;
            }
            function isSetExtraRowSpanData(extraData, columnName) {
                return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
            }

            var rowList = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = rowList.length,
                subCount, rowSpan, extraData, row, childRow, count, rowKey, rowState, i, j;


            for (i = 0; i < len; i++) {
                row = rowList[i];
                rowKey = (keyColumnName === null) ? i : row[keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성
                row['rowKey'] = rowKey;
                row['_extraData'] = rowList[i]['_extraData'] || {};
                extraData = row['_extraData'];
                rowSpan = row['_extraData']['rowSpan'];
                rowState = row['_extraData']['rowState'];

                //rowState 값 따라 button 의 상태를 결정한다.
                row['_button'] = rowState === 'CHECKED';

                if (!this.isSortedByField()) {
                    //extraData 의 rowSpanData 가공
                    if (rowSpan) {
                        _.each(rowSpan, function(count, columnName) {
                            if (!isSetExtraRowSpanData(extraData, columnName)) {
                                setExtraRowSpanData(extraData, columnName, {
                                    count: count,
                                    isMainRow: true,
                                    mainRowKey: rowKey
                                });
                                subCount = -1;
                                for (j = i + 1; j < i + count; j++) {
                                    childRow = rowList[j];
                                    childRow[columnName] = row[columnName];
                                    childRow['_extraData'] = childRow['_extraData'] || {};
                                    setExtraRowSpanData(childRow['_extraData'], columnName, {
                                        count: subCount--,
                                        isMainRow: false,
                                        mainRowKey: rowKey
                                    });
                                }
                            }
                        }, this);
                    }
                }else {
                    if (rowList[i]['_extraData']) {
                        rowList[i]['_extraData']['rowSpan'] = null;
                    }
                }
            }
            return rowList;
        },
        _getEmptyRow: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList');
            var data = {};
            for (var i = 0; i < columnModelList.length; i++) {
                data[columnModelList[i]['columnName']] = '';
            }
            return data;
        },
        append: function(rowData, at) {
            at = at !== undefined ? at : this.length;

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = this.length,
                rowData = rowData || this._getEmptyRow();

            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._format(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                modelList.push(new Data.Row(row, {collection: this}));
            }, this);
            this.add(modelList, {
                at: at,
                merge: true
            });
            this._refreshNumber();
        },
        prepend: function(rowData) {
            //리스트가 아닐경우 리스트 형태로 변경
            this.append(rowData, 0);
        }
    });
