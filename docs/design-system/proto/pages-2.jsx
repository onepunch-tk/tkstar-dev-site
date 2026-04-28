/* global React, POSTS, APPS, PromptLine */
(() => {
const { useState, useMemo } = React;

// ─────────────────────────────────────────────────────
// BLOG list
// ─────────────────────────────────────────────────────
function BlogPage({ nav }) {
  const [tag, setTag] = useState('all');
  const tags = useMemo(() => {
    const s = new Set();
    POSTS.forEach(p => (p.tags||[]).forEach(t => s.add(t)));
    return ['all', ...s];
  }, []);
  const list = useMemo(() => tag === 'all' ? POSTS : POSTS.filter(p => p.tags?.includes(tag)), [tag]);
  return (
    <>
      <PromptLine cmd="ls posts/ --sort=date" />
      <div className="between" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <h1 className="h2">writing<span className="dim">.log</span></h1>
        <span className="pill2 on">📡 /rss.xml</span>
      </div>
      <div className="cluster">
        {tags.map(t => <button key={t} className={'pill2 ' + (tag===t?'on':'')} onClick={()=>setTag(t)}>#{t}</button>)}
      </div>
      <div className="stack" style={{ gap: 0 }}>
        {list.map(p => (
          <a key={p.slug} className="row-link" href={`#/blog/${p.slug}`} onClick={(e)=>{e.preventDefault();nav(`/blog/${p.slug}`);}}>
            <span className="date">{p.date}</span>
            <span className="title">{p.title}<span className="dim" style={{ fontWeight: 400, fontSize: 12 }}> ─ {p.lede}</span></span>
            <span className="meta">{p.read}</span>
          </a>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// BLOG DETAIL
// ─────────────────────────────────────────────────────
function BlogDetailPage({ slug, nav }) {
  const idx = POSTS.findIndex(p => p.slug === slug);
  const p = POSTS[idx];
  if (!p) {
    return (
      <>
        <PromptLine cmd={`cat blog/${slug}.mdx`} />
        <p className="body">no such file: {slug}.mdx</p>
        <a className="btn" href="#/blog" onClick={(e)=>{e.preventDefault();nav('/blog');}}>← /blog</a>
      </>
    );
  }
  const prev = POSTS[idx - 1];
  const next = POSTS[idx + 1];
  return (
    <div className="two-col">
      <article className="stack-lg">
        <PromptLine cmd={`cat blog/${p.slug}.mdx`} />
        <div className="cluster">
          <span className="pill2">{p.date}</span>
          <span className="pill2">{p.read}</span>
          {p.tags?.map(t => <span key={t} className="pill2">#{t}</span>)}
        </div>
        <h1 className="h1" style={{ fontSize: 'clamp(26px, 5vw, 36px)' }}>{p.title}</h1>
        <p className="body dim">{p.lede}</p>
        <div className="cover">satori og · 1200×630</div>

        <div className="section-h">1. 들어가며 <span className="grow" /></div>
        <p className="body">한 달간의 운영 기록. 단일 region에서 출발해 KV 캐싱과 RSC streaming을 단계적으로 도입.</p>

        <div className="section-h">2. 코드 <span className="grow" /></div>
        <p className="body dim">실제 운영 핸들러는 다음과 같이 단순화된다.</p>
        <pre className="codeblock"><code>{`async function handler(req) {
  const rsc = await render(req)
  return new Response(rsc, { headers: { 'content-type': 'text/x-component' } })
}`}</code></pre>

        <div className="section-h">3. 결론 <span className="grow" /></div>
        <p className="body">cold start은 신경쓸 만큼 크지 않았고, 캐싱이 90%를 해결했다.</p>

        <hr className="hr" />
        <div className="between">
          {prev ? <a className="btn ghost" href={`#/blog/${prev.slug}`} onClick={(e)=>{e.preventDefault();nav(`/blog/${prev.slug}`);}}>← {prev.slug}</a> : <span />}
          <a className="btn ghost" href="#/blog" onClick={(e)=>{e.preventDefault();nav('/blog');}}>모든 글</a>
          {next ? <a className="btn ghost" href={`#/blog/${next.slug}`} onClick={(e)=>{e.preventDefault();nav(`/blog/${next.slug}`);}}>{next.slug} →</a> : <span />}
        </div>
      </article>
      <aside className="side stack" style={{ gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="faint2" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>on this page</div>
          <div style={{ fontSize: 12, lineHeight: 2 }}>
            <div><a href="#1" className="dim" style={{ textDecoration: 'none' }}>· 들어가며</a></div>
            <div><a href="#2" className="dim" style={{ textDecoration: 'none' }}>· 코드</a></div>
            <div><a href="#3" className="dim" style={{ textDecoration: 'none' }}>· 결론</a></div>
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="faint2" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>share</div>
          <div className="cluster">
            <button className="pill2" onClick={() => navigator.clipboard?.writeText(window.location.href)}>copy link</button>
            <a className="pill2" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}`}>x</a>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────
function ContactPage({ nav }) {
  const [form, setForm] = useState({ name: '', email: '', kind: 'b2c', company: '', message: '' });
  const [state, setState] = useState('idle'); // idle · sending · success · error
  const [errors, setErrors] = useState({});
  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = '이름을 입력해주세요.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = '유효한 이메일이 아닙니다.';
    if (form.message.trim().length < 10) errs.message = '메시지를 10자 이상 작성해주세요.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState('sending');
    setTimeout(() => setState('success'), 900);
  };
  if (state === 'success') {
    return (
      <>
        <PromptLine cmd="./contact --new" />
        <div className="card" style={{ padding: 28, textAlign: 'center', borderColor: 'var(--proto-accent)' }}>
          <div style={{ fontSize: 40, color: 'var(--proto-accent)' }}>✓</div>
          <h1 className="h2" style={{ marginTop: 8 }}>메시지 전송됨</h1>
          <p className="body dim" style={{ marginTop: 6 }}>자동응답 메일이 <strong>{form.email}</strong> 으로 발송되었습니다.<br/>평균 회신 24시간.</p>
          <div className="cluster" style={{ justifyContent: 'center', marginTop: 14 }}>
            <button className="btn" onClick={() => { setState('idle'); setForm({ name: '', email: '', kind: 'b2c', company: '', message: '' }); }}>새 메시지</button>
            <a className="btn ghost" href="#/" onClick={(e)=>{e.preventDefault();nav('/');}}>홈으로</a>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <PromptLine cmd="./contact --new" />
      <h1 className="h2">메시지를 보내주세요</h1>
      <p className="body dim">평균 회신 24시간 이내. 또는 <a style={{color:'var(--proto-accent)'}} href="mailto:hello@tkstar.dev">hello@tkstar.dev</a></p>

      <form onSubmit={onSubmit} className="stack" style={{ gap: 14 }} noValidate>
        <div className="field">
          <label>이름 *</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="홍길동" />
          {errors.name && <span className="err">{errors.name}</span>}
        </div>
        <div className="field">
          <label>이메일 *</label>
          <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@company.com" />
          {errors.email && <span className="err">{errors.email}</span>}
        </div>
        <div className="field">
          <label>회사 (선택)</label>
          <input className="input" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="회사명" />
        </div>
        <div className="field">
          <label>의뢰 유형 *</label>
          <div className="cluster">
            {[['b2b','B2B 채용·제안'],['b2c','B2C 의뢰'],['etc','기타']].map(([v,l]) => (
              <button type="button" key={v} className={'pill2 ' + (form.kind===v?'on':'')} onClick={()=>setForm(f=>({...f, kind: v}))}>{l}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>메시지 *</label>
          <textarea className="input" rows={6} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="프로젝트 개요, 일정, 예산 범위 등" />
          {errors.message && <span className="err">{errors.message}</span>}
          <span className="help">{form.message.length}자 · 최소 10자</span>
        </div>
        <div className="card" style={{ padding: 12, fontSize: 11, color: 'var(--proto-faint)' }}>
          ☐ Cloudflare Turnstile 자리 (실제 출시 시 로드)
        </div>
        <div className="cluster" style={{ alignItems: 'center' }}>
          <button className="btn primary" type="submit" disabled={state==='sending'}>
            {state==='sending' ? '전송 중...' : '↵ 메시지 보내기'}
          </button>
          <span className="faint2" style={{ fontSize: 11 }}>Resend → hello@tkstar.dev</span>
        </div>
      </form>
    </>
  );
}

window.BlogPage = BlogPage;
window.BlogDetailPage = BlogDetailPage;
window.ContactPage = ContactPage;
})();
