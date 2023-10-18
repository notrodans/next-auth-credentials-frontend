import { DefaultSession, Role, Error } from "next-auth";

declare module "next-auth" {
	type Error = "RefreshAccessTokenError" | null | undefined;
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
		user: (UserDetails & DefaultSession["user"]) | null;
		error?: Error;
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
		error?: Error;
	}
}
