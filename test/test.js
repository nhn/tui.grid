$result = $('#result1');
var grid1 = new ne.Grid({
    el: $('#wrapper1'),
    columnModelList: dummy_data.columnModel_1,
    selectType: 'checkbox',
    columnFixIndex: 5,
    displayRowCount: 10,
    headerHeight: 50,
    minimumColumnWidth: 20
//		notUseSmartRendering : true
});
getDummyData(dummy_data.columnModel_1, 100, function(data) {
    console.log('done', data);
    grid1.setRowList(data);
});
//	grid1.setRowList(dummy_data.rowList);
insertButton(grid1, $('#buttonList1'), $('#result1'));


var grid2 = new ne.Grid({
    el: $('#wrapper2'),
    columnModelList: dummy_data.columnModel_2,
    selectType: 'radio',
    columnFixIndex: 7,
    headerHeight: 110,
    columnMerge: [
        {
            'columnName' : 'mergeColumn1',
            'title' : '6 + 7',
            'columnNameList' : ['columnName6', 'columnName7']
        },
        {
            'columnName' : 'mergeColumn2',
            'title' : '6 + 7 + 8',
            'columnNameList' : ['mergeColumn1', 'columnName8']
        },
        {
            'columnName' : 'mergeColumn3',
            'title' : '6 + 7 + 8 + 9 + 10',
            'columnNameList' : ['mergeColumn2', 'columnName9', 'columnName10']
        }
    ]
//		keyColumnName : 'columnName6'
});
getDummyData(dummy_data.columnModel_2, 5000, function(data) {
    var start = new Date();
    console.log('setRowListStart');
    grid2.setRowList(data);
    var end = new Date();
    console.log('setRowListEnd', end - start);
});

//	grid2.setRowList(dummy_data.rowListTest);
insertButton(grid2, $('#buttonList2'), $('#result2'));
function getDummyData(columnModel, size, callback) {
    var url;

    if (window.navigator.userAgent.indexOf('MSIE ') !== -1) {
        url = './php/dummy.php';
    }else {
        url = 'http://budapest.kr.pe/sample/php/dummy.php';
    }
    console.log(url);
    $.ajax({
        url: url,
        data: {
            columnModel: JSON.stringify(columnModel),
            size: size
        },
        dataType: 'json'
    }).done(function(data) {
        callback(data);
    });
}

function insertButton(gridInstance, $wrapper, $result) {
    var printr = function(obj) {
        console.log(obj);
        $result.html(JSON.stringify(obj));
    };
    var actions = {
        'getRowList' : function() {
            var result = gridInstance.getRowList();
            printr(result);
        },
        'getModifiedRowList' : function() {
            var result = gridInstance.getModifiedRowList();
            printr(result);
        },
        'prependRow' : function() {
            gridInstance.prependRow();
        },
        'appendRow' : function() {
            gridInstance.appendRow();
        },
        'checkAllRow' : function() {
            gridInstance.checkAllRow();
        },
        'uncheckAllRow' : function() {
            gridInstance.uncheckAllRow();
        },
        'getCheckedRowList' : function() {
            var result = gridInstance.getCheckedRowList();
            printr(result);
        },
        'getCheckedRowKeyList' : function() {
            var result = gridInstance.getCheckedRowKeyList();
            printr(result);
        },
        'destroy' : function() {
            gridInstance.destroy();
            gridInstance = null;
        },
        'set columnFixIndex=2' : function() {
            gridInstance.setColumnIndex(2);
        },
        'sort columnName2' : function() {
            gridInstance.sort('columnName2');
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        },
        'unsort' : function() {
            gridInstance.unSort();
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        },
        'test' : function() {
				gridInstance.setValue(0, 'columnName1', '<script>alert("test");</script>');
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        }
    };

    var $button;
    for (var name in actions) {
        $button = $('<input>');
        $button.attr({
            'type' : 'button',
            'value' : name
        }).on('click', function(action) {
            return function(e) {
                action($button);
            }
        }(actions[name]));
        $wrapper.append($button);
    }
}


//	var grid2 = new Grid({
//		el : $("#wrapper2"),
//		columnModelList : dummy_data.columnModel
//	});
//	grid2.setRowList(dummy_data.rowListTest);
//	setTimeout(function(){
//		grid1.setCell(1, 'columnName1', "A");
//		grid1.setCell(1, 'columnName2', "C");
//		grid1.setCell(1, 'columnName6', "B");
//	},1000);
//
//	setTimeout(function(){
//		grid1.sort('columnName1');
//	},2000);
//	setTimeout(function(){
//		grid1.sort('columnName7');
//	},3000);
//	setTimeout(function(){
//		grid1.sort('columnName1');
//		grid1.setColumnIndex(6);
//	},2000);
//
//	setTimeout(function(){
//		grid1.setColumnIndex(6);
//	},4000);
//	setTimeout(function(){
//		grid1.sort('columnName1');
//		grid1.setColumnIndex(3);
//	},2000);
//	setTimeout(function(){
//		grid1.setRowList([]);
//	},3000);

//
//

//	setTimeout(function(){
//		grid1.setColumnIndex(5);
//		grid2.setColumnIndex(4);
//	}, 1000);
//	setTimeout(function(){
//		grid1.setColumnIndex(6);
////		grid2.setColumnIndex(5);
//	}, 1000);
//
//
//	setTimeout(function(){
//		grid1.setRowList([]);
//
//	}, 3000);
//
//
//	setTimeout(function(){
//		grid1.setRowList(dummy_data.rowListTest);
//
//	}, 4000);
//	setTimeout(function(){
//		console.log("####PREPEND");
//		grid1.prependRow([{
//			"columnName1" : "ASDFGJOAWef11",
//			"columnName2" : "ASDFGJOAWef12",
//			"columnName3" : "ASDFGJOAWef13",
//			"columnName4" : "ASDFGJOAWef14",
//			"columnName5" : "ASDFGJOAWef15",
//			"columnName6" : "ASDFGJOAWef16",
//			"columnName7" : "ASDFGJOAWef17",
//			"columnName8" : "ASDFGJOAWef18"
//		},
//		{
//			"columnName1" : "ASDFGJOAWef11",
//			"columnName2" : "ASDFGJOAWef12",
//			"columnName3" : "ASDFGJOAWef13",
//			"columnName4" : "ASDFGJOAWef14",
//			"columnName5" : "ASDFGJOAWef15",
//			"columnName6" : "ASDFGJOAWef16",
//			"columnName7" : "ASDFGJOAWef17",
//			"columnName8" : "ASDFGJOAWef18"
//		}]);
//	}, 2000);
//	setTimeout(function(){
//		grid1.setRowList(dummy_data.rowListTest);
//	}, 3000);
//	grid.setCell("1", "columnName1",312312);
