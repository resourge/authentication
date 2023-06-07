export class NoContextError extends Error {
	constructor(contextHook: string, contextName: string) {
		super(`${contextHook} can only be used in the context of a <AuthenticationSystem/${contextName}> component.`)

		this.name = 'NoContextError'

		Error.captureStackTrace(this, NoContextError);
	}
}
