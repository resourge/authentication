/* eslint-disable n/handle-callback-err */

import { type OnLoginParamType } from '../context/AuthenticationContext';

/**
 * SessionService serves to be able to call "Authentication" functions outside of the context and components 
 */
export const SessionService = {
	/**
	 * Initial method, where token calls backend using token to get user "profile"
	 */
	authenticate: (): Promise<void> => Promise.resolve(),

	/**
	 * Method to call to login the user
	 */
	login: <T extends OnLoginParamType>(config: T): Promise<boolean> => Promise.resolve(false),

	/**
	 * Method to call when login out user
	 */
	logout: (): Promise<void> => Promise.resolve(),

	/**
	 * Method to refresh current token
	 */
	refreshToken: (): Promise<boolean> => Promise.resolve(false),

	/**
	 * Method for manual custom login (ex: google, apple, etc)
	 */
	setToken: (token: string | null, refreshToken?: string | null | undefined): Promise<boolean> => Promise.resolve(false),
	
	/**
	 * Method to call in case there is a need for custom Authentication errors
	 */
	setAuthenticationError: (error: Error) => { },
	/**
	 * Method to get valid token (if expired it get the new version)
	 * @param getToken
 	 * @important @param ignoreRefreshToken This is needed to make sure requests don't create loop
	 */
	getToken: (isRefreshTokenRequest: boolean): Promise<string | null | undefined> => Promise.resolve(undefined)
};
