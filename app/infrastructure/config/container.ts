import type { LegalRepository } from "~/application/content/ports/legal-repository.port";
import type { PostRepository } from "~/application/content/ports/post-repository.port";
import type { ProjectRepository } from "~/application/content/ports/project-repository.port";
import { getFeaturedProject } from "~/application/content/services/get-featured-project.service";
import { getPostDetail } from "~/application/content/services/get-post-detail.service";
import { getProjectDetail } from "~/application/content/services/get-project-detail.service";
import { getRecentPosts } from "~/application/content/services/get-recent-posts.service";
import { listPosts } from "~/application/content/services/list-posts.service";
import { listProjects } from "~/application/content/services/list-projects.service";
import {
	submitContactForm,
	type SubmitContactFormParams,
} from "~/application/contact/services/submit-contact-form.service";
import { buildRssFeed } from "~/application/feed/services/build-rss-feed.service";
import type { AppLegalDoc } from "~/domain/legal/app-legal-doc.entity";
import type { Post } from "~/domain/post/post.entity";
import type { Project } from "~/domain/project/project.entity";
import { createTurnstileVerifier } from "~/infrastructure/captcha/turnstile-verifier";
import { veliteLegalRepository } from "~/infrastructure/content/velite-legal.repository";
import { velitePostRepository } from "~/infrastructure/content/velite-post.repository";
import { veliteProjectRepository } from "~/infrastructure/content/velite-project.repository";
import { createResendEmailSender } from "~/infrastructure/email/resend-email-sender";
import { createKvRateLimiter } from "~/infrastructure/ratelimit/kv-rate-limiter";

interface ContactRuntimeEnv {
	RESEND_API_KEY?: string;
	TURNSTILE_SECRET?: string;
	CONTACT_TO_EMAIL: string;
	RATE_LIMIT_KV: KVNamespace;
}

export type Container = {
	listProjects: (opts?: { tag?: string }) => Promise<Project[]>;
	getProjectDetail: (
		slug: string,
	) => Promise<{ project: Project; prev: Project | null; next: Project | null }>;
	getFeaturedProject: () => Promise<Project | null>;
	listPosts: (opts?: { tag?: string }) => Promise<Post[]>;
	getPostDetail: (slug: string) => Promise<{ post: Post; prev: Post | null; next: Post | null }>;
	getRecentPosts: (n: number) => Promise<Post[]>;
	buildRssFeed: () => Promise<string>;
	listApps: () => Promise<string[]>;
	findAppDoc: (appSlug: string, docType: "terms" | "privacy") => Promise<AppLegalDoc | null>;
	submitContactForm: (params: Pick<SubmitContactFormParams, "submission" | "ip">) => Promise<void>;
};

export const buildContainer = (env: Env): Container => {
	const projectRepo: ProjectRepository = veliteProjectRepository;
	const postRepo: PostRepository = velitePostRepository;
	const legalRepo: LegalRepository = veliteLegalRepository;

	const contactEnv = env as unknown as ContactRuntimeEnv;
	const resendApiKey = contactEnv.RESEND_API_KEY ?? "";
	const turnstileSecret = contactEnv.TURNSTILE_SECRET ?? "";
	const emailSender = createResendEmailSender(resendApiKey, contactEnv.CONTACT_TO_EMAIL);
	const captchaVerifier = createTurnstileVerifier(turnstileSecret);
	const rateLimiter = createKvRateLimiter(contactEnv.RATE_LIMIT_KV);

	return {
		listProjects: (opts) => listProjects(projectRepo, opts),
		getProjectDetail: (slug) => getProjectDetail(projectRepo, slug),
		getFeaturedProject: () => getFeaturedProject(projectRepo),
		listPosts: (opts) => listPosts(postRepo, opts),
		getPostDetail: (slug) => getPostDetail(postRepo, slug),
		getRecentPosts: (n) => getRecentPosts(postRepo, n),
		buildRssFeed: async () => buildRssFeed(await postRepo.findAll()),
		listApps: () => legalRepo.listApps(),
		findAppDoc: (appSlug, docType) => legalRepo.findAppDoc(appSlug, docType),
		submitContactForm: ({ submission, ip }) =>
			submitContactForm({
				submission,
				ip,
				toEmail: contactEnv.CONTACT_TO_EMAIL,
				emailSender,
				captchaVerifier,
				rateLimiter,
			}),
	};
};
