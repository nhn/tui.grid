    var Util = {
        getTBodyHeight : function(rowCount, rowHeight){
            return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
        },
        getDisplayRowCount : function(tbodyHeight, rowHeight){
            return Math.ceil((tbodyHeight - 1) / (rowHeight + 1));
        },
        getRowHeight : function(rowCount, tbodyHeight){
            return Math.floor( ((tbodyHeight - 1) / rowCount ));
        },
        /**
         * Create unique key
         * @return {string}
         * @private
         */
        getUniqueKey: function() {
            var rand = String(parseInt(Math.random() * 10000000000, 10));
            return new Date().getTime() + rand;
        },
        /**
         * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
         * @method decodeHTMLEntity
         * @param {String} html HTML Entity 타입의 문자열
         * @return {String} 원래 문자로 변환된 문자열
         * @example
         var htmlEntityString = "A &#039;quote&#039; is &lt;b&gt;bold&lt;/b&gt;"
         var result = pug.utility.decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
         */
        decodeHTMLEntity : function(html){
            var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
            return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0){
                return entities[m0]? entities[m0]:m0;
            });
        },
        /**
         * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
         * @method encodeHTMLEntity
         * @param {String} html 문자열
         * @return {String} html HTML Entity 타입의 문자열로 변환된 문자열
         * @example
         var htmlEntityString = "<script> alert('test');</script><a href='test'>"
         var result = pug.utility.encodeHTMLEntity(htmlEntityString); //결과값 : "&lt;script&gt; alert('test');&lt;/script&gt;&lt;a href='test'&gt;"
         */
        encodeHTMLEntity : function(str){
            var entities = {'"':'quot','&':'amp','<':'lt','>':'gt','\'':'#39'};
            return str.replace(/[<>&"']/g, function(m0){
                return entities[m0]?'&'+entities[m0]+';':m0;
            });
        }
    };