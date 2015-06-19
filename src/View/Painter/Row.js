/**
 * @fileoverview Row Painter 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Row Painter
     * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
     * @constructor View.Painter.Row
     */
    View.Painter.Row = View.Base.Painter.extend(/**@lends View.Painter.Row.prototype */{
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
         * @param {object} options
         *      @param {string} [options.whichSide='R']   어느 영역에 속하는 row 인지 여부. 'L|R' 중 하나를 지정한다.
         *      @param {jquery} options.$parent 부모 table body jQuery 엘리먼트
         *      @param {object} options.collection change 를 감지할 collection 객체
         */
        initialize: function(options) {
            View.Base.Painter.prototype.initialize.apply(this, arguments);

            var whichSide = (options && options.whichSide) || 'R',
                focusModel = this.grid.focusModel;

            this.setOwnProperties({
                $parent: options.$parent,        //부모 table body element
                collection: options.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
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
                .listenTo(focusModel, 'blur', this._onBlur, this)
                .listenTo(this.grid.dimensionModel, 'columnWidthChanged', _.debounce(this._onColumnWidthChanged, 200));
        },
        /**
         * detachHandlerAll 을 호출하고 기본 destroy 로직을 수행한다.
         */
        destroy: function() {
            //this.detachHandlerAll();
            this.stopListening();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandlerAll
         * event handler를 전체 tr에 한번에 붙인다.
         * 자기 자신의 이벤트 핸들러 및 cellFactory 의 이벤트 헨들러를 bind 한다.
         */
        attachHandlerAll: function() {
            this.attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * dimensionModel의 columnWidthChanged 이벤트가 발생했을때 실행되는 핸들러 함수
         * (렌더링 속도를 고려해 debounce를 통해 실행)
         */
        _onColumnWidthChanged: function() {
            try {
                this.triggerResizeEventOnTextCell();
            } catch (e) {
                // prevent Error from running test cases (caused by setTimeout in _.debounce())
            }
        },
        /**
         * Text타입의 셀에 resize 이벤트를 발생시킨다.
         */
        triggerResizeEventOnTextCell: function() {
            this.grid.cellFactory.triggerResizeEventOnTextCell(this.$parent);
        },
        /**
         * detach eventHandler
         * event handler를 전체 tr에서 제거한다.
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
         * @param {event} mouseDownEvent 이벤트 객체
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
            this.grid.selection.onMouseDown(mouseDownEvent);
        },
        /**
         * model 변경 시 이벤트 핸들러
         * @param {object} model    변화가 일어난 모델 인스턴스
         * @private
         */
        _onModelChange: function(model) {
            var editType,
                cellInstance,
                $trCache = {},
                rowKey,
                $tr;

            _.each(model.changed, function(cellData, columnName) {
                rowKey = cellData.rowKey;
                $trCache[rowKey] = $trCache[rowKey] || this._getRowElement(rowKey);
                $tr = $trCache[rowKey];

                if (columnName !== '_extraData') {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, $tr);
                }
            }, this);
        },
        /**
         * focusModel 의 select 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey 대상의 키값
         * @private
         */
        _onSelect: function(rowKey) {
            this._setCssSelect(rowKey, true);
        },
        /**
         * focusModel 의 unselect 이벤트 발생시 이벤트 핸들러
         * @param {(Number|String)} rowKey 대상의 키값
         * @private
         */
        _onUnselect: function(rowKey) {
            this._setCssSelect(rowKey, false);
        },
        /**
         * 인자로 넘어온 rowKey 에 해당하는 행(각 TD)에 Select 디자인 클래스를 적용한다.
         * @param {(Number|String)} rowKey 대상의 키값
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

            _.each(columnModelList, function(columnModel) {
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
         * @param {(Number|String)} rowKey 대상의 키값
         * @param {String} columnName 컬럼명
         * @private
         */
        _onBlur: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            if ($td.length) {
                $td.removeClass('focused');
            }
        },
        /**
         * focusModel 의 _onFocus 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 추가한다.
         * @param {(Number|String)} rowKey 대상의 키값
         * @param {String} columnName 컬럼명
         * @private
         */
        _onFocus: function(rowKey, columnName) {
            var $td = this.grid.getElement(rowKey, columnName);
            if ($td.length) {
                $td.addClass('focused');
            }
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {(string|number)} rowKey rowKey 대상의 키값
         * @return {jquery} 조회한 tr jquery 엘리먼트
         * @private
         */
        _getRowElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
         * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
         * @param {String} columnName 컬럼명
         * @param {Object} cellData 셀 데이터
         * @return {String} cellFactory 에서 사용될 editType
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
         * tr html 마크업을 반환한다.
         * @param {object} model 마크업을 생성할 모델 인스턴스
         * @return {string} tr 마크업 문자열
         */
        getHtml: function(model) {
            /* istanbul ignore if */
            if (ne.util.isUndefined(model.get('rowKey'))) {
               return '';
            }

            var columnModelList = this.columnModelList,
                cellFactory = this.grid.cellFactory,
                columnName, cellData, editType, cellInstance,
                html = '';
            _.each(columnModelList, function(columnModel) {
                columnName = columnModel['columnName'];
                cellData = model.get(columnName);
                /* istanbul ignore else */
                if (cellData && cellData['isMainRow']) {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                }
            }, this);

            return this.baseTemplate({
                key: model.get('rowKey'),
                height: this.grid.dimensionModel.get('rowHeight'),
                contents: html,
                className: ''
            });
        }
    });
