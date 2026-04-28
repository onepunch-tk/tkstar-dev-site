/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot */

// ─────────────────────────────────────────────────────
// HOME — every variant uses TermWindow
// ─────────────────────────────────────────────────────

// v1 · 부팅 시퀀스 + 자동 추천 (재방문 분기 강조)
function HomeV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~" status="home.tsx · returning visitor">
      <Prompt>./tkstar --boot</Prompt>
      <Out>booting tkstar.dev v0.1.0 ...</Out>
      <Out><span className="green">✓</span> theme loaded</Out>
      <Out><span className="green">✓</span> mdx collections indexed (5 projects, 6 posts)</Out>
      <Out><span className="green">✓</span> localStorage: <span className="amber">audience=B2B</span> (last visit 2d ago)</Out>
      <Sep />
      <Prompt>./tkstar --who-are-you</Prompt>
      <Out style={{ marginTop: 6 }}>
        <span className="strong" style={{ fontSize: 16 }}>안녕하세요, 1인 개발자 김태곤입니다.</span>
      </Out>
      <Out>웹/앱 제품을 처음부터 끝까지 혼자 설계·구현·운영합니다.</Out>

      <div style={{ marginTop: 18 }} />
      <Out><span className="amber">✦ recommend</span> — 지난번 동선을 이어가시겠어요?</Out>
      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <button className="wf-btn accent">▶ /about · 이력서 이어보기</button>
        <button className="wf-btn">/projects</button>
        <button className="wf-btn ghost">/contact</button>
      </div>
      <Hint>F015 · localStorage 분기 기억 · <KBD>tab</KBD> 으로 이동 <KBD>enter</KBD> 진입</Hint>
      <div style={{ marginTop: 16 }}><Prompt><Caret /></Prompt></div>

      <Annot x={'auto'} y={20} color="var(--accent-2)" rot={2}>
        터미널 부팅 시퀀스가 곧<br/>self-introduction
      </Annot>
    </TermWindow>
  );
}

// v2 · 분기 split — 두 명령어가 동시에
function HomeV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~" status="audience split · F001">
      <Prompt>./tkstar --who-are-you</Prompt>
      <Out>{'> 두 가지 입구로 안내합니다. 한 쪽을 골라주세요.'}</Out>
      <div style={{ height: 12 }} />
      <div className="split" style={{ border: '1.5px dashed var(--line-strong)', borderRadius: 6, minHeight: 280 }}>
        <div className="split-pane">
          <span className="pill on">[1] HIRING · B2B</span>
          <h2 className="term-h2">기업 담당자이신가요?</h2>
          <Out>$ cat resume.md  →  이력 · 스택 · 경력</Out>
          <Out>$ ./resume --pdf  →  window.print()</Out>
          <Out>$ ls projects/   →  심화 검토</Out>
          <div style={{ flex: 1 }} />
          <button className="wf-btn accent" style={{ alignSelf: 'flex-start' }}>▶ enter /about</button>
        </div>
        <div className="split-pane">
          <span className="pill" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>[2] COMMISSION · B2C</span>
          <h2 className="term-h2">프로젝트 의뢰가<br/>필요하신가요?</h2>
          <Out>$ ls projects/   →  케이스 스터디</Out>
          <Out>$ open ./case  →  문제→접근→결과</Out>
          <Out>$ ./contact --new →  메일 협의</Out>
          <div style={{ flex: 1 }} />
          <button className="wf-btn" style={{ alignSelf: 'flex-start' }}>▶ enter /projects</button>
        </div>
      </div>
      <Hint>그냥 둘러보고 싶으세요? <span className="green" style={{ borderBottom: '1px dashed' }}>./explore --all</span></Hint>
      <Annot x={'auto'} y={70} rot={-3}>
        F001 · 첫 방문엔<br/>두 명령어 동등하게
      </Annot>
    </TermWindow>
  );
}

// v3 · whoami 한 줄 큰 타입 + cmd palette 미리보기
function HomeV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~" status="press ⌘K to navigate">
      <Prompt>whoami</Prompt>
      <div style={{ margin: '14px 0 8px' }}>
        <h1 className="term-h1" style={{ fontSize: 44 }}>
          ship <span className="green">solo</span>.<br/>
          <span className="muted">ship </span>fast<span className="muted">.</span>
        </h1>
      </div>
      <Out>1명의 개발자. 풀스택. 제품 설계부터 운영까지. <Caret /></Out>
      <div style={{ marginTop: 22 }}>
        <Prompt>⌘K</Prompt>
        <div className="wf-card" style={{ padding: 0, marginTop: 6, background: 'var(--bg-elev)' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1.5px dashed var(--line)', fontSize: 12 }}>
            <span className="green">›</span> <span className="strong">go to ─ </span><span className="faint">_</span>
          </div>
          {[
            ['/about','이력서 · 채용 검토',' B2B'],
            ['/projects','포트폴리오 · 케이스 스터디',' B2C'],
            ['/blog','월 1편 기록',''],
            ['/contact','의뢰 · 제안',''],
          ].map(([p,d,b],i)=>(
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1.5px dashed var(--line)', fontSize: 12, color: i===0?'var(--accent)':'var(--ink-dim)' }}>
              <span style={{ width: 14 }}>{i===0?'▶':' '}</span>
              <span className="strong" style={{ minWidth: 100 }}>{p}</span>
              <span className="faint">{d}</span>
              {b && <span className="pill" style={{ marginLeft: 'auto' }}>{b.trim()}</span>}
            </div>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: 'var(--ink-faint)' }}>
            <KBD>↑↓</KBD> 이동 <KBD>↵</KBD> 진입 <KBD>esc</KBD> 닫기
          </div>
        </div>
      </div>
      <Annot x={'auto'} y={60} rot={3}>
        커맨드 팔레트가<br/>주 네비게이션
      </Annot>
    </TermWindow>
  );
}

window.HomeV1 = HomeV1; window.HomeV2 = HomeV2; window.HomeV3 = HomeV3;
