/**
 * @fileoverview i18n module file
 * @author NHN Ent. Fe Development Lab
 */

'use strict';

var _ = require('underscore');
var util = require('./util');

var messages = {
    en: {
        display: {
            noData: 'No data.',
            loadingData: 'Loading data.',
            resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
                                'and initialize the width by double-clicking.'
        },
        net: {
            confirmCreate: 'Are you sure you want to create {{count}} data?',
            confirmUpdate: 'Are you sure you want to update {{count}} data?',
            confirmDelete: 'Are you sure you want to delete {{count}} data?',
            confirmModify: 'Are you sure you want to modify {{count}} data?',
            noDataToCreate: 'No data to create.',
            noDataToUpdate: 'No data to update.',
            noDataToDelete: 'No data to delete.',
            noDataToModify: 'No data to modify.',
            failResponse: 'An error occurred while requesting data.\nPlease try again.'
        }
    },
    ko: {
        display: {
            noData: '데이터가 존재하지 않습니다.',
            loadingData: '데이터를 불러오는 중입니다.',
            resizeHandleGuide: '마우스 드래그하여 컬럼 너비를 조정할 수 있고, ' +
                                '더블 클릭으로 컬럼 너비를 초기화할 수 있습니다.'
        },
        net: {
            confirmCreate: '{{count}}건의 데이터를 생성하겠습니까?',
            confirmUpdate: '{{count}}건의 데이터를 수정하겠습니까?',
            confirmDelete: '{{count}}건의 데이터를 삭제하겠습니까?',
            confirmModify: '{{count}}건의 데이터를 처리하겠습니까?',
            noDataToCreate: '생성할 데이터가 없습니다.',
            noDataToUpdate: '수정할 데이터가 없습니다.',
            noDataToDelete: '삭제할 데이터가 없습니다.',
            noDataToModify: '처리할 데이터가 없습니다.',
            failResponse: '데이터 요청 중에 에러가 발생하였습니다.\n다시 시도하여 주시기 바랍니다.'
        }
    }
};

var messageMap = {};

/**
 * Flatten message map
 * @param {object} data - Messages
 * @returns {object} Flatten message object (key foramt is 'key.subKey')
 * @ignore
 */
function flattenMessageMap(data) {
    var obj = {};
    var newKey;

    _.each(data, function(groupMessages, key) {
        _.each(groupMessages, function(message, subKey) {
            newKey = [key, subKey].join('.');
            obj[newKey] = message;
        });
    }, this);

    return obj;
}

module.exports = {
    /**
     * Set messages
     * @param {string} localeCode - Code to set locale messages and
     *     this is the language or language-region combination. (ex: en-US)
     * @param {object} [data] - Messages using in Grid
     */
    setLanguage: function(localeCode, data) {
        var localeMessages = messages[localeCode];
        var originData, newData;

        if (!localeMessages && !data) {
            throw new Error('You should set messages to map the locale code.');
        }

        newData = flattenMessageMap(data);

        if (localeMessages) {
            originData = flattenMessageMap(localeMessages);
            messageMap = _.extend(originData, newData);
        } else {
            messageMap = newData;
        }
    },

    /**
     * Get message
     * @param {string} key - Key to find message (ex: 'net.confirmCreate')
     * @param {object} [replacements] - Values to replace string
     * @returns {string} Message
     */
    get: function(key, replacements) {
        var message = messageMap[key];

        if (replacements) {
            message = util.replaceText(message, replacements);
        }

        return message;
    }
};
