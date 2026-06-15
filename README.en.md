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

You should first create a regular Notion page, create a recruiting-postings database inside it, and add that database to Notion Calendar. After that, when you bookmark a Jasoseol posting, JD-Sync creates a new item in that database and Notion Calendar displays the item's deadline date.

## Recommended Notion Database

Create a database with these properties:

| Property | Type | Required |
| --- | --- | --- |
| `Name` or `이름` | Title | Yes |
| `Deadline` or `마감일` | Date | Yes |
| `Company` or `회사` | Text | No |
| `Posting` or `공고명` | Text | No |
| `Posting URL` or `공고 URL` | URL | No |
| `Apply URL` or `지원 URL` | URL | No |
| `Start Date` or `시작일` | Date | No |
| `Jasoseol ID` or `자소설 ID` | Number | No |
| `Duties` or `직무` | Text | No |

The default settings use Korean property names because Jasoseol is a Korean recruiting service. You can change every property name from the extension guide page.

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
3. Create a regular Notion page, such as `Recruiting Calendar`.
4. Create a database inside that page, such as `Job Postings`.
5. Add at least a title property and a date property. The Korean defaults are `이름` and `마감일`.
6. Use the database menu to add the integration as a connection.
7. Copy the database ID from the Notion URL. This is the database ID, not the regular page ID.
8. Add this database to Notion Calendar and select the deadline date property.
9. When you bookmark a Jasoseol posting, JD-Sync creates a database item and Notion Calendar displays it.
10. In JD-Sync settings, use:
   - Parent type: `database_id`
   - Notion-Version: `2022-06-28`
   - Parent ID: your Notion database ID

If you already use Notion's newer data source API, you can use `data_source_id` with `2025-09-03`.

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
