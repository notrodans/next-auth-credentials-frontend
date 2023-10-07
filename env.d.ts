export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NEXT_PUBLIC_URL: string;
			NEXT_PUBLIC_API_URL: string;
			NEXTAUTH_SECRET: string;
			NEXTAUTH_URL: string;
			NEXT_PUBLIC_JWT_EXPIRES: string;
		}
	}
}
