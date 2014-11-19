    /**
     * Row Painter
     * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
     */
    View.Painter.Row = View.Base.Painter.extend({
        eventHandler: {
            'click' : '_onClick',
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
                $parent: attributes.$parent,        //부모 element
                collection: attributes.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
                cellHandlerList: [],
                _isEventAttached: false
            });

            //listener 등록
            this.collection.forEach(function(row) {
                this.listenTo(row, 'change', this._onModelChange, this);
            }, this);
            this.listenTo(focusModel, 'select', this._onSelect, this)
                .listenTo(focusModel, 'unselect', this._onUnselect, this)
                .listenTo(focusModel, 'focus', this._onFocus, this)
                .listenTo(focusModel, 'blur', this._onBlur, this);
        },
        destroy: function() {
            this.detachHandlerAll();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandlerAll
         * event handler 를 전체 tr에 한번에 붙인다.
         */
        attachHandlerAll: function() {
            this.attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         */
        detachHandlerAll: function() {
            if (this._isEventAttached) {
                this.detachHandler(this.$parent);
                this.grid.cellFactory.detachHandler(this.$parent);
            }
        },
        _onClick: function(clickEvent) {
//            console.log('click', clickEvent);
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
//            var start = new Date();

            _.each(model.changed, function(cellData, columnName) {
                rowKey = cellData.rowKey;
                $trCache[rowKey] = $trCache[rowKey] || this._getTrElement(rowKey);
                $tr = $trCache[rowKey];

                if (columnName !== '_extraData') {
                    //editable 프로퍼티가 false 라면 normal type 으로 설정한다.
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, $tr);
                } else {
                    rowState = cellData.rowState;
                    if (rowState) {
                        //todo
//                        this._setRowState(rowState, $tr);
                    }
                }
            }, this);
//            var end = new Date();
//            console.log('Model change');
        },
        _setCssFocus: function(isBlur) {
            var dataModel = this.grid.dataModel,
                focusModel = this.grid.focusModel,
                renderModel = this.grid.renderModel.getCollection(this.whichSide),
                focused = focusModel.which(),
                columnModelList = this.columnModelList,
                len = columnModelList.length, i,
                row = renderModel.get(focused.rowKey),
                $trCache = {},
                $tr, $td, cellData, rowKey, columnName,
                isFocusedColumn;

            for (i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                isFocusedColumn = (columnName === focused.columnName);
                cellData = row.get(columnName);
                if (dataModel.isRowSpanEnable() && !cellData.isMainRow) {
                    cellData = renderModel.get(cellData.mainRowKey).get(columnName);
                }
                rowKey = cellData.rowKey;
                $trCache[rowKey] = $trCache[rowKey] || this._getTrElement(rowKey);
                $tr = $trCache[rowKey];
                $td = $tr.find('td[columnname="' + cellData.columnName + '"]');
            }
        },
        _onSelect: function(rowKey, focusModel) {
            this._setCssSelect(rowKey, true);
        },
        _onUnselect: function(rowKey, focusModel) {
            this._setCssSelect(rowKey, false);
        },
        _setCssSelect: function(rowKey, isSelected) {
            var grid = this.grid,
                columnModelList = this.columnModelList,
                columnName,
                $trCache = {},
                $tr, $td,
                mainRowKey,
                i, len = columnModelList.length;

            for (i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                mainRowKey = grid.getMainRowKey(rowKey, columnName);

                $trCache[mainRowKey] = $trCache[mainRowKey] || this._getTrElement(mainRowKey);
                $tr = $trCache[mainRowKey];
                $td = $tr.find('td[columnname="' + columnName + '"]');
                if ($td.length) {
                    isSelected ? $td.addClass('selected') : $td.removeClass('selected');
                }
            }
        },
        _onBlur: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            $td.length && $td.removeClass('focused');
        },
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
        _getTrElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 idEditable 프로퍼티에 따른 editType 을 반환한다.
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
            if (model.get('rowKey') === undefined) {
               return '';
            } else {
                var columnModelList = this.columnModelList,
                    columnModel = this.grid.columnModel,
                    cellFactory = this.grid.cellFactory,
                    columnName, cellData, editType, cellInstance,
                    html = '';
                this.cellHandlerList = [];
                for (var i = 0, len = columnModelList.length; i < len; i++) {
                    columnName = columnModelList[i]['columnName'];
                    cellData = model.get(columnName);
                    if (cellData && cellData['isMainRow']) {
                        editType = this._getEditType(columnName, cellData);
                        cellInstance = cellFactory.getInstance(editType);
                        html += cellInstance.getHtml(cellData);
                        this.cellHandlerList.push({
                            selector: 'td[columnName="' + columnName + '"]',
                            cellInstance: cellInstance
                        });
                    }
                }
                return this.baseTemplate({
                    key: model.get('rowKey'),
                    height: this.grid.dimensionModel.get('rowHeight'),
                    contents: html,
                    className: ''
                });
            }
        }
    });
