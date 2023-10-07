import NextAuth, { NextAuthOptions, UserDetails } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { signOut } from "next-auth/react";

async function refreshTokenApiCall(token: JWT): Promise<JWT> {
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
		if (res.ok) {
			const data = (await res.json()) as { accessToken: string; expiresIn: number };
			const newToken: JWT = {
				...token,
				...data
			};
			return newToken;
		}
	}

	return {
		...token,
		accessToken: undefined,
		expiresIn: undefined,
		refreshToken: undefined,
		role: undefined
	} satisfies JWT;
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
	} else {
		throw new Error(userDetails?.message);
	}
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

				if (credentials?.email && credentials.password) {
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
			const accessToken = token.accessToken;

			if (accessToken) {
				const userDetails = (await fetchProfile(accessToken)) as Omit<UserDetails, "accessToken">;

				if (token.role !== userDetails.role) await signOut();

				session.user = { ...userDetails, accessToken };
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.refreshToken = user.tokens?.refreshToken;
				token.accessToken = user.tokens?.accessToken;
				token.expiresIn = user.tokens?.expiresIn;
				token.role = user.user?.role;
			}

			if (Date.now() < Number(token?.expiresIn) - 2000) {
				return token;
			}

			return await refreshTokenApiCall(token);
		}
	},
	session: {
		strategy: "jwt"
	},
	jwt: {
		maxAge: +process.env.NEXT_PUBLIC_JWT_EXPIRES // Same as on the backend
	},
	pages: {
		signIn: "/signin",
		signOut: "/signout"
	}
} satisfies NextAuthOptions;

export default NextAuth(authOptions);
