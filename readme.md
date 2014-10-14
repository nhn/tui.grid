# FE개발팀 프로젝트 스캐폴딩

## 주의

새 프로젝트를 만드실 때 프로젝트의 형태에 따라 구성이 맞지 않을 수 있으므로 꼭 각 설정파일 내부 프로젝트명등의 설정을 살펴보시기 바랍니다. (FIXME 로 적어두긴 했습니다)

## 사용법

프로젝트를 생성할 때 팀 내에서 기본적으로 사용하는 테스팅, 의존성관리 프레임웍에 대한 설정 파일을 예제와 같은 형태로 만들어둔 리포지토리입니다.

이 스캐폴딩은 다운받아서 사용하시는걸 권장드리고, clone을 하신 경우라면 버전관리가 되지 않도록 ```git remote rm origin``` 을 통해 끊어주시기 바랍니다.

## 구성되어 있는 프레임워크 리스트

- Bower (클라이언트 스크립트 의존성 관리)
- NPM (NodeJS 모듈 의존성 관리)
- Karma (테스트 러너)
- RequireJS (AMD 테스트, 소스 압축)
- Grunt (태스크 러너)
- jsdoc3 (문서화 도구)

## 사전준비

필요 바이너리 설치

1. NodeJS
2. Karma ```npm install -g karma```
3. grunt-cli ```npm install -g grunt-cli```
4. gjslint
 1. python 2.7.4
 2. easy_install

## 파일 설명

### package.json

- NodeJS 모듈에 대한 의존성 기술

- 프로젝트 이름 및 설명, 참여자 기술

### karma.conf.json

- Karma 테스트 설정 기술

### .gjslintrc

- Google Closure Linter 의 lint 옵션 설정 파일

### .gitignore

- git 버전관리가 필요하지 않은 디렉토리/파일 목록

### conf.json

- jsdoc3 문서 생성 시 옵션 파일

### Gruntfile.js

- grunt 태스크 러너의 설정파일
- 현재 파일 수정되었을 때 브라우저를 새로고침해주는 livereload설정이 기술되어 있음.

#### bower.json

- 클라이언트 스크립트 의존성 관리도구의 설정 파일
- jquery 1.8.3, json2-js, raphael, requirejs, almond 의 의존성이 예제로 기술되어 있음.
- npm과 비슷하게 ```bower install```로 의존성 라이브러리 한번에 설치 가능

#### .bowerrc

- bower의 의존성 라이브러리들이 들어갈 폴더의 위치가 기술되어 있음.
