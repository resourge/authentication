/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'

import { AuthenticationContext, type AuthenticationContextType } from '../context/AuthenticationContext';
import { PermissionsContext } from '../context/PermissionsContext';
import { NoOnLoginError } from '../errors/NoOnLoginError';
import { usePreventMultiple } from '../hooks/usePreventMultiple';
import { BasePermissions } from '../models/BasePermissions';
import { BaseUser } from '../models/BaseUser';
import SessionService from '../services/SessionService';
import { type SetupAuthenticationTokenType, type SetupAuthenticationReturn } from '../setupAuthentication';

export type AuthenticationProviderProps<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	authentication: SetupAuthenticationReturn<U, P>
	children?: React.ReactNode
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | SetupAuthenticationTokenType>
	onLogout?: (token: string | null) => Promise<void> | void

	onRefreshToken?: (token: string | null, refreshToken?: string | null) => Promise<null | SetupAuthenticationTokenType>
	onToken?: (token: string | null, user: U, permission: P) => Promise<void> | void
} 

type AuthenticationState<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	permissions: P
	token: string | null
	user: U
	refreshToken?: string | null
}

function AuthenticationProvider<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
>(
	{
		children,
		authentication, 
		onRefreshToken,
		onLogout,
		onToken,
		onLogin
	}: AuthenticationProviderProps<U, P>
) {
	SessionService.refreshToken = async () => {
		if ( onRefreshToken ) {
			try {
				const [token, refreshToken] = await Promise.all([
					authentication.getToken(),
					authentication.getRefreshToken()
				]);
				const refreshResult = await onRefreshToken(token ?? null, refreshToken);

				if ( refreshResult && refreshResult.token ) {
					const { token } = refreshResult;
					const auth = await authentication.promise(token);

					onToken && onToken(
						token ?? auth.token ?? null, 
						auth.user ? auth.user : new BaseUser() as U, 
						auth.permissions ? auth.permissions : new BasePermissions() as P
					)

					return true;
				}
			}
			catch ( e ) {
				return false;
			}
		}
		return false;
	};

	SessionService.logout = async () => {
		authentication.setRefreshToken(null);
		authentication.setToken(null);
		if ( onLogout ) {
			await Promise.resolve(onLogout(token))
		}
	};

	const [sessionTokens, authenticationData] = authentication ? authentication.read() : [
		({
			token: null 
		})
	];
	
	const [error, setError] = useState<any>(null);

	if ( error ) {
		throw error
	}

	const _onToken = (token: string | null, user: U, permission: P) => {
		authentication?.setToken(token);
		onToken && onToken(token, user, permission)
	}

	const [
		{
			token, user, permissions, refreshToken: refreshTokenValue
		}, 
		_setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		const token = sessionTokens.token;
		const refreshToken = sessionTokens.refreshToken;
		const user = authenticationData?.user ? authenticationData.user : new BaseUser() as U;
		const permissions = authenticationData?.permissions ? authenticationData.permissions : new BasePermissions() as P;

		_onToken(token, user, permissions)
		
		return {
			refreshToken,
			token,
			user,
			permissions
		}
	})

	const setUser = (userState: U | ((user: U) => void)) => {
		let newUser = typeof userState === 'function' ? user : userState;
		newUser = Object.assign(Object.create(Object.getPrototypeOf(newUser)), newUser)

		if ( typeof userState === 'function' ) {
			userState(newUser);
		}
		
		_setAuthentication({
			refreshToken: refreshTokenValue,
			token,
			permissions,
			user: newUser
		})
	}

	const setAuthentication = (newAuthentication: AuthenticationState<U, P>) => {
		if ( newAuthentication.token !== undefined ) {
			_onToken(newAuthentication.token, newAuthentication.user, newAuthentication.permissions)
		}
		_setAuthentication((oldAuthentication) => ({
			...oldAuthentication,
			...newAuthentication
		}))
	}

	const waitLoginRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
	useEffect(() => {
		if ( waitLoginRef.current ) {
			waitLoginRef.current(true);
			waitLoginRef.current = undefined;
		}
	}, [token]);

	const login = usePreventMultiple(async (userNameOrEmail: string, password: string): Promise<boolean> => {
		if ( __DEV__ ) {
			if ( !onLogin ) {
				throw new NoOnLoginError()
			}
		}

		const loginAuth = await onLogin!(userNameOrEmail, password);

		if ( loginAuth && loginAuth.token !== null ) {
			const { token, refreshToken } = loginAuth
			const auth = await authentication.promise(token);
			const user = auth.user
			const permissions = auth.permissions

			setAuthentication({
				token: token ?? auth.token,
				refreshToken: refreshToken ?? auth.refreshToken,
				user: user ?? new BaseUser() as U,
				permissions: permissions ?? new BasePermissions() as P
			})

			// This serves to await the render first, because of route navigation that required authentication
			return await (new Promise((resolve) => {
				waitLoginRef.current = resolve;
			}))
		}

		return false;
	})

	const setAuthenticationError = (error: any) => {
		setError(error)
	}

	const authenticate = usePreventMultiple(async () => {
		if ( authentication ) {
			const [token, refreshToken] = await Promise.all([
				authentication.getToken(),
				authentication.getRefreshToken()
			]);
		
			const auth = await authentication.promise(token);

			setAuthentication({
				token: token ?? auth.token ?? null,
				refreshToken: refreshToken ?? auth.refreshToken,
				user: auth.user ? auth.user : new BaseUser() as U,
				permissions: auth.permissions ? auth.permissions : new BasePermissions() as P
			})
		}
	})

	const logout = usePreventMultiple(async () => {
		if ( onLogout ) {
			await Promise.resolve(onLogout(token))
		}

		setAuthentication({
			refreshToken: undefined,
			token: null,
			user: new BaseUser() as U,
			permissions: new BasePermissions() as P
		})
	})

	const refreshToken = usePreventMultiple(
		async (): Promise<boolean> => {
			if ( onRefreshToken ) {
				try {
					const refreshResult = await onRefreshToken(token, refreshTokenValue);

					if ( refreshResult && refreshResult.token ) {
						const { token, refreshToken } = refreshResult;
						const auth = await authentication.promise(token);

						setAuthentication({
							token: token ?? auth.token ?? null,
							refreshToken: refreshToken ?? auth.refreshToken,
							user: auth.user ? auth.user : new BaseUser() as U,
							permissions: auth.permissions ? auth.permissions : new BasePermissions() as P
						})

						return true;
					}
				}
				catch ( e ) {
					return false;
				}
			}
			return false;
		}
	)

	SessionService.authenticate = authenticate;
	SessionService.refreshToken = refreshToken;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setAuthenticationError;
	SessionService.login = login;

	useEffect(() => {
		authentication?.setRefreshToken(refreshTokenValue ?? null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshTokenValue])

	const AuthContextValue: AuthenticationContextType<U> = useMemo(() => ({
		user,
		token,
		authenticate,
		logout,
		refreshToken,
		setAuthenticationError,
		login,
		setUser
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

export default AuthenticationProvider
