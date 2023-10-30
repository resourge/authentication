import { type BasePermissions } from './models/BasePermissions';
import { type BaseUser } from './models/BaseUser';

export type SetupAuthenticationTokenType = {
	token: string | null
	refreshToken?: string | null
}

export type SetupAuthenticationType<
	U extends BaseUser = BaseUser, 
	P extends BasePermissions = BasePermissions
> = {
	permissions?: P
	user?: U
}

export type SetupAuthenticationStorage = {
	/**
	 * Gets key from local storage
	 */
	getItem: (key: string) => Promise<string | null> | string | null
	/**
	 * Removes key from local storage
	 */
	removeItem: (key: string) => Promise<void> | void
	/**
	 * Sets key from local storage
	 */
	setItem: (key: string, value: string) => Promise<void> | void
}

export type SetupAuthenticationReturn<U extends BaseUser, P extends BasePermissions> = {
	/**
	 * Gets refresh token from local storage (if storage is set)
	 */
	getRefreshToken: () => Promise<string | null | undefined>
	/**
	 * Gets token from local storage (if storage is set)
	 */
	getToken: () => Promise<string | null | undefined>
	promise: (token?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>
	read: () => [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]
	/**
	 * Sets refresh token from local storage (if storage is set)
	 */
	setRefreshToken: (refreshToken: string | null | undefined) => void
	/**
	 * Sets token from local storage (if storage is set)
	 */
	setToken: (token: string | null | undefined) => void
	storage?: SetupAuthenticationStorage
}

const STORAGE_TOKEN_KEY = '_AC_'
const STORAGE_REFRESH_TOKEN_KEY = '_ACR_'

/**
 * Sets the start of the authentication system. 
 * @param promise First method called. It's called each time the user enters the website.
 * @param storage optional Storage, by setting this object, "token" will be saved and used locally 
 */
export const setupAuthentication = <U extends BaseUser, P extends BasePermissions>(
	promise: (token?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>,
	storage?: SetupAuthenticationStorage
): SetupAuthenticationReturn<U, P> => {
	let status = 'pending';
	let result: [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>];

	const getToken = () => {
		return Promise.resolve(storage?.getItem(STORAGE_TOKEN_KEY));
	}

	const setToken = (token: string | null | undefined) => {
		if ( storage && token !== undefined ) {
			if ( token === null ) {
				storage?.removeItem(STORAGE_TOKEN_KEY)
				return;
			}

			storage?.setItem(STORAGE_TOKEN_KEY, token)
		}
	}

	const getRefreshToken = () => {
		return Promise.resolve(storage?.getItem(STORAGE_REFRESH_TOKEN_KEY));
	}

	const setRefreshToken = (refreshToken: string | null | undefined) => {
		if ( storage && refreshToken !== undefined ) {
			if ( refreshToken === null ) {
				storage?.removeItem(STORAGE_REFRESH_TOKEN_KEY)
				return;
			}

			storage?.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken)
		}
	}

	const _promise = async (): Promise<[SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]> => {
		const [token, refreshToken] = await Promise.all([
			getToken(),
			getRefreshToken()
		]);

		const data = await promise(token)
		
		return [
			{
				token: token ?? data.token ?? null,
				refreshToken: refreshToken ?? data.refreshToken
			},
			data
		]
	}

	const suspend = _promise().then(
		(res) => {
			status = 'success';
			result = res;
		},
		(err) => {
			status = 'error';
			result = err;
		}
	);

	return {
		promise,
		read() {
			if (status === 'pending') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw suspend;
			}
			else if (status === 'error') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw result;
			}
			return result;
		},
		storage,
		setToken,
		getToken,
		setRefreshToken,
		getRefreshToken
	};
};
