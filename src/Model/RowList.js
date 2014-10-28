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

            if (this.grid.dataModel.get(rowKey)) {
                this.listenTo(this.grid.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
                this.listenTo(this.grid.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
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
         * @private
         */
        updateRowSpanned: function() {
            if (this.collection) {
                var columnModel = this.grid.columnModel.getVisibleColumnModelList(),
                    model = this.grid.dataModel.get(this.get('rowKey')),
                    extraData = model.get('_extraData'),
                    selected = extraData['selected'] || false,
                    focusedColumnName = extraData['focused'],
                    rowState = model.getRowState();

                _.each(columnModel, function(column, key) {
                    var mainRowKey,
                        columnName = column['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        focused = (columnName === focusedColumnName),
                        isDisabled = columnName === '_button' ? rowState.isDisabledCheck : rowState.isDisabled;

                    if (cellData) {
                        if (!this.grid.dataModel.isSortedByField()) {
                            rowModel = this.collection.get(cellData['mainRowKey']);
                            if (rowModel) {
                                rowModel.setCell(columnName, {
                                    focused: focused,
                                    selected: selected,
                                    isDisabled: isDisabled,
                                    className: rowState.classNameList.join(' ')
                                });
                            }
                        }else {
                            rowModel.setCell(columnName, {
                                focused: focused,
                                selected: selected,
                                isDisabled: isDisabled,
                                className: rowState.classNameList.join(' ')
                            });
                        }
                    }
                }, this);
            }
        },
        parse: function(data) {
            //affect option 을 먼저 수행한다.
            var dataModel = this.collection.grid.dataModel,
                rowKey = data['rowKey'];

            _.each(data, function(value, columnName) {
                var rowSpanData,
                    focused = data['_extraData']['focused'] === columnName,
                    selected = !!data['_extraData']['selected'],
                    rowState = dataModel.get(rowKey).getRowState(),
                    isDisabled = rowState.isDisabled,
                    defaultRowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };

                if (columnName !== 'rowKey' && columnName !== '_extraData') {

                    if (this.collection.grid.dataModel.isSortedByField()) {
                        rowSpanData = defaultRowSpanData;
                    }else {
                        rowSpanData = data['_extraData'] && data['_extraData']['rowSpanData'] && data['_extraData']['rowSpanData'][columnName] || defaultRowSpanData;
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
                        isEditable: true,
                        isDisabled: isDisabled,
                        optionList: [],
                        className: rowState.classNameList.join(' '),
                        focused: focused,
                        selected: selected,

                        changed: []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
//            this.executeAffectList(data);
            return data;
        },

        /**
         * Cell 의 값을 변경한다.
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

                for (var name in param) {
                    if (data[name] !== param[name]) {
                        isValueChanged = (name === 'value') ? true : isValueChanged;
                        data[name] = param[name];
                        changed.push(name);
                    }
                }
                if (changed.length) {
                    data['changed'] = changed;
                    this.set(columnName, data);
                    if (isValueChanged) {
                        //value 가 변경되었을 경우 relation 을 수행한다.
                        rowIndex = this.grid.dataModel.indexOfRowKey(rowKey);
                        this.grid.renderModel.executeRelation(rowIndex);
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
        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.on('reset', this._onReset, this);
        },
        _onReset: function() {
            var focused = this.grid.focusModel.which(),
                model = this.get(focused.rowKey);
            //랜더링시 rowSpan 된 view 들의 정보를 업데이트한다.
            if (model) {
                model.updateRowSpanned();
            }
        }

    });
