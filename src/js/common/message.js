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
        emptyResponse: 'No data to {{actionName}}.',
        errorResponse: 'An error occurred while requesting data.\n\nPlease try again.',
        resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
                            'and initialize the width by double-clicking.'
    },
    ko: {
        createAction: '입력',
        updateAction: '수정',
        deleteAction: '삭제',
        modifyAction: '반영',
        requestConfirm: '{{count}}건의 데이터를 {{actionName}}하시겠습니까?',
        emptyResponse: '{{actionName}}할 데이터가 없습니다.',
        errorResponse: '데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.',
        resizeHandleGuide: '마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고, 더블클릭을 통해 넓이를 초기화할 수 있습니다.'
    }
};
var localeMessages = {};

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
     * @param {?object} [replacedValues] - Replaced values
     * @returns {string} Message
     */
    get: function(key, replacedValues) {
        var message = localeMessages[key];

        if (replacedValues) {
            message = util.replaceText(message, replacedValues);
        }

        return message;
    }
};
