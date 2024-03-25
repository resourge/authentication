import { type BasePermissionType } from './types/BasePermissionType';
import { type BaseUserType } from './types/BaseUser';
import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from './utils/constants';

export type SetupAuthenticationTokenType = {
	token: string | null
	refreshToken?: string | null
};

export type SetupAuthenticationType<
	U extends BaseUserType = BaseUserType, 
	P extends BasePermissionType = BasePermissionType
> = {
	permissions?: P
	user?: U
};

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
};

export type SetupAuthenticationReturn<U extends BaseUserType, P extends BasePermissionType> = {
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
};

/**
 * Sets the start of the authentication system. 
 * @param promise First method called. It's called each time the user enters the website.
 * @param storage optional Storage, by setting this object, "token" will be saved and used locally 
 */
export const setupAuthentication = <U extends BaseUserType, P extends BasePermissionType>(
	promise: (token?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>,
	storage?: SetupAuthenticationStorage
): SetupAuthenticationReturn<U, P> => {
	let status = 'pending';
	let result: [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>];

	const getToken = () => {
		return Promise.resolve(storage?.getItem(STORAGE_TOKEN_KEY));
	};

	const setToken = (token: string | null | undefined) => {
		if ( storage && token !== undefined ) {
			if ( token === null ) {
				storage?.removeItem(STORAGE_TOKEN_KEY);
				return;
			}

			storage?.setItem(STORAGE_TOKEN_KEY, token);
		}
	};

	const getRefreshToken = () => {
		return Promise.resolve(storage?.getItem(STORAGE_REFRESH_TOKEN_KEY));
	};

	const setRefreshToken = (refreshToken: string | null | undefined) => {
		if ( storage && refreshToken !== undefined ) {
			if ( refreshToken === null ) {
				storage?.removeItem(STORAGE_REFRESH_TOKEN_KEY);
				return;
			}

			storage?.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshToken);
		}
	};

	const _promise = async (): Promise<[SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]> => {
		const token = await getToken();

		const data = await promise(token);

		const [newToken, newRefreshToken] = await Promise.all([
			getToken(),
			getRefreshToken()
		]);
		
		return [
			{
				token: newToken ?? data.token ?? null,
				refreshToken: newRefreshToken ?? data.refreshToken
			},
			data
		];
	};

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
