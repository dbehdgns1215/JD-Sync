# Security Policy

[한국어](./SECURITY.md)

## Supported Versions

Security fixes are currently considered for the latest released version on `main`.

## Reporting a Vulnerability

Please do not report security issues in public GitHub issues.

Use GitHub private vulnerability reporting if it is enabled for the repository. If it is not enabled yet, contact the repository owner privately and include:

- Affected version or commit
- Steps to reproduce
- Expected impact
- Any proof-of-concept details that are safe to share privately

## Sensitive Data

JD-Sync handles a user-provided Notion integration token and job-posting metadata. Do not include real tokens, cookies, or private account data in issues, pull requests, screenshots, logs, or test fixtures.

## Security Principles

- Request only the browser permissions needed for the extension's single purpose.
- Keep Notion tokens in local extension storage.
- Do not add analytics, advertising, or remote code execution.
- Send posting metadata only to the user's configured Notion API destination.
