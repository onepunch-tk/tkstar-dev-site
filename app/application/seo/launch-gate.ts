type LaunchEnv = { SITE_LAUNCHED: string; SITE_ORIGIN: string };

export const isLaunched = (env: LaunchEnv): boolean => env.SITE_LAUNCHED === "true";

export const getSiteOrigin = (env: LaunchEnv): string => env.SITE_ORIGIN;
