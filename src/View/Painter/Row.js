    /**
     * Row Painter
     * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
     * @constructor
     */
    View.Painter.Row = View.Base.Painter.extend({
        eventHandler: {
            'mousedown' : '_onMouseDown'
        },
        /**
         * TR 마크업 생성시 사용할 템플릿
         */
        baseTemplate: _.template('' +
            '<tr ' +
            'key="<%=key%>" ' +
            'class="<%=className%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            '</tr>'),
        /**
         * 초기화 함수
         * @param {object} attributes
         */
        initialize: function(attributes) {
            View.Base.Painter.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R',
                focusModel = this.grid.focusModel;

            this.setOwnProperties({
                $parent: attributes.$parent,        //부모 frame element
                collection: attributes.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
                cellHandlerList: [],
                _isEventAttached: false
            });

            //listener 등록
            if (this.collection) {
                this.collection.forEach(function(row) {
                    this.listenTo(row, 'change', this._onModelChange, this);
                }, this);
            }
            this.listenTo(focusModel, 'select', this._onSelect, this)
                .listenTo(focusModel, 'unselect', this._onUnselect, this)
                .listenTo(focusModel, 'focus', this._onFocus, this)
                .listenTo(focusModel, 'blur', this._onBlur, this);
        },
        /**
         * detachHandlerAll 을 호출하고 기본 destroy 로직을 수행한다.
         */
        destroy: function() {
            this.detachHandlerAll();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandlerAll
         * event handler 를 전체 tr에 한번에 붙인다.
         * 자기 자신의 이벤트 핸들러 및 cellFactory 의 이벤트 헨들러를 bind 한다.
         */
        attachHandlerAll: function() {
            this.attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         * 자기 자신의 이벤트 핸들러 및 cellFactory 의 이벤트 헨들러를 unbind 한다.
         */
        detachHandlerAll: function() {
            if (this._isEventAttached) {
                this.detachHandler(this.$parent);
                this.grid.cellFactory.detachHandler(this.$parent);
            }
        },

        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $td = $(mouseDownEvent.target).closest('td'),
                $tr = $(mouseDownEvent.target).closest('tr'),
                columnName = $td.attr('columnName'),
                rowKey = $tr.attr('key');
            this.grid.focus(rowKey, columnName);
            if (this.grid.option('selectType') === 'radio') {
                this.grid.check(rowKey);
            }
        },
        /**
         * model 변경 시
         * @param {object} model
         * @private
         */
        _onModelChange: function(model) {
            var editType, cellInstance, rowState,
                $trCache = {}, rowKey,
                $tr;

            _.each(model.changed, function(cellData, columnName) {
                rowKey = cellData.rowKey;
                $trCache[rowKey] = $trCache[rowKey] || this._getRowElement(rowKey);
                $tr = $trCache[rowKey];

                if (columnName !== '_extraData') {
                    //editable 프로퍼티가 false 라면 normal type 으로 설정한다.
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, $tr);
                }
            }, this);
        },
        /**
         * focusModel 의 select 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey
         * @param {Object}  focusModel
         * @private
         */
        _onSelect: function(rowKey, focusModel) {
            this._setCssSelect(rowKey, true);
        },
        /**
         * focusModel 의 unselect 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey
         * @param {Object}  focusModel
         * @private
         */
        _onUnselect: function(rowKey, focusModel) {
            this._setCssSelect(rowKey, false);
        },
        /**
         * 인자로 넘어온 rowKey 에 해당하는 행(각 TD)에 Select 디자인 클래스를 적용한다.
         * @param {(Number|String)} rowKey
         * @param {Boolean} isSelected  css select 를 수행할지 unselect 를 수행할지 여부
         * @private
         */
        _setCssSelect: function(rowKey, isSelected) {
            var grid = this.grid,
                columnModelList = this.columnModelList,
                columnName,
                $trCache = {},
                $tr, $td,
                mainRowKey;

            _.each(columnModelList, function(columnModel, index) {
                columnName = columnModel['columnName'];
                mainRowKey = grid.dataModel.getMainRowKey(rowKey, columnName);

                $trCache[mainRowKey] = $trCache[mainRowKey] || this._getRowElement(mainRowKey);
                $tr = $trCache[mainRowKey];
                $td = $tr.find('td[columnname="' + columnName + '"]');
                if ($td.length) {
                    isSelected ? $td.addClass('selected') : $td.removeClass('selected');
                }
            }, this);
        },
        /**
         * focusModel 의 blur 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 제거한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @private
         */
        _onBlur: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            $td.length && $td.removeClass('focused');
        },
        /**
         * focusModel 의 _onFocus 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 추가한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @private
         */
        _onFocus: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            $td.length && $td.addClass('focused');
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {string|number} rowKey
         * @return {jquery}
         * @private
         */
        _getRowElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
         * @param {String} columnName
         * @param {Object} cellData
         * @return {String}
         * @private
         */
        _getEditType: function(columnName, cellData) {
            var editType = this.grid.columnModel.getEditType(columnName);
            if (!cellData.isEditable && columnName !== '_number') {
                editType = 'normal';
            }
            return editType;
        },
        /**
         * html 마크업을 반환
         * @param {object} model
         * @return {string} html html 스트링
         */
        getHtml: function(model) {
            /* istanbul ignore if */
            if (model.get('rowKey') === undefined) {
               return '';
            } else {
                var columnModelList = this.columnModelList,
                    cellFactory = this.grid.cellFactory,
                    columnName, cellData, editType, cellInstance,
                    html = '';
                this.cellHandlerList = [];
                _.each(columnModelList, function(columnModel) {
                    columnName = columnModel['columnName'];
                    cellData = model.get(columnName);
                    /* istanbul ignore else */
                    if (cellData && cellData['isMainRow']) {
                        editType = this._getEditType(columnName, cellData);
                        cellInstance = cellFactory.getInstance(editType);
                        html += cellInstance.getHtml(cellData);
                        this.cellHandlerList.push({
                            selector: 'td[columnName="' + columnName + '"]',
                            cellInstance: cellInstance
                        });
                    }
                }, this);

                return this.baseTemplate({
                    key: model.get('rowKey'),
                    height: this.grid.dimensionModel.get('rowHeight'),
                    contents: html,
                    className: ''
                });
            }
        }
    });
