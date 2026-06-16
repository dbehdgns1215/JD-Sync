# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Initial Chrome MV3 extension for syncing Jasoseol bookmarks to Notion.
- Setup guide page for Notion token issuance, database setup, settings, manual sync, and recent sync logs.
- Popup that opens the setup guide only when a Notion token is missing.
- Duplicate prevention using synced Jasoseol posting IDs.
- Privacy, security, contribution, and store-publishing documentation.
- Korean-first policy documentation with English companion files.
- Plain-language setup guide for Notion database columns and optional fields.
- Optional start-date calendar entries that create a separate `[시작]` row.

### Changed

- Notion synchronization now defaults to `data_source_id` with the `2025-09-03` API version.
- Start and deadline dates can be stored in separate Notion date properties while Notion Calendar uses the schedule-date property.
- Resetting defaults keeps the saved Notion token and data source ID while clearing optional column mappings.

### Fixed

- Show a clear refresh instruction when a Jasoseol tab still has an old content script after the extension is reloaded.
- Translate common Notion property type errors into Korean setup guidance.
