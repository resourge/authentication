import { createContext, useContext } from 'react';

import { NoContextError } from '../errors/NoContextError';
import { type BaseUser } from '../models/BaseUser';

export type AuthenticationContextType<U extends BaseUser = BaseUser> = {
	/**
	 * Initial method, where token calls backend using token to get user "profile"
	 */
	authenticate: () => Promise<void>
	/**
	 * Method to call to login the user
	 */
	login: (userNameOrEmail: string, password: string) => Promise<void>
	/**
	 * Method to call when login out user
	 */
	logout: () => Promise<void>
	/**
	 * Method to refresh current token
	 */
	refreshToken: () => Promise<boolean>
	/**
	 * Method to call in case there is a need for custom Authentication errors
	 */
	setAuthenticationError: (error: any) => void
	/**
	 * Authentication token
	 */
	token: string | null
	/**
	 * User instance
	 */
	user: U
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const AuthenticationContext = createContext<AuthenticationContextType>(null!);

/**
 * Hook to access AuthenticationContext context
 */
export const useAuthenticationContext = <U extends BaseUser = BaseUser>(): AuthenticationContextType<U> => {
	const context = useContext(AuthenticationContext);

	if ( __DEV__ ) {
		if ( !context ) {
			throw new NoContextError(
				'useAuthenticationContext',
				'AuthenticationContext'
			)
		}
	}

	return context as AuthenticationContextType<U>;
}
