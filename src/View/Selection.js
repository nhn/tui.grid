/**
 * @fileoverview Selection 클래스 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  selection layer 의 컨트롤을 담당하는 틀래스
     *  @constructor View.Selection
     */
    View.Selection = View.Base.extend(/**@lends View.Selection.prototype */{
        events: {},
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                //메서드 호출시 range 값
                range: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                //rowspan 처리후 Selection box 의 range
                spannedRange: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                lside: null,
                rside: null,

                pageX: 0,
                pageY: 0,

                intervalIdForAutoScroll: 0,
                isEnable: true,
                _isShown: false
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dataModel, 'add remove sort reset', this.endSelection, this);
        },
        /**
         * selection 을 disable 한다.
         */
        enable: function() {
            if (this.grid.option('useDataCopy')) {
                this.isEnable = true;
            }
        },
        /**
         * selection 을 disable 한다.
         */
        disable: function() {
            this.endSelection();
            this.isEnable = false;
        },
        /**
         * 마우스 down 이벤트가 발생하여 selection 을 시작할 때, selection 영역을 계산하기 위해 document 에 이벤트 핸들러를 추가한다.
         * @param {Number} pageX
         * @param {Number} pageY
         */
        attachMouseEvent: function(pageX, pageY) {
            if (this.isEnable) {
                this.setOwnProperties({
                    pageX: pageX,
                    pageY: pageY
                });
                this.grid.updateLayoutData();
                $(document).on('mousemove', $.proxy(this._onMouseMove, this));
                $(document).on('mouseup', $.proxy(this._onMouseUp, this));
                $(document).on('selectstart', $.proxy(this._onSelectStart, this));
            }
        },
        /**
         * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
         */
        detachMouseEvent: function() {
            clearInterval(this.intervalIdForAutoScroll);
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mouse move event handler
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var pos;
            clearInterval(this.intervalIdForAutoScroll);
            if (this.hasSelection()) {
                pos = this.getIndexFromMousePosition(mouseMoveEvent.pageX, mouseMoveEvent.pageY);
                this.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
                if (this._isAutoScrollable(pos.overflowX, pos.overflowY)) {
                    this.intervalIdForAutoScroll = setInterval($.proxy(this._adjustScroll, this, pos.overflowX, pos.overflowY));
                }
            } else if (this._getDistance(mouseMoveEvent) > 10) {
                pos = this.getIndexFromMousePosition(this.pageX, this.pageY);
                this.startSelection(pos.row, pos.column);
            }
        },
        /**
         * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환.
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @return {boolean}
         * @private
         */
        _isAutoScrollable: function(overflowX, overflowY) {
            return !(overflowX === 0 && overflowY === 0);
        },
        /**
         * scrollTop 과 scrollLeft 값을 조정한다.
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @private
         */
        _adjustScroll: function(overflowX, overflowY) {
            var renderModel = this.grid.renderModel,
                scrollLeft = renderModel.get('scrollLeft'),
                maxScrollLeft = renderModel.get('maxScrollLeft'),
                scrollTop = renderModel.get('scrollTop');
            if (overflowX < 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - 40), maxScrollLeft));
            } else if (overflowX > 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + 40), maxScrollLeft));
            }

            /* istanbul ignore next: scrollTop 은 보정로직과 얽혀있어 확인이 어렵기 때문에 무시한다. */
            if (overflowY < 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop - 40));
            } else if (overflowY > 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop + 40));
            }
        },
        /**
         * mousedown 이 일어난 지점부터의 거리를 구한다.
         * @param {event} mouseMoveEvent
         * @return {number|*}
         * @private
         */
        _getDistance: function(mouseMoveEvent) {
            var pageX = mouseMoveEvent.pageX,
                pageY = mouseMoveEvent.pageY,
                x = Math.abs(this.pageX - pageX),
                y = Math.abs(this.pageY - pageY);
            return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        },
        /**
         * mouse up event handler
         * @param {event} mouseUpEvent
         * @private
         */
        _onMouseUp: function(mouseUpEvent) {
            this.detachMouseEvent();
        },
        /**
         * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{row: number, column: number, overflowX: number, overflowY: number}}
         */
        getIndexFromMousePosition: function(pageX, pageY) {
            var containerPos = this._getContainerPosition(pageX, pageY),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                columnWidthList = dimensionModel.getColumnWidthList(),
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                totalColumnWidth = dimensionModel.getFrameWidth(),
                dataPosY = containerPos.pageY + scrollTop,
                dataPosX = containerPos.pageX,
                overflowX = 0,
                overflowY = 0,
                isLside = (dimensionModel.get('lsideWidth') > containerPos.pageX),
                len = columnWidthList.length,
                curWidth = 0,
                height = this.grid.option('scrollX') ?
                    dimensionModel.get('bodyHeight') - this.grid.scrollBarSize : dimensionModel.get('bodyHeight'),
                width = this.grid.option('scrollY') ?
                    dimensionModel.get('width') - this.grid.scrollBarSize : dimensionModel.get('width'),
                rowIdx, columnIdx, i;


            if (!isLside) {
                dataPosX = dataPosX + scrollLeft;
            }
            rowIdx = Math.max(0, Math.min(Math.floor(dataPosY / (dimensionModel.get('rowHeight') + 1)), this.grid.dataModel.length - 1));

            if (containerPos.pageY < 0) {
                overflowY = -1;
            } else if (containerPos.pageY > height) {
                overflowY = 1;
            }

            if (containerPos.pageX < 0) {
                overflowX = -1;
            } else if (containerPos.pageX > width) {
                overflowX = 1;
            }

            if (dataPosX < 0) {
                columnIdx = 0;
            } else if (totalColumnWidth < dataPosX) {
                columnIdx = len - 1;
            } else {
                ne.util.forEachArray(columnWidthList, function(columnWidth, i) {
                    curWidth += columnWidth + 1;
                    if (dataPosX <= curWidth) {
                        columnIdx = i;
                        return false;
                    }
                });
            }

            return {
                row: rowIdx,
                column: columnIdx,
                overflowX: overflowX,
                overflowY: overflowY
            };
        },
        /**
         * 범위를 반환한다.
         * @return {*}
         */
        getRange: function() {
            return $.extend(true, {}, this.spannedRange);
        },
        /**
         *  현재 selection 범위에 대한 string 을 반환한다.
         *  @return {String}
         */
        getSelectionToString: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(this.spannedRange.column[0], this.spannedRange.column[1] + 1),
                filteringMap = {
                    '_button': true
                },
                len = columnModelList.length,
                columnNameList = [],
                tmpString = [],
                strings = [],
                startIdx = this.spannedRange.row[0],
                rowList, string;

            _.each(columnModelList, function(columnModel) {
                columnNameList.push(columnModel['columnName']);
            });

            rowList = this.grid.dataModel.slice(this.spannedRange.row[0], this.spannedRange.row[1] + 1);

            _.each(rowList, function(row, i) {
                tmpString = [];
                _.each(columnNameList, function(columnName, j) {
                    if (!filteringMap[columnName]) {
                        //number 형태의 경우 실 데이터는 존재하지 않으므로 가공하여 추가한다.
                        if (columnNameList[j] === '_number') {
                            tmpString.push(startIdx + i + 1);
                        } else {
                            tmpString.push(row.getVisibleText(columnName));
                        }
                    }
                });
                strings.push(tmpString.join('\t'));
            });

            string = strings.join('\n');
            return string;
        },
        /**
         * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
         * @param {String} whichSide
         * @return {*}
         */
        createLayer: function(whichSide) {
            var clazz = whichSide === 'R' ? View.Selection.Layer.Rside : View.Selection.Layer.Lside,
                layer = this._getLayer(whichSide);

            layer && layer.destroy ? layer.destroy() : null;
            layer = this.createView(clazz, {
                grid: this.grid,
                columnWidthList: this.grid.dimensionModel.getColumnWidthList(whichSide)
            });
            whichSide === 'R' ? this.rside = layer : this.lside = layer;
            return layer;
        },
        /**
         * 전체 영역을 선택한다.
         */
        selectAll: function() {
            this.startSelection(0, 0);
            this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        },
        /**
         * selection 영역 선택을 시작한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        startSelection: function(rowIndex, columnIndex) {
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 확장한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        updateSelection: function(rowIndex, columnIndex) {
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
         */
        endSelection: function() {
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
            this.spannedRange.row[0] = this.spannedRange.row[1] = this.spannedRange.column[0] = this.spannedRange.column[1] = -1;
            this.hide();
            this.detachMouseEvent();
        },
        /**
         * dimension model 의 columnWidth 가 변경되었을 경우 크기를 재 계산하여 rendering 한다.
         * @private
         */
        _onColumnWidthChanged: function() {
            this.show();
        },
        /**
         * 현재 selection range 정보를 기반으로 selection Layer 를 노출한다.
         */
        show: function() {
            if (this.hasSelection()) {
                this._isShown = true;
                var tmpRowRange,
                    dataModel = this.grid.dataModel,
                    columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                    rowHeight = this.grid.dimensionModel.get('rowHeight'),
                    startRow = Math.min.apply(Math, this.range.row),
                    endRow = Math.max.apply(Math, this.range.row),
                    startColumn = Math.min.apply(Math, this.range.column),
                    endColumn = Math.max.apply(Math, this.range.column),
                    spannedRange = {
                        row: [startRow, endRow],
                        column: [startColumn, endColumn]
                    };
                if (dataModel.isRowSpanEnable()) {
                    tmpRowRange = $.extend([], spannedRange.row);

                    //rowSpan 처리를 위해 startIndex 와 endIndex 의 모든 데이터 mainRow 일때까지 loop 를 수행한다.
                    do {
                        tmpRowRange = $.extend([], spannedRange.row);
                        spannedRange = this._getRowSpannedIndex(spannedRange);
                    } while (spannedRange.row[0] !== tmpRowRange[0] ||
                        spannedRange.row[1] !== tmpRowRange[1]);

                }
                this.spannedRange = spannedRange;
                this.lside.show(spannedRange);
                this.rside.show({
                    row: spannedRange.row,
                    column: [Math.max(-1, spannedRange.column[0] - columnFixIndex), Math.max(-1, spannedRange.column[1] - columnFixIndex)]
                });
                //selection 이 생성될 때에는 무조건 input 에 focus 가 가지 않도록 clipboard에 focus 를 준다.
                this.grid.focusClipboard();
            }
        },
        /**
         * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
         */
        hide: function() {
            this._isShown = false;
            this.lside.hide();
            this.rside.hide();
        },
        /**
         * 현재 selection 레이어가 노출되어 있는지 확인한다.
         * @return {boolean|*}
         */
        isShown: function() {
            return this._isShown;
        },
        /**
         * Selection Layer View 를 반환한다.
         * @param {String} whichSide
         * @return {*|View.Selection.rside}
         * @private
         */
        _getLayer: function(whichSide) {
            return whichSide === 'R' ? this.rside : this.lside;
        },
        /**
         * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{pageX: number, pageY: number}}
         * @private
         */
        _getContainerPosition: function(pageX, pageY) {
            var dimensionModel = this.grid.dimensionModel,
                containerPosX = pageX - dimensionModel.get('offsetLeft'),
                containerPosY = pageY - (dimensionModel.get('offsetTop') + dimensionModel.get('headerHeight') + 2);

            return {
                pageX: containerPosX,
                pageY: containerPosY
            };
        },
        /**
         * select start event handler
         * @param {event} selectStartEvent
         * @private
         */
        _onSelectStart: function(selectStartEvent) {
            selectStartEvent.preventDefault();
        },

        /**
         * selection 데이터가 존재하는지 확인한다.
         * @return {boolean}
         * @private
         */
        hasSelection: function() {
            return !(this.range.row[0] === -1);
        },

        /**
         * rowSpan 된 Index range 를 반환한다.
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         * @private
         */
        _getRowSpannedIndex: function(spannedRange) {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(spannedRange.column[0], spannedRange.column[1] + 1),
                dataModel = this.grid.dataModel,
                startIndexList = [spannedRange.row[0]],
                endIndexList = [spannedRange.row[1]],
                startRow = dataModel.at(spannedRange.row[0]),
                endRow = dataModel.at(spannedRange.row[1]),
                newSpannedRange = $.extend({}, spannedRange);

            if (startRow && endRow) {
                var startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData(),
                    endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData(),
                    columnName, param;

                /**
                 * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromStart(param) {
                    var startIndex = param.startIndex,
                        endIndex = param.endIndex,
                        rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
                        startIndexList = param.startIndexList,
                        endIndexList = param.endIndexList,
                        spannedIndex;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = startIndex + rowSpanData['count'];
                            startIndexList.push(spannedIndex);
                        } else {
                            spannedIndex = startIndex + rowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        }
                    }
                }

                /**
                 * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromEnd(param) {
                    var endIndex = param.endIndex,
                        columnName = param.columnName,
                        rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
                        endIndexList = param.endIndexList,
                        dataModel = param.dataModel,
                        spannedIndex, tmpRowSpanData;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = endIndex + rowSpanData['count'];
                            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
                            spannedIndex += tmpRowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        } else {
                            spannedIndex = endIndex + rowSpanData['count'] - 1;
                            endIndexList.push(spannedIndex);
                        }
                    }
                }
                _.each(columnModelList, function(columnModel) {
                    columnName = columnModel['columnName'];
                    param = {
                        columnName: columnName,
                        startIndex: spannedRange.row[0],
                        endIndex: spannedRange.row[1],
                        endRowSpanDataMap: endRowSpanDataMap,
                        startRowSpanDataMap: startRowSpanDataMap,
                        startIndexList: startIndexList,
                        endIndexList: endIndexList,
                        dataModel: dataModel
                    };
                    concatRowSpanIndexFromStart(param);
                    concatRowSpanIndexFromEnd(param);
                }, this);

                newSpannedRange.row = [Math.min.apply(Math, startIndexList), Math.max.apply(Math, endIndexList)];
            }
            return newSpannedRange;
        },
        destroy: function() {
            this.detachMouseEvent();
            this.destroyChildren();
            this.remove();
        }
    });

    /**
     * 실제 selection layer view
     * @constructor View.Selection.Layer
     */
    View.Selection.Layer = View.Base.extend(/**@lends View.Selection.Layer.prototype */{
        tagName: 'div',
        className: 'selection_layer',
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
            this.setOwnProperties({
                columnWidthList: attributes.columnWidthList,
                spannedRange: {
                    row: [-1, -1],
                    column: [-1, -1]
                },
                whichSide: 'R'
            });
        },
        _updateColumnWidthList: function() {
            this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
        },
        /**
         * top 값과 height 값을 반환한다.
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         * @return {{display: string, width: string, height: string, top: string, left: string}}
         * @private
         */
        _getGeometryStyles: function(spannedRange) {
            spannedRange = spannedRange || this.indexObj;
            var style, i,
                columnWidthList = this.columnWidthList,
                rowRange = spannedRange.row,
                columnRange = spannedRange.column,
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
//                top = Util.getTBodyHeight(rowRange[0], rowHeight) + this.grid.renderModel.get('top'),
                top = Util.getHeight(rowRange[0], rowHeight) + 1,
                height = Util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 3,
                len = columnWidthList.length,
                display = 'block',
                left = 0,
                width = 0;

            for (i = 0; i < columnRange[1] + 1 && i < len; i++) {
                if (i < columnRange[0]) {
                    left += columnWidthList[i] + 1;
                } else {
                    width += columnWidthList[i] + 1;
                }
            }
            width -= 1;

            if (width <= 0 || height <= 0) {
                display = 'none';
            }

            style = {
                display: display,
                width: width + 'px',
                height: height + 'px',
                top: top + 'px',
                left: left + 'px'
            };
            return style;
        },
        /**
         *
         * @param {{row: range, column: range}} spannedRange 인덱스 정보
         */
        show: function(spannedRange) {
            this.indexObj = spannedRange;
            this.$el.css(this._getGeometryStyles(spannedRange));
        },
        /**
         * selection 을 숨긴다.
         */
        hide: function() {
            this.$el.css({
                display: 'none',
                width: '0px',
                height: '0px',
                top: 0,
                left: 0
            });
        },
        render: function() {
            return this;
        }
    });
    /**
     * 왼쪽 selection layer
     * @constructor View.Selection.Layer.Lside
     */
    View.Selection.Layer.Lside = View.Selection.Layer.extend(/**@lends View.Selection.Layer.Lside.prototype */{
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        }
    });
    /**
     * 오른쪽 selection layer
     * @constructor View.Selection.Layer.Rside
     */
    View.Selection.Layer.Rside = View.Selection.Layer.extend(/**@lends View.Selection.Layer.Rside.prototype */{
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        }
    });
