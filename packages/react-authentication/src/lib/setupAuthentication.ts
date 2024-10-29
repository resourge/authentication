import { type BasePermissionType } from './types/BasePermissionType';
import { type BaseUserType } from './types/BaseUser';
import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from './utils/constants';
import { isJWTExpired } from './utils/jwt';

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
	close: () => void
	/**
	 * Function to getProfile
	 */
	getProfile: (token?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>
	/**
	 * Gets tokens from local storage (if storage is set)
	 */
	getTokens: () => Promise<{
		refreshToken: string | null | undefined
		token: string | null | undefined
	}>
	hasStorage: boolean
	read: () => [SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]
	/**
	 * Sets token from local storage (if storage is set)
	 */
	setTokens: (token?: string | null, refreshToken?: string | null) => Promise<void>
	/**
	 * Updates token and refresh token
	 */
	updateTokenRefreshToken: (token?: string | null, refreshToken?: string | null) => Promise<{
		refreshToken: string | null | undefined
		token: string | null | undefined
	}>
	/**
	 * @default true
	 */
	useSuspense?: boolean
};

type SetupAuthenticationConfig<U extends BaseUserType, P extends BasePermissionType> = {
	/**
	 * Method to get user information
	 */
	getProfile: (token?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>
	/**
	 * Method to refresh token when token is expired (works automatically with JWT exp)
	 */
	refreshToken: (token?: string | null, refreshTokenValue?: string | null) => Promise<SetupAuthenticationType<U, P> & Partial<SetupAuthenticationTokenType>>
	/**
	 * If set, token will be stored
	 */
	storage?: SetupAuthenticationStorage
	/**
	 * @default true
	 */
	useSuspense?: boolean
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

	const handleStorageUpdate = (key: string, newValue: string | null | undefined, storedValue: string | null | undefined) => {
		if (config.storage && newValue !== undefined && storedValue !== newValue) {
			newValue === null ? config.storage.removeItem(key) : config.storage.setItem(key, newValue);
		}
	};

	const setTokens = async (
		token: string | null | undefined,
		refreshToken: string | null | undefined
	) => {
		const [currentToken, currentRefreshToken] = await getStorageTokens();

		handleStorageUpdate(STORAGE_TOKEN_KEY, token, currentToken);
		handleStorageUpdate(STORAGE_REFRESH_TOKEN_KEY, refreshToken, currentRefreshToken);
	};

	const updateTokenRefreshToken = async (
		token?: string | null, 
		refreshToken?: string | null
	): Promise<{
		refreshToken: string | null | undefined
		token: string | null | undefined
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
			? await updateTokenRefreshToken(token, refreshToken) : {
				token,
				refreshToken
			};
	};

	const fetchInitialData = async (): Promise<[SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]> => {
		const { token, refreshToken } = await getTokens();

		const data = await config.getProfile(token);
		
		return [
			{
				token: data.token ?? token ?? null,
				refreshToken: data.refreshToken ?? refreshToken
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
		catch (err) {
			status = 'error';
			result = err as any;
		}
	};

	let suspend: Promise<void> | undefined = startPromise();

	return {
		getProfile: config.getProfile,
		read() {
			if (status === 'pending') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw (suspend ?? startPromise());
			}
			else if (status === 'error') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw result;
			}
			return result;
		},
		close() {
			status = 'pending';
			suspend = undefined;
		},
		setTokens,
		getTokens,
		updateTokenRefreshToken,
		useSuspense: config.useSuspense ?? true,
		hasStorage: Boolean(config.storage)
	};
};
