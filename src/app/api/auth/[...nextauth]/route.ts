import NextAuth, { NextAuthOptions, UserDetails } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
					body: formData,
					cache: "no-cache"
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

			if (accessToken) {
				const userDetails = await fetchProfile(accessToken);

				if (!userDetails) {
					session.error = "RetryApiCall";
					return Promise.resolve(session);
				}

				if (token.role !== userDetails?.role) {
					session.error = "Unauthorizhed";
					return Promise.resolve(session);
				}

				session.user = { ...userDetails, accessToken };
			}

			if (token?.error) {
				session.error = token.error;
			}

			return Promise.resolve(session);
		},
		async jwt({ token, user, account, trigger }) {
			if (user) {
				token.providerType = account?.type;
			}

			if (token.providerType === "credentials") {
				if (user) {
					token.refreshToken = user.tokens?.refreshToken;
					token.accessToken = user.tokens?.accessToken;
					token.expiresIn = user.tokens?.expiresIn;
					token.role = user.user?.role;
					token.error = null;
				}

				if (trigger === "update") {
					token.error = "RetryApiCall";
				}

				if (!token.refreshToken) {
					return Promise.resolve({ ...token, error: "Unauthorizhed" });
				}

				/* eslint-disable */
				// @ts-ignore
				console.log((token?.expiresIn - Date.now()) / 1000);

				return Promise.resolve(token);
			}

			return Promise.resolve(token);
		}
	},
	session: {
		strategy: "jwt"
	},
	jwt: {
		maxAge: +process.env.NEXT_PUBLIC_REFRESH_EXPIRES // Same refresh token expires as on the backend
	},
	pages: {
		signIn: "/signin"
	},
	debug: process.env.NODE_ENV === "development" ? true : false
} satisfies NextAuthOptions;

const fetchProfile = async (
	accessToken: string
): Promise<Omit<UserDetails, "accessToken"> | null> => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "/user/profile"
		const userRes = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/json"
			},
			credentials: "include",
			cache: "no-cache"
		});
		const userDetails = await userRes.json();
		if (userRes.ok) {
			return userDetails;
		}
	} catch (e) {
		console.log(e);
	}
	return null;
};

export const handler = NextAuth(authOptions);

export { handler as POST, handler as GET };
