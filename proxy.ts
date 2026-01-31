import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	const requestHeaders = new Headers(request.headers);
	if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	} catch (error) {
		console.error("Authentication error:", error);
		return NextResponse.redirect(new URL("/login", request.url));
	}
}

export const config = {
	matcher: ["/app/", "/app/:path*"],
};
