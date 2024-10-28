import { jwtDecode } from 'jwt-decode';

export function isJWT(token: string) {
	// JWTs are typically in the format xxxxx.yyyyy.zzzzz
	// where each part is base64 encoded JSON
	const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
	return jwtRegex.test(token);
}

export function getExpInNumberFromJWT(token?: string | null) {
	try {
		if ( token && isJWT(token) ) {
			const { exp } = jwtDecode(token);

			if ( exp ) {
			// Removes 1 minutes so it checks before
				return exp * 1000 - (1 * 60 * 1000);
			}
		}
	}
	catch {
		
	}
	return undefined;
}

export function isJWTExpired(token: string) {
	const expireIn = getExpInNumberFromJWT(token);

	if ( expireIn && expireIn < Date.now() ) {
		return true;
	}

	return false;
}
