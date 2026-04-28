/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot */

// Project Detail v1 — `cat case.mdx` 선형 narrative
function ProjectDetailV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/projects/whiteboard-rt" status="case.mdx · 6 min read">
      <Prompt>cat case.mdx</Prompt>
      <Out>{`> frontmatter ✓  shiki ✓  satori-og ✓`}</Out>
      <Sep />
      <span className="pill on">case study · 2026.03</span>
      <h1 className="term-h1" style={{ marginTop: 8 }}>실시간 협업 화이트보드</h1>
      <Out>WebSocket → Durable Objects 마이그레이션, p99 -80%</Out>
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>{['ts','do','wss','vitest'].map(t=><span key={t} className="pill">{t}</span>)}</div>
      <div className="ph-img" style={{ height: 180, marginTop: 12 }}>cover · 1200×600 · satori OG</div>

      <div className="section-bar">## 01 · problem <span className="line" /></div>
      <Out>기존 단일 WS 서버 구조에서 동시접속 100+ 시 p99 지연 2초 초과. 룸 단위 격리 안됨.</Out>

      <div className="section-bar">## 02 · approach <span className="line" /></div>
      <Out>Durable Objects로 룸 단위 샤딩 + Hibernation API로 idle 비용 절감.</Out>
      <div className="code">
        <span className="c">{'// shiki highlighted'}</span>{'\n'}
        <span className="k">export class</span> <span className="f">Whiteboard</span> <span className="k">extends</span> DurableObject {`{`}{'\n'}
        {'  '}<span className="k">async</span> <span className="f">fetch</span>(req: Request) {`{`}{'\n'}
        {'    '}<span className="k">const</span> id = <span className="k">this</span>.state.id.toString(){'\n'}
        {'    '}<span className="k">return</span> <span className="s">'ok'</span>{'\n'}
        {'  }'}{'\n'}
        {`}`}
      </div>

      <div className="section-bar">## 03 · results <span className="line" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[['p99 지연','-80%'],['Idle 비용','-90%'],['MAU','+3.2k']].map(([k,v])=>(
          <div key={k} className="metric"><span className="v">{v}</span><span className="k">{k}</span></div>
        ))}
      </div>
      <div className="ph-img" style={{ height: 130, marginTop: 12 }}>screenshots · 3-up</div>

      <Sep />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <button className="wf-btn ghost">← cd ../sales-saas</button>
        <button className="wf-btn accent">$ ./contact --inquiry</button>
        <button className="wf-btn ghost">cd ../mini-cms →</button>
      </div>
      <Annot x={'auto'} y={20} rot={2}>F005 · 문제→접근→결과 / F011 · OG</Annot>
    </TermWindow>
  );
}

// Project Detail v2 — sticky meta + TOC sidebar
function ProjectDetailV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~/projects/sales-saas" status="case study · sticky TOC">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
        <div>
          <Prompt>cat case.mdx</Prompt>
          <Sep />
          <h1 className="term-h1">매출 분석 SaaS</h1>
          <Out>소상공인 대상 · 결제 → 인사이트 · 8주 단독 출시</Out>
          <div className="ph-img" style={{ height: 170, marginTop: 12 }}>hero · 16:9</div>

          <div className="section-bar">## P · problem <span className="line" /></div>
          <Out>───── 3-5줄 ─────</Out>
          <div className="section-bar">## A · approach <span className="line" /></div>
          <Out>───── 3-5줄 ─────</Out>
          <div className="section-bar">## R · results <span className="line" /></div>
          <Out>───── 수치 + 스크린샷 ─────</Out>
        </div>
        <aside style={{ position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div className="wf-card" style={{ padding: 12 }}>
            <span className="pill">meta</span>
            <div className="muted" style={{ fontSize: 11, lineHeight: 2, marginTop: 6, fontFamily: 'var(--mono)' }}>
              year ─ 2025<br/>role ─ solo<br/>stack ─ ts · d1<br/>links ─ live · gh
            </div>
          </div>
          <div className="wf-card" style={{ padding: 12, marginTop: 8 }}>
            <span className="pill">toc</span>
            <div className="muted" style={{ fontSize: 11, lineHeight: 1.95, marginTop: 6 }}>
              · problem<br/>· <span className="green">approach</span><br/>· results<br/>· reflection
            </div>
          </div>
          <button className="wf-btn accent" style={{ marginTop: 8 }}>./contact --inquiry</button>
        </aside>
      </div>
      <Annot x={'auto'} y={50} rot={-2}>sticky meta · TOC scroll-spy</Annot>
    </TermWindow>
  );
}

// Project Detail v3 — editorial / large type / man page
function ProjectDetailV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/projects/mini-cms" status="man mini-cms">
      <Prompt>man mini-cms</Prompt>
      <Sep />
      <span className="pill" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>OSS · 003</span>
      <h1 className="term-h1" style={{ fontSize: 48, lineHeight: 1.05, margin: '8px 0' }}>
        Mini CMS,<br/><span className="muted">in 200 lines.</span>
      </h1>
      <Out>velite + MDX 만으로 헤드리스 CMS를 만들 수 있을까?</Out>
      <Sep />
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, fontSize: 12, marginTop: 8 }}>
        <span className="pill">NAME</span><Out>mini-cms — minimal headless content collection</Out>
        <span className="pill">SYNOPSIS</span><Out>velite + zod + mdx. no db. build-time index.</Out>
        <span className="pill">PROBLEM</span><Out>───── 3-5줄 ─────</Out>
        <span className="pill">APPROACH</span><Out>───── 3-5줄 + code ─────</Out>
        <span className="pill">RESULTS</span><Out>★200 · 12 contrib · 4 prod use</Out>
      </div>
      <Annot x={'auto'} y={20} rot={2}>man page 메타포 · 두꺼운 타입</Annot>
    </TermWindow>
  );
}

Object.assign(window, { ProjectDetailV1, ProjectDetailV2, ProjectDetailV3 });
