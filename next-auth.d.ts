import { DefaultSession, ErrorType, Role } from "next-auth";
import { ProviderType } from "next-auth/providers/index";

declare module "next-auth" {
	type ErrorType = "Unauthorizhed" | "RetryApiCall" | null | undefined;
	type Role = "USER" | "ADMIN";
	type Tokens = {
		accessToken?: string | null;
		refreshToken?: string | null;
		expiresIn?: number | null;
	};

	type UserDetails = {
		email: string;
		login: string;
		firstName: string;
		lastName: string;
		role: Role;
		accessToken: string;
	};

	interface Session {
		user: (DefaultSession["user"] & UserDetails) | null;
		error?: ErrorType;
	}

	interface User {
		user: UserDetails;
		tokens: Tokens;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string | null;
		refreshToken?: string | null;
		expiresIn?: number | null;
		role?: Role | null;
		error?: ErrorType;
		providerType?: ProviderType;
	}
}
