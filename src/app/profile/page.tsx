"use client";

import { Container } from "@/components/common/container";
import { useAuth } from "@/hooks/useAuth";
import { redirect, usePathname } from "next/navigation";

export default function Page() {
	const { session } = useAuth();
	const pathname = usePathname();

	if (!session) {
		const url = new URLSearchParams();
		url.append(`callbackUrl`, process.env.NEXT_PUBLIC_URL + pathname);
		redirect(`/signin?${url.toString()}`);
	}

	return (
		<div>
			<Container>
				<ul>
					{session?.user &&
						Object.entries(session?.user).map(([k, f], id) => (
							<li className='break-words' key={id}>
								{k}: {f}
							</li>
						))}
				</ul>
			</Container>
		</div>
	);
}
