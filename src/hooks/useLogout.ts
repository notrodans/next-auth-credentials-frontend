import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";
import { useAuth } from "./useAuth";

type Toast = Omit<ToasterToast, "id">;

type ToasterToast = ToastProps & {
	id: string;
	title?: React.ReactNode;
	description?: React.ReactNode;
	action?: ToastActionElement;
};

export const useLogout = ({
	title = "Logout",
	description = "Successful logout",
	...props
}: Toast = {}) => {
	const { toast } = useToast();
	const { status } = useAuth();

	const onClick = async () => {
		if (status === "loading") {
			return;
		}
		if (status === "authenticated") {
			await signOut({ redirect: false });
			toast({ title, description, ...props });
		}
		if (status === "unauthenticated") {
			toast({ title: "Error", description: "You are not authorized", ...props });
		}
	};

	return { onClick };
};
