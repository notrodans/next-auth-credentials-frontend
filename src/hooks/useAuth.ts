import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export const useAuth = () => {
	const { data, status, update } = useSession();

	useEffect(() => {
		if (!data?.user && status === "authenticated") {
			signOut({ redirect: true });
		}

		if (data?.error === "RefreshAccessTokenError") {
			signOut({ redirect: true });
		}
	}, [data, status]);

	return {
		session: data,
		status,
		update
	};
};
