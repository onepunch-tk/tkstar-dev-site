# T037 — feature: Admin Media — 용량 표시 + orphan cleanup script (선택)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T033](T033-r2-bucket-setup.md), [T034](T034-admin-media-upload-api.md), [T035](T035-admin-media-library.md)
> **후행**: none

---

## 목적

/admin/media 와 admin dashboard 에 총 R2 사용량 (bytes / 객체 수) 위젯을 추가하고, D1 media 메타와 R2 객체의 불일치 (orphan) 를 진단/정리하는 1회성 maintenance script 를 작성한다. 정기 cron 트리거는 본 task 범위 외 — 수동 실행만.

## PRD Feature ID 매핑

- F022

## 입력·출력 계약

**입력**: T035 미디어 라이브러리 + R2 binding. **출력**: `MediaQuotaCard.tsx` (Dashboard + /admin/media 헤더) + `app/application/media/services/scan-orphans.ts` + `scripts/cleanup-orphan-media.ts` + container wiring + `__tests__/`. **검증**: 위젯 표시 (총 객체수 / 용량 합계 GB), scan-orphans 가 D1 only / R2 only 양쪽 진단 + report 출력, cleanup script 가 dry-run / apply 두 모드 지원.

## 시퀀스

```
1. Application — `scan-orphans.ts` (D1 mediaRepo + R2 list 비교 → { d1Only: string[], r2Only: string[] })
2. Infrastructure — R2 list pagination cursor 처리
3. MediaQuotaCard.tsx — totalSize (bytes → GB), totalCount 표시, /admin/media 헤더 + dashboard 둘 다 마운트
4. scripts/cleanup-orphan-media.ts — `--dry-run` 으로 진단만, `--apply` 시 D1 only → DB row delete / R2 only → R2 object delete
5. package.json scripts — `media:scan:local` / `media:scan:production` / `media:cleanup:production --apply`
6. Vitest — scan-orphans 단위 (D1 fixture + R2 list mock)
7. 수동 검증 — production 데이터로 scan 실행 후 결과 보존
```

## 엣지 케이스 + 구현

## Implementation Notes

- 용량 계산: D1 의 `SUM(size)` — R2 list 안 함 (cost 절감).
- 객체 수: D1 의 `COUNT(*)`.
- scan 의 R2 list 는 cursor pagination — 1000건씩.
- cleanup 의 dry-run 이 default — apply 명시적 flag 필요.
- orphan 원인: T034 의 R2 put 성공 + D1 INSERT 실패, T035 의 D1 delete 성공 + R2 delete 실패 등. 본 task 는 retroactive 정리.
- cron 자동화 안 함 (1인 사이트 트래픽 낮음, 수동 1회/분기 충분).
- 향후 Cloudflare Cron Triggers 도입 시 별도 task.
- F022 의 'admin 이 자신의 미디어 자산을 한 눈에 본다' AC 보강.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-media-quotas-cleanup`.
- Phase 7.3 의 마무리 task — 본 task 머지 후 Phase 7.4 진입.

## DoD

- [ ] MediaQuotaCard 가 Dashboard + /admin/media 헤더에 마운트
- [ ] totalCount + totalSize (GB) 정확
- [ ] scan-orphans 가 d1Only / r2Only 양쪽 식별
- [ ] cleanup script dry-run 기본 + --apply flag
- [ ] package.json 의 media:scan / media:cleanup scripts
- [ ] Vitest scan-orphans 단위 Green
- [ ] production 수동 scan 1회 실행 결과 보존

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
