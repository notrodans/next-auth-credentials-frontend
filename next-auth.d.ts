import { DefaultSession, Role } from "next-auth";

declare module "next-auth" {
	type Role = "USER" | "ADMIN";

	type UserDetails = {
		email: string;
		login: string;
		firstName: string;
		lastName: string;
		role: Role;
		accessToken: string;
	};

	interface Session {
		user: UserDetails & DefaultSession["user"];
	}

	interface User {
		user: UserDetails;
		tokens: {
			accessToken: string;
			refreshToken: string;
			expiresIn: number;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		expiresIn?: number;
		role?: Role;
	}
}
