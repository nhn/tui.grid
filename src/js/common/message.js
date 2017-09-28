/**
 * @fileoverview Locale messages
 * @author NHN Ent. Fe Development Lab
 */

'use strict';

var util = require('./util');

var messages = {
    en: {
        createAction: 'create',
        updateAction: 'update',
        deleteAction: 'delete',
        modifyAction: 'modify',
        requestConfirm: 'Are you sure you want to {{actionName}} {{count}} data?',
        noDataResponse: 'No data to {{actionName}}.',
        errorResponse: 'An error occurred while requesting data.\n\nPlease try again.',
        noData: 'No data.',
        onLoading: 'Your request is being processed.',
        resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
                            'and initialize the width by double-clicking.'
    },
    ko: {
        createAction: '입력',
        updateAction: '수정',
        deleteAction: '삭제',
        modifyAction: '반영',
        requestConfirm: '{{count}}건의 데이터를 {{actionName}}하시겠습니까?',
        noDataResponse: '{{actionName}}할 데이터가 없습니다.',
        errorResponse: '데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.',
        noData: '데이터가 존재하지 않습니다.',
        onLoading: '요청을 처리 중입니다.',
        resizeHandleGuide: '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고, ' +
                            '더블클릭을 통해 넓이를 초기화할 수 있습니다.'
    }
};
var localeMessages = messages.en;

module.exports = {
    /**
     * Set messages
     * @param {string} langCode - Language code to decide locale messages
     */
    setLanguage: function(langCode) {
        localeMessages = messages[langCode];
    },

    /**
     * Get messeage
     * @param {string} key - Key to find message
     * @param {?object} [replacements] - Values to replace string
     * @returns {string} Message
     */
    get: function(key, replacements) {
        var message = localeMessages[key];

        if (replacements) {
            message = util.replaceText(message, replacements);
        }

        return message;
    }
};
