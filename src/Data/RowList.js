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
            this.on('change', this.onChange, this);
        },
        onChange: function() {
        },
        /**
         * getRowSpanData
         *
         * rowSpan 관련 data 가져온다.
         * @param columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData');
            var defaultData = {
                count: 0,
                isMainRow: true,
                mainRowKey: this.get('rowKey')
            };
            return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
        }

    });

    Data.RowList = Collection.Base.extend({
        model: Data.Row,

        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _sortKey: 'rowKey',
                _focused: {
                    'rowKey' : null,
                    'columnName' : ''
                },
                _originalRowList: [],
                _startIndex: attributes.startIndex || 1,
                _privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.on('change', this._onChange, this);
            this.on('change:_button', this._onCheckChange, this);
    //            this.on('sort add remove reset', this._onSort, this);
            this.on('sort', this._onSort, this);
            this.on('all', this.test1, this);
        },
        test1: function() {
    //            console.log(arguments);
        },
        _onSort: function() {
            console.log('sort');
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
                            var index = this.indexOf(this.get(row.get('rowKey')));
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
                    //check
                    row.set('_button', true);
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
        selectRow: function(rowKey, silent) {
            if (this.unselectRow().setExtraData(rowKey, { selected: true}, silent)) {
                this._focused['rowKey'] = rowKey;
            }
//            console.log('select:', this.get(rowKey).attributes);
            return this;
        },
        unselectRow: function(silent) {
            if (this.setExtraData(this._focused['rowKey'], { selected: false }, silent)) {
                this._focused['rowKey'] = null;
            }
            return this;
        },
        focusCell: function(rowKey, columnName) {
            rowKey = rowKey === undefined ? this._focused['rowKey'] : rowKey;
            columnName = columnName === undefined ? this._focused['columnName'] : columnName;

            this.blurCell().selectRow(rowKey);
            if (columnName) {
                this._focused['columnName'] = columnName;
                this.setExtraData(rowKey, { focused: columnName});
            }
            return this;
        },
        blurCell: function() {
            var rowKey = this._focused['rowKey'];
            if (rowKey !== undefined && rowKey !== null) {
                this._focused['columnName'] = '';
                this.setExtraData(rowKey, { focused: ''});
            }
            return this;
        },
        getFocused: function() {
            return _.clone(this._focused);
        },

        parse: function(data) {
            this._originalRowList = this._parse(data);
            return this._originalRowList;
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
        _parse: function(data) {
            var result = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName');

            function setExtraRowSpanData(extraData, columnName, rowSpanData) {
                extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
                extraData['rowSpanData'][columnName] = rowSpanData;
            }
            function isSetExtraRowSpanData(extraData, columnName) {
                return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
            }


            var count, rowKey, columnModel;


            for (var i = 0; i < result.length; i++) {
                rowKey = (keyColumnName === null) ? i : result[i][keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성
                result[i]['rowKey'] = rowKey;
                result[i]['_button'] = false;
                if (!this.isSortedByField()) {
                    //extraData 의 rowSpanData 가공
                    if (result[i]['_extraData'] && result[i]['_extraData']['rowSpan']) {
                        for (var columnName in result[i]['_extraData']['rowSpan']) {
                            if (!isSetExtraRowSpanData(result[i]['_extraData'], columnName)) {
                                count = result[i]['_extraData']['rowSpan'][columnName];
                                setExtraRowSpanData(result[i]['_extraData'], columnName, {
                                    count: count,
                                    isMainRow: true,
                                    mainRowKey: result[i]['rowKey']
                                });
                                var subCount = -1;
                                for (var j = i + 1; j < i + count; j++) {
                                    //value 를 mainRow 의 값과 동일하게 설정
                                    result[j][columnName] = result[i][columnName];
                                    result[j]['_extraData'] = result[j]['_extraData'] || {};
                                    //rowSpan 값 변경
                                    setExtraRowSpanData(result[j]['_extraData'], columnName, {
                                        count: subCount--,
                                        isMainRow: false,
                                        mainRowKey: result[i]['rowKey']
                                    });
                                }
                            }
                        }
                    }
                }else {
                    if (result[i]['_extraData']) {
                        result[i]['_extraData']['rowSpan'] = null;
                    }
                }

            }
            return result;
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
                keyColumnName = this.grid.columnModel.get('key'),
                len = this.length,
                rowData = rowData || this._getEmptyRow();

            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._parse(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                modelList.push(new Data.Row(row));
            },this);
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
