(function(){
    if(typeof window.console == "undefined" || !window.console || !window.console.log) window.console = {"log" : function(){}, "error" : function(){}};
	/**
	 * define ddata container
	 * @type {{Layout: {}, Data: {}, Cell: {}}}
	 */
	var View = {
			Layout : {
			},
			Data : {
			},
			Cell : {
			},
			Plugin : {
			}
		},
		Model = {},
		Data = {},
		Collection = {};



	Model.Base = Backbone.Model.extend({
		initialize : function(attributes, options){
			var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid
			});
		},
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		}
	});

	Collection.Base = Backbone.Collection.extend({
		initialize : function(attributes){
			var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid
			});
		},
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		}
	});


    View.Base = Backbone.View.extend({
		initialize : function(attributes){
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
			this.setOwnProperties({
                grid : grid,
                __viewList : []
			});
		},
        error : function(message){
            var error = function(){
				this.name = "PugException";
				this.message = message || "error";
//				this.methodName = methodName;
				this.caller = arguments.caller;
			};
			error.prototype = new Error();
			return new error();
        },
		/**
		 * setOwnPropertieserties
		 *
		 * @param properties
		 */
		setOwnProperties : function(properties){
			_.each(properties, function(value, key){
				this[key] = value;
			}, this);
		},

        /**
         * create view
         * @param clazz
         * @param params
         * @returns {clazz}
         */
        createView : function(clazz, params){
            var instance = new clazz(params);
            if(!this.hasOwnProperty('__viewList')){
				this.setOwnProperties({
					__viewList : []
				})
			}
			this.__viewList.push(instance);
            return instance;
        },

        destroy : function(){
            this.destroyChildren();
            this.remove();
        },

        destroyChildren : function(){
            if(this.__viewList instanceof Array){
				while(this.__viewList.length !== 0){
					this.__viewList.pop().destroy();
				}
			}
        }
	});

    View.Base.PluginInterface = View.Base.extend({
        $super : View.Base.PluginInterface,
        initialize : function(){
            View.Base.prototype.initialize.apply(this, arguments);
            this.$super.__plugin = this;
        },
        activate : function(){

        },
        render : function(){
            return this;
        },
        appendTo : function(){

        }
    });





    var Util = {
        getTBodyHeight : function(rowCount, rowHeight){
            return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
        },
        getDisplayRowCount : function(tbodyHeight, rowHeight){
            return Math.ceil((tbodyHeight - 1) / (rowHeight + 1));
        },
        getRowHeight : function(rowCount, tbodyHeight){
            return Math.floor( ((tbodyHeight - 1) / rowCount ));
        },
        /**
         * Create unique key
         * @return {string}
         * @private
         */
        getUniqueKey: function() {
            var rand = String(parseInt(Math.random() * 10000000000, 10));
            return new Date().getTime() + rand;
        },
        /**
         * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
         * @method decodeHTMLEntity
         * @param {String} html HTML Entity 타입의 문자열
         * @return {String} 원래 문자로 변환된 문자열
         * @example
         var htmlEntityString = "A &#039;quote&#039; is &lt;b&gt;bold&lt;/b&gt;"
         var result = pug.utility.decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
         */
        decodeHTMLEntity : function(html){
            var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
            return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0){
                return entities[m0]? entities[m0]:m0;
            });
        },
        /**
         * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
         * @method encodeHTMLEntity
         * @param {String} html 문자열
         * @return {String} html HTML Entity 타입의 문자열로 변환된 문자열
         * @example
         var htmlEntityString = "<script> alert('test');</script><a href='test'>"
         var result = pug.utility.encodeHTMLEntity(htmlEntityString); //결과값 : "&lt;script&gt; alert('test');&lt;/script&gt;&lt;a href='test'&gt;"
         */
        encodeHTMLEntity : function(str){
            var entities = {'"':'quot','&':'amp','<':'lt','>':'gt','\'':'#39'};
            return str.replace(/[<>&"']/g, function(m0){
                return entities[m0]?'&'+entities[m0]+';':m0;
            });
        }
    };
    /**
     * ColumnModel
     * @type {*|void}
     */
    Data.ColumnModel = Model.Base.extend({
        defaults : {
            keyColumnName : null,
            columnFixIndex : 0,		//columnFixIndex
            columnModelList : [],
            visibleList : [],

            columnModelMap : {}
        },
        initialize : function(attributes){
            Model.Base.prototype.initialize.apply(this, arguments);
            this.on("change", this._onChange, this);
        },
        _appendDefaultColumn : function(data){
            var columnModelList = $.extend(true, [], data),
                prependList = [],
                selectType = this.grid.option('selectType'),
                hasNumber  = false,
                hasChecked = false,
                preparedColumnModel = {
                    '_number' : {
                        columnName : '_number',
                        title : 'No.',
                        width : 60
                    },
                    '_button' : {
                        columnName : '_button',
                        editOption : {
                            type : selectType,
                            list : [{
                                value : 'selected'
                            }]
                        },
                        width : 50
                    }
                };

            if(selectType === 'checkbox'){
                preparedColumnModel['_button'].title = '<input type="checkbox"/>';
            }else if (selectType === 'radio'){
                preparedColumnModel['_button'].title = '선택';
            }else{
                preparedColumnModel['_button'].isHidden = true;
            }

            _.each(columnModelList, function(columnModel, idx){
                var columnName = columnModel.columnName;
                if(columnName === '_number'){
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_number']);
                    hasNumber = true;
                }else if(columnName === '_button'){
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_button']);
                    hasChecked = true;
                }
            }, this);

            if(!hasNumber){
                prependList.push(preparedColumnModel['_number']);
            }
            if(!hasChecked){
                prependList.push(preparedColumnModel['_button']);
            }
            columnModelList = _.union(prependList, columnModelList);
            return columnModelList;
        },
        getColumnModelList : function(whichSide){
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get("columnFixIndex");
            switch(whichSide){
                case 'L':
                    columnModelList = this.get('visibleList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnModelList = this.get('visibleList').slice(columnFixIndex);
                    break;
                default :
                    columnModelList = this.get('visibleList');
                    break;
            }
            return columnModelList;
        },
        getColumnModel : function(columnName){
            return this.get('columnModelMap')[columnName];
        },
        _getVisibleList : function(){
            return _.filter(this.get("columnModelList"), function(item){return !item['isHidden']});
        },
        _onChange : function(model){
            if(model.changed['columnModelList']){
                this.set({
                    columnModelList : this._appendDefaultColumn(model.changed['columnModelList'])
                },{
                    silent : true
                });
            }
            var visibleList = this._getVisibleList();
            this.set({
                visibleList : visibleList,
                lsideList : visibleList.slice(0, this.get('columnFixIndex')),
                rsideList : visibleList.slice(this.get('columnFixIndex')),
                columnModelMap : _.indexBy(this.get('columnModelList'), 'columnName')
            }, {
                silent : true
            });
        }

    });
    Data.Row = Model.Base.extend({
        idAttribute : 'rowKey',
        defaults : {
            _extraData : {
                'rowState' : null,
                'selected' : false,
                'focused' : ''
            }
        },
        initialize : function(){
            Model.Base.prototype.initialize.apply(this, arguments);
            this.on('change', this.onChange, this);
        },
        onChange : function(){
        },
        /**
         * getRowSpanData
         *
         * rowSpan 관련 data 가져온다.
         * @param columnName
         * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData : function(columnName){
            var extraData = this.get("_extraData");
            var defaultData =  {
                count : 0,
                isMainRow : true,
                mainRowKey : this.get('rowKey')
            };
            return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
        }

    });

    Data.RowList = Collection.Base.extend({
        model : Data.Row,

        initialize: function(attributes){
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _sortKey :'rowKey',
                _focused : {
                    'rowKey' : null,
                    'columnName' : ''
                },
                _originalRowList : [],
                _startIndex : attributes.startIndex || 1,
                _privateProperties : [
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
        test1: function(){
    //            console.log(arguments);
        },
        _onSort : function(){
            console.log('sort');
            this._refreshNumber();
        },
        _refreshNumber : function(){
            for(var i = 0; i < this.length; i++){
                this.at(i).set('_number', this._startIndex + i, {silent : true});
            }
        },

        _isPrivateProperty : function(name){
            return $.inArray(name, this._privateProperties) !== -1;
        },
        _onChange : function(row){
            var getChangeEvent = function(row, columnName){
                return {
                    "rowKey" : row.get('rowKey'),
                    "columnName" : columnName,
                    "columnData" : row.get(columnName)
                };
            };
            _.each(row.changed, function(value, columnName){
                if(!this._isPrivateProperty(columnName)){
                    var columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if(!columnModel) return;
                    var rowSpanData = row.getRowSpanData(columnName);

                    var changeEvent = getChangeEvent(row, columnName);
                    var obj;
                    //beforeChangeCallback 수행
                    if(columnModel.editOption && columnModel.editOption.changeBeforeCallback){
                        if(columnModel.editOption.changeBeforeCallback(changeEvent) === false){
                            obj = {};
                            obj[columnName] = row.previous(columnName);
                            row.set(obj);
                            row.trigger('restore', {
                                changed : obj
                            });
                            return;
                        }
                    }
                    //sorted 가 되지 않았다면, rowSpan 된 데이터들도 함께 update
                    if(!this.isSortedByField()){
                        if(!rowSpanData['isMainRow']){
                            this.get(rowSpanData['mainRowKey']).set(columnName, value);
                        }else{
                            var index = this.indexOf(this.get(row.get('rowKey')));
                            for(var i = 0; i < rowSpanData['count']-1; i++){
                                this.at(i + 1 + index).set(columnName, value);
                            }
                        }
                    }

                    changeEvent = getChangeEvent(row, columnName);
                    //afterChangeCallback 수행
                    if(columnModel.editOption && columnModel.editOption.changeAfterCallback){
                        columnModel.editOption.changeAfterCallback(changeEvent);
                    }
                    //check
                    row.set('_button', true);
                }
            }, this);
        },
        _onCheckChange : function(row){
            var columnModel = this.grid.columnModel.getColumnModel('_button'),
                selectType = this.grid.option('selectType'),
                rowKey = row.get('rowKey'),
                checkedList;
            if(selectType === 'radio'){
                checkedList = this.where({
                    '_button' : true
                });
                _.each(checkedList, function(checked, key){
                    if(rowKey != checked.get('rowKey')){
                        checked.set({
                            '_button' : false
                        }, {
                            silent : true
                        });
                    }
                });
            }
        },
        isSortedByField :  function(){
            return this._sortKey !== "rowKey";
        },
        sortByField : function(fieldName){
            this._sortKey = fieldName;
            this.sort();
        },
        comparator : function(item){
            if(this.isSortedByField()){
                return item.get(this._sortKey) * 1;
            }
        },
        /**
         * cell 값을 변경한다.
         * @param rowKey
         * @param columnName
         * @param columnValue
         * @param silent
         * @returns {boolean}
         */
        setValue : function(rowKey, columnName, columnValue, silent){
            var row = this.get(rowKey),
                obj = {};
            if(row){
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent : silent
                });
                return true;
            }else{
                return false;
            }
        },
        /**
         * column 에 해당하는 값을 전부 변경한다.
         * @param columnName
         * @param columnValue
         * @param silent
         */
        setColumnValue : function(columnName, columnValue, silent){
            var obj = {};
            obj[columnName] = columnValue;
            this.forEach(function(row, key){
                row.set(obj, {
                    silent : silent
                });
            }, this);
        },
        setExtraData : function(rowKey, value, silent){
            var row = this.get(rowKey),
                obj = {}, extraData;

            if(row){
                //적용
                extraData = _.clone(row.get('_extraData'));
                extraData = $.extend(extraData, value);
                obj['_extraData'] = extraData;
                row.set(obj,{
                    silent : silent
                });
                return true;
            }else{
                return false;
            }
        },
        selectRow : function(rowKey, silent){
            if(this.unselectRow().setExtraData(rowKey, { selected : true}, silent)){
                this._focused['rowKey'] = rowKey;
            }
//            console.log('select:', this.get(rowKey).attributes);
            return this;
        },
        unselectRow : function(silent){
            if(this.setExtraData(this._focused['rowKey'], { selected : false }, silent)){
                this._focused['rowKey'] = null;
            }
            return this;
        },
        focusCell : function(rowKey, columnName){
            rowKey = rowKey === undefined ? this._focused['rowKey'] : rowKey;
            columnName = columnName === undefined ? this._focused['columnName'] : columnName;

            this.blurCell().selectRow(rowKey);
            if(columnName){
                this._focused['columnName'] = columnName;
                this.setExtraData(rowKey, { focused : columnName});
            }
            return this;
        },
        blurCell : function(){
            var rowKey = this._focused['rowKey'];
            if(rowKey !== undefined && rowKey !== null){
                this._focused['columnName'] = '';
                this.setExtraData(rowKey, { focused : ''});
            }
            return this;
        },
        getFocused : function(){
            return _.clone(this._focused);
        },

        parse : function(data){
            this._originalRowList = this._parse(data);
            return this._originalRowList;
        },
        /**
         * 내부 변수를 제거한다.
         * @param rowList
         * @returns {Array}
         * @private
         */
        _filterRowList : function(rowList){
            var obj, filteredRowList = [];

            for(var i = 0, len = rowList.length ; i < len; i++){
                obj = {};
                //_로 시작하는 property 들은 제거한다.
                _.each(rowList[i], function(value, key){
                    if(!this._isPrivateProperty(key)){
                        obj[key] = value;
                    }
                }, this);
                filteredRowList.push(obj);
            }
            return filteredRowList;
        },
        /**
         * 수정된 rowList 를 반환한다.
         * @returns {{inserted: Array, edited: Array, deleted: Array}}
         */
        getModifiedRowList : function(){
            var original = _.indexBy(this._filterRowList(this._originalRowList), 'rowKey'),
                current = _.indexBy(this._filterRowList(this.toJSON()), 'rowKey'),
                result = {
                    'inserted' : [],
                    'edited' : [],
                    'deleted' : []
                };

            // 추가/ 수정된 행 추출
            _.each(current, function(obj, rowKey){
                if(!original[rowKey]){
                    result.inserted.push(obj);
                }else if(JSON.stringify(obj) !== JSON.stringify(original[rowKey])){
                    result.edited.push(obj);
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey){
                if(!current[rowKey]){
                    result.deleted.push(obj);
                }
            }, this);
            return result;
        },
        _parse : function(data){
            var result = data,
                keyColumnName = this.grid.columnModel.get("keyColumnName"),
                setExtraRowSpanData = function(extraData, columnName, rowSpanData){
                    extraData["rowSpanData"] = extraData && extraData["rowSpanData"] || {};
                    extraData["rowSpanData"][columnName] = rowSpanData;
                },
                isSetExtraRowSpanData = function(extraData, columnName){
                    return !!(extraData["rowSpanData"] && extraData["rowSpanData"][columnName]);
                };


            var count, rowKey, columnModel;


            for(var i = 0; i < result.length; i++){
                rowKey = (keyColumnName === null) ? i : result[i][keyColumnName];	//rowKey 설정 keyColumnName 이 없을 경우 자동 생성
                result[i]["rowKey"] = rowKey;
                result[i]["_button"] = false;
                if(!this.isSortedByField()){
                    //extraData 의 rowSpanData 가공
                    if(result[i]["_extraData"] && result[i]["_extraData"]["rowSpan"]){
                        for(var columnName in result[i]["_extraData"]["rowSpan"]){
                            if(!isSetExtraRowSpanData(result[i]["_extraData"], columnName)) {
                                count = result[i]["_extraData"]["rowSpan"][columnName];
                                setExtraRowSpanData(result[i]["_extraData"], columnName, {
                                    count: count,
                                    isMainRow: true,
                                    mainRowKey: result[i]["rowKey"]
                                });
                                var subCount = -1;
                                for (var j = i + 1; j < i + count; j++) {
                                    //value 를 mainRow 의 값과 동일하게 설정
                                    result[j][columnName] = result[i][columnName];
                                    result[j]["_extraData"] = result[j]["_extraData"] || {};
                                    //rowSpan 값 변경
                                    setExtraRowSpanData(result[j]["_extraData"], columnName, {
                                        count: subCount--,
                                        isMainRow: false,
                                        mainRowKey: result[i]["rowKey"]
                                    });
                                }
                            }
                        }
                    }
                }else{
                    if(result[i]["_extraData"]){
                        result[i]["_extraData"]["rowSpan"] = null;
                    }
                }

            }
            return result;
        },
        _getEmptyRow : function(){
            var columnModelList = this.grid.columnModel.get('columnModelList');
            var data = {};
            for(var i = 0; i < columnModelList.length; i++){
                data[columnModelList[i]['columnName']] = '';
            }
            return data;
        },
        append : function(rowData, at){
            at = at !== undefined ? at : this.length;

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get("key"),
                len = this.length,
                rowData = rowData || this._getEmptyRow();

            //리스트가 아닐경우 리스트 형태로 변경
            if(!(rowData instanceof Array)){
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._parse(rowData);

            _.each(rowList, function(row, index){
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                modelList.push(new Data.Row(row));
            },this);
            this.add(modelList,{
                at : at,
                merge : true
            });
            this._refreshNumber();
        },
        prepend : function(rowData){
            //리스트가 아닐경우 리스트 형태로 변경
            this.append(rowData, 0);
        }
    });
    Model.Cell = Model.Base.extend({
        defaults : {
            rowKey : "",
            columnName  : "",
            value : "",

            //Rendering properties
            rowSpan : 0,
            isMainRow : true,
            mainRowKey : "",
            isEditable : false,
            optionList : [],

            //Change attribute properties
            isDisabled : false,
            className : "",
            selected : false,
            focused : false
        },
        initialize : function(attributes){
            Model.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _model : attributes._model || null,
                attrProperties : [
                    'isDisabled',
                    'className',
                    'selected',
                    'focused'
                ]

            });

            var columnName = attributes.columnName;

            //model 의 변경사항을 listen 한다.
            this.listenTo(this._model, 'change:'+columnName, this._onModelChange, this);
            this.on('change', this._onChange, this);

        },
        _onModelChange : function(row, value){
            var columnModel = this.grid.columnModel.getColumnModel(this.get('columnName'));
            //@TODO : execute affect option

            if(columnModel.affectOption){
                //@TODO:do AffectOption
            }

            this.set("value", value)
        },
        _onChange : function(cell){
            var shouldRender = false;
            _.each(cell.changed, function(value, key){
                if($.inArray(key, this.attrProperties) === -1){
                    shouldRender = true;
                }
            }, this);
            if(shouldRender === true){
                this.trigger('render', cell);
            }else{
                this.trigger('changeAttr', cell);
            }
        },
        setValue : function(value){
            this._model.set(this.get('columnName'), value);
        }
    });
    /**
     * 크기 관련 데이터 저장
     * @type {*|void}
     */
    Model.Dimension = Model.Base.extend({
        models : null,
        columnModel : null,
        defaults : {
            width : 0,

            headerHeight : 0,
            bodyHeight : 0,

            rowHeight : 0,

            rsideWidth : 0,
            lsideWidth : 0,
            columnWidthList : []
        },
        initialize : function(attributes){
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel , "change", this._onWidthChange);
            this.on("change:width", this._onWidthChange, this);
            this._setColumnWidth();
            this._setBodyHeight();
            this._setHeaderHeight();

            this.setOwnProperties({
                timeoutIdForResize : 0
            });
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },
        _onWindowResize : function(resizeEvent){
            clearTimeout(this.timeoutIdForResize);
            this.timeoutIdForResize = setTimeout($.proxy(function(){
                var width = Math.max(this.grid.option('minimumWidth'), this.grid.$el.css('width', '100%').width());
                this.set('width', width);
            }, this), 100);
        },
        /**
         * _onWidthChange
         *
         * width 값 변경시 각 column 별 너비를 계산하는 로직
         * @param model
         * @private
         */
        _onWidthChange : function(model){
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidth(this._calculateColumnWidthList(curColumnWidthList));
        },
        _setBodyHeight : function(){
//            var height = (this.get('rowHeight') + 1) * this.grid.option('displayRowCount') - 2;
            var height = Util.getTBodyHeight(this.grid.option('displayRowCount'), this.get('rowHeight'));
            //TODO scroll height 예외처리
            height += this.grid.scrollBarSize;
            this.set('bodyHeight', height);
        },
        getDisplayRowCount : function(){
//            Math.ceil(this.get('bodyHeight') / this.get('rowHeight'));
            return Util.getDisplayRowCount(this.get('bodyHeight'), this.get('rowHeight'));
        },
        _setHeaderHeight : function(){
            //@todo calculate header height
            var height = this.grid.option('headerHeight');
            this.set('headerHeight', height);
        },

        _setColumnWidth : function(columnWidthList){
            var rsideWidth, lsideWidth = 0,
                columnWidthList = columnWidthList || this._getOriginalWidthList(),
                totalWidth = this.get("width"),
                columnFixIndex = this.columnModel.get("columnFixIndex");
            for(var i = 0, len=columnWidthList.length; i < len; i++){
                if(i < columnFixIndex){
                    lsideWidth += columnWidthList[i]+1;
                }
            }
            lsideWidth += 1;
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth : rsideWidth,
                lsideWidth : lsideWidth,
                columnWidthList : columnWidthList
            });
            this.trigger('columnWidthChanged');
        },

        setColumnWidth : function(index, width){
            width = Math.max(width, this.grid.option('minimumColumnWidth'));

            var curColumnWidthList = this.get('columnWidthList');
            curColumnWidthList[index] = width;
            var calculatedColumnWidthList = this._calculateColumnWidthList(curColumnWidthList);



            this._setColumnWidth(calculatedColumnWidthList);
        },



        getColumnWidthList : function(whichSide){
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get("columnFixIndex");
            var columnList = [];

            switch(whichSide){
                case 'L':
                    columnList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnList = this.get('columnWidthList')
                    break;
            }
            return columnList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         *
         * @returns {*}
         * @private
         */
        _getOriginalWidthList : function(){
            var columnModelList = this.columnModel.get("visibleList"),
                columnWidthList = [];
            for(var i = 0, len=columnModelList.length; i < len; i++){
                if(columnModelList[i].width){
                    columnWidthList.push(columnModelList[i].width);
                }else{
                    columnWidthList.push(-1);
                }
            }

            return this._calculateColumnWidthList(columnWidthList);
        },


        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         *
         * @param columnWidthList
         * @returns {Array}
         * @private
         */
        _calculateColumnWidthList : function(columnWidthList){
            var remainWidth, unassignedWidth, remainDividedWidth,
                newColumnWidthList = [],
                totalWidth = this.get("width"),
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            for(var i = 0, len=columnWidthList.length; i < len; i++){
                if(columnWidthList[i] > 0){
                    width = Math.max(this.grid.option('minimumColumnWidth'), columnWidthList[i]);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                }else{
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }

            remainWidth = totalWidth - currentWidth;


            if(totalWidth > currentWidth && unassignedCount === 0){
//                remainDividedWidth = Math.floor(remainWidth / newColumnWidthList.length);
//                for(var i = 0, len=newColumnWidthList.length; i < len; i++){
//                    newColumnWidthList[i] += remainDividedWidth;
//                    if(i === len-1){
//                        newColumnWidthList[i] += (remainWidth - (remainDividedWidth * len));
//                    }
//                }
                newColumnWidthList[newColumnWidthList.length-1] += remainWidth;
            }

            if(totalWidth > currentWidth){
                remainWidth = totalWidth - currentWidth;
                unassignedWidth = Math.max(this.grid.option('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            }else{
                unassignedWidth = this.grid.option('minimumColumnWidth');
            }

            for(var i = 0, len=newColumnWidthList.length; i < len; i++){
                if(newColumnWidthList[i] === -1){
                    newColumnWidthList[i] = unassignedWidth;
                }
            }

            return newColumnWidthList;
        }
    });
    /**
     * View 에서 Rendering 시 바라보는 객체
     * @type {*|void}
     */
    Model.Renderer = Model.Base.extend({
        defaults : {
            top : 0,
            scrollTop : 0,
            scrollLeft : 0,

            startIdx : 0,
            endIdx : 0,

            lside : null,
            rside : null
        },
        initialize : function(attributes){
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRefresh : 0,
                isColumnModelChanged : false
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this);
            this.listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this);

            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList({
                grid : this.grid
            });
            var rside = new Model.RowList({
                grid : this.grid
            });
            this.set({
                lside : lside,
                rside : rside
            });
        },


        getCollection : function(whichSide){
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var collection;
            switch(whichSide){
                case 'L':
                    collection = this.get('lside');
                    break;
                case 'R':
                    collection = this.get('rside');
                    break;
                default :
                    collection = this.get('rside');
                    break;
            }
            return collection;
        },
        _onColumnModelChange : function(){
            this.set({
                'scrollTop' : 0,
                'top' : 0,
                'startIdx' : 0,
                'endIdx' : 0
            });
            this.isColumnModelChanged = true;
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        _onRowListChange : function(){
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        _setRenderingRange : function(){
            this.set({
                'startIdx' : 0,
                'endIdx' : this.grid.dataModel.length - 1
            });
        },
        refresh : function(){
            this.trigger('beforeRefresh');

            this._setRenderingRange();
            //TODO : rendering 해야할 데이터만 가져온다.
            var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, "columnName");

            var lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex);



            var lsideRowList = [],
                rsideRowList = [];

            var lsideRow = [];
            var rsideRow = [];

            var startIdx = this.get('startIdx');
            var endIdx= this.get('endIdx');
            var start = new Date();
            console.log("render", startIdx, endIdx);
            for(var i = startIdx; i < endIdx+1; i++){
                var rowModel = this.grid.dataModel.at(i);
                var rowKey = rowModel.get('rowKey');
                //데이터 초기화
                lsideRow = {
                    "_extraData" : rowModel.get('_extraData'),
                    "rowKey" : rowKey
                };
                rsideRow = {
                    "_extraData" : rowModel.get('_extraData'),
                    "rowKey" : rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function(columnName){
                    lsideRow[columnName] = rowModel.get(columnName);
                }, this);

                _.each(rsideColumnList, function(columnName){
                    rsideRow[columnName] = rowModel.get(columnName);
                }, this);

                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
            this.get('lside').set(lsideRowList, {
                parse : true
            });
            this.get('rside').set(rsideRowList, {
                parse : true
            });
            var end = new Date();
            console.log('render done', end-start);
            if(this.isColumnModelChanged === true){
                this.trigger('columnModelChanged');
                this.isColumnModelChanged = false;
            }else{
                this.trigger('rowListChanged');
            }

            this.trigger('afterRefresh');
        }
    });
    Model.Renderer.Smart = Model.Renderer.extend({
        initialize: function(){
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onScrollTopChange, this);
            this.setOwnProperties({
                hiddenRowCount : 10,
                criticalPoint : 3
            })
        },
        _onScrollTopChange : function(model, value){

            if(this._shouldRender() === true){
                this.refresh();
            }
        },
        _setRenderingRange : function(){
            var top,
                scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                endIdx = Math.min(this.grid.dataModel.length - 1, Math.floor(startIdx + this.hiddenRowCount + displayRowCount + this.hiddenRowCount));
            if(!this.grid.dataModel.isSortedByField()){
                var minList = [];
                var maxList = [];
    //            console.log('bf',startIdx, endIdx, scrollTop, top, displayRowCount);
                _.each(this.grid.dataModel.at(startIdx).get('_extraData')['rowSpanData'], function(data, columnName){
                    if(!data.isMainRow){
                        minList.push(data.count);
                    }
                }, this);

                _.each(this.grid.dataModel.at(endIdx).get('_extraData')['rowSpanData'], function(data, columnName){
                    if(data.count > 0){
                        maxList.push(data.count);
                    }
                }, this);

                if(minList.length > 0){
                    startIdx += Math.min.apply(Math, minList);
                }
                if(maxList.length > 0){
                    endIdx += Math.max.apply(Math, maxList);
                }
            }

            top = (startIdx === 0) ?  0 : Util.getTBodyHeight(startIdx, rowHeight) + 1;

            this.set({
                top : top,
                startIdx : startIdx,
                endIdx : endIdx
            });

        },

        _shouldRender : function(){
            var scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                rowCount = this.grid.dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(this.grid.dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');

            if((startIdx !== 0 && startIdx + this.criticalPoint > displayStartIdx )
                || endIdx !== rowCount-1 && (endIdx < rowCount && (endIdx - this.criticalPoint < displayEndIdx)) ){
                console.log(startIdx + this.criticalPoint, displayStartIdx );
                console.log(endIdx - this.criticalPoint, displayEndIdx );
                return true;
            }else{
                return false;
            }

        }
    });
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
    /**
     * body layout 뷰
     *
     * @type {*|void}
     */
	View.Layout.Body = View.Base.extend({
		tagName : "div",
		className : "data",
		template : _.template('' +
				'<div class="table_container" style="top: 0px">' +
				'	<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
				'		<colgroup><%=colGroup%></colgroup>' +
				'		<tbody></tbody>' +
				'	</table>' +
				'</div>'),
		events : {
			'scroll' : '_onScroll'
		},
        initialize : function(attributes){
			View.Base.prototype.initialize.apply(this, arguments);
			this.setOwnProperties({
				whichSide : attributes && attributes.whichSide || 'R'
			});
			this.listenTo(this.grid.renderModel, "change:scrollTop", this._onScrollTopChange, this);
			this.listenTo(this.grid.renderModel, "beforeRefresh", this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, "change:top", this._onTopChange, this);
            this.listenTo(this.grid.dimensionModel, "columnWidthChanged", this._onColumnWidthChanged, this);
		},
        _onColumnWidthChanged : function(){
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');
            for(var i  = 0; i < $colList.length; i++){
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
		_onScroll : function(scrollEvent){
            var obj = {};
            obj['scrollTop'] = scrollEvent.target.scrollTop;
            if(this.whichSide === 'R'){
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
			this.grid.renderModel.set(obj);
		},
		_onScrollTopChange : function(model, value){
			this.el.scrollTop = value;
		},
        _onTopChange : function(model, value){
            this.$el.children().css('top', value+'px');
        },
		_onBeforeRefresh : function(){
			this.el.scrollTop = this.grid.renderModel.get('scrollTop');
		},
		_getViewCollection : function(){
			return this.grid.renderModel.getCollection(this.whichSide);
		},
		render : function(){
			this.destroyChildren();

			this.$el.css({
				height : this.grid.dimensionModel.get('bodyHeight')
			});
			this.$el.html(this.template({
				colGroup : this._getColGroupMarkup()
			}));

			var rowList = this.createView(View.RowList, {
                grid : this.grid,
				collection : this._getViewCollection(),
				el : this.$el.find("tbody"),
				whichSide : this.whichSide
			});

			rowList.render();
			return this;
		},
		_getColGroupMarkup : function(){
			var columnModel = this.grid.columnModel,
				dimensionModel = this.grid.dimensionModel,
				columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
				columnModelList = columnModel.getColumnModelList(this.whichSide);

			var html = '';
			for(var i = 0, len=columnWidthList.length; i < len; i++){
				html += '<col columnname="'+columnModelList[i]["columnName"]+'" style="width:'+columnWidthList[i]+'px">';
			}
			return html;
		}
	});
    View.CellFactory = View.Base.extend({
        initialize : function(attributes, options){
            View.Base.prototype.initialize.apply(this, arguments);
            var args = {
                grid : this.grid
            };
            var instances = {
                'mainButton' : new View.Cell.MainButton(args),

                'normal' : new View.Cell.Normal(args),
                'text' : new View.Cell.Text(args),
                'button' : new View.Cell.List.Button(args),
                'select' : new View.Cell.List.Select(args)
            };


            this.setOwnProperties({
                instances : instances
            });
        },
        getInstance : function(editType){
            var instance = null;
            switch (editType){
                case 'mainButton' :
                    instance = this.instances[editType];
                    break;
                case 'text' :
                    instance = this.instances[editType];
                    break;
                case 'select':
                    instance = this.instances[editType];
                    break;
                case 'radio' :
                case 'checkbox' :
                    instance = this.instances['button'];
                    break;
                default :
                    instance = this.instances['normal'];
                    break;
            }

            return instance;
        }
    });

    View.Clipboard = View.Base.extend({
        staticData : null,
        tagName : 'textarea',
        className : 'clipboard',
        events : {
            'keydown' : '_onKeydown'
        },
        initialize : function(attributes, option){
            View.Base.prototype.initialize.apply(this, arguments);
        },
        activate : function(){
            this.listenTo(this.grid, "afterRender", this.appendTo, this);
            this.listenTo(this.grid, "mousedown", this._onGridMouseDown, this);
        },
        appendTo : function(){
            this.grid.$el.append(this.render().el);
        },
        render : function(){
            return this;
        },
        _onGridMouseDown : function(){
            this.$el.focus();
        },
        _onKeydown : function(keydownEvent){
            console.log('onkeydown rowList', this.grid);
            console.log('clipboard', keydownEvent);
        }
    });
    View.Layout.Footer = View.Base.extend({
		tagName : "div",
		className : "footer",
		render : function(){
			this.$el.html("footer");
			return this;
		}
	});
    View.Layout.Frame.Lside = View.Layout.Frame.extend({
		className : "lside_area",
		initialize : function(attributes){
			View.Layout.Frame.prototype.initialize.apply(this, arguments);
			this.setOwnProperties({
				whichSide : 'L'
			});
		},
        _onColumnWidthChanged : function(){
            var width = this.grid.dimensionModel.get("lsideWidth");
            this.$el.css({
				width : width + "px"
			});
        },
		beforeRender : function(){
			var width = this.grid.dimensionModel.get("lsideWidth");
			this.$el.css({
				display : "block",
				width : width + "px"
			});
		}
	});

    View.Layout.Frame.Rside = View.Layout.Frame.extend({
		className : "rside_area",
		initialize : function(attributes){
			View.Layout.Frame.prototype.initialize.apply(this, arguments);
			this.setOwnProperties({
				whichSide : 'R'
			});
		},
        _onColumnWidthChanged : function(){
            var dimensionModel = this.grid.dimensionModel;
			var marginLeft = dimensionModel.get("lsideWidth");
			var width = dimensionModel.get("rsideWidth");
            this.$el.css({
				width : width + "px",
				marginLeft : marginLeft + "px"
			});
        },
		beforeRender : function(){
			var dimensionModel = this.grid.dimensionModel;
			var marginLeft = dimensionModel.get("lsideWidth");
			var width = dimensionModel.get("rsideWidth");

			this.$el.css({
				display : "block",
				width : width + "px",
				marginLeft : marginLeft + "px"
			});
		},
        afterRender : function(){
            var virtualScrollBar,
                $space= $("<div></div>");
            $space.css({
                height : this.grid.dimensionModel.get('headerHeight') -2
            }).addClass('space');
            this.$el.append($space);

            if(this.grid.option('notUseSmartRendering') === false){
                virtualScrollBar = this.createView(View.Layout.Frame.Rside.VirtualScrollBar, {
                    grid : this.grid
                });
                this.$el.append(virtualScrollBar.render().el);
                console.log(this.$el.html());
            }

        }
	});

    /**
     * virtual scrollbar
     *
     * @type {*|void|Object}
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend({
        tagName : "div",
        className : "virtual_scrollbar",

        initialize : function(attributes){
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.dataModel, "sort add remove reset", this._setHeight, this);
            this.listenTo(this.grid.dimensionModel, "change", this._onDimensionChange, this);
            this.listenTo(this.grid.renderModel, "change:scrollTop", this._onScrollTopChange, this);
        },
        template : _.template('<div class="content"></div>'),
        events : {
            'scroll' : '_onScroll'
        },
        _onScroll : function(scrollEvent){
            this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
        },
        _onDimensionChange : function(model){
            if(model.changed['headerHeight'] || model.changed['bodyHeight']){
                this.render();
            }
        },
        _onScrollTopChange : function(model, value){
            this.el.scrollTop = value;
        },
        render : function(){
            this.$el.css({
                height : this.grid.dimensionModel.get('bodyHeight') - this.grid.scrollBarSize,
                top : this.grid.dimensionModel.get('headerHeight'),
                display : 'block'
            }).html(this.template());
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 지정한다.
         * @private
         */
        _setHeight : function(){
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                rowCount = this.grid.dataModel.length,
                height = rowHeight * this.grid.dataModel.length + (rowCount + 1);
            this.$el.find('.content').height(height);
        }
    });

	View.Layout.Frame = View.Base.extend({
		tagName : "div",
		className : "lside_area",
		initialize : function(attributes){
			View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this);
            this.listenTo(this.grid.dimensionModel, "columnWidthChanged", this._onColumnWidthChanged, this);
            this.setOwnProperties({
                header : null,
                body : null
            });
		},
		render : function(){
			this.destroyChildren();
            this.trigger('beforeRender');
			this.beforeRender();

			var header = this.header = this.createView(View.Layout.Header, {
                grid : this.grid,
				whichSide : this.whichSide
			});
			var body = this.body = this.createView(View.Layout.Body, {
                grid : this.grid,
				whichSide : this.whichSide
			});

			this.$el
                .append(header.render().el)
                .append(body.render().el);

			this.afterRender();
            this.trigger('afterRender');
			return this;
		},
		beforeRender : function(){
			//@TODO: override this function
		},
		afterRender : function(){
			//@TODO: override this function
		}
	});

















    /**
     * Header 레이아웃 View
     * @type {*|void}
     */
	View.Layout.Header = View.Base.extend({
		tagName : "div",
		className : "header",
		viewList : [],
		whichSide : 'R',
        events : {
            'click' : '_onClick'
        },
		initialize : function(attributes, option){
			View.Base.prototype.initialize.apply(this, arguments);
			this.whichSide = attributes.whichSide;
			this.viewList = [];
            this.listenTo(this.grid.renderModel, "change:scrollLeft", this._onScrollLeftChange, this);
            this.listenTo(this.grid.dimensionModel, "columnWidthChanged", this._onColumnWidthChanged, this);

		},
        _onColumnWidthChanged : function(){
            var columnData = this._getColumnData(),
				columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');
//            console.log(columnWidthList[0],columnWidthList[1],columnWidthList[2]);

            for(var i  = 0; i < $colList.length; i++){
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        _onScrollLeftChange : function(model, value){
            if(this.whichSide === 'R'){
                this.el.scrollLeft = value;
            }
        },
        _onClick : function(clickEvent){
            var $target = $(clickEvent.target);
            if($target.closest('th').attr('columnname') === '_button'){

            }
        },
		template : _.template('' +
				'	<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
				'		<colgroup><%=colGroup%></colgroup>' +
				'		<tbody><%=tBody%></tbody>'+
				'	</table>'),
		render : function(){
			this.destroyChildren();
            var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
                whichSide : this.whichSide,
                grid : this.grid
            });
			this.$el.css({
				height : this.grid.dimensionModel.get('headerHeight')
			}).html(this.template({
				'colGroup' : this._getColGroupMarkup(),
				'tBody' : this._getTableBodyMarkup()
			}));


            this.$el.append(resizeHandler.render().el);
			return this;
		},

		_getColumnData : function(){
			var columnModel = this.grid.columnModel,
				dimensionModel = this.grid.dimensionModel,
				columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
				columnModelList = columnModel.getColumnModelList(this.whichSide);
			return {
				widthList : columnWidthList,
				modelList : columnModelList
			};
		},
        /**
         * col group 마크업을 생성한다.
         *
         * @returns {string}
         * @private
         */
		_getColGroupMarkup : function(){
			var columnData = this._getColumnData(),
				columnWidthList = columnData.widthList,
				columnModelList = columnData.modelList,
				html = '';

			for(var i = 0, len=columnWidthList.length; i < len; i++){
				html += '<col columnname="'+columnModelList[i]["columnName"]+'" style="width:'+columnWidthList[i]+'px">';
			}
			return html;
		},
        _getHeaderHeight : function(){
            return this.grid.dimensionModel.get('headerHeight');
        },
        /**
         * Header 의 body markup 을 생성한다.
         *
         * @returns {string}
         * @private
         */
		_getTableBodyMarkup : function(){
            var hierarchyList = this._getColumnHierarchyList();
            var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var columnData = this._getColumnData(),
                headerHeight = this._getHeaderHeight(),
                rowMarkupList = new Array(maxRowCount),
                headerMarkupList = [],
                height, curHeight;

            var columnModel, columnName = "", sRole = "", sHeight = "", colSpan = "", sRowSpan = "";
            var aColumnName = new Array(maxRowCount), colSpanList = [];
            var length, rowSpan = 1, title;
            var rowHeight = Util.getRowHeight(maxRowCount, headerHeight)-1;

            for(var i=0; i<hierarchyList.length; i++){
                length = hierarchyList[i].length;
                curHeight = 0;
                for(var j=0; j<length; j++){
                    rowSpan = (length - 1 == j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    columnModel = hierarchyList[i][j];

                    height = rowHeight * rowSpan;
                    if(j === length - 1){
                        height = (headerHeight - curHeight) - 2;
                    }else{
                        curHeight += height + 1;
                    }
                    if(aColumnName[j] == columnModel["columnName"]){
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    }else{
                        colSpanList[j] = 1;
                    }
                    aColumnName[j] = columnModel["columnName"];
                    columnName = " columnName='"+columnModel["columnName"]+"'";
                    sHeight = " height='" + height + "'";
                    sRowSpan = rowSpan > 1 ? " rowSpan='" + rowSpan + "'" : "";
                    colSpan = (colSpanList[j] > 1) ? " colSpan='" + colSpanList[j] + "'" : "";
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    title = columnModel["title"];
                    rowMarkupList[j].push("<th"+columnName+sRole+sHeight+sRowSpan+colSpan+">"+title+"</th>");
                }
            }
            for(var i=0; i<rowMarkupList.length; i++){
                headerMarkupList.push("<tr>"+rowMarkupList[i].join("")+"</tr>");
            }

			return headerMarkupList.join('');
		},
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param hierarchyList
         * @returns {number}
         * @private
         */
        _getHierarchyMaxRowCount : function(hierarchyList){
            var maxRowCount = 1,
                lengthList = [];
            _.each(hierarchyList, function(hierarchy, index){
                lengthList.push(hierarchy.length);
            }, this);
            return Math.max.apply(Math, lengthList);
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
         * @returns {Array}
         * @private
         */
        _getColumnHierarchyList : function(){
            var columnModelList = this._getColumnData().modelList;
            var hierarchyList = [];
            _.each(columnModelList, function(model, index){
                hierarchyList.push(this._getColumnHierarchy(model).reverse());
            }, this);
            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param columnModelData
         * @param resultList
         * @returns {*|Array}
         * @private
         */
        _getColumnHierarchy : function(columnModelData, resultList){
            var columnMerge = this.grid.option("columnMerge"),
                resultList = resultList || [];

            if(columnModelData){
                resultList.push(columnModelData);
                if(columnMerge){
                    for(var i=0; i<columnMerge.length; i++){
                        if($.inArray(columnModelData["columnName"], columnMerge[i]["columnNameList"]) !== -1){
                            resultList = this._getColumnHierarchy(columnMerge[i], resultList);
                        }
                    }
                }
            }
            return resultList;
        }
	});
    View.Layout.Header.ResizeHandler = View.Base.extend({
		tagName : "div",
		className : "resize_handle_container",
		viewList : [],
		whichSide : 'R',
        events : {
            'mousedown .resize_handle' : "_onMouseDown"
        },
		initialize : function(attributes, option){
			View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide : attributes.whichSide,
                isResizing : false,     //현재 resize 발생 상황인지
                $target : null,         //이벤트가 발생한 target resize handler
                differenceLeft : 0,
                initialWidth : 0,
                initialOffsetLeft : 0,
                initialLeft : 0
            });
            this.listenTo(this.grid.dimensionModel, "columnWidthChanged", this._refreshHandlerPosition, this);
		},
        _getColumnData : function(){
			var columnModel = this.grid.columnModel,
				dimensionModel = this.grid.dimensionModel,
				columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
				columnModelList = columnModel.getColumnModelList(this.whichSide);
			return {
				widthList : columnWidthList,
				modelList : columnModelList
			};
		},
        _getResizeHandler : function(){
            var columnData = this._getColumnData(),
				columnModelList = columnData.modelList,
                resizeHandleMarkupList = [],
                headerHeight = this.grid.dimensionModel.get('headerHeight');

            for(var i = 0; i < columnModelList.length; i++){
                resizeHandleMarkupList.push("<div columnIndex='"+i+"'" +
                    " columnName='"+columnModelList[i]["columnName"]+
                    "' class='resize_handle"+
                    (i + 1 == columnModelList.length ? " resize_handle_last" : "")+
                    "' style='height:"+ headerHeight + "px;" +
//                    "background:red;opacity:1" +
                    "'" +
                    " title='마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,\n더블클릭을 통해 넓이를 초기화할 수 있습니다.'></div>");
            }
            return resizeHandleMarkupList.join('');

        },
        render : function(){
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    "marginTop" : -headerHeight+'px',
                    "height" : headerHeight+'px'
                })
                .html(this._getResizeHandler());
            this._refreshHandlerPosition();
            return this;
        },
        _refreshHandlerPosition : function(){
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $resizeHandleList = this.$el.find('.resize_handle'),
                curPos = 0;

            for(var i = 0, len=$resizeHandleList.length; i < len; i++){
                curPos += columnWidthList[i]+1;
                $resizeHandleList.eq(i).css('left', (curPos - 3)+'px');
            }

        },

        _isResizing : function(){
            return !!this.isResizing;
        },
        _onMouseDown : function(mouseDownEvent){
            this._startResizing(mouseDownEvent);
        },
        _onMouseUp : function(mouseUpEvent){
            this._stopResizing();
            this.isResizing = false;
        },
        _onMouseMove : function(mouseMoveEvent){
            if(this._isResizing()){
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft;

                this.$target.css('left', left + 'px');

                var width = this._calculateWidth(mouseMoveEvent.pageX);
                var index = parseInt(this.$target.attr('columnindex'), 10);
                this.grid.dimensionModel.setColumnWidth(this._getColumnIndex(index), width);

            }
        },
        _calculateWidth : function(pageX){
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        _getColumnIndex : function(index){
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param mouseDownEvent
         * @private
         */
        _startResizing : function(mouseDownEvent){
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $target = $(mouseDownEvent.target);


            this.isResizing = true;
            this.$target = $target;
            this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
            this.initialOffsetLeft = this.$el.offset().left;
            this.initialWidth = columnWidthList[$target.attr('columnindex')];
            this.grid.$el
                .bind('mousemove', $.proxy(this._onMouseMove, this))
                .bind('mouseup', $.proxy(this._onMouseUp, this))
                .css("cursor", "col-resize");

        },
        /**
         * resize stop 세팅
         * @private
         */
        _stopResizing : function(){
            this.isResizing = false;
            this.$target = null;
            this.initialLeft = 0;
            this.initialOffsetLeft = 0;
            this.initialWidth = 0;
            this.grid.$el
                .unbind('mousemove', $.proxy(this._onMouseMove, this))
                .unbind('mouseup', $.proxy(this._onMouseUp, this))
                .css("cursor", "default");
        }
    });
    View.Row = View.Base.extend({
        tagName : "tr",
        events : {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        destroy : function(){
            this.destroyChildren();
            this._detachHandler();
            this.remove();
        },
        initialize : function(attributes){
            View.Base.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';

            this.setOwnProperties({
                whichSide : whichSide,
                columnModelList : this.grid.columnModel.getColumnModelList(whichSide),
                renderer : [],
                eventHandlerList : []
            });
            this.listenTo(this.model, 'change', this._onModelChange, this);
        },
        _onClick : function(clickEvent){

        },
        _onMouseDown : function(mouseDownEvent){
            var $target = $(mouseDownEvent.target).closest('td');
            this.grid.dataModel.focusCell(this.model.get('rowKey'), $target.attr('columnName'));
            if(this.grid.option('selectType') === 'radio'){
                this.grid.checkRow(this.model.get('rowKey'));
            }
        },
        /**
         * model 변경시
         * @param model
         * @private
         */
        _onModelChange : function(model){
            _.each(model.changed, function(cellData, columnName){
                if(columnName !== '_extraData'){
                    var editType = this.getEditType(columnName),
                        cellInstance = this.grid.cellFactory.getInstance(editType);
                        cellInstance.onModelChange(cellData, this.$el);
                }
            }, this);
            //
        },
        _attachHandler : function(){
            var selector, cellInstance, $target;
//            console.log('this.eventHandlerList', this.eventHandlerList);
            for(var i = 0; i < this.eventHandlerList.length; i++){
                selector = this.eventHandlerList[i].selector;
                cellInstance = this.eventHandlerList[i].cellInstance;
                $target = this.$el.find(selector);
//                console.log('@@@$target', $target.length);
                cellInstance._attachHandler($target);
            }
        },
        _detachHandler : function(){
            var selector, cellInstance;

            for(var i = 0; i < this.eventHandlerList.length; i++){
                selector = this.eventHandlerList[i].selector;
                cellInstance = this.eventHandlerList[i].cellInstance;
                cellInstance._detachHandler(this.$el.find(selector));
            }
        },
        getEditType : function(columnName){
            var columnModel = this.grid.columnModel.getColumnModel(columnName);
            return (columnName === '_button') ? 'mainButton' : columnModel["editOption"] && columnModel["editOption"]["type"];
        },
        render : function(){
            this.destroyChildren();
            //todo : detach event handler
            this._detachHandler();

            this.$el.css({
                height : this.grid.dimensionModel.get('rowHeight')
            }).attr({
                key : this.model.get('rowKey')
            });
            this.$el.html('');


            var columnModelList = this.columnModelList;

            var columnName, cellData,
                model, columnModel, editType, cellInstance,
                html = '';
            this.eventHandlerList = [];

            for(var i = 0,len=columnModelList.length; i < len; i++){
                columnName = columnModelList[i]["columnName"];
                cellData = this.model.get(columnName);
                if(cellData && cellData['isMainRow']){
                    editType = this.getEditType(columnName);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.eventHandlerList.push({
                        selector : 'td[columnName="'+columnName+'"]',
                        cellInstance : cellInstance
                    });
                }
            }


            this.$el.prepend(html);
            this._attachHandler();
            //todo : attach event handler
            return this;

        }
    });


    View.RowList = View.Base.extend({
        initialize : function(attributes){
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide : (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection : 0
            });

            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },
        render : function(){
            this.destroyChildren();
            this.$el.html("");
            this.addAll();
            return this;
        },

        addOne : function(row){
            var rowView = this.createView(View.Row, {
                grid : this.grid,
                model : row,
                whichSide : this.whichSide
            });
            this.$el.append(rowView.render().el);
        },
        addAll : function(){
            var start = new Date();
            console.log('View.RowList.addAll start');
            var $documentFragment = $(document.createDocumentFragment());
            this.collection.forEach(function(row){
                var rowView = this.createView(View.Row, {
                    grid : this.grid,
                    model : row,
                    whichSide : this.whichSide
                });
                $documentFragment.append(rowView.render().el);
            }, this);
            this.$el.html('');
            this.$el.prepend($documentFragment);
            var end = new Date();
            console.log('View.RowList.addAll end', end-start);
        }
    });
    View.Cell.Base = View.Base.extend({
        eventHandler : {},
        shouldRenderList : ['isEditable', 'optionList', 'value'],
        initialize : function(attributes, options){
            var eventHandler = {};
            View.Base.prototype.initialize.apply(this, arguments);
            _.each(this.eventHandler, function(methodName, eventName){
                eventHandler[eventName] = $.proxy(this[methodName], this);
            }, this);
            this.setOwnProperties({
                _eventHandler : eventHandler
            });
        },

        baseTemplate : _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' rowSpan="<%=rowSpan%>"' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            '>' +
            '<%=content%>' +
            '</td>'),


        onModelChange : function(cellData, $tr){

            var $target = this._getCellElement(cellData.columnName, $tr),
                shouldRender = false;

            this._setFocusedClass(cellData, $target);

            for(var i = 0; i < this.shouldRenderList.length; i++){
                if($.inArray(this.shouldRenderList[i], cellData.changed) !== -1){
                    shouldRender = true;
                    break;
                }
            }
            if(shouldRender === true){
                this.render(cellData, $target);
            }else{
                this.setElementAttribute(cellData, $target);
            }
        },
        _attachHandler : function($target){
            _.each(this._eventHandler, function(handler, name){
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if(selector){
                    $target = $target.find(selector);
                }

                $target.off(eventName).on(eventName, handler);
//                console.log('$target', $target.length, $target.html(), handler);
            }, this);
        },
        _detachHandler : function($target){
            _.each(this._eventHandler, function(handler, name){
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if(selector){
                    $target = $target.find(selector);
                }

                $target.off(eventName);
            }, this);
        },
        _setFocusedClass : function(cellData, $target){
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },
        setElementAttribute : function(cellData, $target){

        },
        render : function(cellData, $target){
            this._detachHandler($target);
            $target.html(this.getContentHtml(cellData));
            this._attachHandler($target);
        },

        getHtml : function(cellData){
            var classNameList = [];

            if(cellData.className){
                classNameList.push(cellData.className);
            }
            if(cellData.selected === true) {
                classNameList.push('selected');
            }
            if(cellData.focused === true){
                classNameList.push('focused');
            }

            return this.baseTemplate({
                columnName : cellData.columnName,
                rowSpan : cellData.rowSpan,
                className : classNameList.join(' '),
                attributes : this.getAttributes(cellData),
                content : this.getContentHtml(cellData)
            });
        },
        getAttributesString : function(attributes){
            var str = '';
            _.each(attributes, function(value, key){
                str += ' ' + key + '="'+value+'"';
            }, this);
            return str;
        },
        getEventHandler : function(){
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getContentHtml : function(cellData){
            return cellData.value;
        },
        /**
         * implement this.
         * @private
         */
        getAttributes : function(cellData){
            return '';
        },
        _getColumnName : function($target){
            return $target.closest('td').attr('columnName');
        },
        _getRowKey : function($target){
            return $target.closest('tr').attr('key');
        },
        _getCellElement : function(columnName, $tr){
            return $tr.find('td[columnName="' + columnName + '"]');
        },
        _getCellAddr : function($target){
            return {
                rowKey : this._getRowKey($target),
                columnName : this._getColumnName($target)
            };
        }
    });


    View.Cell.Interface = View.Cell.Base.extend({
        shouldRenderList : ['isEditable', 'optionList', 'value'],
        eventHandler : {
        },
        initialize : function(){
            View.Cell.Base.prototype.initialize.apply(this, arguments);
        },
        getContentHtml : function(cellData){
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute : function(cellData, $target){
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });



    /**
     *  editOption 에 list 를 가지고 있는 형태
     * @type {*|void}
     */
    View.Cell.List = View.Cell.Interface.extend({
        shouldRenderList : ['isEditable', 'optionList'],
        eventHandler : {
        },
        initialize : function(){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        getContentHtml : function(cellData){
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute : function(cellData, $target){
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


    /**
     * editType select
     * @type {*|void}
     */
    View.Cell.List.Select = View.Cell.List.extend({
        initialize: function (attributes) {
            View.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler : {
            "click" : "onClick",
            "change select" : "onChange"
        },

        getContentHtml : function(cellData){
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                html = '';

            html += '<select name="'+Util.getUniqueKey()+'">';
            for(var i = 0, list = columnModel.editOption.list; i < list.length; i++){
                html += '<option ';
                html += 'value="'+list[i].value + '"';

                if(cellData.value == list[i].value){
                    html += ' selected';
                }
                html += ' >';
                html += list[i].text;
                html += '</option>';
            }
            html += '</select>';
            return html;

        },
        setElementAttribute : function(cellData, $target){
            $target.find('select').val(cellData.value);
        },
        onClick : function(clickEvent){
        },
        onChange : function(changeEvent){
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddr($target);

            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * editType = radio || checkbox
     * @type {*|void}
     */
    View.Cell.List.Button = View.Cell.List.extend({
        initialize: function (attributes) {
            View.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler : {
            "click" : "onClick",
            "change input" : "onChange"
        },
        template : {
            input : _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%>>'),
            label : _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        getContentHtml : function(cellData){
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                html = '',
                name = Util.getUniqueKey(),
                id;

            for(var i = 0, list = columnModel.editOption.list; i < list.length; i++){
                id = name + '_' + list[i].value;
                html += this.template.input({
                    type : columnModel.editOption.type,
                    name : name,
                    id : id,
                    value : list[i].value,
                    checked : $.inArray(''+list[i].value, checkedList) === -1 ? '' : 'checked'
                });
                if(list[i].text){
                    html += this.template.label({
                        id : id,
                        text : list[i].text
                    });
                }
            }

            return html;
        },
        setElementAttribute : function(cellData, $target){
            //TODO
        },
        _getEditType : function($target){
            var columnName = this._getColumnName($target),
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                type = columnModel.editOption.type;

            return type;
        },
        onClick : function(clickEvent){
        },
        _getCheckedList : function($target){
            var $checkedList = $target.closest('td').find('input[type='+this._getEditType($target)+']:checked'),
                checkedList = [];

            for(var i = 0; i < $checkedList.length; i++){
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        onChange : function(changeEvent){
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddr($target);
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target));
        },
        _getInputEl : function(value){
            return this.$el.find('input[type='+this.type+'][value="'+value+'"]');
        }
    });
    View.Cell.Normal = View.Cell.Interface.extend({
        initialize : function(attributes, options){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        getContentHtml : function(cellData, $target){
            return cellData.value;
        },
        setElementAttribute : function(cellData, $target){
        }
    });


    View.Cell.MainButton = View.Cell.Interface.extend({
        shouldRenderList : ['isEditable', 'optionList'],
        eventHandler : {
            "mousedown" : "_onMouseDown",
            "change input" : "_onChange"
        },
        initialize : function(attributes, options){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        template : _.template('<input type="<%=type%>" name="<%=name%>" <%=checked%>/>'),
        getContentHtml : function(cellData){
            return this.template({
                type : this.grid.option('selectType'),
                name : this.grid.id,
                checked : (!!cellData.value) ? 'checked' : ''
            });
        },
        setElementAttribute : function(cellData, $target){
            $target.find('input').prop('checked', !!cellData.value);
        },
        getAttributes : function(cellData){
            return this.getAttributesString({
                align : 'center'
            });
        },
        _onChange : function(changeEvent){
            var $target = $(changeEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            this.grid.setValue(rowKey, columnName, $target.prop('checked'));
        },
        _onMouseDown : function(mouseDownEvent){
            var $target = $(mouseDownEvent.target);
            if(!$target.is('input')){
                $target.find('input').trigger('click');
            }
        }
    });
    View.Cell.Text = View.Cell.Interface.extend({
        shouldRenderList : ['isEditable', 'optionList'],
        initialize : function(attributes, options){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        template : _.template('<input type="text" value="<%=value%>" name="<%=name%>" />'),
        eventHandler : {
            "blur input" : "onBlur"
        },
        getContentHtml : function(cellData){
            return this.template({
                value : Util.encodeHTMLEntity(cellData.value),
                name : Util.getUniqueKey(),
                checked : (!!cellData.value) ? 'checked' : ''
            });
        },
        setElementAttribute : function(cellData, $target){

        },
        onBlur : function(blurEvent){
            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            console.log($target.val());
            this.grid.setValue(rowKey, columnName, $target.val());
        }
    });
    View.Extra.Log = View.Base.extend({
        events : {
            'click input' : 'clear'
        },
        initialize : function(attributes){
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                maxCount : 20,
                logs : [],
                buffer : '',
                lastTime : -1,
                timeoutIdForLogs :0,
                width : 500,
                height : 200,
                opacity : 0.8
            });
        },
        activate : function(){
            if(this.grid.option('debug') === true){
                this.listenTo(this.grid, "afterRender", this.appendTo, this);
            }
        },
        appendTo : function(){
            this.grid.$el.append(this.render().el);
        },
        render : function(){
            this.$el.css({
                'position' : 'absolute',
                'right' : '25px',
                'top' : '25px',
                'opacity' : this.opacity,
                'background' : 'yellow',
                'width' : this.width+'px',
                'height' : this.height+'px',
                'overflow' : 'auto'
            });
            return this;
        },
        clear : function(){
//            this.buffer = '';
//            this.$el.html('');
        },
        write : function(text){

            if(!this.buffer){
                this.buffer = "";
            }
            clearTimeout(this.timeoutIdForLogs);
            var str = this.buffer;

            var d = new Date();
            var timeStamp = "["+d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()+"] ";
            var elapsed = 0;

            if(this.lastTime > 0){
                elapsed = d - this.lastTime;
            }

            this.lastTime = d;


            var lineList = str.split("<br>");
            if(lineList.length > this.maxCount){
                lineList.pop();
            }

            lineList.unshift('<b>'+timeStamp + text + ' :elapsed ['+elapsed+']</b>');
            this.buffer = lineList.join("<br>");
            this.timeoutIdForLogs = setTimeout($.proxy(function(){
                this.$el.html(this.buffer);
            }, this), 100);
        }
    });
    View.Extra.Selection = View.Base.extend({
        events : {
        },
        initialize : function(attributes, option){
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
				whichSide : attributes && attributes.whichSide || 'R',
                lside : null,
                rside : null,
                range : {
                    column : [0, 1],
                    row : [2, 3]
                }
			});
        },
        activate : function(){
            this.listenTo(this.grid.view.rside, "afterRender", this.appendToRside, "a");
            this.listenTo(this.grid.view.lside, "afterRender", this.appendToLside, "b");
        },
        appendToRside : function(){
            this.rside = this.appendTo(this.grid.view.rside.body, View.Extra.Selection.Layer.Rside);
            this.show();
        },
        appendToLside : function(){
            this.lside = this.appendTo(this.grid.view.lside.body, View.Extra.Selection.Layer.Lside);

        },
        appendTo : function(view, clazz){
//            var layer = new clazz({
//                grid : this.grid,
//                columnWidthList : this.grid.dimensionModel.getColumnWidthList(view.whichSide)
//            });
//            this.addView(layer);
//            view.$el.append(layer.render().el);
//            return layer;
        },


        startSelection : function(rowIndex, columnIndex){
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
        },
        updateSelectionRange : function(rowIndex, columnIndex){
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
        },
        endSelection : function(){
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
        },

        show : function(){
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                startRow = Math.min.apply(Math, this.range.row),
                endRow = Math.max.apply(Math, this.range.row),
                startColumn = Math.min.apply(Math, this.range.column),
                endColumn = Math.max.apply(Math, this.range.column),
                top = Util.getTBodyHeight(startRow, rowHeight),
                height = Util.getTBodyHeight(endRow-startRow, rowHeight) - 3;

            console.log('this.lside.$el', this.lside);
            this.lside.show(startRow, endRow, startColumn, endColumn);
            this.rside.show(startRow, endRow, startColumn, endColumn);

            this.lside.$el.css({
                top : top+'px',
                width : 100 + 'px',
                height : height + 'px',
                display: 'block'
            });

//                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
//                columnWidthList = this.grid.dimensionModel.get('columnWidthList'),
//
//                top = Util.getTBodyHeight(startRow, rowHeight),
//                height = Util.getTBodyHeight(endRow-startRow, rowHeight) - 3;
//
//
//
//            //좌측 영역 랜더링
//
//
//            //우측 영역도 랜더링
//            if(endColumn >= columnFixIndex){
//
//            }
//
//            this.$el.css({
//                top : top+'px',
//                width : 100 + 'px',
//                height : height + 'px',
//                display: 'block'
//            });
        }



    });


    View.Extra.Selection.Layer = View.Base.extend({
        tagName : 'div',
        className : 'selection_layer',
        initialize : function(attributes, option){
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, "change:scrollTop", this._onScrollTopChange, this);
			this.listenTo(this.grid.renderModel, "beforeRefresh", this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, "change:top", this._onTopChange, this);
            this.setOwnProperties({
                columnWidthList : attributes.columnWidthList
            });
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){

        },
        render : function(){
            console.log('@@Selection layer render');
            return this;
        }
    });

    View.Extra.Selection.Layer.Lside = View.Extra.Selection.Layer.extend({
        initialize : function(attributes, option){
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('LSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){
            console.log(this.$el.length);
        },
        show : function(startRow, endRow, startColumn, endColumn){

        }
    });

    View.Extra.Selection.Layer.Rside = View.Extra.Selection.Layer.extend({
        initialize : function(attributes, option){
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('RSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){

        },
        show : function(startRow, endRow, startColumn, endColumn){

        }
    });

    var Config = {
        plugins : {
            'clipboard' : View.Plugin.Clipboard,

        }
    };


    var Grid = window.Grid = View.Base.extend({
        scrollBarSize : 17,
		lside : null,
		rside : null,
		footer : null,
        cellFactory : null,


		events : {
			'click' : '_onClick',
            'mousedown' : '_onMouseDown'
		},

		initialize : function(options){
			View.Base.prototype.initialize.apply(this, arguments);
            var id = Util.getUniqueKey();
            this.__instance[id] = this;


			var defaultOptions = {
                debug : false,
				columnFixIndex : 0,
				columnModelList  : [],
				keyColumnName : null,
				selectType : '',

                autoNumbering : true,

                headerHeight : 35,
                rowHeight : 27,
                displayRowCount : 10,
                minimumColumnWidth : 50,
                notUseSmartRendering : false,
                columnMerge : [],
                minimumWidth : 300,      //grid의 최소 너비

                scrollX : true,
                scrollY : true,
                useDataCopy : true
			};




			options = $.extend(defaultOptions, options);

            this.setOwnProperties({
                'columnModel' : null,
                'dataModel' : null,
                'renderModel' : null,
                'layoutModel' : null,

                'view' : {
                    'lside' : null,
                    'rside' : null,
                    'footer' : null,
                    'clipboard' : null
                },

                'id' : id,
                'options' : options
			});

			this._initializeModel();
            this._initializeListener();
			this._initializeView();

            this._initializeScrollBar();

			this.render();

		},
        _initializeListener : function(){
//            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
        },
        _onWidthChange : function(width){
            this.$el.css('width', width + 'px');
        },
        option : function(key, value){
            if(value === undefined){
                return this.options[key];
            }else{
                this.options[key] = value;
                return this;
            }
        },
		_onClick : function(clickEvent){
//			var $target = $(clickEvent.target);
//			if(!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))){
//				this.view.clipboard.$el.focus();
//			}
		},
        _onMouseDown : function(mouseDownEvent){
            var $target = $(mouseDownEvent.target);
			if(!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))){
                mouseDownEvent.preventDefault();
                this.trigger('mousedown', mouseDownEvent);
			}
        },
		/**
		 * _initializeModel
		 *
		 * Initialize data model instances
		 * @param options
		 * @private
		 */
		_initializeModel : function(){
			//define column model
			this.columnModel = new Data.ColumnModel({
                grid : this,
				keyColumnName : this.option('keyColumnName'),
				columnFixIndex : this.option('columnFixIndex')
			});
            this.setColumnModelList(this.option('columnModelList'));

			//define layout model
			this.dimensionModel = new Model.Dimension({
                grid : this,
				width : this.$el.width(),
				height : this.$el.height(),
                rowHeight : this.option('rowHeight')
			});
//			//define rowList
			this.dataModel = new Data.RowList({
                grid : this
			});

			if(this.option('notUseSmartRendering') === true){
				this.renderModel = new Model.Renderer({
					grid : this
				});
			}else{
				this.renderModel = new Model.Renderer.Smart({
					grid : this
				});
			}

            this.cellFactory = this.createView(View.CellFactory, { grid : this });
		},
        /**
		 * _initializeView
		 *
		 * Initialize view instances
		 * @private
		 */
        _initializeView : function(){
            this.cellFactory = this.createView(View.CellFactory, {
                grid : this
            });

            //define header & body area
			this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid : this
			});

			this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid : this
			});

			this.view.footer = this.createView(View.Layout.Footer, {
                grid : this
			});

            this.view.clipboard = this.createView(View.Clipboard, {
                grid : this
			});
        },

        _initializeScrollBar : function(){
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },

		/**
		 * render
		 *
		 * Rendering grid view
		 */
		render : function(){
            this.trigger('beforeRender');
            this.$el.attr('instanceId', this.id)
                .append(this.view.lside.render().el)
			    .append(this.view.rside.render().el)
			    .append(this.view.footer.render().el)
                .append(this.view.clipboard.render().el);

            this.trigger('afterRender');
		},

		/**
		 * setRowList
		 *
		 * set row list data
		 * @param rowList
		 */
		setRowList : function(rowList){
			this.dataModel.set(rowList, {
				parse : true
			});
		},
		/**
		 * setValue
		 *
		 * change cell value
		 * @param rowKey
		 * @param columnName
		 * @param columnValue
		 */
		setValue : function(rowKey, columnName, columnValue, silent){
			//@TODO : rowKey to String
			this.dataModel.setValue(rowKey, columnName, columnValue, silent);
		},
        setColumnValue : function(columnName, columnValue, silent){
            this.dataModel.setColumnValue(columnName, columnValue, silent);
        },
		/**
		 * appendRow
		 *
		 * append row inside grid
		 * @param row
		 */
		appendRow : function(row){
			this.dataModel.append(row);
		},
		/**
		 * prependRow
		 *
		 * prepend row inside grid
		 * @param row
		 */
		prependRow : function(row){
			this.dataModel.prepend(row);
		},
		/**
		 * setColumnIndex
		 *
		 * change columnfix index
		 * @param index
		 */
		setColumnIndex : function(columnFixIndex){
            this.option({
                columnFixIndex : columnFixIndex
            });
			this.columnModel.set({columnFixIndex : columnFixIndex});
		},
        setColumnModelList : function(columnModelList){
            this.columnModel.set('columnModelList', columnModelList);
        },
		/**
		 * sort by columnName
		 *
		 * @param columnName
		 */
		sort : function(columnName){
			this.dataModel.sortByField(columnName);
		},
        getRowList : function(){
            return this.dataModel.toJSON();
        },
        getCheckedRowList : function(){
            return this.dataModel.where({
                '_button' : true
            });
        },
        getCheckedRowKeyList : function(){
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row){
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return rowKeyList;
        },
        getModifiedRowList : function(){
            return this.dataModel.getModifiedRowList();
        },
        disableCell : function(rowKey, columnName){

        },
        enableCell : function(rowKey, columnName){

        },
        setEditOptionList : function(rowKey, columnName, optionList){

        },
        checkRow : function(rowKey){
            this.setValue(rowKey, '_button', true);
        },
        checkAllRow : function(){
            this.dataModel.setColumnValue('_button', true);
        },
        uncheckAllRow : function(){
            this.dataModel.setColumnValue('_button', false);
        },
		/**
		 * @deprecated
		 * @param whichSide
		 * @returns {*}
		 * @private
		 */
		_getDataCollection : function(whichSide){
			return this.renderModel.get(whichSide);
		},

        destroy : function(){
            this.destroyChildren();
            this.$el.removeAttr('instanceId');
            this.stopListening();
            for(var property in this){
                this[property] = null;
                delete this[property];
            }
        }

	});

    Grid.prototype.__instance = {};

    Grid.getInstanceById = function(id){
        return this.prototype.__instance[id];
    };

})();