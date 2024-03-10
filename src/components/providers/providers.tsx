"use client";

import { ReactNode } from "react";
import {
	SessionProvider as SessionProviderAuth,
	SessionProviderProps as SessionProviderAuthProps
} from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

interface ProvidersProps extends SessionProviderProps {
	children: ReactNode;
}

const Providers = ({ children, ...props }: ProvidersProps) => {
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
			<SessionProvider {...props}>{children}</SessionProvider>
		</ThemeProvider>
	);
};

interface SessionProviderProps extends SessionProviderAuthProps {
	children: ReactNode;
}

const SessionProvider = ({ children, ...props }: SessionProviderProps) => {
	return <SessionProviderAuth {...props}>{children}</SessionProviderAuth>;
};

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export { Providers, SessionProvider, ThemeProvider };
