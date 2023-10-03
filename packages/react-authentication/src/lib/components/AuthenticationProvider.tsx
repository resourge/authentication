/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo, useState } from 'react';

import { AuthenticationContext, type AuthenticationContextType } from '../context/AuthenticationContext';
import { PermissionsContext } from '../context/PermissionsContext';
import { NoOnLoginError } from '../errors/NoOnLoginError';
import { BasePermissions } from '../models/BasePermissions';
import { BaseUser } from '../models/BaseUser';
import SessionService from '../services/SessionService';
import { type SetupAuthenticationReturn, type SetupAuthenticationType } from '../setupAuthentication';

export type AuthenticationProviderPropsLoginOnly<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	authentication?: undefined
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | SetupAuthenticationType<U, P>>
}

export type AuthenticationProviderPropsAuthentication<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	authentication: SetupAuthenticationReturn<U, P>
	onLogin?: (userNameOrEmail: string, password: string) => Promise<null | string>
}

export type AuthenticationProviderProps<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	children?: React.ReactNode
	onLogout?: () => Promise<void> | void

	onRefreshToken?: () => Promise<SetupAuthenticationType<U, P>>
	onToken?: (token: string | null, user: U, permission: P) => Promise<void> | void
} & (AuthenticationProviderPropsAuthentication<U, P> | AuthenticationProviderPropsLoginOnly<U, P>)

type AuthenticationState<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions,
> = {
	permissions: P
	token: string | null
	user: U
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
			token, user, permissions 
		}, 
		_setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		const token = authenticationData.token;
		const user = authenticationData.token && authenticationData.user ? authenticationData.user : new BaseUser() as U;
		const permissions = authenticationData.token && authenticationData.permissions ? authenticationData.permissions : new BasePermissions() as P;

		_onToken(token, user, permissions)
		
		return {
			token,
			user,
			permissions
		}
	})

	const setUser = (userState: U | ((user: U) => U)) => {
		let newUser = userState as U;
		if ( typeof userState === 'function' ) {
			newUser = userState(user);
		}
		_setAuthentication({
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

	const login = async (userNameOrEmail: string, password: string) => {
		if ( __DEV__ ) {
			if ( !onLogin ) {
				throw new NoOnLoginError()
			}
		}

		const token = await onLogin!(userNameOrEmail, password);

		if ( token !== null ) {
			const auth: SetupAuthenticationType<U, P> = typeof token === 'object' 
				? token
				: await authentication!.promise(token)

			setAuthentication({
				token: auth.token,
				user: auth.token && auth.user ? auth.user : new BaseUser() as U,
				permissions: auth.token && auth.permissions ? auth.permissions : new BasePermissions() as P
			})
		}
	}

	const setAuthenticationError = (error: any) => {
		setError(error)
	}

	const authenticate = async () => {
		if ( authentication ) {
			const token = await authentication.getToken();
		
			const auth = await authentication.promise(token);

			setAuthentication({
				token: auth.token,
				user: auth.token && auth.user ? auth.user : new BaseUser() as U,
				permissions: auth.token && auth.permissions ? auth.permissions : new BasePermissions() as P
			})
		}
	}

	const refreshToken = async (): Promise<boolean> => {
		if ( onRefreshToken ) {
			const authentication = await onRefreshToken();

			setAuthentication({
				token: authentication.token,
				user: authentication.user && authentication.token ? authentication.user : new BaseUser() as U,
				permissions: authentication.permissions && authentication.token ? authentication.permissions : new BasePermissions() as P
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
