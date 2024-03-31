"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useAuth = () => {
	const { data, status, update } = useSession();
	const [isFetched, setIsFetched] = useState(false);

	useEffect(() => {
		(async () => {
			if (!isFetched && data?.error === "RetryApiCall") {
				setIsFetched(true);
				await update();
			}
			if (data?.error === "Unauthorizhed") {
				await signOut({ redirect: false });
			}
		})();
	}, [data, status, isFetched, update]);

	return {
		session: data,
		status,
		update
	};
};
