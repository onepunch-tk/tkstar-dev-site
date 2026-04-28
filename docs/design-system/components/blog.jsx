/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot */

// Blog v1 — `ls posts/` 리스트
function BlogV1({ lang = 'ko' }) {
  const posts = [
    ['2026-04-20','cf-rsc-running','Cloudflare Workers + RSC, 한 달 운영기','8 min',['rsc','cf']],
    ['2026-03-11','velite-mdx','velite로 MDX 컬렉션 다루기','6 min',['mdx','velite']],
    ['2026-02-02','solo-ops','1인 개발자의 운영 자동화','5 min',['ops']],
    ['2026-01-05','tw4-migrate','Tailwind 4 마이그레이션 메모','7 min',['tw']],
    ['2025-12-08','vitest-tdd','Vitest로 TDD 워크플로 만들기','9 min',['tdd']],
  ];
  return (
    <TermWindow path="~/blog" status={`${posts.length} posts · /rss.xml`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <Prompt>ls posts/ --sort=date</Prompt>
        <span className="pill on">📡 /rss.xml</span>
      </div>
      <Sep />
      <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
        {['all','rsc','cf','mdx','tw','ops','tdd'].map((t,i)=>(
          <span key={t} className={i===0?'pill on':'pill'}>#{t}</span>
        ))}
      </div>
      {posts.map((p,i)=>(
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 180px 1fr 60px 30px', gap: 12, padding: '10px 0', borderBottom: '1.5px dashed var(--line)', alignItems: 'center', fontSize: 12 }}>
          <span className="faint">{p[0]}</span>
          <span className="amber">{p[1]}.mdx</span>
          <div>
            <span className="strong">{p[2]}</span>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>{p[4].map(t=><span key={t} className="pill">#{t}</span>)}</div>
          </div>
          <span className="faint" style={{ fontSize: 11 }}>{p[3]}</span>
          <span className="green">→</span>
        </div>
      ))}
      <Annot x={'auto'} y={20} rot={2}>F006 · F012 RSS</Annot>
    </TermWindow>
  );
}

// Blog v2 — year archive (history)
function BlogV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~/blog" status="history --year">
      <Prompt>history --by=year</Prompt>
      <Sep />
      <h1 className="term-h1" style={{ fontSize: 32, marginTop: 8 }}>writing<span className="muted">.log</span></h1>
      <Out>월 1편 · 기술/회고</Out>
      {[
        ['2026',[
          ['04','Cloudflare Workers + RSC, 한 달 운영기'],
          ['03','velite로 MDX 컬렉션 다루기'],
          ['02','1인 개발자의 운영 자동화'],
          ['01','Tailwind 4 마이그레이션 메모'],
        ]],
        ['2025',[
          ['12','Vitest로 TDD 워크플로 만들기'],
          ['11','Resend로 1인 메일 인프라 만들기'],
        ]],
      ].map(([y, items])=>(
        <div key={y} style={{ marginTop: 14 }}>
          <div className="section-bar">{y} <span className="line" /></div>
          {items.map((it,i)=>(
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 30px', gap: 10, padding: '8px 0', borderBottom: '1.5px dashed var(--line)', fontSize: 12, alignItems: 'center' }}>
              <span className="faint">.{it[0]}</span>
              <span className="strong">{it[1]}</span>
              <span className="green">→</span>
            </div>
          ))}
        </div>
      ))}
      <Annot x={'auto'} y={50} rot={-2}>history · year-grouped</Annot>
    </TermWindow>
  );
}

// Blog v3 — card grid w/ OG preview
function BlogV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/blog" status="grid --og-preview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 18 }}>
        <div>
          <Prompt>./blog --grid --og</Prompt>
          <Sep />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 10 }}>
            {[1,2,3,4].map(i=>(
              <div key={i} className="wf-card" style={{ padding: 10 }}>
                <div className="ph-img" style={{ height: 80 }}>satori og · 1200×630</div>
                <Out style={{ marginTop: 6 }}><span className="faint">2026.0{i}.11 · 6 min</span></Out>
                <span className="strong" style={{ fontSize: 13 }}>포스트 제목 {i}</span>
                <Out>한 줄 요약 ─────</Out>
                <div style={{ display: 'flex', gap: 4 }}>{['rsc','cf'].map(t=><span key={t} className="pill">#{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="col" style={{ gap: 10 }}>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {['rsc','cf','mdx','tw','ops','tdd'].map(t=><span key={t} className="pill">#{t}</span>)}
            </div>
          </div>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">archive</span>
            <Out>2026 · 4<br/>2025 · 2</Out>
          </div>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">📡 rss</span>
            <Out>/rss.xml</Out>
          </div>
        </aside>
      </div>
      <Annot x={'auto'} y={20} rot={2}>OG 미리보기 강조</Annot>
    </TermWindow>
  );
}

Object.assign(window, { BlogV1, BlogV2, BlogV3 });
