'use strict';

/**
 * @fileoverview Body View
 * @author NHN Ent. FE Development Team
 */

var View = require('../base/view');

/**
 * body layout 뷰
 *
 * @constructor View.Layout.Body
 */
var Body = View.extend(/**@lends Body.prototype */{
    tagName: 'div',
    className: 'data',
    template: _.template('<div class="table_container" style="top: 0px"><%=table%></div>'),
    templateTable: _.template('' +
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '   <colgroup><%=colGroup%></colgroup>' +
        '   <tbody><%=tbody%></tbody>' +
        '</table>'),
    events: {
        'scroll': '_onScroll'
    },

    /**
     * 생성자 함수
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R']  어느 영역의 body 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: options && options.whichSide || 'R',
            isScrollSync: false,
            extraWidth: 0,
            $tableContainer: null
        });

        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)
            .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
            .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
            .listenTo(this.grid.renderModel, 'refresh', this._setTopPosition, this);
    },

    /**
     * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
     * @param {Object} model 변경이 일어난 model 인스턴스
     * @param {Number} value bodyHeight 값
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * 컬럼 너비 변경 이벤트 핸들러
     * @private
     */
    _onColumnWidthChanged: function() {
        var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
            $colList = this.$el.find('col');

        _.each(columnWidthList, function(width, index) {
            $colList.eq(index).css('width', (width - View.Layout.Body.extraWidth) + 'px');
        }, this);
    },

    /**
     * 스크롤 이벤트 핸들러
     * @param {event} scrollEvent   스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var obj = {},
            renderModel = this.grid.renderModel;

        obj['scrollTop'] = scrollEvent.target.scrollTop;

        if (this.whichSide === 'R') {
            obj['scrollLeft'] = scrollEvent.target.scrollLeft;
        }
        renderModel.set(obj);
    },

    /**
     * Render model 의 Scroll left 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Render model 의 Scroll top 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollTop값
     * @private
     */
    _onScrollTopChange: function(model, value) {
        /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
        this.el.scrollTop = value;
    },

    /**
     * rowList 가 rendering 될 때 top 값을 조정한다.
     * @param {number} top  조정할 top 위치 값
     * @private
     */
    _setTopPosition: function(top) {
        this.$tableContainer.css('top', top + 'px');
    },

    /**
     * rendering 한다.
     * @return {View.Layout.Body}   자기 자신
     */
    render: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            collection = grid.renderModel.getCollection(whichSide),
            selection, rowList, tableHtml;

        this.destroyChildren();

        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }

        if (!this.grid.option('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }

        tableHtml = this.templateTable({
            colGroup: this._getColGroupMarkup(),
            tbody: ''
        });
        this.$el.css({
                height: grid.dimensionModel.get('bodyHeight')
            }).html(this.template({
                table: tableHtml
            }));
        this.$tableContainer = this.$el.find('div.table_container');

        rowList = this.createView(View.RowList, {
            grid: grid,
            collection: collection,
            bodyView: this,
            el: this.$el.find('tbody'),
            whichSide: whichSide
        });
        rowList.render();

        //selection 을 랜더링한다.
        selection = this.addView(grid.selection.createLayer(whichSide));
        this.$el.append(selection.render().el);

        return this;
    },

    /**
     * 하위요소의 이벤트들을 this.el 에서 받아서 해당 요소에게 위임하도록 핸들러를 설정한다.
     * @param {string} selector - 선택자
     * @param {object} handlerInfos - 이벤트 정보 객체. ex) {'blur': {selector:string, handler:function}, 'click':{...}...}
     * @private
     */
    attachTableEventHandler: function(selector, handlerInfos) {
        _.each(handlerInfos, function(obj, eventName) {
            this.$tableContainer.on(eventName, selector + ' ' + obj.selector, obj.handler);
        }, this);
    },

    /**
     * table 요소를 새로 생성한다.
     * (IE7-9에서 tbody의 innerHTML 변경할 수 없는 문제를 해결하여 성능개선을 하기 위해 사용)
     * @param {string} tbodyHtml - tbody의 innerHTML 문자열
     * @return {jquery} - 새로 생성된 table의 tbody 요소
     */
    redrawTable: function(tbodyHtml) {
        this.$tableContainer[0].innerHTML = this.templateTable({
            colGroup: this._getColGroupMarkup(),
            tbody: tbodyHtml
        });

        return this.$tableContainer.find('tbody');
    },

    /**
     * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
     * @return {string} <colgroup> 안에 들어갈 마크업 문자열
     * @private
     */
    _getColGroupMarkup: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            dimensionModel = grid.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(whichSide),
            columnModelList = grid.columnModel.getVisibleColumnModelList(whichSide),
            html = '';

        _.each(columnModelList, function(columnModel, index) {
            var name = columnModel['columnName'],
                width = columnWidthList[index] - View.Layout.Body.extraWidth;

            html += '<col columnname="' + name + '" style="width:' + width + 'px">';
        });
        return html;
    }
},
{
    /**
     * IE7에서만 TD의 padding 만큼 넓이가 늘어나는 버그를 위한 예외처리를 위한 값
     * @memberof View.Layout.Body
     * @static
     */
    extraWidth: (function() {
        var value = 0;
        if (ne.util.browser.msie && ne.util.browser.version === 7) {
            // Grid.css의 padding값이 변경되면 다음 값을 같이 변경해 주어야함.
            value = 20;
        }
        return value;
    }())
});

module.exports = Body;
