# 기여 가이드

[English](./CONTRIBUTING.en.md)

JD-Sync 개선에 관심을 가져 주셔서 감사합니다. 이 프로젝트는 한국어 사용자를 기본 대상으로 하므로 문서와 사용자-facing 문구는 한국어를 우선합니다. 필요할 때 영어 문서를 함께 둡니다.

## 브랜치 흐름

권장 흐름은 아래와 같습니다.

- `main`: 배포 가능한 안정 버전만 둡니다.
- `develop`: 다음 릴리스를 준비하는 통합 브랜치입니다.
- `feature/*`: 기능, 문서, 수정 작업 단위 브랜치입니다.

보통 `feature/*`에서 작업한 뒤 `develop`으로 pull request를 보내고, 릴리스 준비가 끝나면 `develop`을 `main`으로 병합합니다.

## 개발 절차

1. 저장소를 fork하거나 브랜치를 만듭니다.
2. 작업 목적이 드러나는 브랜치를 만듭니다. 예: `feature/jasoseol-sync`
3. 변경 범위를 작게 유지합니다.
4. UI 변경이 있으면 스크린샷이나 짧은 설명을 pull request에 포함합니다.
5. JavaScript를 수정했다면 로컬 문법 검사를 실행합니다.

## 로컬 검사

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

## 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따르되 제목과 본문은 한국어로 작성해도 됩니다.

```text
type(scope): 한글 제목

- 변경 이유를 설명합니다.
- 주요 동작, 위험, 후속 작업을 적습니다.
```

자주 쓰는 타입은 아래와 같습니다.

- `feat`: 사용자에게 보이는 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `chore`: 저장소 관리, 설정, 빌드 산출물 정리
- `refactor`: 동작 변경 없는 코드 구조 개선
- `test`: 테스트 변경

예시:

```text
feat(sync): 자소설 즐겨찾기 감지 추가

- 페이지 컨텍스트의 즐겨찾기 API 성공 응답을 감지합니다.
- Notion으로 보내기 전에 공고 상세 메타데이터를 정리합니다.
```

## Pull Request 체크리스트

- `chrome://extensions`에서 압축 해제된 확장 프로그램이 manifest 오류 없이 로드됩니다.
- Notion 토큰이 없을 때 확장 프로그램을 열면 설정 가이드가 자동으로 열립니다.
- Notion 토큰 저장 후에는 확장 프로그램을 열어도 가이드가 자동으로 열리지 않습니다.
- 자소설 공고 상세 페이지에서 수동 동기화가 동작합니다.
- 자동 동기화가 같은 자소설 공고 ID를 중복 생성하지 않습니다.
- 새 권한을 추가했다면 `README.md`와 `PRIVACY.md`에 설명했습니다.
- 사용자에게 보이는 문구는 한국어 기준으로 자연스럽게 작성했습니다.
