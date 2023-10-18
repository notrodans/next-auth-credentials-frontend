"use client";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const Header = () => {
	const { session, status } = useAuth();
	const { onClick } = useLogout();
	const { setTheme } = useTheme();
	const pathname = usePathname();

	return (
		<header className='t-0 l-0 fixed w-full border-b bg-background-alpha backdrop-blur-md'>
			<Container className='flex items-center justify-end py-3'>
				<nav className='flex items-center space-x-6 text-sm font-medium'>
					<Link
						href='/'
						className={cn(
							"transition-colors hover:text-foreground/80",
							pathname === "/" ? "text-foreground" : "text-foreground/60"
						)}
					>
						Home
					</Link>
					{status !== "authenticated" && (
						<>
							<Link
								href='/api/auth/signin'
								className={cn(
									"transition-colors hover:text-foreground/80",
									pathname?.startsWith("/examples") ? "text-foreground" : "text-foreground/60"
								)}
							>
								Sign in
							</Link>
							<Link
								href={"/signup"}
								className={cn(
									"text-foreground/60 transition-colors hover:text-foreground/80",
									pathname?.startsWith("/signup") ? "text-foreground" : "text-foreground/60"
								)}
							>
								Sign up
							</Link>
						</>
					)}
					{status === "authenticated" && (
						<>
							{session?.user?.role === "ADMIN" && (
								<Link
									href={"/admin"}
									className={cn(
										"text-foreground/60 transition-colors hover:text-foreground/80",
										pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
									)}
								>
									Admin
								</Link>
							)}
							<Link
								href={"/profile"}
								className={cn(
									"text-foreground/60 transition-colors hover:text-foreground/80",
									pathname?.startsWith("/profile") ? "text-foreground" : "text-foreground/60"
								)}
							>
								Profile
							</Link>
							<Button onClick={onClick}>Log out</Button>
						</>
					)}
				</nav>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className='ml-2' variant='outline' size='icon'>
							<SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
							<MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
							<span className='sr-only'>Toggle theme</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='start'>
						<DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Container>
		</header>
	);
};
