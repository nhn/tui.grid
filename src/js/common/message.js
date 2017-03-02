/**
 * @fileoverview Locale messages
 * @author NHN Ent. Fe Development Lab
 */
'use strict';

module.exports.net = {
    en: {
        requestType: {
            createData: 'create',
            updateData: 'update',
            deleteData: 'delete',
            modifyData: 'modify'
        },
        hasData: 'Are you sure you want to {{actionName}} {{count}} data?',
        noData: 'No data to {{actionName}}.',
        errorResponse: 'An error occurred while requesting data.\n\nPlease try again.'
    },
    ko: {
        requestType: {
            createData: '입력',
            updateData: '수정',
            deleteData: '삭제',
            modifyData: '반영'
        },
        hasData: '{{count}}건의 데이터를 {{actionName}}하시겠습니까?',
        noData: '{{actionName}}할 데이터가 없습니다.',
        errorResponse: '데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.'
    }
};

module.exports.resizeHandle = {
    en: 'You can change the width of the column by mouse drag, and initialize the width by double-clicking.',
    ko: '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고, 더블클릭을 통해 넓이를 초기화할 수 있습니다.'
};
