# JD-Sync

[English](./README.en.md)

채용 사이트에서 사용자가 직접 즐겨찾기한 공고의 일부 일정 정보를 Notion 데이터베이스로 동기화하고, 그 데이터베이스를 Notion Calendar에서 볼 수 있게 하는 Chrome 확장 프로그램입니다.

현재 지원 사이트는 [자소설닷컴](https://jasoseol.com/recruit)입니다. 사람인, 잡코리아 등 다른 채용 사이트는 아직 구현되어 있지 않습니다.

## 주요 기능

- 자소설닷컴 공고 즐겨찾기 동작 감지
- 공고명, 회사명, 직무, 시작일, 마감일, 공고 URL, 지원 URL, 공고 ID 등 일정 관리용 메타데이터 추출
- Notion API를 통한 데이터베이스 페이지 생성
- 시작일을 캘린더에 추가하는 옵션 제공
- 설정 페이지에서 Notion 연결값, 데이터베이스 속성명, 동기화 옵션 관리

## 사용 범위와 주의사항

JD-Sync는 개인적인 채용 일정 관리와 취업 준비 기록을 돕기 위한 도구입니다.

JD-Sync는 사용자가 직접 즐겨찾기한 공고의 일부 메타데이터만 Notion으로 동기화합니다. 공고 원문 HTML, 이미지 파일, 첨부 파일 전체를 수집하거나 Notion에 복제하는 기능은 제공하지 않습니다.

사용자는 JD-Sync를 채용 공고 데이터의 대량 수집, 상업적 이용, 재배포, 공개 공유, 제3자 제공 목적으로 사용할 수 없습니다. 채용 공고의 원문과 콘텐츠 권리는 각 채용 사이트, 기업 또는 정당한 권리자에게 있습니다.

자세한 이용 조건은 [TERMS.md](./TERMS.md)를 참고하세요. 개인정보 처리 방식은 [PRIVACY.md](./PRIVACY.md)를 참고하세요.

## 필요 조건

- Manifest V3를 지원하는 Chrome 또는 Chromium 기반 브라우저
- 자소설닷컴 계정
- Notion 워크스페이스
- Notion internal integration token
- Notion 데이터베이스와 해당 데이터베이스의 Data Source ID

## Notion 데이터베이스가 필요한 이유

Notion Calendar는 외부 앱이 토큰만으로 캘린더 이벤트를 직접 추가하는 구조가 아닙니다. 날짜 속성이 있는 Notion 데이터베이스를 Notion Calendar에 연결하면, 그 데이터베이스의 페이지가 캘린더 일정처럼 표시됩니다.

그래서 JD-Sync는 사용자가 준비한 Notion 데이터베이스에 새 페이지를 만들고, Notion Calendar는 그 데이터베이스의 날짜 속성을 읽어서 일정을 보여줍니다.

## Notion 데이터베이스 속성

설정 페이지의 `Notion Database 설정`에 입력하는 값은 Notion 데이터베이스의 실제 속성명입니다. 기본 템플릿을 그대로 쓴다면 아래 이름을 유지하는 것을 권장합니다.

| JD-Sync 설정 | Notion 속성 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| 공고명 | Title | `공고명` | Notion 페이지 제목입니다. |
| 회사명 | Text | `회사명` | 채용 회사명입니다. |
| 직무 | Text | `직무` | 모집 직무 정보입니다. |
| 시작일 | Date | `시작일` | 접수 시작일입니다. |
| 마감일 | Date | `마감일` | 접수 마감일입니다. |
| 일정 | Date | `일정` | Notion Calendar에 표시할 기준 날짜입니다. 기본값은 마감일입니다. |
| 공고 URL | URL | `공고 URL` | 자소설닷컴 공고 원문 링크입니다. |
| 지원 URL | URL | `지원 URL` | 기업 지원 페이지 링크가 있을 때 저장합니다. |
| 공고 ID | Number | `공고 ID` | 자소설닷컴 공고 고유 ID입니다. |

`공고명`은 일반 텍스트 속성이 아니라 Notion 데이터베이스의 제목 속성이어야 합니다.

## 일정, 시작일, 마감일

`일정`은 Notion Calendar에서 실제로 표시할 날짜 속성입니다. 기본 설정에서는 `일정`에 마감일이 들어갑니다.

`시작일`과 `마감일`은 원본 공고의 시작/마감 시간을 따로 확인하기 위한 속성입니다.

## 동기화 옵션

- `즐겨찾기 시 자동 동기화`: 자소설닷컴에서 즐겨찾기 성공 시 Notion에 자동으로 추가합니다.
- `시작일도 캘린더에 추가하기`: 기본 마감일 일정 외에 시작일도 캘린더에서 볼 수 있게 합니다.
- `하나로 합쳐서 만들기`: Notion 페이지 하나만 만들고 `일정`을 시작일~마감일 범위로 저장합니다.
- `시작일을 별도 일정으로 만들기`: 마감일 일정과 시작일 일정을 별도 페이지로 저장합니다.

## 로컬 설치와 설정

1. Chrome에서 `chrome://extensions`를 엽니다.
2. 우측 상단의 **Developer mode**를 켭니다.
3. **Load unpacked**를 클릭합니다.
4. 이 저장소 폴더를 선택합니다.
5. 설정 페이지의 **설정 가이드 보러가기** 버튼을 눌러 Notion 데이터베이스 템플릿 복제, integration token 발급, Data Source ID 복사를 진행합니다.
6. 설정 페이지에 `Notion 토큰`과 `Notion Data Source ID`를 입력합니다.
7. Notion 데이터베이스 속성명이 기본값과 다르면 설정 페이지의 속성명을 실제 DB 속성명에 맞게 수정합니다.
8. **설정 저장**을 누릅니다.
9. 자소설닷컴에서 공고를 즐겨찾기합니다.

## 개발

별도 빌드 과정은 없습니다.

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

로컬 릴리스 zip 생성:

```powershell
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md,.\TERMS.md,.\TERMS.en.md -DestinationPath .\jd-sync.zip -Force
```

## Chrome Web Store 배포

1. 루트에 `manifest.json`이 들어있는 zip을 준비합니다.
2. [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)에 접속합니다.
3. **Add new item**을 클릭합니다.
4. zip 패키지를 업로드합니다.
5. Store Listing, Privacy, Distribution, Test instructions 항목을 작성합니다.
6. 리뷰를 제출합니다.

이 확장 프로그램은 웹페이지 공고 정보와 Notion 토큰을 다루므로, Chrome Web Store Privacy 항목을 정확히 작성하고 `PRIVACY.md` 또는 호스팅한 개인정보 처리방침 링크를 제공해야 합니다.

## 개인정보

JD-Sync는 별도 서버를 운영하지 않도록 설계되어 있습니다. 설정과 동기화 기록은 Chrome 확장 저장소에 저장되고, 공고 메타데이터는 사용자가 설정한 Notion API 대상으로만 전송됩니다. 자세한 내용은 [PRIVACY.md](./PRIVACY.md)를 참고하세요.

## 기여

기여를 환영합니다. Pull request를 열기 전에 [CONTRIBUTING.md](./CONTRIBUTING.md)를 읽어 주세요.

## 보안

보안 문제는 공개 GitHub issue에 올리지 말아 주세요. [SECURITY.md](./SECURITY.md)를 참고하세요.

## 추가 문서

- [SUPPORT.md](./SUPPORT.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [TERMS.md](./TERMS.md)
- [Chrome Web Store 배포 가이드](./docs/CHROME_WEB_STORE.md)

## 라이선스

MIT. [LICENSE](./LICENSE)를 참고하세요.
