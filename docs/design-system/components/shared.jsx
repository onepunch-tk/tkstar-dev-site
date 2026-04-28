/* global React */
// Shared wireframe primitives + chrome shells

// Top bar with terminal prompt feel
function TopBar({ active = 'home', lang = 'ko' }) {
  const items = lang === 'ko'
    ? [['home','Home'],['about','About'],['projects','Projects'],['blog','Blog'],['contact','Contact']]
    : [['home','Home'],['about','About'],['projects','Projects'],['blog','Blog'],['contact','Contact']];
  return (
    <div className="between" style={{ padding: '12px 22px', borderBottom: '1.5px dashed var(--line)', background: 'var(--bg-elev)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="green prompt" style={{ fontWeight: 700 }}>tkstar.dev</span>
        <span className="faint" style={{ fontSize: 10 }}>v0.1 ─ wireframe</span>
      </div>
      <nav style={{ display: 'flex', gap: 18, fontSize: 12 }}>
        {items.map(([k, l]) => (
          <span key={k} className={active === k ? 'green' : 'muted'} style={{ borderBottom: active === k ? '1.5px solid var(--accent)' : 'none', paddingBottom: 2 }}>
            {l}
          </span>
        ))}
        <span className="faint">[ ☾ ]</span>
      </nav>
    </div>
  );
}

// Side bar (Brittany-inspired but our own)
function SideBar({ active = 'home', lang = 'ko' }) {
  const items = [
    ['home', 'HOME', '00'],
    ['about', 'ABOUT', '01'],
    ['projects', 'PROJECTS', '02'],
    ['blog', 'BLOG', '03'],
    ['contact', 'CONTACT', '04'],
  ];
  return (
    <aside>
      <div>
        <div className="green" style={{ fontWeight: 700, fontSize: 18 }}>tkstar.dev</div>
        <div className="faint" style={{ fontSize: 10, marginTop: 2 }}>{'// solo dev studio'}</div>
      </div>
      <div className="col" style={{ gap: 8, marginTop: 6 }}>
        {items.map(([k, l, n]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: active === k ? 'var(--ink)' : 'var(--ink-dim)' }}>
            <span className="faint" style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{n}</span>
            <span style={{ width: active === k ? 28 : 14, height: 1.5, background: active === k ? 'var(--accent)' : 'var(--line-strong)', transition: 'width .2s' }} />
            <span className={active === k ? 'green' : ''}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="col" style={{ gap: 6 }}>
        <span className="label">socials</span>
        <div className="row" style={{ gap: 6 }}>
          <span className="wf-tag">gh</span>
          <span className="wf-tag">in</span>
          <span className="wf-tag">x</span>
          <span className="wf-tag">@</span>
        </div>
        <span className="faint" style={{ fontSize: 10, marginTop: 8 }}>● dark · auto</span>
      </div>
    </aside>
  );
}

// Footer — shows on every artboard's main shell
function Footer() {
  return (
    <div className="between" style={{ padding: '10px 22px', borderTop: '1.5px dashed var(--line)', fontSize: 10, color: 'var(--ink-faint)' }}>
      <span>© 2026 tkstar.dev</span>
      <div style={{ display: 'flex', gap: 14 }}>
        <span>RSS</span>
        <span>Legal</span>
        <span className="faint">analytics ● cf-no-cookie</span>
      </div>
    </div>
  );
}

// CTA button
function CTA({ children, accent, size = 'md', dim }) {
  const cls = ['wf-btn', accent ? 'accent' : '', dim ? 'ghost' : ''].join(' ');
  const pad = size === 'lg' ? '14px 22px' : size === 'sm' ? '6px 10px' : '10px 16px';
  return (
    <button className={cls} style={{ padding: pad, fontSize: size === 'lg' ? 14 : 12 }}>
      {children}
    </button>
  );
}

// Crossed-out box label
function PlaceholderImg({ label, h = 120, w }) {
  return (
    <div className="wf-img" style={{ height: h, width: w || '100%' }}>{label || 'image'}</div>
  );
}

// Annotated arrow (uses absolute pos, parent must be relative)
function Arrow({ from, to, label, color = 'var(--accent-2)' }) {
  // from/to: {x,y} in px relative to artboard
  const dx = to.x - from.x, dy = to.y - from.y;
  return (
    <svg className="arrow" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <path
        d={`M${from.x},${from.y} Q${(from.x+to.x)/2 + 20},${(from.y+to.y)/2 - 20} ${to.x},${to.y}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 4"
        markerEnd="url(#arr)"
      />
      {label && (
        <text x={(from.x + to.x)/2 + 8} y={(from.y + to.y)/2 - 6} fill={color} fontFamily="var(--hand)" fontSize="14">
          {label}
        </text>
      )}
    </svg>
  );
}

// Section header with terminal prefix
function SectionH({ num, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '6px 0 12px' }}>
      <span className="faint" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{num || '//'}</span>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
      {sub && <span className="faint" style={{ fontSize: 11 }}>— {sub}</span>}
      <span style={{ flex: 1, height: 1, background: 'var(--line)', marginLeft: 10 }} />
    </div>
  );
}

// Annotation line w/ caret on left
function Note({ children, color }) {
  return (
    <div className="annot" style={{ color: color || 'var(--ink-dim)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <span style={{ fontFamily: 'var(--mono)' }}>↳</span>
      <span>{children}</span>
    </div>
  );
}

Object.assign(window, { TopBar, SideBar, Footer, CTA, PlaceholderImg, Arrow, SectionH, Note });
