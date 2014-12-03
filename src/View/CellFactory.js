/**
 * @fileoverview Cell Painter Factory
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Cell Factory
     * @constructor View.CellFactory
     */
    View.CellFactory = View.Base.extend(/**@lends View.CellFactory.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeInstances();
        },
        /**
         * 종류별 Cell Painter Instance 를 를 생성한다.
         * @private
         */
        _initializeInstances: function() {
            var instances = {},
                args = {
                    grid: this.grid
                },
                instanceList = [
                    new View.Painter.Cell.MainButton(args),
                    new View.Painter.Cell.Normal.Number(args),
                    new View.Painter.Cell.Normal(args),
                    new View.Painter.Cell.List.Button(args),
                    new View.Painter.Cell.List.Select(args),
                    new View.Painter.Cell.Text(args),
                    new View.Painter.Cell.Text.Password(args),
                    new View.Painter.Cell.Text.Convertible(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.getEditType()] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        /**
         * 인자로 받은 editType 에 해당하는 Cell Painter Instance 를 반환한다.
         * @param {String} editType editType 정보
         * @return {Object} editType 에 해당하는 페인터 인스턴스
         */
        getInstance: function(editType) {
            var instance = this.instances[editType];

            if (!instance) {
                //checkbox, radio 의 경우, instance 의 이름이 전달받는 editType 과 다르기 때문에 예외처리 한다.
                if (editType === 'radio' || editType === 'checkbox') {
                    instance = this.instances['button'];
                } else {
                    //그 외의 경우 모두 normal 로 처리한다.
                    instance = this.instances['normal'];
                }
            }
            return instance;
        },
        /**
         * Frame(Left Side 혹은 Right Side)엘리먼트 tbody 하위에 모든 td 에 이벤트 핸들러를 bind 한다.
         * @param {jQuery} $parent 자신이 속한 tbody jquery 엘리먼트
         */
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;

            _.each($tdList, function(item, index) {
                $td = $tdList.eq(index);
                editType = $td.data('edit-type');
                this.instances[editType] && this.instances[editType].attachHandler($td);
            }, this);
        },
        /**
         * Frame(Left Side 혹은 Right Side)엘리먼트 tbody 하위에 모든 td 에 이벤트 핸들러를 unbind 한다.
         * @param {jQuery} $parent 자신이 속한 tbody jquery 엘리먼트
         */
        detachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;

            _.each($tdList, function(item, index) {
                $td = $tdList.eq(index);
                editType = $td.data('edit-type');
                this.instances[editType] && this.instances[editType].detachHandler($td);
            }, this);
        }
    });
