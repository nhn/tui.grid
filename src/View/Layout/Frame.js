/**
 * @fileoverview Frame Base
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * frame Base 클래스
     * @constructor View.Layout.Frame
     */
    View.Layout.Frame = View.Base.extend(/**@lends View.Layout.Frame.prototype */{
        tagName: 'div',
        className: 'lside_area',
        /**
         * 초기화 메서드
         * @param {Object} attributes
         */
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
            this.setOwnProperties({
                header: null,
                body: null,
                whichSide: attributes && attributes.whichSide || 'R'
            });
        },
        /**
         * 랜더링
         * @return {View.Layout.Frame}
         */
        render: function() {
            var header,
                body;
            this.destroyChildren();
            this.beforeRender();

            header = this.header = this.createView(View.Layout.Header, {
                grid: this.grid,
                whichSide: this.whichSide
            });
            body = this.body = this.createView(View.Layout.Body, {
                grid: this.grid,
                whichSide: this.whichSide
            });

            this.$el
                .append(header.render().el)
                .append(body.render().el);

            this.afterRender();
            return this;
        },
        /**
         *columnModel change 시 수행되는 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {},
        /**
         * 랜더링 하기전에 수행하는 함수
         */
        beforeRender: function() {},
        /**
         * 랜더링 이후 수행하는 함수
         */
        afterRender: function() {}
    });
















