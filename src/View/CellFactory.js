    View.CellFactory = View.Base.extend({
        initialize: function(attributes, options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var args = {
                grid: this.grid
            };
            var instances = {
                'mainButton' : new View.Cell.MainButton(args),

                'normal' : new View.Cell.Normal(args),
                'text' : new View.Cell.Text(args),
                'button' : new View.Cell.List.Button(args),
                'select' : new View.Cell.List.Select(args)
            };


            this.setOwnProperties({
                instances: instances
            });
        },
        getInstance: function(editType) {
            var instance = null;
            switch (editType) {
                case 'mainButton' :
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
        }
    });
