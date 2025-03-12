//packages/frontend/lib/authProps.ts
import cookie from "cookie";
import jwt from "jsonwebtoken";

export interface JwtDecoded {
	uid: string;
	username?: string;
}

export async function getAuthProps(context: any): Promise<{ initialLoggedIn: boolean; initialUser: JwtDecoded | null }> {
	const cookiesParsed = cookie.parse(context.req.headers.cookie || "");
	const token = cookiesParsed.token;
	const refreshToken = cookiesParsed.refreshToken;
	console.log(token, refreshToken);

	// Function to attempt refresh via the /refresh endpoint
	async function tryRefresh(): Promise<{ initialLoggedIn: boolean; initialUser: JwtDecoded | null }> {
		try {
			const refreshResponse = await fetch("http://localhost:5001/auth/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `refreshToken=${refreshToken}`,
				},
			});
			if (refreshResponse.ok) {
				const setCookieHeader = refreshResponse.headers.get("set-cookie");
				if (setCookieHeader) {
					context.res.setHeader("Set-Cookie", setCookieHeader);
					const newCookies = cookie.parse(setCookieHeader);
					const newAccessToken = newCookies.token;
					const decodedNew = jwt.verify(
						newAccessToken,
						process.env.JWT_PUBLIC_KEY || "your-public-key-here",
						{ algorithms: ["ES512"] }
					) as JwtDecoded;
					return { initialLoggedIn: true, initialUser: { uid: decodedNew.uid, username: decodedNew.username || "PiUser" } };
				}
			} else {
				console.log("Refresh endpoint response not OK");
			}
		} catch (err) {
			console.error("Error calling refresh endpoint:", err);
		}
		return { initialLoggedIn: false, initialUser: null };
	}

	if (token) {
		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_PUBLIC_KEY || "your-public-key-here",
				{ algorithms: ["ES512"] }
			) as JwtDecoded;
			return { initialLoggedIn: true, initialUser: { uid: decoded.uid, username: decoded.username || "PiUser" } };
		} catch (e: any) {
			console.log("Error decoding token:", e);
			if (e.name === "TokenExpiredError" && refreshToken) {
				return await tryRefresh();
			}
			if (refreshToken) {
				return await tryRefresh();
			}
			return { initialLoggedIn: false, initialUser: null };
		}
	}

	// When no token is present, attempt a refresh if possible
	if (refreshToken) {
		return await tryRefresh();
	}

	return { initialLoggedIn: false, initialUser: null };
}
