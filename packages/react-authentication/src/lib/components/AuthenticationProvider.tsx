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
	onLogin?: (userNameOrEmail: string, password: string) => Promise<string | null>
	onLogout?: () => Promise<void> | void

	onRefreshToken?: () => Promise<SetupAuthenticationType<U, P>>
	onToken?: (token: string | null) => Promise<void> | void
}

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
	const authenticationData = authentication.read();
	
	const [error, setError] = useState<any>(null);

	if ( error ) {
		throw error
	}

	const _onToken = (token: string | null) => {
		authentication.setToken(token);
		onToken && onToken(token)
	}

	const [
		{
			token, user, permissions 
		}, 
		_setAuthentication
	] = useState<AuthenticationState<U, P>>(() => {
		_onToken(authenticationData.token)
		
		return {
			token: authenticationData.token,
			user: authenticationData.token ? authenticationData.user : new BaseUser() as U,
			permissions: authenticationData.token ? authenticationData.permissions : new BasePermissions() as P
		}
	})

	const setAuthentication = (newAuthentication: Partial<AuthenticationState<U, P>>) => {
		if ( newAuthentication.token !== undefined ) {
			_onToken(newAuthentication.token)
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

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const token = await onLogin!(userNameOrEmail, password);

		const auth = await authentication.promise(token);

		setAuthentication({
			token: auth.token,
			user: auth.token ? auth.user : new BaseUser() as U,
			permissions: auth.token ? auth.permissions : new BasePermissions() as P
		})
	}

	const setAuthenticationError = (error: any) => {
		setError(error)
	}

	const authenticate = async () => {
		const token = await authentication.getToken();
		
		const auth = await authentication.promise(token);

		setAuthentication({
			token: auth.token,
			user: auth.token ? auth.user : new BaseUser() as U,
			permissions: auth.token ? auth.permissions : new BasePermissions() as P
		})
	}

	const refreshToken = async (): Promise<boolean> => {
		if ( onRefreshToken ) {
			const authentication = await onRefreshToken();

			setAuthentication({
				token: authentication.token,
				user: authentication.token ? authentication.user : new BaseUser() as U,
				permissions: authentication.token ? authentication.permissions : new BasePermissions() as P
			})
				
			if ( authentication.token ) {
				return true;
			}
		}
		return false;
	}

	const logout = async () => {
		setAuthentication({
			token: null,
			user: new BaseUser() as U,
			permissions: new BasePermissions() as P
		})

		if ( onLogout ) {
			await Promise.resolve(onLogout())
		}
	}

	SessionService.authenticate = authenticate;
	SessionService.refreshToken = refreshToken;
	SessionService.logout = logout;
	SessionService.setAuthenticationError = setAuthenticationError;
	SessionService.login = login;

	const AuthContextValue: AuthenticationContextType = useMemo(() => ({
		user,
		token,
		authenticate,
		logout,
		refreshToken,
		setAuthenticationError,
		login
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
