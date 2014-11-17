    /**
     * row model
     * @type {*|void}
     */
    Model.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
            var rowKey = attributes && attributes['rowKey'];

            this.setOwnProperties({
                dataModel: this.grid.dataModel,
                columnModel: this.grid.columnModel
            });

            if (this.dataModel.get(rowKey)) {
                this.listenTo(this.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
                this.listenTo(this.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
            }

        },
        /**
         * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
         * @param {Object} model
         * @private
         */
        _onDataModelChange: function(model) {
            _.each(model.changed, function(value, columnName) {
                if (columnName === '_extraData') {
                    // 랜더링시 필요한 정보인 extra data 가 변경되었을 때 rowSpan 된
                    // row model 에 연결된 focus, select, disable 를 업데이트 한다.
                    this.updateRowSpanned();
                }else {
                    this.setCell(columnName, {
                        value: value
                    });
                }
            }, this);
        },

        /**
         * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
         */
        updateRowSpanned: function(isRowSpanDataOnly) {
            if (this.collection) {
                var dataModel = this.dataModel,
                    columnModel = this.columnModel.getVisibleColumnModelList(),
                    model = this.dataModel.get(this.get('rowKey')),
                    extraData = model.get('_extraData'),
                    rowState = model.getRowState(),
                    param;

                _.each(columnModel, function(column, key) {
                    var mainRowKey,
                        columnName = column['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        isDisabled = columnName === '_button' ? rowState.isDisabledCheck : rowState.isDisabled;

                    if (cellData) {
                        if (dataModel.isRowSpanEnable()) {
                            if (!cellData['isMainRow']) {
                                rowModel = this.collection.get(cellData['mainRowKey']);
                            }
                        }

                        if (rowModel && !isRowSpanDataOnly || (isRowSpanDataOnly && !cellData['isMainRow'])) {
                            param = {
                                className: rowState.classNameList.join(' ')
                            };
                            if (isDisabled) {
                                param.isDisabled = true;
                            }
                            rowModel.setCell(columnName, param);
                        }
                    }
                }, this);
            }
        },
        /**
         * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
         * @param {Array} data
         * @return {Array}
         */
        parse: function(data) {
            return this._formatData(data);
        },
        /**
         * 데이터를 View 에서 사용할 수 있도록 가공한다.
         * _extraData 필드에 rowSpanData 를 추가한다.
         * @param {Array} data
         * @return {Array}
         * @private
         */
        _formatData: function(data) {
            var grid = this.collection.grid,
                dataModel = grid.dataModel,
                rowKey = data['rowKey'];

            _.each(data, function(value, columnName) {
                var rowSpanData,
                    row = dataModel.get(rowKey),
                    rowState = row.getRowState(),
                    isDisabled = rowState.isDisabled,
                    isEditable = row.isEditable(columnName),
                    defaultRowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };

                if (columnName !== 'rowKey' && columnName !== '_extraData') {
                    if (dataModel.isRowSpanEnable()) {
                        rowSpanData = data['_extraData'] && data['_extraData']['rowSpanData'] &&
                            data['_extraData']['rowSpanData'][columnName] || defaultRowSpanData;
                    }else {
                        rowSpanData = defaultRowSpanData;
                    }
                    isDisabled = columnName === '_button' ? rowState.isDisabledCheck : isDisabled;

                    data[columnName] = {
                        rowKey: rowKey,
                        columnName: columnName,
                        value: value,
                        //Rendering properties
                        rowSpan: rowSpanData.count,
                        isMainRow: rowSpanData.isMainRow,
                        mainRowKey: rowSpanData.mainRowKey,
                        //Change attribute properties
                        isEditable: isEditable,
                        isDisabled: isDisabled,
                        optionList: [],
                        className: rowState.classNameList.join(' '),

                        changed: []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
            return data;
        },

        /**
         * Cell 의 값을 변경한다.
         * - 참조 형식의 데이터 타입이기 때문에 change이벤트 발생을 위해 해당 method 를 사용하여 값 변경을 수행한다.
         * @param {String} columnName
         * @param {{key: value}} param
         */
        setCell: function(columnName, param) {
            if (this.get(columnName)) {
                var data = _.clone(this.get(columnName)),
                    isValueChanged = false,
                    changed = [],
                    rowIndex,
                    rowKey = this.get(columnName)['rowKey'];
                _.each(param, function(changeValue, name) {
                    if (!Util.isEqual(data[name], changeValue)) {
                        isValueChanged = (name === 'value') ? true : isValueChanged;
                        data[name] = changeValue;
                        changed.push(name);
                    }
                }, this);

                if (changed.length) {
                    data['changed'] = changed;
                    this.set(columnName, data);
                    if (isValueChanged) {
                        //value 가 변경되었을 경우 relation 을 수행한다.
                        rowIndex = this.dataModel.indexOfRowKey(rowKey);
                        this.renderModel.executeRelation(rowIndex);
                    }
                }
            }
        }
    });

    /**
     * view model rowList collection
     * @type {*|void}
     */
    Model.RowList = Collection.Base.extend({
        model: Model.Row,
        initialize: function(models, options) {
            Collection.Base.prototype.initialize.apply(this, arguments);
        }
    });
