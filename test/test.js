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
grid1.setRowList([{
    "column1": "1_0",
    "column2": "1_1",
    "column3": "1_2",
    "column4": 1,
    "column5": 2,
    "column6": 3,
    "column7": "1_6",
    "column8": "1_7",
    "_extraData": {"rowSpan": {"column4": 3}}
}, {
    "column1": "2_0",
    "column2": "2_1",
    "column3": "2_2",
    "column4": 3,
    "column5": 2,
    "column6": 2,
    "column7": "2_6",
    "column8": "2_7",
    "_extraData": {"rowSpan": {"column8": 5}}
}, {
    "column1": "3_0",
    "column2": "3_1",
    "column3": "3_2",
    "column4": 1,
    "column5": 1,
    "column6": 1,
    "column7": "3_6",
    "column8": "3_7",
    "_extraData": {"rowSpan": {"column7": 2}}
}, {
    "column1": "4_0",
    "column2": "4_1",
    "column3": "4_2",
    "column4": 4,
    "column5": 3,
    "column6": 2,
    "column7": "4_6",
    "column8": "4_7",
    "_extraData": {"rowSpan": {"column3": 4}}
}, {
    "column1": "5_0",
    "column2": "5_1",
    "column3": "5_2",
    "column4": 2,
    "column5": 1,
    "column6": 3,
    "column7": "5_6",
    "column8": "5_7",
    "_extraData": {"rowSpan": {"column5": 2, "column6": 5}}
}, {
    "column1": "6_0",
    "column2": "6_1",
    "column3": "6_2",
    "column4": 2,
    "column5": 2,
    "column6": 1,
    "column7": "6_6",
    "column8": "6_7"
}, {
    "column1": "7_0",
    "column2": "7_1",
    "column3": "7_2",
    "column4": 1,
    "column5": 3,
    "column6": 2,
    "column7": "7_6",
    "column8": "7_7",
    "_extraData": {"rowSpan": {"column3": 2, "column5": 5}}
}, {
    "column1": "8_0",
    "column2": "8_1",
    "column3": "8_2",
    "column4": 3,
    "column5": 3,
    "column6": 3,
    "column7": "8_6",
    "column8": "8_7",
    "_extraData": {"rowSpan": {"column3": 3, "column8": 1}}
}, {
    "column1": "9_0",
    "column2": "9_1",
    "column3": "9_2",
    "column4": 4,
    "column5": 3,
    "column6": 1,
    "column7": "9_6",
    "column8": "9_7",
    "_extraData": {"rowSpan": {"column3": 1, "column5": 3, "column8": 2}}
}, {
    "column1": "10_0",
    "column2": "10_1",
    "column3": "10_2",
    "column4": 1,
    "column5": 1,
    "column6": 1,
    "column7": "10_6",
    "column8": "10_7",
    "_extraData": {"rowSpan": {"column3": 3}}
}, {
    "column1": "11_0",
    "column2": "11_1",
    "column3": "11_2",
    "column4": 3,
    "column5": 1,
    "column6": 2,
    "column7": "11_6",
    "column8": "11_7",
    "_extraData": {"rowSpan": {"column2": 2, "column3": 3, "column8": 1}}
}, {
    "column1": "12_0",
    "column2": "12_1",
    "column3": "12_2",
    "column4": 3,
    "column5": 1,
    "column6": 2,
    "column7": "12_6",
    "column8": "12_7"
}, {
    "column1": "13_0",
    "column2": "13_1",
    "column3": "13_2",
    "column4": 3,
    "column5": 3,
    "column6": 1,
    "column7": "13_6",
    "column8": "13_7",
    "_extraData": {"rowSpan": {"column2": 3, "column7": 3}}
}, {
    "column1": "14_0",
    "column2": "14_1",
    "column3": "14_2",
    "column4": 3,
    "column5": 2,
    "column6": 1,
    "column7": "14_6",
    "column8": "14_7",
    "_extraData": {"rowSpan": {"column1": 1, "column4": 2, "column8": 2}}
}, {
    "column1": "15_0",
    "column2": "15_1",
    "column3": "15_2",
    "column4": 3,
    "column5": 1,
    "column6": 2,
    "column7": "15_6",
    "column8": "15_7"
}, {
    "column1": "16_0",
    "column2": "16_1",
    "column3": "16_2",
    "column4": 1,
    "column5": 2,
    "column6": 1,
    "column7": "16_6",
    "column8": "16_7"
}, {
    "column1": "17_0",
    "column2": "17_1",
    "column3": "17_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "17_6",
    "column8": "17_7",
    "_extraData": {"rowSpan": {"column6": 4, "column7": 5}}
}, {
    "column1": "18_0",
    "column2": "18_1",
    "column3": "18_2",
    "column4": 3,
    "column5": 2,
    "column6": 1,
    "column7": "18_6",
    "column8": "18_7"
}, {
    "column1": "19_0",
    "column2": "19_1",
    "column3": "19_2",
    "column4": 3,
    "column5": 3,
    "column6": 3,
    "column7": "19_6",
    "column8": "19_7",
    "_extraData": {"rowSpan": {"column2": 2}}
}, {
    "column1": "20_0",
    "column2": "20_1",
    "column3": "20_2",
    "column4": 4,
    "column5": 2,
    "column6": 3,
    "column7": "20_6",
    "column8": "20_7",
    "_extraData": {"rowSpan": {"column1": 3, "column6": 4}}
}, {
    "column1": "21_0",
    "column2": "21_1",
    "column3": "21_2",
    "column4": 4,
    "column5": 2,
    "column6": 3,
    "column7": "21_6",
    "column8": "21_7",
    "_extraData": {"rowSpan": {"column5": 4}}
}, {
    "column1": "22_0",
    "column2": "22_1",
    "column3": "22_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "22_6",
    "column8": "22_7",
    "_extraData": {"rowSpan": {"column4": 1, "column6": 3}}
}, {
    "column1": "23_0",
    "column2": "23_1",
    "column3": "23_2",
    "column4": 4,
    "column5": 2,
    "column6": 2,
    "column7": "23_6",
    "column8": "23_7"
}, {
    "column1": "24_0",
    "column2": "24_1",
    "column3": "24_2",
    "column4": 4,
    "column5": 1,
    "column6": 1,
    "column7": "24_6",
    "column8": "24_7",
    "_extraData": {"rowSpan": {"column5": 4, "column8": 4}}
}, {
    "column1": "25_0",
    "column2": "25_1",
    "column3": "25_2",
    "column4": 1,
    "column5": 2,
    "column6": 3,
    "column7": "25_6",
    "column8": "25_7",
    "_extraData": {"rowSpan": {"column1": 1, "column6": 2}}
}, {
    "column1": "26_0",
    "column2": "26_1",
    "column3": "26_2",
    "column4": 4,
    "column5": 1,
    "column6": 1,
    "column7": "26_6",
    "column8": "26_7"
}, {
    "column1": "27_0",
    "column2": "27_1",
    "column3": "27_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "27_6",
    "column8": "27_7",
    "_extraData": {"rowSpan": {"column1": 2, "column2": 2, "column7": 2}}
}, {
    "column1": "28_0",
    "column2": "28_1",
    "column3": "28_2",
    "column4": 2,
    "column5": 2,
    "column6": 2,
    "column7": "28_6",
    "column8": "28_7",
    "_extraData": {"rowSpan": {"column3": 1, "column6": 4}}
}, {
    "column1": "29_0",
    "column2": "29_1",
    "column3": "29_2",
    "column4": 1,
    "column5": 1,
    "column6": 3,
    "column7": "29_6",
    "column8": "29_7",
    "_extraData": {"rowSpan": {"column5": 1, "column8": 4}}
}, {
    "column1": "30_0",
    "column2": "30_1",
    "column3": "30_2",
    "column4": 2,
    "column5": 3,
    "column6": 3,
    "column7": "30_6",
    "column8": "30_7",
    "_extraData": {"rowSpan": {"column3": 5, "column7": 2}}
}, {
    "column1": "31_0",
    "column2": "31_1",
    "column3": "31_2",
    "column4": 3,
    "column5": 1,
    "column6": 3,
    "column7": "31_6",
    "column8": "31_7"
}, {
    "column1": "32_0",
    "column2": "32_1",
    "column3": "32_2",
    "column4": 4,
    "column5": 3,
    "column6": 3,
    "column7": "32_6",
    "column8": "32_7",
    "_extraData": {"rowSpan": {"column2": 3}}
}, {
    "column1": "33_0",
    "column2": "33_1",
    "column3": "33_2",
    "column4": 1,
    "column5": 3,
    "column6": 3,
    "column7": "33_6",
    "column8": "33_7",
    "_extraData": {"rowSpan": {"column6": 4}}
}, {
    "column1": "34_0",
    "column2": "34_1",
    "column3": "34_2",
    "column4": 1,
    "column5": 1,
    "column6": 2,
    "column7": "34_6",
    "column8": "34_7",
    "_extraData": {"rowSpan": {"column2": 2}}
}, {
    "column1": "35_0",
    "column2": "35_1",
    "column3": "35_2",
    "column4": 2,
    "column5": 2,
    "column6": 1,
    "column7": "35_6",
    "column8": "35_7",
    "_extraData": {"rowSpan": {"column6": 4, "column7": 3}}
}, {
    "column1": "36_0",
    "column2": "36_1",
    "column3": "36_2",
    "column4": 1,
    "column5": 2,
    "column6": 3,
    "column7": "36_6",
    "column8": "36_7",
    "_extraData": {"rowSpan": {"column4": 4}}
}, {
    "column1": "37_0",
    "column2": "37_1",
    "column3": "37_2",
    "column4": 3,
    "column5": 2,
    "column6": 3,
    "column7": "37_6",
    "column8": "37_7",
    "_extraData": {"rowSpan": {"column1": 5, "column6": 3}}
}, {
    "column1": "38_0",
    "column2": "38_1",
    "column3": "38_2",
    "column4": 1,
    "column5": 1,
    "column6": 2,
    "column7": "38_6",
    "column8": "38_7",
    "_extraData": {"rowSpan": {"column4": 2, "column7": 1}}
}, {
    "column1": "39_0",
    "column2": "39_1",
    "column3": "39_2",
    "column4": 3,
    "column5": 2,
    "column6": 2,
    "column7": "39_6",
    "column8": "39_7",
    "_extraData": {"rowSpan": {"column5": 1, "column8": 3}}
}, {
    "column1": "40_0",
    "column2": "40_1",
    "column3": "40_2",
    "column4": 3,
    "column5": 2,
    "column6": 3,
    "column7": "40_6",
    "column8": "40_7",
    "_extraData": {"rowSpan": {"column3": 5, "column4": 2}}
}, {
    "column1": "41_0",
    "column2": "41_1",
    "column3": "41_2",
    "column4": 3,
    "column5": 1,
    "column6": 1,
    "column7": "41_6",
    "column8": "41_7",
    "_extraData": {"rowSpan": {"column1": 4, "column5": 2, "column7": 4}}
}, {
    "column1": "42_0",
    "column2": "42_1",
    "column3": "42_2",
    "column4": 3,
    "column5": 3,
    "column6": 1,
    "column7": "42_6",
    "column8": "42_7"
}, {
    "column1": "43_0",
    "column2": "43_1",
    "column3": "43_2",
    "column4": 3,
    "column5": 2,
    "column6": 2,
    "column7": "43_6",
    "column8": "43_7"
}, {
    "column1": "44_0",
    "column2": "44_1",
    "column3": "44_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "44_6",
    "column8": "44_7",
    "_extraData": {"rowSpan": {"column1": 2, "column4": 4}}
}, {
    "column1": "45_0",
    "column2": "45_1",
    "column3": "45_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "45_6",
    "column8": "45_7",
    "_extraData": {"rowSpan": {"column3": 3}}
}, {
    "column1": "46_0",
    "column2": "46_1",
    "column3": "46_2",
    "column4": 3,
    "column5": 3,
    "column6": 1,
    "column7": "46_6",
    "column8": "46_7"
}, {
    "column1": "47_0",
    "column2": "47_1",
    "column3": "47_2",
    "column4": 3,
    "column5": 3,
    "column6": 2,
    "column7": "47_6",
    "column8": "47_7",
    "_extraData": {"rowSpan": {"column4": 3, "column8": 1}}
}, {
    "column1": "48_0",
    "column2": "48_1",
    "column3": "48_2",
    "column4": 2,
    "column5": 1,
    "column6": 2,
    "column7": "48_6",
    "column8": "48_7"
}, {
    "column1": "49_0",
    "column2": "49_1",
    "column3": "49_2",
    "column4": 1,
    "column5": 1,
    "column6": 3,
    "column7": "49_6",
    "column8": "49_7",
    "_extraData": {"rowSpan": {"column3": 1}}
}, {
    "column1": "50_0",
    "column2": "50_1",
    "column3": "50_2",
    "column4": 1,
    "column5": 3,
    "column6": 1,
    "column7": "50_6",
    "column8": "50_7",
    "_extraData": {"rowSpan": {"column1": 5, "column5": 5}}
}, {
    "column1": "51_0",
    "column2": "51_1",
    "column3": "51_2",
    "column4": 4,
    "column5": 3,
    "column6": 3,
    "column7": "51_6",
    "column8": "51_7",
    "_extraData": {"rowSpan": {"column5": 1}}
}, {
    "column1": "52_0",
    "column2": "52_1",
    "column3": "52_2",
    "column4": 3,
    "column5": 3,
    "column6": 2,
    "column7": "52_6",
    "column8": "52_7",
    "_extraData": {"rowSpan": {"column1": 4, "column2": 3, "column6": 4}}
}, {
    "column1": "53_0",
    "column2": "53_1",
    "column3": "53_2",
    "column4": 2,
    "column5": 2,
    "column6": 1,
    "column7": "53_6",
    "column8": "53_7",
    "_extraData": {"rowSpan": {"column3": 5}}
}, {
    "column1": "54_0",
    "column2": "54_1",
    "column3": "54_2",
    "column4": 4,
    "column5": 1,
    "column6": 1,
    "column7": "54_6",
    "column8": "54_7",
    "_extraData": {"rowSpan": {"column1": 1, "column6": 3}}
}, {
    "column1": "55_0",
    "column2": "55_1",
    "column3": "55_2",
    "column4": 4,
    "column5": 1,
    "column6": 3,
    "column7": "55_6",
    "column8": "55_7"
}, {
    "column1": "56_0",
    "column2": "56_1",
    "column3": "56_2",
    "column4": 2,
    "column5": 2,
    "column6": 3,
    "column7": "56_6",
    "column8": "56_7",
    "_extraData": {"rowSpan": {"column4": 5}}
}, {
    "column1": "57_0",
    "column2": "57_1",
    "column3": "57_2",
    "column4": 4,
    "column5": 2,
    "column6": 2,
    "column7": "57_6",
    "column8": "57_7"
}, {
    "column1": "58_0",
    "column2": "58_1",
    "column3": "58_2",
    "column4": 4,
    "column5": 3,
    "column6": 2,
    "column7": "58_6",
    "column8": "58_7"
}, {
    "column1": "59_0",
    "column2": "59_1",
    "column3": "59_2",
    "column4": 2,
    "column5": 3,
    "column6": 3,
    "column7": "59_6",
    "column8": "59_7"
}, {
    "column1": "60_0",
    "column2": "60_1",
    "column3": "60_2",
    "column4": 1,
    "column5": 1,
    "column6": 1,
    "column7": "60_6",
    "column8": "60_7"
}, {
    "column1": "61_0",
    "column2": "61_1",
    "column3": "61_2",
    "column4": 2,
    "column5": 2,
    "column6": 1,
    "column7": "61_6",
    "column8": "61_7"
}, {
    "column1": "62_0",
    "column2": "62_1",
    "column3": "62_2",
    "column4": 2,
    "column5": 1,
    "column6": 1,
    "column7": "62_6",
    "column8": "62_7",
    "_extraData": {"rowSpan": {"column4": 5, "column7": 1}}
}, {
    "column1": "63_0",
    "column2": "63_1",
    "column3": "63_2",
    "column4": 1,
    "column5": 3,
    "column6": 3,
    "column7": "63_6",
    "column8": "63_7"
}, {
    "column1": "64_0",
    "column2": "64_1",
    "column3": "64_2",
    "column4": 4,
    "column5": 2,
    "column6": 3,
    "column7": "64_6",
    "column8": "64_7",
    "_extraData": {"rowSpan": {"column1": 3, "column2": 3, "column3": 2}}
}, {
    "column1": "65_0",
    "column2": "65_1",
    "column3": "65_2",
    "column4": 4,
    "column5": 3,
    "column6": 2,
    "column7": "65_6",
    "column8": "65_7",
    "_extraData": {"rowSpan": {"column1": 3, "column3": 5, "column7": 5}}
}, {
    "column1": "66_0",
    "column2": "66_1",
    "column3": "66_2",
    "column4": 1,
    "column5": 3,
    "column6": 2,
    "column7": "66_6",
    "column8": "66_7",
    "_extraData": {"rowSpan": {"column3": 1, "column5": 4, "column7": 1}}
}, {
    "column1": "67_0",
    "column2": "67_1",
    "column3": "67_2",
    "column4": 1,
    "column5": 2,
    "column6": 1,
    "column7": "67_6",
    "column8": "67_7",
    "_extraData": {"rowSpan": {"column6": 5, "column7": 4, "column8": 1}}
}, {
    "column1": "68_0",
    "column2": "68_1",
    "column3": "68_2",
    "column4": 3,
    "column5": 3,
    "column6": 3,
    "column7": "68_6",
    "column8": "68_7",
    "_extraData": {"rowSpan": {"column3": 2, "column7": 1, "column8": 1}}
}, {
    "column1": "69_0",
    "column2": "69_1",
    "column3": "69_2",
    "column4": 2,
    "column5": 3,
    "column6": 3,
    "column7": "69_6",
    "column8": "69_7",
    "_extraData": {"rowSpan": {"column2": 1, "column3": 3, "column8": 5}}
}, {
    "column1": "70_0",
    "column2": "70_1",
    "column3": "70_2",
    "column4": 3,
    "column5": 3,
    "column6": 1,
    "column7": "70_6",
    "column8": "70_7",
    "_extraData": {"rowSpan": {"column3": 3}}
}, {
    "column1": "71_0",
    "column2": "71_1",
    "column3": "71_2",
    "column4": 4,
    "column5": 1,
    "column6": 3,
    "column7": "71_6",
    "column8": "71_7",
    "_extraData": {"rowSpan": {"column6": 4}}
}, {
    "column1": "72_0",
    "column2": "72_1",
    "column3": "72_2",
    "column4": 3,
    "column5": 1,
    "column6": 3,
    "column7": "72_6",
    "column8": "72_7",
    "_extraData": {"rowSpan": {"column5": 1, "column7": 3, "column8": 2}}
}, {
    "column1": "73_0",
    "column2": "73_1",
    "column3": "73_2",
    "column4": 2,
    "column5": 3,
    "column6": 1,
    "column7": "73_6",
    "column8": "73_7",
    "_extraData": {"rowSpan": {"column7": 5}}
}, {
    "column1": "74_0",
    "column2": "74_1",
    "column3": "74_2",
    "column4": 2,
    "column5": 3,
    "column6": 2,
    "column7": "74_6",
    "column8": "74_7",
    "_extraData": {"rowSpan": {"column7": 5}}
}, {
    "column1": "75_0",
    "column2": "75_1",
    "column3": "75_2",
    "column4": 1,
    "column5": 1,
    "column6": 3,
    "column7": "75_6",
    "column8": "75_7",
    "_extraData": {"rowSpan": {"column1": 2, "column3": 1}}
}, {
    "column1": "76_0",
    "column2": "76_1",
    "column3": "76_2",
    "column4": 2,
    "column5": 2,
    "column6": 3,
    "column7": "76_6",
    "column8": "76_7",
    "_extraData": {"rowSpan": {"column1": 1, "column8": 4}}
}, {
    "column1": "77_0",
    "column2": "77_1",
    "column3": "77_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "77_6",
    "column8": "77_7",
    "_extraData": {"rowSpan": {"column3": 5, "column6": 5}}
}, {
    "column1": "78_0",
    "column2": "78_1",
    "column3": "78_2",
    "column4": 2,
    "column5": 3,
    "column6": 1,
    "column7": "78_6",
    "column8": "78_7",
    "_extraData": {"rowSpan": {"column1": 4, "column4": 3, "column5": 5}}
}, {
    "column1": "79_0",
    "column2": "79_1",
    "column3": "79_2",
    "column4": 3,
    "column5": 1,
    "column6": 2,
    "column7": "79_6",
    "column8": "79_7",
    "_extraData": {"rowSpan": {"column4": 3, "column6": 5}}
}, {
    "column1": "80_0",
    "column2": "80_1",
    "column3": "80_2",
    "column4": 1,
    "column5": 2,
    "column6": 2,
    "column7": "80_6",
    "column8": "80_7",
    "_extraData": {"rowSpan": {"column1": 2, "column3": 3}}
}, {
    "column1": "81_0",
    "column2": "81_1",
    "column3": "81_2",
    "column4": 3,
    "column5": 1,
    "column6": 1,
    "column7": "81_6",
    "column8": "81_7"
}, {
    "column1": "82_0",
    "column2": "82_1",
    "column3": "82_2",
    "column4": 2,
    "column5": 1,
    "column6": 3,
    "column7": "82_6",
    "column8": "82_7",
    "_extraData": {"rowSpan": {"column7": 3}}
}, {
    "column1": "83_0",
    "column2": "83_1",
    "column3": "83_2",
    "column4": 4,
    "column5": 2,
    "column6": 1,
    "column7": "83_6",
    "column8": "83_7"
}, {
    "column1": "84_0",
    "column2": "84_1",
    "column3": "84_2",
    "column4": 3,
    "column5": 3,
    "column6": 1,
    "column7": "84_6",
    "column8": "84_7",
    "_extraData": {"rowSpan": {"column2": 3, "column3": 1, "column8": 2}}
}, {
    "column1": "85_0",
    "column2": "85_1",
    "column3": "85_2",
    "column4": 4,
    "column5": 2,
    "column6": 2,
    "column7": "85_6",
    "column8": "85_7",
    "_extraData": {"rowSpan": {"column5": 3}}
}, {
    "column1": "86_0",
    "column2": "86_1",
    "column3": "86_2",
    "column4": 3,
    "column5": 2,
    "column6": 2,
    "column7": "86_6",
    "column8": "86_7",
    "_extraData": {"rowSpan": {"column1": 5}}
}, {
    "column1": "87_0",
    "column2": "87_1",
    "column3": "87_2",
    "column4": 4,
    "column5": 1,
    "column6": 3,
    "column7": "87_6",
    "column8": "87_7",
    "_extraData": {"rowSpan": {"column1": 3}}
}, {
    "column1": "88_0",
    "column2": "88_1",
    "column3": "88_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "88_6",
    "column8": "88_7"
}, {
    "column1": "89_0",
    "column2": "89_1",
    "column3": "89_2",
    "column4": 3,
    "column5": 1,
    "column6": 1,
    "column7": "89_6",
    "column8": "89_7"
}, {
    "column1": "90_0",
    "column2": "90_1",
    "column3": "90_2",
    "column4": 2,
    "column5": 2,
    "column6": 2,
    "column7": "90_6",
    "column8": "90_7",
    "_extraData": {"rowSpan": {"column1": 4}}
}, {
    "column1": "91_0",
    "column2": "91_1",
    "column3": "91_2",
    "column4": 3,
    "column5": 2,
    "column6": 1,
    "column7": "91_6",
    "column8": "91_7",
    "_extraData": {"rowSpan": {"column3": 5, "column6": 4}}
}, {
    "column1": "92_0",
    "column2": "92_1",
    "column3": "92_2",
    "column4": 3,
    "column5": 1,
    "column6": 2,
    "column7": "92_6",
    "column8": "92_7",
    "_extraData": {"rowSpan": {"column4": 4, "column5": 5}}
}, {
    "column1": "93_0",
    "column2": "93_1",
    "column3": "93_2",
    "column4": 4,
    "column5": 1,
    "column6": 2,
    "column7": "93_6",
    "column8": "93_7",
    "_extraData": {"rowSpan": {"column8": 4}}
}, {
    "column1": "94_0",
    "column2": "94_1",
    "column3": "94_2",
    "column4": 1,
    "column5": 2,
    "column6": 1,
    "column7": "94_6",
    "column8": "94_7",
    "_extraData": {"rowSpan": {"column5": 4, "column7": 4}}
}, {
    "column1": "95_0",
    "column2": "95_1",
    "column3": "95_2",
    "column4": 2,
    "column5": 2,
    "column6": 2,
    "column7": "95_6",
    "column8": "95_7"
}, {
    "column1": "96_0",
    "column2": "96_1",
    "column3": "96_2",
    "column4": 4,
    "column5": 3,
    "column6": 3,
    "column7": "96_6",
    "column8": "96_7"
}, {
    "column1": "97_0",
    "column2": "97_1",
    "column3": "97_2",
    "column4": 3,
    "column5": 2,
    "column6": 2,
    "column7": "97_6",
    "column8": "97_7",
    "_extraData": {"rowSpan": {"column4": 3, "column7": 3}}
}, {
    "column1": "98_0",
    "column2": "98_1",
    "column3": "98_2",
    "column4": 2,
    "column5": 1,
    "column6": 2,
    "column7": "98_6",
    "column8": "98_7",
    "_extraData": {"rowSpan": {"column7": 2}}
}, {
    "column1": "99_0",
    "column2": "99_1",
    "column3": "99_2",
    "column4": 2,
    "column5": 3,
    "column6": 2,
    "column7": "99_6",
    "column8": "99_7",
    "_extraData": {"rowSpan": {"column6": 1}}
}, {
    "column1": "100_0",
    "column2": "100_1",
    "column3": "100_2",
    "column4": 1,
    "column5": 2,
    "column6": 1,
    "column7": "100_6",
    "column8": "100_7"
}]);
//	grid1.setRowList(dummy_data.rowList);
insertButton(grid1, $('#buttonList1'), $('#result1'));


//var grid2 = new ne.Grid({
//    el: $('#wrapper2'),
//    columnModelList: dummy_data.columnModel_2,
//    selectType: 'radio',
//    columnFixIndex: 7,
//    headerHeight: 110,
//    columnMerge: [
//        {
//            'columnName' : 'mergeColumn1',
//            'title' : '6 + 7',
//            'columnNameList' : ['columnName6', 'columnName7']
//        },
//        {
//            'columnName' : 'mergeColumn2',
//            'title' : '6 + 7 + 8',
//            'columnNameList' : ['mergeColumn1', 'columnName8']
//        },
//        {
//            'columnName' : 'mergeColumn3',
//            'title' : '6 + 7 + 8 + 9 + 10',
//            'columnNameList' : ['mergeColumn2', 'columnName9', 'columnName10']
//        }
//    ]
////		keyColumnName : 'columnName6'
//});
//getDummyData(dummy_data.columnModel_2, 5000, function(data) {
//    var start = new Date();
//    console.log('setRowListStart');
//    //grid2.setRowList(data);
//    var end = new Date();
//    console.log('setRowListEnd', end - start);
//});
//
////	grid2.setRowList(dummy_data.rowListTest);
//insertButton(grid2, $('#buttonList2'), $('#result2'));
//function getDummyData(columnModel, size, callback) {
//    //var url;
//    //
//    //if (window.navigator.userAgent.indexOf('MSIE ') !== -1) {
//    //    //url = './php/dummy.php';
//    //}else {
//    //    url = './php/dummy.php';
//    //    //url = 'http://budapest.kr.pe/sample/php/dummy.php';
//    //}
//    //url = 'http://fetech.nhnent.com/svnrun/fetech/prototype/trunk/grid/test/php/dummy.php';
//    //url = './php/dummy.php';
//    //console.log(url);
//    //$.ajax({
//    //    url: url,
//    //    data: {
//    //        columnModel: $.toJSON(columnModel),
//    //        size: size
//    //    },
//    //    dataType: 'json'
//    //}).done(function(data) {
//    //    console.log($.toJSON(data));
//    //    callback(data);
//    //});
//}

function insertButton(gridInstance, $wrapper, $result) {
    var printr = function(obj) {
        console.log(obj);
        $result.html($.toJSON(obj));
    };
    var actions = {
        'setColumnModelList' : function() {
            gridInstance.setColumnModelList(dummy_data.columnModel_2);
        },
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
            gridInstance.setColumnFixIndex(2);
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
        },
        'addCellClassName' : function() {
            gridInstance.addCellClassName(0, 'columnName1', 'test_class');
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        },
        'removeCellClassName' : function() {
            gridInstance.removeCellClassName(0, 'columnName1', 'test_class');
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        },
        'addRowClassName' : function() {
            gridInstance.addCellClassName(1, 'test_row_class');
//            gridInstance.setColumnValue('columnName1', '<script/>');
//            gridInstance.sort('columnName5');
        },
        'removeRowClassName' : function() {
            gridInstance.removeCellClassName(1, 'test_row_class');
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
