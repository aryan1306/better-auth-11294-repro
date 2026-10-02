// Repro for better-auth/better-auth#11294
// VARIANT picks the plugin set: core | mcp | oauth | oauth-resources
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { mcp } from "@better-auth/mcp";
import { oauthProvider } from "@better-auth/oauth-provider";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
// Schema generated for the core tables only, before any OAuth plugin was added.
import * as schema from "./auth-schema-core";

const db = drizzle(new Database(":memory:"));
const variant = process.env.VARIANT ?? "core";

const plugins = {
	core: [],
	mcp: [
		jwt(),
		mcp({
			loginPage: "/sign-in",
			consentPage: "/consent",
			resource: "https://api.example.com/mcp",
		}),
	],
	oauth: [jwt(), oauthProvider({ loginPage: "/sign-in", consentPage: "/consent" })],
	"oauth-resources": [
		jwt(),
		oauthProvider({
			loginPage: "/sign-in",
			consentPage: "/consent",
			resources: ["https://api.example.com/mcp"],
		}),
	],
}[variant];

export const auth = betterAuth({
	baseURL: "http://localhost:3000",
	secret: "repro-only-not-a-real-secret-0123456789",
	database: drizzleAdapter(db, { provider: "sqlite", schema }),
	emailAndPassword: { enabled: true },
	plugins,
});
