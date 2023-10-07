"use client";

import { Container, FormContainer } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Page() {
	const { session, status } = useAuth();

	return (
		<div className='min-h-full flex-col items-center justify-center'>
			<Container>
				{status === "authenticated" ? (
					<div className='flex flex-col justify-center'>
						<div>I am logged in as {session?.user?.login}</div>
					</div>
				) : (
					<FormContainer className='flex flex-col gap-y-2'>
						<Button asChild>
							<Link href='/api/auth/signin'>Sign in</Link>
						</Button>
						<span className='self-center text-sm font-light text-gray-400'>or</span>
						<Button asChild>
							<Link href='/signup'>Sign up</Link>
						</Button>
					</FormContainer>
				)}
			</Container>
		</div>
	);
}
