import { useSession } from "next-auth/react";
import { useMemo } from "react";

export const useAuth = () => {
	const { data, status, update } = useSession();

	return useMemo(
		() => ({
			session: data,
			status,
			update
		}),
		[data, status, update]
	);
};
