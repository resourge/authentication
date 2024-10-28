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
		tokenRefs.current.token = token ?? null;
		tokenRefs.current.refreshToken = refreshToken;
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

	const _getToken = useRef<(ignoreRefreshToken: boolean) => Promise<string | null | undefined>>(async (ignoreRefreshToken: boolean) => {
		const { token } = tokenRefs.current;

		const { token: newToken, refreshToken: newRefreshToken } = await getStateToken(ignoreRefreshToken);

		if ( token !== newToken ) {
			await setBaseToken(newToken, newRefreshToken);
		}

		return newToken;
	});

	SessionService.refreshToken = async () => {
		try {
			const { token, refreshToken } = await authentication.getTokens();

			setTokens(token, refreshToken);

			const refreshResult = await authentication.updateTokenRefreshToken(token ?? null, refreshToken);

			if ( refreshResult && refreshResult.token ) {
				const { token, refreshToken } = refreshResult;

				setTokens(token, refreshToken);
				
				authentication.setTokens(token, refreshToken);

				return true;
			}
			setTokens(null, null);
			return false;
		}
		catch ( e ) {
			setTokens(null, null);
			return false;
		}
	};

	SessionService.logout = async () => {
		setTokens(null, null);
		authentication.setTokens(null, null);
		if ( onLogout ) {
			await Promise.resolve(onLogout(token));
		}
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
				const user = authenticationData?.user ? authenticationData.user : {} as U;
				const permissions = authenticationData?.permissions ? authenticationData.permissions : {} as P;
				canSetToken.current = true;
				setTokens(token, refreshToken);
		
				setAuthentication({
					refreshToken,
					token,
					user,
					permissions
				});
			});

			return () => {
				authentication.close();
			};
		}, [authentication]);
	}

	const [
		{
			token, user, permissions, refreshToken: refreshTokenValue
		}, 
		setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		const token = sessionTokens.token;
		const refreshToken = sessionTokens.refreshToken;
		const user = authenticationData?.user ? authenticationData.user : {} as U;
		const permissions = authenticationData?.permissions ? authenticationData.permissions : {} as P;

		setTokens(token, refreshToken);

		getToken && getToken((ignoreRefreshToken) => _getToken.current(ignoreRefreshToken));
		
		return {
			refreshToken,
			token,
			user,
			permissions
		};
	});

	useStorageEvent();

	const setUser = (userState: U | ((user: U) => void)) => {
		let newUser = typeof userState === 'function' ? user : userState;
		newUser = Object.assign(Object.create(Object.getPrototypeOf(newUser) as object), newUser);

		if ( typeof userState === 'function' ) {
			userState(newUser);
		}
		
		setAuthentication({
			refreshToken: refreshTokenValue,
			token,
			permissions,
			user: newUser
		});
	};

	const waitLoginRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
	useEffect(() => {
		if ( waitLoginRef.current ) {
			waitLoginRef.current(true);
			waitLoginRef.current = undefined;
		}
		if ( canSetToken.current ) {
			authentication.setTokens(token, refreshTokenValue);
		}
	}, [token, user]);

	const setBaseToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<void> => {
		setTokens(token, refreshToken);

		const auth = await authentication.getProfile(token);
		const user = auth.user;
		const permissions = auth.permissions;
		const newToken = auth.token ?? token ?? null;
		const newRefreshToken = auth.refreshToken ?? refreshToken;

		setTokens(newToken, newRefreshToken);

		setAuthentication({
			token: newToken,
			refreshToken: newRefreshToken,
			user: user ?? {} as U,
			permissions: permissions ?? {} as P
		});
	});

	const setAuthenticationToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<boolean> => {
		await setBaseToken(token, refreshToken);

		// This serves to await the render first, because of route navigation that requires authentication
		return await (new Promise((resolve) => {
			waitLoginRef.current = resolve;
		}));
	});

	const login = usePreventMultiple(async (userNameOrEmail: string, password: string): Promise<boolean> => {
		if ( IS_DEV ) {
			if ( !onLogin ) {
				throw new NoOnLoginError();
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const loginAuth = await onLogin!(userNameOrEmail, password);

		if ( loginAuth && loginAuth.token !== null ) {
			const { token, refreshToken } = loginAuth;
			return await setAuthenticationToken(token, refreshToken);
		}

		return false;
	});

	const setAuthenticationError = (error: any) => setError(error);

	const authenticate = usePreventMultiple(async () => {
		if ( authentication ) {
			const { token: newToken, refreshToken } = await getStateToken();

			await setAuthenticationToken(newToken, refreshToken);
		}
	});

	const logout = usePreventMultiple(async () => {
		if ( onLogout ) {
			await Promise.resolve(onLogout(token));
		}

		await setBaseToken(null, null);
	});

	const refreshToken = usePreventMultiple(async () => {
		try {
			const refreshResult = await authentication.updateTokenRefreshToken(token, refreshTokenValue);

			if ( refreshResult && refreshResult.token ) {
				const { token, refreshToken } = refreshResult;

				await setBaseToken(token, refreshToken);

				return true;
			}
			logout();
			return false;
		}
		catch ( e ) {
			logout();
			return false;
		}
	});

	SessionService.authenticate = authenticate;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setAuthenticationError;
	SessionService.login = login;
	SessionService.refreshToken = refreshToken;
	SessionService.getToken = _getToken.current;

	useLayoutEffect(() => {
		if ( isOnline ) {
			let timeout: NodeJS.Timeout;
			const expireIn = getExpInNumberFromJWT(token);

			if ( expireIn ) {
				if ( expireIn < Date.now() ) {
					_getToken.current(false);
					return; 
				}
			
				timeout = setTimeout(() => {
					_getToken.current(false);
				}, expireIn - Date.now());

				return () => {
					clearTimeout(timeout);
				};
			}
		}
	}, [token, isOnline]);

	const AuthContextValue: AuthenticationContextType<U> = useMemo(() => ({
		user,
		token,
		authenticate,
		logout,
		setAuthenticationError,
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
