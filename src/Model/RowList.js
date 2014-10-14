    /**
     * row model
     * @type {*|void}
     */
    Model.Row = Model.Base.extend({
        idAttribute : 'rowKey',
        defaults : {
        },
        initialize : function(attributes, options){
            Model.Base.prototype.initialize.apply(this, arguments);
            var rowKey = attributes && attributes['rowKey'];

            if(this.grid.dataModel.get(rowKey)){
//                this.listenTo(this.grid.dataModel.get(rowKey), 'change:_extraData', this._onExtraDataChange, this);
                this.listenTo(this.grid.dataModel.get(rowKey), 'change', this._onModelChange, this);
                this.listenTo(this.grid.dataModel.get(rowKey), 'restore', this._onModelChange, this);

            }
        },

        _onModelChange : function(model){
            _.each(model.changed, function(value, columnName){
                if(columnName === '_extraData'){
                    this.correctRowSpanData(value);
                }else{
                    this.setCell(columnName, {
                        value : value
                    });
                }
            }, this);
        },
        _onExtraDataChange : function(rowModel){
            var extraData = rowModel.get('_extraData');
            this.correctRowSpanData(extraData);
        },
        correctRowSpanData : function(extraData){
            if(this.collection){
                var selected = extraData["selected"] || false;
                var focusedColumnName = extraData["focused"];
                var columnModel = this.grid.columnModel.get('visibleList');
                _.each(columnModel, function(column, key){
                    var mainRowKey,
                        columnName = column['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        focused = (columnName === focusedColumnName);

                    if(cellData){
                        if(!this.grid.dataModel.isSortedByField()){
                            if(this.collection.get(cellData['mainRowKey'])){
                                rowModel = this.collection.get(cellData['mainRowKey']);
                                rowModel.setCell(columnName, {
                                    focused : focused,
                                    selected : selected
                                });
                            }
                        }else{
                            rowModel.setCell(columnName, {
                                focused : focused,
                                selected : selected
                            });
                        }
                    }
                }, this)
            }
        },
        parse : function(data){
            //affect option 을 먼저 수행한다.
            this.executeAffectOption(data);
            var columnModel = this.collection.grid.columnModel.get('columnModelList');
            var rowKey = data['rowKey'];
            _.each(data, function(value, columnName){
                var rowSpanData,
                    focused = data['_extraData']['focused'] === columnName,
                    selected = !!data['_extraData']['selected'],
                    defaultRowSpanData = {
                        mainRowKey : rowKey,
                        count : 0,
                        isMainRow : true
                    };
                if(columnName !== 'rowKey' && columnName !== '_extraData'){

                    if(this.collection.grid.dataModel.isSortedByField()){
                        rowSpanData = defaultRowSpanData;
                    }else{
                        rowSpanData = data['_extraData'] && data['_extraData']['rowSpanData'] && data['_extraData']['rowSpanData'][columnName] || defaultRowSpanData;
                    }

                    var model = this.collection.grid.dataModel.get(rowKey);
                    //@TODO: 기타 옵션 function 활용하여 editable, disabled 값을 설정한다.
                    data[columnName] = {
                        rowKey : rowKey,
                        columnName : columnName,
                        value : value,

                        //Rendering properties
                        rowSpan : rowSpanData.count,
                        isMainRow : rowSpanData.isMainRow,
                        mainRowKey : rowSpanData.mainRowKey,
                        isEditable : false,
                        optionList : [],

                        //Change attribute properties
                        isDisabled : false,
                        className : "",

                        focused : focused,
                        selected : selected,

                        changed : []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
            return data;
        },
        executeAffectOption : function(data){
            //@TODO: 컬럼 모델에 정의된 affect option을 수행한다.
        },
        /**
         * Cell 의 값을 변경한다.
         * @param columnName
         * @param param
         */
        setCell : function(columnName, param){
            if(this.get(columnName)){
                var data = _.clone(this.get(columnName)),
                    isValueChanged = false,
                    changed = [];

                for(var name in param){
                    isValueChanged = (name === 'value') ? true : isValueChanged;
                    data[name] = param[name];
                    changed.push(name);
                }
                data['changed'] = changed;
                this.set(columnName, data);
            }
        }
    });

    /**
     * view model rowList collection
     * @type {*|void}
     */
    Model.RowList = Collection.Base.extend({
        model : Model.Row,
        initialize : function(attributes){
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.on('sort', this.onSort, this);
        },
        onSort : function(){
            var focused = this.grid.dataModel.getFocused();
            if(focused.rowKey !== null){
                this.grid.dataModel.focusCell();
            }
        }
    });