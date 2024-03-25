export class NoOnLoginError extends Error {
	constructor() {
		super('\'onLogin\' from AuthenticationSystem is mandatory when using method \'login\'');

		this.name = 'NoOnLoginError';

		Error.captureStackTrace(this, NoOnLoginError);
	}
}
