import { Suspense } from 'react';

import { type BasePermissions, type BaseUser } from '../models';

import AuthenticationProvider, { type AuthenticationProviderProps } from './AuthenticationProvider';
import ErrorBoundary, { type ErrorBoundaryProps } from './ErrorBoundary';

export type AuthenticationSystemProps<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions
> = AuthenticationProviderProps<U, P>
& ErrorBoundaryProps 
& {
	/**
	 * In case loadingComponent is undefined, the "suspense" will continue in the Suspense Tree
	 */
	loadingComponent?: boolean | React.ReactFragment | React.ReactPortal | null
}

function AuthenticationSystem<
	U extends BaseUser = BaseUser,
	P extends BasePermissions = BasePermissions
>({
	children,

	loadingComponent,

	errorComponent,
	onError,

	...authenticationProviderProps
}: AuthenticationSystemProps<U, P>) {
	return (
		<Suspense fallback={loadingComponent ?? null}>
			<ErrorBoundary errorComponent={errorComponent} onError={onError}>
				<AuthenticationProvider
					{...authenticationProviderProps}
				>
					<Suspense fallback={loadingComponent ?? null}>
						{ children }
					</Suspense>
				</AuthenticationProvider>
			</ErrorBoundary>
		</Suspense>
	);
};

export default AuthenticationSystem
