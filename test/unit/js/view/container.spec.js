'use strict';

// var Core = require('core');

describe('view.container', function() {
    // describe('click handler', function() {
    //     it('cell에서 click이벤트가 발생하면 clickCell 이벤트를 발생시킨다.', function(done) {
    //         // 클로저상의 grid 변수를 사용하면 timeout으로 인한 호출타이밍 때문에 destroy된 변수를 참조하게 되어 로컬에서 다시 생성해서 사용
    //         var core = createCore(),
    //             spy = jasmine.createSpy('clickCellSpy');
    //
    //         setTimeout(function() {
    //             var $cell = core.getElement(0, 'c1');
    //             core.on('clickCell', spy);
    //             $cell.click();
    //             expect(spy).toHaveBeenCalled();
    //             done();
    //         })
    //     });
    //
    //     it('singleClickEdit 옵션이 true이고 text-convertible 셀인 경우 편집모드로 전환한다.', function(done) {
    //         var core = new Core({
    //             el: setFixtures('<div />'),
    //             columnModelList: [
    //                 {
    //                     title: 'c1',
    //                     columnName: 'c1',
    //                     editOption: {
    //                         type: 'text-convertible'
    //                     }
    //                 }
    //             ]
    //         });
    //         core.singleClickEdit = true;
    //         core.setRowList([{
    //             c1: '0-1'
    //         }]);
    //
    //         setTimeout(function() {
    //             var $cell = core.getElement(0, 'c1');
    //             $cell.click();
    //             expect($cell.find('input').length).toBe(1);
    //             done();
    //         })
    //     });
    // });
});
