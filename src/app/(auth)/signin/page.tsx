"use client";

import { FormContainer } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const formSchema = v.object({
	email: v.string([v.email(), v.minLength(2, "Email must be at least 2 characters.")]),
	password: v.string([v.minLength(8, "Password must be at least 8 characters.")])
});

export default function Page() {
	const { session } = useAuth();

	const searchParams = useSearchParams();

	if (session) {
		redirect("/");
	}

	const callbackUrl = useMemo(
		() => searchParams?.get("callbackUrl")?.replace(process.env.NEXT_PUBLIC_URL!, "") || "",
		[searchParams]
	);

	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		router.prefetch(callbackUrl);
	}, [router, callbackUrl]);

	const form = useForm<v.Output<typeof formSchema>>({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	async function onSubmit(values: v.Output<typeof formSchema>) {
		const res = await signIn("credentials", {
			...values,
			redirect: false,
			callbackUrl
		});

		if (!res?.error) {
			toast({ title: "Success", description: "Successful authorization" });

			setTimeout(() => {
				router.replace(callbackUrl);
			});
		} else {
			toast({ title: "Error", description: res?.error });
		}
	}

	return (
		<div className='min-h-full flex-col'>
			<FormContainer>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type='email' placeholder='jsmith@gmail.com' {...field} required />
									</FormControl>
									<FormDescription>This is your display email.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type='password' placeholder='jsmith123' {...field} required />
									</FormControl>
									<FormDescription>This is your password</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex flex-col gap-y-2'>
							<Button className='w-full' type='submit'>
								Submit
							</Button>
							<span className='self-center text-sm font-light text-gray-400'>or</span>
							<Button asChild>
								<Link href='/signup'>Sign up</Link>
							</Button>
						</div>
					</form>
				</Form>
			</FormContainer>
		</div>
	);
}
