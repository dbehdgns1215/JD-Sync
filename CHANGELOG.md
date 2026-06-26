# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-06-27

### Added

- Chrome Manifest V3 기반 JD-Sync 확장 프로그램을 추가했습니다.
- 자소설닷컴 공고 즐겨찾기 추가/해제 동작 감지를 추가했습니다.
- 자소설닷컴 공고의 회사명, 공고명, 직무, 시작일, 마감일, 공고 URL, 지원 URL, 공고 ID 메타데이터 추출을 추가했습니다.
- Notion Data Source ID와 Notion API `2025-09-03` 버전 기준 동기화를 추가했습니다.
- Notion 데이터베이스 속성명과 동기화 옵션을 관리하는 설정 페이지를 추가했습니다.
- 즐겨찾기한 공고를 Notion 데이터베이스 페이지로 생성하는 동기화를 추가했습니다.
- 즐겨찾기 해제 시 JD-Sync가 생성한 Notion 일정 페이지를 정리하는 동기화 해제를 추가했습니다.
- 시작일을 캘린더에 표시하기 위한 범위 저장 방식과 별도 `[시작]` 일정 생성 방식을 추가했습니다.
- 설정 상태와 최근 동기화 기록을 확인할 수 있는 확장 프로그램 팝업을 추가했습니다.
- 이용 조건 및 개인정보 처리방침 동의 절차를 추가했습니다.
- README, 이용 조건, 개인정보 처리방침, 보안 정책, 기여 가이드, 지원 문서, Chrome Web Store 배포 문서를 추가했습니다.
- 기본 세팅 가이드용 썸네일 이미지를 추가했습니다.
- GitHub issue template과 pull request template을 추가했습니다.

### Changed

- 확장 프로그램 표시 이름을 `JD-Sync`로 통일했습니다.
- Notion Calendar 표시 기준 날짜를 기본적으로 마감일로 저장하도록 정리했습니다.
- 설정 기본값을 `공고명`, `회사명`, `직무`, `시작일`, `마감일`, `일정`, `공고 URL`, `지원 URL`, `공고 ID` 기준으로 정리했습니다.
- 한국어 README를 기본 문서로 두고 영어 README를 별도 문서로 분리했습니다.

### Fixed

- Notion Data Source ID와 Database ID가 혼동되지 않도록 안내 문구를 정리했습니다.
- Notion 속성 타입 오류를 사용자가 이해할 수 있는 문구로 안내하도록 개선했습니다.
- 확장 프로그램 업데이트 후 기존 자소설닷컴 탭에서 발생할 수 있는 runtime context 오류 안내를 개선했습니다.
- 여러 공고를 연속으로 즐겨찾기하거나 해제할 때 동기화 기록이 꼬이지 않도록 안정화했습니다.
- Notion 대상이 바뀌었을 때 기존 공고 ID 기록 때문에 중복으로 오판하지 않도록 중복 기준을 정리했습니다.
- 팝업과 설정 페이지에서 런타임 메시지 실패가 처리되지 않는 문제를 보강했습니다.
