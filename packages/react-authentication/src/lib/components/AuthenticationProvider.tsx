/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo, useState } from 'react';

import { AuthenticationContext, type AuthenticationContextType } from '../context/AuthenticationContext';
import { PermissionsContext } from '../context/PermissionsContext';
import { NoOnLoginError } from '../errors/NoOnLoginError';
import { BasePermissions } from '../models/BasePermissions';
import { BaseUser } from '../models/BaseUser';
import SessionService from '../services/SessionService';
import { type SetupAuthenticationReturn, type SetupAuthenticationType } from '../setupAuthentication';

export type AuthenticationProviderProps<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	authentication: SetupAuthenticationReturn<U, P>
	children?: React.ReactNode
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | SetupAuthenticationType<U, P>>
	onLogout?: () => Promise<void> | void

	onRefreshToken?: (refreshToken?: string | null) => Promise<SetupAuthenticationType<U, P>>
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
>({
	children,
	authentication, 
	onRefreshToken,
	onLogout,
	onToken,
	onLogin
}: AuthenticationProviderProps<U, P>) {
	const authenticationData = authentication ? authentication.read() : ({
		token: null 
	});
	
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
		const token = authenticationData.token;
		const refreshToken = authenticationData.refreshToken;
		const user = authenticationData.user ? authenticationData.user : new BaseUser() as U;
		const permissions = authenticationData.permissions ? authenticationData.permissions : new BasePermissions() as P;

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

	const login = async (userNameOrEmail: string, password: string): Promise<boolean> => {
		if ( __DEV__ ) {
			if ( !onLogin ) {
				throw new NoOnLoginError()
			}
		}

		const loginAuth = await onLogin!(userNameOrEmail, password);

		if ( loginAuth && loginAuth.token !== null ) {
			let {
				token, permissions, refreshToken, user 
			} = loginAuth;
			if ( !user ) {
				const auth = await authentication.promise(token);
				user = auth.user
				refreshToken = auth.refreshToken
				permissions = auth.permissions
			}

			setAuthentication({
				token,
				refreshToken,
				user: user ?? new BaseUser() as U,
				permissions: permissions ?? new BasePermissions() as P
			})

			return true;
		}

		return false;
	}

	const setAuthenticationError = (error: any) => {
		setError(error)
	}

	const authenticate = async () => {
		if ( authentication ) {
			const [token, refreshToken] = await Promise.all([
				authentication.getToken(),
				authentication.getRefreshToken()
			]);
		
			const auth = await authentication.promise(token);

			setAuthentication({
				token: auth.token,
				refreshToken: auth.refreshToken ?? refreshToken,
				user: auth.user ? auth.user : new BaseUser() as U,
				permissions: auth.permissions ? auth.permissions : new BasePermissions() as P
			})
		}
	}

	const refreshToken = async (): Promise<boolean> => {
		if ( onRefreshToken ) {
			const authentication = await onRefreshToken(refreshTokenValue);

			setAuthentication({
				refreshToken: authentication.refreshToken,
				token: authentication.token,
				user: authentication.user ? authentication.user : new BaseUser() as U,
				permissions: authentication.permissions ? authentication.permissions : new BasePermissions() as P
			})
				
			if ( authentication.token ) {
				return true;
			}
		}
		return false;
	}

	const logout = async () => {
		if ( onLogout ) {
			await Promise.resolve(onLogout())
		}
		
		setAuthentication({
			refreshToken: undefined,
			token: null,
			user: new BaseUser() as U,
			permissions: new BasePermissions() as P
		})
	}

	SessionService.authenticate = authenticate;
	SessionService.refreshToken = refreshToken;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setAuthenticationError;
	SessionService.login = login;

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
