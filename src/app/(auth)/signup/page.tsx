"use client";

import { redirect, useRouter } from "next/navigation";
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FormContainer } from "@/components/common/container";

const formSchema = v.object({
	login: v.string([v.maxLength(16, "Login must be no more than 16 characters.")]),
	email: v.string([v.email(), v.minLength(2, "Email must be at least 2 characters.")]),
	password: v.string([v.minLength(8, "Password must be at least 8 characters.")]),
	firstName: v.string(),
	lastName: v.string()
});

export default function Page() {
	const { session, status } = useAuth();

	const router = useRouter();

	if (session && status === "authenticated") {
		redirect("/");
	}

	const { toast } = useToast();

	const form = useForm<v.Output<typeof formSchema>>({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			login: "",
			email: "",
			password: "",
			firstName: "",
			lastName: ""
		}
	});

	async function onSubmit(values: v.Output<typeof formSchema>) {
		const formData = new URLSearchParams();
		formData.append("login", values.login);
		formData.append("firstName", values.firstName);
		formData.append("lastName", values.lastName);
		formData.append("email", values.email);
		formData.append("password", values.password);

		const url = process.env.NEXT_PUBLIC_API_URL + "/auth/register";

		const res = await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json"
			},
			body: formData
		});

		if (res.ok) {
			toast({
				title: "Successful account creation",
				description: "Redirects to the login page within a second"
			});

			setTimeout(() => {
				router.push("/signin");
			}, 1000);
		} else {
			const data = await res.json();
			toast({
				title: "Error",
				description: data.message || "Bad request"
			});
		}
	}

	return (
		<FormContainer>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='login'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Login</FormLabel>
								<FormControl>
									<Input type='text' placeholder='jsmith' {...field} />
								</FormControl>
								<FormDescription>This is your public display login.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='firstName'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Firstname</FormLabel>
								<FormControl>
									<Input type='text' placeholder='John' {...field} />
								</FormControl>
								<FormDescription>This is your public display firstname.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='lastName'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Lastname</FormLabel>
								<FormControl>
									<Input type='text' placeholder='Smith' {...field} />
								</FormControl>
								<FormDescription>This is your public display lastname.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type='email' placeholder='jsmith@gmail.com' {...field} />
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
									<Input type='password' placeholder='jsmith123' {...field} />
								</FormControl>
								<FormDescription>This is your password</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button className='w-full' type='submit'>
						Submit
					</Button>
				</form>
			</Form>
		</FormContainer>
	);
}
