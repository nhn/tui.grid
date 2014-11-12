    'use strict';
    describe('Data.ColumnModel', function() {
        var dummyModelList = {
            notDefined: [
                {
                    title: 'column1',
                    columnName: 'column1'
                },
                {
                    title: 'column2',
                    columnName: 'column2'
                },
                {
                    title: 'column3',
                    columnName: 'column3'
                },
                {
                    title: 'column4',
                    columnName: 'column4'
                },
                {
                    title: 'column5',
                    columnName: 'column5'
                }
            ],
            regularPosition: [
                {
                    title: '_number',
                    columnName: 'column1'
                },
                {
                    title: '_button',
                    columnName: 'column2'
                },
                {
                    title: 'column3',
                    columnName: 'column3'
                },
                {
                    title: 'column4',
                    columnName: 'column4'
                },
                {
                    title: 'column5',
                    columnName: 'column5'
                }
            ],
            chagePosition: [
                {
                    title: 'column1',
                    columnName: 'column1'
                },
                {
                    title: 'column2',
                    columnName: '_button',
                    editOption: {
                        editType: 'text'
                    }
                },
                {
                    title: 'column3',
                    columnName: 'column3'
                },
                {
                    title: 'column4',
                    columnName: '_number'
                },
                {
                    title: 'column5',
                    columnName: 'column5'
                }
            ]
        };
        describe('컬럼 모델이 정상적으로 생성되는지 확인한다.', function() {
            var columnModel = new Data.ColumnModel(dummyModelList.notDefined);
        });
//        describe('Private 메서드 확인', function() {
//            describe('_initializeNumberColumn()', function() {
//               it('hasNumberColumn === false', function() {
//                   var columnModel = new Data.ColumnModel({hasNumberColumn: false});
////                   columnModel._initializeNumberColumn(notDefined)
//               });
//            });
//        });
//        describe('AutoNumbering 옵션 ON', function() {
//            var hasNumberColumn = true;
//            describe('selectType 이 존재함', function() {
//                var selectType = 'checkbox';
//                var columnModel = new Data.ColumnModel({
//                    hasNumberColumn: hasNumberColumn,
//                    selectType: selectType
//                });
//
//            });
//            describe('selectType 이 존재하지 않음.', function() {
//                var selectType = '';
//                var columnModel = new Data.ColumnModel({
//                    hasNumberColumn: hasNumberColumn,
//                    selectType: selectType
//                });
//            });
//        });
//        describe('AutoNumbering 옵션 ON', function() {
//            var hasNumberColumn = false;
//            describe('selectType 이 존재함', function() {
//                var selectType = 'checkbox';
//                var columnModel = new Data.ColumnModel({
//                    hasNumberColumn: hasNumberColumn,
//                    selectType: selectType
//                });
//            });
//            describe('selectType 이 존재하지 않음.', function() {
//                var selectType = '';
//                var columnModel = new Data.ColumnModel({
//                    hasNumberColumn: hasNumberColumn,
//                    selectType: selectType
//                });
//            });
//
//        });
    });

