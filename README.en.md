# JD-Sync

[한국어](./README.md)

JD-Sync is a Chrome extension that syncs selected schedule metadata from job postings the user directly bookmarks into a Notion database, so the database can be displayed in Notion Calendar.

The only supported job site right now is [Jasoseol](https://jasoseol.com/recruit). Saramin, JobKorea, and other recruiting sites are not implemented yet.

## Features

- Detects Jasoseol bookmark actions
- Extracts schedule metadata such as posting title, company, duties, start date, deadline, posting URL, apply URL, and posting ID
- Creates Notion database pages through the Notion API
- Supports optional start-date calendar display
- Provides a settings page for Notion connection values, database property names, and sync options

## Usage Scope and Important Notes

JD-Sync is a tool for personal recruiting schedule management and job-search records.

JD-Sync syncs only selected metadata from postings the user directly bookmarked. It does not collect full posting HTML, image files, or attachments, and it does not copy those materials into Notion.

Users may not use JD-Sync for bulk collection of job posting data, commercial use, redistribution, public sharing, or providing job posting data to third parties. Rights to original posting content belong to the relevant recruiting sites, companies, or rightful owners.

See [TERMS.en.md](./TERMS.en.md) for the full terms of use and [PRIVACY.en.md](./PRIVACY.en.md) for privacy details.

## Requirements

- Google Chrome or another Chromium browser that supports Manifest V3
- A Jasoseol account
- A Notion workspace
- A Notion internal integration token
- A Notion database and its Data Source ID

## Why a Notion Database Is Required

Notion Calendar does not provide a token-only flow where an external app directly inserts calendar events. Instead, Notion Calendar displays pages from a Notion database that has a date property.

JD-Sync therefore creates pages in the Notion database prepared by the user. Notion Calendar then reads the database date property and displays those pages as calendar items.

## Notion Database Properties

The values entered under `Notion Database settings` are the exact property names in your Notion database. If you use the default template, keep the names below.

| JD-Sync setting | Notion property type | Default | Description |
| --- | --- | --- | --- |
| Posting title | Title | `공고명` | The Notion page title. |
| Company | Text | `회사명` | The company name. |
| Duties | Text | `직무` | Duties or job fields. |
| Start date | Date | `시작일` | Application start date. |
| Deadline | Date | `마감일` | Application deadline. |
| Schedule | Date | `일정` | The date property intended for Notion Calendar display. By default, this is the deadline. |
| Posting URL | URL | `공고 URL` | The original Jasoseol posting URL. |
| Apply URL | URL | `지원 URL` | The external company apply URL, when available. |
| Posting ID | Number | `공고 ID` | The Jasoseol posting ID. |

`공고명` must be the Notion database title property, not a regular text property.

## Schedule, Start Date, and Deadline

`일정` is the date property used for calendar display. With the default settings, JD-Sync writes the deadline into `일정`.

`시작일` and `마감일` store the original start and deadline values as separate properties.

## Sync Options

- `즐겨찾기 시 자동 동기화`: automatically sync to Notion after a successful Jasoseol bookmark action.
- `시작일도 캘린더에 추가하기`: also show the start date in the calendar.
- `하나로 합쳐서 만들기`: create one Notion page and store a start-to-deadline range in `일정`.
- `시작일을 별도 일정으로 만들기`: save the deadline schedule and start schedule as separate pages.

## Local Installation and Setup

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Click **설정 가이드 보러가기** in the settings page and follow the Notion guide to duplicate the database template, create an integration token, and copy the Data Source ID.
6. Enter the `Notion token` and `Notion Data Source ID` in the settings page.
7. If your Notion database property names differ from the defaults, update the property names in the settings page.
8. Click **설정 저장**.
9. Bookmark a Jasoseol posting.

## Development

This extension does not require a build step.

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

To package a local release:

```powershell
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md,.\TERMS.md,.\TERMS.en.md -DestinationPath .\jd-sync.zip -Force
```

## Chrome Web Store Publishing

1. Prepare a zip with `manifest.json` at the root.
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
3. Click **Add new item**.
4. Upload the zip package.
5. Complete the Store Listing, Privacy, Distribution, and Test instructions sections.
6. Submit for review.

This extension handles website posting metadata and a Notion token, so fill the Chrome Web Store privacy fields carefully and provide `PRIVACY.en.md` or a hosted privacy policy link.

## Privacy

JD-Sync is designed to avoid operating a separate backend. Configuration and sync logs are stored in Chrome extension storage, and posting metadata is sent only to the Notion API target configured by the user. See [PRIVACY.en.md](./PRIVACY.en.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) before opening a pull request.

## Security

Please do not report security issues in public GitHub issues. See [SECURITY.en.md](./SECURITY.en.md).

## More Documents

- [SUPPORT.en.md](./SUPPORT.en.md)
- [CODE_OF_CONDUCT.en.md](./CODE_OF_CONDUCT.en.md)
- [TERMS.en.md](./TERMS.en.md)
- [Chrome Web Store publishing guide](./docs/CHROME_WEB_STORE.en.md)

## License

MIT. See [LICENSE](./LICENSE).
