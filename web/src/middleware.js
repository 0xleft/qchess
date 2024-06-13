import { NextResponse } from "next/server";
import { withAuth } from 'next-auth/middleware';

const publicPaths = ["/user/*"];
const isPublic = (path) => publicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace("*$", "(.*)$"))));

export default withAuth(req => {
	if (isPublic(new URL(req.url).pathname)) {
		return NextResponse.next();
	}

	if (req.nextauth.token) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL("/auth/signin", req.nextUrl.origin));
});


export const config = {
	matcher: ['/user']
};