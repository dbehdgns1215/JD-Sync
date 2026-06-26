# Contributing

[한국어](./CONTRIBUTING.md)

Thanks for taking the time to improve JD-Sync. This project primarily serves Korean users, so user-facing copy and the main documentation should be Korean first. English companion documents are welcome when useful.

## Branch Flow

Recommended branch usage:

- `main`: stable releases only
- `develop`: integration branch for the next release
- `feature/*`: scoped work branches for features, fixes, and documentation

In most cases, open pull requests from `feature/*` into `develop`, then merge `develop` into `main` when a release is ready.

## Development Workflow

1. Fork the repository or create a working branch.
2. Create a branch with a clear purpose, such as `feature/jasoseol-sync`.
3. Keep changes focused and reviewable.
4. Include screenshots or a short explanation when UI changes are involved.
5. Run the JavaScript syntax checks when JavaScript files change.

## Local Checks

```powershell
node --check .\src\page-bridge.js
node --check .\src\content.js
node --check .\src\background.js
node --check .\src\guide.js
node --check .\src\popup.js
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) where possible. Korean summaries and bodies are fine for this project.

```text
type(scope): Korean summary

- Explain why the change exists.
- Mention notable behavior, risk, or follow-up work.
```

Common types:

- `feat`: user-facing feature
- `fix`: bug fix
- `docs`: documentation-only change
- `chore`: repository maintenance
- `refactor`: code change without behavior change
- `test`: test-only change

Example:

```text
feat(sync): 자소설 즐겨찾기 감지 추가

- 페이지 컨텍스트의 즐겨찾기 API 성공 응답을 감지합니다.
- Notion으로 보내기 전에 공고 상세 메타데이터를 정리합니다.
```

## Pull Request Checklist

- The extension loads from `chrome://extensions` without manifest errors.
- Notion connection values and database property names can be saved from the settings page.
- Automatic sync works when a Jasoseol posting is bookmarked.
- Unsync works when a Jasoseol posting bookmark is removed.
- Automatic sync does not create duplicates for the same posting ID.
- New permissions are documented in `README.md` and `PRIVACY.md`.
- User-facing copy is clear in Korean.
