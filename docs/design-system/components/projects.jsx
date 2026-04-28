/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot */

// Projects v1 — `ls -la projects/` 리스트
function ProjectsV1({ lang = 'ko' }) {
  const items = [
    ['drwxr-x','2026-03','whiteboard-rt','실시간 협업 화이트보드','ts · do · wss','3.2k'],
    ['drwxr-x','2025-11','sales-saas','매출 분석 SaaS','react · d1 · stripe','8wk'],
    ['drwxr-x','2025-06','mini-cms','velite + MDX 헤드리스 CMS','mdx · velite','★200'],
    ['drwxr-x','2024-09','ds-migration','styled → tailwind 4 마이그레이션','tw 4 · rtk',''],
    ['-rw-r--','2024-02','react-edge-rsc','Workers RSC streaming PoC','rsc · workers','oss'],
  ];
  return (
    <TermWindow path="~/projects" status={`ls -la · ${items.length} entries`}>
      <Prompt>ls -la projects/</Prompt>
      <Out>total {items.length} · velite collection · sorted by published_at desc</Out>
      <Sep />
      <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 160px 1fr 200px 60px', fontSize: 11, color: 'var(--ink-faint)', padding: '4px 0', letterSpacing: '0.08em', borderBottom: '1.5px solid var(--line-strong)' }}>
        <span>perm</span><span>date</span><span>slug</span><span>title · summary</span><span>stack</span><span>meta</span>
      </div>
      {items.map((r,i)=>(
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 80px 160px 1fr 200px 60px', gap: 4, padding: '10px 0', borderBottom: '1.5px dashed var(--line)', fontSize: 12, alignItems: 'center' }}>
          <span className="faint">{r[0]}</span>
          <span className="faint">{r[1]}</span>
          <span className="amber">{r[2]}/</span>
          <div>
            <span className="strong">{r[3]}</span>
          </div>
          <span className="faint" style={{ fontSize: 11 }}>{r[4]}</span>
          <span className="faint" style={{ fontSize: 11 }}>{r[5]}</span>
        </div>
      ))}
      <Hint>$ cd whiteboard-rt — 케이스 스터디로 진입</Hint>
      <Annot x={'auto'} y={20} rot={2}>F004 · ls 메타포 / MDX collection</Annot>
    </TermWindow>
  );
}

// Projects v2 — featured + grep filter
function ProjectsV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~/projects" status="grep --tag · featured pinned">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Prompt>grep --tag</Prompt>
        <span className="input-line" style={{ flex: 1, padding: '2px 0' }}>
          <span className="val ph">all · saas · oss · client · solo</span>
        </span>
      </div>
      <Sep />
      <span className="pill on" style={{ marginTop: 8 }}>★ featured</span>
      <div className="wf-card" style={{ marginTop: 6, padding: 16, borderColor: 'var(--accent)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div>
          <h2 className="term-h2">whiteboard-rt</h2>
          <Out>실시간 협업 화이트보드 · WebSocket → Durable Objects 마이그레이션</Out>
          <Out className="green">p99 -80% · idle cost -90% · MAU +3.2k</Out>
          <div style={{ display: 'flex', gap: 4, margin: '10px 0' }}>
            {['ts','do','wss','vitest'].map(t=><span key={t} className="pill">{t}</span>)}
          </div>
          <button className="wf-btn accent">$ cd whiteboard-rt</button>
        </div>
        <div className="ph-img" style={{ height: 160 }}>cover · 16:9</div>
      </div>

      <div className="section-bar">// other projects <span className="line" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {['sales-saas','mini-cms','ds-migration','react-edge-rsc'].map(s => (
          <div key={s} className="wf-card" style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 10, padding: 10 }}>
            <div className="ph-img" style={{ height: 56 }}>thumb</div>
            <div>
              <span className="amber" style={{ fontSize: 12 }}>{s}/</span>
              <Out>한 줄 요약 ─────</Out>
              <div style={{ display: 'flex', gap: 4 }}>{['ts','react'].map(t=><span key={t} className="pill">{t}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
      <Annot x={'auto'} y={50} rot={-2}>대표작 1 + 2-up · 태그 grep</Annot>
    </TermWindow>
  );
}

// Projects v3 — tree view (filesystem index)
function ProjectsV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/projects" status="tree -L 2 · 5 dirs">
      <Prompt>tree -L 2 projects/</Prompt>
      <Sep />
      <div className="tree" style={{ marginTop: 8 }}>
        <div className="row on">projects/</div>
        {[
          ['├──','whiteboard-rt/','ts · do · wss','2026-03'],
          ['│   ├──','case.mdx','',''],
          ['│   └──','assets/','',''],
          ['├──','sales-saas/','react · d1','2025-11'],
          ['├──','mini-cms/','mdx · velite','2025-06'],
          ['├──','ds-migration/','tw 4','2024-09'],
          ['└──','react-edge-rsc/','rsc · workers','2024-02'],
        ].map((r,i)=>(
          <div key={i} className="row" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px', alignItems: 'baseline' }}>
            <span className="tk">{r[0]}</span>
            <span className={r[1].endsWith('/') && !r[1].includes('.') ? 'amber' : 'faint'}>{r[1]}</span>
            <span className="faint" style={{ fontSize: 11 }}>{r[2]}</span>
            <span className="faint" style={{ fontSize: 11 }}>{r[3]}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Out>5 directories, 1 file</Out>
        <Prompt dim>cd <span className="amber">whiteboard-rt</span> && cat case.mdx<Caret /></Prompt>
      </div>
      <Annot x={'auto'} y={40} rot={3}>tree · 파일시스템 메타포</Annot>
    </TermWindow>
  );
}

Object.assign(window, { ProjectsV1, ProjectsV2, ProjectsV3 });
