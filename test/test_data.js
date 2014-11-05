$result = $('#result1');

var grid = new ne.Grid({
    el: $('#wrapper1'),
    columnModelList: dummy_data.columnModel_1,
    selectType: 'checkbox',
    columnFixIndex: 5,
    displayRowCount: 10,
    headerHeight: 50,
    minimumColumnWidth: 20
}).on('onResponse', function(data) {
//        data.stop();

}).on('onSuccessResponse', function(data) {
//        alert('onSuccessResponse')
}).use('Net', {
    el: $('#form'),
    perPage: 52,
    api: {
//        'read': 'http://10.77.34.122/webstorm/Grid-gitlab/test/php/dummy_request.php',
        'read': 'http://budapest.kr.pe/grid/test/php/dummy_request.php',
        'update': 'http://budapest.kr.pe/grid/test/php/backbone_test.php',
        'delete': 'http://budapest.kr.pe/grid/test/php/backbone_test.php',
        'modify': 'http://budapest.kr.pe/grid/test/php/backbone_test.php',
        'download': 'http://budapest.kr.pe/grid/test/php/backbone_test.php',
        'downloadAll': 'http://budapest.kr.pe/grid/test/php/backbone_test.php'
    }
});


var grid2 = new ne.Grid({
    el: $('#wrapper2'),
    columnModelList: dummy_data.columnModel_1,
    selectType: 'checkbox',
    columnFixIndex: 5,
    displayRowCount: 10,
    headerHeight: 50,
    minimumColumnWidth: 20
});
