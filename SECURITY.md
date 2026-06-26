# 보안 정책

[English](./SECURITY.en.md)

## 지원 버전

보안 수정은 현재 `main`의 최신 배포 버전을 기준으로 검토합니다.

## 취약점 신고

보안 문제는 공개 GitHub issue에 올리지 마세요.

저장소에서 GitHub private vulnerability reporting이 활성화되어 있다면 그 기능을 사용해 주세요. 아직 활성화되어 있지 않다면 저장소 관리자에게 비공개로 연락하고 아래 정보를 포함해 주세요.

- 영향을 받는 버전 또는 커밋
- 재현 절차
- 예상 영향
- 비공개로 공유해도 안전한 proof of concept

## 민감 정보

JD-Sync는 사용자가 입력한 Notion integration token과 채용 공고 메타데이터를 다룹니다. 실제 토큰, 쿠키, 비공개 계정 정보는 issue, pull request, 스크린샷, 로그, 테스트 fixture에 포함하지 마세요.

## 보안 원칙

- 확장 프로그램의 단일 목적에 필요한 브라우저 권한만 요청합니다.
- Notion 토큰은 Chrome 확장 로컬 저장소에 보관합니다.
- 분석, 광고, 원격 코드 실행 기능을 추가하지 않습니다.
- 공고 메타데이터는 사용자가 설정한 Notion API 대상으로만 전송합니다.
