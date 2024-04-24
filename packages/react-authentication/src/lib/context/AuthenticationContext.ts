import { createContext, useContext } from 'react';

import { NoContextError } from '../errors/NoContextError';
import { type BaseUserType } from '../types/BaseUser';
import { IS_DEV } from '../utils/constants';

export type AuthenticationContextType<U extends BaseUserType = any> = {
	/**
	 * Initial method, where token calls backend using token to get user "profile"
	 */
	authenticate: () => Promise<void>
	/**
	 * Method to call to login the user
	 */
	login: (userNameOrEmail: string, password: string) => Promise<boolean>
	/**
	 * Method to call when login out user
	 */
	logout: () => Promise<void>
	/**
	 * Method to call in case there is a need for custom Authentication errors
	 */
	setAuthenticationError: (error: any) => void
	/**
	 * Method for manual custom login (ex: google, apple, etc)
	 */
	setToken: (token: string | null, refreshToken?: string | null | undefined) => Promise<boolean>
	/**
	 * To manually update user
	 */
	setUser: (userState: U | ((user: U) => void)) => void
	/**
	 * Authentication token
	 */
	token: string | null
	/**
	 * User instance
	 */
	user: U
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const AuthenticationContext = createContext<AuthenticationContextType>(null!);

/**
 * Hook to access AuthenticationContext context
 */
export const useAuthenticationContext = <U extends BaseUserType = BaseUserType>(): AuthenticationContextType<U> => {
	const context = useContext(AuthenticationContext);

	if ( IS_DEV ) {
		if ( !context ) {
			throw new NoContextError(
				'useAuthenticationContext',
				'AuthenticationContext'
			);
		}
	}

	return context as AuthenticationContextType<U>;
};
