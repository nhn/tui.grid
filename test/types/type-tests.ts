import Grid from 'tui-grid';

Grid.getInstanceById(123);
Grid.applyTheme('test');
Grid.setLanguage('ko');

const createEl = document.createElement('div');
const qsEl = document.querySelector('#el');
const byIdEl = document.getElementById('el');

const rowData = [
    {
        name: '+',
        artist: 'Ad Sheeran',
        release: '2014.06.24',
        genre: 'Pop'
    },
    {
        name: 'A Head Full Of Dreams',
        artist: 'Coldplay',
        release: '2015.12.04',
        genre: 'Rock'
    }
];

const grid1 = new Grid({
    el: createEl,
    columns: [],
    data: []
});

grid1.destroy();

const grid2 = new Grid({
    el: qsEl,
    columns: [],
    data: []
});

grid2.disable();

const grid = new Grid({
    el: byIdEl,
    columns: [],
    data: [
        {
            id: 549731,
            name: 'Beautiful Lies',
            artist: 'Birdy',
            release: '2016.03.26',
            type: 'Deluxe',
            typeCode: '1',
            genre: 'Pop',
            genreCode: '1',
            grade: '4',
            price: 10000,
            downloadCount: 1000,
            listenCount: 5000
        }
    ],
    header: {
        height: 50,
        complexColumns: [
            {
                title: 'Basic',
                name: 'mergeColumn1',
                childNames: ['name', 'artist']
            },
            {
                title: 'Extra',
                name: 'mergeColumn2',
                childNames: ['type', 'release', 'genre']
            },
            {
                title: 'Detail',
                name: 'mergeColumn3',
                childNames: ['mergeColumn1', 'mergeColumn2']
            },
            {
                title: 'Count',
                name: 'mergeColumn4',
                childNames: ['downloadCount', 'listenCount']
            },
            {
                title: 'Album Info',
                name: 'mergeColumn5',
                childNames: ['price', 'mergeColumn3', 'mergeColumn4']
            }
        ]
    },
    virtualScrolling: true,
    rowHeight: 'auto',
    minRowHeight: 50,
    bodyHeight: 'auto',
    minBodyHeight: 100,
    columnOptions: {
        minWidth: 100,
        resizable: false,
        frozenCount: 1,
        frozenBorderWidth: 1
    },
    treeColumnOptions: {
        name: 'tree',
        useIcon: false,
        useCascadingCheckbox: true
    },
    copyOptions: {
        useFormattedValue: true
    },
    useClientSort: false,
    editingEvent: 'click',
    scrollX: false,
    scrollY: false,
    showDummyRows: true,
    keyColumnName: null,
    heightResizable: true,
    pagination: null,
    selectionUnit: 'row',
    summary: {
        height: 40,
        position: 'bottom',
        defaultContent: {
            useAutoSummary: false,
            template: 'default summary'
        },
        columnContent: {
            amount: {
                template(valueMap) {
                    return `합계 : ${valueMap.sum}원`;
                }
            }
        }
    }
});

const columnData = [
    {
        title: '날짜',
        name: 'date',
        editOptions: {
            type: 'text'
        },
        component: {
            name: 'datePicker',
            options: {
                format: 'yyyy-MM-dd'
            }
        }
    },
    {
        title: '내역',
        name: 'category1',
        editOptions: {
            type: 'select',
            useViewMode: false,
            listItems: [
                {
                    text: '선택 안함',
                    value: '0'
                },
                {
                    text: '식비',
                    value: '1'
                },
                {
                    text: '문화 생활비',
                    value: '2'
                },
                {
                    text: '교통비',
                    value: '3'
                },
                {
                    text: '관리비',
                    value: '4'
                }
            ]
        }
    },
    {
        title: '비고',
        name: 'category2',
        editOptions: {
            type: 'text'
        }
    },
    {
        title: '결제 방식',
        name: 'payment',
        editOptions: {
            type: 'checkbox',
            listItems: [
                {
                    text: '현금',
                    value: '1'
                },
                {
                    text: '체크카드',
                    value: '2'
                },
                {
                    text: '신용카드',
                    value: '3'
                },
                {
                    text: '페이코',
                    value: '4'
                }
            ],
            useViewMode: false
        },
    },
    {
        title: '금액',
        name: 'amount',
        editOptions: {
            type: 'text'
        },
        formatter(value) {
            console.log(value);
            return `${value}원`;
        }
    }
];

grid.disable();
grid.enable();
grid.disableRow(1);
grid.enableRow('1');
grid.getValue('1', 'date', true);
grid.getColumnValues('category1', false);
grid.getRow(1, true);
grid.getRowAt(0, false);
grid.getRowCount();
grid.getFocusedCell();
grid.getElement(1, 'date');
grid.setValue(1, 'date',  '2018-12-12');
grid.setColumnValues('date', 'columnAnyValue', true);
grid.resetData(rowData);
grid.setData(rowData, () => {
});
grid.setBodyHeight(200);
grid.focus(1, 'date', true);
grid.focusAt(0, 'category2', false);
grid.focusIn('1', 'category1', true);
grid.focusInAt(0, 'date', false);
grid.activateFocus();
grid.blur();
grid.checkAll();
grid.check('1');
grid.uncheckAll();
grid.uncheck('1');
grid.clear();
grid.removeRow('1', false);
grid.removeRow('1', {
    removeOriginalData: true,
    keepRowSpanData: true
});
grid.removeCheckedRows(true);
grid.enableCheck('1');
grid.disableCheck('1');
grid.getCheckedRowKeys();
grid.getCheckedRows();
grid.getColumns();
grid.getModifiedRows();
grid.appendRow(rowData);
grid.prependRow();
grid.isModified();
grid.getAddOn('Net');
grid.restore();
grid.setFrozenColumnCount(10);
grid.setColumns(columnData);
grid.use('Net', {
    el: $('#data_form'),
    initialRequest: true,
    readDataMethod: 'GET',
    perPage: 500,
    enableAjaxHistory: true,
    withCredentials: false,
    api: {
        'readData': './api/read',
        'createData': './api/create',
        'updateData': './api/update',
        'deleteData': './api/delete',
        'modifyData': './api/modify',
        'downloadExcel': './api/download/excel',
        'downloadExcelAll': './api/download/excelAll'
    }
 });
grid.getRows();
grid.sort('date', true);
grid.unSort();
grid.getSortState();
grid.addCellClassName('1', 'date', 'col-date');
grid.addRowClassName('1', 'row-date');
grid.removeCellClassName('1', 'date', 'col-date');
grid.removeRowClassName('1', 'row-date');
grid.getRowSpanData('1', 'date');
grid.getIndexOfRow('1');
grid.getIndexOfColumn('date');
grid.getPagination();
grid.setWidth(1000);
grid.setHeight(200);
grid.refreshLayout();
grid.resetColumnWidths();
grid.showColumn('col1', 'col2', 'col3');
grid.hideColumn('str1', 'str2');
grid.setFooterColumnContent('price', '$ 5000');
grid.validate();
grid.findRows({
    key: 'date',
    value: '2018-12-12'
});
grid.copyToClipboard();
grid.selection(new Range());
grid.expand(1, true);
grid.expandAll();
grid.collapse(1, false);
grid.collapseAll();
grid.getAncestors('1');
grid.getParent('1');
grid.getChildren('1');
grid.getDepth('1');
grid.destroy();
grid.on('response', ev => {
    const {
        result,
        data
    } = ev.responseData;

    console.log('result : ', result);
    console.log('modifyType : ', data);
});

grid.setSummaryColumnContent('date', '2018-12-12');
grid.setSummaryColumnContent('col1', {
    useAutoSummary: false,
    template: 'summary col1'
});
grid.setSummaryColumnContent('col1', {
    template: 'summary col1'
});
grid.setSummaryColumnContent('col1', {
    template: () => 'summary col1'
});

var summaryCol1 = grid.getSummaryValues('col1');
console.log(summaryCol1.max + summaryCol1.min + summaryCol1.avg + summaryCol1.cnt + summaryCol1.sum);

var summaryAll = grid.getSummaryValues();
console.log(summaryAll.col1.sum + summaryAll.col2.sum);

