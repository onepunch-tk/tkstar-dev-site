/* global React */

// ─────────────────────────────────────────────
// Terminal window chrome — every page lives in one
// ─────────────────────────────────────────────
function TermWindow({ path = '~', children, status, onTab, tabs, footer }) {
  return (
    <div className="term-win">
      <div className="term-titlebar">
        <div className="term-dots">
          <span className="d red" /><span className="d yel" /><span className="d grn" />
        </div>
        <div className="term-title"><span className="faint">tkstar@dev</span> : <span className="green">{path}</span></div>
        <div className="term-meta faint">⌘K</div>
      </div>

      {tabs && (
        <div className="term-tabs">
          {tabs.map((tb, i) => (
            <span key={i} className={tb.active ? 'tab on' : 'tab'} onClick={() => onTab && onTab(tb.id)}>
              <span className="faint">{String(i).padStart(2,'0')}</span> {tb.label}
            </span>
          ))}
          <span className="tab-spacer" />
          <span className="faint" style={{ fontSize: 10 }}>⎚ split · ☾ theme</span>
        </div>
      )}

      <div className="term-body">{children}</div>

      <div className="term-statusbar">
        <span className="status-cell green">● ready</span>
        <span className="status-cell faint">{status || 'idle'}</span>
        <span className="status-cell faint" style={{ marginLeft: 'auto' }}>UTF-8 · ko-KR · LF</span>
      </div>
      {footer}
    </div>
  );
}

// ─────────────────────────────────────────────
// Generic helpers
// ─────────────────────────────────────────────
function Prompt({ children, dim }) {
  return (
    <div className={dim ? 'tline dim' : 'tline'}>
      <span className="green">tkstar@dev</span>
      <span className="faint">:</span>
      <span className="amber">~</span>
      <span className="faint">$ </span>
      <span className="strong">{children}</span>
    </div>
  );
}
function Out({ children, color }) {
  return <div className="tline out" style={color ? { color } : null}>{children}</div>;
}
function Caret() {
  return <span className="caret">▍</span>;
}
function Sep({ ch = '─', n = 60 }) {
  return <div className="faint" style={{ letterSpacing: '0.15em', fontSize: 11 }}>{ch.repeat(n)}</div>;
}
function Hint({ children }) {
  return <span className="faint" style={{ fontSize: 10 }}>{children}</span>;
}
function KBD({ children }) {
  return <span className="kbd">{children}</span>;
}
function TermList({ items }) {
  return (
    <div className="termlist">
      {items.map((it, i) => (
        <div key={i} className="termlist-row">
          <span className="faint">{String(i+1).padStart(2,'0')}</span>
          {it.icon && <span className="amber">{it.icon}</span>}
          <span className="strong">{it.title}</span>
          {it.tags && <span className="faint" style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {it.tags.map(t => <span key={t} className="wf-tag" style={{ fontSize: 10 }}>{t}</span>)}
          </span>}
          {it.meta && <span className="faint" style={{ marginLeft: it.tags?12:'auto' }}>{it.meta}</span>}
          <span className="green" style={{ marginLeft: 12 }}>→</span>
        </div>
      ))}
    </div>
  );
}

// Annotation / hand label for wireframe
function Annot({ children, x, y, color = 'var(--accent-2)', rot = 0 }) {
  return (
    <span className="hand" style={{ position: 'absolute', left: x, top: y, color, transform: `rotate(${rot}deg)`, fontSize: 14, lineHeight: 1.2, pointerEvents: 'none' }}>
      {children}
    </span>
  );
}

Object.assign(window, { TermWindow, Prompt, Out, Caret, Sep, Hint, KBD, TermList, Annot });
