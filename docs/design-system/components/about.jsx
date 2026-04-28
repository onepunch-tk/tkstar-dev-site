/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot */

// About v1 — `cat resume.md` style readout (섹션 카드형 정보 보존)
function AboutV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/about" status="resume.md · 4.2k">
      <Prompt>cat resume.md</Prompt>
      <Sep />
      <div className="section-bar">// HEAD <span className="line" /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="term-h2">김태곤 <span className="faint" style={{ fontSize: 13 }}>· solo developer</span></h2>
          <Out>풀스택 · 제품 설계 · 운영까지 / hello@tkstar.dev</Out>
        </div>
        <button className="wf-btn accent">⎙ ./resume --pdf</button>
      </div>

      <div className="section-bar">// STACK <span className="line" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[['frontend',['ts','react','tw','vite']],['edge / be',['cf workers','d1','do','rsc']],['quality',['vitest','biome','tdd','clean-arch']]].map(([cat, list])=>(
          <div key={cat} className="wf-card" style={{ padding: 12 }}>
            <span className="pill on">{cat}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {list.map(t => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="section-bar">// EXPERIENCE <span className="line" /></div>
      {[
        ['2024 — now','회사 A · 시니어 개발자','● 결제 인프라 마이그레이션 · -40% 비용 ● DS 통합 · 컴포넌트 80→24'],
        ['2022 — 2024','회사 B · 풀스택 개발자','● 0→1 SaaS 출시 · 8주 ● 운영 자동화로 on-call 0건/주'],
        ['2020 — 2022','회사 C · 주니어','● 신규 프론트엔드 채택 · React 18 도입'],
      ].map(([y,t,b],i)=>(
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, padding: '8px 0', borderBottom: '1.5px dashed var(--line)' }}>
          <span className="faint" style={{ fontSize: 11 }}>{y}</span>
          <div>
            <span className="strong" style={{ fontSize: 13 }}>{t}</span>
            <Out>{b}</Out>
          </div>
        </div>
      ))}

      <div className="section-bar">// EDUCATION · AWARDS <span className="line" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        <div className="wf-card" style={{ padding: 12 }}><span className="pill">edu</span><Out>○○대학교 컴퓨터공학 · 2016—2020</Out></div>
        <div className="wf-card" style={{ padding: 12 }}><span className="pill">awards</span><Out>○○ 해커톤 1위 · 2024<br/>오픈소스 컨트리뷰터 · 2023</Out></div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Prompt dim>./resume --pdf</Prompt>
        <Hint>F003 · @media print 단순화 (헤더·토글·터미널 chrome 숨김)</Hint>
      </div>

      <Annot x={'auto'} y={20} rot={2}>섹션 = 마크다운 파일 / cat 출력</Annot>
    </TermWindow>
  );
}

// About v2 — `git log --career` 타임라인
function AboutV2({ lang = 'ko' }) {
  const log = [
    { h: 'a3f12b', d: '2026-04', t: 'feat(career): solo studio launched', tags: ['solo','tkstar.dev'] },
    { h: '7c2901', d: '2024-08', t: 'feat: senior @ company A', tags: ['ts','cf','d1'] },
    { h: '5b8e44', d: '2022-03', t: 'feat: fullstack @ company B', tags: ['react','rails'] },
    { h: '2a17ee', d: '2020-06', t: 'init: junior @ company C', tags: ['js','vue'] },
    { h: '0001cf', d: '2020-02', t: 'init: B.S. computer science', tags: ['edu'] },
  ];
  return (
    <TermWindow path="~/about" status="git log --career --graph">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 22 }}>
        <div>
          <Prompt>git log --career --graph</Prompt>
          <Sep />
          {log.map((c,i) => (
            <div key={c.h} style={{ display: 'grid', gridTemplateColumns: '20px 90px 80px 1fr', gap: 8, fontSize: 12, padding: '8px 0', borderBottom: '1.5px dashed var(--line)', alignItems: 'baseline' }}>
              <span className="green">{i===0?'●':'│'}</span>
              <span className="amber" style={{ fontFamily: 'var(--mono)' }}>{c.h}</span>
              <span className="faint">{c.d}</span>
              <div>
                <span className="strong">{c.t}</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {c.tags.map(t => <span key={t} className="pill">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="col" style={{ gap: 10 }}>
          <div className="wf-card" style={{ padding: 12 }}>
            <div className="ph-img" style={{ height: 80 }}>avatar</div>
            <div style={{ marginTop: 8 }}>
              <span className="strong">김태곤</span>
              <Out>solo · seoul</Out>
            </div>
          </div>
          <button className="wf-btn accent">⎙ ./resume --pdf</button>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">refs</span>
            <div className="muted" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.85 }}>
              · HEAD → main<br/>· tag: v0.1.0<br/>· branch: tkstar/dev
            </div>
          </div>
        </aside>
      </div>
      <Annot x={'auto'} y={60} rot={-2}>커리어 = git log · 한 눈에 흐름</Annot>
    </TermWindow>
  );
}

// About v3 — 화면용 / 인쇄용 split
function AboutV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/about" status="screen ⇆ print preview">
      <Prompt>./resume --preview --split=screen,print</Prompt>
      <Sep />
      <div className="split" style={{ border: '1.5px dashed var(--line-strong)', borderRadius: 6, minHeight: 360 }}>
        <div className="split-pane">
          <span className="pill on">screen · dark</span>
          <h2 className="term-h2">김태곤 <span className="faint">· solo</span></h2>
          <Out>풍부한 시각, 다크모드, hover 인터랙션 ─────</Out>
          <Hint>이력서 콘텐츠는 동일 — 스타일만 분기</Hint>
          <Sep />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Out>● intro</Out>
            <Out>● stack (categorized)</Out>
            <Out>● experience (3 entries)</Out>
            <Out>● education · awards</Out>
          </div>
        </div>
        <div className="split-pane" style={{ background: '#f4f1ea', color: '#1a1c20' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.1em', color: '#5a6068' }}>PRINT · A4 · @media print</span>
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: 18, margin: 0, color: '#1a1c20' }}>김태곤</h2>
          <div style={{ fontSize: 10, color: '#5a6068' }}>solo developer · hello@tkstar.dev</div>
          <div style={{ height: 1, background: '#c8c2b3', margin: '6px 0' }} />
          <div style={{ fontSize: 10, lineHeight: 1.7, color: '#1a1c20', fontFamily: 'var(--mono)' }}>
            <strong>EXPERIENCE</strong><br/>
            ─ Company A · 2024-now<br/>
            ─ Company B · 2022-2024<br/>
            ─ Company C · 2020-2022<br/><br/>
            <strong>STACK</strong> TypeScript, React, Cloudflare, MDX...
          </div>
          <Hint>hide: header, toggles, terminal chrome, hand annotations</Hint>
        </div>
      </div>
      <Annot x={'auto'} y={20} rot={1}>F003 · 듀얼 출력</Annot>
    </TermWindow>
  );
}

Object.assign(window, { AboutV1, AboutV2, AboutV3 });
