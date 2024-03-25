/* eslint-disable n/handle-callback-err */
/**
 * SessionService serves to be able to call "Authentication" functions outside of the context and components 
 */
class SessionService {
	/**
	 * Initial method, where token calls backend using token to get user "profile"
	 */
	public authenticate = (): Promise<void> => Promise.resolve();

	/**
	 * Method to call to login the user
	 */
	public login = (userNameOrEmail: string, password: string): Promise<boolean> => Promise.resolve(false);

	/**
	 * Method to call when login out user
	 */
	public logout = (): Promise<void> => Promise.resolve();

	/**
	 * Method to refresh current token
	 */
	public refreshToken = (): Promise<boolean> => Promise.resolve(false);
	
	/**
	 * Method to call in case there is a need for custom Authentication errors
	 */
	public setAuthenticationError = (error: Error) => { };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new SessionService();
