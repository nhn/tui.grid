    Model.Renderer.Smart = Model.Renderer.extend({
        initialize: function() {
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onChange, this);
            this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);
            this.setOwnProperties({
                hiddenRowCount: 10,
                criticalPoint: 3
            });
        },
        _onChange: function() {
            if (this._isRenderable() === true) {
                this.refresh();
            }
        },
        /**
         * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
         * @private
         */
        _setRenderingRange: function() {
            var top,
                scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                endIdx = Math.min(this.grid.dataModel.length - 1,
                    Math.floor(startIdx + this.hiddenRowCount + displayRowCount + this.hiddenRowCount));
            if (!this.grid.isSorted()) {
                var minList = [];
                var maxList = [];
                _.each(this.grid.dataModel.at(startIdx).get('_extraData')['rowSpanData'], function(data, columnName) {
                    if (!data.isMainRow) {
                        minList.push(data.count);
                    }
                }, this);

                _.each(this.grid.dataModel.at(endIdx).get('_extraData')['rowSpanData'], function(data, columnName) {
                    if (data.count > 0) {
                        maxList.push(data.count);
                    }
                }, this);

                if (minList.length > 0) {
                    startIdx += Math.min.apply(Math, minList);
                }
                if (maxList.length > 0) {
                    endIdx += Math.max.apply(Math, maxList);
                }
            }

            top = (startIdx === 0) ? 0 : Util.getTBodyHeight(startIdx, rowHeight) - 1;

            this.set({
                top: top,
                startIdx: startIdx,
                endIdx: endIdx
            });

        },

        _isRenderable: function() {
            var scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                rowCount = this.grid.dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(this.grid.dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');
            console.log('#########GAP', endIdx - startIdx, displayRowCount);
            if ((startIdx !== 0 && startIdx + this.criticalPoint > displayStartIdx) ||
                endIdx !== rowCount - 1 && (endIdx < rowCount && (endIdx - this.criticalPoint < displayEndIdx))) {
                console.log(startIdx + this.criticalPoint, displayStartIdx);
                console.log(endIdx - this.criticalPoint, displayEndIdx);
                return true;
            }else {
                return false;
            }

        }
    });
