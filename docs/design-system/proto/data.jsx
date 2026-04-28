/* global React */
(() => {
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────
// Sample data — used by all pages
// ─────────────────────────────────────────────────────
const PROJECTS = [
  {
    slug: 'whiteboard-rt',
    title: '실시간 협업 화이트보드',
    summary: 'WebSocket → Durable Objects 마이그레이션, p99 -80%',
    date: '2026-03',
    stack: ['ts', 'do', 'wss', 'vitest'],
    tags: ['solo', 'saas'],
    metrics: [['p99 지연', '-80%'], ['Idle 비용', '-90%'], ['MAU', '+3.2k']],
    problem: '기존 단일 WS 서버 구조에서 동시접속 100+ 시 p99 지연 2초 초과. 룸 단위 격리 안됨.',
    approach: 'Durable Objects로 룸 단위 샤딩 + Hibernation API로 idle 비용 절감.',
    code: `export class Whiteboard extends DurableObject {
  async fetch(req) {
    const id = this.state.id.toString()
    return new Response('ok')
  }
}`,
    featured: true,
  },
  {
    slug: 'sales-saas',
    title: '매출 분석 SaaS',
    summary: '소상공인 대상 결제 → 인사이트, 8주 단독 출시',
    date: '2025-11',
    stack: ['react', 'd1', 'stripe'],
    tags: ['solo', 'saas'],
    metrics: [['활성 매장', '120+'], ['결제 성공률', '99.4%'], ['출시', '8wk']],
    problem: '소상공인이 결제 대시보드를 직접 만들 수 없어 데이터를 활용 못함.',
    approach: 'Stripe Connect + D1 단일 스키마로 매장당 분석 자동 생성.',
    code: `const stats = await db.query(SQL.matview)`,
  },
  {
    slug: 'mini-cms',
    title: 'Mini CMS, in 200 lines',
    summary: 'velite + MDX 만으로 헤드리스 CMS, OSS ★200',
    date: '2025-06',
    stack: ['mdx', 'velite', 'zod'],
    tags: ['oss'],
    metrics: [['GitHub ★', '200+'], ['Contrib', '12'], ['Prod 사용', '4곳']],
    problem: 'CMS는 무겁고 marketing-MDX는 스키마가 약함. 그 사이의 도구가 없음.',
    approach: 'Zod 스키마 + 빌드타임 인덱스. 200줄 안에서 끝.',
    code: `defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s.object({ title: s.string() }),
})`,
  },
  {
    slug: 'ds-migration',
    title: 'styled-components → Tailwind 4',
    summary: 'DS 통합 + 컴포넌트 80→24개로 축소',
    date: '2024-09',
    stack: ['tw 4', 'rtk'],
    tags: ['client'],
    metrics: [['컴포넌트', '80→24'], ['빌드 시간', '-44%'], ['CSS', '-72%']],
    problem: '4년 누적된 styled-components가 빌드 캐시를 망가뜨리고 일관성도 잃음.',
    approach: 'Tailwind 4 + 디자인 토큰. 컴포넌트 inventory부터.',
    code: `<button class="btn primary"></button>`,
  },
];

const POSTS = [
  { slug: 'cf-rsc-running', title: 'Cloudflare Workers + RSC, 한 달 운영기', date: '2026-04-20', read: '8 min', tags: ['rsc', 'cf'], lede: 'Workers의 cold start, RSC streaming, 캐싱까지 한 달 굴려본 기록.' },
  { slug: 'velite-mdx', title: 'velite로 MDX 컬렉션 다루기', date: '2026-03-11', read: '6 min', tags: ['mdx', 'velite'], lede: 'frontmatter Zod 검증 + 빌드타임 인덱스로 단순한 CMS 만들기.' },
  { slug: 'solo-ops', title: '1인 개발자의 운영 자동화', date: '2026-02-02', read: '5 min', tags: ['ops'], lede: '온콜 0건/주를 만든 작은 자동화 모음.' },
  { slug: 'tw4-migrate', title: 'Tailwind 4 마이그레이션 메모', date: '2026-01-05', read: '7 min', tags: ['tw'], lede: 'styled-components에서 Tailwind 4로 옮긴 단계별 기록.' },
  { slug: 'vitest-tdd', title: 'Vitest로 TDD 워크플로 만들기', date: '2025-12-08', read: '9 min', tags: ['tdd'], lede: '빠른 피드백 루프를 위한 Vitest 셋업과 협업 규칙.' },
  { slug: 'resend-mail', title: 'Resend로 1인 메일 인프라 만들기', date: '2025-11-02', read: '5 min', tags: ['ops'], lede: '도메인 인증, 자동 응답, 발송 관찰까지 30분.' },
];

const APPS = [
  { slug: 'moai', name: 'Moai' },
];

// ─────────────────────────────────────────────────────
// Routing — minimal hash router
// ─────────────────────────────────────────────────────
const ROUTES = {
  '/': { title: 'home', kind: 'home' },
  '/about': { title: 'about', kind: 'about' },
  '/projects': { title: 'projects', kind: 'projects' },
  '/blog': { title: 'blog', kind: 'blog' },
  '/contact': { title: 'contact', kind: 'contact' },
  '/legal': { title: 'legal', kind: 'legal-index' },
};

function parseHash() {
  const h = (window.location.hash || '#/').slice(1) || '/';
  return h;
}

function useRoute() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const f = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const nav = useCallback((to) => {
    if (to.startsWith('http')) { window.location.href = to; return; }
    window.location.hash = to.startsWith('#') ? to : '#' + to;
  }, []);
  return [route, nav];
}

window.useRoute = useRoute;
window.PROJECTS = PROJECTS;
window.POSTS = POSTS;
window.APPS = APPS;
window.ROUTES = ROUTES;
})();
