import { type BasePermissions } from './models/BasePermissions';
import { type BaseUser } from './models/BaseUser';

export type SetupAuthenticationType<
	U extends BaseUser, 
	P extends BasePermissions
> = {
	token: string | null
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
	 * Gets token from local storage (if storage is set)
	 */
	getToken: () => Promise<string | null | undefined>
	promise: (token?: string | null) => Promise<SetupAuthenticationType<U, P>>
	read: () => SetupAuthenticationType<U, P>
	/**
	 * Sets token from local storage (if storage is set)
	 */
	setToken: (token: string | null | undefined) => void
	storage?: SetupAuthenticationStorage
}

const STORAGE_TOKEN_KEY = '_AC_'

/**
 * Sets the start of the authentication system. 
 * @param promise First method called. It's called each time the user enters the website.
 * @param storage optional Storage, by setting this object, "token" will be saved and used locally 
 */
export const setupAuthentication = <U extends BaseUser, P extends BasePermissions>(
	promise: (token?: string | null) => Promise<SetupAuthenticationType<U, P>>,
	storage?: SetupAuthenticationStorage
): SetupAuthenticationReturn<U, P> => {
	let status = 'pending';
	let result: SetupAuthenticationType<U, P>;

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

	const _promise = async () => {
		const token = await getToken();
		
		return await promise(token)
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
		getToken
	};
};
