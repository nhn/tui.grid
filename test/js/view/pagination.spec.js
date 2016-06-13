'use strict';

var PaginationView = require('view/pagination');

describe('LayoutToolbar.Pagination', function() {
    var pagination;

    beforeEach(function() {
        pagination = new PaginationView({});
        pagination.render();
    });

    afterEach(function() {
        pagination.destroy();
    });
});
