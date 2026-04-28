/* global React, APPS, PromptLine */

// ─────────────────────────────────────────────────────
// LEGAL — index page (라우팅 전체 보기)
//   sober mode 시작 전에는 일반 chrome 안에 있어도 OK
// ─────────────────────────────────────────────────────
function LegalIndexPage({ nav }) {
  return (
    <>
      <PromptLine cmd="ls legal/apps/" />
      <h1 className="h2">앱별 약관 / 개인정보 처리방침</h1>
      <p className="body dim">각 앱은 자체 약관과 처리방침을 가집니다. 모바일 웹뷰 친화적 정갈한 마크업으로 제공합니다.</p>

      {APPS.map(a => (
        <div key={a.slug} className="card" style={{ padding: 14 }}>
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="cluster" style={{ marginBottom: 6 }}>
                <span className="pill2 on">app</span>
                <span className="pill2">v1.0</span>
              </div>
              <div className="h3">{a.name}</div>
              <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>/legal/apps/{a.slug}</div>
            </div>
          </div>
          <hr className="hr" style={{ margin: '12px 0' }} />
          <div className="stack" style={{ gap: 8 }}>
            <a className="row-link" href={`#/legal/apps/${a.slug}/terms`} onClick={(e)=>{e.preventDefault();nav(`/legal/apps/${a.slug}/terms`);}}>
              <span className="date">terms.mdx</span>
              <span className="title">이용약관</span>
              <span className="meta">→</span>
            </a>
            <a className="row-link" href={`#/legal/apps/${a.slug}/privacy`} onClick={(e)=>{e.preventDefault();nav(`/legal/apps/${a.slug}/privacy`);}}>
              <span className="date">privacy.mdx</span>
              <span className="title">개인정보 처리방침</span>
              <span className="meta">→</span>
            </a>
          </div>
        </div>
      ))}
      <p className="faint2" style={{ fontSize: 11 }}>
        velite collection: <code>legal/apps/[slug]/(terms|privacy).mdx</code> · 새 앱 출시 시 파일 추가만으로 라우팅 자동 생성.
      </p>
    </>
  );
}

// ─────────────────────────────────────────────────────
// LEGAL DOC — sober, chrome-free, mobile webview ready
// ─────────────────────────────────────────────────────
function LegalDoc({ kind, app }) {
  const a = APPS.find(x => x.slug === app);
  const appName = a?.name || app;

  if (kind === 'terms') {
    return (
      <div className="legal">
        <header className="legal-head">
          <h1>{appName} 서비스 이용약관</h1>
          <div className="meta">
            <span>버전 1.0</span>
            <span>·</span>
            <span>시행일 2026.04.01</span>
            <span>·</span>
            <span>최종 수정 2026.03.20</span>
          </div>
        </header>
        <div className="legal-body">
          <nav className="legal-toc" aria-label="목차">
            <strong style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--proto-faint)' }}>목차</strong>
            <ol>
              <li><a href="#t1">1. 목적</a></li>
              <li><a href="#t2">2. 용어의 정의</a></li>
              <li><a href="#t3">3. 약관의 효력 및 변경</a></li>
              <li><a href="#t4">4. 서비스의 제공 및 변경</a></li>
              <li><a href="#t5">5. 회원의 의무</a></li>
              <li><a href="#t6">6. 회사의 면책</a></li>
              <li><a href="#t7">7. 분쟁의 해결</a></li>
            </ol>
          </nav>

          <h2 id="t1">제1조 (목적)</h2>
          <p>본 약관은 tkstar(이하 "회사")가 제공하는 {appName}(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h2 id="t2">제2조 (용어의 정의)</h2>
          <ol>
            <li>"서비스"란 회사가 {appName} 어플리케이션 또는 웹을 통해 제공하는 모든 기능을 의미합니다.</li>
            <li>"회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.</li>
            <li>"콘텐츠"란 회원이 서비스를 이용하면서 생성, 게시, 전송하는 모든 데이터를 의미합니다.</li>
          </ol>

          <h2 id="t3">제3조 (약관의 효력 및 변경)</h2>
          <p>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 회사는 합리적인 사유가 발생한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전부터 공지합니다.</p>

          <h2 id="t4">제4조 (서비스의 제공 및 변경)</h2>
          <p>회사는 회원에게 다음과 같은 서비스를 제공합니다.</p>
          <ul>
            <li>{appName}의 핵심 기능 제공</li>
            <li>관련 부가 서비스 및 콘텐츠</li>
            <li>회사가 추후 개발하거나 다른 회사와 제휴를 통해 제공하는 일체의 서비스</li>
          </ul>

          <h2 id="t5">제5조 (회원의 의무)</h2>
          <p>회원은 다음 행위를 하여서는 안됩니다.</p>
          <ul>
            <li>타인의 정보 도용</li>
            <li>회사가 게시한 정보의 변경</li>
            <li>회사 및 제3자의 저작권 등 지적재산권 침해</li>
            <li>법령 또는 공공질서에 위배되는 행위</li>
          </ul>

          <h2 id="t6">제6조 (회사의 면책)</h2>
          <p>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</p>

          <h2 id="t7">제7조 (분쟁의 해결)</h2>
          <p>본 약관과 관련하여 분쟁이 발생한 경우 회사 소재지를 관할하는 법원을 1심 관할법원으로 합니다.</p>

          <h2>부칙</h2>
          <p>본 약관은 2026년 4월 1일부터 시행됩니다.</p>

          <hr className="hr" style={{ margin: '24px 0 12px' }} />
          <p className="faint2" style={{ fontSize: 12 }}>
            문의: <a href="mailto:hello@tkstar.dev" style={{color:'var(--proto-accent)'}}>hello@tkstar.dev</a>
          </p>
        </div>
      </div>
    );
  }

  // privacy
  return (
    <div className="legal">
      <header className="legal-head">
        <h1>{appName} 개인정보 처리방침</h1>
        <div className="meta">
          <span>버전 1.0</span>
          <span>·</span>
          <span>시행일 2026.04.01</span>
          <span>·</span>
          <span>최종 수정 2026.03.20</span>
        </div>
      </header>
      <div className="legal-body">
        <nav className="legal-toc" aria-label="목차">
          <strong style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--proto-faint)' }}>목차</strong>
          <ol>
            <li><a href="#p1">1. 수집하는 개인정보 항목</a></li>
            <li><a href="#p2">2. 개인정보의 이용 목적</a></li>
            <li><a href="#p3">3. 개인정보의 보유 및 이용 기간</a></li>
            <li><a href="#p4">4. 개인정보의 제3자 제공</a></li>
            <li><a href="#p5">5. 이용자의 권리</a></li>
            <li><a href="#p6">6. 개인정보 보호책임자</a></li>
          </ol>
        </nav>

        <h2 id="p1">1. 수집하는 개인정보 항목</h2>
        <p>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
        <table>
          <thead><tr><th>구분</th><th>수집 항목</th><th>수집 방법</th></tr></thead>
          <tbody>
            <tr><td>필수</td><td>이메일, 닉네임</td><td>회원가입 시</td></tr>
            <tr><td>선택</td><td>프로필 이미지</td><td>설정 시</td></tr>
            <tr><td>자동</td><td>접속 로그, 디바이스 정보</td><td>서비스 이용 시</td></tr>
          </tbody>
        </table>

        <h2 id="p2">2. 개인정보의 이용 목적</h2>
        <ul>
          <li>회원 식별 및 가입 의사 확인</li>
          <li>서비스 제공 및 운영</li>
          <li>고객 문의 응대</li>
          <li>서비스 개선을 위한 통계 분석 (식별 정보 제외)</li>
        </ul>

        <h2 id="p3">3. 개인정보의 보유 및 이용 기간</h2>
        <p>원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 다만, 관련 법령에 따라 보존이 필요한 경우 다음과 같이 보관합니다.</p>
        <ul>
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>

        <h2 id="p4">4. 개인정보의 제3자 제공</h2>
        <p>회사는 이용자의 개인정보를 본 처리방침에서 명시한 범위 내에서만 처리하며, 이용자의 사전 동의 없이는 제3자에게 제공하지 않습니다.</p>

        <h2 id="p5">5. 이용자의 권리</h2>
        <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 처리에 대한 동의를 철회할 수 있습니다.</p>

        <h2 id="p6">6. 개인정보 보호책임자</h2>
        <ul>
          <li>이름: 김태곤</li>
          <li>이메일: <a href="mailto:hello@tkstar.dev" style={{color:'var(--proto-accent)'}}>hello@tkstar.dev</a></li>
        </ul>

        <hr className="hr" style={{ margin: '24px 0 12px' }} />
        <p className="faint2" style={{ fontSize: 12 }}>
          본 처리방침은 2026년 4월 1일부터 적용됩니다.
        </p>
      </div>
    </div>
  );
}

window.LegalIndexPage = LegalIndexPage;
window.LegalDoc = LegalDoc;
