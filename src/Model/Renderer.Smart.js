/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  View 에서 Rendering 시 사용할 객체
     *  Smart Rendering 을 지원한다.
     *  @constructor Model.Renderer.Smart
     */
    Model.Renderer.Smart = Model.Renderer.extend(/**@lends Model.Renderer.Smart.prototype */{
        initialize: function() {
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onChange, this);
            this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);

            this.setOwnProperties({
                hiddenRowCount: 10,
                criticalPoint: 3
            });
        },
        /**
         * bodyHeight 가 변경 되었을때 이벤트 핸들러
         * @private
         */
        _onChange: function() {
            if (this._isRenderable(this.get('scrollTop')) === true) {
                this.refresh();
            }
        },
        /**
         * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
         * @param {Number} scrollTop
         * @private
         */
        _setRenderingRange: function(scrollTop) {
            var top,
                dimensionModel = this.grid.dimensionModel,
                dataModel = this.grid.dataModel,
                rowHeight = dimensionModel.get('rowHeight'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                displayRowCount = dimensionModel.getDisplayRowCount(),
                startIndex = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                endIndex = Math.min(dataModel.length - 1,
                    Math.floor(startIndex + this.hiddenRowCount + displayRowCount + this.hiddenRowCount)),
                startRow, endRow, minList, maxList;

            if (dataModel.isRowSpanEnable()) {
                minList = [];
                maxList = [];
                startRow = dataModel.at(startIndex);
                endRow = dataModel.at(endIndex);
                if (startRow && endRow) {
                    _.each(startRow.get('_extraData')['rowSpanData'], function(data, columnName)  {
                        if (!data.isMainRow) {
                            minList.push(data.count);
                        }
                    }, this);

                    _.each(endRow.get('_extraData')['rowSpanData'], function(data, columnName) {
                        if (data.count > 0) {
                            maxList.push(data.count);
                        }
                    }, this);

                    if (minList.length > 0) {
                        startIndex += Math.min.apply(Math, minList);
                    }

                    if (maxList.length > 0) {
                        endIndex += Math.max.apply(Math, maxList);
                    }
                }
            }
            top = (startIndex === 0) ? 0 : Util.getHeight(startIndex, rowHeight) - 1;

            this.set({
                top: top,
                startIndex: startIndex,
                endIndex: endIndex
            });
        },
        /**
         * scrollTop 값 에 따라 rendering 해야하는지 판단한다.
         * @param {Number} scrollTop
         * @return {boolean}
         * @private
         */
        _isRenderable: function(scrollTop) {
            var grid = this.grid,
                dimensionModel = grid.dimensionModel,
                dataModel = grid.dataModel,
                rowHeight = dimensionModel.get('rowHeight'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                rowCount = dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIndex = this.get('startIndex'),
                endIndex = this.get('endIndex');

            //시작 지점이 임계점 이하로 올라갈 경우 return true
            if (startIndex !== 0) {
                if (startIndex + this.criticalPoint > displayStartIdx) {
                    return true;
                }
            }
            //마지막 지점이 임계점 이하로 내려갔을 경우 return true
            if (endIndex !== rowCount - 1) {
                if (endIndex - this.criticalPoint < displayEndIdx) {
                    return true;
                }
            }
            return false;
        }
    });
