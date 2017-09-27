'use strict';

var TuiPaginaton = require('tui-pagination');

var PaginationView = require('view/pagination');
var ComponentHolder = require('componentHolder');
var Model = require('base/model');

function create(options) {
    return new PaginationView({
        dimensionModel: new Model(),
        componentHolder: new ComponentHolder({
            pagination: options
        })
    });
}

describe('[view/pagination] ', function() {
    it('set dimensionModel.paginationHeight when \'appended\' event occur', function() {
        var pagination = create();

        pagination.$el.height(100);
        pagination.trigger('appended');

        expect(pagination.dimensionModel.get('paginationHeight')).toBe(100);
    });

    describe('when render(): ', function() {
        it('set new pagination instance to the componentHolder when render()', function() {
            var pagination = create({});
            var compInstance;

            pagination.render();
            compInstance = pagination.componentHolder.getInstance('pagination');

            expect(compInstance).toEqual(jasmine.any(TuiPaginaton));
        });

        it('options in the componentHolder will be used for creating component', function() {
            var pagination = create({
                itemsPerPage: 10,
                centerAlign: false
            });
            var compInstance;

            pagination.render();
            compInstance = pagination.componentHolder.getInstance('pagination');

            expect(compInstance._options.itemsPerPage).toBe(10);
            expect(compInstance._options.centerAlign).toBe(false);
        });
    });
});
