# Privacy Policy

[한국어](./PRIVACY.md)

Effective date: 2026-06-16

JD-Sync is a Chrome extension that syncs bookmarked recruiting postings into a user-configured Notion database.

## Data the Extension Handles

JD-Sync may handle:

- Notion internal integration token entered by the user
- Notion parent ID, Notion API version, and database property mapping settings
- Jasoseol posting metadata, including company name, posting title, start date, deadline, posting URL, apply URL, posting ID, and duties
- Local sync history, including recently synced posting IDs and status messages

JD-Sync does not intentionally collect names, email addresses, payment information, health information, or personal communications.

## How Data Is Used

The extension uses data only to provide its single purpose: syncing recruiting posting deadlines into Notion.

- Settings and sync history are stored in Chrome extension storage.
- The Notion token is used only to authenticate requests to the Notion API.
- Posting metadata is sent only to the user-configured Notion API destination when syncing a posting.

## Data Sharing

JD-Sync does not operate a separate backend service. The extension sends data only to:

- Notion API (`https://api.notion.com`) for creating pages in the user's selected Notion database
- Jasoseol (`https://jasoseol.com`) as part of normal browsing and reading posting detail pages

JD-Sync does not sell user data, use user data for advertising, or transfer user data to data brokers.

## Limited Use Disclosure

JD-Sync's use and transfer of information received from browser permissions is limited to providing and improving the user-facing sync feature. The extension does not use this information for personalized advertising, does not sell this information, and does not allow humans to read it except when the user explicitly shares diagnostics or reports.

## Data Retention

JD-Sync stores settings and sync history locally until the user clears extension storage, removes the extension, or resets the data from browser settings.

## Security

The extension communicates with Notion over HTTPS. Users should protect their Notion token and rotate it if it is exposed.

## Changes

This policy may change as the extension evolves. Material changes should be documented in the repository and release notes.

## Contact

Open a GitHub issue for general privacy questions. Do not include secrets, tokens, cookies, or private account information in public issues.
