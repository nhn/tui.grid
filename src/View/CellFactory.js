/**
 * @fileoverview Cell Painter Factory
 * @author NHN Ent. FE Development Team
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
    }
});
