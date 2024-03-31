import { ErrorType, Tokens } from "next-auth";
import { JWT, encode, getToken } from "next-auth/jwt";
import { NextMiddleware, NextRequest, NextResponse } from "next/server";

export type TokensAndError = Tokens & { error: ErrorType };

let isRefreshing = false;

export const SIGNIN_SUB_URL = "/signin";
export const REFRESH_EXPIRES = +process.env.NEXT_PUBLIC_REFRESH_EXPIRES;
export const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith("https://");
export const SESSION_COOKIE = SESSION_SECURE
	? "__Secure-next-auth.session-token"
	: "next-auth.session-token";

export const middleware: NextMiddleware = async request => {
	const token = await getToken({ req: request });
	const isAuthenticated = !!token;

	let response = NextResponse.next();

	if (!isAuthenticated) {
		return signOut(request);
	}

	if (shouldUpdateToken(token) || token.error === "RetryApiCall") {
		try {
			const newToken = { ...(await refreshTokens(token)) };
			if (newToken.error === "Unauthorizhed") {
				return updateCookie(null, request, response);
			}
			const newSessionToken = await encode({
				secret: process.env.NEXTAUTH_SECRET,
				token: newToken,
				maxAge: REFRESH_EXPIRES
			});
			response = updateCookie(newSessionToken, request, response);
		} catch (error) {
			console.log("Error refreshing token: ", error);
			return updateCookie(null, request, response);
		}
	}

	return response;
};

export const config = {
	matcher: "/:path*"
};

export function shouldUpdateToken(token: JWT): boolean {
	return Date.now() < Number(token?.expiresIn) - 5000 ? false : true;
}

export async function refreshTokens(token: JWT): Promise<JWT> {
	if (isRefreshing) {
		return token;
	}

	isRefreshing = true;

	const refreshToken = token?.refreshToken;

	if (!refreshToken) {
		return {
			...token,
			error: "Unauthorizhed"
		};
	}

	try {
		const formData = new URLSearchParams();
		formData.append("refreshToken", refreshToken);

		const url = process.env.NEXT_PUBLIC_API_URL + "/auth/refresh";

		const res = await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${formData.get("refreshToken")}`
			},
			credentials: "include",
			body: formData,
			cache: "no-cache"
		});

		const data = (await res.json()) as TokensAndError;

		if (res.ok) {
			return {
				...token,
				accessToken: data.accessToken,
				refreshToken: data.refreshToken,
				expiresIn: data.expiresIn
			};
		}

		if (res.status === 401) {
			return {
				...token,
				accessToken: null,
				refreshToken: null,
				expiresIn: 0,
				error: "Unauthorizhed"
			};
		}
	} catch (e) {
		console.error(e);
	} finally {
		isRefreshing = false;
	}

	return token;
}

export function updateCookie(
	sessionToken: string | null,
	request: NextRequest,
	response: NextResponse
): NextResponse<unknown> {
	if (sessionToken) {
		request.cookies.set(SESSION_COOKIE, sessionToken);

		response = NextResponse.next({
			request: {
				headers: request.headers
			}
		});

		response.cookies.set(SESSION_COOKIE, sessionToken, {
			httpOnly: true,
			maxAge: REFRESH_EXPIRES,
			secure: SESSION_SECURE,
			sameSite: "lax"
		});
	} else {
		request.cookies.delete(SESSION_COOKIE);
		response = NextResponse.next({
			request: {
				headers: request.headers
			}
		});
		response.cookies.delete(SESSION_COOKIE);
	}

	return response;
}

export function signOut(request: NextRequest) {
	const response = NextResponse.next();
	request.cookies.getAll().forEach(cookie => {
		if (cookie.name.includes("next-auth")) response.cookies.delete(cookie.name);
	});

	return response;
}
