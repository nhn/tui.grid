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
                    new View.Renderer.Cell.Normal(args),
                    new View.Renderer.Cell.Text(args),
                    new View.Renderer.Cell.List.Button(args),
                    new View.Renderer.Cell.List.Select(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.cellType] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        getInstance: function(editType) {
            var instance = null;
            switch (editType) {
                case 'main' :
                    instance = this.instances[editType];
                    break;
                case 'text' :
                    instance = this.instances[editType];
                    break;
                case 'select':
                    instance = this.instances[editType];
                    break;
                case 'radio' :
                case 'checkbox' :
                    instance = this.instances['button'];
                    break;
                default :
                    instance = this.instances['normal'];
                    break;
            }

            return instance;
        },
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                cellType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                cellType = $td.attr('cellType');
                this.instances[cellType].attachHandler($td);
            }
        },
        detachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                cellType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                cellType = $td.attr('cellType');
                this.instances[cellType].detachHandler($td);
            }
        }
    });
