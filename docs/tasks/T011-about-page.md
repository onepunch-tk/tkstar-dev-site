# T011 — feature: About Page (F002 사이트 자체 이력서 + F003 PDF 인쇄 스타일)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T005](T005-theme-tokens.md), [T006](T006-domain-schemas.md), [T009](T009-di-container.md)
> **후행**: none

---

## 목적

About 라우트를 '사이트 자체가 이력서' 컨셉으로 채운다 — Mission / About me / Skills / Career / Education / Certifications / Awards / Languages / Tools 섹션 + 다운로드 가능한 자격증 카드. F003 의 PDF 인쇄 스타일 (CSS `@media print`) 을 도입해 Cmd+P 단축키로 깔끔한 1-3쪽 이력서가 생성되도록 한다.

## PRD Feature ID 매핑

- F002
- F003
- F018

## 입력·출력 계약

**입력**: T009 container (about 데이터는 본 task 시점에 정적 모듈 또는 frontmatter). **출력**: `app/presentation/routes/about.tsx` + `app/presentation/components/about/{MissionSection,SkillsSection,CareerTimeline,EducationList,CertificationCard,AwardList,LanguagesList,ToolsList}.tsx` + `app/app.css` 에 `@media print` block + `meta` export. **검증**: RTL 9 섹션 렌더, print 스타일 적용 시 Topbar/Footer/ThemeToggle 비표시 + 페이지 분할 자연스러움.

## 시퀀스

```
1. about 데이터 모듈 — `app/presentation/routes/about.data.ts` (정적 TS 상수, A001 자격증 카드 포함)
2. 9 섹션 컴포넌트 분할 작성 (Mission / About me / Skills / Career / Education / Certifications / Awards / Languages / Tools)
3. CertificationCard — 발행기관 + 발급일 + verify 링크 + 다운로드 버튼 (PDF 첨부 파일은 T021 QA 시점)
4. print 스타일 — `@media print { body { font-family: ...; } .no-print { display: none; } }` 등 chrome 비표시 + 페이지 분할 hint
5. meta export — title `About | tkstar.dev` + description + og:type=profile
6. RTL 테스트 — 9 섹션 ARIA region 검증 + print media query CSS 적용
```

## 엣지 케이스 + 구현

## Implementation Notes

- About 데이터는 '한 사람의 이력서'라 동적 콘텐츠가 아님 — 정적 TS 상수 모듈로 충분. 향후 외부화 안 함 (1인 사이트).
- print 스타일 검증은 RTL 의 `window.matchMedia('print').matches` mock — 실제 PDF 출력 픽셀 검증은 T021 수동 QA.
- CertificationCard 의 verify 링크는 발급기관별 공식 URL — null safe.
- 자격증 PDF 첨부 (S3/R2 호스팅) 은 본 task 범위 외 — placeholder anchor.
- 'About me' 섹션의 본문은 PRD §F002 의 화자 톤 (1인칭 한국어, 짧은 단락).
- Career timeline 은 ISO 8601 date 정렬 (DESC), '현재' 항목은 `end_date: null` 처리.
- F018 (SEO 메타) 도 본 task 에서 처리 — page-level meta export.

## Change History from previous body

- F003 PDF 출력은 별도 라이브러리 없이 CSS print 만 — 결정 사실.
- feature branch PR: `feature/issue-N-about-page`.

## DoD

- [x] 9 섹션 모두 렌더 (RTL getByRole region 9개)
- [x] print 스타일 적용 시 Topbar/Footer/ThemeToggle 비표시
- [x] Cmd+P 수동 테스트 시 1-3쪽 이력서 깔끔 출력
- [x] Certification 카드의 verify 링크 + 다운로드 버튼 렌더
- [x] Career timeline DESC 정렬 + 현재 항목 '현재' 라벨
- [x] meta export 의 title/description/og:type=profile

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T011 머지 — About page F002 + F003 print + 9 섹션 (branch `feature/issue-N-about-page`) | TaekyungHa |
