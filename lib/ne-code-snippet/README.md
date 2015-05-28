CodeSnippet
======================
코드 스니펫<br>
CodeSnippet이란, <br>
타입체크나 배열처리와 같이 **자주 사용되는 코드 조각**을 모아둔 것으로,<br>
아래와 같은 종류의 CodeSnippet이 존재하며 지속적으로 지속적으로 업데이트하고 있습니다.<br>
FE개발팀에서 배포하는 모든 컴포넌트 및 Application은 **가독성과 중복코드 방지**를 위해 CodeSnippet을 사용하며,<br>
기본적인 네임스페이스는 **ne.util**을 사용합니다.<br>
(네임스페이스는 서비스의 성격에 따라 재정의하여 사용할 수 있습니다.)<br>

## Feature
* browser.js
  * 브라우저 종류 및 버전 검출 모듈
* collection.js
 * 콜렉션 처리 모듈
 * 콜렉션를 쉽게 처리할 수 있는 유틸성 메소드를 제공
* customEvent.js
 * 커스텀이벤트 모듈
 * 커스텀 이벤트를 추가/제거 및 발생시켜 컴포넌트의 확장기능을 구현할 수 있도록 함
* defineClass.js
 * 클래스 정의 및 상속 모듈
* enum.js
 * 중복되지 않는 임의의 값을 갖는 상수목록을 다루는 모듈
 * IE8이하를 제외한 모던브라우저에서는 한번 결정된 값은 추후 변경 불가
* func.js
 * 함수 처리 모듈
 * 처리를 쉽게 처리할 수 있는 유틸성 메소드를 제공
* hashMap.js
 * 해시맵 모듈
 * key/value로 데이터를 관리
* inheritance.js
  * 간단한 상속 모듈 (Nicholas C. Zakas, YUI Library)
  * 부모 생성자를 명시적으로 호출
  * 자식 프로토타입 메서드를 구현하기 전에 상속받아야 함
  * 믹스인 방법과 내부객체로 저장하여 사용
* object.js
 * 객체 처리 모듈
 * 객체를 쉽게 처리할 수 있는 유틸성 메소드를 제공
* string.js
 * 문자열 처리 모듈
 * decodeHTMLEntity, encodeHTMLEntity 등의 유틸성 메소드를 제공
* type.js
 * 변수 타입체크 모듈
* window.js
 * 윈도우 팝업등 window객체와 관련 모듈
 * IE11에서 POST를 사용해 팝업에 값을 전달시 postDataBridgeUrl 설정 필요
 * 다른 도메인을 팝업으로 띄울 경우 보안 문제로 팝업 컨트롤 불가

## CodeSnippet 사용법
* 전체 CodeSnippet 모듈이 빌드된 파일 사용하기
 * [[master branch]](https://github.com/nhnent/fe.code-snippet/tree/master)에서 code-snippet.js 또는 code-snippet.min.js을 다운로드 받아 사용
 * 혼란을 줄이기위해 파일명(code-snippet.js 또는 code-snippet.min.js)은 그대로 사용하기를 권장
* 필요한 부분만 복사하여 사용하기
 * 각 모듈에 명시된 **의존성을 확인**하여 필요한 모듈을 함께 복사해서 사용
 * 가급적이면 유지보수 등의 관리를 위하여 빌드된 버전 사용을 권장
* 자세한 사용법은 별도의 문서로 3월중 배포 예정

## Documentation
* **API** - https://nhnent.github.io/fe.code-snippet/1.0.0/
* **Tutorial** - https://github.com/nhnent/fe.javascript/wiki/FE-CodeSnippet

## Test environment
* browser :
   * IE7~11
   * Chrome
   * Firefox

## Download/Install
* Bower:
   * 최신버전 : `bower install ne-code-snippet#master`
   * 특정버전 : `bower install ne-code-snippet[#tag]`
* Download: https://github.com/nhnent/fe.code-snippet


## History
| Version | Description | Date | Developer |
| ---- | ---- | ---- | ---- |
| 1.0.1 | isExisty 스펙 변경, pick 메서드 추가, type 체크 변경 | 2015.04 | FE개발팀 |
| <a href="https://nhnent.github.io/fe.code-snippet/1.0.0/">1.0.0</a> | jquery dependency 제거 | 2015.03 | FE개발팀 |
| 0.1.0 | 최초개발 | 2014.09 | FE개발팀 |
"
