export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NEXT_PUBLIC_URL: string;
			NEXT_PUBLIC_API_URL: string;
			NEXTAUTH_SECRET: string;
			NEXTAUTH_URL: string;
			NEXT_PUBLIC_ACCESS_EXPIRES: string;
			NEXT_PUBLIC_REFRESH_EXPIRES: string;
		}
	}
}
