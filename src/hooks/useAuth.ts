"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useAuth = () => {
	const { data, status, update } = useSession();
	const [isFetched, setIsFetched] = useState(false);

	useEffect(() => {
		if (!isFetched && data?.error === "RetryApiCall") {
			setIsFetched(true);
			update();
		}
		if (data?.error === "Unauthorizhed") {
			signOut({ redirect: false });
		}
	}, [data, status, isFetched, update]);

	return {
		session: data,
		status,
		update
	};
};
