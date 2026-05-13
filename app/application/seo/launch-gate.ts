// 의도적으로 Env 전체가 아닌 좁은 string shape — wrangler types 가 [vars] 값을 literal
// 로 발급해 (`SITE_LAUNCHED: "false"`) `=== "true"` 비교를 always-false 로 narrow 하는
// 회귀를 회피. launch 시 typegen 재실행 없이도 helper 가 string 비교를 정상 수행.
type LaunchEnv = { SITE_LAUNCHED: string; SITE_ORIGIN: string };

export const isLaunched = (env: LaunchEnv): boolean => env.SITE_LAUNCHED === "true";

export const getSiteOrigin = (env: LaunchEnv): string => env.SITE_ORIGIN;
