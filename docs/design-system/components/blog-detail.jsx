/* global React, TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, Annot */

// Blog Detail v1 — `cat post.mdx`
function BlogDetailV1({ lang = 'ko' }) {
  return (
    <TermWindow path="~/blog/cf-rsc-running" status="post.mdx · 8 min · shiki ✓">
      <Prompt>cat cf-rsc-running.mdx</Prompt>
      <Sep />
      <span className="pill">2026.04.20 · 8 min</span>
      <h1 className="term-h1" style={{ marginTop: 8 }}>Cloudflare Workers + RSC,<br/>한 달 운영기</h1>
      <Out>{['rsc','cf','workers'].map(t=>'#'+t).join(' ')}</Out>
      <div className="ph-img" style={{ height: 150, marginTop: 10 }}>satori og · 1200×630</div>

      <Out style={{ marginTop: 14 }}>───── lede 단락. MDX 본문 + shiki 코드 블록 ─────</Out>
      <div className="code">
        <span className="c">{'// shiki highlighted'}</span>{'\n'}
        <span className="k">async function</span> <span className="f">handler</span>(req) {`{`}{'\n'}
        {'  '}<span className="k">const</span> rsc = <span className="k">await</span> <span className="f">render</span>(...){'\n'}
        {'  '}<span className="k">return new</span> <span className="f">Response</span>(rsc){'\n'}
        {`}`}
      </div>
      <Out>───── 추가 본문 ─────</Out>
      <Sep />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="wf-btn ghost">← prev post</button>
        <button className="wf-btn ghost">next post →</button>
      </div>
      <Annot x={'auto'} y={20} rot={2}>F007 · F011 · shiki + Satori</Annot>
    </TermWindow>
  );
}

// Blog Detail v2 — TOC sidebar
function BlogDetailV2({ lang = 'ko' }) {
  return (
    <TermWindow path="~/blog/velite-mdx" status="TOC scroll-spy">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 22 }}>
        <article>
          <Prompt>cat velite-mdx.mdx</Prompt>
          <Sep />
          <span className="pill">2026.03.11 · 6 min</span>
          <h1 className="term-h1" style={{ marginTop: 8 }}>velite로 MDX 컬렉션 다루기</h1>
          <Out>frontmatter Zod 검증 + 빌드타임 인덱스</Out>
          <div className="section-bar">## 1. velite란? <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
          <div className="section-bar">## 2. Zod 스키마 <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
          <div className="section-bar">## 3. 빌드 인덱스 <span className="line" /></div>
          <Out>───── 본문 ─────</Out>
        </article>
        <aside style={{ position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div className="wf-card" style={{ padding: 10 }}>
            <span className="pill">on this page</span>
            <Out style={{ lineHeight: 2 }}>
              · velite란?<br/>· Zod 스키마<br/>· <span className="green">빌드 인덱스</span><br/>· 결론
            </Out>
          </div>
          <div className="wf-card" style={{ padding: 10, marginTop: 8 }}>
            <span className="pill">share</span>
            <Out>copy · x · in</Out>
          </div>
        </aside>
      </div>
      <Annot x={'auto'} y={20} rot={-2}>scroll-spy TOC</Annot>
    </TermWindow>
  );
}

// Blog Detail v3 — minimal reader (centered)
function BlogDetailV3({ lang = 'ko' }) {
  return (
    <TermWindow path="~/blog/solo-ops" status="reader · 720 measure">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Prompt>./reader solo-ops.mdx</Prompt>
        <Sep />
        <span className="pill" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>essay</span>
        <h1 className="term-h1" style={{ fontSize: 36, marginTop: 8, lineHeight: 1.15 }}>1인 개발자의<br/>운영 자동화</h1>
        <Out>2026.02.02 · 5 min</Out>
        <Sep />
        <p style={{ fontSize: 14, lineHeight: 1.95, color: 'var(--ink)' }}>───── 첫 단락. 큰 measure, 풍부한 line-height ─────</p>
        <Out>───── 본문 단락 ─────</Out>
      </div>
      <Annot x={'auto'} y={20} rot={2}>읽기 전용 · 720</Annot>
    </TermWindow>
  );
}

Object.assign(window, { BlogDetailV1, BlogDetailV2, BlogDetailV3 });
