import type { Container } from "~/infrastructure/config/container";

declare module "react-router" {
	interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
		container: Container;
	}
}
