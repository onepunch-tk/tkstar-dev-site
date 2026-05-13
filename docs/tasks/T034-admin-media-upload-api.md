# T034 — feature: Admin Media Upload API — POST /admin/api/media + multipart + R2 put + 메타 INSERT

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T030](T030-access-jwt-verifier.md), [T033](T033-r2-bucket-setup.md)
> **후행**: [T035](T035-admin-media-library.md), [T036](T036-admin-post-editor-tiptap.md), [T037](T037-admin-media-quotas-cleanup.md)

---

## 목적

admin 이 이미지 (PNG/JPEG/WEBP/AVIF) + 짧은 mp4 를 업로드할 수 있는 endpoint 를 구현한다. multipart parse → MIME 검증 (allowlist) → key 생성 (`<date>/<uuid>.<ext>`) → R2 put → D1 media INSERT → 응답에 url 반환. JWT 가드 + size limit (이미지 5MB / mp4 20MB) + 변환은 본 task 범위 외.

## PRD Feature ID 매핑

- F022
- F020
- F023

## 입력·출력 계약

**입력**: POST `/admin/api/media` multipart (`file`, `alt?`). **출력**: `app/presentation/routes/admin.api.media.tsx` action + `app/application/media/services/upload-media.ts` + `app/infrastructure/media/{r2.client.ts, media.repository.ts}` + container wiring + `__tests__/`. **검증**: 정상 업로드 → 201 + `{ id, key, url, alt }`, MIME disallow → 415, size 초과 → 413, JWT 없음 → 403, R2 put 실패 → 500 + D1 INSERT rollback (또는 미수행).

## 시퀀스

```
1. Application — `upload-media.ts` (ports: R2Client + MediaRepository, input: { stream, mime, size, alt? }, MIME allowlist 검증)
2. Infrastructure — `r2.client.ts` (env.R2_MEDIA wrapper), `media.repository.ts` (D1 INSERT)
3. MIME allowlist — `image/png`, `image/jpeg`, `image/webp`, `image/avif`, `video/mp4`
4. size limit — image 5MB, mp4 20MB (mime 기반 분기)
5. key 생성 — `<yyyy-mm>/<uuidv7>.<ext>` (prefix 로 콘텐츠 유형 별도 구분 안 함, 본 task 는 단일 prefix)
6. admin.api.media.tsx action — JWT 가드 (T030 의 context.admin), multipart parse, upload-media 호출, JSON 응답
7. transactional 보장 — R2 put 성공 후 D1 INSERT. INSERT 실패 시 R2 객체 삭제 (cleanup)
8. Vitest — 정상 / wrong mime / oversized / missing JWT / R2 fail rollback 5 케이스
```

## 엣지 케이스 + 구현

## Implementation Notes

- multipart parse: Workers 의 `request.formData()` 사용 — 대용량 파일은 stream 처리 권장이지만 size limit 20MB 라 in-memory 허용.
- mime sniffing 안 함 — client 가 보낸 Content-Type 신뢰 (admin 본인 1명).
- key 의 UUIDv7 — timestamp 정렬 + 충돌 방지.
- R2 put 의 `httpMetadata` 에 cacheControl `public, max-age=31536000, immutable` (1년) — content-addressed 라 안전.
- 변환 (resize / format conversion) 본 task 범위 외 — Cloudflare Images 또는 T037 의 후속 task.
- D1 INSERT rollback 안 함 (D1 트랜잭션 미지원 가능) — R2 put 후 INSERT 실패 시 cleanup (R2 delete).
- 응답 url = `https://media.tkstar.dev/<key>`.
- alt 텍스트는 optional — admin 이 안 넘기면 빈 문자열.
- F022 / F020 / F023 3 feature 가 본 task 의 직접 cover.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-media-upload-api`.
- T035 (Media library UI) 가 본 task 의 endpoint 를 호출.

## DoD

- [ ] POST /admin/api/media JWT 가드 통과 시 201
- [ ] 응답 body { id, key, url, alt }
- [ ] MIME allowlist 5종 통과, 외 415
- [ ] size limit (image 5MB / mp4 20MB) 초과 시 413
- [ ] JWT 없음 → 403
- [ ] R2 put 실패 시 D1 INSERT 미수행 + cleanup
- [ ] R2 객체에 cacheControl 1년 immutable
- [ ] Vitest 5 케이스 Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
