    /**
     * Cell Factory
     */
    View.CellFactory = View.Base.extend({
        initialize: function(attributes, options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var args = {
                grid: this.grid
            };
            this._initializeInstances();
        },
        _initializeInstances: function() {
            var instances = {},
                args = {
                    grid: this.grid
                },
                instanceList = [
                    new View.Renderer.Cell.MainButton(args),
                    new View.Renderer.Cell.Normal.Number(args),
                    new View.Renderer.Cell.Normal(args),
                    new View.Renderer.Cell.Text(args),
                    new View.Renderer.Cell.List.Button(args),
                    new View.Renderer.Cell.List.Select(args),
                    new View.Renderer.Cell.Text.Convertible(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.getEditType()] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        getInstance: function(editType) {
            var instance = this.instances[editType];
            if (!instance) {
                if (editType === 'radio' || editType === 'checkbox') {
                    instance = this.instances['button'];
                } else {
                    instance = this.instances['normal'];
                }
            }
            return instance;
        },
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                editType = $td.data('edit-type');
                this.instances[editType].attachHandler($td);
            }
        },
        detachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                editType = $td.data('edit-type');
                this.instances[editType].detachHandler($td);
            }
        }
    });
