describe('grid.normal.test', function() {
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        },{
            title: 'columnName2',
            columnName: 'columnName2',
            width: 200,
            editOption: {
                type: 'text'
            }
        },
        {
            title: 'columnName3',
            columnName: 'columnName3',
            width: 300,
            editOption: {
                type: 'text-convertible'
            }
        },
        {
            title: 'columnName4',
            columnName: 'columnName4',
            width: 400,
            editOption: {
                type: 'select',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName5',
            columnName: 'columnName5',
            width: 500,
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName6',
            columnName: 'columnName6',
            width: 600,
            editOption: {
                type: 'radio',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            width: 700,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isDisabled: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        },
        {
            title: 'columnName8',
            columnName: 'columnName8',
            width: 800,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isEditable: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        }
    ];
    //두번째 행은 disabled 처리한다.
    var rowList = [{"columnName1":"1_0","columnName2":"1_1","columnName3":"1_2","columnName4":1,"columnName5":4,"columnName6":1,"columnName7":"1_6","columnName8":"1_7"},{"columnName1":"2_0","columnName2":"2_1","columnName3":"2_2","columnName4":4,"columnName5":2,"columnName6":2,"columnName7":"2_6","columnName8":"2_7","_extraData":{"rowState":"DISABLED"}},{"columnName1":"3_0","columnName2":"3_1","columnName3":"3_2","columnName4":2,"columnName5":1,"columnName6":2,"columnName7":"3_6","columnName8":"3_7","_extraData":{"rowSpan":{"columnName1":4,"columnName2":1}}},{"columnName1":"4_0","columnName2":"4_1","columnName3":"4_2","columnName4":1,"columnName5":4,"columnName6":1,"columnName7":"4_6","columnName8":"4_7"},{"columnName1":"5_0","columnName2":"5_1","columnName3":"5_2","columnName4":4,"columnName5":4,"columnName6":2,"columnName7":"5_6","columnName8":"5_7"},{"columnName1":"6_0","columnName2":"6_1","columnName3":"6_2","columnName4":1,"columnName5":1,"columnName6":2,"columnName7":"6_6","columnName8":"6_7"},{"columnName1":"7_0","columnName2":"7_1","columnName3":"7_2","columnName4":3,"columnName5":3,"columnName6":2,"columnName7":"7_6","columnName8":"7_7"},{"columnName1":"8_0","columnName2":"8_1","columnName3":"8_2","columnName4":1,"columnName5":4,"columnName6":4,"columnName7":"8_6","columnName8":"8_7"},{"columnName1":"9_0","columnName2":"9_1","columnName3":"9_2","columnName4":2,"columnName5":3,"columnName6":1,"columnName7":"9_6","columnName8":"9_7","_extraData":{"rowSpan":{"columnName1":4}}},{"columnName1":"10_0","columnName2":"10_1","columnName3":"10_2","columnName4":4,"columnName5":4,"columnName6":1,"columnName7":"10_6","columnName8":"10_7"},{"columnName1":"11_0","columnName2":"11_1","columnName3":"11_2","columnName4":4,"columnName5":1,"columnName6":2,"columnName7":"11_6","columnName8":"11_7"},{"columnName1":"12_0","columnName2":"12_1","columnName3":"12_2","columnName4":2,"columnName5":3,"columnName6":4,"columnName7":"12_6","columnName8":"12_7"},{"columnName1":"13_0","columnName2":"13_1","columnName3":"13_2","columnName4":2,"columnName5":4,"columnName6":1,"columnName7":"13_6","columnName8":"13_7"},{"columnName1":"14_0","columnName2":"14_1","columnName3":"14_2","columnName4":2,"columnName5":3,"columnName6":2,"columnName7":"14_6","columnName8":"14_7"},{"columnName1":"15_0","columnName2":"15_1","columnName3":"15_2","columnName4":1,"columnName5":1,"columnName6":3,"columnName7":"15_6","columnName8":"15_7"},{"columnName1":"16_0","columnName2":"16_1","columnName3":"16_2","columnName4":1,"columnName5":4,"columnName6":1,"columnName7":"16_6","columnName8":"16_7"},{"columnName1":"17_0","columnName2":"17_1","columnName3":"17_2","columnName4":4,"columnName5":4,"columnName6":4,"columnName7":"17_6","columnName8":"17_7"},{"columnName1":"18_0","columnName2":"18_1","columnName3":"18_2","columnName4":4,"columnName5":2,"columnName6":3,"columnName7":"18_6","columnName8":"18_7"},{"columnName1":"19_0","columnName2":"19_1","columnName3":"19_2","columnName4":2,"columnName5":1,"columnName6":2,"columnName7":"19_6","columnName8":"19_7"},{"columnName1":"20_0","columnName2":"20_1","columnName3":"20_2","columnName4":4,"columnName5":3,"columnName6":2,"columnName7":"20_6","columnName8":"20_7"},{"columnName1":"21_0","columnName2":"21_1","columnName3":"21_2","columnName4":1,"columnName5":1,"columnName6":4,"columnName7":"21_6","columnName8":"21_7"},{"columnName1":"22_0","columnName2":"22_1","columnName3":"22_2","columnName4":3,"columnName5":3,"columnName6":4,"columnName7":"22_6","columnName8":"22_7"},{"columnName1":"23_0","columnName2":"23_1","columnName3":"23_2","columnName4":3,"columnName5":1,"columnName6":2,"columnName7":"23_6","columnName8":"23_7"},{"columnName1":"24_0","columnName2":"24_1","columnName3":"24_2","columnName4":2,"columnName5":3,"columnName6":2,"columnName7":"24_6","columnName8":"24_7"},{"columnName1":"25_0","columnName2":"25_1","columnName3":"25_2","columnName4":4,"columnName5":4,"columnName6":1,"columnName7":"25_6","columnName8":"25_7"},{"columnName1":"26_0","columnName2":"26_1","columnName3":"26_2","columnName4":1,"columnName5":1,"columnName6":1,"columnName7":"26_6","columnName8":"26_7"},{"columnName1":"27_0","columnName2":"27_1","columnName3":"27_2","columnName4":1,"columnName5":3,"columnName6":1,"columnName7":"27_6","columnName8":"27_7"},{"columnName1":"28_0","columnName2":"28_1","columnName3":"28_2","columnName4":3,"columnName5":1,"columnName6":3,"columnName7":"28_6","columnName8":"28_7"},{"columnName1":"29_0","columnName2":"29_1","columnName3":"29_2","columnName4":3,"columnName5":1,"columnName6":3,"columnName7":"29_6","columnName8":"29_7"},{"columnName1":"30_0","columnName2":"30_1","columnName3":"30_2","columnName4":1,"columnName5":1,"columnName6":4,"columnName7":"30_6","columnName8":"30_7"}];
    var grid,
        $empty,
        timeoutDelay = 0;
    beforeEach(function() {
        //jasmine.clock().install();
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty').hide();
        grid = new Core({
            el: $empty,
            columnModelList: columnModelList,
            selectType: 'checkbox'
        });
        grid.setRowList(rowList);
        //setTimeout(function() {
        //    done();
        //}, timeoutDelay);
    });
    afterEach(function() {
        grid && grid.destroy();
        //jasmine.clock().uninstall();
    });

    describe('public 메서드를 테스트한다.', function() {

        it('setRowList 가 잘 되었는지 확인한다.', function() {
            expect(grid.dataModel.length).toBe(30);
        });
        describe('option()', function() {
            it('option의 동작을 확인한다.', function() {
                grid.option('temp', 'test_value');
                expect(grid.option('temp')).toEqual('test_value');
                grid.option('temp', 'test_value_changed');
                expect(grid.option('temp')).toEqual('test_value_changed');
            });
        });
        describe('getValue(), setValue()', function() {
            it('getValue 는 값을 잘 가져온다.', function() {
                expect(grid.getValue(10, 'columnName1')).toBe('9_0');
            });
            it('setValue 이후 getValue 의 isOriginal 을 true 로 설정시 original 데이터를 반환한다.', function() {
                grid.setValue(10, 'columnName1', '9_0_changed');
                expect(grid.getValue(10, 'columnName1')).toBe('9_0_changed');
                expect(grid.getValue(10, 'columnName1', true)).toBe('9_0');
            });
        });

        describe('getColumnValues()', function() {
            it('인자로 들어온 열에 대한 데이터를 배열로 반환한다.', function() {
                var columnValueList = grid.getColumnValues('columnName1');
                expect(columnValueList.length).toBe(30);
                expect(columnValueList[0]).toBe('1_0');
                expect(columnValueList[1]).toBe('2_0');
                expect(columnValueList[2]).toBe('3_0');
                expect(columnValueList[3]).toBe('3_0');
                expect(columnValueList[4]).toBe('3_0');
                expect(columnValueList[5]).toBe('3_0');
                expect(columnValueList[6]).toBe('7_0');
            });
            it('인자로 들어온 열에 대한 데이터를 json 스트링으로 반환한다.', function() {
                var columnValueList = grid.getColumnValues('columnName1', true);
                expect(typeof columnValueList).toBe('string');
            });
        });
        describe('setColumnValues()', function() {
            it('인자로 들어온 열에 대한 데이터를 전부 변경한다.', function() {
                grid.setColumnValues('columnName2', 'changed');
                expect(grid.getValue(0, 'columnName2')).toBe('changed');

                //2번째 row 는 disabled 이므로 변경하지 않는다.
                expect(grid.getValue(1, 'columnName2')).toBe('2_1');
                expect(grid.getValue(2, 'columnName2')).toBe('changed');
                expect(grid.getValue(3, 'columnName2')).toBe('changed');
                expect(grid.getValue(4, 'columnName2')).toBe('changed');
                expect(grid.getValue(5, 'columnName2')).toBe('changed');
                expect(grid.getValue(6, 'columnName2')).toBe('changed');

            });
            it('isCheckCellState 를 false 로 넘겼을 경우 열에 대한 데이터 모두를 상태에 관계없이 변경한다.', function() {
                grid.setColumnValues('columnName2', 'changed', false);
                grid.dataModel.forEach(function(row, key) {
                    expect(grid.getValue(key, 'columnName2')).toBe('changed');
                });
            });
        });
        describe('getRow()', function() {
            it('인자로 들어온 행에 대한 데이터를 데이터 object 로 반환한다.', function() {
                var row = grid.getRow(0);
                expect(row['_extraData']).toBeDefined();
                expect(row['rowKey']).toBe(0);
                expect(row['_number']).not.toBeDefined();
                expect(row['_button']).toBe(false);
                expect(row['columnName1']).toBe('1_0');
                expect(row['columnName2']).toBe('1_1');
                expect(row['columnName3']).toBe('1_2');
                expect(row['columnName4']).toBe(1);
                expect(row['columnName5']).toBe(4);
                expect(row['columnName6']).toBe(1);
                expect(row['columnName7']).toBe('1_6');
                expect(row['columnName8']).toBe('1_7');
            });
            it('인자로 들어온 열에 대한 데이터를 json 스트링으로 반환한다.', function() {
                var row = grid.getRow(0, true);
                expect(typeof row).toBe('string');
            });
        });
        describe('getRowAt()', function() {
            it('인자로 들어온 행에 대한 데이터를 데이터 object 로 반환한다.', function() {
                var row = grid.getRowAt(0);
                expect(row['_extraData']).toBeDefined();
                expect(row['rowKey']).toBe(0);
                expect(row['_number']).not.toBeDefined();
                expect(row['_button']).toBe(false);
                expect(row['columnName1']).toBe('1_0');
                expect(row['columnName2']).toBe('1_1');
                expect(row['columnName3']).toBe('1_2');
                expect(row['columnName4']).toBe(1);
                expect(row['columnName5']).toBe(4);
                expect(row['columnName6']).toBe(1);
                expect(row['columnName7']).toBe('1_6');
                expect(row['columnName8']).toBe('1_7');
            });
            it('인자로 들어온 열에 대한 데이터를 json 스트링으로 반환한다.', function() {
                var row = grid.getRowAt(0, true);
                expect(typeof row).toBe('string');
            });
        });
        describe('getRowCount()', function() {
            it('row 개수를 반환한다.', function(done) {
                expect(grid.getRowCount()).toEqual(30);
                grid.setRowList([]);
                //jasmine.clock().tick(1);
                setTimeout(function() {
                    expect(grid.getRowCount()).toEqual(0);
                    done();
                }, timeoutDelay);

            });
        });
        describe('getElement()', function() {
            beforeEach(function(done) {
                setTimeout(function() {
                    done();
                }, timeoutDelay);
            });
            it('rowKey 와 columnName 에 해당하는 element 를 반환한다.', function() {
                var $el;

                $el = grid.getElement(0, 'columnName3');
                expect($el.closest('td').attr('columnname')).toBe('columnName3');
                expect($el.closest('tr').attr('key')).toBe('0');

                $el = grid.getElement(7, 'columnName1');
                expect($el.closest('td').attr('columnname')).toBe('columnName1');
                expect($el.closest('tr').attr('key')).toBe('7');

                $el = grid.getElement(20, 'columnName8');
                expect($el.closest('td').attr('columnname')).toBe('columnName8');
                expect($el.closest('tr').attr('key')).toBe('20');
            });
        });
        describe('select()', function() {
            beforeEach(function(done) {
                setTimeout(function() {
                    done();
                }, timeoutDelay);
            });
            it('rowKey 에 해당하는 td 들에 select css 디자인 클래스를 적용한다.', function() {
                var $el;
                grid.select(5);
                expect(grid.getElement(5, 'columnName1').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName2').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName3').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName4').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName5').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName6').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName7').hasClass('selected')).toBe(true);
                expect(grid.getElement(5, 'columnName8').hasClass('selected')).toBe(true);
            });
        });
        describe('unselect()', function() {
            it('select css 디자인 클래스를 제거한다.', function() {
                grid.select(5);
                grid.unselect();
                expect(grid.getElement(5, 'columnName1').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName2').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName3').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName4').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName5').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName6').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName7').hasClass('selected')).toBe(false);
                expect(grid.getElement(5, 'columnName8').hasClass('selected')).toBe(false);
            });
        });
        describe('getSelectedRowKey()', function() {
            it('select 된 rowKey 를 반환한다..', function() {
                grid.select(5);
                expect(grid.getSelectedRowKey()).toBe(5);
                grid.unselect();
                expect(grid.getSelectedRowKey()).toBeNull();
            });
        });
        describe('focus(), blur()', function() {
            it('focus 를 호출하면 rowKey, columnName 에 해당하는 td 에 포커스 클래스를 적용한다.', function(done) {
                grid.focus(5, 'columnName3');
                setTimeout(function() {
                    expect(grid.getElement(5, 'columnName1').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName2').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName3').hasClass('focused')).toBe(true);
                    expect(grid.getElement(5, 'columnName4').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName5').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName6').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName7').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName8').hasClass('focused')).toBe(false);
                    done();
                }, timeoutDelay);
                //jasmine.clock().tick(1);

            });
            it('blur 를 호출하면 focused 디자인 클래스를 제거한다..', function(done) {
                grid.focus(5, 'columnName3');
                grid.blur();
                //jasmine.clock().tick(1);
                setTimeout(function() {
                    expect(grid.getElement(5, 'columnName1').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName2').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName3').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName4').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName5').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName6').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName7').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName8').hasClass('focused')).toBe(false);
                    done();
                }, timeoutDelay);

            });
        });
        describe('focusAt()', function() {
            it('rowIndex, columnIndex 에 해당하는 td 에 포커스 클래스를 적용한다.', function(done) {
                grid.focusAt(5, 4);
                //jasmine.clock().tick(1);
                setTimeout(function() {
                    expect(grid.getElement(5, 'columnName1').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName2').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName3').hasClass('focused')).toBe(true);
                    expect(grid.getElement(5, 'columnName4').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName5').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName6').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName7').hasClass('focused')).toBe(false);
                    expect(grid.getElement(5, 'columnName8').hasClass('focused')).toBe(false);
                    done();
                }, timeoutDelay);

            });
        });
        describe('focusIn()', function() {
            it('editable 한 column 일 경우 cellInstance 의 focusIn 을 호출한다.', function() {
                var instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('columnName2'));
                instance.focusIn = jasmine.createSpy('focusIn');
                grid.focusIn(0, 'columnName2');
                expect(instance.focusIn).toHaveBeenCalled();
            });
            it('editable 하지 않을경우 focusClipboard 를 호출한다.', function() {
                grid.focusClipboard = jasmine.createSpy('focusClipboard');
                var instance = grid.cellFactory.getInstance(grid.columnModel.getEditType('columnName2'));
                instance.focusIn = jasmine.createSpy('focusIn');
                grid.focusIn(0, 'columnName1');
                expect(instance.focusIn).not.toHaveBeenCalled();
                expect(grid.focusClipboard).toHaveBeenCalled();
            });
        });
        describe('focusInAt()', function() {
            it('row index columnindex 에 해당하는 cell 의 focus in 을 호출한다.', function() {
                grid.focus = jasmine.createSpy('focus');
                grid.focusInAt(0, 0, true);
                expect(grid.focus).toHaveBeenCalledWith(0, '_number', true);
            });
        });
        describe('check()', function() {
            beforeEach(function(done) {
                setTimeout(function() {
                    done();
                }, timeoutDelay);
            });
            it('check 되는지 확인한다.', function() {
                grid.check(1);
                expect(grid.getElement(1, '_button').find('input').prop('checked')).toBe(true);
            });
        });
        describe('uncheck()', function() {
            beforeEach(function(done) {
                setTimeout(function() {
                    done();
                }, timeoutDelay);
            });
            it('check 되는지 확인한다.', function() {
                grid.check(0);
                grid.uncheck(0);
                expect(grid.getElement(0, '_button').find('input').prop('checked')).toBe(false);
            });
        });
        describe('checkAll()', function() {
            it('disabled 를 제외한 모든 행이 check 되는지 확인한다.', function() {
                grid.checkAll();
                var $buttonTdList = $empty.find('td[columnname="_button"]');
                for (var i = 0; i < $buttonTdList.length; i++) {
                    if ($buttonTdList.eq(i).length === 0) {
                        break;
                    } else {
                        //2번째 행은 disabled 이므로
                        if (i === 1) {
                            expect($buttonTdList.eq(i).find('input').prop('checked')).toBe(false);
                        } else {
                            expect($buttonTdList.eq(i).find('input').prop('checked')).toBe(true);
                        }
                    }
                }
                grid.dataModel.forEach(function(row, key) {
                    if (key === 1) {
                        expect(row.get('_button')).toBe(false);
                    } else {
                        expect(row.get('_button')).toBe(true);
                    }
                }, this);
            });
            describe('uncheckAll()', function() {
                it('unckeck 확인한다.', function() {
                    grid.checkAll();
                    grid.uncheckAll();
                    var $buttonTdList = $empty.find('td[columnname="_button"]');
                    for (var i = 0; i < $buttonTdList.length; i++) {
                        if ($buttonTdList.eq(i).length === 0) break;
                        expect($buttonTdList.eq(i).find('input').prop('checked')).toBe(false);
                    }
                    grid.dataModel.forEach(function(row, key) {
                        expect(row.get('_button')).toBe(false);
                    }, this);
                });
            });
            describe('clear()', function() {
                it('data length 를 확인한다.', function(done) {
                    grid.clear();
                    //jasmine.clock().tick(1);
                    setTimeout(function() {
                        expect(grid.getRowCount()).toBe(0);
                        done();
                    }, timeoutDelay);
                });
            });
            describe('removeRow()', function() {
                it('실제 remove 되는지 확인한다.', function(done) {
                    expect(grid.getRowCount()).toBe(30);
                    grid.removeRow(29);
                    //jasmine.clock().tick(1);
                    setTimeout(function() {
                        expect(grid.getRow(29)).not.toBeDefined();
                        expect(grid.getRowCount()).toBe(29);
                        done();
                    }, timeoutDelay);
                });
            });
            describe('disableRow()', function() {
                beforeEach(function(done) {
                    setTimeout(function() {
                        done();
                    }, timeoutDelay);
                });
                it('disableRow 되는지 확인한다.', function() {
                    grid.disableRow(0);
                    expect(grid.getElement(0, 'columnName1').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName2').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName3').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName4').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName5').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName6').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName7').hasClass('disabled')).toBe(true);
                    expect(grid.getElement(0, 'columnName8').hasClass('disabled')).toBe(true);
                });
            });
            describe('enableRow()', function() {
                beforeEach(function(done) {
                    setTimeout(function() {
                        done();
                    }, timeoutDelay);
                });
                it('enableRow 되는지 확인한다.', function() {
                    grid.disableRow(0);
                    grid.enableRow(0);
                    expect(grid.getElement(0, 'columnName1').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName2').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName3').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName4').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName5').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName6').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName7').hasClass('disabled')).toBe(false);
                    expect(grid.getElement(0, 'columnName8').hasClass('disabled')).toBe(false);
                });
            });
            describe('disableCheck()', function() {
                beforeEach(function(done) {
                    setTimeout(function() {
                        done();
                    }, timeoutDelay);
                });
                it('disableCheck 되는지 확인한다.', function() {
                    grid.disableCheck(0);
                    expect(grid.getElement(0, '_button').find('input').prop('disabled')).toBe(true);
                });
            });
            describe('enableCheck()', function() {
                beforeEach(function(done) {
                    setTimeout(function() {
                        done();
                    }, timeoutDelay);
                });
                it('enableCheck 되는지 확인한다.', function() {
                    grid.disableCheck(0);
                    grid.enableCheck(0);
                    expect(grid.getElement(0, '_button').find('input').prop('disabled')).toBe(false);
                });
            });
            describe('getCheckedRowKeyList()', function() {
                it('check 된 rowKey List 를 반환하는지 확인한다.', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(grid.getCheckedRowKeyList()).toContain(0);
                    expect(grid.getCheckedRowKeyList()).toContain(8);
                    expect(grid.getCheckedRowKeyList()).toContain(9);
                });
                it('check 된 rowKey List json string 으로 반환한다..', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(typeof grid.getCheckedRowKeyList(true)).toBe('string');
                });
            });
            describe('getCheckedRowList()', function() {
                it('check 된 rowKey List 를 반환하는지 확인한다.', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(grid.getCheckedRowList().length).toBe(3);
                });
                it('json 스트링으로 반환하는지도 확인한다.', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(typeof grid.getCheckedRowList(true)).toBe('string');
                });
            });
            describe('getCheckedRowList()', function() {
                it('check 된 rowKey List 를 반환하는지 확인한다.', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(grid.getCheckedRowList().length).toBe(3);
                });
                it('json 스트링으로 반환하는지도 확인한다.', function() {
                    grid.check(0);
                    grid.check(8);
                    grid.check(9);
                    expect(typeof grid.getCheckedRowList(true)).toBe('string');
                });
            });
            describe('getColumnModelList()', function() {
                it('columnModelList 를 반환하는지 확인한다.', function() {
                    expect(grid.getColumnModelList().length).toBe(10);
                });
            });
            describe('getModifiedRowList()', function() {
                it('dataModel.getModifiedRowList 를 호출하는지 확인한다.', function() {
                    var options = {
                        isOnlyChecked: false,
                        isOnlyRowKeyList: true
                    };
                    grid.dataModel.getModifiedRowList = jasmine.createSpy('getModifiedRowList');
                    grid.getModifiedRowList(options);
                    expect(grid.dataModel.getModifiedRowList).toHaveBeenCalledWith(options);
                });
            });

            describe('appendRow()', function() {
                it('실제 데이터가 뒤에 추가되는지 확인한다.', function() {
                    expect(grid.dataModel.length).toBe(30);
                    grid.appendRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    expect(grid.dataModel.length).toBe(31);
                    expect(grid.dataModel.at(30).get('rowKey')).toBe(30);
                });
            });

            describe('prependRow()', function() {
                it('실제 데이터가 앞에 추가되는지 확인한다.', function() {
                    expect(grid.dataModel.length).toBe(30);
                    grid.prependRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    expect(grid.dataModel.length).toBe(31);
                    expect(grid.dataModel.at(0).get('rowKey')).toBe(30);
                });
            });

            describe('isChanged()', function() {
                it('변경사항이 없을때 false 를 반환한다.', function() {
                    expect(grid.isChanged()).toBe(false);
                });
                it('데이터가 append 추가되었을때 변경사항을 감지한다.', function() {
                    grid.appendRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    expect(grid.isChanged()).toBe(true);
                });
                it('데이터가 prepend 추가되었을때 변경사항을 감지한다.', function() {
                    grid.prependRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    expect(grid.isChanged()).toBe(true);
                });
                it('데이터가 remove 되었을때 변경사항을 감지한다.', function() {
                    grid.removeRow(10);
                    expect(grid.isChanged()).toBe(true);
                });
                it('데이터가 변경 되었을때 변경사항을 감지한다.', function() {
                    grid.setValue(0, 'columnName1', 'changed');
                    expect(grid.isChanged()).toBe(true);
                });
            });
            describe('restore()', function() {
                beforeEach(function() {
                    grid.appendRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    grid.prependRow({
                        'columnName1': 31,
                        'columnName2': 31,
                        'columnName3': 31,
                        'columnName4': 31,
                        'columnName5': 31,
                        'columnName6': 31,
                        'columnName7': 31,
                        'columnName8': 31
                    });
                    grid.removeRow(10);
                    grid.setValue(0, 'columnName1', 'changed');
                });
                it('변경후 restore 하면 원상태로 돌아오는지 확인한다.', function() {
                    expect(grid.isChanged()).toBe(true);
                    grid.restore();
                    expect(grid.isChanged()).toBe(false);
                    //jasmine.clock().tick(1);
                    //setTimeout(function() {
                    //    expect(grid.isChanged()).toBe(false);
                    //    done();
                    //}, timeoutDelay);

                });
            });
            describe('isEditable()', function() {
                it('isEditable을 전달된 파라미터로 잘 호출하는지 확인한다.', function() {
                    grid.focus(0, 'columnName1');
                    grid.dataModel.get(0).isEditable = jasmine.createSpy('isEditable');
                    grid.isEditable();
                    expect(grid.dataModel.get(0).isEditable).toHaveBeenCalledWith('columnName1');
                });
            });
            describe('isDisabled()', function() {
                it('isDisabled을 전달된 파라미터로 잘 호출하는지 확인한다.', function() {
                    grid.focus(0, 'columnName1');
                    grid.dataModel.get(0).isDisabled = jasmine.createSpy('isDisabled');
                    grid.isDisabled();
                    expect(grid.dataModel.get(0).isDisabled).toHaveBeenCalledWith('columnName1');
                });
            });
            describe('getCellState()', function() {
                it('getCellState 전달된 파라미터로 잘 호출하는지 확인한다.', function() {
                    grid.focus(0, 'columnName1');
                    grid.dataModel.get(0).getCellState = jasmine.createSpy('getCellState');
                    grid.getCellState();
                    expect(grid.dataModel.get(0).getCellState).toHaveBeenCalledWith('columnName1');
                });
            });
            describe('setColumnModelList()', function() {
                it('columnModelList 를 변경하는지 확인한다.', function(done) {
                    var newColumnModelList = [
                        {
                            title: 'title1',
                            columnName: 'test1'
                        },
                        {
                            title: 'title1',
                            columnName: 'test2'
                        }
                    ];
                    grid.setColumnModelList(newColumnModelList);
                    //jasmine.clock().tick(1);
                    setTimeout(function() {
                        expect(grid.getColumnModelList().length).toBe(4);
                        done();
                    }, timeoutDelay);
                });
            });
            describe('getRowList()', function() {
                it('rowList 를 잘 받아오는지 확인한다.', function() {
                    var newRowList = grid.getRowList();
                    expect(newRowList.length).toBe(30);
                });
            });
            describe('del()', function() {
                it('editable 하고, disabled 하지 않은 cell 만 삭제하는지 확인한다.', function() {
                    grid.del(0, 'columnName1');
                    grid.del(0, 'columnName2');
                    expect(grid.getValue(0, 'columnName1')).toBe('1_0');
                    expect(grid.getValue(0, 'columnName2')).toBe('');

                    grid.del(1, 'columnName1');
                    grid.del(1, 'columnName2');
                    expect(grid.getValue(1, 'columnName1')).toBe('2_0');
                    expect(grid.getValue(1, 'columnName2')).toBe('2_1');
                });
            });
        });
    });
});