# Chrome Web Store Publishing Guide

[한국어](./CHROME_WEB_STORE.md)

This guide summarizes the release flow for JD-Sync.

## 1. Preflight

- Confirm `manifest.json` is valid JSON.
- Confirm the extension loads from `chrome://extensions`.
- Run syntax checks:

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

- Verify the package contains:
  - `manifest.json`
  - `src/`
  - `assets/`
  - `LICENSE`
  - `PRIVACY.md`
  - `PRIVACY.en.md`
  - `TERMS.md`
  - `TERMS.en.md`

## 2. Package

From the repository root:

```powershell
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md,.\TERMS.md,.\TERMS.en.md -DestinationPath .\jd-sync.zip -Force
```

`manifest.json` must be at the root of the zip.

## 3. Upload

1. Go to the Chrome Developer Dashboard.
2. Sign in with the developer account.
3. Click **Add new item**.
4. Choose `jd-sync.zip` and upload it.
5. Fill out the package, store listing, privacy, distribution, and test-instruction sections.
6. Submit for review.

Official docs:

- Chrome publishing guide: https://developer.chrome.com/docs/webstore/publish
- Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies
- Privacy and secure handling FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq

## 4. Listing Notes

Suggested category:

- Productivity

Suggested single purpose:

```text
Sync bookmarked recruiting postings from Jasoseol to a user-configured Notion database for display in Notion Calendar.
```

Suggested permission justifications:

- `storage`: stores Notion settings and local sync history.
- `https://jasoseol.com/*`: detects bookmark actions and reads posting metadata.
- `https://api.notion.com/*`: creates pages in the user's configured Notion database.

## 5. Privacy Review Notes

This extension handles website content and authentication information because it reads posting metadata and stores a Notion token. Keep `PRIVACY.md` hosted somewhere public and link it from the dashboard privacy field before submitting.

JD-Sync does not collect full posting HTML, image files, or attachments, and it does not copy those materials into Notion. Keep the store listing and privacy disclosures consistent with this limited metadata-only sync scope.
