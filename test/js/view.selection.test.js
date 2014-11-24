describe('view.selection', function() {
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        }, {
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
                    isDisabled: function (value, rowData) {
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
                    isEditable: function (value, rowData) {
                        return !!value;
                    }
                }
            ]
        }
    ];
    //두번째 행은 disabled 처리한다.
    var rowList = [{
        'columnName1': '1_0',
        'columnName2': '1_1',
        'columnName3': '1_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '1_6',
        'columnName8': '1_7',
        '_extraData': {'rowSpan': {'columnName5': 1, 'columnName6': 5, 'columnName7': 4, 'columnName8': 3}}
    }, {
        'columnName1': '2_0',
        'columnName2': '2_1',
        'columnName3': '2_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '2_6',
        'columnName8': '2_7',
        '_extraData': {'rowSpan': {'columnName8': 2}, 'rowState': 'DISABLED'}
    }, {
        'columnName1': '3_0',
        'columnName2': '3_1',
        'columnName3': '3_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '3_6',
        'columnName8': '3_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName2': 1}}
    }, {
        'columnName1': '4_0',
        'columnName2': '4_1',
        'columnName3': '4_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '4_6',
        'columnName8': '4_7',
        '_extraData': {'rowSpan': {'columnName4': 3}}
    }, {
        'columnName1': '5_0',
        'columnName2': '5_1',
        'columnName3': '5_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 2,
        'columnName7': '5_6',
        'columnName8': '5_7'
    }, {
        'columnName1': '6_0',
        'columnName2': '6_1',
        'columnName3': '6_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '6_6',
        'columnName8': '6_7'
    }, {
        'columnName1': '7_0',
        'columnName2': '7_1',
        'columnName3': '7_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '7_6',
        'columnName8': '7_7',
        '_extraData': {'rowSpan': {'columnName6': 4}}
    }, {
        'columnName1': '8_0',
        'columnName2': '8_1',
        'columnName3': '8_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 4,
        'columnName7': '8_6',
        'columnName8': '8_7'
    }, {
        'columnName1': '9_0',
        'columnName2': '9_1',
        'columnName3': '9_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 1,
        'columnName7': '9_6',
        'columnName8': '9_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName3': 5}}
    }, {
        'columnName1': '10_0',
        'columnName2': '10_1',
        'columnName3': '10_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '10_6',
        'columnName8': '10_7'
    }, {
        'columnName1': '11_0',
        'columnName2': '11_1',
        'columnName3': '11_2',
        'columnName4': 4,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '11_6',
        'columnName8': '11_7',
        '_extraData': {'rowSpan': {'columnName7': 3}}
    }, {
        'columnName1': '12_0',
        'columnName2': '12_1',
        'columnName3': '12_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 4,
        'columnName7': '12_6',
        'columnName8': '12_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName3': 3, 'columnName8': 1}}
    }, {
        'columnName1': '13_0',
        'columnName2': '13_1',
        'columnName3': '13_2',
        'columnName4': 2,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '13_6',
        'columnName8': '13_7',
        '_extraData': {'rowSpan': {'columnName3': 5}}
    }, {
        'columnName1': '14_0',
        'columnName2': '14_1',
        'columnName3': '14_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '14_6',
        'columnName8': '14_7',
        '_extraData': {'rowSpan': {'columnName1': 3, 'columnName6': 2, 'columnName8': 1}}
    }, {
        'columnName1': '15_0',
        'columnName2': '15_1',
        'columnName3': '15_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '15_6',
        'columnName8': '15_7',
        '_extraData': {'rowSpan': {'columnName1': 4}}
    }, {
        'columnName1': '16_0',
        'columnName2': '16_1',
        'columnName3': '16_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '16_6',
        'columnName8': '16_7',
        '_extraData': {'rowSpan': {'columnName2': 4, 'columnName4': 5}}
    }, {
        'columnName1': '17_0',
        'columnName2': '17_1',
        'columnName3': '17_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 4,
        'columnName7': '17_6',
        'columnName8': '17_7',
        '_extraData': {'rowSpan': {'columnName2': 5, 'columnName6': 5}}
    }, {
        'columnName1': '18_0',
        'columnName2': '18_1',
        'columnName3': '18_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '18_6',
        'columnName8': '18_7'
    }, {
        'columnName1': '19_0',
        'columnName2': '19_1',
        'columnName3': '19_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '19_6',
        'columnName8': '19_7'
    }, {
        'columnName1': '20_0',
        'columnName2': '20_1',
        'columnName3': '20_2',
        'columnName4': 4,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '20_6',
        'columnName8': '20_7',
        '_extraData': {'rowSpan': {'columnName2': 1, 'columnName8': 1}}
    }, {
        'columnName1': '21_0',
        'columnName2': '21_1',
        'columnName3': '21_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '21_6',
        'columnName8': '21_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName3': 3, 'columnName5': 1}}
    }, {
        'columnName1': '22_0',
        'columnName2': '22_1',
        'columnName3': '22_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 4,
        'columnName7': '22_6',
        'columnName8': '22_7',
        '_extraData': {'rowSpan': {'columnName2': 2}}
    }, {
        'columnName1': '23_0',
        'columnName2': '23_1',
        'columnName3': '23_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '23_6',
        'columnName8': '23_7'
    }, {
        'columnName1': '24_0',
        'columnName2': '24_1',
        'columnName3': '24_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '24_6',
        'columnName8': '24_7',
        '_extraData': {'rowSpan': {'columnName1': 3, 'columnName2': 5, 'columnName3': 5}}
    }, {
        'columnName1': '25_0',
        'columnName2': '25_1',
        'columnName3': '25_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '25_6',
        'columnName8': '25_7'
    }, {
        'columnName1': '26_0',
        'columnName2': '26_1',
        'columnName3': '26_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 1,
        'columnName7': '26_6',
        'columnName8': '26_7'
    }, {
        'columnName1': '27_0',
        'columnName2': '27_1',
        'columnName3': '27_2',
        'columnName4': 1,
        'columnName5': 3,
        'columnName6': 1,
        'columnName7': '27_6',
        'columnName8': '27_7',
        '_extraData': {'rowSpan': {'columnName7': 4}}
    }, {
        'columnName1': '28_0',
        'columnName2': '28_1',
        'columnName3': '28_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '28_6',
        'columnName8': '28_7'
    }, {
        'columnName1': '29_0',
        'columnName2': '29_1',
        'columnName3': '29_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '29_6',
        'columnName8': '29_7'
    }, {
        'columnName1': '30_0',
        'columnName2': '30_1',
        'columnName3': '30_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '30_6',
        'columnName8': '30_7',
        '_extraData': {'rowSpan': {'columnName6': 2, 'columnName7': 2, 'columnName8': 1}}
    }, {
        'columnName1': '31_0',
        'columnName2': '31_1',
        'columnName3': '31_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '31_6',
        'columnName8': '31_7',
        '_extraData': {'rowSpan': {'columnName2': 5, 'columnName5': 1}}
    }, {
        'columnName1': '32_0',
        'columnName2': '32_1',
        'columnName3': '32_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 1,
        'columnName7': '32_6',
        'columnName8': '32_7',
        '_extraData': {'rowSpan': {'columnName7': 5}}
    }, {
        'columnName1': '33_0',
        'columnName2': '33_1',
        'columnName3': '33_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 4,
        'columnName7': '33_6',
        'columnName8': '33_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName3': 3, 'columnName4': 3}}
    }, {
        'columnName1': '34_0',
        'columnName2': '34_1',
        'columnName3': '34_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '34_6',
        'columnName8': '34_7',
        '_extraData': {'rowSpan': {'columnName4': 5, 'columnName8': 1}}
    }, {
        'columnName1': '35_0',
        'columnName2': '35_1',
        'columnName3': '35_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '35_6',
        'columnName8': '35_7'
    }, {
        'columnName1': '36_0',
        'columnName2': '36_1',
        'columnName3': '36_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '36_6',
        'columnName8': '36_7',
        '_extraData': {'rowSpan': {'columnName8': 2}}
    }, {
        'columnName1': '37_0',
        'columnName2': '37_1',
        'columnName3': '37_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 4,
        'columnName7': '37_6',
        'columnName8': '37_7',
        '_extraData': {'rowSpan': {'columnName1': 4, 'columnName2': 4}}
    }, {
        'columnName1': '38_0',
        'columnName2': '38_1',
        'columnName3': '38_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '38_6',
        'columnName8': '38_7',
        '_extraData': {'rowSpan': {'columnName1': 2, 'columnName3': 3}}
    }, {
        'columnName1': '39_0',
        'columnName2': '39_1',
        'columnName3': '39_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '39_6',
        'columnName8': '39_7'
    }, {
        'columnName1': '40_0',
        'columnName2': '40_1',
        'columnName3': '40_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '40_6',
        'columnName8': '40_7',
        '_extraData': {'rowSpan': {'columnName1': 2, 'columnName7': 5}}
    }, {
        'columnName1': '41_0',
        'columnName2': '41_1',
        'columnName3': '41_2',
        'columnName4': 3,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '41_6',
        'columnName8': '41_7',
        '_extraData': {'rowSpan': {'columnName5': 3}}
    }, {
        'columnName1': '42_0',
        'columnName2': '42_1',
        'columnName3': '42_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '42_6',
        'columnName8': '42_7',
        '_extraData': {'rowSpan': {'columnName4': 2, 'columnName7': 5, 'columnName8': 5}}
    }, {
        'columnName1': '43_0',
        'columnName2': '43_1',
        'columnName3': '43_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 1,
        'columnName7': '43_6',
        'columnName8': '43_7',
        '_extraData': {'rowSpan': {'columnName1': 5}}
    }, {
        'columnName1': '44_0',
        'columnName2': '44_1',
        'columnName3': '44_2',
        'columnName4': 1,
        'columnName5': 3,
        'columnName6': 1,
        'columnName7': '44_6',
        'columnName8': '44_7'
    }, {
        'columnName1': '45_0',
        'columnName2': '45_1',
        'columnName3': '45_2',
        'columnName4': 3,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '45_6',
        'columnName8': '45_7',
        '_extraData': {'rowSpan': {'columnName4': 1}}
    }, {
        'columnName1': '46_0',
        'columnName2': '46_1',
        'columnName3': '46_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '46_6',
        'columnName8': '46_7'
    }, {
        'columnName1': '47_0',
        'columnName2': '47_1',
        'columnName3': '47_2',
        'columnName4': 3,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '47_6',
        'columnName8': '47_7',
        '_extraData': {'rowSpan': {'columnName1': 2}}
    }, {
        'columnName1': '48_0',
        'columnName2': '48_1',
        'columnName3': '48_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '48_6',
        'columnName8': '48_7',
        '_extraData': {'rowSpan': {'columnName6': 1}}
    }, {
        'columnName1': '49_0',
        'columnName2': '49_1',
        'columnName3': '49_2',
        'columnName4': 4,
        'columnName5': 3,
        'columnName6': 4,
        'columnName7': '49_6',
        'columnName8': '49_7',
        '_extraData': {'rowSpan': {'columnName4': 2, 'columnName7': 5}}
    }, {
        'columnName1': '50_0',
        'columnName2': '50_1',
        'columnName3': '50_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '50_6',
        'columnName8': '50_7'
    }, {
        'columnName1': '51_0',
        'columnName2': '51_1',
        'columnName3': '51_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '51_6',
        'columnName8': '51_7',
        '_extraData': {'rowSpan': {'columnName7': 1, 'columnName8': 2}}
    }, {
        'columnName1': '52_0',
        'columnName2': '52_1',
        'columnName3': '52_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '52_6',
        'columnName8': '52_7',
        '_extraData': {'rowSpan': {'columnName5': 5, 'columnName8': 4}}
    }, {
        'columnName1': '53_0',
        'columnName2': '53_1',
        'columnName3': '53_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 2,
        'columnName7': '53_6',
        'columnName8': '53_7',
        '_extraData': {'rowSpan': {'columnName1': 2, 'columnName6': 3, 'columnName8': 1}}
    }, {
        'columnName1': '54_0',
        'columnName2': '54_1',
        'columnName3': '54_2',
        'columnName4': 2,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '54_6',
        'columnName8': '54_7',
        '_extraData': {'rowSpan': {'columnName1': 3, 'columnName3': 4}}
    }, {
        'columnName1': '55_0',
        'columnName2': '55_1',
        'columnName3': '55_2',
        'columnName4': 1,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '55_6',
        'columnName8': '55_7'
    }, {
        'columnName1': '56_0',
        'columnName2': '56_1',
        'columnName3': '56_2',
        'columnName4': 3,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '56_6',
        'columnName8': '56_7',
        '_extraData': {'rowSpan': {'columnName1': 1}}
    }, {
        'columnName1': '57_0',
        'columnName2': '57_1',
        'columnName3': '57_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '57_6',
        'columnName8': '57_7',
        '_extraData': {'rowSpan': {'columnName4': 1}}
    }, {
        'columnName1': '58_0',
        'columnName2': '58_1',
        'columnName3': '58_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '58_6',
        'columnName8': '58_7',
        '_extraData': {'rowSpan': {'columnName6': 1, 'columnName8': 1}}
    }, {
        'columnName1': '59_0',
        'columnName2': '59_1',
        'columnName3': '59_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 4,
        'columnName7': '59_6',
        'columnName8': '59_7',
        '_extraData': {'rowSpan': {'columnName1': 1}}
    }, {
        'columnName1': '60_0',
        'columnName2': '60_1',
        'columnName3': '60_2',
        'columnName4': 4,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '60_6',
        'columnName8': '60_7',
        '_extraData': {'rowSpan': {'columnName1': 1, 'columnName4': 4, 'columnName8': 5}}
    }, {
        'columnName1': '61_0',
        'columnName2': '61_1',
        'columnName3': '61_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '61_6',
        'columnName8': '61_7',
        '_extraData': {'rowSpan': {'columnName4': 2}}
    }, {
        'columnName1': '62_0',
        'columnName2': '62_1',
        'columnName3': '62_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 2,
        'columnName7': '62_6',
        'columnName8': '62_7',
        '_extraData': {'rowSpan': {'columnName1': 3, 'columnName3': 1}}
    }, {
        'columnName1': '63_0',
        'columnName2': '63_1',
        'columnName3': '63_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 2,
        'columnName7': '63_6',
        'columnName8': '63_7',
        '_extraData': {'rowSpan': {'columnName3': 5}}
    }, {
        'columnName1': '64_0',
        'columnName2': '64_1',
        'columnName3': '64_2',
        'columnName4': 3,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '64_6',
        'columnName8': '64_7',
        '_extraData': {'rowSpan': {'columnName4': 5}}
    }, {
        'columnName1': '65_0',
        'columnName2': '65_1',
        'columnName3': '65_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '65_6',
        'columnName8': '65_7',
        '_extraData': {'rowSpan': {'columnName4': 4}}
    }, {
        'columnName1': '66_0',
        'columnName2': '66_1',
        'columnName3': '66_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 1,
        'columnName7': '66_6',
        'columnName8': '66_7'
    }, {
        'columnName1': '67_0',
        'columnName2': '67_1',
        'columnName3': '67_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '67_6',
        'columnName8': '67_7',
        '_extraData': {'rowSpan': {'columnName3': 5, 'columnName6': 1}}
    }, {
        'columnName1': '68_0',
        'columnName2': '68_1',
        'columnName3': '68_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '68_6',
        'columnName8': '68_7'
    }, {
        'columnName1': '69_0',
        'columnName2': '69_1',
        'columnName3': '69_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '69_6',
        'columnName8': '69_7'
    }, {
        'columnName1': '70_0',
        'columnName2': '70_1',
        'columnName3': '70_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '70_6',
        'columnName8': '70_7',
        '_extraData': {'rowSpan': {'columnName3': 3, 'columnName4': 5}}
    }, {
        'columnName1': '71_0',
        'columnName2': '71_1',
        'columnName3': '71_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '71_6',
        'columnName8': '71_7',
        '_extraData': {'rowSpan': {'columnName5': 4}}
    }, {
        'columnName1': '72_0',
        'columnName2': '72_1',
        'columnName3': '72_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 4,
        'columnName7': '72_6',
        'columnName8': '72_7'
    }, {
        'columnName1': '73_0',
        'columnName2': '73_1',
        'columnName3': '73_2',
        'columnName4': 1,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '73_6',
        'columnName8': '73_7',
        '_extraData': {'rowSpan': {'columnName8': 5}}
    }, {
        'columnName1': '74_0',
        'columnName2': '74_1',
        'columnName3': '74_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '74_6',
        'columnName8': '74_7'
    }, {
        'columnName1': '75_0',
        'columnName2': '75_1',
        'columnName3': '75_2',
        'columnName4': 4,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '75_6',
        'columnName8': '75_7',
        '_extraData': {'rowSpan': {'columnName6': 3}}
    }, {
        'columnName1': '76_0',
        'columnName2': '76_1',
        'columnName3': '76_2',
        'columnName4': 2,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '76_6',
        'columnName8': '76_7'
    }, {
        'columnName1': '77_0',
        'columnName2': '77_1',
        'columnName3': '77_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '77_6',
        'columnName8': '77_7',
        '_extraData': {'rowSpan': {'columnName3': 3, 'columnName4': 3, 'columnName6': 2}}
    }, {
        'columnName1': '78_0',
        'columnName2': '78_1',
        'columnName3': '78_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 4,
        'columnName7': '78_6',
        'columnName8': '78_7',
        '_extraData': {'rowSpan': {'columnName3': 3, 'columnName7': 1}}
    }, {
        'columnName1': '79_0',
        'columnName2': '79_1',
        'columnName3': '79_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 1,
        'columnName7': '79_6',
        'columnName8': '79_7',
        '_extraData': {'rowSpan': {'columnName1': 2, 'columnName4': 5, 'columnName8': 2}}
    }, {
        'columnName1': '80_0',
        'columnName2': '80_1',
        'columnName3': '80_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '80_6',
        'columnName8': '80_7',
        '_extraData': {'rowSpan': {'columnName1': 3, 'columnName6': 4, 'columnName7': 4, 'columnName8': 4}}
    }, {
        'columnName1': '81_0',
        'columnName2': '81_1',
        'columnName3': '81_2',
        'columnName4': 3,
        'columnName5': 4,
        'columnName6': 1,
        'columnName7': '81_6',
        'columnName8': '81_7',
        '_extraData': {'rowSpan': {'columnName4': 1, 'columnName5': 4}}
    }, {
        'columnName1': '82_0',
        'columnName2': '82_1',
        'columnName3': '82_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '82_6',
        'columnName8': '82_7'
    }, {
        'columnName1': '83_0',
        'columnName2': '83_1',
        'columnName3': '83_2',
        'columnName4': 3,
        'columnName5': 4,
        'columnName6': 2,
        'columnName7': '83_6',
        'columnName8': '83_7',
        '_extraData': {'rowSpan': {'columnName2': 5, 'columnName8': 1}}
    }, {
        'columnName1': '84_0',
        'columnName2': '84_1',
        'columnName3': '84_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '84_6',
        'columnName8': '84_7'
    }, {
        'columnName1': '85_0',
        'columnName2': '85_1',
        'columnName3': '85_2',
        'columnName4': 2,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '85_6',
        'columnName8': '85_7',
        '_extraData': {'rowSpan': {'columnName8': 1}}
    }, {
        'columnName1': '86_0',
        'columnName2': '86_1',
        'columnName3': '86_2',
        'columnName4': 4,
        'columnName5': 3,
        'columnName6': 3,
        'columnName7': '86_6',
        'columnName8': '86_7',
        '_extraData': {'rowSpan': {'columnName1': 1, 'columnName2': 3, 'columnName4': 3}}
    }, {
        'columnName1': '87_0',
        'columnName2': '87_1',
        'columnName3': '87_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 4,
        'columnName7': '87_6',
        'columnName8': '87_7'
    }, {
        'columnName1': '88_0',
        'columnName2': '88_1',
        'columnName3': '88_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '88_6',
        'columnName8': '88_7',
        '_extraData': {'rowSpan': {'columnName1': 1, 'columnName6': 1}}
    }, {
        'columnName1': '89_0',
        'columnName2': '89_1',
        'columnName3': '89_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '89_6',
        'columnName8': '89_7',
        '_extraData': {'rowSpan': {'columnName1': 4}}
    }, {
        'columnName1': '90_0',
        'columnName2': '90_1',
        'columnName3': '90_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '90_6',
        'columnName8': '90_7',
        '_extraData': {'rowSpan': {'columnName1': 3}}
    }, {
        'columnName1': '91_0',
        'columnName2': '91_1',
        'columnName3': '91_2',
        'columnName4': 4,
        'columnName5': 4,
        'columnName6': 4,
        'columnName7': '91_6',
        'columnName8': '91_7'
    }, {
        'columnName1': '92_0',
        'columnName2': '92_1',
        'columnName3': '92_2',
        'columnName4': 3,
        'columnName5': 2,
        'columnName6': 1,
        'columnName7': '92_6',
        'columnName8': '92_7',
        '_extraData': {'rowSpan': {'columnName3': 2, 'columnName4': 5}}
    }, {
        'columnName1': '93_0',
        'columnName2': '93_1',
        'columnName3': '93_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '93_6',
        'columnName8': '93_7',
        '_extraData': {'rowSpan': {'columnName2': 5}}
    }, {
        'columnName1': '94_0',
        'columnName2': '94_1',
        'columnName3': '94_2',
        'columnName4': 1,
        'columnName5': 4,
        'columnName6': 3,
        'columnName7': '94_6',
        'columnName8': '94_7'
    }, {
        'columnName1': '95_0',
        'columnName2': '95_1',
        'columnName3': '95_2',
        'columnName4': 4,
        'columnName5': 1,
        'columnName6': 2,
        'columnName7': '95_6',
        'columnName8': '95_7',
        '_extraData': {'rowSpan': {'columnName4': 5}}
    }, {
        'columnName1': '96_0',
        'columnName2': '96_1',
        'columnName3': '96_2',
        'columnName4': 4,
        'columnName5': 2,
        'columnName6': 3,
        'columnName7': '96_6',
        'columnName8': '96_7'
    }, {
        'columnName1': '97_0',
        'columnName2': '97_1',
        'columnName3': '97_2',
        'columnName4': 1,
        'columnName5': 1,
        'columnName6': 3,
        'columnName7': '97_6',
        'columnName8': '97_7',
        '_extraData': {'rowSpan': {'columnName1': 1, 'columnName4': 3}}
    }, {
        'columnName1': '98_0',
        'columnName2': '98_1',
        'columnName3': '98_2',
        'columnName4': 2,
        'columnName5': 3,
        'columnName6': 4,
        'columnName7': '98_6',
        'columnName8': '98_7',
        '_extraData': {'rowSpan': {'columnName1': 1, 'columnName5': 1, 'columnName6': 1, 'columnName7': 2}}
    }, {
        'columnName1': '99_0',
        'columnName2': '99_1',
        'columnName3': '99_2',
        'columnName4': 2,
        'columnName5': 2,
        'columnName6': 1,
        'columnName7': '99_6',
        'columnName8': '99_7'
    }, {
        'columnName1': '100_0',
        'columnName2': '100_1',
        'columnName3': '100_2',
        'columnName4': 1,
        'columnName5': 2,
        'columnName6': 2,
        'columnName7': '100_6',
        'columnName8': '100_7'
    }];
    var grid,
        $empty;

    beforeEach(function() {
        jasmine.clock().install();
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/empty.html');
        $empty = $('#empty');
        grid = new Grid({
            el: $empty,
            columnModelList: columnModelList,
            selectType: 'checkbox'
        });
        grid.setRowList(rowList);
        jasmine.clock().tick(1);
    });
    afterEach(function() {
        grid && grid.destroy();
        jasmine.clock().uninstall();
    });
    describe('selection test', function() {
        var selection;
        beforeEach(function() {
            selection = grid.selection;
        });
        afterEach(function() {
            selection && selection.destroy && selection.destroy();
        });
        it('enable', function() {
            selection.enable();
            expect(selection.isEnable).toBe(true);
        });
        it('disable', function() {
            selection.endSelection = jasmine.createSpy('endSelection');

            selection.disable();
            expect(selection.isEnable).toBe(false);
            expect(selection.endSelection).toHaveBeenCalled();
        });
        describe('_isAutoScrollable()', function() {
            it('mouse move 이벤트 발생시 scroll 해야하는 영역에 pointer 가 위치하는지 확인한다.', function() {
                expect(selection._isAutoScrollable(1, 1)).toBe(true);
                expect(selection._isAutoScrollable(1, 0)).toBe(true);
                expect(selection._isAutoScrollable(0, 1)).toBe(true);
                expect(selection._isAutoScrollable(-1, 1)).toBe(true);
                expect(selection._isAutoScrollable(-1, 0)).toBe(true);
                expect(selection._isAutoScrollable(0, -1)).toBe(true);
                expect(selection._isAutoScrollable(-1, -1)).toBe(true);
                expect(selection._isAutoScrollable(0, 0)).toBe(false);
            });
        });
        describe('_adjustScroll', function() {

        });
        describe('_getDistance', function() {
            it('피타고라스의 정리를 이용해 거리를 잘 구하는지 확인한다.', function() {
                selection.pageX = 10;
                selection.pageY = 10;
                var distance = selection._getDistance({
                    pageX: 12,
                    pageY: 12
                });
                expect(distance).toBe(Math.round(Math.sqrt(8)));
            });
        });
        describe('_onMouseUp', function() {
            it('detachMouseEvent 를 호출하는지 확인한다.', function() {
                selection.detachMouseEvent = jasmine.createSpy('detachMouseEvent');
                selection._onMouseUp();
                expect(selection.detachMouseEvent).toHaveBeenCalled();
            });
        });
        describe('getIndexFromMousePosition', function() {
            it('page X 와 page Y 에 해당하는 index 정보를 잘 반환하는지 확인한다.', function() {
                var data;
                data = selection.getIndexFromMousePosition(0, 0);
                expect(data).toEqual({ row: 0, column: 0, overflowX: -1, overflowY: -1 });

                data = selection.getIndexFromMousePosition(0, 100);
                expect(data).toEqual({ row: 1, column: 0, overflowX: -1, overflowY: 0 });
                data = selection.getIndexFromMousePosition(100, 100);
                expect(data).toEqual({ row: 1, column: 1, overflowX: 0, overflowY: 0 });
                data = selection.getIndexFromMousePosition(200, 100);
                expect(data).toEqual({ row: 1, column: 2, overflowX: 0, overflowY: 0 });
                data = selection.getIndexFromMousePosition(300, 100);
                expect(data).toEqual({ row: 1, column: 3, overflowX: 0, overflowY: 0 });
                data = selection.getIndexFromMousePosition(400, 100);
                expect(data).toEqual({ row: 1, column: 3, overflowX: 0, overflowY: 0 });
                data = selection.getIndexFromMousePosition(500, 100);
                expect(data).toEqual({ row: 1, column: 4, overflowX: 0, overflowY: 0 });
                data = selection.getIndexFromMousePosition(5000, 100);
                expect(data).toEqual({ row: 1, column: 5, overflowX: 1, overflowY: 0 });
                data = selection.getIndexFromMousePosition(500, 400);
                expect(data).toEqual({ row: 11, column: 4, overflowX: 0, overflowY: 1 });
            });
        });
        describe('getSelectionToString', function() {
            it('현재 selection 범위에 대해  string 으로 반환한다.', function() {
                selection.startSelection(7, 5);
                selection.updateSelection(12, 10);
                expect(selection.getSelectionToString()).toEqual('' +
                'text3	text3	text2	7_6	7_7\n' +
                'text1	text4	text2	8_6	8_7\n' +
                'text2	text3	text2	9_6	9_7\n' +
                'text4	text4	text2	10_6	10_7\n' +
                'text4	text1	text2	11_6	11_7\n' +
                'text2	text3	text4	11_6	12_7\n' +
                'text2	text4	text1	11_6	13_7');
                selection.endSelection();

                selection.startSelection(0, 5);
                selection.updateSelection(8, 10);
                expect(selection.getSelectionToString()).toEqual('' +
                'text1	text4	text1	1_6	1_7\n' +
                'text4	text2	text1	1_6	1_7\n' +
                'text2	text1	text1	1_6	1_7\n' +
                'text1	text4	text1	1_6	4_7\n' +
                'text1	text4	text1	5_6	5_7\n' +
                'text1	text1	text2	6_6	6_7\n' +
                'text3	text3	text2	7_6	7_7\n' +
                'text1	text4	text2	8_6	8_7\n' +
                'text2	text3	text2	9_6	9_7\n' +
                'text4	text4	text2	10_6	10_7');
                selection.endSelection();
            });
        });
        describe('selectAll', function() {
            it('전체 영역을 선택한다', function() {
                selection.selectAll();
                expect(selection.getRange()).toEqual({ row: [ 0, 99 ], column: [ 0, 9 ] });
            });
        });
    });
});
