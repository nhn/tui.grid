/**
 * @fileoverview Row Painter 정의
 * @author NHN Ent. FE Development Team
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
     *      @param {object} options.collection change 를 감지할 collection 객체
     */
    initialize: function(options) {
        View.Base.Painter.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            columnModelList: options.columnModelList
        });
    },
    /**
     * detachHandlerAll 을 호출하고 기본 destroy 로직을 수행한다.
     */
    destroy: function() {
        this.stopListening();
        this.remove();
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
    onModelChange: function(model, $tr) {
        var editType,
            cellInstance;

        _.each(model.changed, function(cellData, columnName) {
            if (columnName !== '_extraData') {
                editType = this._getEditType(columnName, cellData);
                cellInstance = this.grid.cellFactory.getInstance(editType);
                cellInstance.onModelChange(cellData, $tr);
            }
        }, this);
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
