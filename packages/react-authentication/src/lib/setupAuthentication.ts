/* eslint-disable @typescript-eslint/only-throw-error */
import { type BasePermissionType } from './types/BasePermissionType';
import { type BaseUserType } from './types/BaseUser';
import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from './utils/constants';
import { isJWTExpired } from './utils/jwt';

type SetupAuthenticationConfig<U extends BaseUserType, P extends BasePermissionType> = {
	/**
	 * Method to get user information
	 */
	getProfile: (token?: null | string) => Promise<Partial<SetupAuthenticationTokenType> & SetupAuthenticationType<U, P>>
	/**
	 * Method to refresh token when token is expired (works automatically with JWT exp)
	 */
	refreshToken: (token?: null | string, refreshTokenValue?: null | string) => Promise<Partial<SetupAuthenticationTokenType> & SetupAuthenticationType<U, P>>
	/**
	 * If set, token will be stored
	 */
	storage?: SetupAuthenticationStorage
	/**
	 * @default true
	 */
	useSuspense?: boolean
};

export type SetupAuthenticationReturn<U extends BaseUserType, P extends BasePermissionType> = {
	close: () => void
	/**
	 * Function to getProfile
	 */
	getProfile: (token?: null | string) => Promise<Partial<SetupAuthenticationTokenType> & SetupAuthenticationType<U, P>>
	/**
	 * Gets tokens from local storage (if storage is set)
	 */
	getTokens: () => Promise<{
		refreshToken: null | string | undefined
		token: null | string | undefined
	}>
	hasStorage: boolean
	read: () => [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]
	/**
	 * Sets token from local storage (if storage is set)
	 */
	setTokens: (token?: null | string, refreshToken?: null | string) => Promise<void>
	/**
	 * Updates token and refresh token
	 */
	updateTokenRefreshToken: (token?: null | string, refreshToken?: null | string) => Promise<{
		refreshToken: null | string | undefined
		token: null | string | undefined
	}>
	/**
	 * @default true
	 */
	useSuspense?: boolean
};

export type SetupAuthenticationStorage = {
	/**
	 * Gets key from local storage
	 */
	getItem: (key: string) => null | Promise<null | string> | string
	/**
	 * Removes key from local storage
	 */
	removeItem: (key: string) => Promise<void> | void
	/**
	 * Sets key from local storage
	 */
	setItem: (key: string, value: string) => Promise<void> | void
};

export type SetupAuthenticationTokenType = {
	refreshToken?: null | string
	token: null | string
};

export type SetupAuthenticationType<
	U extends BaseUserType = BaseUserType, 
	P extends BasePermissionType = BasePermissionType
> = {
	permissions?: P
	user?: U
};

/**
 * Sets the start of the authentication system. 
 * @param promise First method called. It's called each time the user enters the website.
 * @param storage optional Storage, by setting this object, "token" will be saved and used locally 
 */
export const setupAuthentication = <U extends BaseUserType, P extends BasePermissionType>(
	config: SetupAuthenticationConfig<U, P>
): SetupAuthenticationReturn<U, P> => {
	let status = 'pending';
	let result: [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>];

	const getStorageTokens = () => Promise.all([
		Promise.resolve(config.storage?.getItem(STORAGE_TOKEN_KEY)),
		Promise.resolve(config.storage?.getItem(STORAGE_REFRESH_TOKEN_KEY))
	]);

	const handleStorageUpdate = (key: string, newValue: null | string | undefined, storedValue: null | string | undefined) => {
		if (config.storage && newValue !== undefined && storedValue !== newValue) {
			newValue === null
				? config.storage.removeItem(key)
				: config.storage.setItem(key, newValue);
		}
	};

	const setTokens = async (
		token: null | string | undefined,
		refreshToken: null | string | undefined
	) => {
		const [currentToken, currentRefreshToken] = await getStorageTokens();

		handleStorageUpdate(STORAGE_TOKEN_KEY, token, currentToken);
		handleStorageUpdate(STORAGE_REFRESH_TOKEN_KEY, refreshToken, currentRefreshToken);
	};

	const updateTokenRefreshToken = async (
		token?: null | string, 
		refreshToken?: null | string
	): Promise<{
		refreshToken: null | string | undefined
		token: null | string | undefined
	}> => {
		const newValues = await config.refreshToken(token, refreshToken);

		setTokens(newValues.token, newValues.refreshToken);
		
		return {
			refreshToken: newValues.refreshToken,
			token: newValues.token
		};
	};

	const getTokens = async () => {
		const [token, refreshToken] = await getStorageTokens();

		return token && isJWTExpired(token) 
			? await updateTokenRefreshToken(token, refreshToken) 
			: {
				refreshToken,
				token
			};
	};

	const fetchInitialData = async (): Promise<[SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]> => {
		const { refreshToken, token } = await getTokens();

		const data = await config.getProfile(token);
		
		return [
			{
				refreshToken: data.refreshToken ?? refreshToken,
				token: data.token ?? token ?? null
			},
			data
		];
	};

	const startPromise = async () => {
		try {
			const res = await fetchInitialData();
			status = 'success';
			result = res;
		}
		catch (error) {
			status = 'error';
			result = error as any;
		}
	};

	let suspend: Promise<void> | undefined = startPromise();

	return {
		close() {
			status = 'pending';
			suspend = undefined;
		},
		getProfile: config.getProfile,
		getTokens,
		hasStorage: Boolean(config.storage),
		read() {
			if (status === 'pending') {
				throw (suspend ?? startPromise());
			}
			else if (status === 'error') {
				throw result;
			}
			return result;
		},
		setTokens,
		updateTokenRefreshToken,
		useSuspense: config.useSuspense ?? true
	};
};
