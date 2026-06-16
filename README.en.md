# JD-Sync

[한국어](./README.md)

Sync job-posting bookmarks from recruiting sites into a Notion database that can be shown in Notion Calendar.

JD-Sync currently supports [Jasoseol](https://jasoseol.com/recruit). When you bookmark a recruit posting, the Chrome extension creates a Notion page with the company, posting title, deadline, source URL, and optional apply URL.

## Why

Recruiting calendars are useful only when they stay current. JD-Sync keeps bookmarked job deadlines close to your actual planning workflow by sending them to Notion, where Notion Calendar can display them alongside the rest of your schedule.

## Features

- Detects Jasoseol bookmark actions in the browser
- Reads posting metadata from Jasoseol detail pages
- Creates Notion database pages through the Notion API
- Opens the setup guide automatically only when no Notion token is configured
- Supports manual sync from the popup or guide page after setup
- Prevents duplicate pages by remembering synced Jasoseol posting IDs
- Stores your Notion token locally in Chrome extension storage

## Requirements

- Google Chrome or another Chromium browser that supports Manifest V3
- A Jasoseol account
- A Notion workspace
- A Notion internal integration token
- A Notion database with a date property

## Why a Notion Database Is Required

Notion Calendar does not provide a token-only flow where an external app directly inserts calendar events. Instead, Notion Calendar can display pages from a Notion database that has a date property.

You should first create a Notion database for recruiting schedules and add that database to Notion Calendar. After that, when you bookmark a Jasoseol posting, JD-Sync creates a new row in that database and Notion Calendar displays the row's schedule date.

## Notion Database Columns

You only need these two columns to start:

| Property | Type | Required |
| --- | --- | --- |
| `Name` or `이름` | Title | Yes |
| `Schedule Date` or `일정일` | Date | Yes |

These columns are optional. Enter their names in JD-Sync only if you created matching columns in your Notion database. Leave the matching JD-Sync setting blank if you did not create the column.

| Property | Type | Required |
| --- | --- | --- |
| `Company` or `회사` | Text | No |
| `Posting` or `공고명` | Text | No |
| `Posting URL` or `공고 URL` | URL | No |
| `Apply URL` or `지원 URL` | URL | No |
| `Start Date` or `시작일` | Date | No |
| `Jasoseol ID` or `자소설 ID` | Number | No |
| `Duties` or `직무` | Text | No |

In this context, a property is simply a Notion database column. JD-Sync needs these names so it knows which column should receive the title, schedule date, URL, and other posting data. If you use Notion Calendar's default database, enter `액티비티` for the title column and `날짜` for the date column.

## Local Installation

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Click the JD-Sync extension icon.
6. If no Notion token is configured, the setup guide opens in a new tab.
7. Follow the guide to create a Notion token and connect your Notion database.
8. After the token is saved, clicking the extension icon opens the compact popup instead of the guide.
9. Bookmark a Jasoseol posting, or open a posting detail page and use **Sync current posting** from the popup.

## Notion Setup

1. Create a Notion internal integration from the Notion developer portal.
2. Copy the integration token.
3. Create a Notion database, such as `Job Postings`. It can be inside a regular page or opened as a full-page database.
4. Add at least a title column and a date column. The Korean defaults are `이름` and `일정일`.
5. Add company, posting URL, and other columns only if you want them as separate database columns.
6. Use the database menu to add the integration as a connection.
7. Copy the data source ID from the database settings. This is the safest option for Notion's newer API.
8. Add this database to Notion Calendar and select the deadline date property.
9. When you bookmark a Jasoseol posting, JD-Sync creates a database row and Notion Calendar displays it.
10. In JD-Sync settings, use:
   - Notion target type: `data_source_id`
   - Notion API version: `2025-09-03`
   - Notion Data Source ID: the ID copied from the database settings

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
Compress-Archive -Path .\manifest.json,.\src,.\assets,.\LICENSE,.\PRIVACY.md,.\PRIVACY.en.md -DestinationPath .\jd-sync.zip -Force
```

## Chrome Web Store Publishing

1. Prepare a production zip that contains `manifest.json` at the root.
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
3. Click **Add new item**.
4. Upload the zip package.
5. Complete the store listing, privacy, distribution, and test-instruction sections.
6. Submit for review.

Chrome's official publishing docs say the dashboard asks for the zip package first, then listing and privacy details. This extension handles website content and an authentication token, so fill the privacy fields carefully and link to `PRIVACY.md` or a hosted privacy policy page.

## Privacy

JD-Sync is designed to avoid operating a separate backend. It stores configuration and sync history in Chrome extension storage and sends posting metadata only to the Notion API endpoint configured by the user. See [PRIVACY.md](./PRIVACY.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Security

Please do not report security issues in public GitHub issues. See [SECURITY.md](./SECURITY.md).

## More Documents

- [SUPPORT.md](./SUPPORT.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [Chrome Web Store publishing guide](./docs/CHROME_WEB_STORE.md)

## License

MIT. See [LICENSE](./LICENSE).
