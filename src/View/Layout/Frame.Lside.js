    /**
     * left side 프레임 클래스
     * @constructor
     */
    View.Layout.Frame.Lside = View.Layout.Frame.extend({
        className: 'lside_area',
        /**
         * 초기화 메서드
         * @param {object} attributes
         */
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        },
        /**
         * columnWidth 변경시 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                width: width + 'px'
            });
        },
        /**
         * beforeRender 콜백
         */
        beforeRender: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                display: 'block',
                width: width + 'px'
            });
        }
    });
