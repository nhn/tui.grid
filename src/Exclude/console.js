// IE 테스트용 코드. 개발 완료후 master 로 전환시 제거 함.
if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};