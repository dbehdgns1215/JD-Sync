# JD-Sync

[한국어](./README.md)

Sync selected schedule metadata from bookmarked job postings into a Notion database that can be shown in Notion Calendar.

JD-Sync currently supports [Jasoseol](https://jasoseol.com/recruit). When you bookmark a recruit posting, the Chrome extension creates a Notion page with selected metadata needed for schedule management, such as company, posting title, start date, deadline, source URL, and optional apply URL.

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

## Usage Scope and Important Notes

JD-Sync is a tool for personal recruiting schedule management and job-search records.

JD-Sync syncs only selected metadata from postings the user directly bookmarked. It does not provide a feature that collects full posting HTML, image files, or attachments, and it does not copy those materials into Notion.

Users may not use JD-Sync for bulk collection of job posting data, commercial use, redistribution, public sharing, or providing job posting data to third parties. Rights to original posting content belong to the relevant recruiting sites, companies, or rightful owners.

See [TERMS.en.md](./TERMS.en.md) for the full terms of use and [PRIVACY.en.md](./PRIVACY.en.md) for privacy details.

## Requirements

- Google Chrome or another Chromium browser that supports Manifest V3
- A Jasoseol account
- A Notion workspace
- A Notion internal integration token
- A Notion database with a date property

## Why a Notion Database Is Required

Notion Calendar does not provide a token-only flow where an external app directly inserts calendar events. Instead, Notion Calendar can display pages from a Notion database that has a date property.

You should first create a Notion database for recruiting schedules and add that database to Notion Calendar. After that, when you bookmark a Jasoseol posting, JD-Sync creates a new row in that database and Notion Calendar displays the row's schedule date. By default, JD-Sync writes only the deadline into the schedule-date property.

## Notion Database Columns

These columns are recommended to start:

| Property | Type | Required |
| --- | --- | --- |
| `Name` or `이름` | Title, the first page-title column | Yes |
| `Schedule Date` or `일정일` | Date, the property Notion Calendar displays | Yes |
| `Start Date` or `시작일` | Date | Yes |
| `Deadline` or `마감일` | Date | Yes |

These columns are optional. Enter their names in JD-Sync only if you created matching columns in your Notion database. Leave the matching JD-Sync setting blank if you did not create the column.

| Property | Type | Required |
| --- | --- | --- |
| `Company` or `회사` | Text | No |
| `Posting` or `공고명` | Text | No |
| `Posting URL` or `공고 URL` | URL | No |
| `Apply URL` or `지원 URL` | URL | No |
| `Jasoseol ID` or `자소설 ID` | Number | No |
| `Duties` or `직무` | Text | No |

In this context, a property is simply a Notion database column. JD-Sync needs these names so it knows which column should receive the title, schedule date, deadline, start date, URL, and other posting data. The posting title column must be the database's first page-title column, not a regular text column. In the Notion API, `rich_text` means Notion's regular text property. If you use Notion Calendar's default database, enter `액티비티` for the title column and `날짜` for the schedule-date column. If you enable the start-date calendar option, JD-Sync can either write a start-to-deadline range into the schedule-date property or create an additional `[시작]` row.

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
4. Rename the first page-title column to `이름` and add date columns named `일정일`, `시작일`, and `마감일`.
5. Add company, posting URL, and other columns only if you want them as separate database columns.
6. Use the database menu to add the integration as a connection.
7. Copy the data source ID from the database settings. This is the safest option for Notion's newer API.
8. Add this database to Notion Calendar and select the `일정일` schedule date property.
9. When you bookmark a Jasoseol posting, JD-Sync creates a database row and Notion Calendar displays it.
10. In JD-Sync settings, use:
   - Notion target type: `data_source_id`
   - Notion API version: `2025-09-03`
   - Notion Data Source ID: the ID copied from the database settings

## Development

This extension does not require a build step.

## Troubleshooting

If you see `Cannot read properties of undefined (reading 'sendMessage')`, the extension may have been reloaded while a Jasoseol tab was already open. Refresh the Jasoseol posting page and try syncing again.

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
- [TERMS.en.md](./TERMS.en.md)
- [Chrome Web Store publishing guide](./docs/CHROME_WEB_STORE.md)

## License

MIT. See [LICENSE](./LICENSE).
