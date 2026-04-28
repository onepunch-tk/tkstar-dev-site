/* global React, PROJECTS, POSTS */
(() => {
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────
// Build searchable index
// ─────────────────────────────────────────────────────
function buildIndex() {
  const items = [
    { kind: 'route', path: '/', label: '/', desc: 'home · whoami', keywords: 'home start' },
    { kind: 'route', path: '/about', label: '/about', desc: '이력서 · resume', keywords: 'about resume hire 채용 이력서' },
    { kind: 'route', path: '/projects', label: '/projects', desc: '포트폴리오 · 케이스 스터디', keywords: 'projects portfolio case study work' },
    { kind: 'route', path: '/blog', label: '/blog', desc: '월 1편 기록', keywords: 'blog writing posts' },
    { kind: 'route', path: '/contact', label: '/contact', desc: '의뢰 · 제안', keywords: 'contact inquiry email mail 메일 문의' },
  ];
  PROJECTS.forEach(p => items.push({
    kind: 'project',
    path: `/projects/${p.slug}`,
    label: p.title,
    desc: p.summary,
    keywords: [p.title, p.summary, p.slug, ...(p.stack||[]), ...(p.tags||[])].join(' '),
    badge: 'project',
  }));
  POSTS.forEach(p => items.push({
    kind: 'post',
    path: `/blog/${p.slug}`,
    label: p.title,
    desc: `${p.date} · ${p.read}`,
    keywords: [p.title, p.lede, p.slug, ...(p.tags||[])].join(' '),
    badge: 'post',
  }));
  return items;
}

function filterIndex(idx, q) {
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return idx;
  return idx.filter(it => {
    const hay = (it.label + ' ' + it.desc + ' ' + it.keywords).toLowerCase();
    return tokens.every(t => hay.includes(t));
  });
}

// ─────────────────────────────────────────────────────
// Command Palette
// ─────────────────────────────────────────────────────
function Palette({ open, onClose, onPick }) {
  const idx = useMemo(buildIndex, []);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const filtered = useMemo(() => filterIndex(idx, q), [idx, q]);

  useEffect(() => {
    if (open) {
      setQ(''); setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(filtered.length - 1, s + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const it = filtered[sel];
        if (it) onPick(it.path);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel, onClose, onPick]);

  // group results
  const groups = useMemo(() => {
    const g = { route: [], project: [], post: [] };
    filtered.forEach((it, i) => g[it.kind].push({ ...it, _i: i }));
    return g;
  }, [filtered]);

  if (!open) return null;
  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className="head">
          <span className="gt">›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder="go to ─ /about, /projects/whiteboard, vitest..."
            aria-label="search"
          />
          <span className="esc">esc</span>
        </div>
        <div className="results">
          {filtered.length === 0 && (
            <div className="item" style={{ color: 'var(--proto-faint)', cursor: 'default' }}>
              <span className="arrow"> </span>
              <span>일치하는 결과 없음</span>
            </div>
          )}
          {['route','project','post'].map(k => groups[k].length > 0 && (
            <div key={k}>
              <div className="group-h">{k === 'route' ? 'pages' : k === 'project' ? 'projects' : 'posts'}</div>
              {groups[k].map(it => (
                <div
                  key={it.path}
                  className={'item' + (it._i === sel ? ' on' : '')}
                  onMouseEnter={() => setSel(it._i)}
                  onClick={() => onPick(it.path)}
                >
                  <span className="arrow">{it._i === sel ? '▸' : ' '}</span>
                  <span className="path">{it.label}</span>
                  <span className="desc">{it.desc}</span>
                  {it.badge && <span className="badge">{it.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="foot">
          <span><kbd>↑↓</kbd>이동</span>
          <span><kbd>↵</kbd>진입</span>
          <span><kbd>esc</kbd>닫기</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────
function Topbar({ route, onNav, onOpenPalette, theme, onToggleTheme }) {
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  return (
    <header className="topbar" role="banner">
      <a className="brand" href="#/" onClick={(e) => { e.preventDefault(); onNav('/'); }}>
        tkstar<span className="accent">.dev</span>
      </a>
      <span className="path">~{route === '/' ? '' : route}</span>
      <div className="search-wrap">
        <button className="search-trigger" onClick={onOpenPalette} aria-label="검색 열기">
          <span aria-hidden>›</span>
          <span className="ph">go to ─ /about, post...</span>
          <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
      </div>
      <button className="theme-btn" onClick={onToggleTheme} aria-label="테마 토글" title="테마 토글">
        {theme === 'dark' ? '☾' : '☀'}
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────
function FootBar() {
  return (
    <footer className="foot">
      <span>© 2026 tkstar.dev · solo</span>
      <span style={{ display: 'flex', gap: 14 }}>
        <a href="https://github.com" target="_blank" rel="noreferrer">github</a>
        <a href="https://x.com" target="_blank" rel="noreferrer">x</a>
        <a href="#/blog">/rss.xml</a>
        <a href="#/contact">contact</a>
      </span>
    </footer>
  );
}

// Prompt (small command line breadcrumb)
function PromptLine({ cmd }) {
  return (
    <div className="prompt">
      <span className="user">tkstar@dev</span>
      <span className="sep">:</span>
      <span className="path">~</span>
      <span className="dollar">$</span>
      <span className="cmd">{cmd}</span>
    </div>
  );
}

window.Topbar = Topbar;
window.FootBar = FootBar;
window.Palette = Palette;
window.PromptLine = PromptLine;
})();
