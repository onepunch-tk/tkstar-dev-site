/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, Annot */

// Contact v1 — terminal form (표준 + sidebar info)
function ContactV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/contact" status="./contact --new">
      <Prompt>./contact --new</Prompt>
      <Out>{'> 메시지를 작성하세요. 평균 회신 24h 이내. hello@tkstar.dev'}</Out>
      <Sep />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 22, marginTop: 10 }}>
        <div className="col" style={{ gap: 10 }}>
          <div className="input-line"><span className="lbl">name *</span><span className="val ph">_</span></div>
          <div className="input-line"><span className="lbl">company</span><span className="val ph">(선택)</span></div>
          <div className="input-line"><span className="lbl">email *</span><span className="val ph">you@company.com</span></div>
          <div style={{ marginTop: 4 }}>
            <span className="faint" style={{ fontSize: 11 }}>의뢰 유형 *</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className="pill">[ ] B2B 채용·제안</span>
              <span className="pill on">[●] B2C 의뢰</span>
              <span className="pill">[ ] 기타</span>
            </div>
          </div>
          <div className="input-line" style={{ alignItems: 'flex-start', minHeight: 90 }}>
            <span className="lbl">message *</span>
            <span className="val ph">프로젝트 개요, 일정, 예산 범위 등<Caret /></span>
          </div>
          <div className="wf-box center" style={{ height: 50, color: 'var(--ink-faint)', fontSize: 11 }}>
            ☐ Cloudflare Turnstile (F009)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="wf-btn accent">↵ send</button>
            <Hint>Resend → hello@tkstar.dev · 자동응답 메일 발송</Hint>
          </div>
        </div>
        <aside className="col" style={{ gap: 10 }}>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">direct</span>
            <Out style={{ marginTop: 4 }}>hello@tkstar.dev<br/>gh · @tkstar<br/>x · @tkstar</Out>
          </div>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">expect</span>
            <Out style={{ lineHeight: 1.85 }}>● 24h 회신<br/>● 30분 무료 통화<br/>● 가격은 메일 협의</Out>
          </div>
        </aside>
      </div>
      <Annot x={'auto'} y={20} rot={2}>F008 · F009 · Turnstile</Annot>
    </TermWindow>
  );
}

// Contact v2 — REPL conversational
function ContactV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~/contact" status="interactive REPL">
      <Prompt>./contact --interactive</Prompt>
      <Out>{'> 어떤 분이신가요? 1/2/3 중 선택'}</Out>
      <div style={{ marginLeft: 16, marginTop: 4 }}>
        {['[1] B2B 기업 담당자','[2] B2C 의뢰 클라이언트','[3] 기타'].map((o,i)=>(
          <Out key={i} color={i===0?'var(--accent)':null}>{i===0?'▶':' '} {o}</Out>
        ))}
      </div>
      <Out style={{ marginTop: 8 }}>{'> 이름?'}</Out>
      <div className="input-line"><span className="lbl">↳</span><span className="val ph">_<Caret /></span></div>
      <Out>{'> 이메일?'}</Out>
      <div className="input-line"><span className="lbl">↳</span><span className="val ph">_</span></div>
      <Out>{'> 메시지를 입력하세요. ──── 끝나면 빈 줄.'}</Out>
      <div className="input-line" style={{ alignItems: 'flex-start', minHeight: 70 }}><span className="lbl">↳</span><span className="val ph">_</span></div>
      <Sep />
      <Out><span className="green">[ Turnstile ✓ ]</span> <KBD>↵</KBD> send · <KBD>esc</KBD> cancel</Out>
      <Annot x={'auto'} y={20} rot={-2}>대화형 REPL · 한 필드씩</Annot>
    </TermWindow>
  );
}

// Contact v3 — exit-code states (idle/success/error)
function ContactV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/contact" status="exit codes preview">
      <Prompt>./contact --states-preview</Prompt>
      <Sep />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 10 }}>
        <div className="wf-card" style={{ padding: 12 }}>
          <span className="pill">[ idle · 0 ]</span>
          <div className="input-line"><span className="lbl">name</span><span className="val ph">_</span></div>
          <div className="input-line"><span className="lbl">email</span><span className="val ph">_</span></div>
          <div className="input-line" style={{ minHeight: 50 }}><span className="lbl">msg</span><span className="val ph">_</span></div>
          <button className="wf-btn accent" style={{ marginTop: 6 }}>↵ send</button>
        </div>
        <div className="wf-card" style={{ padding: 12, borderColor: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span className="pill on">[ success · 0 ]</span>
          <div className="green" style={{ fontSize: 32 }}>✓</div>
          <span className="strong">메시지 전송됨</span>
          <Out>자동응답 메일 발송 ✓</Out>
          <button className="wf-btn ghost">새 메시지</button>
        </div>
        <div className="wf-card" style={{ padding: 12, borderColor: 'var(--warn)' }}>
          <span className="pill" style={{ color: 'var(--warn)', borderColor: 'var(--warn)' }}>[ error · 1 ]</span>
          <Out>resend.send() failed</Out>
          <Out className="faint">Error: 503 upstream</Out>
          <button className="wf-btn">재시도</button>
          <Out style={{ fontSize: 11 }}>또는 직접 메일 보내기:</Out>
          <a className="green" style={{ fontSize: 11 }}>mailto:hello@tkstar.dev</a>
        </div>
      </div>
      <Annot x={'auto'} y={20} rot={2}>3 상태 · exit code 메타포</Annot>
    </TermWindow>
  );
}

// App Terms v1 — `cat legal/apps/moai/terms.mdx`
function AppTermsV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/legal/apps/moai" status="terms.mdx · v1.0">
      <Prompt>cat terms.mdx</Prompt>
      <Sep />
      <span className="pill">app: moai · v1.0 · effective 2026.04.01</span>
      <h1 className="term-h1" style={{ marginTop: 8, fontSize: 24 }}>Moai 이용약관</h1>
      <div className="wf-box" style={{ padding: 10, marginTop: 8, fontSize: 11, color: 'var(--ink-faint)' }}>
        ⚠ MVP skeleton · velite collection legal/apps/moai/terms.mdx — 앱 출시 시 채움
      </div>
      <div className="section-bar">## 1. 목적 <span className="line" /></div>
      <Out>───── 본문 ─────</Out>
      <div className="section-bar">## 2. 용어의 정의 <span className="line" /></div>
      <Out>───── 본문 ─────</Out>
      <div className="section-bar">## 3. 서비스 제공 <span className="line" /></div>
      <Out>───── 본문 ─────</Out>
      <Annot x={'auto'} y={20} rot={2}>F014 · 앱별 라우팅</Annot>
    </TermWindow>
  );
}

// App Privacy v1 — split with meta
function AppPrivacyV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/legal/apps/moai" status="privacy.mdx · v1.0">
      <Prompt>cat privacy.mdx</Prompt>
      <Sep />
      <h1 className="term-h1" style={{ fontSize: 22, marginTop: 8 }}>개인정보처리방침</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 22, marginTop: 8 }}>
        <div>
          <div className="section-bar">## 1. 수집 항목 <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
          <div className="section-bar">## 2. 이용 목적 <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
          <div className="section-bar">## 3. 보관 기간 <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
        </div>
        <aside className="wf-card" style={{ padding: 10 }}>
          <span className="pill">meta</span>
          <Out style={{ lineHeight: 1.95 }}>
            app ─ moai<br/>version ─ 1.0<br/>시행일 ─ 2026.04.01<br/>문의 ─ hello@tkstar.dev
          </Out>
          <button className="wf-btn ghost" style={{ marginTop: 8 }}>cd ../terms →</button>
        </aside>
      </div>
      <Annot x={'auto'} y={20} rot={-2}>앱 출시 시 채움</Annot>
    </TermWindow>
  );
}

// Legal skeleton — 라우팅 상태
function LegalSkeleton({ lang = 'ko' }) {
  return (
    <TermWindow path="~/legal" status="MVP · pending fill">
      <Prompt>find legal/apps/ -name '*.mdx'</Prompt>
      <Sep />
      <h1 className="term-h1" style={{ fontSize: 22, marginTop: 8 }}>Legal — 앱별 약관 / 처리방침</h1>
      <Out>출시 앱마다 자동 노출 · MVP는 라우팅 + 빈 템플릿만</Out>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 12 }}>
        {[
          ['moai',['pending','pending']],
          ['(slug)',['—','—']],
        ].map(([app, st], i)=>(
          <div key={i} className="wf-card" style={{ padding: 12 }}>
            <span className="pill on">{app}</span>
            <Out style={{ marginTop: 6 }}>
              /legal/apps/{app}/terms <span className="amber">{st[0]}</span><br/>
              /legal/apps/{app}/privacy <span className="amber">{st[1]}</span>
            </Out>
          </div>
        ))}
      </div>
      <div className="wf-box" style={{ padding: 10, marginTop: 14, fontSize: 11, color: 'var(--ink-faint)' }}>
        velite collection: <span className="green">legal/apps/[slug]/(terms|privacy).mdx</span><br/>
        Zod schema: app_slug · doc_type · version · effective_date · body
      </div>
      <Annot x={'auto'} y={20} rot={2}>F014 · 점진적 채움</Annot>
    </TermWindow>
  );
}

Object.assign(window, { ContactV1, ContactV2, ContactV3, AppTermsV1, AppPrivacyV1, LegalSkeleton });
