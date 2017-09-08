// var saleStatusType = {
//     ONSALE: '판매중',
//     STOP: '판매중지',
//     PROHIBITION: '판매금지'
// };
// var frontDisplayYn = {
//     Y: '전시가능',
//     N: '전시안함'
// };
// var productRestUrl = {
//     base: '/products',
//     getProducts: '/products/search',
//     updateProducts: '/products/grid',
//     downloadCsv: '/products/downloadCsvMallProducts',
//     downloadCsvAll: '/products/downloadCsvAllMallProducts'
// };
// var beforeApprovalStatus = ['REGISTRATION_READY', 'APPROVAL_READY', 'APPROVAL_REJECTION', 'SALE_AGREEMENT_REJECTION'];
// var doNotDeleteProduct = ['FINISHED', 'AFTER_APPROVAL_READY', 'AFTER_APPROVAL_REJECTION'];
// var dontModifyStatus = ['FINISHED', 'PROHIBITION'];
// var dontCopyStatus = ['PROHIBITION'];
// var registrationReady = 'REGISTRATION_READY';
// var isBPC = _.isEqual($('#type').val(), 'PARTNER');
//
// var columnModel = {
//     modifyBtn: {
//         title: '<b>수정</b>',
//         name: 'modifyBtn',
//         minWidth: 50,
//         align: 'center',
//         formatter(value, row) {
//             let text = '수정';
//             if (dontModifyStatus.includes(row.saleStatusType)) {
//                 text = '보기';
//             }
//             return `<a href="javascript:;" class="modifyMallProductBtn" data-url="/product/edit/${row.mallProductNo}?isRestore=true">${text}</a>`;
//         }
//     },
//     copyBtn: {
//         title: '<b>복사</b>',
//         name: 'copyBtn',
//         minWidth: 50,
//         align: 'center',
//         formatter(value, row) {
//             if (!dontCopyStatus.includes(row.saleStatusType) && row.masterYn === 'Y') {
//                 return `<a href="javascript:;" class="copyMallProduct" data-mall-product-no="${row.mallProductNo}">복사</a>`;
//             }
//             return '복사';
//         }
//     },
//     mallName: {
//         title: '<b>쇼핑몰</b>',
//         name: 'mallName',
//         minWidth: 100,
//         align: 'center'
//     },
//     mallProductNo: {
//         title: '<b>상품번호</b>',
//         name: 'mallProductNo',
//         minWidth: 90,
//         align: 'center',
//         formatter(value, row) {
//             if (row.stockSyncYn === 'Y') {
//                 if (row.masterYn === 'Y') {
//                     return `<a href="javascript:;" class="gridMasterProductBtn" data-mall-product-no="${row.mallProductNo}" data-product-no="${row.productNo}">(M) </a>${value}`;
//                 }
//
//                 return `<a href="javascript:;" class="gridMasterProductBtn" data-mall-product-no="${row.mallProductNo}" data-product-no="${row.productNo}">(S) </a>${value}`;
//             }
//
//             return value;
//         }
//     },
//     productManagementCd: {
//         title: '<b>판매자관리코드</b>',
//         name: 'productManagementCd',
//         align: 'center'
//     },
//     mallProductName: {
//         title: '<b>상품명</b>',
//         name: 'productName',
//         minWidth: 200,
//         align: 'left',
//         editOptions: {
//             type: 'text',
//             useViewMode: true,
//             converter(value, row) {
//                 if (dontModifyStatus.includes(row.saleStatusType)) {
//                     return value;
//                 }
//
//                 return false;
//             },
//         },
//         onAfterChange(e) {
//             var mallProductNo = e.rowKey;
//             var mallNo = ncp.product.result.grid.getRow(mallProductNo).mallNo;
//             let error = false;
//
//             $.ajax({
//                 url: `${productRestUrl.base}/${mallProductNo}/productName`,
//                 type: 'PUT',
//                 async: false,
//                 contentType: 'application/json',
//                 dataType: 'json',
//                 data: JSON.stringify({
//                     mallNo,
//                     mallProductName: e.value
//                 }),
//                 success(response) {
//                     if (response.result === 'SUCCESS') {
//                         alert('수정되었습니다.');
//                     } else {
//                         if (response.result === 'REGISTRATION_READY') {
//                             alert('등록대기 상품의 상품명 변경은 상품수정페이지를 이용해주세요.');
//                         } else {
//                             alert('판매금지 상품의 상품명은 변경할 수 없습니다.');
//                         }
//                         error = true;
//                     }
//
//                     ncp.product.result.callbackProductModify(response.list);
//                 },
//                 error() {
//                     alert('상품명 변경에 실패하였습니다');
//                     error = true;
//                 }
//             });
//
//             if (error) {
//                 e.stop();
//             }
//         }
//     },
//     promotionText: {
//         title: '<b>홍보문구</b>',
//         name: 'promotionText',
//         minWidth: 110,
//         align: 'center'
//     },
//     brandName: {
//         title: '<b>브랜드</b>',
//         name: 'brandName',
//         minWidth: 120,
//         align: 'left'
//     },
//     saleMethodType: {
//         title: '<b>판매방식</b>',
//         name: 'saleMethodType',
//         align: 'center',
//         ignored: true
//     },
//     partnerName: {
//         title: '<b>파트너사</b>',
//         name: 'partnerName',
//         align: 'left'
//     },
//     adminName: {
//         title: '<b>담당자</b>',
//         name: 'adminName',
//         align: 'center'
//     },
//     commissionRate: {
//         title: '<b>수수료</b>',
//         name: 'commissionRate',
//         align: 'center',
//         formatter(value) {
//             return `${value}%`;
//         }
//     },
//     applyStatusType: {
//         title: '<b>승인상태</b>',
//         name: 'applyStatusType',
//         minWidth: 120,
//         align: 'center',
//         ignored: true,
//         formatter(value, row) {
//             if (row.productApplyStatusType === 'APPROVAL_REJECTION' || row.productApplyStatusType === 'AFTER_APPROVAL_REJECTION') {
//                 return `<a href="javascript:;" name="viewJudgementRejectBtn" data-mall-product-no="${row.mallProductNo}" data-apply-status="${row.productApplyStatusType}">${value}</a>`;
//             } else if (row.productApplyStatusType === 'AFTER_APPROVAL_READY') {
//                 return `<a href="javascript:;" name="viewJudgementBtn" data-mall-product-no="${row.mallProductNo}">${value}</a>`;
//             } else if (row.productApplyStatusType === 'SALE_AGREEMENT_REJECTION' || row.productApplyStatusType === 'AFTER_FINISHED_SALE_AGREEMENT_REJECTION') {
//                 return `<a href="javascript:;" name="viewAgreementRejectBtn" data-mall-product-no="${row.mallProductNo}">${value}</a>`;
//             }
//
//             return value;
//         }
//     },
//     saleStatusType: {
//         title: '<b>판매상태</b>',
//         name: 'saleStatusType',
//         minWidth: 160,
//         align: 'center',
//         formatter(value, row) {
//             if (_.contains(beforeApprovalStatus, row.productApplyStatusType)) {
//                 return '-';
//             }
//
//             if (value === 'READY') {
//                 return '판매대기';
//             } else if (value === 'FINISHED') {
//                 return '판매종료';
//             }
//
//             var selectBox = $('<select />', {
//                 'class': 'gridSaleStatusType',
//                 'data-mall-product-no': row.mallProductNo,
//                 'data-mall-no': row.mallNo,
//                 'data-current-val': value
//             });
//
//             $.each(saleStatusType, (key, text) => {
//                 $(selectBox).append($('<option></option>').attr('value', key).attr('selected', (value === key) ? 'selected' : null).text(text));
//             });
//
//             if (value === 'PROHIBITION') {
//                 selectBox.prop('disabled', true);
//             }
//
//             return selectBox.prop('outerHTML');
//         }
//     },
//     frontDisplayYn: {
//         title: '<b>전시상태</b>',
//         name: 'frontDisplayYn',
//         minWidth: 160,
//         align: 'center',
//         formatter(value, row) {
//             let selectedValue = value;
//             var isFinished = row.isBeforeFinished;
//             var selectBox = $('<select />', {
//                 'class': 'gridFrontDisplayYn',
//                 'data-mall-product-no': row.mallProductNo,
//                 'data-mall-no': row.mallNo
//             });
//
//             if (isFinished) {
//                 selectedValue = 'N';
//             }
//
//             $.each(frontDisplayYn, (key, text) => {
//                 $(selectBox).append($('<option></option>').attr('value', key).attr('selected', (selectedValue === key) ? 'selected' : null).text(text));
//             });
//
//             if (isFinished || row.saleStatusType === 'PROHIBITION') {
//                 selectBox.prop('disabled', true);
//             }
//
//             return selectBox.prop('outerHTML');
//         }
//     },
//     salePeriod: {
//         title: '<b>판매기간</b>',
//         name: 'salePeriod',
//         minWidth: 250,
//         align: 'center'
//     },
//     salePrice: {
//         title: '<b>판매가</b>',
//         name: 'salePrice',
//         align: 'right',
//         formatter(value, row) {
//             return ncp.util.getCurrency(value, row.countryCd === 'US');
//         }
//     },
//     immediateDiscountValue: {
//         title: '<b>즉시할인</b>',
//         name: 'immediateDiscountValue',
//         align: 'right',
//         formatter(value, row) {
//             return ncp.util.getCurrency(row.immediateDiscountAmount, row.countryCd === 'US');
//         }
//     },
//     discountApplyPrice: {
//         title: '<b>할인적용가</b>',
//         name: 'discountApplyPrice',
//         align: 'right',
//         formatter(value, row) {
//             return ncp.util.getCurrency(value, row.countryCd === 'US');
//         }
//     },
//     additionalDiscountAmt: {
//         title: '<b>추가할인</b>',
//         name: 'additionalDiscountAmt',
//         align: 'right'
//     },
//     additionalDiscountApplyPrice: {
//         title: '<b>추가할인 적용가</b>',
//         name: 'additionalDiscountApplyPrice',
//         align: 'right'
//     },
//     stockCnt: {
//         title: '<b>재고수량</b>',
//         name: 'stockCnt',
//         minWidth: 100,
//         align: 'right',
//         editOptions: {},
//         formatter(value, row, column) {
//             if (row.masterYn === 'Y') {
//                 column.editOptions.type = 'text';
//             }
//
//             let representCnt = parseInt(row.representStockCnt);
//             if (representCnt == 0) {
//                 representCnt = '품절';
//             }
//
//             if (parseInt(row.notRepresentCnt, 10) > 0) {
//                 return `${representCnt} (${value})`;
//             }
//
//             return `${representCnt}`;
//         }
//     },
//     saleCnt: {
//         title: '<b>판매수량</b>',
//         name: 'saleCnt',
//         align: 'right'
//     },
//     optionBtn: {
//         title: '<b>옵션</b>',
//         name: 'optionBtn',
//         minWidth: 50,
//         align: 'center',
//         formatter(value, row) {
//             let text = '수정';
//             if (row.optionUseYn === 'Y') {
//                 if (dontModifyStatus.includes(row.saleStatusType)) {
//                     text = '보기';
//                 } else if (row.saleStatusType === registrationReady) {
//                     return '-';
//                 }
//             } else {
//                 return '-';
//             }
//
//             return `<a href="javascript:;" class="gridModifyOption" data-row-key="${row.rowKey}">${text}</a>`;
//         }
//     },
//     additionalProductBtn: {
//         title: '<b>추가상품</b>',
//         name: 'additionalProductBtn',
//         minWidth: 70,
//         align: 'center',
//         formatter(value, row) {
//             let text = '수정';
//             if (parseInt(row.additionalProductCnt) > 0) {
//                 if (dontModifyStatus.includes(row.saleStatusType)) {
//                     text = '보기';
//                 } else if (row.saleStatusType === registrationReady) {
//                     return '-';
//                 }
//             } else {
//                 return '-';
//             }
//
//             return `<a href="javascript:;" class="gridModifyAdditionalProduct" data-row-key="${row.rowKey}">${text}</a>`;
//         }
//     },
//     promotionYn: {
//         title: '<b>프로모션 적용</b>',
//         name: 'promotionYn',
//         minWidth: 100,
//         align: 'center',
//         formatter(value, row) {
//             if (row.saleStatusType === registrationReady || dontModifyStatus.includes(row.saleStatusType)) {
//                 return value;
//             }
//
//             return `<a href="javascript:;" data-mall-product-no="${row.mallProductNo}" class="gridPromotionYn" data-is-promotion="${value}">${value}</a>`;
//         }
//     },
//     imageUrl: {
//         title: '<b>대표이미지</b>',
//         name: 'imageUrl',
//         align: 'center',
//         formatter(value, row) {
//             let text = '수정';
//             let addParam = '';
//
//             if (dontModifyStatus.includes(row.saleStatusType)) {
//                 text = '보기';
//                 addParam = '?readonly=true';
//             } else if (row.saleStatusType === registrationReady) {
//                 return '-';
//             }
//
//             return `<a href="javascript:ncp.popup('/product/popup/edit/${row.mallProductNo}/images${addParam}', '이미지 변경', 900, 700);">${text}</a>`;
//         }
//     },
//     productDuty: {
//         title: '<b>상품정보고시</b>',
//         name: 'productDuty',
//         minWidth: 100,
//         align: 'center',
//         formatter(value, row) {
//             let text = '수정';
//             if (dontModifyStatus.includes(row.saleStatusType)) {
//                 text = '보기';
//             } else if (row.saleStatusType === registrationReady) {
//                 return '-';
//             }
//
//             return `<a href="javascript:;" class="gridProductDuty" data-mall-product-no="${row.mallProductNo}">${text}</a>`;
//         }
//     },
//     comparingPriceSite: {
//         title: '<b>가격비교사이트 등록</b>',
//         name: 'comparingPriceSite',
//         minWidth: 110,
//         align: 'center',
//         formatter(value, row) {
//             var siteYn = (_.isEmpty(value)) ? 'N' : 'Y';
//             if (row.saleStatusType === registrationReady || dontModifyStatus.includes(row.saleStatusType)) {
//                 return siteYn;
//             }
//
//             return `<a href="javascript:ncp.popup('/product/popup/comparingPriceSite?mallProductNo=${row.mallProductNo}', '가격비교사이트 등록', 900, 260);">${siteYn}</a>`;
//         }
//     },
//     changeHistory: {
//         title: '<b>상품정보 변경이력</b>',
//         name: 'changeHistory',
//         minWidth: 120,
//         align: 'center',
//         formatter(value, row) {
//             return `<a href="javascript:;" class="gridProductChangeHistory" data-mall-product-no=${row.mallProductNo}>보기</a>`;
//         }
//     },
//     displayCategoryFullname: {
//         title: '<b>전시카테고리</b>',
//         name: 'displayCategoryFullname',
//         minWidth: 250,
//         align: 'left',
//         formatter(value, row) {
//             if (_.isEmpty(value)) {
//                 return null;
//             }
//
//             return `<a href="javascript:;" class="gridDisplayCategoryFullname" data-mall-product-no="${row.mallProductNo}">${value.split('|')[0]}</a>`;
//         }
//     },
//     groupType: {
//         title: '<b>상품군</b>',
//         name: 'groupType',
//         minWidth: 110,
//         align: 'center',
//         ignored: true
//     },
//     shippingAreaType: {
//         title: '<b>배송구분</b>',
//         name: 'shippingAreaType',
//         minWidth: 110,
//         align: 'center',
//         ignored: true
//     },
//     deliveryConditionType: {
//         title: '<b>배송비유형</b>',
//         name: 'deliveryConditionType',
//         minWidth: 120,
//         align: 'center',
//         ignored: true
//     },
//     deliveryAmt: {
//         title: '<b>배송비</b>',
//         name: 'deliveryAmt',
//         minWidth: 80,
//         align: 'center',
//         ignored: true,
//         formatter(value, row) {
//             if (row.deliveryAmt === null) {
//                 return '무료';
//             }
//
//             return ncp.util.getCurrency(row.deliveryAmt, row.countryCd === 'US');
//         }
//     },
//     deliveryCombinationYn: {
//         title: '<b>묶음배송</b>',
//         name: 'deliveryCombinationYn',
//         align: 'center',
//         ignored: true
//     },
//     deleteBtn: {
//         title: '<b>삭제요청</b>',
//         name: 'deleteBtn',
//         minWidth: 70,
//         align: 'center',
//         formatter(value, row) {
//             if (isBPC) {
//                 if (row.productApplyStatusType === 'REGISTRATION_READY') {
//                     return `<button class="deleteMallProduct" data-mall-no="${row.mallNo}" data-mall-product-no="${row.mallProductNo}">삭제</button>`;
//                 }
//             } else {
//                 if (!row.isOnSale && !doNotDeleteProduct.includes(row.productApplyStatusType)) {
//                     return `<button class="deleteMallProduct" data-mall-no="${row.mallNo}" data-mall-product-no="${row.mallProductNo}">삭제</button>`;
//                 }
//             }
//         }
//     }
// };
var columnModel = [{"title":"<b>수정</b>","name":"modifyBtn","minWidth":50,"align":"center"},{"title":"<b>복사</b>","name":"copyBtn","minWidth":50,"align":"center"},{"ignored":false,"name":"mallName","relationList":[],"minWidth":100,"align":"center","title":"<b>쇼핑몰</b>"},{"ignored":false,"name":"mallProductNo","relationList":[],"minWidth":90,"align":"center","title":"<b>상품번호</b>"},{"ignored":false,"editOptions":{"type":"text"},"name":"productName","relationList":[],"minWidth":200,"align":"left","title":"<b>상품명</b>"},{"ignored":false,"name":"promotionText","relationList":[],"minWidth":110,"align":"center","title":"<b>홍보문구</b>"},{"ignored":false,"name":"brandName","relationList":[],"minWidth":120,"align":"left","title":"<b>브랜드</b>"},{"ignored":true,"name":"saleMethodType","relationList":[],"minWidth":70,"align":"center","title":"<b>판매방식</b>"},{"ignored":false,"name":"partnerName","relationList":[],"minWidth":70,"align":"center","title":"<b>파트너사</b>"},{"ignored":false,"name":"adminName","relationList":[],"minWidth":70,"align":"center","title":"<b>담당자</b>"},{"ignored":false,"name":"commissionRate","relationList":[],"minWidth":70,"align":"center","title":"<b>수수료</b>"},{"ignored":true,"name":"applyStatusType","relationList":[],"minWidth":120,"align":"center","title":"<b>승인상태</b>"},{"ignored":false,"name":"saleStatusType","relationList":[],"minWidth":160,"align":"center","title":"<b>판매상태</b>"},{"ignored":false,"name":"frontDisplayYn","relationList":[],"minWidth":160,"align":"center","title":"<b>전시상태</b>"},{"ignored":false,"name":"salePeriod","relationList":[],"minWidth":250,"align":"center","title":"<b>판매기간</b>"},{"ignored":false,"name":"salePrice","relationList":[],"minWidth":70,"align":"right","title":"<b>판매가</b>"},{"ignored":false,"name":"immediateDiscountValue","relationList":[],"minWidth":70,"align":"right","title":"<b>즉시할인</b>"},{"ignored":false,"name":"discountApplyPrice","relationList":[],"minWidth":70,"align":"right","title":"<b>할인적용가</b>"},{"ignored":false,"name":"additionalDiscountAmt","relationList":[],"minWidth":70,"align":"right","title":"<b>추가할인</b>"},{"ignored":false,"name":"additionalDiscountApplyPrice","relationList":[],"minWidth":70,"align":"right","title":"<b>추가할인 적용가</b>"},{"ignored":false,"editOptions":{"type":"text"},"name":"stockCnt","relationList":[],"minWidth":100,"align":"right","title":"<b>재고수량</b>"},{"ignored":false,"name":"saleCnt","relationList":[],"minWidth":70,"align":"right","title":"<b>판매수량</b>"},{"title":"<b>옵션</b>","name":"optionBtn","minWidth":50,"align":"center"},{"title":"<b>추가상품</b>","name":"additionalProductBtn","minWidth":70,"align":"center"},{"ignored":false,"name":"promotionYn","relationList":[],"minWidth":100,"align":"center","title":"<b>프로모션 적용</b>"},{"ignored":false,"name":"imageUrl","relationList":[],"minWidth":70,"align":"center","title":"<b>대표이미지</b>"},{"title":"<b>상품정보고시</b>","name":"productDuty","minWidth":100,"align":"center"},{"ignored":false,"name":"comparingPriceSite","relationList":[],"minWidth":110,"align":"center","title":"<b>가격비교사이트 등록</b>"},{"title":"<b>상품정보 변경이력</b>","name":"changeHistory","minWidth":120,"align":"center"},{"ignored":false,"name":"displayCategoryFullname","relationList":[],"minWidth":250,"align":"left","title":"<b>전시카테고리</b>"},{"ignored":true,"name":"groupType","relationList":[],"minWidth":110,"align":"center","title":"<b>상품군</b>"},{"ignored":true,"name":"shippingAreaType","relationList":[],"minWidth":110,"align":"center","title":"<b>배송구분</b>"},{"ignored":true,"name":"deliveryConditionType","relationList":[],"minWidth":120,"align":"center","title":"<b>배송비유형</b>"},{"ignored":true,"name":"deliveryAmt","relationList":[],"minWidth":80,"align":"center","title":"<b>배송비</b>"},{"ignored":true,"name":"deliveryCombinationYn","relationList":[],"minWidth":70,"align":"center","title":"<b>묶음배송</b>"},{"title":"<b>삭제요청</b>","name":"deleteBtn","minWidth":70,"align":"center"}];
