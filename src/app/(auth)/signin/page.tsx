"use client";

import { signIn } from "next-auth/react";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { FormContainer } from "@/components/common/container";

const formSchema = v.object({
	email: v.string([v.email(), v.minLength(2, "Email must be at least 2 characters.")]),
	password: v.string([v.minLength(8, "Password must be at least 8 characters.")])
});

export default function Page() {
	const { session, status } = useAuth();

	const searchParams = useSearchParams();

	if (session && status === "authenticated") {
		redirect("/");
	}

	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<v.Output<typeof formSchema>>({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	async function onSubmit(values: v.Output<typeof formSchema>) {
		const callbackUrl =
			searchParams?.get("callbackUrl")?.replace(process.env.NEXT_PUBLIC_URL!, "") || "";

		await signIn("credentials", {
			...values,
			redirect: false,
			callbackUrl
		}).then(res => {
			if (res?.error) {
				toast({ title: "Error", description: res?.error });
			} else {
				setTimeout(() => {
					router.push(callbackUrl);
					toast({ title: "Success", description: "Successful authorization" });
				}, 0);
			}
		});
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
