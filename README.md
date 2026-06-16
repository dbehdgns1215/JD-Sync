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

그래서 사용자는 먼저 Notion에 `채용 일정` 데이터베이스를 하나 만들고, 그 데이터베이스를 Notion Calendar에 연결해야 합니다. 이후 자소설에서 즐겨찾기하면 JD-Sync가 그 데이터베이스에 새 줄을 만들고, Notion Calendar가 해당 줄의 `일정일`을 보여줍니다. 기본값에서는 `일정일`에 마감일을 넣습니다.

## Notion DB 칸 만들기

처음에는 아래 칸을 권장합니다.

| 칸 이름 | Notion 칸 타입 | 필수 |
| --- | --- | --- |
| `이름` | 제목, DB의 첫 번째 페이지 제목 칸 | 예 |
| `일정일` | Date, Notion Calendar가 보는 날짜 | 예 |
| `시작일` | Date | 예 |
| `마감일` | Date | 예 |

아래 칸은 선택입니다. Notion DB에 직접 만들었을 때만 JD-Sync 설정에 칸 이름을 입력하세요. 만들지 않았다면 설정에서 비워두면 됩니다.

| 칸 이름 | Notion 칸 타입 | 필수 |
| --- | --- | --- |
| `회사` | Text | 아니오 |
| `공고명` | Text | 아니오 |
| `공고 URL` | URL | 아니오 |
| `지원 URL` | URL | 아니오 |
| `자소설 ID` | Number | 아니오 |
| `직무` | Text | 아니오 |

JD-Sync 설정의 `Notion DB 칸 이름`은 말 그대로 Notion DB에 만들어 둔 칸 이름입니다. 예를 들어 캘린더 표시일 칸 이름이 `일정일`이면, JD-Sync가 새 공고 줄을 만들 때 그 칸에 캘린더에 보일 날짜를 넣습니다. 기본값에서는 `일정일`에 마감일을 넣고, 시작일과 마감일도 각각 `시작일`, `마감일` 칸에 따로 저장합니다. 공고 제목을 넣을 칸은 일반 텍스트 칸이 아니라 DB의 첫 번째 페이지 제목 칸이어야 합니다. Notion API에서 말하는 `rich_text`는 노션 화면의 텍스트 속성입니다. Notion Calendar 기본 DB를 그대로 쓴다면 제목 칸은 `액티비티`, 캘린더 표시일 칸은 `날짜`로 입력하세요.

`시작일도 캘린더에 별도 일정으로 등록` 옵션을 켜면 같은 공고에 대해 시작일용 행을 하나 더 만듭니다. 이 추가 행은 `일정일`에 시작일을 넣고 제목 앞에 `[시작]`을 붙입니다.

## 로컬 설치

1. Chrome에서 `chrome://extensions`를 엽니다.
2. 우측 상단의 **Developer mode**를 켭니다.
3. **Load unpacked**를 클릭합니다.
4. 이 저장소 폴더를 선택합니다.
5. JD-Sync 확장 아이콘을 클릭합니다.
6. Notion 토큰이 아직 없으면 설정 가이드가 새 탭으로 열립니다.
7. 가이드를 따라 Notion 토큰, Notion Data Source ID, DB 칸 이름을 입력합니다.
8. 토큰을 저장한 뒤에는 확장 아이콘을 눌러도 가이드가 자동으로 열리지 않고 작은 팝업만 열립니다.
9. 자소설 공고를 즐겨찾기하거나, 공고 상세 페이지에서 팝업의 **현재 공고 수동 동기화**를 누릅니다.

## Notion 설정

1. Notion 개발자 포털에서 internal integration을 만듭니다.
2. integration token을 복사합니다.
3. Notion에 `채용 일정` 같은 데이터베이스를 만듭니다. 일반 페이지 안에 만들어도 되고, 데이터베이스를 풀페이지로 만들어도 됩니다.
4. 데이터베이스의 첫 번째 페이지 제목 칸 이름을 `이름`으로 바꾸고, `일정일`, `시작일`, `마감일` 날짜 칸을 준비합니다.
5. 회사명, 공고 URL 같은 칸은 필요할 때만 추가로 만듭니다.
6. 데이터베이스 메뉴에서 방금 만든 integration을 connection으로 추가합니다.
7. 데이터베이스 설정에서 data source ID를 복사합니다. 새 Notion API에서는 이 ID를 쓰는 것이 가장 안전합니다.
8. Notion Calendar에서 이 데이터베이스를 추가하고 날짜 칸으로 `일정일`을 선택합니다.
9. 자소설에서 공고를 즐겨찾기하면 JD-Sync가 이 데이터베이스에 새 줄을 만들고, Calendar에 표시됩니다.
10. JD-Sync 가이드에서 아래처럼 설정합니다.
   - Notion 토큰: 복사한 integration token
   - Notion Data Source ID: 복사한 data source ID
   - 공고 제목을 넣을 칸: `이름`
   - 캘린더 표시일을 넣을 칸: `일정일`
   - 시작일을 넣을 칸: `시작일`
   - 마감일을 넣을 칸: `마감일`
   - 고급 설정: 처음에는 건드리지 않아도 됩니다.

## Notion Calendar에 표시하기

Notion Calendar는 날짜 속성이 있는 Notion 데이터베이스 항목을 캘린더에 표시할 수 있습니다.

1. Notion Calendar를 엽니다.
2. 왼쪽 사이드바에서 Notion 워크스페이스를 찾습니다.
3. 워크스페이스 메뉴에서 Notion database 추가를 선택합니다.
4. JD-Sync가 쓰는 채용 공고 DB를 선택합니다.
5. 날짜 칸으로 `일정일`을 선택합니다.

## 문제 해결

`Cannot read properties of undefined (reading 'sendMessage')` 오류가 보이면 확장 프로그램을 업데이트하거나 `chrome://extensions`에서 새로고침한 뒤, 이미 열려 있던 자소설 탭을 새로고침하지 않은 상태일 수 있습니다. 자소설 공고 페이지를 새로고침한 뒤 다시 동기화해 주세요.

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
