import {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react';

import { AuthenticationContext, type AuthenticationContextType } from '../../context/AuthenticationContext';
import { PermissionsContext } from '../../context/PermissionsContext';
import { NoOnLoginError } from '../../errors/NoOnLoginError';
import { useIsOnline } from '../../hooks/useIsOnline';
import { usePreventMultiple } from '../../hooks/usePreventMultiple';
import { useStorageEvent } from '../../hooks/useStorageEvent';
import { SessionService } from '../../services/SessionService';
import { type SetupAuthenticationReturn, type SetupAuthenticationTokenType, type SetupAuthenticationType } from '../../setupAuthentication';
import { type BasePermissionType } from '../../types/BasePermissionType';
import { type BaseUserType } from '../../types/BaseUser';
import { IS_DEV } from '../../utils/constants';
import { getExpInNumberFromJWT, isJWTExpired } from '../../utils/jwt';

/**
 * @param ignoreRefreshToken 
 * @important This is needed to make sure requests don't create loop
 */
export type GetTokenMethod = (ignoreRefreshToken: boolean) => Promise<string | null | undefined>;

export type AuthenticationProviderProps<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
> = {
	authentication: SetupAuthenticationReturn<U, P>
	children?: React.ReactNode
	/**
	 * @param getToken
 	 * @important @param ignoreRefreshToken This is needed to make sure requests don't create loop
	 */
	getToken?: (getToken: GetTokenMethod) => void
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | SetupAuthenticationTokenType>

	onLogout?: (token: string | null) => Promise<void> | void
}; 

type AuthenticationState<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
> = {
	permissions: P
	token: string | null
	user: U
	refreshToken?: string | null
};

function AuthenticationProvider<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
>(
	{
		children,
		authentication, 
		onLogout,
		onLogin,
		getToken
	}: AuthenticationProviderProps<U, P>
) {
	const tokenRefs = useRef<{ token: string | null, refreshToken?: string | null }>({
		token: null,
		refreshToken: null
	});

	const setTokens = (token: string | null = null, refreshToken?: string | null) => {
		tokenRefs.current = {
			token,
			refreshToken 
		};
	};

	const getStateToken = async (ignoreRefreshToken: boolean = false) => {
		const { token, refreshToken } = tokenRefs.current;

		if ( token && isJWTExpired(token) && !ignoreRefreshToken ) {
			return await authentication.updateTokenRefreshToken(token, refreshToken);
		}

		return {
			token,
			refreshToken 
		};
	};

	const _getToken = usePreventMultiple(async (ignoreRefreshToken: boolean) => {
		const { token: newToken, refreshToken: newRefreshToken } = await getStateToken(ignoreRefreshToken);

		if ( tokenRefs.current.token !== newToken ) {
			await setBaseToken(newToken, newRefreshToken);
		}

		return newToken;
	});

	const resetTokens = () => {
		authentication.setTokens(null, null);
		setTokens(null, null);
	};

	SessionService.refreshToken = async () => {
		try {
			const { token, refreshToken } = await authentication.getTokens();

			if ( token ) {
				setTokens(token, refreshToken);
				
				authentication.setTokens(token, refreshToken);

				return true;
			}
			resetTokens();
			return false;
		}
		catch ( e ) {
			resetTokens();
			return false;
		}
	};

	SessionService.logout = async () => {
		resetTokens();
		await onLogout?.(token);
	};

	const [sessionTokens, authenticationData] = authentication && authentication.useSuspense 
		? authentication.read() 
		: [
			({
				token: null,
				refreshToken: null
			})
		];
	
	const [error, setError] = useState<any>(null);
	const isOnline = useIsOnline();
	const canSetToken = useRef(authentication.useSuspense);

	if ( error ) {
		throw error;
	}

	if ( !authentication.useSuspense ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			(
				(async () => {
					if ( authentication ) {
						try {
							return authentication.read();
						}
						catch ( e ) {
							if ( e instanceof Promise ) {
								await e;
								return authentication.read();
							}
							return await Promise.reject(authentication.read());
						}
					}
				})() as Promise<[SetupAuthenticationTokenType, SetupAuthenticationType<U, P>]>
			)
			.then(([sessionTokens, authenticationData]) => {
				const token = sessionTokens.token;
				const refreshToken = sessionTokens.refreshToken;
				canSetToken.current = true;
				setTokens(token, refreshToken);
		
				setAuthentication({
					refreshToken,
					token,
					user: authenticationData?.user ? authenticationData.user : {} as U,
					permissions: authenticationData?.permissions ? authenticationData.permissions : {} as P
				});
			})
			.catch((error) => {
				setError(error);
			});

			return () => {
				authentication.close();
			};
		}, [authentication]);
	}

	getToken && getToken((ignoreRefreshToken) => _getToken(ignoreRefreshToken));

	const [
		{
			token, user, permissions, refreshToken: refreshTokenValue
		}, 
		setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		const token = sessionTokens.token;
		const refreshToken = sessionTokens.refreshToken;

		setTokens(token, refreshToken);
		
		return {
			refreshToken,
			token,
			user: authenticationData?.user ? authenticationData.user : {} as U,
			permissions: authenticationData?.permissions ? authenticationData.permissions : {} as P
		};
	});

	useStorageEvent(async () => {
		const { token, refreshToken } = await authentication.getTokens();

		if ( 
			tokenRefs.current.token !== token 
			|| tokenRefs.current.refreshToken !== refreshToken 
		) {
			setTokens(token, refreshToken);

			authenticate();
		}
	});

	const setUser = (newUser: U) => {
		setAuthentication({
			refreshToken: refreshTokenValue,
			token,
			permissions,
			user: newUser
		});
	};

	const waitLoginRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
	useEffect(() => {
		waitLoginRef.current?.(true);
		waitLoginRef.current = undefined;
		if ( canSetToken.current ) {
			authentication.setTokens(token, refreshTokenValue);
		}
	}, [token, user]);

	const setBaseToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<void> => {
		setTokens(token, refreshToken);

		const auth = await authentication.getProfile(token);

		const newToken = auth.token ?? token ?? null;
		const newRefreshToken = auth.refreshToken ?? refreshToken;

		setTokens(newToken, newRefreshToken);

		setAuthentication({
			token: newToken,
			refreshToken: newRefreshToken,
			user: auth.user ?? {} as U,
			permissions: auth.permissions ?? {} as P
		});
	});

	const setAuthenticationToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<boolean> => {
		await setBaseToken(token, refreshToken);

		// This serves to await the render first, because of route navigation that requires authentication
		return await new Promise((resolve) => waitLoginRef.current = resolve);
	});

	const login = usePreventMultiple(async (userNameOrEmail: string, password: string): Promise<boolean> => {
		if ( IS_DEV ) {
			if ( !onLogin ) {
				throw new NoOnLoginError();
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const loginAuth = await onLogin!(userNameOrEmail, password);

		return loginAuth?.token ? await setAuthenticationToken(loginAuth.token, loginAuth.refreshToken) : false;
	});

	const authenticate = usePreventMultiple(async () => {
		const { token: newToken, refreshToken } = await getStateToken();

		await setAuthenticationToken(newToken, refreshToken);
	});

	const logout = usePreventMultiple(async () => {
		await onLogout?.(token);

		await setBaseToken(null, null);
	});

	const refreshToken = usePreventMultiple(async () => {
		try {
			const refreshResult = await authentication.updateTokenRefreshToken(token, refreshTokenValue);

			if ( refreshResult && refreshResult.token ) {
				await setBaseToken(refreshResult.token, refreshResult.refreshToken);

				return true;
			}
			logout();
			return false;
		}
		catch {
			logout();
			return false;
		}
	});

	SessionService.authenticate = authenticate;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setError;
	SessionService.login = login;
	SessionService.refreshToken = refreshToken;
	SessionService.getToken = (isRefreshTokenRequest) => _getToken(isRefreshTokenRequest);

	useLayoutEffect(() => {
		if ( isOnline && canSetToken.current ) {
			const expireIn = getExpInNumberFromJWT(token);

			if ( expireIn ) {
				if ( expireIn < Date.now() ) {
					_getToken(false);
					return; 
				}
			
				const timeout = setTimeout(() => _getToken(false), expireIn - Date.now());

				return () => clearTimeout(timeout);
			}
		}
	}, [token, isOnline]);

	const AuthContextValue: AuthenticationContextType<U> = useMemo(() => ({
		user,
		token,
		authenticate,
		logout,
		setAuthenticationError: setError,
		login,
		setUser,
		setToken: setAuthenticationToken
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}), [user, token]);

	return (
		<AuthenticationContext.Provider value={AuthContextValue}>
			<PermissionsContext.Provider value={permissions}>
				{ children }
			</PermissionsContext.Provider>
		</AuthenticationContext.Provider>
	);
};

export default AuthenticationProvider;
