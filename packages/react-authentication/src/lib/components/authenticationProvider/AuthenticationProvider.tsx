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
import { type SetupAuthenticationType, type SetupAuthenticationReturn, type SetupAuthenticationTokenType } from '../../setupAuthentication';
import { type BasePermissionType } from '../../types/BasePermissionType';
import { type BaseUserType } from '../../types/BaseUser';
import { IS_DEV } from '../../utils/constants';
import { getExpInNumberFromJWT } from '../../utils/jwt';

export type AuthenticationProviderProps<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
> = {
	authentication: SetupAuthenticationReturn<U, P>
	children?: React.ReactNode
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | SetupAuthenticationTokenType>
	onLogout?: (token: string | null) => Promise<void> | void

	onToken?: (token: string | null, user: U, permission: P) => Promise<void> | void
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
		onToken,
		onLogin
	}: AuthenticationProviderProps<U, P>
) {
	SessionService.refreshToken = async () => {
		try {
			const { token, refreshToken } = await authentication.getTokens();
			const refreshResult = await authentication.updateTokenRefreshToken(token ?? null, refreshToken);

			if ( refreshResult && refreshResult.token ) {
				const { token } = refreshResult;
				const auth = await authentication.getProfile(token);

				authentication.setTokens(refreshResult.token, refreshResult.refreshToken);

				onToken && onToken(
					auth.token ?? token ?? null, 
					(auth.user ? auth.user : {}) as U, 
					(auth.permissions ? auth.permissions : {}) as P
				);

				return true;
			}
			return false;
		}
		catch ( e ) {
			authentication.setTokens(null, null);
			return false;
		}
	};

	SessionService.logout = async () => {
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

	if ( error ) {
		throw error;
	}

	if (!authentication.useSuspense ) {
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

				_onToken({
					refreshToken,
					token,
					user,
					permissions
				});
				_setAuthentication({
					refreshToken,
					token,
					user,
					permissions
				});
			});
		}, [authentication]);
	}

	const _onToken = ({
		permissions, token, user, refreshToken
	}: AuthenticationState<U, P>) => {
		authentication?.setTokens(token, refreshToken);
		onToken && onToken(token, user, permissions);
	};

	const [
		{
			token, user, permissions, refreshToken: refreshTokenValue
		}, 
		_setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		const token = sessionTokens.token;
		const refreshToken = sessionTokens.refreshToken;
		const user = authenticationData?.user ? authenticationData.user : {} as U;
		const permissions = authenticationData?.permissions ? authenticationData.permissions : {} as P;

		_onToken({
			refreshToken,
			token,
			user,
			permissions
		});
		
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
		
		_setAuthentication({
			refreshToken: refreshTokenValue,
			token,
			permissions,
			user: newUser
		});
	};

	const setAuthentication = (newAuthentication: AuthenticationState<U, P>) => {
		if ( newAuthentication.token !== undefined ) {
			_onToken(newAuthentication);
		}
		_setAuthentication((oldAuthentication) => ({
			...oldAuthentication,
			...newAuthentication
		}));
	};

	const waitLoginRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
	useEffect(() => {
		if ( waitLoginRef.current ) {
			waitLoginRef.current(true);
			waitLoginRef.current = undefined;
		}
	}, [token, user]);

	const setBaseToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<void> => {
		const auth = await authentication.getProfile(token);
		const user = auth.user;
		const permissions = auth.permissions;

		setAuthentication({
			token: auth.token ?? token ?? null,
			refreshToken: auth.refreshToken ?? refreshToken,
			user: user ?? {} as U,
			permissions: permissions ?? {} as P
		});
	});

	const setToken = usePreventMultiple(async (token?: string | null, refreshToken?: string | null): Promise<boolean> => {
		await setBaseToken(token, refreshToken);

		// This serves to await the render first, because of route navigation that required authentication
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
			return await setToken(token, refreshToken);
		}

		return false;
	});

	const setAuthenticationError = (error: any) => {
		setError(error);
	};

	const authenticate = usePreventMultiple(async () => {
		if ( authentication ) {
			const { token, refreshToken } = await authentication.getTokens();

			await setToken(token, refreshToken);
		}
	});

	const logout = usePreventMultiple(async () => {
		if ( onLogout ) {
			await Promise.resolve(onLogout(token));
		}

		await setBaseToken(null, null);
	});

	const getToken = usePreventMultiple(async () => {
		const { token } = await authentication.getTokens();

		return token;
	});

	const refreshToken = usePreventMultiple(async () => {
		try {
			const refreshResult = await authentication.updateTokenRefreshToken(token, refreshTokenValue);

			if ( refreshResult && refreshResult.token ) {
				const { token, refreshToken } = refreshResult;

				await setBaseToken(token, refreshToken);

				return true;
			}
			return false;
		}
		catch ( e ) {
			return false;
		}
	});

	SessionService.authenticate = authenticate;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setAuthenticationError;
	SessionService.login = login;
	SessionService.refreshToken = refreshToken;
	SessionService.getToken = getToken;

	const isOnline = useIsOnline();

	useLayoutEffect(() => {
		if ( isOnline ) {
			let timeout: NodeJS.Timeout;
			const expireIn = getExpInNumberFromJWT(token);

			if ( expireIn ) {
				if ( expireIn < Date.now() ) {
					refreshToken();
					return; 
				}
			
				timeout = setTimeout(() => {
					refreshToken();
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
		setToken
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
