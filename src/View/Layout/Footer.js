    View.Layout.Footer = View.Base.extend({
        tagName: 'div',
        template: _.template('' +
            '<div class="toolbar" style="display: none;">' +
            '    <div class="btn_setup">' +
            '        <a href="#" class="excel_download_button btn_text excel_all" style="display: inline-block;"><span><em class="f_bold p_color5">전체엑셀다운로드</em></span></a>' +
            '        <a href="#" class="excel_download_button btn_text excel_grid" style="display: inline-block;"><span><em class="excel">엑셀다운로드</em></span></a>' +
            '        <a href="#" class="grid_configurator_button btn_text" style="display: none;"><span><em class="grid">그리드설정</em></span></a>' +
            '    </div>' +
            '    <div class="height_resize_bar">' +
            '        <a href="#" class="height_resize_handle">높이 조절</a>' +
            '    </div>' +
            '</div>'),
        className: 'footer',
        render: function() {
            this.$el.html('footer');
            return this;

        }
    });
