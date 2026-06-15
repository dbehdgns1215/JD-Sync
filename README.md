# JD-Sync

[English](./README.en.md)

채용 사이트에서 즐겨찾기한 공고를 Notion 데이터베이스로 동기화하고, 그 데이터베이스를 Notion Calendar에서 볼 수 있게 하는 Chrome 확장 프로그램입니다.

현재는 [자소설닷컴](https://jasoseol.com/recruit)을 지원합니다. 자소설닷컴에서 채용 공고를 즐겨찾기하면 회사명, 공고명, 마감일, 공고 URL, 지원 URL 등을 Notion 데이터베이스 페이지로 생성합니다.

## 왜 만들었나

채용 일정은 놓치면 바로 기회가 사라집니다. JD-Sync는 자소설닷컴에서 관심 공고를 저장하는 순간 그 마감일을 Notion으로 보내서, 평소 쓰는 Notion Calendar 안에서 채용 일정을 같이 볼 수 있게 합니다.

## 주요 기능

- 자소설닷컴 공고 즐겨찾기 동작 감지
- 자소설 공고 상세 페이지에서 메타데이터 추출
- Notion API를 통해 데이터베이스 페이지 생성
- Notion 토큰이 없을 때만 설정 가이드 자동 오픈
- 토큰 저장 후에는 확장 팝업에서 수동 동기화와 가이드 열기 제공
- 이미 동기화한 자소설 공고 ID 중복 생성 방지
- Notion 토큰은 Chrome 확장 로컬 저장소에 저장

## 필요 조건

- Manifest V3를 지원하는 Chrome 또는 Chromium 기반 브라우저
- 자소설닷컴 계정
- Notion 워크스페이스
- Notion internal integration token
- 날짜 속성이 있는 Notion 데이터베이스

## Notion 데이터베이스가 필요한 이유

Notion Calendar는 토큰만 입력하면 외부 앱이 캘린더 이벤트를 직접 꽂아 주는 구조가 아닙니다. 날짜 속성이 있는 Notion 데이터베이스를 Calendar에 연결하면, 그 데이터베이스의 페이지들이 캘린더 일정처럼 표시됩니다.

그래서 사용자는 먼저 Notion에 `채용 일정` 같은 일반 페이지를 만들고, 그 안에 `채용 공고` 데이터베이스를 만든 뒤, 그 데이터베이스를 Notion Calendar에 연결해야 합니다. 이후 자소설에서 즐겨찾기하면 JD-Sync가 그 데이터베이스에 공고 항목을 만들고, Notion Calendar가 해당 항목의 `마감일`을 보여줍니다.

## 추천 Notion 데이터베이스

아래 속성으로 데이터베이스를 만들면 기본 설정 그대로 사용할 수 있습니다.

| 속성명 | 타입 | 필수 |
| --- | --- | --- |
| `이름` | Title | 예 |
| `마감일` | Date | 예 |
| `회사` | Text | 아니오 |
| `공고명` | Text | 아니오 |
| `공고 URL` | URL | 아니오 |
| `지원 URL` | URL | 아니오 |
| `시작일` | Date | 아니오 |
| `자소설 ID` | Number | 아니오 |
| `직무` | Text | 아니오 |

속성명은 확장 프로그램 가이드 페이지에서 변경할 수 있습니다. 단, Notion DB에 있는 실제 속성명과 정확히 같아야 합니다.

## 로컬 설치

1. Chrome에서 `chrome://extensions`를 엽니다.
2. 우측 상단의 **Developer mode**를 켭니다.
3. **Load unpacked**를 클릭합니다.
4. 이 저장소 폴더를 선택합니다.
5. JD-Sync 확장 아이콘을 클릭합니다.
6. Notion 토큰이 아직 없으면 설정 가이드가 새 탭으로 열립니다.
7. 가이드를 따라 Notion 토큰, parent type, parent ID, 속성명을 입력합니다.
8. 토큰을 저장한 뒤에는 확장 아이콘을 눌러도 가이드가 자동으로 열리지 않고 작은 팝업만 열립니다.
9. 자소설 공고를 즐겨찾기하거나, 공고 상세 페이지에서 팝업의 **현재 공고 수동 동기화**를 누릅니다.

## Notion 설정

1. Notion 개발자 포털에서 internal integration을 만듭니다.
2. integration token을 복사합니다.
3. Notion에 `채용 일정` 같은 일반 페이지를 만듭니다.
4. 그 페이지 안에 `채용 공고` 같은 데이터베이스를 만듭니다.
5. 데이터베이스에 최소 `이름` title 속성과 `마감일` date 속성을 준비합니다.
6. 데이터베이스 메뉴에서 방금 만든 integration을 connection으로 추가합니다.
7. 데이터베이스 URL에서 database ID를 복사합니다. 일반 페이지 ID가 아니라 데이터베이스 ID가 필요합니다.
8. Notion Calendar에서 이 데이터베이스를 추가하고 날짜 속성으로 `마감일`을 선택합니다.
9. 자소설에서 공고를 즐겨찾기하면 JD-Sync가 이 데이터베이스에 새 항목을 만들고, Calendar에 표시됩니다.
10. JD-Sync 가이드에서 아래처럼 설정합니다.
   - Parent type: `database_id`
   - Notion-Version: `2022-06-28`
   - Parent ID: 복사한 Notion database ID

Notion의 최신 data source API를 직접 쓰고 있다면 `data_source_id`와 `2025-09-03` 조합도 사용할 수 있습니다.

## Notion Calendar에 표시하기

Notion Calendar는 날짜 속성이 있는 Notion 데이터베이스 항목을 캘린더에 표시할 수 있습니다.

1. Notion Calendar를 엽니다.
2. 왼쪽 사이드바에서 Notion 워크스페이스를 찾습니다.
3. 워크스페이스 메뉴에서 Notion database 추가를 선택합니다.
4. JD-Sync가 쓰는 채용 공고 DB를 선택합니다.
5. 날짜 속성으로 `마감일`을 선택합니다.

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
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md -DestinationPath .\jd-sync.zip -Force
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
- [Chrome Web Store 배포 가이드](./docs/CHROME_WEB_STORE.md)

## 라이선스

MIT. [LICENSE](./LICENSE)를 참고하세요.
