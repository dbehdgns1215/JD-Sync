# Chrome Web Store 배포 가이드

[English](./CHROME_WEB_STORE.en.md)

이 문서는 JD-Sync를 Chrome Web Store에 올릴 때 필요한 절차를 정리합니다.

## 1. 사전 확인

- `manifest.json`이 유효한 JSON인지 확인합니다.
- `chrome://extensions`에서 확장 프로그램이 정상 로드되는지 확인합니다.
- JavaScript 문법 검사를 실행합니다.

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

- 패키지에 아래 파일과 폴더가 들어있는지 확인합니다.
  - `manifest.json`
  - `src/`
  - `assets/`
  - `LICENSE`
  - `PRIVACY.md`
  - `PRIVACY.en.md`
  - `TERMS.md`
  - `TERMS.en.md`

## 2. 패키징

저장소 루트에서 실행합니다.

```powershell
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md,.\TERMS.md,.\TERMS.en.md -DestinationPath .\jd-sync.zip -Force
```

zip 안의 최상위에 `manifest.json`이 있어야 합니다.

## 3. 업로드

1. [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)에 접속합니다.
2. 개발자 계정으로 로그인합니다.
3. **Add new item**을 클릭합니다.
4. `jd-sync.zip`을 업로드합니다.
5. Store listing, Privacy, Distribution, Test instructions 항목을 작성합니다.
6. 리뷰를 제출합니다.

공식 문서:

- Chrome publishing guide: https://developer.chrome.com/docs/webstore/publish
- Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies
- Privacy and secure handling FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq

## 4. 스토어 등록 문구 참고

추천 카테고리:

- Productivity

Single purpose 예시:

```text
Sync bookmarked recruiting postings from Jasoseol to a user-configured Notion database for display in Notion Calendar.
```

권한 설명 예시:

- `storage`: Notion 설정과 로컬 동기화 기록을 저장합니다.
- `activeTab`: 사용자가 확장 프로그램을 클릭했을 때 현재 자소설 공고 페이지를 동기화합니다.
- `notifications`: 동기화 성공 알림을 표시합니다.
- `https://jasoseol.com/*`: 즐겨찾기 동작을 감지하고 공고 메타데이터를 읽습니다.
- `https://api.notion.com/*`: 사용자가 설정한 Notion 데이터베이스에 페이지를 생성합니다.

## 5. 개인정보 심사 참고

JD-Sync는 웹사이트 콘텐츠와 인증 정보를 처리합니다. 공고 메타데이터를 읽고 Notion 토큰을 저장하기 때문입니다. 제출 전에 `PRIVACY.md`를 공개 URL로 호스팅하거나 저장소 공개 링크를 준비해 Chrome Web Store 개인정보 항목에 입력하세요.

JD-Sync는 공고 원문 HTML, 이미지 파일, 첨부 파일 전체를 수집하거나 Notion에 복제하지 않습니다. 스토어 설명과 개인정보 항목에서도 동기화 범위가 일부 메타데이터로 제한된다는 점을 일관되게 설명하세요.
