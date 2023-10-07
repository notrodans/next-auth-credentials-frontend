import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(req => {
	if (req.nextUrl.pathname.startsWith("/admin")) {
		if (req.nextauth.token?.role !== "ADMIN") {
			return NextResponse.redirect(new URL("/", req.url));
		}
	}
});

export const config = { matcher: ["/admin", "/profile"] };
