import NextAuth, { Error, NextAuthOptions, Tokens, UserDetails } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { signOut } from "next-auth/react";

type TokensAndError = Tokens & { error: Error };

async function refreshTokenApiCall(token: JWT): Promise<TokensAndError> {
	if (token?.refreshToken) {
		const url = process.env.NEXT_PUBLIC_API_URL + "/auth/refresh";

		const formData = new URLSearchParams();
		formData.append("refreshToken", token.refreshToken);

		const res = await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${formData.get("refreshToken")}`
			},
			body: formData
		});

		const data = (await res.json()) as TokensAndError;

		if (res.ok) {
			return data;
		}

		return {
			accessToken: null,
			refreshToken: null,
			expiresIn: 0,
			error: null
		};
	}

	return {
		error: "RefreshAccessTokenError"
	};
}

const fetchProfile = async (accessToken: string) => {
	const url = process.env.NEXT_PUBLIC_API_URL + "/user/profile";

	const userRes = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/json"
		}
	});

	const userDetails = await userRes.json();

	if (userRes.ok) {
		return userDetails;
	}

	return null;
};

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "jsmith@gmail.com"
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "jsmith123"
				}
			},
			async authorize(credentials) {
				const url = process.env.NEXT_PUBLIC_API_URL + "/auth/login";
				const formData = new URLSearchParams();

				if (credentials?.email && credentials?.password) {
					formData.append("email", credentials.email);
					formData.append("password", credentials.password);
				}

				const res = await fetch(url, {
					method: "POST",
					headers: {
						Accept: "application/json"
					},
					body: formData
				});

				const response = await res.json();

				if (res.ok) {
					return response;
				}

				throw new Error(response.message);
			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			const accessToken = token?.accessToken;

			if (accessToken && !token.error) {
				const userDetails = (await fetchProfile(accessToken)) as Omit<UserDetails, "accessToken">;

				if (token.role !== userDetails.role) await signOut({ redirect: true });

				session.user = { ...userDetails, accessToken };

				return Promise.resolve(session);
			}

			session.user = null;
			session.error = token.error;

			return Promise.resolve(session);
		},
		async jwt({ token, user }) {
			if (user) {
				token.refreshToken = user.tokens?.refreshToken;
				token.accessToken = user.tokens?.accessToken;
				token.expiresIn = user.tokens?.expiresIn;
				token.role = user.user?.role;
				token.error = null;
			}

			const isAuth = !!token?.refreshToken || !!token?.expiresIn || !!token?.email || !!token?.role;

			if (!isAuth) {
				return Promise.resolve(token);
			}

			const tokenExpires = Number(token.expiresIn) - 2000;

			if (Date.now() < tokenExpires) {
				return Promise.resolve(token);
			}

			const { accessToken, error, expiresIn, refreshToken } = await refreshTokenApiCall(token);
			token = { ...token, refreshToken, accessToken, error, expiresIn };

			return Promise.resolve(token);
		}
	},
	session: {
		strategy: "jwt",
		maxAge: +process.env.NEXT_PUBLIC_JWT_EXPIRES
	},
	jwt: {
		maxAge: +process.env.NEXT_PUBLIC_JWT_EXPIRES // Same as on the backend
	},
	pages: {
		signIn: "/signin",
		signOut: "/signout"
	},
	debug: process.env.NODE_ENV === "development" ? true : false
} satisfies NextAuthOptions;

export default NextAuth(authOptions);
