/* global React, PROJECTS, POSTS, APPS, PromptLine */
(() => {
const { useState, useEffect, useMemo } = React;

// ─────────────────────────────────────────────────────
// HOME — whoami + featured + quick links
// ─────────────────────────────────────────────────────
function HomePage({ nav, onOpenPalette }) {
  return (
    <>
      <PromptLine cmd="whoami" />
      <h1 className="h1">
        ship <span style={{ color: 'var(--proto-accent)' }}>solo</span>.<br />
        <span className="dim">ship </span>fast<span className="dim">.</span>
      </h1>
      <p className="body dim" style={{ maxWidth: 540 }}>
        1인 개발자 김태곤. 풀스택 · 제품 설계부터 운영까지 혼자서.
        웹/앱을 처음부터 끝까지 짓고 굴립니다.
      </p>
      <div className="cluster" style={{ gap: 8 }}>
        <button className="btn primary" onClick={onOpenPalette}>›  검색해서 이동</button>
        <a className="btn" href="#/about" onClick={(e)=>{e.preventDefault();nav('/about');}}>/about</a>
        <a className="btn ghost" href="#/projects" onClick={(e)=>{e.preventDefault();nav('/projects');}}>/projects</a>
      </div>

      <div className="section-h">featured <span className="grow" /></div>
      <a className="card hover" href="#/projects/whiteboard-rt" onClick={(e)=>{e.preventDefault();nav('/projects/whiteboard-rt');}} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="cover" style={{ marginBottom: 12 }}>cover · 16:9</div>
        <div className="cluster" style={{ marginBottom: 6 }}>
          {PROJECTS[0].stack.map(s => <span key={s} className="pill2">{s}</span>)}
        </div>
        <div className="h2">{PROJECTS[0].title}</div>
        <p className="body dim" style={{ margin: '6px 0 0' }}>{PROJECTS[0].summary}</p>
      </a>

      <div className="section-h">recent posts <span className="grow" /></div>
      <div className="stack" style={{ gap: 0 }}>
        {POSTS.slice(0,3).map(p => (
          <a key={p.slug} className="row-link" href={`#/blog/${p.slug}`} onClick={(e)=>{e.preventDefault();nav(`/blog/${p.slug}`);}}>
            <span className="date">{p.date}</span>
            <span className="title">{p.title}</span>
            <span className="meta">{p.read}</span>
          </a>
        ))}
      </div>
      <div>
        <a className="btn ghost" href="#/blog" onClick={(e)=>{e.preventDefault();nav('/blog');}}>모두 보기 →</a>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// ABOUT — cat resume.md
// ─────────────────────────────────────────────────────
function AboutPage({ nav }) {
  return (
    <>
      <PromptLine cmd="cat resume.md" />
      <div className="between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="h2">김태곤 <span className="dim" style={{ fontWeight: 400, fontSize: 14 }}>· solo developer</span></h1>
          <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>풀스택 · 제품 설계 · 운영 / hello@tkstar.dev</div>
        </div>
        <button className="btn" onClick={() => window.print()}>⎙ PDF</button>
      </div>

      <div className="section-h">stack <span className="grow" /></div>
      <div className="stack" style={{ gap: 10 }}>
        {[
          ['frontend', ['ts','react','tailwind','vite']],
          ['edge / be', ['cf workers','d1','do','rsc']],
          ['quality', ['vitest','biome','tdd','clean-arch']],
        ].map(([k, list]) => (
          <div key={k} className="card" style={{ padding: 12 }}>
            <span className="pill2 on">{k}</span>
            <div className="cluster" style={{ marginTop: 8 }}>
              {list.map(t => <span key={t} className="pill2">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="section-h">experience <span className="grow" /></div>
      {[
        ['2024 — now', '회사 A · 시니어 개발자', '결제 인프라 마이그레이션 · -40% 비용. DS 통합 · 컴포넌트 80→24.'],
        ['2022 — 2024', '회사 B · 풀스택 개발자', '0→1 SaaS 출시 · 8주 단독. 운영 자동화로 on-call 0건/주.'],
        ['2020 — 2022', '회사 C · 주니어', '신규 프론트엔드 채택 · React 18 도입.'],
      ].map(([y,t,b],i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--proto-line)' }}>
          <span className="faint2" style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>{y}</span>
          <div>
            <div className="h3">{t}</div>
            <div className="body dim" style={{ marginTop: 4 }}>{b}</div>
          </div>
        </div>
      ))}

      <div className="section-h">education · awards <span className="grow" /></div>
      <div className="stack" style={{ gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <span className="pill2">edu</span>
          <div className="body" style={{ marginTop: 6 }}>○○대학교 컴퓨터공학 · 2016—2020</div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <span className="pill2">awards</span>
          <div className="body" style={{ marginTop: 6 }}>○○ 해커톤 1위 · 2024<br/>오픈소스 컨트리뷰터 · 2023</div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// PROJECTS — ls -la with filter
// ─────────────────────────────────────────────────────
function ProjectsPage({ nav }) {
  const [tag, setTag] = useState('all');
  const tags = useMemo(() => {
    const set = new Set();
    PROJECTS.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return ['all', ...set];
  }, []);
  const list = useMemo(() => tag === 'all' ? PROJECTS : PROJECTS.filter(p => p.tags?.includes(tag)), [tag]);
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <h1 className="h2">projects <span className="dim" style={{ fontWeight: 400, fontSize: 14 }}>· {PROJECTS.length} entries</span></h1>
      <div className="cluster">
        {tags.map(t => (
          <button key={t} className={'pill2 ' + (tag === t ? 'on' : '')} onClick={() => setTag(t)}>#{t}</button>
        ))}
      </div>

      <div className="table-rows">
        {list.map(p => (
          <a key={p.slug} className="tr" href={`#/projects/${p.slug}`} onClick={(e)=>{e.preventDefault();nav(`/projects/${p.slug}`);}}>
            <div className="l1">
              <span style={{ color: 'var(--proto-accent-2)' }}>{p.slug}/</span>
              <span className="name">{p.title}</span>
              <span className="date">{p.date}</span>
            </div>
            <div className="l2">{p.summary}</div>
            <div className="tags">
              {p.stack.map(s => <span key={s} className="pill2">{s}</span>)}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// PROJECT DETAIL — case study
// ─────────────────────────────────────────────────────
function ProjectDetailPage({ slug, nav }) {
  const idx = PROJECTS.findIndex(p => p.slug === slug);
  const p = PROJECTS[idx];
  if (!p) {
    return (
      <>
        <PromptLine cmd={`cd projects/${slug}`} />
        <p className="body">cd: no such project: <span style={{color:'var(--warn)'}}>{slug}</span></p>
        <a className="btn" href="#/projects" onClick={(e)=>{e.preventDefault();nav('/projects');}}>← /projects</a>
      </>
    );
  }
  const prev = PROJECTS[idx - 1];
  const next = PROJECTS[idx + 1];
  return (
    <div className="two-col">
      <article className="stack-lg">
        <PromptLine cmd={`cat projects/${p.slug}/case.mdx`} />
        <div className="cluster">
          <span className="pill2 on">case · {p.date}</span>
          {p.tags?.map(t => <span key={t} className="pill2">#{t}</span>)}
        </div>
        <h1 className="h1" style={{ fontSize: 'clamp(26px, 5vw, 36px)' }}>{p.title}</h1>
        <p className="body dim">{p.summary}</p>
        <div className="cover">cover · 1200×600 · satori OG</div>

        <div className="section-h">01 · problem <span className="grow" /></div>
        <p className="body">{p.problem}</p>

        <div className="section-h">02 · approach <span className="grow" /></div>
        <p className="body">{p.approach}</p>
        <pre className="codeblock"><code>{p.code}</code></pre>

        <div className="section-h">03 · results <span className="grow" /></div>
        <div className="metrics">
          {p.metrics.map(([k,v]) => (
            <div key={k} className="metric2"><div className="v">{v}</div><div className="k">{k}</div></div>
          ))}
        </div>

        <hr className="hr" style={{ marginTop: 12 }} />
        <div className="between">
          {prev ? <a className="btn ghost" href={`#/projects/${prev.slug}`} onClick={(e)=>{e.preventDefault();nav(`/projects/${prev.slug}`);}}>← {prev.slug}</a> : <span />}
          <a className="btn primary" href="#/contact" onClick={(e)=>{e.preventDefault();nav('/contact');}}>의뢰하기 →</a>
          {next ? <a className="btn ghost" href={`#/projects/${next.slug}`} onClick={(e)=>{e.preventDefault();nav(`/projects/${next.slug}`);}}>{next.slug} →</a> : <span />}
        </div>
      </article>

      <aside className="side stack" style={{ gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="faint2" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>meta</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.95 }}>
            <div><span className="dim">year</span> <span> ─ </span>{p.date.slice(0,4)}</div>
            <div><span className="dim">role</span> <span> ─ </span>solo</div>
            <div><span className="dim">stack</span></div>
            <div className="cluster" style={{ marginTop: 4 }}>
              {p.stack.map(s => <span key={s} className="pill2">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="faint2" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>on this page</div>
          <div className="dim" style={{ fontSize: 12, lineHeight: 2 }}>
            <div>· problem</div><div>· approach</div><div>· results</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

window.HomePage = HomePage;
window.AboutPage = AboutPage;
window.ProjectsPage = ProjectsPage;
window.ProjectDetailPage = ProjectDetailPage;
})();
