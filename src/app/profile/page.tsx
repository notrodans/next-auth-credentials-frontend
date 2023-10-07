"use client";

import { Container } from "@/components/common/container";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
	const { session } = useAuth();

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
